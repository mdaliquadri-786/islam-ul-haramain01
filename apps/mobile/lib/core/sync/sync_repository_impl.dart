import 'dart:convert';
import 'package:drift/drift.dart';
import '../database/app_database.dart';
import '../database/daos/sync_cursors_dao.dart';
import '../database/daos/sync_queue_dao.dart';
import 'sync_models.dart';
import 'sync_repositories.dart';

/// Implementation of [SyncCursorRepository] backed by Drift SQLite `SyncCursorsDao`.
class SyncCursorRepositoryImpl implements SyncCursorRepository {
  final SyncCursorsDao _dao;

  SyncCursorRepositoryImpl(this._dao);

  @override
  Future<SyncCursor?> getCursor(SyncEntityType entityType) async {
    final entry = await _dao.getCursor(entityType.value);
    if (entry == null) return null;

    return SyncCursor(
      entityType: entityType,
      updatedAt: entry.cursorUpdatedAt,
      id: entry.cursorId,
      lastSyncCompletedAt: entry.lastSyncCompletedAt,
    );
  }

  @override
  Future<void> saveCursor(SyncCursor cursor) {
    return _dao.setCursor(
      entityType: cursor.entityType.value,
      cursorUpdatedAt: cursor.updatedAt,
      cursorId: cursor.id,
      lastSyncCompletedAt: cursor.lastSyncCompletedAt,
    );
  }

  @override
  Future<void> clearCursor(SyncEntityType entityType) {
    return _dao.clearCursor(entityType.value);
  }

  @override
  Future<void> clearAllCursors() {
    return _dao.clearAllCursors();
  }
}

/// Implementation of [SyncMutationRepository] backed by Drift SQLite `SyncQueueDao`.
class SyncMutationRepositoryImpl implements SyncMutationRepository {
  final SyncQueueDao _dao;

  SyncMutationRepositoryImpl(this._dao);

  @override
  Future<void> enqueueMutation(SyncMutation mutation) {
    return _dao.enqueue(
      SyncQueueTableCompanion(
        id: Value(mutation.id),
        clientMutationId: Value(mutation.id),
        entityType: Value(mutation.entityType.value),
        entityId: Value(mutation.entityId),
        operation: Value(mutation.operation.value),
        payloadJson: Value(jsonEncode(mutation.payload)),
        attempts: Value(mutation.retryCount),
        createdAt: Value(mutation.createdAt),
      ),
    );
  }

  @override
  Future<List<SyncMutation>> getPendingMutations({int limit = 50}) async {
    final items = await _dao.getPendingItems(limit: limit);

    return items.map((item) {
      Map<String, dynamic> payload = {};
      int version = 1;
      try {
        final decoded = jsonDecode(item.payloadJson);
        if (decoded is Map<String, dynamic>) {
          payload = decoded;
          version = (decoded['client_version'] as num?)?.toInt() ?? 1;
        }
      } catch (_) {}

      return SyncMutation(
        id: item.id,
        entityType: SyncEntityType.fromString(item.entityType),
        entityId: item.entityId,
        operation: SyncOperation.fromString(item.operation),
        payload: payload,
        clientVersion: version,
        createdAt: item.createdAt,
        retryCount: item.attempts,
        lastError: item.errorMessage,
        status: item.attempts > 0 ? SyncStatus.inProgress : SyncStatus.pending,
      );
    }).toList();
  }

  @override
  Future<void> markMutationAcknowledged(String mutationId) {
    return _dao.remove(mutationId);
  }

  @override
  Future<void> markMutationFailed(
    String mutationId, {
    required String error,
    required bool retryable,
  }) {
    return _dao.recordAttempt(mutationId, errorMessage: error);
  }

  @override
  Future<void> removeMutation(String mutationId) {
    return _dao.remove(mutationId);
  }

  @override
  Future<void> clearAllMutations() {
    return _dao.clearAll();
  }
}

/// Sync adapter for Bookmarks (`LocalBookmarksTable`).
class BookmarkSyncAdapter implements SyncableEntityRepository {
  final AppDatabase _db;

