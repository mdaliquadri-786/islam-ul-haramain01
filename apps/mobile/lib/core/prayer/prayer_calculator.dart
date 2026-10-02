import 'astronomy_calculator.dart';
import 'prayer_models.dart';

/// Core deterministic calculation engine for Islamic prayer times.
class PrayerCalculator {
  const PrayerCalculator._();

  /// Calculates prayer times for the specified date and parameters.
  static PrayerTimesResult calculate({
    required DateTime date,
    required PrayerCoordinates coordinates,
    CalculationMethod method = CalculationMethod.mwl,
    AsrMadhab madhab = AsrMadhab.standard,
    HighLatitudeRule highLatitudeRule = HighLatitudeRule.angleBased,
    MinuteOffsets offsets = const MinuteOffsets.zero(),
    double? customFajrAngle,
    double? customIshaAngle,
    double? customIshaIntervalMinutes,
    double? timezoneOffsetHours,
  }) {
    final year = date.year;
    final month = date.month;
    final day = date.day;

    // Resolve timezone offset: use passed value or estimate from longitude
    final tzOffset = timezoneOffsetHours ??
        (date.timeZoneOffset.inMinutes / 60.0);

    final fajrAngle = customFajrAngle ?? method.fajrAngle;
    final ishaAngle = customIshaAngle ?? method.ishaAngle;
    final ishaIntervalMinutes = customIshaIntervalMinutes ?? method.ishaIntervalMinutes;

    // 1. Initial Julian Day at approximate local noon (in UTC)
    final approxNoonUtcHour = 12.0 - (coordinates.longitude / 15.0);
    final jdNoon = julianDay(year, month, day, approxNoonUtcHour);

    // 2. Solar coordinates at noon
    final solarNoonCoords = sunCoordinates(jdNoon);
    final initialTransit = solarTransit(
      coordinates.longitude,
      tzOffset,
      solarNoonCoords.equationOfTime,
    );

    // 3. Polar latitude safety clamp
    final effectiveLat = clampLatitudeForPolar(
      coordinates.latitude,
      solarNoonCoords.declination,
    );
    final isPolarAdjusted = effectiveLat != coordinates.latitude;

    // Horizon angle with elevation adjustment
    final dip = horizonDip(coordinates.elevation);
    final horizonAlt = AstronomicalConstants.standardHorizonAltitude - dip;

    // 4. Pass 1: Compute approximate times using solar noon coordinates
    final hSunApprox = hourAngle(effectiveLat, solarNoonCoords.declination, horizonAlt);
    final hSun = hSunApprox ?? 6.0; // fallback to 6 hours if extreme

    final approxSunrise = initialTransit - hSun;
    final approxSunset = initialTransit + hSun;

    // Night duration in hours (Sunset to Sunrise)
    var nightDuration = 24.0 - (approxSunset - approxSunrise);
    if (nightDuration <= 0) nightDuration = 24.0;

    // Fajr Hour Angle
    final hFajrApprox = hourAngle(effectiveLat, solarNoonCoords.declination, -fajrAngle);
    double? rawFajr = hFajrApprox != null ? initialTransit - hFajrApprox : null;

    // Asr Hour Angle
    final asrAltDeg = asrAltitude(effectiveLat, solarNoonCoords.declination, madhab.shadowFactor);
    final hAsrApprox = hourAngle(effectiveLat, solarNoonCoords.declination, asrAltDeg);
    final rawAsr = initialTransit + (hAsrApprox ?? 3.5);

    // Maghrib
    final rawMaghrib = approxSunset;

    // Isha
    double? rawIsha;
    if (ishaIntervalMinutes != null) {
      rawIsha = rawMaghrib + (ishaIntervalMinutes / 60.0);
    } else if (ishaAngle != null) {
      final hIshaApprox = hourAngle(effectiveLat, solarNoonCoords.declination, -ishaAngle);
      if (hIshaApprox != null) rawIsha = initialTransit + hIshaApprox;
    }

    // 5. Apply High-Latitude Rules if twilight angle fails or exceeds limit
    var highLatApplied = isPolarAdjusted;

    double calcNightPortion(double angle) {
      switch (highLatitudeRule) {
        case HighLatitudeRule.midnight:
          return nightDuration / 2.0;
        case HighLatitudeRule.oneSeventh:
          return nightDuration / 7.0;
        case HighLatitudeRule.angleBased:
        case HighLatitudeRule.none:
          return (angle / 60.0) * nightDuration;
      }
    }

    final fajrPortion = calcNightPortion(fajrAngle);
    final ishaAngleForPortion = ishaAngle ?? 18.0;
    final ishaPortion = calcNightPortion(ishaAngleForPortion);

    if (rawFajr == null || rawFajr < (approxSunrise - fajrPortion)) {
      if (highLatitudeRule != HighLatitudeRule.none) {
        rawFajr = approxSunrise - fajrPortion;
        highLatApplied = true;
      } else {
        rawFajr ??= approxSunrise - fajrPortion;
      }
    }

    if (rawIsha == null || (ishaAngle != null && rawIsha > (rawMaghrib + ishaPortion))) {
      if (highLatitudeRule != HighLatitudeRule.none && ishaIntervalMinutes == null) {
        rawIsha = rawMaghrib + ishaPortion;
        highLatApplied = true;
      } else {
        rawIsha ??= rawMaghrib + ishaPortion;
      }
    }

    // 6. Refinement Pass (Pass 2): re-evaluate sun coordinates at estimated times
    double refineTime(double initialTime, double angleDeg, bool isMorning) {
      final utcHour = initialTime - tzOffset;
      final jd = julianDay(year, month, day, utcHour);
      final coords = sunCoordinates(jd);
      final transit = solarTransit(coordinates.longitude, tzOffset, coords.equationOfTime);
      final h = hourAngle(effectiveLat, coords.declination, angleDeg);
      if (h == null) return initialTime;
      return isMorning ? transit - h : transit + h;
    }

    final refinedSunrise = refineTime(approxSunrise, horizonAlt, true);
    final refinedSunset = refineTime(approxSunset, horizonAlt, false);
    final refinedTransit = initialTransit +
        (AstronomicalConstants.defaultDhuhrPrecautionMinutes / 60.0);

    var finalFajr = rawFajr;
    if (hFajrApprox != null && !highLatApplied) {
      finalFajr = refineTime(rawFajr, -fajrAngle, true);
    }

    final finalAsr = refineTime(rawAsr, asrAltDeg, false);

    var finalMaghrib = refinedSunset;

    var finalIsha = rawIsha;
    if (ishaIntervalMinutes != null) {
      finalIsha = finalMaghrib + (ishaIntervalMinutes / 60.0);
    } else if (ishaAngle != null && !highLatApplied) {
      finalIsha = refineTime(rawIsha, -ishaAngle, false);
    }

    // Devotional milestones
    final finalImsak = finalFajr - (AstronomicalConstants.defaultImsakIntervalMinutes / 60.0);
    final finalMidnight = finalMaghrib + (nightDuration / 2.0);
    final finalLastThird = finalMaghrib + (nightDuration * (2.0 / 3.0));

    // Convert decimal hours to DateTime applying user minute offsets
    DateTime toLocalTime(double decimalHours, int minuteOffset) {
      final totalMinutes = (decimalHours * 60.0).round() + minuteOffset;
      var days = totalMinutes ~/ 1440;
      var remMinutes = totalMinutes % 1440;
      if (remMinutes < 0) {
        remMinutes += 1440;
        days -= 1;
      }
      final h = remMinutes ~/ 60;
      final m = remMinutes % 60;
      return DateTime(year, month, day, h, m).add(Duration(days: days));
    }

    return PrayerTimesResult(
      date: DateTime(year, month, day),
      coordinates: coordinates,
      method: method,
      madhab: madhab,
      highLatitudeRule: highLatitudeRule,
      isPolarAdjusted: isPolarAdjusted,
      fajr: toLocalTime(finalFajr, offsets.fajr),
      sunrise: toLocalTime(refinedSunrise, offsets.sunrise),
      dhuhr: toLocalTime(refinedTransit, offsets.dhuhr),
      asr: toLocalTime(finalAsr, offsets.asr),
      maghrib: toLocalTime(finalMaghrib, offsets.maghrib),
      isha: toLocalTime(finalIsha, offsets.isha),
      imsak: toLocalTime(finalImsak, 0),
      midnight: toLocalTime(finalMidnight, 0),
      lastThirdOfNight: toLocalTime(finalLastThird, 0),
    );
  }

