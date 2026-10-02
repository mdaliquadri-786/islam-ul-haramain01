/**
 * @file prayer-astronomy.test.ts
 * @package @islamic/islamic-engine
 * @description Unit tests for astronomical algorithms, Julian day, solar coordinates,
 * Equation of Time, and hour angles.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  julianDay,
  sunCoordinates,
  solarTransit,
  hourAngle,
  asrAltitude,
  horizonDip,
  nightPortion,
  clampLatitudeForPolar,
  toRad,
  toDeg,
  fixAngle,
  fixHour
} from '../src/prayer/astronomy';
import { ASTRONOMICAL_CONSTANTS } from '../src/prayer/constants';

describe('Astronomical Foundations & Formulas', () => {
  it('should correctly calculate Julian Day for known epoch references', () => {
    // J2000.0 epoch: 2000-01-01 at 12:00 UTC = JD 2451545.0
    const jd2000 = julianDay(2000, 1, 1, 12.0);
    assert.strictEqual(jd2000, 2451545.0);

    // Standard reference: 2026-09-24 at 12:00 UTC
    const jd2026 = julianDay(2026, 9, 24, 12.0);
    assert.ok(jd2026 > 2451545.0);
    assert.strictEqual(Math.floor(jd2026), 2461308);
  });

  it('should calculate solar declination accurately on equinoxes and solstices', () => {
    // Autumnal equinox (late September): declination near 0 degrees (within +/- 2 degrees)
    const jdEquinox = julianDay(2026, 9, 24, 12.0);
    const sunEquinox = sunCoordinates(jdEquinox);
    assert.ok(Math.abs(sunEquinox.declination) < 2.0, `Expected declination near 0, got ${sunEquinox.declination}`);

    // Summer solstice (late June): declination near +23.44 degrees
    const jdSummer = julianDay(2026, 6, 21, 12.0);
    const sunSummer = sunCoordinates(jdSummer);
    assert.ok(Math.abs(sunSummer.declination - 23.44) < 0.2, `Expected ~23.44, got ${sunSummer.declination}`);

    // Winter solstice (late December): declination near -23.44 degrees
    const jdWinter = julianDay(2026, 12, 21, 12.0);
    const sunWinter = sunCoordinates(jdWinter);
    assert.ok(Math.abs(sunWinter.declination - (-23.44)) < 0.2, `Expected ~ -23.44, got ${sunWinter.declination}`);
  });

  it('should calculate Equation of Time within standard almanac range (-15 to +17 minutes)', () => {
    // Test on multiple months across the year
    for (let month = 1; month <= 12; month++) {
      const jd = julianDay(2026, month, 15, 12.0);
      const sun = sunCoordinates(jd);
      assert.ok(
        sun.equationOfTime >= -16.0 && sun.equationOfTime <= 18.0,
        `EoT out of expected range for month ${month}: ${sun.equationOfTime}`
      );
    }
  });

  it('should calculate solar transit correctly for positive and negative longitudes', () => {
    // Greenwich Meridian (0 deg), UTC+0, EoT = 0 -> transit = 12.0
    const transitGreenwich = solarTransit(0, 0, 0);
    assert.strictEqual(transitGreenwich, 12.0);

    // Makkah: longitude 39.8262, UTC+3, EoT = 0
    // Longitude in hours = 39.8262 / 15 = 2.65508 hours
    // Transit = 12 + 3 - 2.65508 = 12.3449 hours (~12:21)
    const transitMakkah = solarTransit(39.8262, 3, 0);
    assert.ok(Math.abs(transitMakkah - 12.345) < 0.01);

    // New York: longitude -74.0060, UTC-5, EoT = 0
    // Longitude in hours = -74.0060 / 15 = -4.9337 hours
    // Transit = 12 + (-5) - (-4.9337) = 11.9337 hours (~11:56)
    const transitNY = solarTransit(-74.0060, -5, 0);
    assert.ok(Math.abs(transitNY - 11.934) < 0.01);
  });

  it('should compute hour angle and identify polar limits correctly', () => {
    // Normal case: Latitude 21.42 (Makkah), declination 0, sunrise angle -0.8333
    const h = hourAngle(21.42, 0, -0.8333);
    assert.ok(h !== null);
    assert.ok(h > 5.9 && h < 6.1, `Expected ~6.0 hours, got ${h}`);

    // Extreme polar day: Latitude 80 N, declination +23.44 N, sunrise angle -0.8333
    // Sun never sets -> cosH < -1.0 -> returns null
    const hPolarDay = hourAngle(80.0, 23.44, -0.8333);
    assert.strictEqual(hPolarDay, null);

    // Extreme polar night: Latitude 80 N, declination -23.44 S, sunrise angle -0.8333
    // Sun never rises -> cosH > 1.0 -> returns null
    const hPolarNight = hourAngle(80.0, -23.44, -0.8333);
    assert.strictEqual(hPolarNight, null);
  });

  it('should calculate Asr altitude for Standard (1x) and Hanafi (2x) correctly', () => {
    // Equinox (declination = 0), Latitude = 30 N
    // Standard: shadow = 1 + tan(30) = 1 + 0.577 = 1.577 -> atan(1 / 1.577) = 32.38 degrees
    const altStd = asrAltitude(30.0, 0, 1.0);
    assert.ok(Math.abs(altStd - 32.38) < 0.1, `Expected ~32.38, got ${altStd}`);

    // Hanafi: shadow = 2 + tan(30) = 2 + 0.577 = 2.577 -> atan(1 / 2.577) = 21.20 degrees
    const altHanafi = asrAltitude(30.0, 0, 2.0);
    assert.ok(Math.abs(altHanafi - 21.20) < 0.1, `Expected ~21.20, got ${altHanafi}`);

    // Hanafi altitude must always be lower than Standard altitude (sun lower in sky = later time)
    assert.ok(altHanafi < altStd);
  });

  it('should adjust horizon dip for elevation above sea level', () => {
    assert.strictEqual(horizonDip(0), 0);
    assert.strictEqual(horizonDip(-10), 0);
    // 100 meters elevation: dip = 0.0347 * sqrt(100) = 0.347 degrees
    const dip100 = horizonDip(100);
    assert.ok(Math.abs(dip100 - 0.347) < 0.001);
  });

  it('should compute night portions for all 3 high-latitude rules', () => {
    const nightDuration = 6.0; // 6-hour night

    // Half night (midnight): portion = 6 / 2 = 3.0 hours
    assert.strictEqual(nightPortion('midnight', 18, nightDuration), 3.0);

    // One-seventh: portion = 6 / 7 = 0.857 hours
    const oneSeventh = nightPortion('one_seventh', 18, nightDuration);
    assert.ok(Math.abs(oneSeventh - (6.0 / 7.0)) < 0.0001);

    // Angle-based: portion = (18 / 60) * 6.0 = 1.8 hours
    const angleBased = nightPortion('angle_based', 18, nightDuration);
    assert.ok(Math.abs(angleBased - 1.8) < 1e-9);
  });

  it('should clamp latitude safely for extreme polar regions', () => {
    // Normal latitude: unchanged
    assert.strictEqual(clampLatitudeForPolar(21.42, 0), 21.42);
    assert.strictEqual(clampLatitudeForPolar(45.0, 10.0), 45.0);

    // Extreme latitude (> 48.5 deg or polar conditions)
    const clampedNorth = clampLatitudeForPolar(75.0, 23.44);
    assert.strictEqual(clampedNorth, ASTRONOMICAL_CONSTANTS.MAX_ASTRONOMICAL_LATITUDE);

    const clampedSouth = clampLatitudeForPolar(-75.0, -23.44);
    assert.strictEqual(clampedSouth, -ASTRONOMICAL_CONSTANTS.MAX_ASTRONOMICAL_LATITUDE);
  });

  it('should correctly fix angle and hour wrapping', () => {
    assert.strictEqual(fixAngle(370), 10);
    assert.strictEqual(fixAngle(-10), 350);
    assert.strictEqual(fixHour(25.5), 1.5);
    assert.strictEqual(fixHour(-1.5), 22.5);
  });
});
