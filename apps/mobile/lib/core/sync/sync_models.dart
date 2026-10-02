import 'package:flutter/foundation.dart';

/// Entity types supported by the cross-platform synchronization protocol.
enum SyncEntityType {
  bookmark('bookmark'),
  readingProgress('reading_progress'),
  prayerSettings('prayer_settings');

  final String value;
  const SyncEntityType(this.value);

  static SyncEntityType fromString(String val) {
    return SyncEntityType.values.firstWhere(
      (e) => e.value == val,
      orElse: () => throw ArgumentError('Unknown SyncEntityType: $val'),
    );
  }
}

/// CRUD operations performed on synchronizable entities.
enum SyncOperation {
  create('INSERT'),
  update('UPDATE'),
  delete('DELETE');

  final String value;
  const SyncOperation(this.value);

  static SyncOperation fromString(String val) {
    final upper = val.toUpperCase();
    return SyncOperation.values.firstWhere(
      (e) => e.value == upper || e.name.toUpperCase() == upper,
      orElse: () => throw ArgumentError('Unknown SyncOperation: $val'),
    );
  }
}

/// Lifecycle status of an individual sync mutation.
enum SyncStatus {
  pending('pending'),
  inProgress('in_progress'),
  acknowledged('acknowledged'),
  conflict('conflict'),
  rejected('rejected'),
  retryableFailure('retryable_failure'),
  permanentFailure('permanent_failure');

  final String value;
  const SyncStatus(this.value);

  static SyncStatus fromString(String val) {
    return SyncStatus.values.firstWhere(
      (e) => e.value == val || e.name == val,
      orElse: () => throw ArgumentError('Unknown SyncStatus: $val'),
    );
  }
}

/// Keyset pagination cursor representing position in server changelog.
/// Formed by composite tuple (cursor_updated_at, cursor_id).
@immutable
class SyncCursor {
  final SyncEntityType entityType;
  final DateTime updatedAt;
  final String id;
  final DateTime? lastSyncCompletedAt;

  const SyncCursor({
    required this.entityType,
    required this.updatedAt,
    required this.id,
    this.lastSyncCompletedAt,
  });

  Map<String, dynamic> toJson() => {
    'entityType': entityType.value,
    'cursorUpdatedAt': updatedAt.toIso8601String(),
    'cursorId': id,
    'lastSyncCompletedAt': lastSyncCompletedAt?.toIso8601String(),
  };

