import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';
import 'sync_models.dart';

/// Push result returned by the sync transport.
class SyncPushResponse {
  final int statusCode;
  final bool isSuccess;
  final bool isConflict;
  final bool isIdempotentReplay;
  final Map<String, dynamic>? responseData;
  final SyncConflict? conflict;
  final String? errorMessage;

  const SyncPushResponse({
    required this.statusCode,
    required this.isSuccess,
    this.isConflict = false,
    this.isIdempotentReplay = false,
    this.responseData,
    this.conflict,
    this.errorMessage,
  });
}

/// Abstract contract for sync transport communications with remote Supabase PostgREST.
abstract class SyncTransport {
  /// Pushes a single mutation to the remote server.
  Future<SyncPushResponse> pushMutation({
    required String accessToken,
    required SyncMutation mutation,
  });

  /// Pulls a keyset-paginated batch of records for an entity type.
  Future<List<Map<String, dynamic>>> pullPage({
    required String accessToken,
    required SyncEntityType entityType,
    required String userId,
    SyncCursor? cursor,
    int limit = 50,
  });
}

/// HTTP REST implementation of [SyncTransport] using pure Dart `http.Client`.
class HttpSyncTransport implements SyncTransport {
  final AppConfig config;
  final http.Client _client;

  HttpSyncTransport({
    required this.config,
    http.Client? client,
  })  : _client = client ?? http.Client();

  /// Maps entity type to the remote Supabase table name.
  String _tableNameForEntity(SyncEntityType type) {
    switch (type) {
      case SyncEntityType.bookmark:
        return 'bookmarks';
      case SyncEntityType.readingProgress:
        return 'user_reading_progress';
      case SyncEntityType.prayerSettings:
        return 'user_prayer_settings';
    }
  }

