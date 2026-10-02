import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app_database.dart';
import 'database_key_provider.dart';
import 'daos/bookmarks_dao.dart';
import 'daos/reading_progress_dao.dart';
import 'daos/app_settings_dao.dart';
import 'daos/user_state_dao.dart';
import 'daos/sync_queue_dao.dart';
import 'daos/sync_cursors_dao.dart';

/// Database encryption key provider singleton.
final databaseKeyProvider = Provider<DatabaseKeyProvider>((ref) {
  return DatabaseKeyProvider();
});

/// The core AppDatabase Drift instance provider.
/// Overridable in test suites using `AppDatabase.forTesting(NativeDatabase.memory())`.
final appDatabaseProvider = Provider<AppDatabase>((ref) {
  final keyProvider = ref.watch(databaseKeyProvider);
  final executor = AppDatabase.openEncryptedConnection(keyProvider: keyProvider);
  final db = AppDatabase(executor);

  ref.onDispose(() {
    db.close();
  });

  return db;
});

/// Bookmarks DAO provider.
final bookmarksDaoProvider = Provider<BookmarksDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return db.bookmarksDao;
});

/// Reading Progress DAO provider.
final readingProgressDaoProvider = Provider<ReadingProgressDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return db.readingProgressDao;
});

/// App Settings DAO provider.
final appSettingsDaoProvider = Provider<AppSettingsDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return db.appSettingsDao;
});

/// User State DAO provider.
final userStateDaoProvider = Provider<UserStateDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return db.userStateDao;
});

/// Sync Queue DAO provider.
final syncQueueDaoProvider = Provider<SyncQueueDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return db.syncQueueDao;
});

/// Sync Cursors DAO provider.
final syncCursorsDaoProvider = Provider<SyncCursorsDao>((ref) {
  final db = ref.watch(appDatabaseProvider);
  return db.syncCursorsDao;
});

