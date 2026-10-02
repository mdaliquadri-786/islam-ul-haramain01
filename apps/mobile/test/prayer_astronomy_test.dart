import 'dart:math' as math;
import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/prayer/astronomy_calculator.dart';
import 'package:islamic_mobile/core/prayer/prayer_models.dart';
import 'package:islamic_mobile/core/prayer/prayer_calculator.dart';

void main() {
  group('Jean Meeus Astronomical Calculation Tests', () {
    test('julianDay matches standard astronomical reference', () {
      // J2000.0 epoch: 2000-01-01 12:00:00 UTC = 2451545.0 JD
      final jd2000 = julianDay(2000, 1, 1, 12.0);
      expect(jd2000, equals(2451545.0));

      // 2026-09-25 12:00:00 UTC
      final jd2026 = julianDay(2026, 9, 25, 12.0);
      expect(jd2026, greaterThan(2451545.0));
      expect(jd2026, lessThan(2470000.0));
    });

    test('toRad and toDeg convert angles accurately', () {
      expect(toRad(180.0), closeTo(math.pi, 1e-9));
      expect(toDeg(math.pi), closeTo(180.0, 1e-9));
      expect(toRad(90.0), closeTo(math.pi / 2, 1e-9));
      expect(toDeg(math.pi / 2), closeTo(90.0, 1e-9));
    });

    test('fixAngle and fixHour normalize negative and overflow values', () {
      expect(fixAngle(370.0), closeTo(10.0, 1e-9));
      expect(fixAngle(-30.0), closeTo(330.0, 1e-9));
      expect(fixAngle(720.0), closeTo(0.0, 1e-9));

      expect(fixHour(25.5), closeTo(1.5, 1e-9));
      expect(fixHour(-3.0), closeTo(21.0, 1e-9));
      expect(fixHour(48.0), closeTo(0.0, 1e-9));
    });

    test('sunCoordinates calculates declination and equation of time', () {
      // Autumnal Equinox approx Sept 22/23: declination near 0 degrees
      final jdEquinox = julianDay(2026, 9, 22, 12.0);
      final coordsEquinox = sunCoordinates(jdEquinox);
      expect(coordsEquinox.declination.abs(), lessThan(2.0)); // Near equator

      // Summer Solstice approx June 21: declination near +23.44 degrees
      final jdSummer = julianDay(2026, 6, 21, 12.0);
      final coordsSummer = sunCoordinates(jdSummer);
      expect(coordsSummer.declination, closeTo(23.44, 0.5));

      // Winter Solstice approx Dec 21: declination near -23.44 degrees
      final jdWinter = julianDay(2026, 12, 21, 12.0);
      final coordsWinter = sunCoordinates(jdWinter);
      expect(coordsWinter.declination, closeTo(-23.44, 0.5));
    });

    test('asrAltitude correctly differentiates Standard and Hanafi madhabs', () {
      const latitude = 21.4225; // Makkah
      const declination = 10.0;

      final standardAlt = asrAltitude(latitude, declination, AsrMadhab.standard.shadowFactor.toDouble());
      final hanafiAlt = asrAltitude(latitude, declination, AsrMadhab.hanafi.shadowFactor.toDouble());

      // In Hanafi madhab, shadow is longer, therefore sun altitude is lower
      expect(standardAlt, greaterThan(hanafiAlt));
      expect(standardAlt, greaterThan(0.0));
      expect(hanafiAlt, greaterThan(0.0));
    });

    test('clampLatitudeForPolar handles extreme northern/southern latitudes', () {
      const declination = 10.0;
      expect(clampLatitudeForPolar(45.0, declination), equals(45.0));
      expect(clampLatitudeForPolar(-40.0, declination), equals(-40.0));
      expect(clampLatitudeForPolar(65.0, declination), equals(AstronomicalConstants.maxAstronomicalLatitude));
      expect(clampLatitudeForPolar(-70.0, declination), equals(-AstronomicalConstants.maxAstronomicalLatitude));
    });
  });

  group('PrayerCalculator Deterministic Engine Tests', () {
    const makkahCoords = PrayerCoordinates(
      latitude: 21.4225,
      longitude: 39.8262,
      cityName: 'Makkah al-Mukarramah',
      timezoneId: 'Asia/Riyadh',
    );

    test('Makkah calculation produces valid, sequential prayer times', () {
      final date = DateTime(2026, 9, 25);
      final result = PrayerCalculator.calculate(
        coordinates: makkahCoords,
        date: date,
        method: CalculationMethod.ummAlQura,
        madhab: AsrMadhab.standard,
      );

      // Verify sequence: Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha
      expect(result.fajr.isBefore(result.sunrise), isTrue);
      expect(result.sunrise.isBefore(result.dhuhr), isTrue);
      expect(result.dhuhr.isBefore(result.asr), isTrue);
      expect(result.asr.isBefore(result.maghrib), isTrue);
      expect(result.maghrib.isBefore(result.isha), isTrue);

      // Verify devotional milestones
      expect(result.imsak.isBefore(result.fajr), isTrue);
      expect(result.midnight.isAfter(result.maghrib), isTrue);
      expect(result.lastThirdOfNight.isAfter(result.midnight), isTrue);
      expect(result.lastThirdOfNight.isBefore(result.fajr.add(const Duration(days: 1))), isTrue);
    });

    test('Umm al-Qura method applies 90 min Isha interval outside Ramadan', () {
      final date = DateTime(2026, 9, 25);
      final result = PrayerCalculator.calculate(
        coordinates: makkahCoords,
        date: date,
        method: CalculationMethod.ummAlQura,
        madhab: AsrMadhab.standard,
      );

      // Outside Ramadan, Umm al-Qura Isha is exactly 90 minutes after Maghrib
      final diff = result.isha.difference(result.maghrib).inMinutes;
      expect(diff, equals(90));
    });

    test('Hanafi Asr is strictly later than Standard Asr', () {
      final date = DateTime(2026, 9, 25);
      final standardResult = PrayerCalculator.calculate(
        coordinates: makkahCoords,
        date: date,
        method: CalculationMethod.ummAlQura,
        madhab: AsrMadhab.standard,
      );

      final hanafiResult = PrayerCalculator.calculate(
        coordinates: makkahCoords,
        date: date,
        method: CalculationMethod.ummAlQura,
        madhab: AsrMadhab.hanafi,
      );

      expect(hanafiResult.asr.isAfter(standardResult.asr), isTrue);
      // Usually ~45 to 60 minutes later
      final diffMinutes = hanafiResult.asr.difference(standardResult.asr).inMinutes;
      expect(diffMinutes, greaterThan(30));
    });

    test('Custom MinuteOffsets shifts prayer times accurately', () {
      final date = DateTime(2026, 9, 25);
      const offsets = MinuteOffsets(
        fajr: 5,
        maghrib: 3,
        isha: -2,
      );

      final baseline = PrayerCalculator.calculate(
        coordinates: makkahCoords,
        date: date,
        method: CalculationMethod.ummAlQura,
      );

      final adjusted = PrayerCalculator.calculate(
        coordinates: makkahCoords,
        date: date,
        method: CalculationMethod.ummAlQura,
        offsets: offsets,
      );

      expect(adjusted.fajr.difference(baseline.fajr).inMinutes, equals(5));
      expect(adjusted.maghrib.difference(baseline.maghrib).inMinutes, equals(3));
      expect(adjusted.isha.difference(baseline.isha).inMinutes, equals(-2));
      expect(adjusted.dhuhr, equals(baseline.dhuhr)); // Unshifted
    });

    test('All calculation methods run deterministically without errors', () {
      final date = DateTime(2026, 9, 25);
      for (final method in CalculationMethod.values) {
        if (method == CalculationMethod.custom) continue;
        final result = PrayerCalculator.calculate(
          coordinates: makkahCoords,
          date: date,
          method: method,
        );

        expect(result.fajr.isBefore(result.sunrise), isTrue);
        expect(result.dhuhr.isBefore(result.asr), isTrue);
        expect(result.asr.isBefore(result.maghrib), isTrue);
        expect(result.maghrib.isBefore(result.isha), isTrue);
      }
    });

    test('calculateNextPrayer accurately tracks current and upcoming prayer', () {
      final date = DateTime(2026, 9, 25);
      final result = PrayerCalculator.calculate(
        coordinates: makkahCoords,
        date: date,
        method: CalculationMethod.ummAlQura,
      );

      // Case 1: 10 minutes before Dhuhr
      final beforeDhuhr = result.dhuhr.subtract(const Duration(minutes: 10));
      final nextInfo1 = PrayerCalculator.calculateNextPrayer(result, beforeDhuhr);
      expect(nextInfo1.nextPrayer, equals(PrayerName.dhuhr));
      expect(nextInfo1.timeRemaining.inMinutes, equals(10));
      expect(nextInfo1.progressFraction, greaterThan(0.8));

      // Case 2: 15 minutes after Isha
      final afterIsha = result.isha.add(const Duration(minutes: 15));
      final nextInfo2 = PrayerCalculator.calculateNextPrayer(result, afterIsha);
      expect(nextInfo2.nextPrayer, equals(PrayerName.fajr));
      expect(nextInfo2.currentPrayer, equals(PrayerName.isha));
    });

    test('High-latitude location (Oslo) computes safely without crashing', () {
      const osloCoords = PrayerCoordinates(
        latitude: 59.9139,
        longitude: 10.7522,
        cityName: 'Oslo',
      );

      // Summer solstice in Oslo (extreme long daylight)
      final date = DateTime(2026, 6, 21);
      final result = PrayerCalculator.calculate(
        coordinates: osloCoords,
        date: date,
        method: CalculationMethod.mwl,
        highLatitudeRule: HighLatitudeRule.angleBased,
      );

      expect(result.fajr.isBefore(result.sunrise), isTrue);
      expect(result.maghrib.isBefore(result.isha), isTrue);
      expect(result.fajr.hour, inInclusiveRange(0, 8));
    });
  });
}
