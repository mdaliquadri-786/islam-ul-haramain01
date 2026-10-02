import 'dart:math' as math;
import 'astronomy_calculator.dart';

/// 16-point cardinal direction compass sectors.
const kCompassCardinals = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

/// Result bundle containing Great-Circle Qibla direction, distance, and cardinal mapping.
class QiblaResult {
  /// Forward azimuth to Kaaba in degrees [0.0, 360.0).
  final double directionDegrees;

  /// 16-point cardinal compass text (e.g. "NE", "SSE", or "KAABA").
  final String cardinalDirection;

  /// Geodesic distance to Kaaba in kilometers.
  final double distanceKm;

  /// True if observer is within 100 meters of the Holy Kaaba.
  final bool isAtKaaba;

  const QiblaResult({
    required this.directionDegrees,
    required this.cardinalDirection,
    required this.distanceKm,
    this.isAtKaaba = false,
  });
}

/// Deterministic mathematical engine for Qibla bearing and distance calculations.
class QiblaCalculator {
  const QiblaCalculator._();

  /// Calculates the Great-Circle initial bearing and distance from coordinates to Kaaba.
  static QiblaResult calculate(double latitude, double longitude) {
    if (!latitude.isFinite || !longitude.isFinite) {
      throw ArgumentError('Coordinates must be finite numbers: lat=$latitude, lng=$longitude');
    }

    // Normalize longitude to [-180.0, 180.0]
    var normLng = longitude % 360.0;
    if (normLng > 180.0) normLng -= 360.0;
    if (normLng < -180.0) normLng += 360.0;

    // Clamp latitude to [-90.0, 90.0]
    final normLat = latitude.clamp(-90.0, 90.0);

    const kLat = AstronomicalConstants.kaabaLatitude;
    const kLng = AstronomicalConstants.kaabaLongitude;

    // Great-Circle distance using Haversine formula
    final phi1 = toRad(normLat);
    final phi2 = toRad(kLat);
    final deltaPhi = toRad(kLat - normLat);
    final deltaLambda = toRad(kLng - normLng);

    final sinHalfPhi = math.sin(deltaPhi / 2.0);
    final sinHalfLambda = math.sin(deltaLambda / 2.0);

    final a = (sinHalfPhi * sinHalfPhi) +
        math.cos(phi1) * math.cos(phi2) * (sinHalfLambda * sinHalfLambda);
    final c = 2.0 * math.atan2(math.sqrt(a.clamp(0.0, 1.0)), math.sqrt((1.0 - a).clamp(0.0, 1.0)));
    final distanceKm = ((AstronomicalConstants.earthRadiusKm * c) * 100).round() / 100.0;

    // Proximity to Kaaba: within 100 meters (0.1 km)
    if (distanceKm < 0.1) {
      return QiblaResult(
        directionDegrees: 0.0,
        cardinalDirection: 'KAABA',
        distanceKm: distanceKm,
        isAtKaaba: true,
      );
    }

    // Antipodal point check: distance near half Earth circumference (~20,015 km)
    if ((distanceKm - (math.pi * AstronomicalConstants.earthRadiusKm)).abs() < 2.0) {
      return QiblaResult(
        directionDegrees: 0.0,
        cardinalDirection: 'ANTIPODE',
        distanceKm: distanceKm,
      );
    }

    // Forward Great-Circle bearing
    final y = math.sin(deltaLambda) * math.cos(phi2);
    final x = math.cos(phi1) * math.sin(phi2) -
        math.sin(phi1) * math.cos(phi2) * math.cos(deltaLambda);

    var bearing = toDeg(math.atan2(y, x));
    bearing = fixAngle(bearing);
    bearing = (bearing * 100).round() / 100.0;

    // 16-point cardinal compass sector lookup
    final sectorIndex = (fixAngle(bearing + 11.25) ~/ 22.5) % 16;
    final cardinal = kCompassCardinals[sectorIndex];

    return QiblaResult(
      directionDegrees: bearing,
      cardinalDirection: cardinal,
      distanceKm: distanceKm,
    );
  }

  /// Calculates the relative angle between Qibla bearing and device compass heading.
  /// Result is normalized into [-180.0, 180.0], where 0° means facing directly towards Qibla.
  static double calculateRelativeAngle(double qiblaBearing, double deviceHeading) {
    var diff = (qiblaBearing - deviceHeading) % 360.0;
    if (diff > 180.0) diff -= 360.0;
    if (diff < -180.0) diff += 360.0;
    return diff;
  }

  /// Checks if device is aligned with Qibla within the specified threshold (default ±3°).
  static bool isAligned(double qiblaBearing, double deviceHeading, [double thresholdDegrees = 3.0]) {
    final diff = calculateRelativeAngle(qiblaBearing, deviceHeading).abs();
    return diff <= thresholdDegrees;
  }
}
