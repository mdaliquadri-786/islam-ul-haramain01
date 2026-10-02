import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'auth_models.dart';

/// Abstract contract for secure session credentials persistence.
abstract class SessionStorage {
  Future<void> saveTokens(AuthTokens tokens);
  Future<AuthTokens?> getTokens();
  Future<void> saveUser(AuthUser user);
  Future<AuthUser?> getUser();
  Future<void> saveSession(AuthTokens tokens, AuthUser user);
  Future<void> clearSession();
  Future<bool> hasValidSession();
}

/// Hardware-backed secure storage implementation using Keychain (iOS) and KeyStore (Android).
class SecureSessionStorage implements SessionStorage {
  static const String _keyAccessToken = 'sb_auth_access_token_v1';
  static const String _keyRefreshToken = 'sb_auth_refresh_token_v1';
  static const String _keyExpiresAt = 'sb_auth_expires_at_v1';
  static const String _keyExpiresIn = 'sb_auth_expires_in_v1';
  static const String _keyUserJson = 'sb_auth_user_json_v1';

  final FlutterSecureStorage _storage;

  SecureSessionStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  @override
  Future<void> saveTokens(AuthTokens tokens) async {
    await _storage.write(key: _keyAccessToken, value: tokens.accessToken);
    await _storage.write(key: _keyRefreshToken, value: tokens.refreshToken);
    await _storage.write(key: _keyExpiresAt, value: tokens.expiresAt.toIso8601String());
    await _storage.write(key: _keyExpiresIn, value: tokens.expiresIn.toString());
  }

  @override
  Future<AuthTokens?> getTokens() async {
    final access = await _storage.read(key: _keyAccessToken);
    final refresh = await _storage.read(key: _keyRefreshToken);
    final expiresAtStr = await _storage.read(key: _keyExpiresAt);
    final expiresInStr = await _storage.read(key: _keyExpiresIn);

    if (access == null || refresh == null || expiresAtStr == null) {
      return null;
    }

    final expiresAt = DateTime.tryParse(expiresAtStr)?.toUtc() ??
        DateTime.now().toUtc().add(const Duration(hours: 1));
    final expiresIn = int.tryParse(expiresInStr ?? '') ?? 3600;

    return AuthTokens(
      accessToken: access,
      refreshToken: refresh,
      expiresAt: expiresAt,
      expiresIn: expiresIn,
    );
  }

  @override
  Future<void> saveUser(AuthUser user) async {
    await _storage.write(key: _keyUserJson, value: jsonEncode(user.toJson()));
  }

  @override
  Future<AuthUser?> getUser() async {
    final userJson = await _storage.read(key: _keyUserJson);
    if (userJson == null || userJson.isEmpty) {
      return null;
    }

    try {
      final map = jsonDecode(userJson) as Map<String, dynamic>;
      return AuthUser.fromJson(map);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> saveSession(AuthTokens tokens, AuthUser user) async {
    await saveTokens(tokens);
    await saveUser(user);
  }

  @override
  Future<void> clearSession() async {
    await _storage.delete(key: _keyAccessToken);
    await _storage.delete(key: _keyRefreshToken);
    await _storage.delete(key: _keyExpiresAt);
    await _storage.delete(key: _keyExpiresIn);
    await _storage.delete(key: _keyUserJson);
  }

  @override
  Future<bool> hasValidSession() async {
    final tokens = await getTokens();
    if (tokens == null) return false;
    return !tokens.isExpired;
  }
}

/// In-memory storage implementation for deterministic testing.
class InMemorySessionStorage implements SessionStorage {
  AuthTokens? _tokens;
  AuthUser? _user;

  @override
  Future<void> saveTokens(AuthTokens tokens) async {
    _tokens = tokens;
  }

  @override
  Future<AuthTokens?> getTokens() async {
    return _tokens;
  }

  @override
  Future<void> saveUser(AuthUser user) async {
    _user = user;
  }

  @override
  Future<AuthUser?> getUser() async {
    return _user;
  }

  @override
  Future<void> saveSession(AuthTokens tokens, AuthUser user) async {
    _tokens = tokens;
    _user = user;
  }

  @override
  Future<void> clearSession() async {
    _tokens = null;
    _user = null;
  }

  @override
  Future<bool> hasValidSession() async {
    if (_tokens == null) return false;
    return !_tokens!.isExpired;
  }
}
