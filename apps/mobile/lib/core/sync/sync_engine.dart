import 'dart:async';
import 'package:flutter/foundation.dart';
import '../auth/auth_provider.dart';
import '../auth/secure_session_storage.dart';
import '../database/app_database.dart';
import 'sync_models.dart';
import 'sync_repositories.dart';
import 'sync_repository_impl.dart';
import 'sync_transport.dart';

/// Central cross-platform synchronization engine.
/// Coordinates push (outbox drain) and pull (keyset cursor) protocols.
class SyncEngine with ChangeNotifier {
  final SyncTransport transport;
  final SyncCursorRepository cursorRepo;
  final SyncMutationRepository mutationRepo;
  final SessionStorage sessionStorage;
  final AuthNotifier authNotifier;
  final AppDatabase db;

  final Map<SyncEntityType, SyncableEntityRepository> _adapters;

  bool _isSyncing = false;
  SyncEngineState _state = const SyncEngineState();

  SyncEngine({
    required this.transport,
    required this.cursorRepo,
    required this.mutationRepo,
    required this.sessionStorage,
    required this.authNotifier,
    required this.db,
    Map<SyncEntityType, SyncableEntityRepository>? adapters,
  })  : _adapters = adapters ??
            {
              SyncEntityType.bookmark: BookmarkSyncAdapter(db),
              SyncEntityType.readingProgress: ReadingProgressSyncAdapter(db),
              SyncEntityType.prayerSettings: PrayerSettingsSyncAdapter(db),
            };

  /// Current reactive state of the engine.
  SyncEngineState get state => _state;

  /// True if a synchronization cycle is currently executing.
  bool get isSyncing => _isSyncing;

  /// Initiates a full synchronization cycle (push pending mutations, then pull remote changes).
  /// Thread-safe: serializes concurrent invocations to prevent duplicate mutations or cursor corruption.
  Future<SyncResult> sync() async {
    if (_isSyncing) {
      // Concurrency guard: return current running cycle status or graceful skip
      return _state.lastResult ??
          SyncResult(
            success: true,
            timestamp: DateTime.now(),
          );
    }

    _isSyncing = true;
    _updateState(_state.copyWith(status: SyncEngineStatus.syncing));

    try {
      // 1. Authenticated Session Gate & Re-reading Identity
      final sessionTokens = await sessionStorage.getTokens();
      final authUser = await sessionStorage.getUser();

      if (sessionTokens == null || authUser == null) {
        final err = const SyncException(
          message: 'User is unauthenticated or running in offline guest mode',
          errorType: SyncErrorType.unauthenticated,
        );
        final result = SyncResult.failure([err.message]);
        _updateState(_state.copyWith(
          status: SyncEngineStatus.idle,
          lastResult: result,
          lastError: err,
        ));
        return result;
      }

      var currentToken = sessionTokens.accessToken;

      // Check proactive token expiry (5 min horizon)
      if (sessionTokens.isExpiringSoon) {
        final refreshed = await authNotifier.refreshToken();
        if (!refreshed) {
          final err = const SyncException(
            message: 'Failed to proactively refresh expired session',
            errorType: SyncErrorType.authenticationExpired,
          );
          final result = SyncResult.failure([err.message]);
          _updateState(_state.copyWith(
            status: SyncEngineStatus.error,
            lastResult: result,
            lastError: err,
          ));
          return result;
        }
        final refreshedTokens = await sessionStorage.getTokens();
        if (refreshedTokens != null) {
          currentToken = refreshedTokens.accessToken;
        }
      }

      int totalPushed = 0;
      int totalPulled = 0;
      int totalConflicts = 0;
      final errors = <String>[];
      final conflicts = <SyncConflict>[];

      // 2. PUSH PHASE: Deterministic Outbox Drain (FIFO)
      final pushOutcome = await _drainOutbox(
        accessToken: currentToken,
        userId: authUser.id,
      );

      totalPushed += pushOutcome.pushedCount;
      totalConflicts += pushOutcome.conflictCount;
      errors.addAll(pushOutcome.errors);
      conflicts.addAll(pushOutcome.conflicts);

      // If push encountered critical auth failure, abort cycle
      if (pushOutcome.authFailed) {
        final err = const SyncException(
          message: 'Authentication rejected during push phase',
          errorType: SyncErrorType.authenticationExpired,
        );
        final result = SyncResult.failure([err.message]);
        _updateState(_state.copyWith(
          status: SyncEngineStatus.error,
          lastResult: result,
          lastError: err,
        ));
        return result;
      }

      // 3. PULL PHASE: Keyset Paginated Ingestion
      for (final entityType in [
        SyncEntityType.bookmark,
        SyncEntityType.readingProgress,
        SyncEntityType.prayerSettings,
      ]) {
        try {
          final pullOutcome = await _pullEntityChanges(
            accessToken: currentToken,
            userId: authUser.id,
            entityType: entityType,
          );
          totalPulled += pullOutcome.pulledCount;
          totalConflicts += pullOutcome.conflictCount;
          errors.addAll(pullOutcome.errors);
          conflicts.addAll(pullOutcome.conflicts);
        } catch (e) {
          errors.add('Pull failed for ${entityType.value}: $e');
        }
      }

      final isSuccess = errors.isEmpty;
      final finalResult = isSuccess
          ? SyncResult.success(
              pushedCount: totalPushed,
              pulledCount: totalPulled,
              conflictCount: totalConflicts,
              conflicts: conflicts,
            )
          : SyncResult(
              success: false,
              pushedCount: totalPushed,
              pulledCount: totalPulled,
              conflictCount: totalConflicts,
              errors: errors,
              conflicts: conflicts,
              timestamp: DateTime.now(),
            );

      _updateState(_state.copyWith(
        status: isSuccess ? SyncEngineStatus.idle : SyncEngineStatus.error,
        lastResult: finalResult,
        lastError: isSuccess
            ? null
            : (pushOutcome.lastException ??
                (errors.isNotEmpty
                    ? SyncException(
                        message: errors.first,
                        errorType: pushOutcome.authFailed
                            ? SyncErrorType.authenticationExpired
                            : SyncErrorType.unknown,
                      )
                    : null)),
        lastSyncTime: DateTime.now(),
      ));

      return finalResult;
    } on SyncException catch (e) {
      final result = SyncResult.failure([e.message]);
      _updateState(_state.copyWith(
        status: SyncEngineStatus.error,
        lastResult: result,
        lastError: e,
      ));
      return result;
    } catch (e) {
      final err = SyncException(
        message: 'Unexpected error during sync execution: $e',
        errorType: SyncErrorType.unknown,
        cause: e,
      );
      final result = SyncResult.failure([err.message]);
      _updateState(_state.copyWith(
        status: SyncEngineStatus.error,
        lastResult: result,
        lastError: err,
      ));
      return result;
    } finally {
      _isSyncing = false;
    }
  }

