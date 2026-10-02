import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/app_config.dart';
import 'diagnostic_consent.dart';
import 'diagnostic_ring_buffer.dart';
import 'diagnostic_service.dart';
import 'diagnostic_storage.dart';
import 'diagnostic_transport.dart';

/// Provider for persistent secure diagnostic storage.
final diagnosticStorageProvider = Provider<DiagnosticStorage>((ref) {
  return SecureDiagnosticStorage();
});

/// Provider for the local 50-event diagnostic ring buffer.
final diagnosticRingBufferProvider = Provider<DiagnosticRingBuffer>((ref) {
  final storage = ref.watch(diagnosticStorageProvider);
  return DiagnosticRingBuffer(storage: storage);
});

/// Provider for managing explicit user consent for diagnostic error reporting.
final diagnosticConsentServiceProvider = Provider<DiagnosticConsentService>((ref) {
  return DiagnosticConsentService();
});

/// StateNotifier to provide reactive UI binding for user consent state.
class DiagnosticConsentNotifier extends StateNotifier<bool> {
  final DiagnosticConsentService _service;

  DiagnosticConsentNotifier(this._service) : super(false) {
    _init();
  }

  Future<void> _init() async {
    final consent = await _service.loadConsent();
    state = consent;
  }

  Future<void> setConsent(bool enabled) async {
    await _service.setConsent(enabled);
    state = enabled;
  }
}

/// Reactive provider for diagnostic consent toggle in settings UI.
final diagnosticConsentNotifierProvider =
    StateNotifierProvider<DiagnosticConsentNotifier, bool>((ref) {
  final service = ref.watch(diagnosticConsentServiceProvider);
  return DiagnosticConsentNotifier(service);
});

/// Provider for diagnostic transport.
final diagnosticTransportProvider = Provider<DiagnosticTransport?>((ref) {
  final config = AppConfig.fromEnvironment();
  return HttpDiagnosticTransport(config: config);
});

/// Singleton provider for the diagnostic orchestrator service.
final diagnosticServiceProvider = Provider<DiagnosticService>((ref) {
  final buffer = ref.watch(diagnosticRingBufferProvider);
  final consent = ref.watch(diagnosticConsentServiceProvider);
  final transport = ref.watch(diagnosticTransportProvider);

  return DiagnosticService(
    buffer: buffer,
    consent: consent,
    transport: transport,
  );
});
