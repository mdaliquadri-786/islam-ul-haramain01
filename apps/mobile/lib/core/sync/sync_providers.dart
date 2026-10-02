import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../auth/auth_provider.dart';
import '../database/database_providers.dart';
import 'sync_engine.dart';
import 'sync_repositories.dart';
import 'sync_repository_impl.dart';
import 'sync_transport.dart';

/// Sync transport provider using standard HTTP PostgREST calls.
final syncTransportProvider = Provider<SyncTransport>((ref) {
  final config = ref.watch(appConfigProvider);
  return HttpSyncTransport(config: config);
});

/// Sync cursor repository provider.
final syncCursorRepositoryProvider = Provider<SyncCursorRepository>((ref) {
  final dao = ref.watch(syncCursorsDaoProvider);
  return SyncCursorRepositoryImpl(dao);
});

/// Sync mutation repository provider.
final syncMutationRepositoryProvider = Provider<SyncMutationRepository>((ref) {
  final dao = ref.watch(syncQueueDaoProvider);
  return SyncMutationRepositoryImpl(dao);
});

/// SyncEngine singleton provider.
final syncEngineProvider = Provider<SyncEngine>((ref) {
  final transport = ref.watch(syncTransportProvider);
  final cursorRepo = ref.watch(syncCursorRepositoryProvider);
  final mutationRepo = ref.watch(syncMutationRepositoryProvider);
  final sessionStorage = ref.watch(sessionStorageProvider);
  final authNotifier = ref.watch(authNotifierProvider.notifier);
  final db = ref.watch(appDatabaseProvider);

  return SyncEngine(
    transport: transport,
    cursorRepo: cursorRepo,
    mutationRepo: mutationRepo,
    sessionStorage: sessionStorage,
    authNotifier: authNotifier,
    db: db,
  );
});

/// Convenience provider exposing the reactive SyncEngine state.
final syncEngineStateProvider = ChangeNotifierProvider<SyncEngine>((ref) {
  return ref.watch(syncEngineProvider);
});
