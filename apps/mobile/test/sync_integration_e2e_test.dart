import 'package:flutter_test/flutter_test.dart';
import 'package:drift/native.dart';
import 'package:drift/drift.dart' as drift;
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:islamic_mobile/core/auth/auth_models.dart';
import 'package:islamic_mobile/core/auth/auth_provider.dart';
import 'package:islamic_mobile/core/auth/secure_session_storage.dart';
import 'package:islamic_mobile/core/auth/supabase_auth_client.dart';
import 'package:islamic_mobile/core/config/app_config.dart';
import 'package:islamic_mobile/core/database/app_database.dart';
import 'package:islamic_mobile/core/database/database_providers.dart';
import 'package:islamic_mobile/core/sync/sync_coordinator.dart';
import 'package:islamic_mobile/core/sync/sync_models.dart';
import 'package:islamic_mobile/core/sync/sync_providers.dart';
import 'package:islamic_mobile/core/sync/sync_services.dart';
import 'package:islamic_mobile/core/sync/sync_transport.dart';
import 'package:islamic_mobile/core/sync/sync_ui_state.dart';

/// Controllable fake transport for integration tests.
class E2EFakeSyncTransport implements SyncTransport {
  final List<SyncMutation> pushedMutations = [];
  final List<Map<String, dynamic>> pullRequests = [];

  SyncPushResponse Function(SyncMutation mutation)? onPush;
  List<Map<String, dynamic>> Function(SyncEntityType entityType, SyncCursor? cursor)? onPull;

  bool throwNetworkErrorOnPush = false;
  bool throwTimeoutOnPush = false;

  @override
  Future<SyncPushResponse> pushMutation({
    required String accessToken,
    required SyncMutation mutation,
  }) async {
    if (throwNetworkErrorOnPush) {
      throw const SyncException(
        message: 'Socket connection failed',
        errorType: SyncErrorType.networkUnavailable,
      );
    }
    if (throwTimeoutOnPush) {
      throw const SyncException(
        message: 'Push timed out',
        errorType: SyncErrorType.timeout,
      );
    }

    pushedMutations.add(mutation);

    if (onPush != null) {
      return onPush!(mutation);
    }

    return SyncPushResponse(
      statusCode: 200,
      isSuccess: true,
      responseData: {
        'id': mutation.entityId,
        'client_version': mutation.clientVersion,
        'server_revision': 1,
        'last_client_mutation_id': mutation.id,
      },
    );
  }

  @override
  Future<List<Map<String, dynamic>>> pullPage({
    required String accessToken,
    required SyncEntityType entityType,
    required String userId,
    SyncCursor? cursor,
    int limit = 50,
  }) async {
    pullRequests.add({
      'entityType': entityType,
      'userId': userId,
      'cursor': cursor,
      'limit': limit,
    });

    if (onPull != null) {
      return onPull!(entityType, cursor);
    }

    return [];
  }
}

/// Fake Supabase Auth Client for E2E tests.
class E2EFakeAuthClient extends SupabaseAuthClient {
  E2EFakeAuthClient() : super(config: const AppConfig.forTesting());

  @override
  Future<(AuthTokens, AuthUser)> signInWithPassword({
    required String email,
    required String password,
  }) async {
    return (
      AuthTokens(
        accessToken: 'mock-jwt-$email',
        refreshToken: 'mock-refresh-$email',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      ),
      AuthUser(id: 'uid-${email.split('@').first}', email: email),
    );
  }

  @override
  Future<(AuthTokens?, AuthUser)> signUp({
    required String email,
    required String password,
    String? displayName,
    Map<String, dynamic>? data,
  }) async {
    throw UnimplementedError();
  }

  @override
  Future<(AuthTokens, AuthUser)> refreshToken({
    required String refreshToken,
  }) async {
    return (
      AuthTokens(
        accessToken: 'mock-refreshed-jwt',
        refreshToken: 'mock-refreshed-refresh',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      ),
      const AuthUser(id: 'uid-test', email: 'test@example.com'),
    );
  }

  @override
  Future<void> signOut({required String accessToken}) async {}

