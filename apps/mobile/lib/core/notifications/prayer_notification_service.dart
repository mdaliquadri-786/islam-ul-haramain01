import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../prayer/prayer_models.dart';

/// Notification alert sound type for prayer notifications.
enum PrayerAlertMode {
  adhan('Adhan (Full Call to Prayer)', 'أذان'),
  takbeer('Takbeer (Opening Takbeerat)', 'تكبيرات'),
  beep('Short Devotional Beep', 'تنبيه قصير'),
  silent('Silent Notification', 'صامت');

  final String displayName;
  final String arabicName;

  const PrayerAlertMode(this.displayName, this.arabicName);
}

/// Configuration settings for an individual prayer alert.
class PrayerNotificationConfig {
  final PrayerName prayer;
  final bool isEnabled;
  final PrayerAlertMode alertMode;
  final int reminderOffsetMinutes; // e.g., 15 minutes before prayer (0 = exact time)

  const PrayerNotificationConfig({
    required this.prayer,
    this.isEnabled = true,
    this.alertMode = PrayerAlertMode.adhan,
    this.reminderOffsetMinutes = 0,
  });

  PrayerNotificationConfig copyWith({
    bool? isEnabled,
    PrayerAlertMode? alertMode,
    int? reminderOffsetMinutes,
  }) {
    return PrayerNotificationConfig(
      prayer: prayer,
      isEnabled: isEnabled ?? this.isEnabled,
      alertMode: alertMode ?? this.alertMode,
      reminderOffsetMinutes: reminderOffsetMinutes ?? this.reminderOffsetMinutes,
    );
  }
}

/// A scheduled local notification record.
class ScheduledPrayerNotification {
  final String id;
  final PrayerName prayer;
  final DateTime scheduledTime;
  final PrayerAlertMode alertMode;
  final bool isPreReminder;

  const ScheduledPrayerNotification({
    required this.id,
    required this.prayer,
    required this.scheduledTime,
    required this.alertMode,
    this.isPreReminder = false,
  });
}

/// State holding active prayer notification preferences and scheduled alert queues.
class PrayerNotificationState {
  final bool globalNotificationsEnabled;
  final Map<PrayerName, PrayerNotificationConfig> prayerConfigs;
  final List<ScheduledPrayerNotification> scheduledQueue;

  const PrayerNotificationState({
    this.globalNotificationsEnabled = true,
    required this.prayerConfigs,
    this.scheduledQueue = const [],
  });

  static PrayerNotificationState initial() {
    final configs = <PrayerName, PrayerNotificationConfig>{};
    for (final p in PrayerName.values) {
      configs[p] = PrayerNotificationConfig(
        prayer: p,
        isEnabled: p != PrayerName.sunrise, // Default sunrise alert to off
        alertMode: p == PrayerName.fajr ? PrayerAlertMode.adhan : PrayerAlertMode.adhan,
        reminderOffsetMinutes: 0,
      );
    }
    return PrayerNotificationState(prayerConfigs: configs);
  }

  PrayerNotificationState copyWith({
    bool? globalNotificationsEnabled,
    Map<PrayerName, PrayerNotificationConfig>? prayerConfigs,
    List<ScheduledPrayerNotification>? scheduledQueue,
  }) {
    return PrayerNotificationState(
      globalNotificationsEnabled:
          globalNotificationsEnabled ?? this.globalNotificationsEnabled,
      prayerConfigs: prayerConfigs ?? this.prayerConfigs,
      scheduledQueue: scheduledQueue ?? this.scheduledQueue,
    );
  }
}

/// State notifier managing offline prayer alert scheduling, rescheduling, and cancellation.
class PrayerNotificationNotifier extends StateNotifier<PrayerNotificationState> {
  PrayerNotificationNotifier() : super(PrayerNotificationState.initial());

  /// Sets global notifications enabled or disabled.
  void setGlobalEnabled(bool enabled) {
    state = state.copyWith(globalNotificationsEnabled: enabled);
    if (!enabled) {
      cancelAll();
    }
  }

  /// Updates config for a specific prayer.
  void updatePrayerConfig(PrayerName prayer, PrayerNotificationConfig config) {
    final updated = Map<PrayerName, PrayerNotificationConfig>.from(state.prayerConfigs);
    updated[prayer] = config;
    state = state.copyWith(prayerConfigs: updated);
  }

  /// Schedules local notifications for calculated prayer times.
  void scheduleForPrayerTimes(PrayerTimesResult result, [DateTime? referenceNow]) {
    if (!state.globalNotificationsEnabled) {
      cancelAll();
      return;
    }

    final now = referenceNow ?? DateTime.now();
    final queue = <ScheduledPrayerNotification>[];

    for (final p in PrayerName.values) {
      final config = state.prayerConfigs[p];
      if (config == null || !config.isEnabled) continue;

      final prayerTime = result.getTime(p);

      // 1. Exact prayer time alert
      if (prayerTime.isAfter(now)) {
        queue.add(
          ScheduledPrayerNotification(
            id: 'prayer_${p.name}_${prayerTime.millisecondsSinceEpoch}',
            prayer: p,
            scheduledTime: prayerTime,
            alertMode: config.alertMode,
            isPreReminder: false,
          ),
        );
      }

      // 2. Pre-prayer reminder alert (if configured > 0)
      if (config.reminderOffsetMinutes > 0) {
        final preTime = prayerTime.subtract(Duration(minutes: config.reminderOffsetMinutes));
        if (preTime.isAfter(now)) {
          queue.add(
            ScheduledPrayerNotification(
              id: 'pre_${p.name}_${preTime.millisecondsSinceEpoch}',
              prayer: p,
              scheduledTime: preTime,
              alertMode: PrayerAlertMode.beep,
              isPreReminder: true,
            ),
          );
        }
      }
    }

    state = state.copyWith(scheduledQueue: queue);
  }

  /// Cancels all scheduled prayer alerts.
  void cancelAll() {
    state = state.copyWith(scheduledQueue: const []);
  }
}

/// Global provider for prayer notification state and scheduler.
final prayerNotificationProvider =
    StateNotifierProvider<PrayerNotificationNotifier, PrayerNotificationState>((ref) {
  return PrayerNotificationNotifier();
});
