/**
 * @file qibla.test.ts
 * @package @islamic/islamic-engine
 * @description Unit tests for Qibla Great-Circle bearing, cardinal directions,
 * distance calculation, and boundary edge cases.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateQibla } from '../src/prayer/qibla';
import { KAABA_COORDINATES } from '../src/prayer/constants';

describe('Qibla Engine: Great-Circle Calculations & Reference Citations', () => {
  it('should calculate accurate bearings for established global reference cities', () => {
    // London: Latitude 51.5074, Longitude -0.1278 -> Expected ~118.99 degrees (ESE)
    const london = calculateQibla(51.5074, -0.1278);
    assert.ok(Math.abs(london.directionDegrees - 118.99) < 0.2, `London bearing: ${london.directionDegrees}`);
    assert.strictEqual(london.cardinalDirection, 'ESE');
    assert.ok(london.distanceKm > 4700 && london.distanceKm < 4900);

    // New York: Latitude 40.7128, Longitude -74.0060 -> Expected ~58.48 degrees (ENE)
    const ny = calculateQibla(40.7128, -74.0060);
    assert.ok(Math.abs(ny.directionDegrees - 58.48) < 0.2, `New York bearing: ${ny.directionDegrees}`);
    assert.strictEqual(ny.cardinalDirection, 'ENE');
    assert.ok(ny.distanceKm > 10200 && ny.distanceKm < 10400);

    // Cairo: Latitude 30.0444, Longitude 31.2357 -> Expected ~136.14 degrees (SE)
    const cairo = calculateQibla(30.0444, 31.2357);
    assert.ok(Math.abs(cairo.directionDegrees - 136.14) < 0.2, `Cairo bearing: ${cairo.directionDegrees}`);
    assert.strictEqual(cairo.cardinalDirection, 'SE');
    assert.ok(cairo.distanceKm > 1200 && cairo.distanceKm < 1400);

    // Karachi: Latitude 24.8607, Longitude 67.0011 -> Expected ~267.74 degrees (W)
    const karachi = calculateQibla(24.8607, 67.0011);
    assert.ok(Math.abs(karachi.directionDegrees - 267.74) < 0.2, `Karachi bearing: ${karachi.directionDegrees}`);
    assert.strictEqual(karachi.cardinalDirection, 'W');
    assert.ok(karachi.distanceKm > 2700 && karachi.distanceKm < 2900);

    // Tokyo: Latitude 35.6762, Longitude 139.6503 -> Expected ~293.00 degrees (WNW)
    const tokyo = calculateQibla(35.6762, 139.6503);
    assert.ok(Math.abs(tokyo.directionDegrees - 293.00) < 0.2, `Tokyo bearing: ${tokyo.directionDegrees}`);
    assert.strictEqual(tokyo.cardinalDirection, 'WNW');
    assert.ok(tokyo.distanceKm > 9400 && tokyo.distanceKm < 9600);

    // Sydney: Latitude -33.8688, Longitude 151.2093 -> Expected ~277.50 degrees (W)
    const sydney = calculateQibla(-33.8688, 151.2093);
    assert.ok(Math.abs(sydney.directionDegrees - 277.50) < 0.5, `Sydney bearing: ${sydney.directionDegrees}`);
    assert.strictEqual(sydney.cardinalDirection, 'W');
    assert.ok(sydney.distanceKm > 13000 && sydney.distanceKm < 15000);
  });

  it('should identify location at the Kaaba itself (< 100 meters)', () => {
    // Exact Kaaba coordinates
    const atKaaba = calculateQibla(KAABA_COORDINATES.latitude, KAABA_COORDINATES.longitude);
    assert.strictEqual(atKaaba.directionDegrees, 0);
    assert.strictEqual(atKaaba.cardinalDirection, 'KAABA');
    assert.ok(atKaaba.distanceKm < 0.1);
  });

  it('should handle North Pole and South Pole coordinates cleanly', () => {
    // From North Pole along Kaaba meridian: heading to Kaaba is due South (180 deg)
    const northPoleMeridian = calculateQibla(90.0, KAABA_COORDINATES.longitude);
    assert.ok(Math.abs(northPoleMeridian.directionDegrees - 180.0) < 0.1);
    assert.strictEqual(northPoleMeridian.cardinalDirection, 'S');

    // From South Pole along Kaaba meridian: heading to Kaaba is due North (0 deg)
    const southPoleMeridian = calculateQibla(-90.0, KAABA_COORDINATES.longitude);
    assert.ok(Math.abs(southPoleMeridian.directionDegrees - 0.0) < 0.1);
    assert.strictEqual(southPoleMeridian.cardinalDirection, 'N');

    // From North Pole at prime meridian (0 deg): bearing is 180 - 39.83 = 140.17 deg (SE)
    const northPole0 = calculateQibla(90.0, 0.0);
    assert.ok(Math.abs(northPole0.directionDegrees - 140.17) < 0.2);
    assert.strictEqual(northPole0.cardinalDirection, 'SE');
  });

  it('should normalize longitude wrapping properly', () => {
    // Longitude > 180 (e.g. 190 = -170)
    const resNormal = calculateQibla(0, -170);
    const resWrapped = calculateQibla(0, 190);
    assert.strictEqual(resNormal.directionDegrees, resWrapped.directionDegrees);
    assert.strictEqual(resNormal.distanceKm, resWrapped.distanceKm);

    // Longitude < -180 (e.g. -200 = 160)
    const resNormal2 = calculateQibla(10, 160);
    const resWrapped2 = calculateQibla(10, -200);
    assert.strictEqual(resNormal2.directionDegrees, resWrapped2.directionDegrees);
    assert.strictEqual(resNormal2.distanceKm, resWrapped2.distanceKm);
  });

  it('should reject invalid non-finite coordinates', () => {
    assert.throws(() => calculateQibla(NaN, 50), /Invalid coordinates/);
    assert.throws(() => calculateQibla(20, Infinity), /Invalid coordinates/);
  });

  it('should always return normalized bearing between 0 and 360', () => {
    // Test a grid of 100 points around the globe
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lng = -160; lng <= 160; lng += 40) {
        const qibla = calculateQibla(lat, lng);
        assert.ok(
          qibla.directionDegrees >= 0 && qibla.directionDegrees < 360,
          `Bearing ${qibla.directionDegrees} out of 0..360 range for lat=${lat}, lng=${lng}`
        );
        assert.ok(qibla.distanceKm >= 0);
        assert.ok(typeof qibla.cardinalDirection === 'string');
      }
    }
  });
});
