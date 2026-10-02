import 'package:flutter_test/flutter_test.dart';
import 'package:drift/native.dart';
import 'package:drift/drift.dart' as drift;
import 'package:islamic_mobile/core/database/app_database.dart';

void main() {
  late AppDatabase db;

  setUp(() {
    // Spin up an isolated, pure in-memory SQLite database instance for testing
    db = AppDatabase.forTesting(NativeDatabase.memory());
  });

  tearDown(() async {
    await db.close();
  });

  group('Drift SQLite Database Core & DAOs', () {
    test('Database initializes with schemaVersion 2 and default AppSettings', () async {
      expect(db.schemaVersion, equals(2));

      final settings = await db.appSettingsDao.getSettings();
      expect(settings.id, equals('default'));
      expect(settings.themeMode, equals('system'));
      expect(settings.locale, equals('en'));
      expect(settings.arabicScript, equals('uthmani'));
      expect(settings.arabicFontSize, equals(26.0));
      expect(settings.translationFontSize, equals(16.0));
      expect(settings.prayerCalculationMethod, equals('muslim_world_league'));
      expect(settings.prayerMadhab, equals('shafi'));
    });

    test('AppSettingsDao updates theme, locale, script, and font sizes reactively', () async {
      await db.appSettingsDao.setThemeMode('dark');
      await db.appSettingsDao.setLocale('ar');
      await db.appSettingsDao.setArabicScript('indopak');
      await db.appSettingsDao.setFontSizes(arabicSize: 32.0, translationSize: 18.0);
      await db.appSettingsDao.setPrayerPreferences(madhab: 'hanafi');

      final updated = await db.appSettingsDao.getSettings();
      expect(updated.themeMode, equals('dark'));
      expect(updated.locale, equals('ar'));
      expect(updated.arabicScript, equals('indopak'));
      expect(updated.arabicFontSize, equals(32.0));
      expect(updated.translationFontSize, equals(18.0));
      expect(updated.prayerMadhab, equals('hanafi'));
    });

    test('BookmarksDao stores canonical references only (zero scripture duplication)', () async {
      const userId = 'user-uuid-123';
      const surahRef = 'quran:1:1';

      // Verify not bookmarked initially
      expect(await db.bookmarksDao.isBookmarked(userId, 'quran', surahRef), isFalse);

      // Save canonical Quran Ayah bookmark
      await db.bookmarksDao.saveBookmark(
        LocalBookmarksTableCompanion.insert(
          id: 'bm-quran-1-1',
          userId: userId,
          contentType: 'quran',
          contentReference: surahRef,
          surahNumber: const drift.Value(1),
          ayahNumber: const drift.Value(1),
          folderName: const drift.Value('Daily Recitation'),
          tags: const drift.Value('["fatihah", "daily"]'),
          clientMutationId: const drift.Value('mut-uuid-001'),
        ),
      );

      // Verify bookmark is active
      expect(await db.bookmarksDao.isBookmarked(userId, 'quran', surahRef), isTrue);

      final bookmark = await db.bookmarksDao.getBookmarkByReference(userId, 'quran', surahRef);
      expect(bookmark, isNotNull);
      expect(bookmark!.surahNumber, equals(1));
      expect(bookmark.ayahNumber, equals(1));
      expect(bookmark.folderName, equals('Daily Recitation'));
      expect(bookmark.clientMutationId, equals('mut-uuid-001'));
      expect(bookmark.deletedAt, isNull);
      expect(bookmark.syncStatus, equals('pending_insert'));
    });

    test('BookmarksDao supports soft-delete for offline sync preparation', () async {
      const userId = 'user-uuid-123';
      const hadithRef = 'bukhari:1';

      await db.bookmarksDao.saveBookmark(
        LocalBookmarksTableCompanion.insert(
          id: 'bm-hadith-1',
          userId: userId,
          contentType: 'hadith',
          contentReference: hadithRef,
          hadithCollection: const drift.Value('bukhari'),
          hadithNumber: const drift.Value(1),
        ),
      );

      expect(await db.bookmarksDao.isBookmarked(userId, 'hadith', hadithRef), isTrue);

      // Soft delete
      await db.bookmarksDao.softDeleteBookmark('bm-hadith-1', clientMutationId: 'mut-del-001');

      // Should now be excluded from active bookmarks
      expect(await db.bookmarksDao.isBookmarked(userId, 'hadith', hadithRef), isFalse);

      // But still present in pending sync queue as pending_delete
      final pending = await db.bookmarksDao.getPendingSync();
      expect(pending.any((b) => b.id == 'bm-hadith-1' && b.syncStatus == 'pending_delete'), isTrue);
    });

    test('ReadingProgressDao tracks book progress and percentages accurately', () async {
      const userId = 'user-uuid-123';
      const bookId = 'riyad-al-salihin';

      expect(await db.readingProgressDao.getBookProgress(userId, bookId), isNull);

      await db.readingProgressDao.saveProgress(
        LocalReadingProgressTableCompanion.insert(
          id: 'rp-riyad-01',
          userId: userId,
          bookId: bookId,
          volumeNumber: const drift.Value(1),
          pageNumber: const drift.Value(45),
          progressPercentage: const drift.Value(22.5),
          clientMutationId: const drift.Value('mut-rp-001'),
        ),
      );

      final progress = await db.readingProgressDao.getBookProgress(userId, bookId);
      expect(progress, isNotNull);
      expect(progress!.bookId, equals(bookId));
      expect(progress.volumeNumber, equals(1));
      expect(progress.pageNumber, equals(45));
      expect(progress.progressPercentage, equals(22.5));
    });

    test('UserStateDao maintains local authenticated session and profile', () async {
      expect(await db.userStateDao.getCurrentUser(), isNull);

      await db.userStateDao.saveUser(
        LocalUserStateTableCompanion.insert(
          id: 'usr-456',
          email: const drift.Value('talib@example.com'),
          displayName: const drift.Value('Abu Ahmad'),
          role: const drift.Value('authenticated'),
          isAnonymous: const drift.Value(false),
        ),
      );

      final user = await db.userStateDao.getCurrentUser();
      expect(user, isNotNull);
      expect(user!.email, equals('talib@example.com'));
      expect(user.displayName, equals('Abu Ahmad'));

      await db.userStateDao.clearAllUsers();
      expect(await db.userStateDao.getCurrentUser(), isNull);
    });

    test('SyncQueueDao buffers offline mutations with client_mutation_id', () async {
      final initialQueue = await db.syncQueueDao.getPendingItems();
      expect(initialQueue, isEmpty);

      // Enqueue bookmark insert
      await db.syncQueueDao.enqueue(
        SyncQueueTableCompanion.insert(
          id: 'sq-001',
          clientMutationId: 'client-mut-abc',
          entityType: 'bookmark',
          entityId: 'bm-quran-1-1',
          operation: 'INSERT',
          payloadJson: '{"surah": 1, "ayah": 1}',
        ),
      );

      // Enqueue reading progress update
      await db.syncQueueDao.enqueue(
        SyncQueueTableCompanion.insert(
          id: 'sq-002',
          clientMutationId: 'client-mut-def',
          entityType: 'reading_progress',
          entityId: 'rp-riyad-01',
          operation: 'UPDATE',
          payloadJson: '{"progress": 25.0}',
        ),
      );

      final items = await db.syncQueueDao.getPendingItems();
      expect(items.length, equals(2));
      expect(items[0].clientMutationId, equals('client-mut-abc'));
      expect(items[0].attempts, equals(0));

      // Record a failed attempt
      await db.syncQueueDao.recordAttempt('sq-001', errorMessage: 'Network timeout');
      final updatedItems = await db.syncQueueDao.getPendingItems();
      expect(updatedItems[0].attempts, equals(1));
      expect(updatedItems[0].errorMessage, equals('Network timeout'));

      // Remove after success
      await db.syncQueueDao.remove('sq-001');
      final remaining = await db.syncQueueDao.getPendingItems();
      expect(remaining.length, equals(1));
      expect(remaining[0].id, equals('sq-002'));
    });
  });
}
