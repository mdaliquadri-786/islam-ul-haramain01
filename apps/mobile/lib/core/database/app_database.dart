import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'tables/local_user_state_table.dart';
import 'tables/app_settings_table.dart';
import 'tables/local_bookmarks_table.dart';
import 'tables/local_reading_progress_table.dart';
import 'tables/sync_queue_table.dart';
import 'tables/sync_cursors_table.dart';
import 'database_key_provider.dart';
import 'daos/bookmarks_dao.dart';
import 'daos/reading_progress_dao.dart';
import 'daos/app_settings_dao.dart';
import 'daos/user_state_dao.dart';
import 'daos/sync_queue_dao.dart';
import 'daos/sync_cursors_dao.dart';

part 'app_database.g.dart';

@DriftDatabase(
  tables: [
    LocalUserStateTable,
    AppSettingsTable,
    LocalBookmarksTable,
    LocalReadingProgressTable,
    SyncQueueTable,
    SyncCursorsTable,
  ],
  daos: [
    BookmarksDao,
    ReadingProgressDao,
    AppSettingsDao,
    UserStateDao,
    SyncQueueDao,
    SyncCursorsDao,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase(super.executor);

  AppDatabase.forTesting(super.executor);

  @override
  int get schemaVersion => 2;

  @override
  MigrationStrategy get migration => MigrationStrategy(
        onCreate: (Migrator m) async {
          await m.createAll();
          // Seed default settings row on initial creation
          await into(appSettingsTable).insert(
            AppSettingsTableCompanion.insert(
              id: const Value('default'),
              themeMode: const Value('system'),
              locale: const Value('en'),
              arabicScript: const Value('uthmani'),
              arabicFontSize: const Value(26.0),
              translationFontSize: const Value(16.0),
              prayerCalculationMethod: const Value('muslim_world_league'),
              prayerMadhab: const Value('shafi'),
              selectedReciterId: const Value('mishary-rashid-alafasy'),
              notificationsEnabled: const Value(true),
              offlineSyncEnabled: const Value(true),
            ),
            mode: InsertMode.insertOrIgnore,
          );
        },
        onUpgrade: (Migrator m, int from, int to) async {
          if (from < 2) {
            // 1. Add versioning columns to local_bookmarks
            await m.addColumn(localBookmarksTable, localBookmarksTable.clientVersion);
            await m.addColumn(localBookmarksTable, localBookmarksTable.serverRevision);
            await m.addColumn(localBookmarksTable, localBookmarksTable.lastClientMutationId);

            // 2. Add versioning & tombstone columns to local_reading_progress
            await m.addColumn(localReadingProgressTable, localReadingProgressTable.clientVersion);
            await m.addColumn(localReadingProgressTable, localReadingProgressTable.serverRevision);
            await m.addColumn(localReadingProgressTable, localReadingProgressTable.lastClientMutationId);
            await m.addColumn(localReadingProgressTable, localReadingProgressTable.deletedAt);

            // 3. Create sync_cursors table for keyset pagination cursors
            await m.createTable(syncCursorsTable);

            // 4. Backfill any existing local rows with default baselines (client_version = 1, server_revision = 1)
            await customStatement(
              'UPDATE local_bookmarks SET client_version = 1, server_revision = 1 '
              'WHERE client_version IS NULL OR server_revision IS NULL;',
            );
            await customStatement(
              'UPDATE local_reading_progress SET client_version = 1, server_revision = 1 '
              'WHERE client_version IS NULL OR server_revision IS NULL;',
            );
          }
        },
        beforeOpen: (details) async {
          // Enable WAL and foreign keys
          await customStatement('PRAGMA foreign_keys = ON;');
        },
      );

  /// Factory to open encrypted persistent database with fail-closed security.
  /// Prohibits plaintext database creation.
  static QueryExecutor openEncryptedConnection({
    required DatabaseKeyProvider keyProvider,
    String dbName = 'islamic_mobile_encrypted.db',
  }) {
    return LazyDatabase(() async {
      final dbFolder = await getApplicationDocumentsDirectory();
      final file = File(p.join(dbFolder.path, dbName));
      final rawKey = await keyProvider.getOrCreateKey();
      final pragmaKey = keyProvider.derivePragmaKey(rawKey);

      return NativeDatabase.createInBackground(
        file,
        setup: (rawDb) {
          // Strict fail-closed verification: Ensure SQLite3MultipleCiphers/SQLCipher is active
          final cipherCheck = rawDb.select('PRAGMA cipher;');
          if (cipherCheck.isEmpty) {
            throw SqliteException(
              extendedResultCode: 26,
              message:
                  'Fatal security error: SQLite encryption engine is not active. Plaintext fallback prohibited.',
            );
          }

          // Configure encryption key pragma for SQLCipher/SQLite3MC compatibility
          final escapedKey = pragmaKey.replaceAll("'", "''");
          rawDb.execute("PRAGMA key = '$escapedKey';");
          rawDb.execute('PRAGMA foreign_keys = ON;');
          rawDb.execute('PRAGMA journal_mode = WAL;');
        },
      );
    });
  }
}
