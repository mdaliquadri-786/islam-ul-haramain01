import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../auth/auth_provider.dart';
import '../database/app_database.dart';
import '../database/daos/bookmarks_dao.dart';
import '../database/daos/reading_progress_dao.dart';
import '../database/daos/app_settings_dao.dart';
import '../database/database_providers.dart';
import 'sync_models.dart';
import 'sync_providers.dart';
import 'sync_repositories.dart';
import 'sync_ui_state.dart';

/// Sync-aware service coordinating bookmark local writes with the outbox queue.
class SyncBookmarkService {
  final BookmarksDao bookmarksDao;
  final SyncMutationRepository mutationRepo;
  final Ref ref;
  final Uuid _uuid;

  SyncBookmarkService({
    required this.bookmarksDao,
    required this.mutationRepo,
    required this.ref,
    Uuid? uuid,
  }) : _uuid = uuid ?? const Uuid();

  /// Saves or updates a bookmark locally first, enqueuing an outbox mutation if authenticated.
  Future<void> saveBookmark({
    required String contentType,
    required String contentReference,
    int? surahNumber,
    int? ayahNumber,
    String? hadithCollection,
    int? hadithNumber,
    String? duaCategory,
    String? articleId,
    String? bookId,
    String? folderName,
    String? note,
    String? tags,
    String? id,
  }) async {
    final session = ref.read(authNotifierProvider);
    final isAuthenticated = session.isAuthenticated && !session.isGuest;
    final userId = isAuthenticated ? session.user!.id : ref.read(activeUserIdProvider);

    final existing = await bookmarksDao.getBookmarkByReference(
      userId,
      contentType,
      contentReference,
    );

    final bookmarkId = existing?.id ?? id ?? _uuid.v4();
    final newVersion = (existing?.clientVersion ?? 0) + 1;
    final mutationId = _uuid.v4();

    // 1. Local-first write: immediately write to Drift SQLite
    await bookmarksDao.saveBookmark(
      LocalBookmarksTableCompanion.insert(
        id: bookmarkId,
        userId: userId,
        contentType: contentType,
        contentReference: contentReference,
        surahNumber: Value(surahNumber),
        ayahNumber: Value(ayahNumber),
        hadithCollection: Value(hadithCollection),
        hadithNumber: Value(hadithNumber),
        duaCategory: Value(duaCategory),
        articleId: Value(articleId),
        bookId: Value(bookId),
        folderName: Value(folderName ?? 'default'),
        note: Value(note),
        tags: Value(tags ?? '[]'),
        clientVersion: Value(newVersion),
        serverRevision: Value(existing?.serverRevision ?? 1),
        lastClientMutationId: Value(mutationId),
        syncStatus: Value(isAuthenticated ? 'pending' : 'synced'),
      ),
    );

    // 2. If authenticated, enqueue outbox mutation for server push
    if (isAuthenticated) {
      final payload = <String, dynamic>{
        'id': bookmarkId,
        'user_id': userId,
        'content_type': contentType,
        'content_reference': contentReference,
        'folder_name': folderName ?? 'default',
        'tags': tags ?? '[]',
        'client_version': newVersion,
      };
      if (surahNumber != null) payload['surah_number'] = surahNumber;
      if (ayahNumber != null) payload['ayah_number'] = ayahNumber;
      if (hadithCollection != null) payload['hadith_collection'] = hadithCollection;
      if (hadithNumber != null) payload['hadith_number'] = hadithNumber;
      if (duaCategory != null) payload['dua_category'] = duaCategory;
      if (articleId != null) payload['article_id'] = articleId;
      if (bookId != null) payload['book_id'] = bookId;
      if (note != null) payload['note'] = note;

      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: mutationId,
          entityType: SyncEntityType.bookmark,
          entityId: bookmarkId,
          operation: existing == null ? SyncOperation.create : SyncOperation.update,
          payload: payload,
          clientVersion: newVersion,
          createdAt: DateTime.now(),
        ),
      );
    }
  }

  /// Soft deletes a bookmark locally first, enqueuing a delete mutation if authenticated.
  Future<void> deleteBookmark(String bookmarkId) async {
    final session = ref.read(authNotifierProvider);
    final isAuthenticated = session.isAuthenticated && !session.isGuest;
    final userId = isAuthenticated ? session.user!.id : ref.read(activeUserIdProvider);

    final existing = await (bookmarksDao.select(bookmarksDao.localBookmarksTable)
          ..where((tbl) => tbl.id.equals(bookmarkId)))
        .getSingleOrNull();

    if (existing == null) return;

    final mutationId = _uuid.v4();
    final newVersion = existing.clientVersion + 1;

    // 1. Local-first soft delete
    await bookmarksDao.softDeleteBookmark(
      bookmarkId,
      clientMutationId: mutationId,
    );

    // 2. If authenticated, enqueue outbox delete mutation
    if (isAuthenticated) {
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: mutationId,
          entityType: SyncEntityType.bookmark,
          entityId: bookmarkId,
          operation: SyncOperation.delete,
          payload: {
            'id': bookmarkId,
            'user_id': userId,
            'client_version': newVersion,
          },
          clientVersion: newVersion,
          createdAt: DateTime.now(),
        ),
      );
    }
  }

  /// Observes active bookmarks for the current user.
  Stream<List<LocalBookmark>> watchActiveBookmarks() {
    final userId = ref.watch(activeUserIdProvider);
    return bookmarksDao.watchActiveBookmarks(userId);
  }

  /// Observes active bookmarks filtered by content type.
  Stream<List<LocalBookmark>> watchBookmarksByType(String contentType) {
    final userId = ref.watch(activeUserIdProvider);
    return bookmarksDao.watchBookmarksByType(userId, contentType);
  }

  /// Checks if reference is bookmarked by current user.
  Future<bool> isBookmarked(String contentType, String contentReference) {
    final userId = ref.read(activeUserIdProvider);
    return bookmarksDao.isBookmarked(userId, contentType, contentReference);
  }
}