  /// Calculates the next prayer and remaining duration relative to [now].
  static NextPrayerInfo calculateNextPrayer(
    PrayerTimesResult result, [
    DateTime? now,
  ]) {
    final current = now ?? DateTime.now();

    PrayerName? currentPrayer;
    PrayerName nextPrayer = PrayerName.fajr;
    DateTime nextTime = result.fajr;
    DateTime prevTime = result.isha.subtract(const Duration(days: 1));

    if (current.isBefore(result.fajr)) {
      currentPrayer = PrayerName.isha;
      nextPrayer = PrayerName.fajr;
      nextTime = result.fajr;
      prevTime = result.isha.subtract(const Duration(days: 1));
    } else if (current.isBefore(result.sunrise)) {
      currentPrayer = PrayerName.fajr;
      nextPrayer = PrayerName.sunrise;
      nextTime = result.sunrise;
      prevTime = result.fajr;
    } else if (current.isBefore(result.dhuhr)) {
      currentPrayer = PrayerName.sunrise;
      nextPrayer = PrayerName.dhuhr;
      nextTime = result.dhuhr;
      prevTime = result.sunrise;
    } else if (current.isBefore(result.asr)) {
      currentPrayer = PrayerName.dhuhr;
      nextPrayer = PrayerName.asr;
      nextTime = result.asr;
      prevTime = result.dhuhr;
    } else if (current.isBefore(result.maghrib)) {
      currentPrayer = PrayerName.asr;
      nextPrayer = PrayerName.maghrib;
      nextTime = result.maghrib;
      prevTime = result.asr;
    } else if (current.isBefore(result.isha)) {
      currentPrayer = PrayerName.maghrib;
      nextPrayer = PrayerName.isha;
      nextTime = result.isha;
      prevTime = result.maghrib;
    } else {
      // After Isha: next is tomorrow's Fajr
      currentPrayer = PrayerName.isha;
      nextPrayer = PrayerName.fajr;
      nextTime = result.fajr.add(const Duration(days: 1));
      prevTime = result.isha;
    }

    final diff = nextTime.difference(current);
    final totalSpan = nextTime.difference(prevTime).inSeconds;
    final elapsedSpan = current.difference(prevTime).inSeconds;
    final progress = totalSpan > 0 ? (elapsedSpan / totalSpan).clamp(0.0, 1.0) : 0.0;

    return NextPrayerInfo(
      currentPrayer: currentPrayer,
      nextPrayer: nextPrayer,
      nextPrayerTime: nextTime,
      timeRemaining: diff.isNegative ? Duration.zero : diff,
      progressFraction: progress,
    );
  }
}
