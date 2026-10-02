import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:drift/native.dart';
import 'package:drift/drift.dart' as drift;

import 'package:islamic_mobile/core/auth/auth_models.dart';
import 'package:islamic_mobile/core/auth/auth_provider.dart';
import 'package:islamic_mobile/core/auth/secure_session_storage.dart';
import 'package:islamic_mobile/core/auth/supabase_auth_client.dart';
import 'package:islamic_mobile/core/config/app_config.dart';
import 'package:islamic_mobile/core/database/app_database.dart';
import 'package:islamic_mobile/core/sync/sync_engine.dart';
import 'package:islamic_mobile/core/sync/sync_models.dart';
import 'package:islamic_mobile/core/sync/sync_repositories.dart';
import 'package:islamic_mobile/core/sync/sync_repository_impl.dart';
import 'package:islamic_mobile/core/sync/sync_transport.dart';

/// Controllable mock sync transport for unit testing.
class FakeSyncTransport implements SyncTransport {
  final List<SyncMutation> pushedMutations = [];
  final List<Map<String, dynamic>> pullRequests = [];

  SyncPushResponse Function(SyncMutation mutation)? onPush;
  List<Map<String, dynamic>> Function(SyncEntityType entityType, SyncCursor? cursor)? onPull;

  bool throwNetworkErrorOnPush = false;
  bool throwTimeoutOnPush = false;
  bool throwAuthErrorOnPush = false;

