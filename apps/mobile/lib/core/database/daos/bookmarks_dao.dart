import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/local_bookmarks_table.dart';

part 'bookmarks_dao.g.dart';

@DriftAccessor(tables: [LocalBookmarksTable])
class BookmarksDao extends DatabaseAccessor<AppDatabase> with _$BookmarksDaoMixin {
  BookmarksDao(super.db);

  /// Streams active (non-deleted) bookmarks for a specific user, sorted by creation date descending.
  Stream<List<LocalBookmark>> watchActiveBookmarks(String userId) {
    return (select(localBookmarksTable)
          ..where((tbl) => tbl.userId.equals(userId) & tbl.deletedAt.isNull())
          ..orderBy([(tbl) => OrderingTerm.desc(tbl.createdAt)]))
        .watch();
  }

  /// Streams active bookmarks filtered by content type ('quran', 'hadith', 'dua', 'article', 'book').
  Stream<List<LocalBookmark>> watchBookmarksByType(String userId, String contentType) {
    return (select(localBookmarksTable)
          ..where((tbl) =>
              tbl.userId.equals(userId) &
              tbl.contentType.equals(contentType) &
              tbl.deletedAt.isNull())
          ..orderBy([(tbl) => OrderingTerm.desc(tbl.createdAt)]))
        .watch();
  }

  /// Checks if a specific canonical content item is bookmarked by the user.
  Future<bool> isBookmarked(String userId, String contentType, String contentReference) async {
    final query = select(localBookmarksTable)
      ..where((tbl) =>
          tbl.userId.equals(userId) &
          tbl.contentType.equals(contentType) &
          tbl.contentReference.equals(contentReference) &
          tbl.deletedAt.isNull());
    final result = await query.getSingleOrNull();
    return result != null;
  }

  /// Gets a bookmark by canonical reference if active.
  Future<LocalBookmark?> getBookmarkByReference(
      String userId, String contentType, String contentReference) {
    return (select(localBookmarksTable)
          ..where((tbl) =>
              tbl.userId.equals(userId) &
              tbl.contentType.equals(contentType) &
              tbl.contentReference.equals(contentReference) &
              tbl.deletedAt.isNull()))
        .getSingleOrNull();
  }

  /// Inserts or updates a bookmark in client SQLite.
  Future<void> saveBookmark(LocalBookmarksTableCompanion bookmark) {
    return into(localBookmarksTable).insertOnConflictUpdate(bookmark);
  }

  /// Soft deletes a bookmark by marking `deletedAt` and tagging with mutation ID for sync.
  Future<void> softDeleteBookmark(String id, {String? clientMutationId}) {
    return (update(localBookmarksTable)..where((tbl) => tbl.id.equals(id))).write(
      LocalBookmarksTableCompanion(
        deletedAt: Value(DateTime.now()),
        updatedAt: Value(DateTime.now()),
        clientMutationId: Value(clientMutationId),
        syncStatus: const Value('pending_delete'),
      ),
    );
  }

  /// Hard deletes a bookmark from local database.
  Future<int> hardDeleteBookmark(String id) {
    return (delete(localBookmarksTable)..where((tbl) => tbl.id.equals(id))).go();
  }

  /// Retrieves all bookmarks pending synchronization.
  Future<List<LocalBookmark>> getPendingSync() {
    return (select(localBookmarksTable)
          ..where((tbl) => tbl.syncStatus.isNotValue('synced')))
        .get();
  }
}
