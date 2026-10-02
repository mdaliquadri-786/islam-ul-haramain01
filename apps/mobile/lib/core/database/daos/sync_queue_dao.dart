import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/sync_queue_table.dart';

part 'sync_queue_dao.g.dart';

@DriftAccessor(tables: [SyncQueueTable])
class SyncQueueDao extends DatabaseAccessor<AppDatabase>
    with _$SyncQueueDaoMixin {
  SyncQueueDao(super.db);

  /// Streams pending sync operations ordered by creation time.
  Stream<List<SyncQueueItem>> watchQueue() {
    return (select(syncQueueTable)
          ..orderBy([(tbl) => OrderingTerm.asc(tbl.createdAt)]))
        .watch();
  }

  /// Gets all queued mutations ready for sync.
  Future<List<SyncQueueItem>> getPendingItems({int limit = 50}) {
    return (select(syncQueueTable)
          ..orderBy([(tbl) => OrderingTerm.asc(tbl.createdAt)])
          ..limit(limit))
        .get();
  }

  /// Enqueues an offline mutation.
  Future<void> enqueue(SyncQueueTableCompanion item) {
    return into(syncQueueTable).insert(item);
  }

  /// Records a sync failure attempt.
  Future<void> recordAttempt(String id, {String? errorMessage}) async {
    final existing = await (select(syncQueueTable)..where((tbl) => tbl.id.equals(id))).getSingleOrNull();
    final newAttempts = (existing?.attempts ?? 0) + 1;
    await (update(syncQueueTable)..where((tbl) => tbl.id.equals(id))).write(
      SyncQueueTableCompanion(
        attempts: Value(newAttempts),
        lastAttemptAt: Value(DateTime.now()),
        errorMessage: Value(errorMessage),
      ),
    );
  }

  /// Removes an item from the queue once successfully synced.
  Future<int> remove(String id) {
    return (delete(syncQueueTable)..where((tbl) => tbl.id.equals(id))).go();
  }

  /// Clears all completed or queued mutations.
  Future<int> clearAll() {
    return delete(syncQueueTable).go();
  }
}
