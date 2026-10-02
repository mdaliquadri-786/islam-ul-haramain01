import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'diagnostic_models.dart';

/// Abstract transport contract for transmitting diagnostic records to remote telemetry gateway.
abstract class DiagnosticTransport {
  /// Sends a bounded batch of diagnostic events.
  /// Returns `true` if transmission succeeded and was ACKed by the server.
  Future<bool> sendBatch(List<DiagnosticEvent> events);
}

/// HTTP REST implementation of [DiagnosticTransport] using standard pure Dart `http.Client`.
/// Enforces bounded batching, correlation header propagation, timeout bounds, and fail-silent error handling.
class HttpDiagnosticTransport implements DiagnosticTransport {
  static const int maxBatchSize = 10;
  static const Duration requestTimeout = Duration(seconds: 5);

  final AppConfig config;
  final http.Client _client;

  HttpDiagnosticTransport({
    required this.config,
    http.Client? client,
  }) : _client = client ?? http.Client();

  @override
  Future<bool> sendBatch(List<DiagnosticEvent> events) async {
    if (events.isEmpty) return true;

    try {
      final batch = events.take(maxBatchSize).toList();
      final uri = Uri.parse('${config.supabaseUrl}/api/diagnostics');

      // Use correlation ID of first event or fallback to session ID
      final correlationId = batch.first.correlationId ?? batch.first.anonymousSessionId;

      final body = jsonEncode({
        'events': batch.map((e) => e.toJson()).toList(),
      });

      final response = await _client
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'apikey': config.supabaseAnonKey,
              'X-Correlation-ID': correlationId,
            },
            body: body,
          )
          .timeout(requestTimeout);

      // 200 OK or 204 No Content indicates successful receipt and processing
      return response.statusCode == 200 || response.statusCode == 204;
    } catch (_) {
      // Swallowed safely: Network failures must never disrupt user experience or UI thread
      return false;
    }
  }
}
