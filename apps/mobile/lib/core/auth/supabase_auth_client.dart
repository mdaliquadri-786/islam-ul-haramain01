import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'auth_models.dart';

/// Pure-Dart Supabase Authentication REST API Client.
/// Completely independent of supabase_flutter; operates over standard HTTP/1.1 REST.
class SupabaseAuthClient {
  final AppConfig _config;
  final http.Client _httpClient;
  final Duration _requestTimeout;

  SupabaseAuthClient({
    required this._config,
    http.Client? httpClient,
    this._requestTimeout = const Duration(seconds: 15),
  }) : _httpClient = httpClient ?? http.Client();

  Map<String, String> _buildHeaders({String? bearerToken}) {
    return {
      'apikey': _config.supabaseAnonKey,
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      if (bearerToken != null && bearerToken.isNotEmpty)
        'Authorization': 'Bearer $bearerToken',
    };
  }

  Uri _buildUri(String path, [Map<String, String>? queryParams]) {
    final base = _config.supabaseUrl.replaceAll(RegExp(r'/+$'), '');
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$base$cleanPath').replace(queryParameters: queryParams);
  }

  /// Signs in a user using email and password credentials.
  /// POST /auth/v1/token?grant_type=password
  Future<(AuthTokens, AuthUser)> signInWithPassword({
    required String email,
    required String password,
  }) async {
    final uri = _buildUri('/auth/v1/token', {'grant_type': 'password'});
    final payload = jsonEncode({
      'email': email.trim(),
      'password': password,
    });

    final response = await _executeRequest(
      () => _httpClient.post(uri, headers: _buildHeaders(), body: payload),
    );

    final map = _parseJsonResponse(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final tokens = AuthTokens.fromJson(map);
      final user = AuthUser.fromJson(map['user'] as Map<String, dynamic>);
      return (tokens, user);
    }

    throw _mapHttpError(response.statusCode, map);
  }

  /// Registers a new user account with email and password.
  /// POST /auth/v1/signup
  Future<(AuthTokens?, AuthUser)> signUp({
    required String email,
    required String password,
    String? displayName,
    Map<String, dynamic>? data,
  }) async {
    final uri = _buildUri('/auth/v1/signup');
    final metadata = <String, dynamic>{
      'full_name': ?displayName,
      ...?data,
    };

    final payload = jsonEncode({
      'email': email.trim(),
      'password': password,
      if (metadata.isNotEmpty) 'data': metadata,
    });

    final response = await _executeRequest(
      () => _httpClient.post(uri, headers: _buildHeaders(), body: payload),
    );

    final map = _parseJsonResponse(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      AuthTokens? tokens;
      if (map['access_token'] != null) {
        tokens = AuthTokens.fromJson(map);
      }
      final user = AuthUser.fromJson(
        (map['user'] as Map<String, dynamic>?) ?? map,
      );
      return (tokens, user);
    }

    throw _mapHttpError(response.statusCode, map);
  }

  /// Refreshes an expired access token using the stored refresh token.
  /// POST /auth/v1/token?grant_type=refresh_token
  Future<(AuthTokens, AuthUser)> refreshToken({
    required String refreshToken,
  }) async {
    final uri = _buildUri('/auth/v1/token', {'grant_type': 'refresh_token'});
    final payload = jsonEncode({
      'refresh_token': refreshToken,
    });

    final response = await _executeRequest(
      () => _httpClient.post(uri, headers: _buildHeaders(), body: payload),
    );

    final map = _parseJsonResponse(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final tokens = AuthTokens.fromJson(map);
      final user = AuthUser.fromJson(map['user'] as Map<String, dynamic>);
      return (tokens, user);
    }

    throw _mapHttpError(response.statusCode, map, isRefresh: true);
  }

  /// Signs out of the authenticated session by revoking the access token.
  /// POST /auth/v1/logout
  Future<void> signOut({required String accessToken}) async {
    final uri = _buildUri('/auth/v1/logout');
    try {
      await _executeRequest(
        () => _httpClient.post(
          uri,
          headers: _buildHeaders(bearerToken: accessToken),
        ),
      );
    } catch (_) {
      // Best-effort remote revocation; local session will still be purged
    }
  }

  /// Retrieves the current authenticated user's profile from Supabase Auth.
  /// GET /auth/v1/user
  Future<AuthUser> getCurrentUser({required String accessToken}) async {
    final uri = _buildUri('/auth/v1/user');
    final response = await _executeRequest(
      () => _httpClient.get(
        uri,
        headers: _buildHeaders(bearerToken: accessToken),
      ),
    );

    final map = _parseJsonResponse(response);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return AuthUser.fromJson(map);
    }

    throw _mapHttpError(response.statusCode, map);
  }

  Future<http.Response> _executeRequest(Future<http.Response> Function() action) async {
    try {
      return await action().timeout(_requestTimeout);
    } on SocketException catch (e) {
      throw AuthException(
        message: 'Network unreachable. Please verify internet connection.',
        errorType: AuthErrorType.networkError,
        cause: e,
      );
    } on TimeoutException catch (e) {
      throw AuthException(
        message: 'Authentication request timed out after ${_requestTimeout.inSeconds}s.',
        errorType: AuthErrorType.timeout,
        cause: e,
      );
    } on http.ClientException catch (e) {
      throw AuthException(
        message: 'Network client error: ${e.message}',
        errorType: AuthErrorType.networkError,
        cause: e,
      );
    }
  }

  Map<String, dynamic> _parseJsonResponse(http.Response response) {
    if (response.body.isEmpty) {
      return {};
    }
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        return decoded;
      }
      return {'data': decoded};
    } on FormatException catch (e) {
      throw AuthException(
        message: 'Malformed server response format.',
        errorType: AuthErrorType.malformedResponse,
        statusCode: response.statusCode,
        cause: e,
      );
    }
  }

  AuthException _mapHttpError(
    int statusCode,
    Map<String, dynamic> body, {
    bool isRefresh = false,
  }) {
    final rawMessage = body['msg'] ??
        body['message'] ??
        body['error_description'] ??
        body['error'] ??
        'Authentication error occurred ($statusCode)';
    final message = rawMessage.toString();

    if (statusCode == 400) {
      if (isRefresh || message.toLowerCase().contains('refresh')) {
        return AuthException(
          message: 'Session expired or refresh token revoked.',
          errorType: AuthErrorType.tokenExpired,
          statusCode: statusCode,
        );
      }
      return AuthException(
        message: 'Invalid credentials or request format.',
        errorType: AuthErrorType.invalidCredentials,
        statusCode: statusCode,
      );
    }

    if (statusCode == 401 || statusCode == 403) {
      return AuthException(
        message: 'Unauthorized access or expired credentials.',
        errorType: AuthErrorType.unauthorized,
        statusCode: statusCode,
      );
    }

    if (statusCode >= 500) {
      return AuthException(
        message: 'Supabase authentication service unavailable.',
        errorType: AuthErrorType.serverError,
        statusCode: statusCode,
      );
    }

    return AuthException(
      message: message,
      errorType: AuthErrorType.unknown,
      statusCode: statusCode,
    );
  }
}