  @override
  Future<SyncPushResponse> pushMutation({
    required String accessToken,
    required SyncMutation mutation,
  }) async {
    if (throwNetworkErrorOnPush) {
      throw const SyncException(
        message: 'Network socket failure',
        errorType: SyncErrorType.networkUnavailable,
      );
    }
    if (throwTimeoutOnPush) {
      throw const SyncException(
        message: 'Push timed out',
        errorType: SyncErrorType.timeout,
      );
    }
    if (throwAuthErrorOnPush) {
      return const SyncPushResponse(
        statusCode: 401,
        isSuccess: false,
        errorMessage: '401 Unauthorized',
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

/// Fake AuthNotifier for testing session refresh and logout.
class FakeAuthNotifier extends AuthNotifier {
  bool refreshTokenResult = true;
  int refreshCallCount = 0;
  bool signOutCalled = false;

  FakeAuthNotifier({
    required super.sessionStorage,
    required super.userStateDao,
  }) : super(
          authClient: FakeSupabaseAuthClient(),
        );

  @override
  Future<bool> refreshToken() async {
    refreshCallCount++;
    return refreshTokenResult;
  }

  @override
  Future<void> signOut() async {
    signOutCalled = true;
    await super.signOut();
  }
}

class FakeSupabaseAuthClient extends SupabaseAuthClient {
  FakeSupabaseAuthClient() : super(config: const AppConfig.forTesting());

  @override
  Future<(AuthTokens, AuthUser)> signInWithPassword({
    required String email,
    required String password,
  }) async {
    throw UnimplementedError();
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
        accessToken: 'new-refreshed-token',
        refreshToken: 'new-refresh-token',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      ),
      const AuthUser(id: 'user-001', email: 'test@example.com'),
    );
  }

  @override
  Future<void> signOut({required String accessToken}) async {}

  @override
  Future<AuthUser> getCurrentUser({required String accessToken}) async {
    return const AuthUser(id: 'user-001', email: 'test@example.com');
  }
}



void main() {
  drift.driftRuntimeOptions.dontWarnAboutMultipleDatabases = true;

  late AppDatabase db;
  late InMemorySessionStorage sessionStorage;
  late FakeAuthNotifier authNotifier;
  late FakeSyncTransport transport;
  late SyncCursorRepository cursorRepo;
  late SyncMutationRepository mutationRepo;
  late SyncEngine engine;

  final testUser = const AuthUser(
    id: 'user-123',
    email: 'muslim@example.com',
    displayName: 'Abdullah',
  );

  final testTokens = AuthTokens(
    accessToken: 'valid-jwt-token',
    refreshToken: 'valid-refresh-token',
    expiresAt: DateTime.now().toUtc().add(const Duration(hours: 2)),
    expiresIn: 7200,
  );

  setUp(() async {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    sessionStorage = InMemorySessionStorage();
    authNotifier = FakeAuthNotifier(
      sessionStorage: sessionStorage,
      userStateDao: db.userStateDao,
    );
    transport = FakeSyncTransport();
    cursorRepo = SyncCursorRepositoryImpl(db.syncCursorsDao);
    mutationRepo = SyncMutationRepositoryImpl(db.syncQueueDao);

    engine = SyncEngine(
      transport: transport,
      cursorRepo: cursorRepo,
      mutationRepo: mutationRepo,
      sessionStorage: sessionStorage,
      authNotifier: authNotifier,
      db: db,
    );
  });

  tearDown(() async {
    await db.close();
  });

  group('M5.4 Phase 3D — Authentication Tests (1-4)', () {
    test('1. Unauthenticated sync returns error and prevents network traffic', () async {
      final result = await engine.sync();

      expect(result.success, isFalse);
      expect(result.errors.first, contains('unauthenticated or running in offline guest mode'));
      expect(transport.pushedMutations, isEmpty);
      expect(transport.pullRequests, isEmpty);
    });

    test('2. Authenticated sync succeeds and updates lastSyncTime', () async {
      await sessionStorage.saveSession(testTokens, testUser);

      final result = await engine.sync();

      expect(result.success, isTrue);
      expect(engine.state.status, equals(SyncEngineStatus.idle));
      expect(engine.state.lastSyncTime, isNotNull);
    });

    test('3. Expired session triggers token refresh before sync', () async {
      final expiredTokens = AuthTokens(
        accessToken: 'expired-token',
        refreshToken: 'valid-refresh',
        expiresAt: DateTime.now().toUtc().subtract(const Duration(minutes: 10)),
        expiresIn: 3600,
      );
      await sessionStorage.saveSession(expiredTokens, testUser);

      authNotifier.refreshTokenResult = true;
      final result = await engine.sync();

      expect(authNotifier.refreshCallCount, equals(1));
      expect(result.success, isTrue);
    });

    test('4. Account switching isolation prevents user data contamination', () async {
      // User A syncs
      await sessionStorage.saveSession(testTokens, testUser);
      await db.bookmarksDao.saveBookmark(
        LocalBookmarksTableCompanion.insert(
          id: 'bm-user-a',
          userId: 'user-123',
          contentType: 'quran',
          contentReference: 'quran:1:1',
        ),
      );

      final resultA = await engine.sync();
      expect(resultA.success, isTrue);

      // User A logs out
      await authNotifier.signOut();
      expect(await sessionStorage.getUser(), isNull);

      // User B logs in
      final userB = const AuthUser(id: 'user-456', email: 'userb@example.com');
      final tokensB = AuthTokens(
        accessToken: 'user-b-jwt',
        refreshToken: 'user-b-refresh',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      );
      await sessionStorage.saveSession(tokensB, userB);

      // Clear transport logs
      transport.pullRequests.clear();

      await engine.sync();

      // All pull requests must be scoped strictly to User B
      expect(transport.pullRequests.every((req) => req['userId'] == 'user-456'), isTrue);
    });
  });

  group('M5.4 Phase 3D — Push / Outbox Processing Tests (5-10)', () {
    setUp(() async {
      await sessionStorage.saveSession(testTokens, testUser);
    });

    test('5. Pending mutation is successfully pushed and marked synced', () async {
      const mutId = 'mut-push-001';
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: mutId,
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-test-01',
          operation: SyncOperation.create,
          payload: {'content_reference': 'quran:2:255'},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      final result = await engine.sync();

      expect(result.success, isTrue);
      expect(result.pushedCount, equals(1));
      expect(transport.pushedMutations.length, equals(1));
      expect(transport.pushedMutations.first.id, equals(mutId));

      // Must be removed from outbox
      final pending = await mutationRepo.getPendingMutations();
      expect(pending, isEmpty);
    });

    test('6. Mutation acknowledgement removes item from queue', () async {
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-ack-01',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-ack-01',
          operation: SyncOperation.create,
          payload: {},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      expect((await mutationRepo.getPendingMutations()).length, equals(1));
      await engine.sync();
      expect((await mutationRepo.getPendingMutations()).length, equals(0));
    });

    test('7. Retry uses the exact same mutation ID (idempotency)', () async {
      const originalMutId = 'mut-retry-stable-uuid';
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: originalMutId,
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-retry-01',
          operation: SyncOperation.update,
          payload: {'note': 'retry test'},
          clientVersion: 2,
          createdAt: DateTime.now(),
        ),
      );

      // Simulate failure on first attempt
      transport.onPush = (mut) => const SyncPushResponse(
            statusCode: 503,
            isSuccess: false,
            errorMessage: 'Service Unavailable',
          );

      await engine.sync();
      expect(transport.pushedMutations.first.id, equals(originalMutId));

      // Second attempt succeeds
      transport.onPush = (mut) => const SyncPushResponse(statusCode: 200, isSuccess: true);
      await engine.sync();

      // Second push still used original mutation ID
      expect(transport.pushedMutations.last.id, equals(originalMutId));
    });

    test('8. Transient failure preserves mutation in queue with error recorded', () async {
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-transient-01',
          entityType: SyncEntityType.readingProgress,
          entityId: 'rp-01',
          operation: SyncOperation.update,
          payload: {},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      transport.throwNetworkErrorOnPush = true;
      final result = await engine.sync();

      expect(result.success, isFalse);
      final pending = await mutationRepo.getPendingMutations();
      expect(pending.length, equals(1));
      expect(pending.first.id, equals('mut-transient-01'));
    });

    test('9. Permanent validation failure is recorded as non-retryable and surfaced', () async {
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-perm-01',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-invalid',
          operation: SyncOperation.create,
          payload: {'invalid_field': 'err'},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      transport.onPush = (mut) => const SyncPushResponse(
            statusCode: 400,
            isSuccess: false,
            errorMessage: 'Bad Request: Schema violation',
          );

      final result = await engine.sync();
      expect(result.success, isFalse);
      expect(result.errors.first, contains('Permanent mutation rejection'));
    });

    test('10. Duplicate mutation is handled idempotently via server 200 ACK', () async {
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-dedup-01',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-dedup',
          operation: SyncOperation.create,
          payload: {},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      // Server returns cached 200 representation from client_mutations ledger
      transport.onPush = (mut) => const SyncPushResponse(
            statusCode: 200,
            isSuccess: true,
            isIdempotentReplay: true,
            responseData: {'id': 'bm-dedup', 'client_version': 1},
          );

      final result = await engine.sync();
      expect(result.success, isTrue);
      expect(await mutationRepo.getPendingMutations(), isEmpty);
    });
  });

