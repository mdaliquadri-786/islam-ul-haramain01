import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'diagnostic_models.dart';

/// Abstract storage contract for persisting the offline diagnostic ring buffer.
abstract class DiagnosticStorage {
  /// Loads all stored diagnostic records.
  Future<List<DiagnosticEvent>> loadEvents();

  /// Persists the list of diagnostic records.
  Future<void> saveEvents(List<DiagnosticEvent> events);

  /// Clears all stored diagnostic records.
  Future<void> clear();
}

/// In-memory storage implementation for tests and graceful degradation fallback.
class InMemoryDiagnosticStorage implements DiagnosticStorage {
  List<DiagnosticEvent> _events = [];

  InMemoryDiagnosticStorage([List<DiagnosticEvent>? initialEvents])
      : _events = initialEvents != null ? List.from(initialEvents) : [];

  @override
  Future<List<DiagnosticEvent>> loadEvents() async {
    return List.unmodifiable(_events);
  }

  @override
  Future<void> saveEvents(List<DiagnosticEvent> events) async {
    _events = List.from(events);
  }

  @override
  Future<void> clear() async {
    _events.clear();
  }
}

/// Hardware-backed secure storage implementation using Keychain (iOS) and KeyStore (Android).
/// Falls back safely to memory in non-native or test environments where platform channels fail.
class SecureDiagnosticStorage implements DiagnosticStorage {
  static const String _storageKey = 'islamic_platform_diagnostics_buffer_v1';
  final FlutterSecureStorage _secureStorage;
  final InMemoryDiagnosticStorage _fallbackMemory = InMemoryDiagnosticStorage();
  bool _useFallback = false;

  SecureDiagnosticStorage({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  @override
  Future<List<DiagnosticEvent>> loadEvents() async {
    if (_useFallback) {
      return _fallbackMemory.loadEvents();
    }

    try {
      final jsonString = await _secureStorage.read(key: _storageKey);
      if (jsonString == null || jsonString.isEmpty) {
        return const [];
      }

      final dynamic decoded = jsonDecode(jsonString);
      if (decoded is List) {
        return decoded
            .whereType<Map<String, dynamic>>()
            .map((item) => DiagnosticEvent.fromJson(item))
            .toList();
      }
      return const [];
    } catch (_) {
      // Gracefully switch to in-memory fallback on platform channel failure
      _useFallback = true;
      return _fallbackMemory.loadEvents();
    }
  }

  @override
  Future<void> saveEvents(List<DiagnosticEvent> events) async {
    if (_useFallback) {
      await _fallbackMemory.saveEvents(events);
      return;
    }

    try {
      final jsonString = jsonEncode(events.map((e) => e.toJson()).toList());
      await _secureStorage.write(key: _storageKey, value: jsonString);
    } catch (_) {
      _useFallback = true;
      await _fallbackMemory.saveEvents(events);
    }
  }

  @override
  Future<void> clear() async {
    if (_useFallback) {
      await _fallbackMemory.clear();
      return;
    }

    try {
      await _secureStorage.delete(key: _storageKey);
    } catch (_) {
      _useFallback = true;
      await _fallbackMemory.clear();
    }
  }
}
