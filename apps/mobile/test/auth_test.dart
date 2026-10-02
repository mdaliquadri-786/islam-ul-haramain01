import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:drift/native.dart';

import 'package:islamic_mobile/core/config/app_config.dart';
import 'package:islamic_mobile/core/database/app_database.dart';
import 'package:islamic_mobile/core/auth/auth_models.dart';
import 'package:islamic_mobile/core/auth/secure_session_storage.dart';
import 'package:islamic_mobile/core/auth/supabase_auth_client.dart';
import 'package:islamic_mobile/core/auth/auth_provider.dart';

/// Lightweight mock HTTP client using standard BaseClient contract.
class MockHttpClient extends http.BaseClient {
  final Future<http.Response> Function(http.BaseRequest request) handler;

  MockHttpClient(this.handler);

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    final response = await handler(request);
    return http.StreamedResponse(
      Stream.value(response.bodyBytes),
      response.statusCode,
      headers: response.headers,
      request: request,
    );
  }
}

void main() {
  const testConfig = AppConfig.forTesting();
  late AppDatabase db;
  late InMemorySessionStorage sessionStorage;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    sessionStorage = InMemorySessionStorage();
  });

  tearDown(() async {
    await db.close();
  });

  group('SecureSessionStorage Unit Tests', () {
    test('11. Save and read tokens successfully', () async {
      final tokens = AuthTokens(
        accessToken: 'test-access-token-123',
        refreshToken: 'test-refresh-token-456',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      );

      await sessionStorage.saveTokens(tokens);
      final retrieved = await sessionStorage.getTokens();

      expect(retrieved, isNotNull);
      expect(retrieved!.accessToken, equals('test-access-token-123'));
      expect(retrieved.refreshToken, equals('test-refresh-token-456'));
      expect(retrieved.isExpired, isFalse);
    });

    test('12. Read tokens when none are stored returns null', () async {
      final tokens = await sessionStorage.getTokens();
      expect(tokens, isNull);
      expect(await sessionStorage.hasValidSession(), isFalse);
    });

    test('13. Replace refreshed tokens updates stored credentials', () async {
      final initialTokens = AuthTokens(
        accessToken: 'initial-access',
        refreshToken: 'initial-refresh',
        expiresAt: DateTime.now().toUtc().add(const Duration(minutes: 10)),
        expiresIn: 600,
      );
      await sessionStorage.saveTokens(initialTokens);

      final refreshedTokens = AuthTokens(
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 2)),
        expiresIn: 7200,
      );
      await sessionStorage.saveTokens(refreshedTokens);

      final current = await sessionStorage.getTokens();
      expect(current!.accessToken, equals('new-access-token'));
      expect(current.refreshToken, equals('new-refresh-token'));
    });

    test('14. Clear tokens on logout wipes all session keys', () async {
      final tokens = AuthTokens(
        accessToken: 'token-to-clear',
        refreshToken: 'refresh-to-clear',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      );
      const user = AuthUser(id: 'user-to-clear', email: 'clear@test.com');

      await sessionStorage.saveSession(tokens, user);
      expect(await sessionStorage.getTokens(), isNotNull);
      expect(await sessionStorage.getUser(), isNotNull);

      await sessionStorage.clearSession();
      expect(await sessionStorage.getTokens(), isNull);
      expect(await sessionStorage.getUser(), isNull);
      expect(await sessionStorage.hasValidSession(), isFalse);
    });
  });

  group('SupabaseAuthClient Error Handling Tests', () {
    test('15. Network failure throws AuthException with networkError', () async {
      final client = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          throw const SocketException('Connection refused');
        }),
      );

      expect(
        () => client.signInWithPassword(email: 'test@example.com', password: 'password123'),
        throwsA(isA<AuthException>().having(
          (e) => e.errorType,
          'errorType',
          equals(AuthErrorType.networkError),
        )),
      );
    });

    test('16. HTTP 400 Invalid credentials throws invalidCredentials', () async {
      final client = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          return http.Response(
            jsonEncode({'error': 'invalid_grant', 'error_description': 'Invalid login credentials'}),
            400,
            headers: {'content-type': 'application/json'},
          );
        }),
      );

      expect(
        () => client.signInWithPassword(email: 'wrong@example.com', password: 'bad'),
        throwsA(isA<AuthException>().having(
          (e) => e.errorType,
          'errorType',
          equals(AuthErrorType.invalidCredentials),
        )),
      );
    });

    test('17. Malformed JSON response throws malformedResponse', () async {
      final client = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          return http.Response('<html><body>502 Bad Gateway</body></html>', 200);
        }),
      );

      expect(
        () => client.signInWithPassword(email: 'user@test.com', password: 'password123'),
        throwsA(isA<AuthException>().having(
          (e) => e.errorType,
          'errorType',
          equals(AuthErrorType.malformedResponse),
        )),
      );
    });
  });

  group('Authentication Lifecycle & Riverpod Notifier Tests', () {
    test('1. Initial unauthenticated state when storage is empty', () async {
      final authClient = SupabaseAuthClient(config: testConfig);
      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      await notifier.restoreSession();

      expect(notifier.state.status, equals(SessionStatus.unauthenticated));
      expect(notifier.state.isAuthenticated, isFalse);
      expect(notifier.state.isGuest, isFalse);
      expect(notifier.state.user, isNull);
      expect(notifier.state.tokens, isNull);
    });

    test('2. Successful sign-in updates state, storage, and UserStateDao', () async {
      final authClient = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'access_token': 'mock-access-token-jwt',
              'refresh_token': 'mock-refresh-token-val',
              'expires_in': 3600,
              'user': {
                'id': 'usr-uuid-1111-2222',
                'email': 'scholar@islamulharamain.org',
                'role': 'authenticated',
                'user_metadata': {'full_name': 'Abu Abdullah'},
              },
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }),
      );

      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      await notifier.signIn(email: 'scholar@islamulharamain.org', password: 'correct_password');

      expect(notifier.state.isAuthenticated, isTrue);
      expect(notifier.state.user?.id, equals('usr-uuid-1111-2222'));
      expect(notifier.state.user?.email, equals('scholar@islamulharamain.org'));
      expect(notifier.state.user?.displayName, equals('Abu Abdullah'));
      expect(notifier.state.tokens?.accessToken, equals('mock-access-token-jwt'));

      // Verify UserStateDao cache
      final localUser = await db.userStateDao.getCurrentUser();
      expect(localUser, isNotNull);
      expect(localUser!.id, equals('usr-uuid-1111-2222'));
      expect(localUser.isAnonymous, isFalse);
    });

    test('3. Failed sign-in sets error state and preserves unauthenticated', () async {
      final authClient = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          return http.Response(
            jsonEncode({'error': 'invalid_grant', 'message': 'Invalid login credentials'}),
            400,
            headers: {'content-type': 'application/json'},
          );
        }),
      );

      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      await expectLater(
        notifier.signIn(email: 'test@wrong.com', password: 'bad'),
        throwsA(isA<AuthException>()),
      );

      expect(notifier.state.hasError, isTrue);
      expect(notifier.state.isAuthenticated, isFalse);
      expect(notifier.state.error?.errorType, equals(AuthErrorType.invalidCredentials));
    });

    test('4 & 5. Session persistence and restoration upon app restart', () async {
      // Step A: Seed secure storage with existing valid session
      final validTokens = AuthTokens(
        accessToken: 'persisted-jwt-token',
        refreshToken: 'persisted-refresh-token',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 12)),
        expiresIn: 43200,
      );
      const user = AuthUser(
        id: 'usr-persisted-4444',
        email: 'saved@user.com',
        displayName: 'Saved User',
      );
      await sessionStorage.saveSession(validTokens, user);

      // Step B: Create fresh notifier and restore
      final authClient = SupabaseAuthClient(config: testConfig);
      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      await notifier.restoreSession();

      expect(notifier.state.isAuthenticated, isTrue);
      expect(notifier.state.user?.id, equals('usr-persisted-4444'));
      expect(notifier.state.tokens?.accessToken, equals('persisted-jwt-token'));

      // UserStateDao is synchronized
      final localUser = await db.userStateDao.getCurrentUser();
      expect(localUser?.id, equals('usr-persisted-4444'));
    });

    test('6. Successful token refresh updates tokens and keeps user authenticated', () async {
      final initialTokens = AuthTokens(
        accessToken: 'old-access-token',
        refreshToken: 'valid-refresh-token',
        expiresAt: DateTime.now().toUtc().add(const Duration(minutes: 2)), // expiring soon
        expiresIn: 120,
      );
      const user = AuthUser(id: 'usr-refresh-5555', email: 'ref@user.com');
      await sessionStorage.saveSession(initialTokens, user);

      final authClient = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          return http.Response(
            jsonEncode({
              'access_token': 'new-fresh-access-token',
              'refresh_token': 'new-fresh-refresh-token',
              'expires_in': 3600,
              'user': {'id': 'usr-refresh-5555', 'email': 'ref@user.com'},
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }),
      );

      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      await notifier.restoreSession();

      expect(notifier.state.isAuthenticated, isTrue);
      expect(notifier.state.tokens?.accessToken, equals('new-fresh-access-token'));
      expect(notifier.state.tokens?.refreshToken, equals('new-fresh-refresh-token'));
    });

    test('7. Failed token refresh on expired grant transitions to unauthenticated', () async {
      final expiredTokens = AuthTokens(
        accessToken: 'expired-access-token',
        refreshToken: 'revoked-refresh-token',
        expiresAt: DateTime.now().toUtc().subtract(const Duration(minutes: 10)), // expired
        expiresIn: 0,
      );
      const user = AuthUser(id: 'usr-revoked-6666', email: 'revoked@user.com');
      await sessionStorage.saveSession(expiredTokens, user);

      final authClient = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          return http.Response(
            jsonEncode({'error': 'invalid_grant', 'message': 'Refresh token has expired'}),
            400,
            headers: {'content-type': 'application/json'},
          );
        }),
      );

      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      await notifier.restoreSession();

      expect(notifier.state.isAuthenticated, isFalse);
      expect(await sessionStorage.getTokens(), isNull);
      expect(await db.userStateDao.getCurrentUser(), isNull);
    });

    test('8. Sign-out clears storage, local UserStateDao, and resets state', () async {
      final tokens = AuthTokens(
        accessToken: 'active-token-777',
        refreshToken: 'active-refresh-777',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      );
      const user = AuthUser(id: 'usr-active-777', email: 'active@user.com');
      await sessionStorage.saveSession(tokens, user);

      var remoteLogoutCalled = false;
      final authClient = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          if (request.url.path.contains('logout')) {
            remoteLogoutCalled = true;
          }
          return http.Response('', 204);
        }),
      );

      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      await notifier.restoreSession();
      expect(notifier.state.isAuthenticated, isTrue);

      await notifier.signOut();

      expect(remoteLogoutCalled, isTrue);
      expect(notifier.state.isAuthenticated, isFalse);
      expect(await sessionStorage.getTokens(), isNull);
      expect(await db.userStateDao.getCurrentUser(), isNull);
    });

    test('9. Account switch safely purges previous session before establishing new user', () async {
      var callCount = 0;
      final authClient = SupabaseAuthClient(
        config: testConfig,
        httpClient: MockHttpClient((request) async {
          callCount++;
          if (callCount == 1) {
            return http.Response(
              jsonEncode({
                'access_token': 'token-user-a',
                'refresh_token': 'refresh-user-a',
                'expires_in': 3600,
                'user': {'id': 'user-a-uuid', 'email': 'userA@test.com'},
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          } else {
            return http.Response(
              jsonEncode({
                'access_token': 'token-user-b',
                'refresh_token': 'refresh-user-b',
                'expires_in': 3600,
                'user': {'id': 'user-b-uuid', 'email': 'userB@test.com'},
              }),
              200,
              headers: {'content-type': 'application/json'},
            );
          }
        }),
      );

      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      // Sign in User A
      await notifier.signIn(email: 'userA@test.com', password: 'passA');
      expect(notifier.state.user?.id, equals('user-a-uuid'));
      expect((await db.userStateDao.getCurrentUser())?.id, equals('user-a-uuid'));

      // Logout User A
      await notifier.signOut();
      expect((await db.userStateDao.getCurrentUser()), isNull);

      // Sign in User B
      await notifier.signIn(email: 'userB@test.com', password: 'passB');
      expect(notifier.state.user?.id, equals('user-b-uuid'));
      expect((await db.userStateDao.getCurrentUser())?.id, equals('user-b-uuid'));
    });

    test('10. Guest / offline mode establishes anonymous local session without tokens', () async {
      final authClient = SupabaseAuthClient(config: testConfig);
      final notifier = AuthNotifier(
        authClient: authClient,
        sessionStorage: sessionStorage,
        userStateDao: db.userStateDao,
      );

      await notifier.continueAsGuest();

      expect(notifier.state.isAuthenticated, isFalse);
      expect(notifier.state.isGuest, isTrue);
      expect(await sessionStorage.getTokens(), isNull);

      final localUser = await db.userStateDao.getCurrentUser();
      expect(localUser, isNotNull);
      expect(localUser!.isAnonymous, isTrue);
      expect(localUser.role, equals('guest'));
    });
  });
}
