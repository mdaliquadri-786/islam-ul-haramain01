import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import 'diagnostic_consent.dart';
import 'diagnostic_models.dart';
import 'diagnostic_ring_buffer.dart';
import 'diagnostic_scrubber.dart';
import 'diagnostic_transport.dart';

/// Central coordinator for mobile error recording, redaction, buffering, and consent-gated dispatch.
class DiagnosticService {
  final DiagnosticRingBuffer buffer;
  final DiagnosticConsentService consent;
  final DiagnosticTransport? transport;

  final String appVersion;
  final String buildNumber;
  final String anonymousSessionId;

  // Deduplication tracker to prevent double-logging from FlutterError & PlatformDispatcher
  String? _lastErrorFingerprint;
  DateTime? _lastErrorTimestamp;
  static const Duration _dedupWindow = Duration(milliseconds: 500);

  bool _isFlushing = false;

  DiagnosticService({
    DiagnosticRingBuffer? buffer,
    DiagnosticConsentService? consent,
    this.transport,
    this.appVersion = '0.1.0',
    this.buildNumber = '1',
    String? anonymousSessionId,
  })  : buffer = buffer ?? DiagnosticRingBuffer(),
        consent = consent ?? DiagnosticConsentService(),
        anonymousSessionId = anonymousSessionId ?? const Uuid().v4();

  /// Captures framework-level errors intercepted via `FlutterError.onError`.
  Future<void> recordFlutterError(FlutterErrorDetails details) async {
    try {
      final errorType = details.exception.runtimeType.toString();
      final rawMessage = details.exceptionAsString();
      final stackTrace = details.stack;

      await recordError(
        rawMessage,
        stackTrace: stackTrace,
        errorType: errorType,
      );
    } catch (_) {
      // Swallowed safely
    }
  }

  /// Captures uncaught asynchronous errors intercepted via `PlatformDispatcher.instance.onError`.
  Future<void> recordPlatformError(Object error, StackTrace stackTrace) async {
    try {
      final errorType = error.runtimeType.toString();
      final rawMessage = error.toString();

      await recordError(
        rawMessage,
        stackTrace: stackTrace,
        errorType: errorType,
      );
    } catch (_) {
      // Swallowed safely
    }
  }

  /// Records, sanitizes, and buffers an error event.
  /// Deduplicates identical errors occurring within a 500ms window.
  Future<void> recordError(
    Object error, {
    StackTrace? stackTrace,
    String? errorType,
    String? correlationId,
  }) async {
    try {
      final type = errorType ?? error.runtimeType.toString();
      final rawErrorStr = error.toString();

      // Deduplication check
      final fingerprint = '$type::$rawErrorStr';
      final now = DateTime.now();
      if (_lastErrorFingerprint == fingerprint &&
          _lastErrorTimestamp != null &&
          now.difference(_lastErrorTimestamp!) < _dedupWindow) {
        return; // Ignore duplicate
      }
      _lastErrorFingerprint = fingerprint;
      _lastErrorTimestamp = now;

      // Scrub error message and stack trace aggressively
      final sanitizedType = DiagnosticScrubber.sanitize(type);
      final rawStack = stackTrace != null ? stackTrace.toString() : '';
      final combinedStack = rawStack.isNotEmpty ? '$rawErrorStr\n$rawStack' : rawErrorStr;
      final sanitizedStack = DiagnosticScrubber.sanitize(combinedStack);

      final event = DiagnosticEvent.create(
        errorType: sanitizedType,
        sanitizedStackTrace: sanitizedStack,
        appVersion: appVersion,
        buildNumber: buildNumber,
        anonymousSessionId: anonymousSessionId,
        correlationId: correlationId != null ? DiagnosticScrubber.sanitize(correlationId) : null,
      );

      await buffer.add(event);

      // Attempt non-blocking dispatch if consent is explicitly active
      if (consent.isCrashReportingEnabled && transport != null) {
        // Fire and forget, never block caller
        unawaited(flushDiagnostics());
      }
    } catch (_) {
      // Fail safely: Never crash the calling application due to diagnostics
    }
  }

  /// Bounded non-blocking transmission of buffered diagnostic events.
  /// Operates ONLY if consent is true and a transport is provided.
  Future<void> flushDiagnostics() async {
    if (_isFlushing || transport == null) return;
    if (!consent.isCrashReportingEnabled) return;

    _isFlushing = true;
    try {
      final events = await buffer.getEvents();
      if (events.isEmpty) return;

      final success = await transport!.sendBatch(events);
      if (success) {
        // Only remove ACKed events from buffer
        final transmittedIds = events.take(HttpDiagnosticTransport.maxBatchSize).map((e) => e.id).toList();
        await buffer.removeEvents(transmittedIds);
      }
    } catch (_) {
      // Swallowed safely
    } finally {
      _isFlushing = false;
    }
  }
}
