import 'package:drift/drift.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../config/app_config.dart';
import '../database/database_providers.dart';
import '../database/daos/user_state_dao.dart';
import '../database/app_database.dart';
import 'auth_models.dart';
import 'secure_session_storage.dart';
import 'supabase_auth_client.dart';

/// Application configuration provider.
final appConfigProvider = Provider<AppConfig>((ref) {
  return AppConfig.fromEnvironment();
});

/// Secure session storage provider (Hardware KeyStore / Keychain).
final sessionStorageProvider = Provider<SessionStorage>((ref) {
  return SecureSessionStorage();
});

/// Supabase Auth REST Client provider.
final supabaseAuthClientProvider = Provider<SupabaseAuthClient>((ref) {
  final config = ref.watch(appConfigProvider);
  return SupabaseAuthClient(config: config);
});

/// Reactive Authentication State Notifier Provider.
final authNotifierProvider =
    StateNotifierProvider<AuthNotifier, SessionState>((ref) {
  final authClient = ref.watch(supabaseAuthClientProvider);
  final storage = ref.watch(sessionStorageProvider);
  final userStateDao = ref.watch(userStateDaoProvider);

  final notifier = AuthNotifier(
    authClient: authClient,
    sessionStorage: storage,
    userStateDao: userStateDao,
  );

  // Restore existing session asynchronously on startup
  notifier.restoreSession();

  return notifier;
});

/// Convenience selector for authentication status.
final isAuthenticatedProvider = Provider<bool>((ref) {
  final session = ref.watch(authNotifierProvider);
  return session.isAuthenticated;
});

/// Convenience selector for current user identity.
final currentUserProvider = Provider<AuthUser?>((ref) {
  final session = ref.watch(authNotifierProvider);
  return session.user;
});

/// Convenience selector for offline/guest state.
final isGuestProvider = Provider<bool>((ref) {
  final session = ref.watch(authNotifierProvider);
  return session.isGuest;
});

/// Convenience selector for session credentials.
final authTokensProvider = Provider<AuthTokens?>((ref) {
  final session = ref.watch(authNotifierProvider);
  return session.tokens;
});

/// Central state notifier managing the authentication lifecycle.
class AuthNotifier extends StateNotifier<SessionState> {
  final SupabaseAuthClient _authClient;
  final SessionStorage _sessionStorage;
  final UserStateDao _userStateDao;
  final Uuid _uuid;

  AuthNotifier({
    required this._authClient,
    required this._sessionStorage,
    required this._userStateDao,
    Uuid? uuid,
  })  : _uuid = uuid ?? const Uuid(),
        super(const SessionState.initial());

  /// Restores persisted session from secure storage upon app startup.
  Future<void> restoreSession() async {
    state = const SessionState.restoring();

    try {
      final tokens = await _sessionStorage.getTokens();
      final user = await _sessionStorage.getUser();

      if (tokens != null && user != null) {
        // Check if access token is expired or expiring within 5 minutes
        if (tokens.isExpiringSoon) {
          try {
            final (newTokens, newUser) = await _authClient.refreshToken(
              refreshToken: tokens.refreshToken,
            );
            await _sessionStorage.saveSession(newTokens, newUser);
            await _syncUserStateCache(newUser);
            state = SessionState.authenticated(user: newUser, tokens: newTokens);
            return;
          } catch (e) {
            // Refresh token revoked or expired -> clear session
            await _sessionStorage.clearSession();
            await _userStateDao.clearAllUsers();
            state = const SessionState.unauthenticated();
            return;
          }
        }

        await _syncUserStateCache(user);
        state = SessionState.authenticated(user: user, tokens: tokens);
        return;
      }

      // Check local database for guest profile
      final localUser = await _userStateDao.getCurrentUser();
      if (localUser != null && localUser.isAnonymous) {
        state = const SessionState.unauthenticated(isGuest: true);
        return;
      }

      state = const SessionState.unauthenticated();
    } catch (_) {
      state = const SessionState.unauthenticated();
    }
  }

  /// Signs in with email and password.
  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    state = const SessionState.restoring();

    try {
      final (tokens, user) = await _authClient.signInWithPassword(
        email: email,
        password: password,
      );

      await _sessionStorage.saveSession(tokens, user);
      await _syncUserStateCache(user);

      state = SessionState.authenticated(user: user, tokens: tokens);
    } on AuthException catch (e) {
      state = SessionState.error(e);
      rethrow;
    } catch (e) {
      final error = AuthException(
        message: 'Unexpected authentication error: $e',
        errorType: AuthErrorType.unknown,
        cause: e,
      );
      state = SessionState.error(error);
      rethrow;
    }
  }

  /// Registers a new user account.
  Future<AuthUser> signUp({
    required String email,
    required String password,
    String? displayName,
  }) async {
    state = const SessionState.restoring();

    try {
      final (tokens, user) = await _authClient.signUp(
        email: email,
        password: password,
        displayName: displayName,
      );

      if (tokens != null) {
        await _sessionStorage.saveSession(tokens, user);
        await _syncUserStateCache(user);
        state = SessionState.authenticated(user: user, tokens: tokens);
      } else {
        // Confirmation email required
        state = const SessionState.unauthenticated();
      }

      return user;
    } on AuthException catch (e) {
      state = SessionState.error(e);
      rethrow;
    } catch (e) {
      final error = AuthException(
        message: 'Registration failure: $e',
        errorType: AuthErrorType.unknown,
        cause: e,
      );
      state = SessionState.error(error);
      rethrow;
    }
  }

  /// Activates device-local guest mode with an anonymous session.
  Future<void> continueAsGuest() async {
    await _sessionStorage.clearSession();

    final guestId = _uuid.v4();
    await _userStateDao.saveUser(
      LocalUserStateTableCompanion(
        id: Value(guestId),
        email: const Value(null),
        displayName: const Value('Guest User'),
        role: const Value('guest'),
        isAnonymous: const Value(true),
        createdAt: Value(DateTime.now()),
        updatedAt: Value(DateTime.now()),
      ),
    );

    state = const SessionState.unauthenticated(isGuest: true);
  }

  /// Proactively or reactively refreshes the active session tokens.
  Future<bool> refreshToken() async {
    final currentTokens = state.tokens;
    if (currentTokens == null) return false;

    try {
      final (newTokens, newUser) = await _authClient.refreshToken(
        refreshToken: currentTokens.refreshToken,
      );

      await _sessionStorage.saveSession(newTokens, newUser);
      await _syncUserStateCache(newUser);

      state = SessionState.authenticated(user: newUser, tokens: newTokens);
      return true;
    } on AuthException catch (e) {
      if (e.errorType == AuthErrorType.tokenExpired ||
          e.errorType == AuthErrorType.invalidCredentials) {
        await signOut();
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /// Signs out of the authenticated account and purges secure credentials.
  Future<void> signOut() async {
    final currentToken = state.tokens?.accessToken;

    if (currentToken != null) {
      await _authClient.signOut(accessToken: currentToken);
    }

    await _sessionStorage.clearSession();
    await _userStateDao.clearAllUsers();

    state = const SessionState.unauthenticated();
  }

  /// Caches the authenticated user profile in the local SQLite UserState table.
  Future<void> _syncUserStateCache(AuthUser user) async {
    await _userStateDao.saveUser(
      LocalUserStateTableCompanion(
        id: Value(user.id),
        email: Value(user.email),
        displayName: Value(user.displayName),
        avatarUrl: Value(user.avatarUrl),
        role: Value(user.role),
        isAnonymous: const Value(false),
        updatedAt: Value(DateTime.now()),
      ),
    );
  }
}