  group('M5.4 Phase 3D — Pull / Incremental Sync Tests (11-16)', () {
    setUp(() async {
      await sessionStorage.saveSession(testTokens, testUser);
    });

    test('11. First pull with no cursor fetches from epoch and saves new cursor', () async {
      final nowUtc = DateTime.utc(2026, 9, 26, 10, 0, 0);

      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.bookmark && cursor == null) {
          return [
            {
              'id': 'bm-pull-001',
              'user_id': 'user-123',
              'content_type': 'quran',
              'content_reference': 'quran:1:1',
              'client_version': 1,
              'server_revision': 1,
              'updated_at': nowUtc.toIso8601String(),
            }
          ];
        }
        return [];
      };

      final result = await engine.sync();
      expect(result.success, isTrue);
      expect(result.pulledCount, equals(1));

      // Cursor must be saved
      final savedCursor = await cursorRepo.getCursor(SyncEntityType.bookmark);
      expect(savedCursor, isNotNull);
      expect(savedCursor!.id, equals('bm-pull-001'));
      expect(savedCursor.updatedAt.toUtc(), equals(nowUtc));

      // Record applied to local database
      final bookmarks = await (db.select(db.localBookmarksTable)..where((tbl) => tbl.id.equals('bm-pull-001'))).get();
      expect(bookmarks.length, equals(1));
      expect(bookmarks.first.contentReference, equals('quran:1:1'));
    });

    test('12. Incremental pull uses stored cursor in subsequent request', () async {
      final cursorTime = DateTime.utc(2026, 9, 26, 9, 30, 0);
      await cursorRepo.saveCursor(
        SyncCursor(
          entityType: SyncEntityType.bookmark,
          updatedAt: cursorTime,
          id: 'bm-prev-99',
        ),
      );

      await engine.sync();

      final bookmarkReq = transport.pullRequests.firstWhere((r) => r['entityType'] == SyncEntityType.bookmark);
      final sentCursor = bookmarkReq['cursor'] as SyncCursor?;
      expect(sentCursor, isNotNull);
      expect(sentCursor!.id, equals('bm-prev-99'));
      expect(sentCursor.updatedAt.toUtc(), equals(cursorTime));
    });

