import 'package:flutter/foundation.dart';

/// Categorized authentication error classifications.
enum AuthErrorType {
  invalidCredentials,
  tokenExpired,
  networkError,
  timeout,
  malformedResponse,
  serverError,
  unauthorized,
  unknown,
}

/// Strongly-typed exception for Supabase authentication failures.
@immutable
class AuthException implements Exception {
  final String message;
  final AuthErrorType errorType;
  final int? statusCode;
  final Object? cause;

  const AuthException({
    required this.message,
    required this.errorType,
    this.statusCode,
    this.cause,
  });

  @override
  String toString() => 'AuthException($errorType, status: $statusCode): $message';
}

/// Authenticated user identity model.
@immutable
class AuthUser {
  final String id;
  final String? email;
  final String role;
  final String? displayName;
  final String? avatarUrl;
  final bool isAnonymous;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const AuthUser({
    required this.id,
    this.email,
    this.role = 'authenticated',
    this.displayName,
    this.avatarUrl,
    this.isAnonymous = false,
    this.createdAt,
    this.updatedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'role': role,
      'displayName': displayName,
      'avatarUrl': avatarUrl,
      'isAnonymous': isAnonymous,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      email: json['email'] as String?,
      role: (json['role'] as String?) ?? 'authenticated',
      displayName: (json['user_metadata'] is Map
              ? (json['user_metadata']['full_name'] ?? json['user_metadata']['name'])
              : null) ??
          (json['displayName'] as String?),
      avatarUrl: (json['user_metadata'] is Map
              ? json['user_metadata']['avatar_url']
              : null) ??
          (json['avatarUrl'] as String?),
      isAnonymous: (json['is_anonymous'] as bool?) ?? (json['isAnonymous'] as bool?) ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : (json['createdAt'] != null
              ? DateTime.tryParse(json['createdAt'] as String)
              : null),
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'] as String)
          : (json['updatedAt'] != null
              ? DateTime.tryParse(json['updatedAt'] as String)
              : null),
    );
  }

  AuthUser copyWith({
    String? id,
    String? email,
    String? role,
    String? displayName,
    String? avatarUrl,
    bool? isAnonymous,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return AuthUser(
      id: id ?? this.id,
      email: email ?? this.email,
      role: role ?? this.role,
      displayName: displayName ?? this.displayName,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      isAnonymous: isAnonymous ?? this.isAnonymous,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthUser &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          email == other.email &&
          role == other.role &&
          isAnonymous == other.isAnonymous;

  @override
  int get hashCode => Object.hash(id, email, role, isAnonymous);
}

/// OAuth / JWT session credentials returned by Supabase Auth REST service.
@immutable
class AuthTokens {
  final String accessToken;
  final String refreshToken;
  final DateTime expiresAt;
  final int expiresIn;
  final String tokenType;

  const AuthTokens({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresAt,
    required this.expiresIn,
    this.tokenType = 'bearer',
  });

  /// Whether the access token is currently expired.
  bool get isExpired => DateTime.now().toUtc().isAfter(expiresAt);

  /// Whether the access token expires within a 5-minute safety threshold.
  bool get isExpiringSoon =>
      DateTime.now().toUtc().add(const Duration(minutes: 5)).isAfter(expiresAt);

  Map<String, dynamic> toJson() {
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'expires_at': expiresAt.toIso8601String(),
      'expires_in': expiresIn,
      'token_type': tokenType,
    };
  }

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    final expiresIn = (json['expires_in'] as num?)?.toInt() ?? 3600;
    final expiresAt = json['expires_at'] != null
        ? (DateTime.tryParse(json['expires_at'] as String)?.toUtc() ??
            DateTime.now().toUtc().add(Duration(seconds: expiresIn)))
        : DateTime.now().toUtc().add(Duration(seconds: expiresIn));

    return AuthTokens(
      accessToken: (json['access_token'] as String?) ?? '',
      refreshToken: (json['refresh_token'] as String?) ?? '',
      expiresAt: expiresAt,
      expiresIn: expiresIn,
      tokenType: (json['token_type'] as String?) ?? 'bearer',
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AuthTokens &&
          runtimeType == other.runtimeType &&
          accessToken == other.accessToken &&
          refreshToken == other.refreshToken &&
          expiresAt == other.expiresAt;

  @override
  int get hashCode => Object.hash(accessToken, refreshToken, expiresAt);
}

/// Lifecycle status enumeration for authentication state.
enum SessionStatus {
  initial,
  restoring,
  authenticated,
  unauthenticated,
  error,
}

/// Strongly-typed immutable authentication session state.
@immutable
class SessionState {
  final SessionStatus status;
  final AuthUser? user;
  final AuthTokens? tokens;
  final bool isGuest;
  final AuthException? error;

  const SessionState._({
    required this.status,
    this.user,
    this.tokens,
    this.isGuest = false,
    this.error,
  });

  const SessionState.initial() : this._(status: SessionStatus.initial);

  const SessionState.restoring() : this._(status: SessionStatus.restoring);

  const SessionState.unauthenticated({bool isGuest = false})
      : this._(
          status: SessionStatus.unauthenticated,
          isGuest: isGuest,
        );

  const SessionState.authenticated({
    required AuthUser user,
    required AuthTokens tokens,
  }) : this._(
          status: SessionStatus.authenticated,
          user: user,
          tokens: tokens,
          isGuest: false,
        );

  const SessionState.error(
    AuthException error, {
    bool isGuest = false,
    AuthUser? previousUser,
  }) : this._(
          status: SessionStatus.error,
          error: error,
          isGuest: isGuest,
          user: previousUser,
        );

  bool get isAuthenticated => status == SessionStatus.authenticated && user != null && tokens != null;
  bool get isRestoring => status == SessionStatus.restoring;
  bool get hasError => status == SessionStatus.error && error != null;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SessionState &&
          runtimeType == other.runtimeType &&
          status == other.status &&
          user == other.user &&
          tokens == other.tokens &&
          isGuest == other.isGuest &&
          error == other.error;

  @override
  int get hashCode => Object.hash(status, user, tokens, isGuest, error);
}