/// Sync-aware service coordinating reading progress writes with the outbox queue.
class SyncReadingProgressService {
  final ReadingProgressDao readingDao;
  final SyncMutationRepository mutationRepo;
  final Ref ref;
  final Uuid _uuid;

  SyncReadingProgressService({
    required this.readingDao,
    required this.mutationRepo,
    required this.ref,
    Uuid? uuid,
  }) : _uuid = uuid ?? const Uuid();

  /// Saves or updates reading progress locally first, enqueuing an outbox mutation if authenticated.
  Future<void> saveProgress({
    required String bookId,
    String? editionId,
    int volumeNumber = 1,
    String? sectionId,
    int? pageNumber,
    required double progressPercentage,
    String? id,
  }) async {
    final session = ref.read(authNotifierProvider);
    final isAuthenticated = session.isAuthenticated && !session.isGuest;
    final userId = isAuthenticated ? session.user!.id : ref.read(activeUserIdProvider);

    final existing = await readingDao.getBookProgress(userId, bookId);
    final progressId = existing?.id ?? id ?? _uuid.v4();
    final newVersion = (existing?.clientVersion ?? 0) + 1;
    final mutationId = _uuid.v4();

    // 1. Local-first write to Drift SQLite
    await readingDao.saveProgress(
      LocalReadingProgressTableCompanion.insert(
        id: progressId,
        userId: userId,
        bookId: bookId,
        editionId: Value(editionId),
        volumeNumber: Value(volumeNumber),
        sectionId: Value(sectionId),
        pageNumber: Value(pageNumber),
        progressPercentage: Value(progressPercentage),
        lastReadAt: Value(DateTime.now()),
        clientVersion: Value(newVersion),
        serverRevision: Value(existing?.serverRevision ?? 1),
        lastClientMutationId: Value(mutationId),
        syncStatus: Value(isAuthenticated ? 'pending' : 'synced'),
      ),
    );

    // 2. If authenticated, enqueue outbox mutation
    if (isAuthenticated) {
      final payload = <String, dynamic>{
        'id': progressId,
        'user_id': userId,
        'book_id': bookId,
        'volume_number': volumeNumber,
        'progress_percentage': progressPercentage,
        'client_version': newVersion,
      };
      if (editionId != null) payload['edition_id'] = editionId;
      if (sectionId != null) payload['section_id'] = sectionId;
      if (pageNumber != null) payload['page_number'] = pageNumber;

      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: mutationId,
          entityType: SyncEntityType.readingProgress,
          entityId: progressId,
          operation: existing == null ? SyncOperation.create : SyncOperation.update,
          payload: payload,
          clientVersion: newVersion,
          createdAt: DateTime.now(),
        ),
      );
    }
  }

  /// Observes all reading progress records for current user.
  Stream<List<LocalReadingProgress>> watchAllProgress() {
    final userId = ref.watch(activeUserIdProvider);
    return readingDao.watchAllProgress(userId);
  }

  /// Observes progress for a specific book.
  Stream<LocalReadingProgress?> watchBookProgress(String bookId) {
    final userId = ref.watch(activeUserIdProvider);
    return readingDao.watchBookProgress(userId, bookId);
  }
}