  factory SyncCursor.fromJson(Map<String, dynamic> json) {
    return SyncCursor(
      entityType: SyncEntityType.fromString(json['entityType'] as String),
      updatedAt: DateTime.parse(json['cursorUpdatedAt'] as String),
      id: json['cursorId'] as String,
      lastSyncCompletedAt: json['lastSyncCompletedAt'] != null
          ? DateTime.parse(json['lastSyncCompletedAt'] as String)
          : null,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SyncCursor &&
          runtimeType == other.runtimeType &&
          entityType == other.entityType &&
          updatedAt == other.updatedAt &&
          id == other.id;

  @override
  int get hashCode => Object.hash(entityType, updatedAt, id);

  @override
  String toString() =>
      'SyncCursor(entityType: ${entityType.value}, updatedAt: $updatedAt, id: $id)';
}

/// Individual mutation logged for push synchronization.
@immutable
class SyncMutation {
  final String id;
  final SyncEntityType entityType;
  final String entityId;
  final SyncOperation operation;
  final Map<String, dynamic> payload;
  final int clientVersion;
  final DateTime createdAt;
  final int retryCount;
  final SyncStatus status;
  final String? lastError;

  const SyncMutation({
    required this.id,
    required this.entityType,
    required this.entityId,
    required this.operation,
    required this.payload,
    required this.clientVersion,
    required this.createdAt,
    this.retryCount = 0,
    this.status = SyncStatus.pending,
    this.lastError,
  });

  SyncMutation copyWith({
    String? id,
    SyncEntityType? entityType,
    String? entityId,
    SyncOperation? operation,
    Map<String, dynamic>? payload,
    int? clientVersion,
    DateTime? createdAt,
    int? retryCount,
    SyncStatus? status,
    String? lastError,
  }) {
    return SyncMutation(
      id: id ?? this.id,
      entityType: entityType ?? this.entityType,
      entityId: entityId ?? this.entityId,
      operation: operation ?? this.operation,
      payload: payload ?? this.payload,
      clientVersion: clientVersion ?? this.clientVersion,
      createdAt: createdAt ?? this.createdAt,
      retryCount: retryCount ?? this.retryCount,
      status: status ?? this.status,
      lastError: lastError ?? this.lastError,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'entityType': entityType.value,
    'entityId': entityId,
    'operation': operation.value,
    'payload': payload,
    'clientVersion': clientVersion,
    'createdAt': createdAt.toIso8601String(),
    'retryCount': retryCount,
    'status': status.value,
    'lastError': lastError,
  };

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SyncMutation &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'SyncMutation(id: $id, entityType: ${entityType.value}, op: ${operation.value}, ver: $clientVersion)';
}

/// Represents a detected conflict between local mutation and server state.
@immutable
class SyncConflict {
  final String mutationId;
  final SyncEntityType entityType;
  final String entityId;
  final int clientVersion;
  final int serverVersion;
  final Map<String, dynamic> clientData;
  final Map<String, dynamic> serverData;
  final String conflictReason;

  const SyncConflict({
    required this.mutationId,
    required this.entityType,
    required this.entityId,
    required this.clientVersion,
    required this.serverVersion,
    required this.clientData,
    required this.serverData,
    required this.conflictReason,
  });

  @override
  String toString() =>
      'SyncConflict(entity: ${entityType.value}:$entityId, clientVer: $clientVersion, serverVer: $serverVersion, reason: $conflictReason)';
}

/// Typed error classification for sync engine failures.
enum SyncErrorType {
  unauthenticated,
  authenticationExpired,
  networkUnavailable,
  timeout,
  serverError,
  invalidServerResponse,
  conflict,
  validationFailure,
  localDatabaseFailure,
  cancelled,
  partialSync,
  unknown,
}

/// Typed exception representing synchronization failure.
@immutable
class SyncException implements Exception {
  final String message;
  final SyncErrorType errorType;
  final int? statusCode;
  final Object? cause;

  const SyncException({
    required this.message,
    required this.errorType,
    this.statusCode,
    this.cause,
  });

  @override
  String toString() => 'SyncException($errorType, status: $statusCode): $message';
}

/// Lifecycle state for SyncEngine.
enum SyncEngineStatus {
  idle,
  syncing,
  error,
}

/// Immutable state representation for the reactive sync engine.
@immutable
class SyncEngineState {
  final SyncEngineStatus status;
  final SyncResult? lastResult;
  final SyncException? lastError;
  final DateTime? lastSyncTime;

  const SyncEngineState({
    this.status = SyncEngineStatus.idle,
    this.lastResult,
    this.lastError,
    this.lastSyncTime,
  });

  SyncEngineState copyWith({
    SyncEngineStatus? status,
    SyncResult? lastResult,
    SyncException? lastError,
    DateTime? lastSyncTime,
  }) {
    return SyncEngineState(
      status: status ?? this.status,
      lastResult: lastResult ?? this.lastResult,
      lastError: lastError,
      lastSyncTime: lastSyncTime ?? this.lastSyncTime,
    );
  }
}

/// Summary result of a sync cycle (push/pull execution).
@immutable
class SyncResult {
  final bool success;
  final int pushedCount;
  final int pulledCount;
  final int conflictCount;
  final List<String> errors;
  final List<SyncConflict> conflicts;
  final DateTime timestamp;

  const SyncResult({
    required this.success,
    this.pushedCount = 0,
    this.pulledCount = 0,
    this.conflictCount = 0,
    this.errors = const [],
    this.conflicts = const [],
    required this.timestamp,
  });

  factory SyncResult.success({
    int pushedCount = 0,
    int pulledCount = 0,
    int conflictCount = 0,
    List<SyncConflict> conflicts = const [],
  }) {
    return SyncResult(
      success: true,
      pushedCount: pushedCount,
      pulledCount: pulledCount,
      conflictCount: conflictCount,
      errors: const [],
      conflicts: conflicts,
      timestamp: DateTime.now(),
    );
  }

  factory SyncResult.failure(List<String> errors, {List<SyncConflict> conflicts = const []}) {
    return SyncResult(
      success: false,
      errors: errors,
      conflicts: conflicts,
      timestamp: DateTime.now(),
    );
  }

  @override
  String toString() =>
      'SyncResult(success: $success, pushed: $pushedCount, pulled: $pulledCount, conflicts: $conflictCount, errors: ${errors.length})';
}