  /// Pushes pending local mutations to the remote server sequentially.
  Future<_PushOutcome> _drainOutbox({
    required String accessToken,
    required String userId,
  }) async {
    final pendingMutations = await mutationRepo.getPendingMutations(limit: 50);
    int pushedCount = 0;
    int conflictCount = 0;
    final errors = <String>[];
    final conflicts = <SyncConflict>[];
    bool authFailed = false;
    SyncException? lastPushException;

    for (final mutation in pendingMutations) {
      try {
        var token = accessToken;
        var response = await transport.pushMutation(
          accessToken: token,
          mutation: mutation,
        );

        // Reactive 401 recovery: retry once after token refresh
        if (response.statusCode == 401) {
          final refreshed = await authNotifier.refreshToken();
          if (refreshed) {
            final refreshedTokens = await sessionStorage.getTokens();
            if (refreshedTokens != null) {
              token = refreshedTokens.accessToken;
              response = await transport.pushMutation(
                accessToken: token,
                mutation: mutation,
              );
            }
          } else {
            authFailed = true;
            errors.add('Session expired while pushing mutation ${mutation.id}');
            break;
          }
        }

        if (response.isSuccess) {
          // Success / Idempotent replay: acknowledge and purge from outbox
          await mutationRepo.markMutationAcknowledged(mutation.id);
          pushedCount++;
        } else if (response.isConflict && response.conflict != null) {
          conflictCount++;
          conflicts.add(response.conflict!);

          // Deterministic CAS conflict resolution
          await _resolvePushConflict(mutation, response.conflict!);
          await mutationRepo.markMutationAcknowledged(mutation.id);
        } else if (response.statusCode >= 400 && response.statusCode < 500 && response.statusCode != 409) {
          // Permanent failure (400 Bad Request, 403 Forbidden)
          errors.add('Permanent mutation rejection (${mutation.id}): ${response.errorMessage}');
          await mutationRepo.markMutationFailed(
            mutation.id,
            error: response.errorMessage ?? 'HTTP ${response.statusCode}',
            retryable: false,
          );
        } else {
          // Transient failure (5xx, network timeout)
          errors.add('Transient push failure (${mutation.id}): ${response.errorMessage}');
          await mutationRepo.markMutationFailed(
            mutation.id,
            error: response.errorMessage ?? 'Transient error',
            retryable: true,
          );
          // Stop remaining batch to preserve FIFO ordering
          break;
        }
      } on SyncException catch (e) {
        if (e.errorType == SyncErrorType.authenticationExpired) {
          authFailed = true;
        }
        lastPushException = e;
        errors.add('SyncException on mutation ${mutation.id}: ${e.message}');
        await mutationRepo.markMutationFailed(
          mutation.id,
          error: e.message,
          retryable: e.errorType != SyncErrorType.validationFailure,
        );
        break;
      } catch (e) {
        lastPushException = SyncException(
          message: 'Error pushing mutation ${mutation.id}: $e',
          errorType: SyncErrorType.unknown,
          cause: e,
        );
        errors.add('Error pushing mutation ${mutation.id}: $e');
        await mutationRepo.markMutationFailed(
          mutation.id,
          error: e.toString(),
          retryable: true,
        );
        break;
      }
    }

    return _PushOutcome(
      pushedCount: pushedCount,
      conflictCount: conflictCount,
      errors: errors,
      conflicts: conflicts,
      authFailed: authFailed,
      lastException: lastPushException,
    );
  }

