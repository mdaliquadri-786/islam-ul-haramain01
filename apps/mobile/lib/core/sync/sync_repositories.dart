import 'sync_models.dart';

/// Repository interface managing sync cursors for keyset pagination.
abstract class SyncCursorRepository {
  /// Fetches the current keyset cursor for a given entity type.
  Future<SyncCursor?> getCursor(SyncEntityType entityType);

  /// Saves or updates the keyset cursor for an entity type atomically.
  Future<void> saveCursor(SyncCursor cursor);

  /// Clears the keyset cursor for an entity type to trigger full resync.
  Future<void> clearCursor(SyncEntityType entityType);

  /// Clears all keyset cursors across all entity types (e.g. on logout).
  Future<void> clearAllCursors();
}

/// Repository interface managing local mutation queue for push synchronization.
abstract class SyncMutationRepository {
  /// Enqueues a new mutation to be pushed to the remote server.
  Future<void> enqueueMutation(SyncMutation mutation);

  /// Fetches pending mutations eligible for synchronization.
  Future<List<SyncMutation>> getPendingMutations({int limit = 50});

  /// Marks a mutation as successfully acknowledged by the server.
  Future<void> markMutationAcknowledged(String mutationId);

  /// Records failure details on a mutation, flagging whether it is retryable.
  Future<void> markMutationFailed(
    String mutationId, {
    required String error,
    required bool retryable,
  });

  /// Removes an acknowledged or permanently discarded mutation from the local queue.
  Future<void> removeMutation(String mutationId);

  /// Purges all mutations from the local queue.
  Future<void> clearAllMutations();
}

/// Abstraction for local entities that participate in bidirectional synchronization.
abstract class SyncableEntityRepository {
  /// The entity type discriminator managed by this repository.
  SyncEntityType get entityType;

  /// Retrieves an entity by its identifier as a JSON payload for transmission.
  Future<Map<String, dynamic>?> getEntityById(String id);

  /// Applies authoritative remote state received from server pull.
  Future<void> applyServerEntity(
    Map<String, dynamic> data, {
    required int serverRevision,
  });

  /// Marks an entity as soft-deleted upon receiving a remote tombstone.
  Future<void> markEntityDeleted(
    String id, {
    required DateTime deletedAt,
    required int serverRevision,
  });
}
