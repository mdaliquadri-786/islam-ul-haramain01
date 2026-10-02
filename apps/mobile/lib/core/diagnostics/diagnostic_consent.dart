import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Manages explicit user consent for diagnostic error reporting.
/// By default, crash and diagnostic reporting is strictly DISABLED (`false`).
/// Transmission over network is completely blocked unless the user explicitly opts in.
class DiagnosticConsentService {
  static const String _consentKey = 'islamic_platform_diagnostic_consent_v1';
  final FlutterSecureStorage _secureStorage;
  bool _cachedConsent = false;
  bool _loaded = false;

  DiagnosticConsentService({FlutterSecureStorage? secureStorage})
      : _secureStorage = secureStorage ?? const FlutterSecureStorage();

  /// Synchronously returns current known consent state.
  /// Strictly defaults to `false`.
  bool get isCrashReportingEnabled => _cachedConsent;

  /// Loads the persisted consent preference.
  /// Defaults to `false` if not set or on platform error.
  Future<bool> loadConsent() async {
    if (_loaded) return _cachedConsent;

    try {
      final value = await _secureStorage.read(key: _consentKey);
      _cachedConsent = value == 'true';
    } catch (_) {
      _cachedConsent = false;
    } finally {
      _loaded = true;
    }
    return _cachedConsent;
  }

  /// Explicitly updates user consent for diagnostic transmission.
  Future<void> setConsent(bool enabled) async {
    _cachedConsent = enabled;
    _loaded = true;
    try {
      await _secureStorage.write(
        key: _consentKey,
        value: enabled ? 'true' : 'false',
      );
    } catch (_) {
      // Swallowed safely
    }
  }

  /// Resets consent back to default disabled state.
  Future<void> reset() async {
    await setConsent(false);
  }
}
