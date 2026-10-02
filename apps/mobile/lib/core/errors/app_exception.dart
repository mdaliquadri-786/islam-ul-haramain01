/// Base class for all mobile application domain exceptions.
abstract class AppException implements Exception {
  final String message;
  final Object? cause;

  const AppException(this.message, [this.cause]);

  @override
  String toString() => '$runtimeType: $message${cause != null ? ' (Cause: $cause)' : ''}';
}

/// Thrown when local SQLite database operations encounter failures.
class DatabaseException extends AppException {
  const DatabaseException(super.message, [super.cause]);
}

/// Thrown when encryption key retrieval, generation, or cipher verification fails.
class EncryptionException extends AppException {
  const EncryptionException(super.message, [super.cause]);
}

/// Thrown when domain input validation fails (e.g. invalid Surah number or bookmark boundary).
class ValidationException extends AppException {
  const ValidationException(super.message, [super.cause]);
}

/// Thrown when sync mutation queue processing encounters errors.
class SyncException extends AppException {
  const SyncException(super.message, [super.cause]);
}
