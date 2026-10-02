import 'dart:convert';
import 'dart:math';
import 'package:crypto/crypto.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../errors/app_exception.dart';

/// Provides cryptographically secure encryption key management for the local SQLite database.
/// Manages generation, secure storage (Keychain / Keystore), retrieval, and hashing.
class DatabaseKeyProvider {
  static const String _storageKey = 'islamic_platform_db_enc_key_v1';
  final FlutterSecureStorage? _secureStorage;
  String? _cachedKey;

  DatabaseKeyProvider({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  /// Constructor for tests with a pre-set deterministic or in-memory key
  DatabaseKeyProvider.forTesting({String? initialKey})
      : _secureStorage = null,
        _cachedKey = initialKey ?? 'test_encryption_key_32_bytes_long!!';

  /// Obtains the 256-bit database encryption passphrase.
  /// If no key exists in secure hardware storage, generates a new CSPRNG key and persists it.
  Future<String> getOrCreateKey() async {
    if (_cachedKey != null && _cachedKey!.isNotEmpty) {
      return _cachedKey!;
    }

    if (_secureStorage != null) {
      try {
        final existingKey = await _secureStorage.read(key: _storageKey);
        if (existingKey != null && existingKey.isNotEmpty) {
          _cachedKey = existingKey;
          return _cachedKey!;
        }

        // Generate a new 256-bit cryptographically secure key
        final newKey = _generateSecurePassphrase();
        await _secureStorage.write(key: _storageKey, value: newKey);
        _cachedKey = newKey;
        return _cachedKey!;
      } catch (e) {
        throw EncryptionException('Failed to access secure key storage: $e', e);
      }
    }

    // In-memory / testing key provider fallback
    _cachedKey = _generateSecurePassphrase();
    return _cachedKey!;
  }

  /// Generates a 32-byte (256-bit) cryptographically secure random hex string.
  String _generateSecurePassphrase() {
    final random = Random.secure();
    final values = List<int>.generate(32, (i) => random.nextInt(256));
    return sha256.convert(values).toString();
  }

  /// Derives an SQLCipher-compliant PRAGMA hex key representation.
  String derivePragmaKey(String rawKey) {
    // Return sanitized hex string
    final bytes = utf8.encode(rawKey);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }
}