  BookmarkSyncAdapter(this._db);

  @override
  SyncEntityType get entityType => SyncEntityType.bookmark;

  @override
  Future<Map<String, dynamic>?> getEntityById(String id) async {
    final row = await (_db.select(_db.localBookmarksTable)
          ..where((tbl) => tbl.id.equals(id)))
        .getSingleOrNull();

    if (row == null) return null;

    return {
      'id': row.id,
      'user_id': row.userId,
      'content_type': row.contentType,
      'content_reference': row.contentReference,
      'surah_number': row.surahNumber,
      'ayah_number': row.ayahNumber,
      'hadith_collection': row.hadithCollection,
      'hadith_number': row.hadithNumber,
      'dua_category': row.duaCategory,
      'article_id': row.articleId,
      'book_id': row.bookId,
      'folder_name': row.folderName,
      'note': row.note,
      'tags': row.tags,
      'client_version': row.clientVersion,
      'server_revision': row.serverRevision,
      'deleted_at': row.deletedAt?.toIso8601String(),
    };
  }

  @override
  Future<void> applyServerEntity(
    Map<String, dynamic> data, {
    required int serverRevision,
  }) async {
    final id = data['id'] as String;
    final userId = data['user_id'] as String;
    final contentType = data['content_type'] as String;
    final contentReference = data['content_reference'] as String;
    final clientVersion = (data['client_version'] as num?)?.toInt() ?? 1;
    final deletedAt = data['deleted_at'] != null
        ? DateTime.parse(data['deleted_at'] as String)
        : null;

    final existing = await (_db.select(_db.localBookmarksTable)..where((tbl) => tbl.id.equals(id))).getSingleOrNull();
    if (existing != null) {
      if (serverRevision < existing.serverRevision) {
        return;
      }
      if (serverRevision == existing.serverRevision && clientVersion < existing.clientVersion) {
        return;
      }
      if (existing.deletedAt != null && deletedAt == null && clientVersion <= existing.clientVersion) {
        return;
      }
    }

    await _db.into(_db.localBookmarksTable).insertOnConflictUpdate(
      LocalBookmarksTableCompanion(
        id: Value(id),
        userId: Value(userId),
        contentType: Value(contentType),
        contentReference: Value(contentReference),
        surahNumber: Value(data['surah_number'] as int?),
        ayahNumber: Value(data['ayah_number'] as int?),
        hadithCollection: Value(data['hadith_collection'] as String?),
        hadithNumber: Value(data['hadith_number'] as int?),
        duaCategory: Value(data['dua_category'] as String?),
        articleId: Value(data['article_id'] as String?),
        bookId: Value(data['book_id'] as String?),
        folderName: Value(data['folder_name'] as String? ?? 'default'),
        note: Value(data['note'] as String?),
        tags: Value(data['tags'] as String? ?? '[]'),
        clientVersion: Value(clientVersion),
        serverRevision: Value(serverRevision),
        lastClientMutationId: Value(data['last_client_mutation_id'] as String?),
        deletedAt: Value(deletedAt),
        syncStatus: const Value('synced'),
      ),
    );

  }

  @override
  Future<void> markEntityDeleted(
    String id, {
    required DateTime deletedAt,
    required int serverRevision,
  }) async {
    await (_db.update(_db.localBookmarksTable)..where((tbl) => tbl.id.equals(id))).write(
      LocalBookmarksTableCompanion(
        deletedAt: Value(deletedAt),
        serverRevision: Value(serverRevision),
        syncStatus: const Value('synced'),
      ),
    );
  }
}

/// Sync adapter for Reading Progress (`LocalReadingProgressTable`).
class ReadingProgressSyncAdapter implements SyncableEntityRepository {
  final AppDatabase _db;

  ReadingProgressSyncAdapter(this._db);

  @override
  SyncEntityType get entityType => SyncEntityType.readingProgress;

