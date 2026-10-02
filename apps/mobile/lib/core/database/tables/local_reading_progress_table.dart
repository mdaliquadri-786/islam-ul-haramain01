import 'package:drift/drift.dart';

/// Client-local reading progress tracking matching Supabase public.user_reading_progress.
/// Strictly tracks progress positions without duplicating sacred text.
@DataClassName('LocalReadingProgress')
class LocalReadingProgressTable extends Table {
  @override
  String get tableName => 'local_reading_progress';

  /// Primary UUID string.
  TextColumn get id => text()();

  /// User ID owning this reading progress.
  TextColumn get userId => text()();

  /// Canonical Book ID (e.g. 'riyad-al-salihin', 'al-arba-in-al-nawawiyyah').
  TextColumn get bookId => text()();

  /// Specific digital edition ID (nullable).
  TextColumn get editionId => text().nullable()();

  /// Volume number.
  IntColumn get volumeNumber => integer().withDefault(const Constant(1))();

  /// Specific Section/Chapter UUID (nullable).
  TextColumn get sectionId => text().nullable()();

  /// Page or paragraph number (nullable).
  IntColumn get pageNumber => integer().nullable()();

  /// Progress percentage (0.00 to 100.00).
  RealColumn get progressPercentage => real().withDefault(const Constant(0.0))();

  /// Timestamp when last read.
  DateTimeColumn get lastReadAt => dateTime().withDefault(currentDateAndTime)();

  /// Mobile-aware synchronization support (Milestone 5.4 sync engine preparation)
  TextColumn get clientMutationId => text().nullable()();
  IntColumn get clientVersion => integer().withDefault(const Constant(1))();
  IntColumn get serverRevision => integer().withDefault(const Constant(1))();
  TextColumn get lastClientMutationId => text().nullable()();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
  /// Soft-delete timestamp for bi-directional sync tombstone tracking
  DateTimeColumn get deletedAt => dateTime().nullable()();

  /// Sync state: 'synced', 'pending_insert', 'pending_update', 'pending_delete'.
  TextColumn get syncStatus => text().withDefault(const Constant('pending_insert'))();

  @override
  Set<Column> get primaryKey => {id};
}
