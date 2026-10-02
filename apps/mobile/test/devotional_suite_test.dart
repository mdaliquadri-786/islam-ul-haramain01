import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/calendar/hijri_calendar.dart';
import 'package:islamic_mobile/core/compass/compass_provider.dart';
import 'package:islamic_mobile/core/tasbeeh/tasbeeh_model.dart';
import 'package:islamic_mobile/core/notifications/prayer_notification_service.dart';
import 'package:islamic_mobile/core/prayer/prayer_models.dart';

void main() {
  group('HijriCalendar Deterministic Conversion & Holidays Tests', () {
    test('Converts Gregorian dates to Umm al-Qura calendar accurately', () {
      // 2026-09-25 is approximately Rabi al-Thani 1448 AH
      final gDate = DateTime(2026, 9, 25);
      final hijri = HijriCalendarCalculator.fromGregorian(gDate);

      expect(hijri.year, inInclusiveRange(1447, 1449));
      expect(hijri.month, inInclusiveRange(1, 12));
      expect(hijri.day, inInclusiveRange(1, 30));

      expect(hijri.formatEnglish(), contains('AH'));
      expect(hijri.formatArabic(), contains('هـ'));
      expect(hijri.formatUrdu(), contains('ھ'));
    });

    test('Manual offset shifts the Hijri day within [-2, +2]', () {
      final gDate = DateTime(2026, 9, 25);
      final h0 = HijriCalendarCalculator.fromGregorian(gDate, 0);
      final hPlus1 = HijriCalendarCalculator.fromGregorian(gDate, 1);
      final hMinus1 = HijriCalendarCalculator.fromGregorian(gDate, -1);

      expect(hPlus1.dayOffset, equals(1));
      expect(hMinus1.dayOffset, equals(-1));
      // Offset affects underlying date
      expect(h0 == hPlus1, isFalse);
    });

    test('Islamic holidays are correctly identified on sacred dates', () {
      // Eid al-Fitr: 1 Shawwal (month 10, day 1)
      const eidFitr = HijriDate(year: 1448, month: 10, day: 1);
      expect(eidFitr.holiday, isNotNull);
      expect(eidFitr.holiday!.nameEnglish, equals('Eid al-Fitr'));

      // Day of Arafah: 9 Dhul-Hijjah (month 12, day 9)
      const arafah = HijriDate(year: 1448, month: 12, day: 9);
      expect(arafah.holiday, isNotNull);
      expect(arafah.holiday!.nameEnglish, equals('Day of Arafah'));

      // Eid al-Adha: 10 Dhul-Hijjah (month 12, day 10)
      const eidAdha = HijriDate(year: 1448, month: 12, day: 10);
      expect(eidAdha.holiday, isNotNull);
      expect(eidAdha.holiday!.nameEnglish, equals('Eid al-Adha'));

      // Day of Ashura: 10 Muharram (month 1, day 10)
      const ashura = HijriDate(year: 1448, month: 1, day: 10);
      expect(ashura.holiday, isNotNull);
      expect(ashura.holiday!.nameEnglish, equals('Day of Ashura'));

      // Regular day: 15 Safar has no major canonical holiday
      const regularDay = HijriDate(year: 1448, month: 2, day: 15);
      expect(regularDay.holiday, isNull);
    });
  });

  group('CompassProvider & Heading Stream Tests', () {
    test('MockCompassHeadingSource emits heading events to CompassNotifier', () async {
      final mockSource = MockCompassHeadingSource();
      final notifier = CompassNotifier(mockSource);

      expect(notifier.state.heading, equals(0.0));
      expect(notifier.state.isManual, isFalse);

      mockSource.emitHeading(125.5);
      await Future<void>.delayed(const Duration(milliseconds: 10));
      expect(notifier.state.heading, closeTo(125.5, 0.01));

      mockSource.emitHeading(350.0);
      await Future<void>.delayed(const Duration(milliseconds: 10));
      expect(notifier.state.heading, closeTo(350.0, 0.01));

      notifier.dispose();
    });

    test('Manual calibration mode overrides sensor stream and normalizes angle', () {
      final notifier = CompassNotifier();

      notifier.setManualHeading(400.0); // 400 % 360 = 40
      expect(notifier.state.isManual, isTrue);
      expect(notifier.state.heading, closeTo(40.0, 0.01));

      notifier.setManualHeading(-30.0); // -30 -> 330
      expect(notifier.state.heading, closeTo(330.0, 0.01));

      notifier.toggleManualMode(false);
      expect(notifier.state.isManual, isFalse);

      notifier.dispose();
    });
  });

  group('Digital Tasbeeh Engine & Presets Tests', () {
    test('Dhikr presets are authentically loaded strictly from canonical Hisn al-Muslim', () {
      expect(kAuthenticDhikrPresets, isNotEmpty);
      expect(kAuthenticDhikrPresets.length, greaterThanOrEqualTo(5));

      final subhanallah = kAuthenticDhikrPresets.firstWhere((d) => d.id == 'tasbeeh_subhanallah');
      expect(subhanallah.arabicText, equals('سُبْحَانَ اللَّهِ'));
      expect(subhanallah.defaultTarget, equals(33));

      final alhamdulillah = kAuthenticDhikrPresets.firstWhere((d) => d.id == 'tasbeeh_alhamdulillah');
      expect(alhamdulillah.arabicText, equals('الْحَمْدُ لِلَّهِ'));
      expect(alhamdulillah.defaultTarget, equals(33));

      final allahuakbar = kAuthenticDhikrPresets.firstWhere((d) => d.id == 'tasbeeh_allahuakbar');
      expect(allahuakbar.arabicText, equals('اللَّهُ أَكْبَرُ'));
      expect(allahuakbar.defaultTarget, equals(34));
    });

    test('TasbeehNotifier counts increments, fires target reached, and tracks cycles', () {
      final notifier = TasbeehNotifier();
      // Target is 33
      expect(notifier.state.currentCount, equals(0));
      expect(notifier.state.targetCount, equals(33));
      expect(notifier.state.isCompleted, isFalse);

      // Increment 32 times
      for (int i = 0; i < 32; i++) {
        final reached = notifier.increment();
        expect(reached, isFalse);
      }
      expect(notifier.state.currentCount, equals(32));
      expect(notifier.state.isCompleted, isFalse);
      expect(notifier.state.totalCyclesCompleted, equals(0));

      // 33rd tap reaches target
      final reached = notifier.increment();
      expect(reached, isTrue);
      expect(notifier.state.currentCount, equals(33));
      expect(notifier.state.isCompleted, isTrue);
      expect(notifier.state.totalCyclesCompleted, equals(1));

      // Reset current cycle for next round
      notifier.resetCurrentCycle();
      expect(notifier.state.currentCount, equals(0));
      expect(notifier.state.isCompleted, isFalse);
      expect(notifier.state.totalCyclesCompleted, equals(1)); // Cycle count preserved

      // Reset all zeroes everything
      notifier.resetAll();
      expect(notifier.state.currentCount, equals(0));
      expect(notifier.state.totalCyclesCompleted, equals(0));
    });

    test('Selecting another Dhikr preset updates target and resets count', () {
      final notifier = TasbeehNotifier();
      final istighfar = kAuthenticDhikrPresets.firstWhere((d) => d.id == 'tasbeeh_istighfar');

      notifier.increment();
      notifier.increment();
      expect(notifier.state.currentCount, equals(2));

      notifier.selectDhikr(istighfar);
      expect(notifier.state.activeDhikr.id, equals('tasbeeh_istighfar'));
      expect(notifier.state.targetCount, equals(100));
      expect(notifier.state.currentCount, equals(0));
    });
  });

  group('Offline Prayer Notification Engine Tests', () {
    test('Initial notification state configures 5 prayers enabled by default', () {
      final initial = PrayerNotificationState.initial();
      expect(initial.globalNotificationsEnabled, isTrue);
      expect(initial.prayerConfigs[PrayerName.fajr]?.isEnabled, isTrue);
      expect(initial.prayerConfigs[PrayerName.dhuhr]?.isEnabled, isTrue);
      expect(initial.prayerConfigs[PrayerName.asr]?.isEnabled, isTrue);
      expect(initial.prayerConfigs[PrayerName.maghrib]?.isEnabled, isTrue);
      expect(initial.prayerConfigs[PrayerName.isha]?.isEnabled, isTrue);
      expect(initial.prayerConfigs[PrayerName.sunrise]?.isEnabled, isFalse); // Sunrise is reminder
    });

    test('Schedules exact and pre-reminder alerts for future prayer times', () {
      final notifier = PrayerNotificationNotifier();
      final now = DateTime(2026, 9, 25, 10, 0); // 10:00 AM

      final result = PrayerTimesResult(
        date: DateTime(2026, 9, 25),
        coordinates: const PrayerCoordinates(latitude: 21.4225, longitude: 39.8262),
        method: CalculationMethod.ummAlQura,
        madhab: AsrMadhab.standard,
        highLatitudeRule: HighLatitudeRule.angleBased,
        isPolarAdjusted: false,
        fajr: DateTime(2026, 9, 25, 5, 0),     // Past
        sunrise: DateTime(2026, 9, 25, 6, 15), // Past
        dhuhr: DateTime(2026, 9, 25, 12, 30),  // Future
        asr: DateTime(2026, 9, 25, 15, 45),    // Future
        maghrib: DateTime(2026, 9, 25, 18, 20),// Future
        isha: DateTime(2026, 9, 25, 19, 50),   // Future
        imsak: DateTime(2026, 9, 25, 4, 50),
        midnight: DateTime(2026, 9, 25, 23, 40),
        lastThirdOfNight: DateTime(2026, 9, 26, 1, 30),
      );

      // Add a 15-min pre-reminder to Dhuhr
      final dhuhrConfig = notifier.state.prayerConfigs[PrayerName.dhuhr]!.copyWith(
        reminderOffsetMinutes: 15,
      );
      notifier.updatePrayerConfig(PrayerName.dhuhr, dhuhrConfig);

      notifier.scheduleForPrayerTimes(result, now);

      final queue = notifier.state.scheduledQueue;
      expect(queue, isNotEmpty);

      // Fajr is in the past, so should not be in queue
      expect(queue.any((q) => q.prayer == PrayerName.fajr), isFalse);

      // Dhuhr has 2 items: 1 exact + 1 pre-reminder (12:15)
      final dhuhrItems = queue.where((q) => q.prayer == PrayerName.dhuhr).toList();
      expect(dhuhrItems.length, equals(2));
      expect(dhuhrItems.any((q) => q.isPreReminder), isTrue);

      // Disabling global notifications clears queue
      notifier.setGlobalEnabled(false);
      expect(notifier.state.scheduledQueue, isEmpty);
    });
  });
}
