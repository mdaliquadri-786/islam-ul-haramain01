import 'dart:math' as math;

/// Astronomical and mathematical constants for solar and prayer calculations.
class AstronomicalConstants {
  const AstronomicalConstants._();

  /// Mean radius of the Earth in kilometers (IUGG standard).
  static const double earthRadiusKm = 6371.0;

  /// Standard solar atmospheric refraction + semidiameter at horizon in degrees.
  static const double standardHorizonAltitude = -0.8333;

  /// Dhuhr precaution delay in minutes after true solar transit.
  static const double defaultDhuhrPrecautionMinutes = 1.0;

  /// Default Imsak precaution interval before Fajr in minutes.
  static const double defaultImsakIntervalMinutes = 10.0;

  /// Maximum safe latitude before applying polar day/night approximation.
  static const double maxAstronomicalLatitude = 48.5;

  /// J2000.0 astronomical epoch Julian day.
  static const double j2000Epoch = 2451545.0;

  /// Canonical Kaaba coordinates in Makkah al-Mukarramah.
  static const double kaabaLatitude = 21.422487;
  static const double kaabaLongitude = 39.826206;
  static const double kaabaElevation = 304.0;
}

/// Converts degrees to radians.
double toRad(double degrees) => (degrees * math.pi) / 180.0;

/// Converts radians to degrees.
double toDeg(double radians) => (radians * 180.0) / math.pi;

/// Normalizes an angle in degrees into [0.0, 360.0).
double fixAngle(double degrees) {
  final a = degrees % 360.0;
  return a < 0 ? a + 360.0 : a;
}

/// Normalizes decimal hours into [0.0, 24.0).
double fixHour(double hours) {
  final h = hours % 24.0;
  return h < 0 ? h + 24.0 : h;
}

/// Calculates the Julian Day for a given Gregorian date and UTC hour.
double julianDay(int year, int month, int day, [double hourUtc = 12.0]) {
  var y = year;
  var m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  final a = (y / 100).floor();
  final b = 2 - a + (a / 4).floor();
  final jd = (365.25 * (y + 4716)).floor() +
      (30.6001 * (m + 1)).floor() +
      day +
      b -
      1524.5 +
      (hourUtc / 24.0);
  return jd;
}

/// Solar coordinates bundle holding declination, right ascension, and equation of time.
class SolarCoordinates {
  final double declination; // In degrees
  final double rightAscension; // In degrees
  final double equationOfTime; // In minutes

  const SolarCoordinates({
    required this.declination,
    required this.rightAscension,
    required this.equationOfTime,
  });
}

/// Computes solar declination and equation of time using Jean Meeus algorithms.
SolarCoordinates sunCoordinates(double jd) {
  final d = jd - AstronomicalConstants.j2000Epoch;
  final t = d / 36525.0; // Julian centuries since J2000.0

  // Geometric mean longitude of the Sun (degrees)
  final l0 = fixAngle(280.46646 + 36000.76983 * t + 0.0003032 * t * t);

  // Mean anomaly of the Sun (degrees)
  final m = fixAngle(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  final mRad = toRad(m);

  // Sun equation of center (degrees)
  final c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * math.sin(mRad) +
      (0.019993 - 0.000101 * t) * math.sin(2 * mRad) +
      0.000289 * math.sin(3 * mRad);

  // Sun true longitude (degrees)
  final trueLong = fixAngle(l0 + c);

  // Apparent longitude correcting for nutation and aberration
  final omega = 125.04 - 1934.136 * t;
  final lambda = fixAngle(trueLong - 0.00569 - 0.00478 * math.sin(toRad(omega)));
  final lambdaRad = toRad(lambda);

  // Mean obliquity of the ecliptic (degrees)
  final eps0 = 23.439291 - 0.0130042 * t - 0.00000016 * t * t + 0.000000504 * t * t * t;
  final eps = eps0 + 0.00256 * math.cos(toRad(omega));
  final epsRad = toRad(eps);

  // Declination (degrees)
  final sinDec = math.sin(epsRad) * math.sin(lambdaRad);
  final declination = toDeg(math.asin(sinDec.clamp(-1.0, 1.0)));

  // Right Ascension (degrees)
  final raRad = math.atan2(math.cos(epsRad) * math.sin(lambdaRad), math.cos(lambdaRad));
  final rightAscension = fixAngle(toDeg(raRad));

  // Equation of Time (minutes)
  final y = math.pow(math.tan(epsRad / 2.0), 2).toDouble();
  final e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  final l0Rad = toRad(l0);

  final eot = 4.0 *
      toDeg(
        y * math.sin(2.0 * l0Rad) -
            2.0 * e * math.sin(mRad) +
            4.0 * e * y * math.sin(mRad) * math.cos(2.0 * l0Rad) -
            0.5 * (y * y) * math.sin(4.0 * l0Rad) -
            1.25 * (e * e) * math.sin(2.0 * mRad),
      );

  return SolarCoordinates(
    declination: declination,
    rightAscension: rightAscension,
    equationOfTime: eot,
  );
}

/// Calculates local solar transit (solar noon) in decimal hours of the local day.
double solarTransit(double longitude, double timezoneOffsetHours, double eotMinutes) {
  return 12.0 + timezoneOffsetHours - (longitude / 15.0) - (eotMinutes / 60.0);
}

/// Calculates the hour angle (in decimal hours) for a given solar altitude angle.
/// Returns null if the sun never reaches the specified altitude (polar day/night).
double? hourAngle(double latitude, double declination, double altitudeDegrees) {
  final phi = toRad(latitude);
  final delta = toRad(declination);
  final alpha = toRad(altitudeDegrees);

  final cosH = (math.sin(alpha) - math.sin(phi) * math.sin(delta)) /
      (math.cos(phi) * math.cos(delta));

  if (cosH > 1.0 || cosH < -1.0) {
    return null; // Sun never reaches this altitude
  }

  final hRad = math.acos(cosH);
  return toDeg(hRad) / 15.0; // Convert degrees to hours (15 deg = 1 hr)
}

/// Calculates the solar altitude angle for Asr based on shadow factor.
/// Shadow factor N = 1 (Standard / Shafi'i, Maliki, Hanbali) or N = 2 (Hanafi).
double asrAltitude(double latitude, double declination, double shadowFactor) {
  final d = (latitude - declination).abs();
  final shadowAtNoon = math.tan(toRad(d));
  final totalShadow = shadowFactor + shadowAtNoon;
  final altitudeRad = math.atan(1.0 / totalShadow);
  return toDeg(altitudeRad);
}

/// Evaluates horizon dip adjustment due to observer elevation above sea level.
double horizonDip([double elevationMeters = 0.0]) {
  if (elevationMeters <= 0) return 0.0;
  return 0.0347 * math.sqrt(elevationMeters);
}

/// Clamps latitude for extreme polar regions where 24h perpetual day or night occurs,
/// adopting the nearest latitude convention established by the Islamic Fiqh Academy.
double clampLatitudeForPolar(double latitude, double declination) {
  final phi = toRad(latitude);
  final delta = toRad(declination);
  final cosSunrise = (math.sin(toRad(AstronomicalConstants.standardHorizonAltitude)) -
          math.sin(phi) * math.sin(delta)) /
      (math.cos(phi) * math.cos(delta));

  if (cosSunrise > 1.0 ||
      cosSunrise < -1.0 ||
      latitude.abs() > AstronomicalConstants.maxAstronomicalLatitude) {
    return latitude.sign * AstronomicalConstants.maxAstronomicalLatitude;
  }
  return latitude;
}
