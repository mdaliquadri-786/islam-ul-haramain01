import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/prayer/qibla_calculator.dart';
import 'package:islamic_mobile/core/prayer/astronomy_calculator.dart';

void main() {
  group('QiblaCalculator Great-Circle Bearing and Distance Tests', () {
    test('Proximity within Kaaba courtyard (<100m) returns isAtKaaba true', () {
      // 20 meters from Kaaba
      final lat = AstronomicalConstants.kaabaLatitude + 0.0001;
      final lng = AstronomicalConstants.kaabaLongitude + 0.0001;

      final result = QiblaCalculator.calculate(lat, lng);
      expect(result.isAtKaaba, isTrue);
      expect(result.cardinalDirection, equals('KAABA'));
      expect(result.distanceKm, lessThan(0.1));
    });

    test('Madinah Qibla is southward (~175 degrees)', () {
      // Madinah: 24.4672° N, 39.6111° E (nearly due north of Makkah)
      final result = QiblaCalculator.calculate(24.4672, 39.6111);
      expect(result.directionDegrees, inInclusiveRange(170.0, 180.0));
      expect(result.cardinalDirection, anyOf('S', 'SSW', 'SSE'));
      expect(result.distanceKm, inInclusiveRange(300.0, 400.0));
      expect(result.isAtKaaba, isFalse);
    });

    test('Jerusalem Qibla is south-southeast (~155 degrees)', () {
      final result = QiblaCalculator.calculate(31.7683, 35.2137);
      expect(result.directionDegrees, inInclusiveRange(150.0, 160.0));
      expect(result.cardinalDirection, equals('SSE'));
      expect(result.distanceKm, inInclusiveRange(1200.0, 1300.0));
    });

    test('Cairo Qibla is southeast (~136 degrees)', () {
      final result = QiblaCalculator.calculate(30.0444, 31.2357);
      expect(result.directionDegrees, inInclusiveRange(130.0, 140.0));
      expect(result.cardinalDirection, equals('SE'));
      expect(result.distanceKm, inInclusiveRange(1200.0, 1350.0));
    });

    test('London Qibla is east-southeast (~119 degrees)', () {
      final result = QiblaCalculator.calculate(51.5074, -0.1278);
      expect(result.directionDegrees, inInclusiveRange(115.0, 125.0));
      expect(result.cardinalDirection, anyOf('ESE', 'SE'));
      expect(result.distanceKm, inInclusiveRange(4700.0, 4900.0));
    });

    test('New York Qibla is east-northeast (~58 degrees)', () {
      final result = QiblaCalculator.calculate(40.7128, -74.0060);
      // Great-circle forward azimuth from NYC to Makkah goes over NE
      expect(result.directionDegrees, inInclusiveRange(55.0, 62.0));
      expect(result.cardinalDirection, equals('ENE'));
      expect(result.distanceKm, inInclusiveRange(10000.0, 10500.0));
    });

    test('Hyderabad Qibla is west-northwest (~282 degrees)', () {
      final result = QiblaCalculator.calculate(17.3850, 78.4867);
      expect(result.directionDegrees, inInclusiveRange(280.0, 285.0));
      expect(result.cardinalDirection, equals('WNW'));
      expect(result.distanceKm, inInclusiveRange(4000.0, 4200.0));
    });

    test('Antipodal point is detected correctly', () {
      // Antipode of Kaaba is around -21.4225, -140.1738 in South Pacific
      final result = QiblaCalculator.calculate(-21.422487, -140.173794);
      // Distance is approximately half circumference of Earth (~20,015 km)
      expect(result.distanceKm, inInclusiveRange(19900.0, 20100.0));
      expect(result.cardinalDirection, equals('ANTIPODE'));
    });

    test('calculateRelativeAngle handles wrap-around within [-180, 180]', () {
      // Qibla at 120, Heading at 100 -> relative +20 (turn right 20)
      expect(QiblaCalculator.calculateRelativeAngle(120.0, 100.0), closeTo(20.0, 1e-6));

      // Qibla at 10, Heading at 350 -> difference is +20 (turn right 20)
      expect(QiblaCalculator.calculateRelativeAngle(10.0, 350.0), closeTo(20.0, 1e-6));

      // Qibla at 350, Heading at 10 -> difference is -20 (turn left 20)
      expect(QiblaCalculator.calculateRelativeAngle(350.0, 10.0), closeTo(-20.0, 1e-6));
    });

    test('isAligned honors +-3.0 degree threshold', () {
      const qibla = 118.5;

      expect(QiblaCalculator.isAligned(qibla, 118.5, 3.0), isTrue); // Exact
      expect(QiblaCalculator.isAligned(qibla, 120.5, 3.0), isTrue); // +2.0
      expect(QiblaCalculator.isAligned(qibla, 116.0, 3.0), isTrue); // -2.5
      expect(QiblaCalculator.isAligned(qibla, 122.0, 3.0), isFalse); // +3.5
      expect(QiblaCalculator.isAligned(qibla, 114.0, 3.0), isFalse); // -4.5

      // Wrap-around edge near 0/360
      expect(QiblaCalculator.isAligned(1.0, 359.0, 3.0), isTrue); // 2 deg diff
      expect(QiblaCalculator.isAligned(1.0, 355.0, 3.0), isFalse); // 6 deg diff
    });
  });
}
