import 'dart:async';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_models.dart';
import '../auth/auth_provider.dart';
import 'sync_engine.dart';
import 'sync_models.dart';
import 'sync_providers.dart';
import 'sync_repositories.dart';

/// Coordinates foreground application synchronization triggers with lifecycle and auth events.
/// Strictly implements only foreground triggers (app launch, return to foreground, user sync action).
/// Strictly avoids persistent background daemons, WorkManager, or OS background workers.
class SyncCoordinator with WidgetsBindingObserver {
  final SyncEngine syncEngine;
  final SyncCursorRepository cursorRepo;
  final SyncMutationRepository mutationRepo;
  final Ref ref;

  ProviderSubscription<SessionState>? _authSubscription;
  String? _lastAuthenticatedUserId;

  SyncCoordinator({
    required this.syncEngine,
    required this.cursorRepo,
    required this.mutationRepo,
    required this.ref,
  }) {
    _init();
  }

  void _init() {
    try {
      WidgetsBinding.instance.addObserver(this);
    } catch (_) {
      // In headless unit tests, WidgetsBinding may not be bound
    }

    // Listen to authentication changes
    _authSubscription = ref.listen<SessionState>(
      authNotifierProvider,
      (previous, current) {
        _handleAuthStateChange(previous, current);
      },
      fireImmediately: false,
    );
  }

  void _handleAuthStateChange(SessionState? previous, SessionState current) {
    if (current.isAuthenticated && !current.isGuest) {
      final newUserId = current.user?.id;
      if (newUserId != null && newUserId != _lastAuthenticatedUserId) {
        // Account switched or freshly logged in:
        // Clear previous user's cursors if switching accounts
        if (_lastAuthenticatedUserId != null && _lastAuthenticatedUserId != newUserId) {
          unawaited(cursorRepo.clearAllCursors());
          unawaited(mutationRepo.clearAllMutations());
        }
        _lastAuthenticatedUserId = newUserId;

        // Trigger initial sync on authenticated login
        unawaited(syncEngine.sync().catchError((_) => SyncResult.failure(['Sync error'])));
      }
    } else {
      // Logged out or switched to guest mode
      if (_lastAuthenticatedUserId != null) {
        _lastAuthenticatedUserId = null;
        // Purge session sync state to guarantee tenant isolation
        unawaited(cursorRepo.clearAllCursors());
        unawaited(mutationRepo.clearAllMutations());
      }
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Trigger sync upon returning to foreground if authenticated
      final session = ref.read(authNotifierProvider);
      if (session.isAuthenticated && !session.isGuest) {
        unawaited(syncEngine.sync().catchError((_) => SyncResult.failure(['Foreground sync error'])));
      }
    }
  }

  /// Explicit user-initiated synchronization trigger.
  Future<SyncResult> syncNow() {
    return syncEngine.sync();
  }

  /// Cleans up observer registrations.
  void dispose() {
    try {
      WidgetsBinding.instance.removeObserver(this);
    } catch (_) {}
    _authSubscription?.close();
  }
}

/// Singleton provider for [SyncCoordinator].
final syncCoordinatorProvider = Provider<SyncCoordinator>((ref) {
  final coordinator = SyncCoordinator(
    syncEngine: ref.watch(syncEngineProvider),
    cursorRepo: ref.watch(syncCursorRepositoryProvider),
    mutationRepo: ref.watch(syncMutationRepositoryProvider),
    ref: ref,
  );

  ref.onDispose(() {
    coordinator.dispose();
  });

  return coordinator;
});