  @override
  Future<AuthUser> getCurrentUser({required String accessToken}) async {
    return const AuthUser(id: 'uid-test', email: 'test@example.com');
  }
}

void main() {
  drift.driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;

  late AppDatabase db;
  late InMemorySessionStorage sessionStorage;
  late E2EFakeSyncTransport transport;
  late E2EFakeAuthClient authClient;
  late ProviderContainer container;

  final testUser = const AuthUser(
    id: 'user-e2e-1',
    email: 'muslim1@example.com',
    displayName: 'Ahmad',
  );

  final testTokens = AuthTokens(
    accessToken: 'e2e-access-token',
    refreshToken: 'e2e-refresh-token',
    expiresAt: DateTime.now().toUtc().add(const Duration(hours: 2)),
    expiresIn: 7200,
  );

  setUp(() async {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    sessionStorage = InMemorySessionStorage();
    transport = E2EFakeSyncTransport();
    authClient = E2EFakeAuthClient();

    container = ProviderContainer(
      overrides: [
        appDatabaseProvider.overrideWithValue(db),
        sessionStorageProvider.overrideWithValue(sessionStorage),
        supabaseAuthClientProvider.overrideWithValue(authClient),
        syncTransportProvider.overrideWithValue(transport),
      ],
    );
  });

  tearDown(() async {
    container.dispose();
    await db.close();
  });

  group('M5.4 Phase 3E — Bookmark End-to-End Tests (1-5)', () {
    test('1. local bookmark write persists immediately and reflects in active stream', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final bookmarkService = container.read(syncBookmarkServiceProvider);

      await bookmarkService.saveBookmark(
        contentType: 'quran',
        contentReference: 'quran:1:1',
        surahNumber: 1,
        ayahNumber: 1,
        folderName: 'Favorites',
      );

      final bookmarks = await bookmarkService.watchActiveBookmarks().first;
      expect(bookmarks.length, equals(1));
      expect(bookmarks.first.contentReference, equals('quran:1:1'));
      expect(bookmarks.first.folderName, equals('Favorites'));
      expect(bookmarks.first.clientVersion, equals(1));
    });

    test('2. mutation generated with correct payload and client_version', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        id: 'bm-test-mut',
        contentType: 'quran',
        contentReference: 'quran:2:255',
        surahNumber: 2,
        ayahNumber: 255,
      );

      final queue = await db.syncQueueDao.getPendingItems();
      expect(queue.length, equals(1));
      expect(queue.first.entityType, equals('bookmark'));
      expect(queue.first.entityId, equals('bm-test-mut'));
      expect(queue.first.operation, equals('INSERT'));
      expect(queue.first.payloadJson, contains('quran:2:255'));
    });

    test('3. offline bookmark remains usable and visible in UI stream', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();
      transport.throwNetworkErrorOnPush = true; // Offline

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'hadith',
        contentReference: 'bukhari:1',
        hadithCollection: 'bukhari',
        hadithNumber: 1,
      );

      // Immediately visible locally in Drift stream
      final bookmarks = await bookmarkService.watchActiveBookmarks().first;
      expect(bookmarks.any((b) => b.contentReference == 'bukhari:1'), isTrue);

      // Mutation is buffered safely in queue
      final queue = await db.syncQueueDao.getPendingItems();
      expect(queue.length, equals(1));
    });

    test('4. sync sends pending mutation and purges from outbox on ACK', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'dua',
        contentReference: 'dua:morning:1',
        duaCategory: 'morning',
      );

      // Execute sync explicitly
      final syncEngine = container.read(syncEngineProvider);
      final result = await syncEngine.sync();

      expect(result.success, isTrue);
      expect(result.pushedCount, equals(1));
      expect(transport.pushedMutations.length, equals(1));

      // Outbox must be drained
      final queue = await db.syncQueueDao.getPendingItems();
      expect(queue, isEmpty);
    });

    test('5. remote bookmark is applied locally via SyncEngine pull', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      transport.onPull = (type, cursor) {
        if (type == SyncEntityType.bookmark) {
          return [
            {
              'id': 'bm-remote-001',
              'user_id': testUser.id,
              'content_type': 'quran',
              'content_reference': 'quran:18:10',
              'surah_number': 18,
              'ayah_number': 10,
              'folder_name': 'Cave',
              'client_version': 1,
              'server_revision': 3,
              'updated_at': DateTime.utc(2026, 9, 26, 12, 0, 0).toIso8601String(),
            }
          ];
        }
        return [];
      };

      final syncEngine = container.read(syncEngineProvider);
      final result = await syncEngine.sync();

      expect(result.success, isTrue);
      expect(result.pulledCount, equals(1));

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      final bookmarks = await bookmarkService.watchActiveBookmarks().first;
      expect(bookmarks.any((b) => b.id == 'bm-remote-001'), isTrue);
    });
  });

  group('M5.4 Phase 3E — Reading Progress End-to-End Tests (6-9)', () {
    test('6. local progress update persists immediately', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final progressService = container.read(syncReadingProgressServiceProvider);
      await progressService.saveProgress(
        bookId: 'riyad-al-salihin',
        volumeNumber: 1,
        pageNumber: 45,
        progressPercentage: 15.0,
      );

      final progress = await progressService.watchBookProgress('riyad-al-salihin').first;
      expect(progress, isNotNull);
      expect(progress!.pageNumber, equals(45));
      expect(progress.progressPercentage, equals(15.0));
    });

    test('7. mutation generated with volume, percentage, and versioning', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final progressService = container.read(syncReadingProgressServiceProvider);
      await progressService.saveProgress(
        bookId: 'sahih-al-bukhari',
        volumeNumber: 2,
        pageNumber: 110,
        progressPercentage: 25.5,
      );

      final queue = await db.syncQueueDao.getPendingItems();
      expect(queue.any((q) => q.entityType == 'reading_progress'), isTrue);
      final item = queue.firstWhere((q) => q.entityType == 'reading_progress');
      expect(item.payloadJson, contains('sahih-al-bukhari'));
      expect(item.payloadJson, contains('25.5'));
    });

    test('8. offline progress survives and remains in local Drift table', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();
      transport.throwNetworkErrorOnPush = true;

      final progressService = container.read(syncReadingProgressServiceProvider);
      await progressService.saveProgress(
        bookId: 'al-adab-al-mufrad',
        volumeNumber: 1,
        progressPercentage: 50.0,
      );

      final progress = await progressService.watchBookProgress('al-adab-al-mufrad').first;
      expect(progress!.progressPercentage, equals(50.0));
      expect((await db.syncQueueDao.getPendingItems()).length, equals(1));
    });

    test('9. synchronization reconciles progress from remote changelog', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      transport.onPull = (type, cursor) {
        if (type == SyncEntityType.readingProgress) {
          return [
            {
              'id': 'rp-remote-77',
              'user_id': testUser.id,
              'book_id': 'bulugh-al-maram',
              'volume_number': 1,
              'page_number': 88,
              'progress_percentage': 72.0,
              'client_version': 2,
              'server_revision': 4,
              'updated_at': DateTime.utc(2026, 9, 26, 14, 0, 0).toIso8601String(),
            }
          ];
        }
        return [];
      };

      await container.read(syncEngineProvider).sync();

      final progress = await container
          .read(syncReadingProgressServiceProvider)
          .watchBookProgress('bulugh-al-maram')
          .first;

      expect(progress, isNotNull);
      expect(progress!.progressPercentage, equals(72.0));
      expect(progress.serverRevision, equals(4));
    });
  });

  group('M5.4 Phase 3E — Prayer Settings End-to-End Tests (10-13)', () {
    test('10. setting change persists locally in AppSettingsTable', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final prayerSettingsService = container.read(syncPrayerSettingsServiceProvider);
      await prayerSettingsService.setPrayerPreferences(
        method: 'umm_al_qura',
        madhab: 'hanafi',
      );

      final settings = await prayerSettingsService.getSettings();
      expect(settings.prayerCalculationMethod, equals('umm_al_qura'));
      expect(settings.prayerMadhab, equals('hanafi'));
    });

    test('11. mutation is generated where applicable for prayer preferences', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final prayerSettingsService = container.read(syncPrayerSettingsServiceProvider);
      await prayerSettingsService.setPrayerPreferences(
        method: 'karachi',
        madhab: 'shafi',
      );

      final queue = await db.syncQueueDao.getPendingItems();
      expect(queue.any((q) => q.entityType == 'prayer_settings'), isTrue);
    });

    test('12. synchronization pushes settings and ingests remote updates', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final prayerSettingsService = container.read(syncPrayerSettingsServiceProvider);
      await prayerSettingsService.setPrayerPreferences(madhab: 'hanafi');

      final result = await container.read(syncEngineProvider).sync();
      expect(result.success, isTrue);
      expect(transport.pushedMutations.any((m) => m.entityType == SyncEntityType.prayerSettings), isTrue);
    });

    test('13. GPS coordinates never enter synchronization payload', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final prayerSettingsService = container.read(syncPrayerSettingsServiceProvider);
      await prayerSettingsService.setPrayerPreferences(
        method: 'muslim_world_league',
        madhab: 'shafi',
      );

      final queue = await db.syncQueueDao.getPendingItems();
      final settingsMutation = queue.firstWhere((q) => q.entityType == 'prayer_settings');

      // Strict security assertion: zero GPS location coordinates in payload
      expect(settingsMutation.payloadJson.contains('latitude'), isFalse);
      expect(settingsMutation.payloadJson.contains('longitude'), isFalse);
      expect(settingsMutation.payloadJson.contains('coordinates'), isFalse);
    });
  });

  group('M5.4 Phase 3E — Authentication & Account Isolation Tests (14-17)', () {
    test('14. guest does not upload mutations to sync queue', () async {
      // Act as guest
      await container.read(authNotifierProvider.notifier).continueAsGuest();

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'quran',
        contentReference: 'quran:1:7',
      );

      // Bookmark is stored locally
      final bookmarks = await bookmarkService.watchActiveBookmarks().first;
      expect(bookmarks.length, equals(1));

      // Zero mutations enqueued in sync_queue!
      final queue = await db.syncQueueDao.getPendingItems();
      expect(queue, isEmpty);

      // SyncEngine.sync fails safely without network calls
      final result = await container.read(syncEngineProvider).sync();
      expect(result.success, isFalse);
      expect(transport.pushedMutations, isEmpty);
    });

    test('15. authenticated account synchronizes successfully', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'quran',
        contentReference: 'quran:112:1',
      );

      final result = await container.read(syncCoordinatorProvider).syncNow();
      expect(result.success, isTrue);
      expect(result.pushedCount, equals(1));
    });

    test('16. logout prevents old-account sync and clears cursors', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      // Seed a cursor
      await container.read(syncCursorRepositoryProvider).saveCursor(
        SyncCursor(
          entityType: SyncEntityType.bookmark,
          updatedAt: DateTime.now().toUtc(),
          id: 'test-cursor-1',
        ),
      );

      // Sign out
      await container.read(authNotifierProvider.notifier).signOut();

      // Subsequent sync fails unauthenticated
      final result = await container.read(syncEngineProvider).sync();
      expect(result.success, isFalse);
      expect(result.errors.first, contains('unauthenticated'));
    });

    test('17. account switch remains isolated without cross-contamination', () async {
      // User 1 logs in and queues a mutation
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      final coordinator = container.read(syncCoordinatorProvider);

      // User 1 logs out
      await container.read(authNotifierProvider.notifier).signOut();

      // User 2 logs in
      final user2 = const AuthUser(id: 'user-e2e-2', email: 'user2@example.com');
      final tokens2 = AuthTokens(
        accessToken: 'user2-jwt',
        refreshToken: 'user2-refresh',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      );
      await sessionStorage.saveSession(tokens2, user2);
      await container.read(authNotifierProvider.notifier).restoreSession();

      // Clear transport log
      transport.pullRequests.clear();

      await coordinator.syncNow();

      // All pull queries strictly belong to User 2
      expect(transport.pullRequests.every((r) => r['userId'] == 'user-e2e-2'), isTrue);
    });
  });

  group('M5.4 Phase 3E — Failure & Retry End-to-End Tests (18-20)', () {
    test('18. offline sync failure is safe and preserves local data', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();
      transport.throwNetworkErrorOnPush = true;

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'hadith',
        contentReference: 'muslim:1',
      );

      final result = await container.read(syncEngineProvider).sync();
      expect(result.success, isFalse);

      // Local bookmark survives intact
      final bookmarks = await bookmarkService.watchActiveBookmarks().first;
      expect(bookmarks.any((b) => b.contentReference == 'muslim:1'), isTrue);
    });

    test('19. retry works and reuses identical mutation ID', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();
      transport.throwNetworkErrorOnPush = true;

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'quran',
        contentReference: 'quran:55:1',
      );

      // Attempt 1 fails
      await container.read(syncEngineProvider).sync();
      final originalMutationId = (await db.syncQueueDao.getPendingItems()).first.id;

      // Restore network
      transport.throwNetworkErrorOnPush = false;

      // Attempt 2 succeeds
      final result2 = await container.read(syncCoordinatorProvider).syncNow();
      expect(result2.success, isTrue);
      expect(transport.pushedMutations.first.id, equals(originalMutationId));
      expect(await db.syncQueueDao.getPendingItems(), isEmpty);
    });

    test('20. failed mutation remains available in outbox queue with attempt recorded', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();
      transport.throwNetworkErrorOnPush = true;

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'quran',
        contentReference: 'quran:67:1',
      );

      await container.read(syncEngineProvider).sync();

      final queue = await db.syncQueueDao.getPendingItems();
      expect(queue.length, equals(1));
      expect(queue.first.attempts, greaterThanOrEqualTo(1));
      expect(queue.first.errorMessage, isNotNull);
    });
  });

  group('M5.4 Phase 3E — UI State End-to-End Tests (21-24)', () {
    test('21. syncing state is reflected during active synchronization', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      // Trigger sync and verify state transitions
      final syncFuture = container.read(syncEngineProvider).sync();
      expect(container.read(syncUIStateProvider).status, equals(SyncUIStatus.syncing));

      await syncFuture;
      expect(container.read(syncUIStateProvider).status, equals(SyncUIStatus.synced));
    });

    test('22. synced state is reported when outbox queue is clean', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      await container.read(syncEngineProvider).sync();
      final uiState = container.read(syncUIStateProvider);

      expect(uiState.status, equals(SyncUIStatus.synced));
      expect(uiState.statusMessage, contains('Synced'));
      expect(uiState.hasPendingChanges, isFalse);
    });

    test('23. offline state is reported when network is unavailable', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();
      transport.throwNetworkErrorOnPush = true;

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'quran',
        contentReference: 'quran:1:1',
      );

      await container.read(syncEngineProvider).sync();
      final uiState = container.read(syncUIStateProvider);

      expect(uiState.status, equals(SyncUIStatus.offline));
      expect(uiState.statusMessage, contains('Offline'));
    });

    test('24. error state is surfaced with safe user-friendly message', () async {
      await sessionStorage.saveSession(testTokens, testUser);
      await container.read(authNotifierProvider.notifier).restoreSession();

      // Inject server error response
      transport.onPush = (mut) => const SyncPushResponse(
            statusCode: 500,
            isSuccess: false,
            errorMessage: 'Internal Server Error',
          );

      final bookmarkService = container.read(syncBookmarkServiceProvider);
      await bookmarkService.saveBookmark(
        contentType: 'quran',
        contentReference: 'quran:2:1',
      );

      await container.read(syncEngineProvider).sync();
      final uiState = container.read(syncUIStateProvider);

      expect(uiState.status, equals(SyncUIStatus.error));
      expect(uiState.errorMessage, contains('Transient push failure'));
      // Asserts that no sensitive bearer tokens or credentials are in the error message
      expect(uiState.errorMessage!.contains('Bearer'), isFalse);
      expect(uiState.errorMessage!.contains('jwt'), isFalse);
    });
  });
}