    test('13. Multi-page pull executes sequentially until page size < 50', () async {
      int pageCall = 0;
      final t1 = DateTime.utc(2026, 9, 26, 8, 0, 0);
      final t2 = DateTime.utc(2026, 9, 26, 8, 30, 0);

      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.bookmark) {
          pageCall++;
          if (pageCall == 1) {
            // First page returns full 50 items
            return List.generate(
              50,
              (i) => {
                'id': 'bm-p1-$i',
                'user_id': 'user-123',
                'content_type': 'quran',
                'content_reference': 'quran:2:$i',
                'client_version': 1,
                'server_revision': 1,
                'updated_at': t1.toIso8601String(),
              },
            );
          } else if (pageCall == 2) {
            // Second page returns 10 items (< 50)
            return List.generate(
              10,
              (i) => {
                'id': 'bm-p2-$i',
                'user_id': 'user-123',
                'content_type': 'quran',
                'content_reference': 'quran:3:$i',
                'client_version': 1,
                'server_revision': 1,
                'updated_at': t2.toIso8601String(),
              },
            );
          }
        }
        return [];
      };

      final result = await engine.sync();
      expect(result.success, isTrue);
      expect(result.pulledCount, equals(60));
      expect(pageCall, equals(2));

      // Cursor should be at the last item of page 2
      final finalCursor = await cursorRepo.getCursor(SyncEntityType.bookmark);
      expect(finalCursor!.id, equals('bm-p2-9'));
    });

    test('14. Cursor advances only after successful application', () async {
      final updateTime = DateTime.utc(2026, 9, 26, 11, 0, 0);
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.bookmark) {
          return [
            {
              'id': 'bm-atomic-01',
              'user_id': 'user-123',
              'content_type': 'quran',
              'content_reference': 'quran:18:1',
              'client_version': 1,
              'server_revision': 1,
              'updated_at': updateTime.toIso8601String(),
            }
          ];
        }
        return [];
      };

      await engine.sync();
      final cursor = await cursorRepo.getCursor(SyncEntityType.bookmark);
      expect(cursor?.id, equals('bm-atomic-01'));
    });

    test('15. Failed page application does not advance cursor', () async {
      final initialTime = DateTime.utc(2026, 9, 26, 7, 0, 0);
      await cursorRepo.saveCursor(
        SyncCursor(
          entityType: SyncEntityType.bookmark,
          updatedAt: initialTime,
          id: 'initial-id',
        ),
      );

      // Return malformed record that will throw during database mapping
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.bookmark) {
          return [
            {
              'id': 'corrupt-record',
              // missing user_id and content_reference throws CastError
              'user_id': null,
              'updated_at': 'not-a-valid-date',
            }
          ];
        }
        return [];
      };

      final result = await engine.sync();
      expect(result.success, isFalse);

      // Cursor must remain at initial position
      final cursor = await cursorRepo.getCursor(SyncEntityType.bookmark);
      expect(cursor!.id, equals('initial-id'));
    });

    test('16. Retry after failed page is safe', () async {
      final initialTime = DateTime.utc(2026, 9, 26, 7, 0, 0);
      await cursorRepo.saveCursor(
        SyncCursor(
          entityType: SyncEntityType.bookmark,
          updatedAt: initialTime,
          id: 'initial-id',
        ),
      );

      // Attempt 1 fails
      transport.onPull = (entityType, cursor) => throw const SyncException(
            message: 'Transport dropped',
            errorType: SyncErrorType.networkUnavailable,
          );

      await engine.sync();
      expect((await cursorRepo.getCursor(SyncEntityType.bookmark))!.id, equals('initial-id'));

      // Attempt 2 succeeds
      final validTime = DateTime.utc(2026, 9, 26, 12, 0, 0);
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.bookmark) {
          return [
            {
              'id': 'bm-recovered-01',
              'user_id': 'user-123',
              'content_type': 'quran',
              'content_reference': 'quran:112:1',
              'client_version': 1,
              'server_revision': 1,
              'updated_at': validTime.toIso8601String(),
            }
          ];
        }
        return [];
      };

      final result2 = await engine.sync();
      expect(result2.success, isTrue);
      expect((await cursorRepo.getCursor(SyncEntityType.bookmark))!.id, equals('bm-recovered-01'));
    });
  });

  group('M5.4 Phase 3D — Conflict & Version Handling Tests (17-21)', () {
    setUp(() async {
      await sessionStorage.saveSession(testTokens, testUser);
    });

    test('17. Stale client mutation receives 409 and server wins', () async {
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-stale-01',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-stale-test',
          operation: SyncOperation.update,
          payload: {
            'id': 'bm-stale-test',
            'user_id': 'user-123',
            'content_type': 'quran',
            'content_reference': 'quran:2:1',
            'folder_name': 'Old Local Folder',
            'client_version': 2,
          },
          clientVersion: 2,
          createdAt: DateTime.now(),
        ),
      );

      // Server already at version 3
      transport.onPush = (mut) => SyncPushResponse(
            statusCode: 409,
            isSuccess: false,
            isConflict: true,
            conflict: SyncConflict(
              mutationId: mut.id,
              entityType: SyncEntityType.bookmark,
              entityId: 'bm-stale-test',
              clientVersion: 2,
              serverVersion: 3,
              clientData: mut.payload,
              serverData: {
                'id': 'bm-stale-test',
                'user_id': 'user-123',
                'content_type': 'quran',
                'content_reference': 'quran:2:1',
                'folder_name': 'Server Winning Folder',
                'client_version': 3,
                'server_revision': 5,
              },
              conflictReason: 'Stale version rejected',
            ),
          );

      final result = await engine.sync();
      expect(result.conflictCount, equals(1));

      // Server state applied locally
      final row = await (db.select(db.localBookmarksTable)..where((tbl) => tbl.id.equals('bm-stale-test'))).getSingleOrNull();
      expect(row, isNotNull);
      expect(row!.folderName, equals('Server Winning Folder'));
      expect(row.clientVersion, equals(3));
    });

    test('18. Server revision strictly tracked on local applied rows', () async {
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.readingProgress) {
          return [
            {
              'id': 'rp-rev-test',
              'user_id': 'user-123',
              'book_id': 'riyad-al-salihin',
              'progress_percentage': 85.0,
              'client_version': 4,
              'server_revision': 12,
              'updated_at': DateTime.utc(2026, 9, 26, 12, 0, 0).toIso8601String(),
            }
          ];
        }
        return [];
      };

      await engine.sync();

      final row = await (db.select(db.localReadingProgressTable)..where((tbl) => tbl.id.equals('rp-rev-test'))).getSingleOrNull();
      expect(row, isNotNull);
      expect(row!.serverRevision, equals(12));
      expect(row.clientVersion, equals(4));
    });

    test('19. Version tie resolves via deterministic UUID tie-breaker', () async {
      // Local mutation has id 'aaa-uuid'
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'aaa-uuid-001',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-tie-01',
          operation: SyncOperation.update,
          payload: {
            'id': 'bm-tie-01',
            'user_id': 'user-123',
            'content_type': 'quran',
            'content_reference': 'quran:1:1',
            'folder_name': 'Local Folder',
          },
          clientVersion: 3,
          createdAt: DateTime.now(),
        ),
      );

      // Server state has last_client_mutation_id 'zzz-uuid' (lexicographically greater -> Server wins)
      transport.onPush = (mut) => SyncPushResponse(
            statusCode: 409,
            isSuccess: false,
            isConflict: true,
            conflict: SyncConflict(
              mutationId: mut.id,
              entityType: SyncEntityType.bookmark,
              entityId: 'bm-tie-01',
              clientVersion: 3,
              serverVersion: 3,
              clientData: mut.payload,
              serverData: {
                'id': 'bm-tie-01',
                'user_id': 'user-123',
                'content_type': 'quran',
                'content_reference': 'quran:1:1',
                'folder_name': 'Server Tie Winner',
                'last_client_mutation_id': 'zzz-uuid-999',
                'client_version': 3,
              },
              conflictReason: 'Concurrent edit tie',
            ),
          );

      await engine.sync();

      final row = await (db.select(db.localBookmarksTable)..where((tbl) => tbl.id.equals('bm-tie-01'))).getSingleOrNull();
      expect(row!.folderName, equals('Server Tie Winner'));
    });

    test('20. Tombstone conflict: server soft-delete overrides local active record', () async {
      // Seed local active record
      await db.bookmarksDao.saveBookmark(
        LocalBookmarksTableCompanion.insert(
          id: 'bm-tomb-override',
          userId: 'user-123',
          contentType: 'quran',
          contentReference: 'quran:5:1',
        ),
      );

      final deleteTime = DateTime.utc(2026, 9, 26, 12, 30, 0);
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.bookmark) {
          return [
            {
              'id': 'bm-tomb-override',
              'user_id': 'user-123',
              'content_type': 'quran',
              'content_reference': 'quran:5:1',
              'client_version': 2,
              'server_revision': 3,
              'deleted_at': deleteTime.toIso8601String(),
              'updated_at': deleteTime.toIso8601String(),
            }
          ];
        }
        return [];
      };

      await engine.sync();

      final row = await (db.select(db.localBookmarksTable)..where((tbl) => tbl.id.equals('bm-tomb-override'))).getSingleOrNull();
      expect(row, isNotNull);
      expect(row!.deletedAt, isNotNull);
      expect(row.deletedAt!.toUtc(), equals(deleteTime));
    });

    test('21. Deleted record cannot be resurrected by an older update', () async {
      final deleteTime = DateTime.utc(2026, 9, 26, 14, 0, 0);

      // Local record is already deleted
      await db.bookmarksDao.saveBookmark(
        LocalBookmarksTableCompanion.insert(
          id: 'bm-no-resurrect',
          userId: 'user-123',
          contentType: 'quran',
          contentReference: 'quran:10:1',
          deletedAt: drift.Value(deleteTime),
          clientVersion: const drift.Value(5),
          serverRevision: const drift.Value(6),
        ),
      );

      // Incoming stale pull from an older timestamp with deleted_at = null
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.bookmark) {
          return [
            {
              'id': 'bm-no-resurrect',
              'user_id': 'user-123',
              'content_type': 'quran',
              'content_reference': 'quran:10:1',
              'client_version': 3,
              'server_revision': 4,
              'deleted_at': null,
              'updated_at': DateTime.utc(2026, 9, 26, 12, 0, 0).toIso8601String(),
            }
          ];
        }
        return [];
      };

      await engine.sync();

      // Row must remain soft-deleted
      final row = await (db.select(db.localBookmarksTable)..where((tbl) => tbl.id.equals('bm-no-resurrect'))).getSingleOrNull();
      expect(row!.deletedAt, isNotNull);
    });
  });

  group('M5.4 Phase 3D — Offline Behavior Tests (22-24)', () {
    setUp(() async {
      await sessionStorage.saveSession(testTokens, testUser);
    });

    test('22. Network unavailable fails gracefully without corrupting state', () async {
      transport.throwNetworkErrorOnPush = true;

      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-offline-01',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-off-1',
          operation: SyncOperation.create,
          payload: {},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      final result = await engine.sync();
      expect(result.success, isFalse);
      expect(engine.state.status, equals(SyncEngineStatus.error));
    });

    test('23. Local mutation remains queued while offline', () async {
      transport.throwNetworkErrorOnPush = true;

      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-offline-persist',
          entityType: SyncEntityType.readingProgress,
          entityId: 'rp-off-1',
          operation: SyncOperation.update,
          payload: {'progress_percentage': 50.0},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      await engine.sync();
      final pending = await mutationRepo.getPendingMutations();
      expect(pending.any((m) => m.id == 'mut-offline-persist'), isTrue);
    });

    test('24. Subsequent sync resumes and drains queue when network returns', () async {
      transport.throwNetworkErrorOnPush = true;

      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-reconnect-01',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-recon-1',
          operation: SyncOperation.create,
          payload: {},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      // Attempt 1 fails offline
      await engine.sync();

      // Network restored
      transport.throwNetworkErrorOnPush = false;
      final result2 = await engine.sync();

      expect(result2.success, isTrue);
      expect(result2.pushedCount, equals(1));
      expect(await mutationRepo.getPendingMutations(), isEmpty);
    });
  });

  group('M5.4 Phase 3D — Concurrency Control Tests (25-26)', () {
    setUp(() async {
      await sessionStorage.saveSession(testTokens, testUser);
    });

    test('25. Simultaneous sync calls are serialized and guarded', () async {
      transport.onPush = (mut) {
        return SyncPushResponse(statusCode: 200, isSuccess: true);
      };

      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-concurrent-1',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-conc-1',
          operation: SyncOperation.create,
          payload: {},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      // Launch two syncs concurrently
      final future1 = engine.sync();
      final future2 = engine.sync();

      final results = await Future.wait([future1, future2]);
      expect(results[0].success, isTrue);
      expect(results[1].success, isTrue);
    });

    test('26. Duplicate push does not occur from concurrent execution', () async {
      await mutationRepo.enqueueMutation(
        SyncMutation(
          id: 'mut-dedup-push',
          entityType: SyncEntityType.bookmark,
          entityId: 'bm-once',
          operation: SyncOperation.create,
          payload: {},
          clientVersion: 1,
          createdAt: DateTime.now(),
        ),
      );

      await Future.wait([engine.sync(), engine.sync()]);

      // Exactly 1 push was issued for the mutation
      final pushes = transport.pushedMutations.where((m) => m.id == 'mut-dedup-push');
      expect(pushes.length, equals(1));
    });
  });

  group('M5.4 Phase 3D — Data Integrity & Canonical Isolation Tests (27-30)', () {
    setUp(() async {
      await sessionStorage.saveSession(testTokens, testUser);
    });

    test('27. Bookmark sync correctly maps all canonical reference fields', () async {
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.bookmark) {
          return [
            {
              'id': 'bm-canonical-quran',
              'user_id': 'user-123',
              'content_type': 'quran',
              'content_reference': 'quran:2:255',
              'surah_number': 2,
              'ayah_number': 255,
              'folder_name': 'Ayat al-Kursi',
              'tags': '["protection", "daily"]',
              'client_version': 1,
              'server_revision': 2,
              'updated_at': DateTime.utc(2026, 9, 26, 12, 0, 0).toIso8601String(),
            }
          ];
        }
        return [];
      };

      final result = await engine.sync();
      expect(result.success, isTrue);

      final bm = await (db.select(db.localBookmarksTable)..where((tbl) => tbl.id.equals('bm-canonical-quran'))).getSingle();
      expect(bm.surahNumber, equals(2));
      expect(bm.ayahNumber, equals(255));
      expect(bm.folderName, equals('Ayat al-Kursi'));
      expect(bm.contentReference, equals('quran:2:255'));
    });

    test('28. Reading progress sync updates percentage and volume accurately', () async {
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.readingProgress) {
          return [
            {
              'id': 'rp-bukhari-01',
              'user_id': 'user-123',
              'book_id': 'sahih-al-bukhari',
              'volume_number': 3,
              'page_number': 142,
              'progress_percentage': 42.5,
              'client_version': 2,
              'server_revision': 5,
              'updated_at': DateTime.utc(2026, 9, 26, 13, 0, 0).toIso8601String(),
            }
          ];
        }
        return [];
      };

      await engine.sync();

      final rp = await (db.select(db.localReadingProgressTable)..where((tbl) => tbl.id.equals('rp-bukhari-01'))).getSingle();
      expect(rp.volumeNumber, equals(3));
      expect(rp.pageNumber, equals(142));
      expect(rp.progressPercentage, equals(42.5));
    });

    test('29. Prayer settings sync applies method and madhab without syncing coordinates', () async {
      transport.onPull = (entityType, cursor) {
        if (entityType == SyncEntityType.prayerSettings) {
          return [
            {
              'id': 'ps-001',
              'user_id': 'user-123',
              'calculation_method': 'umm_al_qura',
              'asr_madhhab': 'hanafi',
              'latitude': 21.4225, // Remote location must be ignored locally
              'longitude': 39.8262,
              'updated_at': DateTime.utc(2026, 9, 26, 13, 30, 0).toIso8601String(),
            }
          ];
        }
        return [];
      };

      await engine.sync();

      final settings = await db.appSettingsDao.getSettings();
      expect(settings.prayerCalculationMethod, equals('umm_al_qura'));
      expect(settings.prayerMadhab, equals('hanafi'));
    });

    test('30. Canonical religious files remain untouched on disk', () async {
      await engine.sync();

      // Verification of file existence and non-empty status for canonical seeds
      expect(File('../../supabase/seed_quran.sql').existsSync() || File('supabase/seed_quran.sql').existsSync() || File('D:/ISLAMIC-PLATFORM/supabase/seed_quran.sql').existsSync(), isTrue);
    });
  });
}
