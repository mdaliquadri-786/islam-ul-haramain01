import 'package:flutter_test/flutter_test.dart';
import 'package:drift/native.dart';
import 'package:drift/drift.dart' as drift;
import 'package:sqlite3/sqlite3.dart' as sqlite;
import 'package:islamic_mobile/core/database/app_database.dart';

void main() {
  drift.driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;

  group('M5.4 Phase 3C — Drift Schema V2 & Migration Suite', () {
    const v1SchemaSql = '''
      CREATE TABLE IF NOT EXISTS local_user_state (
        id TEXT NOT NULL PRIMARY KEY,
        email TEXT,
        display_name TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'authenticated',
        is_anonymous INTEGER NOT NULL DEFAULT 0,
        last_synced_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
        theme_mode TEXT NOT NULL DEFAULT 'system',
        locale TEXT NOT NULL DEFAULT 'en',
        arabic_script TEXT NOT NULL DEFAULT 'uthmani',
        arabic_font_size REAL NOT NULL DEFAULT 26.0,
        translation_font_size REAL NOT NULL DEFAULT 16.0,
        prayer_calculation_method TEXT NOT NULL DEFAULT 'muslim_world_league',
        prayer_madhab TEXT NOT NULL DEFAULT 'shafi',
        selected_reciter_id TEXT NOT NULL DEFAULT 'mishary-rashid-alafasy',
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        offline_sync_enabled INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS local_bookmarks (
        id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL,
        content_type TEXT NOT NULL,
        content_reference TEXT NOT NULL,
        surah_number INTEGER,
        ayah_number INTEGER,
        hadith_collection TEXT,
        hadith_number INTEGER,
        dua_category TEXT,
        article_id TEXT,
        book_id TEXT,
        folder_name TEXT NOT NULL DEFAULT 'default',
        note TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        client_mutation_id TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        deleted_at INTEGER,
        sync_status TEXT NOT NULL DEFAULT 'pending_insert'
      );

      CREATE TABLE IF NOT EXISTS local_reading_progress (
        id TEXT NOT NULL PRIMARY KEY,
        user_id TEXT NOT NULL,
        book_id TEXT NOT NULL,
        edition_id TEXT,
        volume_number INTEGER NOT NULL DEFAULT 1,
        section_id TEXT,
        page_number INTEGER,
        progress_percentage REAL NOT NULL DEFAULT 0.0,
        last_read_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        client_mutation_id TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        sync_status TEXT NOT NULL DEFAULT 'pending_insert'
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT NOT NULL PRIMARY KEY,
        operation TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT
      );

      PRAGMA user_version = 1;
    ''';

    sqlite.Database createV1RawDb({String? seedSql}) {
      final raw = sqlite.sqlite3.openInMemory();
      raw.execute(v1SchemaSql);
      if (seedSql != null) {
        raw.execute(seedSql);
      }
      return raw;
    }

    test('Test A: Empty database v1 -> v2 upgrade completes without error', () async {
      final rawDb = createV1RawDb(seedSql: "INSERT INTO app_settings (id) VALUES ('default');");
      final db = AppDatabase.forTesting(NativeDatabase.opened(rawDb));

      final settings = await db.appSettingsDao.getSettings();
      expect(settings, isNotNull);
      expect(db.schemaVersion, equals(2));

      // Check user_version was bumped by drift
      final versionResult = rawDb.select('PRAGMA user_version;');
      expect(versionResult.first['user_version'], equals(2));

      await db.close();
    });

    test('Test B: Existing v1 bookmark data, IDs, and fields preserved upon migration', () async {
      final nowSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      final rawDb = createV1RawDb(
        seedSql: "INSERT INTO local_bookmarks (id, user_id, content_type, content_reference, created_at, updated_at) "
            "VALUES ('bm-v1-001', 'user-abc', 'quran', 'quran:2:255', $nowSeconds, $nowSeconds);",
      );

      final db = AppDatabase.forTesting(NativeDatabase.opened(rawDb));
      final bookmarks = await (db.select(db.localBookmarksTable)
            ..where((tbl) => tbl.userId.equals('user-abc')))
          .get();
      expect(bookmarks.length, equals(1));

      final bm = bookmarks.first;
      expect(bm.id, equals('bm-v1-001'));
      expect(bm.userId, equals('user-abc'));
      expect(bm.contentType, equals('quran'));
      expect(bm.contentReference, equals('quran:2:255'));
      expect(bm.clientVersion, equals(1));
      expect(bm.serverRevision, equals(1));
      expect(bm.lastClientMutationId, isNull);

      await db.close();
    });

    test('Test C: Existing v1 reading progress fields preserved upon migration', () async {
      final nowSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      final rawDb = createV1RawDb(
        seedSql: "INSERT INTO local_reading_progress (id, user_id, book_id, progress_percentage, last_read_at, created_at, updated_at) "
            "VALUES ('rp-v1-001', 'user-abc', 'riyad-al-salihin', 45.5, $nowSeconds, $nowSeconds, $nowSeconds);",
      );

      final db = AppDatabase.forTesting(NativeDatabase.opened(rawDb));
      final progress = await db.readingProgressDao.getBookProgress('user-abc', 'riyad-al-salihin');
      expect(progress, isNotNull);
      expect(progress!.id, equals('rp-v1-001'));
      expect(progress.userId, equals('user-abc'));
      expect(progress.bookId, equals('riyad-al-salihin'));
      expect(progress.progressPercentage, equals(45.5));
      expect(progress.clientVersion, equals(1));
      expect(progress.serverRevision, equals(1));
      expect(progress.lastClientMutationId, isNull);
      expect(progress.deletedAt, isNull);

      await db.close();
    });

    test('Test D: Existing prayer settings survive upgrade', () async {
      final rawDb = createV1RawDb(
        seedSql: "INSERT INTO app_settings (id, theme_mode, locale, arabic_script, arabic_font_size, translation_font_size, prayer_calculation_method, prayer_madhab) "
            "VALUES ('default', 'dark', 'ar', 'indopak', 30.0, 18.0, 'umm_al_qura', 'hanafi');",
      );

      final db = AppDatabase.forTesting(NativeDatabase.opened(rawDb));
      final settings = await db.appSettingsDao.getSettings();
      expect(settings.themeMode, equals('dark'));
      expect(settings.locale, equals('ar'));
      expect(settings.arabicScript, equals('indopak'));
      expect(settings.arabicFontSize, equals(30.0));
      expect(settings.translationFontSize, equals(18.0));
      expect(settings.prayerCalculationMethod, equals('umm_al_qura'));
      expect(settings.prayerMadhab, equals('hanafi'));

      await db.close();
    });

    test('Test E: is_anonymous = true remains intact', () async {
      final nowSeconds = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      final rawDb = createV1RawDb(
        seedSql: "INSERT INTO local_user_state (id, is_anonymous, created_at, updated_at) "
            "VALUES ('guest-uuid-999', 1, $nowSeconds, $nowSeconds);",
      );

      final db = AppDatabase.forTesting(NativeDatabase.opened(rawDb));
      final userState = await db.userStateDao.getCurrentUser();
      expect(userState, isNotNull);
      expect(userState!.isAnonymous, isTrue);
      expect(userState.id, equals('guest-uuid-999'));

      await db.close();
    });

    test('Test F: Tombstone representation survives without physical deletion', () async {
      final db = AppDatabase.forTesting(NativeDatabase.memory());
      final now = DateTime.now();

      await db.readingProgressDao.saveProgress(
        LocalReadingProgressTableCompanion.insert(
          id: 'tombstone-test-01',
          userId: 'user-tomb',
          bookId: 'riyad-al-salihin',
          lastReadAt: drift.Value(now),
          clientVersion: const drift.Value(2),
          serverRevision: const drift.Value(1),
          deletedAt: drift.Value(now),
        ),
      );

      final allRows = await (db.select(db.localReadingProgressTable)
            ..where((tbl) => tbl.id.equals('tombstone-test-01')))
          .get();
      expect(allRows.length, equals(1));
      expect(allRows.first.deletedAt, isNotNull);
      expect(allRows.first.clientVersion, equals(2));

      await db.close();
    });

    test('Test G: Composite keyset cursor persistence and retrieval (sync_cursors)', () async {
      final db = AppDatabase.forTesting(NativeDatabase.memory());
      final cursorTime = DateTime.utc(2026, 9, 26, 8, 30, 0);

      // Verify initially empty
      final initialCursor = await db.syncCursorsDao.getCursor('bookmark');
      expect(initialCursor, isNull);

      // Set cursor
      await db.syncCursorsDao.setCursor(
        entityType: 'bookmark',
        cursorUpdatedAt: cursorTime,
        cursorId: 'bm-sync-099',
      );

      final fetched = await db.syncCursorsDao.getCursor('bookmark');
      expect(fetched, isNotNull);
      expect(fetched!.entityType, equals('bookmark'));
      expect(fetched.cursorUpdatedAt.toUtc(), equals(cursorTime));
      expect(fetched.cursorId, equals('bm-sync-099'));
      expect(fetched.lastSyncCompletedAt, isNotNull);

      // Update cursor for reading progress
      final rpTime = DateTime.utc(2026, 9, 26, 9, 0, 0);
      await db.syncCursorsDao.setCursor(
        entityType: 'reading_progress',
        cursorUpdatedAt: rpTime,
        cursorId: 'rp-sync-200',
      );

      final rpFetched = await db.syncCursorsDao.getCursor('reading_progress');
      expect(rpFetched, isNotNull);
      expect(rpFetched!.cursorId, equals('rp-sync-200'));

      // Clear one cursor
      await db.syncCursorsDao.clearCursor('bookmark');
      expect(await db.syncCursorsDao.getCursor('bookmark'), isNull);
      expect(await db.syncCursorsDao.getCursor('reading_progress'), isNotNull);

      // Clear all cursors
      await db.syncCursorsDao.clearAllCursors();
      expect(await db.syncCursorsDao.getCursor('reading_progress'), isNull);

      await db.close();
    });

    test('Test H: Database reports schemaVersion == 2', () async {
      final db = AppDatabase.forTesting(NativeDatabase.memory());
      expect(db.schemaVersion, equals(2));
      await db.close();
    });
  });
}
