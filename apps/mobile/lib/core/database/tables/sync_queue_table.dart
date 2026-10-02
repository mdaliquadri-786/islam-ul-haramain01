import 'package:drift/drift.dart';

/// Client-local sync mutation queue.
/// Buffers offline mutations with client_mutation_id for Milestone 5.4 synchronization.
@DataClassName('SyncQueueItem')
class SyncQueueTable extends Table {
  @override
  String get tableName => 'sync_queue';

  /// Primary UUID string.
  TextColumn get id => text()();

  /// Unique client mutation UUID for idempotent deduplication on backend.
  TextColumn get clientMutationId => text()();

  /// Target entity discriminator: 'bookmark', 'reading_progress', 'settings'.
  TextColumn get entityType => text()();

  /// Target entity ID.
  TextColumn get entityId => text()();

  /// Operation: 'INSERT', 'UPDATE', 'DELETE'.
  TextColumn get operation => text()();

  /// Serialized JSON payload containing the mutation data.
  TextColumn get payloadJson => text()();

  /// Number of sync attempts performed.
  IntColumn get attempts => integer().withDefault(const Constant(0))();

  /// Timestamp of the last sync attempt.
  DateTimeColumn get lastAttemptAt => dateTime().nullable()();

  /// Last error message encountered during sync attempt (if any).
  TextColumn get errorMessage => text().nullable()();

  /// Timestamp when mutation was enqueued.
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}