/// Sync-aware service coordinating prayer preferences with the outbox queue.
class SyncPrayerSettingsService {
  final AppSettingsDao settingsDao;
  final SyncMutationRepository mutationRepo;
  final Ref ref;
  final Uuid _uuid;

  SyncPrayerSettingsService({
    required this.settingsDao,
    required this.mutationRepo,
    required this.ref,
    Uuid? uuid,
  }) : _uuid = uuid ?? const Uuid();

  /// Updates prayer preferences locally first, enqueuing an outbox mutation if authenticated.
  /// Strictly guarantees device GPS coordinates (latitude, longitude) are excluded from cloud sync.
  Future<void> setPrayerPreferences({String? method, String? madhab}) async {
    final session = ref.read(authNotifierProvider);
    final isAuthenticated = session.isAuthenticated && !session.isGuest;
    final userId = isAuthenticated ? session.user!.id : ref.read(activeUserIdProvider);

    // 1. Local-first update to Drift SQLite
    await settingsDao.setPrayerPreferences(method: method, madhab: madhab);

    // 2. If authenticated, enqueue outbox mutation
    if (isAuthenticated) {
      final mutationId = _uuid.v4();
      final payload = <String, dynamic>{
        'user_id': userId,
      };
      if (method != null) payload['calculation_method'] = method;
      if (madhab != null) payload['asr_madhhab'] = madhab;

      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: mutationId,
          entityType: SyncEntityType.prayerSettings,
          entityId: 'prayer_settings_$userId',
          operation: SyncOperation.update,
          payload: payload,
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );
    }
  }

  /// Observes settings reactively.
  Stream<AppSetting> watchSettings() {
    return settingsDao.watchSettings();
  }

  /// Gets current settings.
  Future<AppSetting> getSettings() {
    return settingsDao.getSettings();
  }
}

/// Provider for [SyncBookmarkService].
final syncBookmarkServiceProvider = Provider<SyncBookmarkService>((ref) {
  return SyncBookmarkService(
    bookmarksDao: ref.watch(bookmarksDaoProvider),
    mutationRepo: ref.watch(syncMutationRepositoryProvider),
    ref: ref,
  );
});

/// Provider for [SyncReadingProgressService].
final syncReadingProgressServiceProvider = Provider<SyncReadingProgressService>((ref) {
  return SyncReadingProgressService(
    readingDao: ref.watch(readingProgressDaoProvider),
    mutationRepo: ref.watch(syncMutationRepositoryProvider),
    ref: ref,
  );
});

/// Provider for [SyncPrayerSettingsService].
final syncPrayerSettingsServiceProvider = Provider<SyncPrayerSettingsService>((ref) {
  return SyncPrayerSettingsService(
    settingsDao: ref.watch(appSettingsDaoProvider),
    mutationRepo: ref.watch(syncMutationRepositoryProvider),
    ref: ref,
  );
});
