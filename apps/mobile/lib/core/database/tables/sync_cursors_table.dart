import 'package:drift/drift.dart';

/// Client-local sync cursor table tracking keyset pagination positions.
/// Powers composite keyset pagination:
/// WHERE (updated_at > :cursor_updated_at) OR (updated_at = :cursor_updated_at AND id > :cursor_id)
@DataClassName('SyncCursorEntry')
class SyncCursorsTable extends Table {
  @override
  String get tableName => 'sync_cursors';

  /// Target entity discriminator: 'bookmark', 'reading_progress', 'prayer_settings'.
  TextColumn get entityType => text()();

  /// Server timestamp of the latest synced record (part 1 of composite keyset cursor).
  DateTimeColumn get cursorUpdatedAt => dateTime()();

  /// Primary identifier of the latest synced record (part 2 of composite keyset cursor).
  TextColumn get cursorId => text()();

  /// Local timestamp when the last successful sync cycle completed.
  DateTimeColumn get lastSyncCompletedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {entityType};
}
