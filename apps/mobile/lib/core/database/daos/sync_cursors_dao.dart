import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/sync_cursors_table.dart';

part 'sync_cursors_dao.g.dart';

@DriftAccessor(tables: [SyncCursorsTable])
class SyncCursorsDao extends DatabaseAccessor<AppDatabase>
    with _$SyncCursorsDaoMixin {
  SyncCursorsDao(super.db);

  /// Retrieves the stored composite keyset cursor for a specific entity type.
  Future<SyncCursorEntry?> getCursor(String entityType) {
    return (select(syncCursorsTable)..where((tbl) => tbl.entityType.equals(entityType)))
        .getSingleOrNull();
  }

  /// Sets or updates the composite keyset cursor atomically.
  Future<void> setCursor({
    required String entityType,
    required DateTime cursorUpdatedAt,
    required String cursorId,
    DateTime? lastSyncCompletedAt,
  }) {
    return into(syncCursorsTable).insertOnConflictUpdate(
      SyncCursorsTableCompanion.insert(
        entityType: entityType,
        cursorUpdatedAt: cursorUpdatedAt,
        cursorId: cursorId,
        lastSyncCompletedAt: Value(lastSyncCompletedAt ?? DateTime.now()),
      ),
    );
  }

  /// Clears cursor for a specific entity type (e.g. for full resync).
  Future<int> clearCursor(String entityType) {
    return (delete(syncCursorsTable)..where((tbl) => tbl.entityType.equals(entityType))).go();
  }

  /// Wipes all cursors (e.g. on user logout / account switch).
  Future<int> clearAllCursors() {
    return delete(syncCursorsTable).go();
  }
}
