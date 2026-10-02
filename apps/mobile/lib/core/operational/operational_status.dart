import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Represents remote platform operational health.
class PlatformOperationalStatus {
  final bool isMaintenanceMode;
  final String maintenanceMessage;
  final String minSupportedVersion;
  final bool isDegraded;
  final DateTime lastChecked;

  const PlatformOperationalStatus({
    this.isMaintenanceMode = false,
    this.maintenanceMessage =
        'Platform undergoing scheduled maintenance. Offline devotional tools remain active.',
    this.minSupportedVersion = '1.0.0',
    this.isDegraded = false,
    required this.lastChecked,
  });

  PlatformOperationalStatus copyWith({
    bool? isMaintenanceMode,
    String? maintenanceMessage,
    String? minSupportedVersion,
    bool? isDegraded,
    DateTime? lastChecked,
  }) {
    return PlatformOperationalStatus(
      isMaintenanceMode: isMaintenanceMode ?? this.isMaintenanceMode,
      maintenanceMessage: maintenanceMessage ?? this.maintenanceMessage,
      minSupportedVersion: minSupportedVersion ?? this.minSupportedVersion,
      isDegraded: isDegraded ?? this.isDegraded,
      lastChecked: lastChecked ?? this.lastChecked,
    );
  }
}

class OperationalStatusNotifier
    extends StateNotifier<PlatformOperationalStatus> {
  OperationalStatusNotifier()
      : super(PlatformOperationalStatus(lastChecked: DateTime.now()));

  /// Updates operational status (e.g. from backend polling or admin action).
  /// Strictly non-destructive: never alters or clears user-local encrypted database.
  void setStatus({
    required bool isMaintenanceMode,
    String? maintenanceMessage,
    bool isDegraded = false,
  }) {
    state = state.copyWith(
      isMaintenanceMode: isMaintenanceMode,
      maintenanceMessage: maintenanceMessage ?? state.maintenanceMessage,
      isDegraded: isDegraded,
      lastChecked: DateTime.now(),
    );
  }

  /// Toggles maintenance mode for operational testing.
  void toggleMaintenanceMode() {
    state = state.copyWith(
      isMaintenanceMode: !state.isMaintenanceMode,
      lastChecked: DateTime.now(),
    );
  }
}

final operationalStatusProvider =
    StateNotifierProvider<OperationalStatusNotifier, PlatformOperationalStatus>(
  (ref) => OperationalStatusNotifier(),
);
