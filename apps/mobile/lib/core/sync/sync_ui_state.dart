import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_provider.dart';
import '../database/database_providers.dart';
import 'sync_models.dart';
import 'sync_providers.dart';

/// Lightweight synchronization lifecycle states for presentation in the UI.
enum SyncUIStatus {
  /// Engine is idle, all local data is synchronized.
  synced,

  /// Engine is idle, but local mutations are queued awaiting sync.
  pending,

  /// Synchronization cycle is actively in progress.
  syncing,

  /// Device is disconnected or network is unreachable.
  offline,

  /// User is not logged in or running in device-local guest mode.
  unauthenticated,

  /// Last sync attempt encountered an error.
  error,
}

/// Unified, reactive presentation model for synchronization status.
@immutable
class SyncUIState {
  final SyncUIStatus status;
  final int pendingMutationsCount;
  final DateTime? lastSyncTime;
  final String? errorMessage;
  final bool isGuest;
  final bool isAuthenticated;

  const SyncUIState({
    required this.status,
    this.pendingMutationsCount = 0,
    this.lastSyncTime,
    this.errorMessage,
    this.isGuest = false,
    this.isAuthenticated = false,
  });

  /// True if a sync cycle is actively running.
  bool get isSyncing => status == SyncUIStatus.syncing;

  /// True if device is offline.
  bool get isOffline => status == SyncUIStatus.offline;

  /// True if an error is present.
  bool get hasError => status == SyncUIStatus.error;

  /// True if there are un-synced local changes.
  bool get hasPendingChanges => pendingMutationsCount > 0;

  /// Localized, human-readable status description.
  String get statusMessage {
    switch (status) {
      case SyncUIStatus.syncing:
        return 'Syncing changes...';
      case SyncUIStatus.offline:
        return 'Offline — changes saved locally';
      case SyncUIStatus.unauthenticated:
        return isGuest ? 'Local mode (Guest)' : 'Sign in to sync across devices';
      case SyncUIStatus.error:
        return errorMessage ?? 'Synchronization error';
      case SyncUIStatus.pending:
        return '$pendingMutationsCount pending changes';
      case SyncUIStatus.synced:
        if (lastSyncTime == null) return 'Up to date';
        return 'Synced ${_formatTimeAgo(lastSyncTime!)}';
    }
  }

  static String _formatTimeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  SyncUIState copyWith({
    SyncUIStatus? status,
    int? pendingMutationsCount,
    DateTime? lastSyncTime,
    String? errorMessage,
    bool? isGuest,
    bool? isAuthenticated,
  }) {
    return SyncUIState(
      status: status ?? this.status,
      pendingMutationsCount: pendingMutationsCount ?? this.pendingMutationsCount,
      lastSyncTime: lastSyncTime ?? this.lastSyncTime,
      errorMessage: errorMessage ?? this.errorMessage,
      isGuest: isGuest ?? this.isGuest,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}

/// Computes the active user ID for data scoping.
final activeUserIdProvider = Provider<String>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.id ?? 'local-user-default';
});

/// Reactive provider exposing the real-time [SyncUIState].
final syncUIStateProvider = Provider<SyncUIState>((ref) {
  final engineState = ref.watch(syncEngineStateProvider).state;
  final session = ref.watch(authNotifierProvider);
  final queueAsync = ref.watch(syncQueueStreamProvider);
  final pendingCount = queueAsync.value?.length ?? 0;

  final isAuthenticated = session.isAuthenticated;
  final isGuest = session.isGuest;

  if (!isAuthenticated || isGuest) {
    return SyncUIState(
      status: SyncUIStatus.unauthenticated,
      pendingMutationsCount: pendingCount,
      isGuest: isGuest,
      isAuthenticated: isAuthenticated,
    );
  }

  if (engineState.status == SyncEngineStatus.syncing) {
    return SyncUIState(
      status: SyncUIStatus.syncing,
      pendingMutationsCount: pendingCount,
      lastSyncTime: engineState.lastSyncTime,
      isGuest: isGuest,
      isAuthenticated: isAuthenticated,
    );
  }

  if (engineState.status == SyncEngineStatus.error) {
    final error = engineState.lastError;
    final primaryErrorMsg = error?.message ??
        (engineState.lastResult?.errors.isNotEmpty == true
            ? engineState.lastResult!.errors.first
            : null);
    final isOfflineError = error?.errorType == SyncErrorType.networkUnavailable ||
        error?.errorType == SyncErrorType.timeout ||
        (primaryErrorMsg != null &&
            (primaryErrorMsg.toLowerCase().contains('socket') ||
                primaryErrorMsg.toLowerCase().contains('network') ||
                primaryErrorMsg.toLowerCase().contains('timeout') ||
                primaryErrorMsg.toLowerCase().contains('connection')));

    return SyncUIState(
      status: isOfflineError ? SyncUIStatus.offline : SyncUIStatus.error,
      pendingMutationsCount: pendingCount,
      lastSyncTime: engineState.lastSyncTime,
      errorMessage: primaryErrorMsg,
      isGuest: isGuest,
      isAuthenticated: isAuthenticated,
    );
  }

  if (pendingCount > 0) {
    return SyncUIState(
      status: SyncUIStatus.pending,
      pendingMutationsCount: pendingCount,
      lastSyncTime: engineState.lastSyncTime,
      isGuest: isGuest,
      isAuthenticated: isAuthenticated,
    );
  }

  return SyncUIState(
    status: SyncUIStatus.synced,
    pendingMutationsCount: 0,
    lastSyncTime: engineState.lastSyncTime,
    isGuest: isGuest,
    isAuthenticated: isAuthenticated,
  );
});

/// Stream provider for real-time queue item observation.
final syncQueueStreamProvider = StreamProvider.autoDispose((ref) {
  final dao = ref.watch(syncQueueDaoProvider);
  return dao.watchQueue();
});
