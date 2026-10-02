import 'package:drift/drift.dart';

/// Client-local bookmarks table matching Supabase public.bookmarks schema.
/// Strict Zero-Religious-Text-Duplication: stores canonical references only.
@DataClassName('LocalBookmark')
class LocalBookmarksTable extends Table {
  @override
  String get tableName => 'local_bookmarks';

  /// Primary UUID string.
  TextColumn get id => text()();

  /// User ID owning this bookmark (matches auth.users UUID).
  TextColumn get userId => text()();

  /// Content discriminator: 'quran', 'hadith', 'dua', 'article', 'book'.
  TextColumn get contentType => text()();

  /// Canonical reference string (e.g. 'quran:1:1', 'bukhari:1', 'hisn:1', 'slug', 'riyad-al-salihin:1:1').
  TextColumn get contentReference => text()();

  /// Typed reference fields for indexing
  IntColumn get surahNumber => integer().nullable()();
  IntColumn get ayahNumber => integer().nullable()();
  TextColumn get hadithCollection => text().nullable()();
  IntColumn get hadithNumber => integer().nullable()();
  TextColumn get duaCategory => text().nullable()();
  TextColumn get articleId => text().nullable()();
  TextColumn get bookId => text().nullable()();

  /// Personalization fields
  TextColumn get folderName => text().withDefault(const Constant('default'))();
  TextColumn get note => text().nullable()();
  /// JSON-encoded array of tag strings (e.g. '["favorites", "memorization"]').
  TextColumn get tags => text().withDefault(const Constant('[]'))();

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