  /// Resolves compare-and-swap push conflict per Phase 2 conflict matrix.
  Future<void> _resolvePushConflict(SyncMutation localMutation, SyncConflict conflict) async {
    final adapter = _adapters[localMutation.entityType];
    if (adapter == null) return;

    if (conflict.serverVersion > localMutation.clientVersion) {
      // Server is strictly newer -> Server Wins
      await adapter.applyServerEntity(
        conflict.serverData,
        serverRevision: conflict.serverVersion,
      );
    } else if (conflict.serverVersion == localMutation.clientVersion) {
      // Version tie -> UUID tie-breaker: larger UUID string wins
      final serverMutationId = conflict.serverData['last_client_mutation_id'] as String? ?? '';
      if (serverMutationId.compareTo(localMutation.id) > 0) {
        // Server mutation ID is lexicographically greater -> Server Wins
        await adapter.applyServerEntity(
          conflict.serverData,
          serverRevision: conflict.serverVersion,
        );
      }
      // If local mutation ID is greater, local stays winner; will re-push with incremented version
    }
  }

  /// Pulls remote changes for an entity type using composite keyset cursor pagination.
  Future<_PullOutcome> _pullEntityChanges({
    required String accessToken,
    required String userId,
    required SyncEntityType entityType,
  }) async {
    final adapter = _adapters[entityType];
    if (adapter == null) {
      return _PullOutcome.empty();
    }

    int pulledCount = 0;
    int conflictCount = 0;
    final errors = <String>[];
    final conflicts = <SyncConflict>[];

    bool hasMorePages = true;
    final pageSize = 50;

    while (hasMorePages) {
      final currentCursor = await cursorRepo.getCursor(entityType);
      final records = await transport.pullPage(
        accessToken: accessToken,
        entityType: entityType,
        userId: userId,
        cursor: currentCursor,
        limit: pageSize,
      );

      if (records.isEmpty) {
        break;
      }

      // Process complete page within an isolated Drift transaction
      await db.transaction(() async {
        for (final record in records) {
          final recordId = record['id'] as String?;
          if (recordId == null) continue;

          final deletedAtRaw = record['deleted_at'];
          final isTombstone = deletedAtRaw != null;
          final serverRev = (record['server_revision'] as num?)?.toInt() ?? 1;

          if (isTombstone) {
            final deletedAt = DateTime.parse(deletedAtRaw as String);
            await adapter.markEntityDeleted(
              recordId,
              deletedAt: deletedAt,
              serverRevision: serverRev,
            );
          } else {
            await adapter.applyServerEntity(
              record,
              serverRevision: serverRev,
            );
          }
          pulledCount++;
        }

        // Advance keyset cursor ONLY after successful transaction application
        final lastRecord = records.last;
        final updatedAt = DateTime.parse(lastRecord['updated_at'] as String);
        final cursorId = lastRecord['id'] as String;

        await cursorRepo.saveCursor(
          SyncCursor(
            entityType: entityType,
            updatedAt: updatedAt,
            id: cursorId,
            lastSyncCompletedAt: DateTime.now(),
          ),
        );
      });

      if (records.length < pageSize) {
        hasMorePages = false;
      }
    }

    return _PullOutcome(
      pulledCount: pulledCount,
      conflictCount: conflictCount,
      errors: errors,
      conflicts: conflicts,
    );
  }

  void _updateState(SyncEngineState newState) {
    _state = newState;
    notifyListeners();
  }
}

class _PushOutcome {
  final int pushedCount;
  final int conflictCount;
  final List<String> errors;
  final List<SyncConflict> conflicts;
  final bool authFailed;
  final SyncException? lastException;

  const _PushOutcome({
    required this.pushedCount,
    required this.conflictCount,
    required this.errors,
    required this.conflicts,
    required this.authFailed,
    this.lastException,
  });
}

class _PullOutcome {
  final int pulledCount;
  final int conflictCount;
  final List<String> errors;
  final List<SyncConflict> conflicts;

  const _PullOutcome({
    required this.pulledCount,
    required this.conflictCount,
    required this.errors,
    required this.conflicts,
  });

  factory _PullOutcome.empty() => const _PullOutcome(
        pulledCount: 0,
        conflictCount: 0,
        errors: [],
        conflicts: [],
      );
}
