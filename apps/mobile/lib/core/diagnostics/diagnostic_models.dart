import 'package:uuid/uuid.dart';

/// Strongly typed, privacy-preserving diagnostic record.
/// Contains strictly anonymized operational metadata.
/// Free-form metadata maps, user identifiers, and religious queries are strictly forbidden.
class DiagnosticEvent {
  /// Unique identifier for this diagnostic record.
  final String id;

  /// UTC timestamp of the error event.
  final DateTime timestamp;

  /// Sanitized error category or runtime exception type name.
  final String errorType;

  /// Sanitized stack trace with all file paths, user data, and tokens scrubbed.
  final String sanitizedStackTrace;

  /// Application version name (e.g. '0.1.0').
  final String appVersion;

  /// Application build number (e.g. '1').
  final String buildNumber;

  /// Ephemeral, anonymous session identifier generated per app launch.
  /// Never tied to hardware IDs, IP addresses, or user accounts.
  final String anonymousSessionId;

  /// Optional correlation or request ID if associated with a network call.
  final String? correlationId;

  const DiagnosticEvent({
    required this.id,
    required this.timestamp,
    required this.errorType,
    required this.sanitizedStackTrace,
    required this.appVersion,
    required this.buildNumber,
    required this.anonymousSessionId,
    this.correlationId,
  });

  /// Factory constructor to create a new [DiagnosticEvent] with an auto-generated UUID v4.
  factory DiagnosticEvent.create({
    required String errorType,
    required String sanitizedStackTrace,
    required String appVersion,
    required String buildNumber,
    required String anonymousSessionId,
    String? correlationId,
    DateTime? timestamp,
    String? id,
  }) {
    return DiagnosticEvent(
      id: id ?? const Uuid().v4(),
      timestamp: (timestamp ?? DateTime.now()).toUtc(),
      errorType: errorType,
      sanitizedStackTrace: sanitizedStackTrace,
      appVersion: appVersion,
      buildNumber: buildNumber,
      anonymousSessionId: anonymousSessionId,
      correlationId: correlationId,
    );
  }

  /// Serializes strictly the allowed typed diagnostic fields.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'timestamp': timestamp.toIso8601String(),
      'errorType': errorType,
      'sanitizedStackTrace': sanitizedStackTrace,
      'appVersion': appVersion,
      'buildNumber': buildNumber,
      'anonymousSessionId': anonymousSessionId,
      if (correlationId != null) 'correlationId': correlationId,
    };
  }

  /// Deserializes a [DiagnosticEvent] from JSON.
  factory DiagnosticEvent.fromJson(Map<String, dynamic> json) {
    return DiagnosticEvent(
      id: json['id'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String).toUtc(),
      errorType: json['errorType'] as String? ?? 'UnknownError',
      sanitizedStackTrace: json['sanitizedStackTrace'] as String? ?? '',
      appVersion: json['appVersion'] as String? ?? '0.1.0',
      buildNumber: json['buildNumber'] as String? ?? '1',
      anonymousSessionId: json['anonymousSessionId'] as String? ?? '',
      correlationId: json['correlationId'] as String?,
    );
  }

  @override
  String toString() =>
      'DiagnosticEvent(id: $id, type: $errorType, ts: ${timestamp.toIso8601String()})';
}
