import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/local_reading_progress_table.dart';

part 'reading_progress_dao.g.dart';

@DriftAccessor(tables: [LocalReadingProgressTable])
class ReadingProgressDao extends DatabaseAccessor<AppDatabase>
    with _$ReadingProgressDaoMixin {
  ReadingProgressDao(super.db);

  /// Streams all reading progress for a user, sorted by last read date descending.
  Stream<List<LocalReadingProgress>> watchAllProgress(String userId) {
    return (select(localReadingProgressTable)
          ..where((tbl) => tbl.userId.equals(userId))
          ..orderBy([(tbl) => OrderingTerm.desc(tbl.lastReadAt)]))
        .watch();
  }

  /// Streams reading progress for a specific book.
  Stream<LocalReadingProgress?> watchBookProgress(String userId, String bookId) {
    return (select(localReadingProgressTable)
          ..where((tbl) => tbl.userId.equals(userId) & tbl.bookId.equals(bookId)))
        .watchSingleOrNull();
  }

  /// Gets progress for a specific book directly.
  Future<LocalReadingProgress?> getBookProgress(String userId, String bookId) {
    return (select(localReadingProgressTable)
          ..where((tbl) => tbl.userId.equals(userId) & tbl.bookId.equals(bookId)))
        .getSingleOrNull();
  }

  /// Saves or updates reading progress.
  Future<void> saveProgress(LocalReadingProgressTableCompanion progress) {
    return into(localReadingProgressTable).insertOnConflictUpdate(progress);
  }

  /// Deletes reading progress for a book.
  Future<int> deleteProgress(String userId, String bookId) {
    return (delete(localReadingProgressTable)
          ..where((tbl) => tbl.userId.equals(userId) & tbl.bookId.equals(bookId)))
        .go();
  }

  /// Retrieves all reading progress records pending synchronization.
  Future<List<LocalReadingProgress>> getPendingSync() {
    return (select(localReadingProgressTable)
          ..where((tbl) => tbl.syncStatus.isNotValue('synced')))
        .get();
  }
}
