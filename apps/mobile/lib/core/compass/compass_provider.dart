import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum CompassStatus {
  available,
  sensorUnavailable,
  permissionDenied,
  calibrating,
}

/// Immutable state holding compass heading, calibration, and sensor availability.
class CompassState {
  final double heading; // 0.0 to 360.0 degrees from North
  final double accuracy; // Accuracy in degrees
  final bool isCalibrated;
  final bool isManual;
  final CompassStatus status;

  const CompassState({
    required this.heading,
    this.accuracy = 1.0,
    this.isCalibrated = true,
    this.isManual = false,
    this.status = CompassStatus.available,
  });

  CompassState copyWith({
    double? heading,
    double? accuracy,
    bool? isCalibrated,
    bool? isManual,
    CompassStatus? status,
  }) {
    return CompassState(
      heading: heading ?? this.heading,
      accuracy: accuracy ?? this.accuracy,
      isCalibrated: isCalibrated ?? this.isCalibrated,
      isManual: isManual ?? this.isManual,
      status: status ?? this.status,
    );
  }
}

/// Abstract contract for pluggable compass heading streams.
abstract class CompassHeadingSource {
  Stream<double> get headingStream;
  void dispose();
}

/// Simulated / Mock heading source for testing and sensor-less environments.
class MockCompassHeadingSource implements CompassHeadingSource {
  final _controller = StreamController<double>.broadcast();

  @override
  Stream<double> get headingStream => _controller.stream;

  void emitHeading(double heading) {
    if (!_controller.isClosed) {
      _controller.add(heading % 360.0);
    }
  }

  @override
  void dispose() {
    _controller.close();
  }
}

/// State notifier managing compass heading, sensor lifecycle, and manual calibration.
class CompassNotifier extends StateNotifier<CompassState> {
  final CompassHeadingSource _source;
  StreamSubscription<double>? _subscription;

  CompassNotifier([CompassHeadingSource? source])
      : _source = source ?? MockCompassHeadingSource(),
        super(const CompassState(heading: 0.0)) {
    _initStream();
  }

  void _initStream() {
    _subscription = _source.headingStream.listen(
      (h) {
        if (!state.isManual) {
          state = state.copyWith(heading: h, status: CompassStatus.available);
        }
      },
      onError: (err) {
        state = state.copyWith(
          status: CompassStatus.sensorUnavailable,
          isManual: true,
        );
      },
    );
  }

  /// Sets manual heading in degrees [0.0, 360.0).
  void setManualHeading(double degrees) {
    final normalized = (degrees % 360.0 + 360.0) % 360.0;
    state = state.copyWith(
      heading: normalized,
      isManual: true,
      status: CompassStatus.available,
    );
  }

  /// Toggles manual calibration mode on or off.
  void toggleManualMode(bool enableManual) {
    state = state.copyWith(isManual: enableManual);
  }

  /// Manually updates calibration status.
  void setCalibrated(bool calibrated) {
    state = state.copyWith(isCalibrated: calibrated);
  }

  @override
  void dispose() {
    _subscription?.cancel();
    _source.dispose();
    super.dispose();
  }
}

/// Global Riverpod provider for compass heading and state.
final compassProvider = StateNotifierProvider.autoDispose<CompassNotifier, CompassState>((ref) {
  return CompassNotifier();
});