  Map<String, String> _buildHeaders({
    required String accessToken,
    String? clientMutationId,
    bool returnRepresentation = false,
  }) {
    final headers = {
      'apikey': config.supabaseAnonKey,
      'Authorization': 'Bearer $accessToken',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (clientMutationId != null) {
      headers['X-Client-Mutation-Id'] = clientMutationId;
    }
    if (returnRepresentation) {
      headers['Prefer'] = 'return=representation';
    }
    return headers;
  }

  @override
  Future<SyncPushResponse> pushMutation({
    required String accessToken,
    required SyncMutation mutation,
  }) async {
    final table = _tableNameForEntity(mutation.entityType);
    final baseUrl = Uri.parse(config.supabaseUrl);

    try {
      final headers = _buildHeaders(
        accessToken: accessToken,
        clientMutationId: mutation.id,
        returnRepresentation: true,
      );

      final payload = Map<String, dynamic>.from(mutation.payload);
      payload['client_version'] = mutation.clientVersion;
      payload['last_client_mutation_id'] = mutation.id;

      http.Response response;

      switch (mutation.operation) {
        case SyncOperation.create:
          final uri = baseUrl.replace(path: '/rest/v1/$table');
          response = await _client
              .post(
                uri,
                headers: headers,
                body: jsonEncode(payload),
              )
              .timeout(const Duration(seconds: 15));
          break;

        case SyncOperation.update:
          final uri = baseUrl.replace(
            path: '/rest/v1/$table',
            queryParameters: {'id': 'eq.${mutation.entityId}'},
          );
          response = await _client
              .patch(
                uri,
                headers: headers,
                body: jsonEncode(payload),
              )
              .timeout(const Duration(seconds: 15));
          break;

        case SyncOperation.delete:
          // In M5.4 Phase 3A protocol, deletes are represented as soft deletes with deleted_at timestamp
          final uri = baseUrl.replace(
            path: '/rest/v1/$table',
            queryParameters: {'id': 'eq.${mutation.entityId}'},
          );
          final deletePayload = {
            'deleted_at': DateTime.now().toUtc().toIso8601String(),
            'client_version': mutation.clientVersion,
            'last_client_mutation_id': mutation.id,
          };
          response = await _client
              .patch(
                uri,
                headers: headers,
                body: jsonEncode(deletePayload),
              )
              .timeout(const Duration(seconds: 15));
          break;
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        Map<String, dynamic>? data;
        try {
          final decoded = jsonDecode(response.body);
          if (decoded is List && decoded.isNotEmpty) {
            data = decoded.first as Map<String, dynamic>;
          } else if (decoded is Map<String, dynamic>) {
            data = decoded;
          }
        } catch (_) {}

        return SyncPushResponse(
          statusCode: response.statusCode,
          isSuccess: true,
          responseData: data,
        );
      }

      if (response.statusCode == 409) {
        // Conflict
        Map<String, dynamic> serverData = {};
        try {
          final decoded = jsonDecode(response.body);
          if (decoded is Map<String, dynamic>) {
            serverData = decoded;
          }
        } catch (_) {}

        final conflict = SyncConflict(
          mutationId: mutation.id,
          entityType: mutation.entityType,
          entityId: mutation.entityId,
          clientVersion: mutation.clientVersion,
          serverVersion: (serverData['client_version'] as num?)?.toInt() ?? 0,
          clientData: mutation.payload,
          serverData: serverData,
          conflictReason: serverData['message'] as String? ?? 'Version conflict detected',
        );

        return SyncPushResponse(
          statusCode: 409,
          isSuccess: false,
          isConflict: true,
          conflict: conflict,
          errorMessage: '409 Conflict: ${response.body}',
        );
      }

      if (response.statusCode == 401) {
        throw const SyncException(
          message: 'Authentication token expired or invalid',
          errorType: SyncErrorType.authenticationExpired,
          statusCode: 401,
        );
      }

      if (response.statusCode == 403) {
        return SyncPushResponse(
          statusCode: 403,
          isSuccess: false,
          errorMessage: '403 Forbidden: RLS check failed (${response.body})',
        );
      }

      return SyncPushResponse(
        statusCode: response.statusCode,
        isSuccess: false,
        errorMessage: 'Server returned HTTP ${response.statusCode}: ${response.body}',
      );
    } on SocketException catch (e) {
      throw SyncException(
        message: 'Network socket connection failed: $e',
        errorType: SyncErrorType.networkUnavailable,
        cause: e,
      );
    } on TimeoutException catch (e) {
      throw SyncException(
        message: 'Sync push request timed out: $e',
        errorType: SyncErrorType.timeout,
        cause: e,
      );
    } on SyncException {
      rethrow;
    } catch (e) {
      throw SyncException(
        message: 'Unexpected push error: $e',
        errorType: SyncErrorType.unknown,
        cause: e,
      );
    }
  }

  @override
  Future<List<Map<String, dynamic>>> pullPage({
    required String accessToken,
    required SyncEntityType entityType,
    required String userId,
    SyncCursor? cursor,
    int limit = 50,
  }) async {
    final table = _tableNameForEntity(entityType);
    final baseUrl = Uri.parse(config.supabaseUrl);

    final queryParams = <String, String>{
      'select': '*',
      'user_id': 'eq.$userId',
      'order': 'updated_at.asc,id.asc',
      'limit': '$limit',
    };

    if (cursor != null) {
      final isoTime = cursor.updatedAt.toUtc().toIso8601String();
      queryParams['or'] =
          '(updated_at.gt.$isoTime,and(updated_at.eq.$isoTime,id.gt.${cursor.id}))';
    }

    final uri = baseUrl.replace(
      path: '/rest/v1/$table',
      queryParameters: queryParams,
    );

    try {
      final headers = _buildHeaders(accessToken: accessToken);
      final response = await _client
          .get(uri, headers: headers)
          .timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        if (decoded is List) {
          return decoded.cast<Map<String, dynamic>>();
        }
        return [];
      }

      if (response.statusCode == 401) {
        throw const SyncException(
          message: 'Authentication token expired during pull',
          errorType: SyncErrorType.authenticationExpired,
          statusCode: 401,
        );
      }

      throw SyncException(
        message: 'Server returned HTTP ${response.statusCode}: ${response.body}',
        errorType: SyncErrorType.serverError,
        statusCode: response.statusCode,
      );
    } on SocketException catch (e) {
      throw SyncException(
        message: 'Network socket connection failed during pull: $e',
        errorType: SyncErrorType.networkUnavailable,
        cause: e,
      );
    } on TimeoutException catch (e) {
      throw SyncException(
        message: 'Sync pull request timed out: $e',
        errorType: SyncErrorType.timeout,
        cause: e,
      );
    } on SyncException {
      rethrow;
    } catch (e) {
      throw SyncException(
        message: 'Unexpected pull error: $e',
        errorType: SyncErrorType.unknown,
        cause: e,
      );
    }
  }
}