  @override
  Future<Map<String, dynamic>?> getEntityById(String id) async {
    final row = await (_db.select(_db.localReadingProgressTable)
          ..where((tbl) => tbl.id.equals(id)))
        .getSingleOrNull();

    if (row == null) return null;

    return {
      'id': row.id,
      'user_id': row.userId,
      'book_id': row.bookId,
      'edition_id': row.editionId,
      'volume_number': row.volumeNumber,
      'section_id': row.sectionId,
      'page_number': row.pageNumber,
      'progress_percentage': row.progressPercentage,
      'client_version': row.clientVersion,
      'server_revision': row.serverRevision,
      'deleted_at': row.deletedAt?.toIso8601String(),
    };
  }

  @override
  Future<void> applyServerEntity(
    Map<String, dynamic> data, {
    required int serverRevision,
  }) async {
    final id = data['id'] as String;
    final userId = data['user_id'] as String;
    final bookId = data['book_id'] as String;
    final clientVersion = (data['client_version'] as num?)?.toInt() ?? 1;
    final deletedAt = data['deleted_at'] != null
        ? DateTime.parse(data['deleted_at'] as String)
        : null;

    final existing = await (_db.select(_db.localReadingProgressTable)..where((tbl) => tbl.id.equals(id))).getSingleOrNull();
    if (existing != null) {
      if (serverRevision < existing.serverRevision) {
        return;
      }
      if (serverRevision == existing.serverRevision && clientVersion < existing.clientVersion) {
        return;
      }
      if (existing.deletedAt != null && deletedAt == null && clientVersion <= existing.clientVersion) {
        return;
      }
    }

    await _db.into(_db.localReadingProgressTable).insertOnConflictUpdate(
      LocalReadingProgressTableCompanion(
        id: Value(id),
        userId: Value(userId),
        bookId: Value(bookId),
        editionId: Value(data['edition_id'] as String?),
        volumeNumber: Value((data['volume_number'] as num?)?.toInt() ?? 1),
        sectionId: Value(data['section_id'] as String?),
        pageNumber: Value(data['page_number'] as int?),
        progressPercentage: Value((data['progress_percentage'] as num?)?.toDouble() ?? 0.0),
        clientVersion: Value(clientVersion),
        serverRevision: Value(serverRevision),
        lastClientMutationId: Value(data['last_client_mutation_id'] as String?),
        deletedAt: Value(deletedAt),
        syncStatus: const Value('synced'),
      ),
    );

  }

  @override
  Future<void> markEntityDeleted(
    String id, {
    required DateTime deletedAt,
    required int serverRevision,
  }) async {
    await (_db.update(_db.localReadingProgressTable)..where((tbl) => tbl.id.equals(id))).write(
      LocalReadingProgressTableCompanion(
        deletedAt: Value(deletedAt),
        serverRevision: Value(serverRevision),
        syncStatus: const Value('synced'),
      ),
    );
  }
}

/// Sync adapter for Prayer Settings (`AppSettingsTable`).
class PrayerSettingsSyncAdapter implements SyncableEntityRepository {
  final AppDatabase _db;

  PrayerSettingsSyncAdapter(this._db);

  @override
  SyncEntityType get entityType => SyncEntityType.prayerSettings;

  @override
  Future<Map<String, dynamic>?> getEntityById(String id) async {
    final settings = await _db.appSettingsDao.getSettings();

    return {
      'calculation_method': settings.prayerCalculationMethod,
      'asr_madhhab': settings.prayerMadhab,
    };
  }

  @override
  Future<void> applyServerEntity(
    Map<String, dynamic> data, {
    required int serverRevision,
  }) async {
    final method = data['calculation_method'] as String?;
    final madhab = data['asr_madhhab'] as String?;

    if (method != null || madhab != null) {
      await _db.appSettingsDao.setPrayerPreferences(
        method: method,
        madhab: madhab,
      );
    }
  }

  @override
  Future<void> markEntityDeleted(
    String id, {
    required DateTime deletedAt,
    required int serverRevision,
  }) async {
    // Prayer settings cannot be deleted; singleton resets to default
  }
}
