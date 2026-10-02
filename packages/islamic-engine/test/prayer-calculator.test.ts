/**
 * @file prayer-calculator.test.ts
 * @package @islamic/islamic-engine
 * @description Comprehensive test suite for the Prayer Times Calculation Engine,
 * testing calculation methods, madhhabs, high-latitude handling, offsets, and determinism.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePrayerTimes,
  resolveTimezoneOffsetHours
} from '../src/prayer/prayer-calculator';
import { CALCULATION_METHODS } from '../src/prayer/methods';
import { PRESET_CITIES } from '../src/prayer/constants';
import { CalculationMethod } from '../src/prayer/types';

describe('Prayer Times Calculation Engine', () => {
  const testDate = new Date('2026-09-24T12:00:00Z');

  describe('Canonical Calculation Methods', () => {
    const methods: CalculationMethod[] = [
      'MWL', 'ISNA', 'UmmAlQura', 'Karachi', 'Egyptian', 'Diyanet', 'MUIS'
    ];

    for (const method of methods) {
      it(`should successfully calculate complete prayer times for method: ${method}`, () => {
        const result = calculatePrayerTimes({
          coordinates: { latitude: 21.4225, longitude: 39.8262 }, // Makkah
          date: testDate,
          method,
          madhhab: 'standard',
          timezone: 'Asia/Riyadh'
        });

        assert.strictEqual(result.method, method);
        assert.ok(result.fajr instanceof Date && !isNaN(result.fajr.getTime()));
        assert.ok(result.sunrise instanceof Date && !isNaN(result.sunrise.getTime()));
        assert.ok(result.dhuhr instanceof Date && !isNaN(result.dhuhr.getTime()));
        assert.ok(result.asr instanceof Date && !isNaN(result.asr.getTime()));
        assert.ok(result.maghrib instanceof Date && !isNaN(result.maghrib.getTime()));
        assert.ok(result.isha instanceof Date && !isNaN(result.isha.getTime()));

        // Check chronological progression
        assert.ok(result.fajr.getTime() < result.sunrise.getTime(), 'Fajr must precede Sunrise');
        assert.ok(result.sunrise.getTime() < result.dhuhr.getTime(), 'Sunrise must precede Dhuhr');
        assert.ok(result.dhuhr.getTime() < result.asr.getTime(), 'Dhuhr must precede Asr');
        assert.ok(result.asr.getTime() < result.maghrib.getTime(), 'Asr must precede Maghrib');
        assert.ok(result.maghrib.getTime() < result.isha.getTime(), 'Maghrib must precede Isha');

        // Formatted strings check
        assert.match(result.formatted.fajr, /^\d{2}:\d{2}$/);
        assert.match(result.formatted.sunrise, /^\d{2}:\d{2}$/);
        assert.match(result.formatted.dhuhr, /^\d{2}:\d{2}$/);
        assert.match(result.formatted.asr, /^\d{2}:\d{2}$/);
        assert.match(result.formatted.maghrib, /^\d{2}:\d{2}$/);
        assert.match(result.formatted.isha, /^\d{2}:\d{2}$/);
      });
    }

    it('should verify Umm al-Qura Isha is exactly 90 minutes after Maghrib', () => {
      const result = calculatePrayerTimes({
        coordinates: { latitude: 21.4225, longitude: 39.8262 },
        date: testDate,
        method: 'UmmAlQura',
        timezone: 'Asia/Riyadh'
      });

      const maghribMs = result.maghrib.getTime();
      const ishaMs = result.isha.getTime();
      const diffMinutes = Math.round((ishaMs - maghribMs) / 60000);
      assert.strictEqual(diffMinutes, 90, 'Umm al-Qura Isha must be exactly 90 minutes after Maghrib');
    });

    it('should verify ISNA (15 deg) has later Fajr and earlier Isha than Egyptian (19.5/17.5 deg)', () => {
      const isna = calculatePrayerTimes({
        coordinates: { latitude: 30.0444, longitude: 31.2357 },
        date: testDate,
        method: 'ISNA',
        timezone: 2
      });

      const egyptian = calculatePrayerTimes({
        coordinates: { latitude: 30.0444, longitude: 31.2357 },
        date: testDate,
        method: 'Egyptian',
        timezone: 2
      });

      // Since ISNA uses 15 deg (sun closer to horizon) vs Egyptian 19.5 deg (sun deeper below horizon):
      // ISNA Fajr is later in morning than Egyptian Fajr
      assert.ok(isna.fajr.getTime() > egyptian.fajr.getTime(), 'ISNA Fajr should be later than Egyptian Fajr');
      // ISNA Isha is earlier in evening than Egyptian Isha (15 deg vs 17.5 deg)
      assert.ok(isna.isha.getTime() < egyptian.isha.getTime(), 'ISNA Isha should be earlier than Egyptian Isha');
    });
  });

  describe('Asr Madhhab Differences', () => {
    it('should calculate Hanafi Asr (2x shadow) strictly later than Standard Asr (1x shadow)', () => {
      const standard = calculatePrayerTimes({
        coordinates: { latitude: 24.8607, longitude: 67.0011 }, // Karachi
        date: testDate,
        method: 'Karachi',
        madhhab: 'standard',
        timezone: 'Asia/Karachi'
      });

      const hanafi = calculatePrayerTimes({
        coordinates: { latitude: 24.8607, longitude: 67.0011 },
        date: testDate,
        method: 'Karachi',
        madhhab: 'hanafi',
        timezone: 'Asia/Karachi'
      });

      // Fajr, Sunrise, Dhuhr, Maghrib, Isha must remain identical
      assert.strictEqual(standard.formatted.fajr, hanafi.formatted.fajr);
      assert.strictEqual(standard.formatted.sunrise, hanafi.formatted.sunrise);
      assert.strictEqual(standard.formatted.dhuhr, hanafi.formatted.dhuhr);
      assert.strictEqual(standard.formatted.maghrib, hanafi.formatted.maghrib);
      assert.strictEqual(standard.formatted.isha, hanafi.formatted.isha);

      // Hanafi Asr must be strictly later than Standard Asr
      assert.ok(hanafi.asr.getTime() > standard.asr.getTime());
      const diffMinutes = Math.round((hanafi.asr.getTime() - standard.asr.getTime()) / 60000);
      assert.ok(diffMinutes >= 40 && diffMinutes <= 75, `Expected 40-75 min difference, got ${diffMinutes}`);
    });
  });

  describe('High-Latitude Adjustments & Polar Safety', () => {
    const summerDate = new Date('2026-06-21T12:00:00Z'); // Summer solstice

    it('should adjust Fajr and Isha under angle_based rule for high-latitude city (Oslo)', () => {
      const oslo = calculatePrayerTimes({
        coordinates: { latitude: 59.9139, longitude: 10.7522 },
        date: summerDate,
        method: 'MWL',
        highLatitudeRule: 'angle_based',
        timezone: 'Europe/Oslo'
      });

      assert.ok(!isNaN(oslo.fajr.getTime()), 'Oslo Fajr must not be NaN');
      assert.ok(!isNaN(oslo.isha.getTime()), 'Oslo Isha must not be NaN');
      assert.ok(oslo.fajr.getTime() < oslo.sunrise.getTime());
      assert.ok(oslo.maghrib.getTime() < oslo.isha.getTime());
    });

    it('should apply midnight and one_seventh rules cleanly', () => {
      const midnightRule = calculatePrayerTimes({
        coordinates: { latitude: 59.9139, longitude: 10.7522 },
        date: summerDate,
        method: 'MWL',
        highLatitudeRule: 'midnight',
        timezone: 2
      });

      const oneSeventhRule = calculatePrayerTimes({
        coordinates: { latitude: 59.9139, longitude: 10.7522 },
        date: summerDate,
        method: 'MWL',
        highLatitudeRule: 'one_seventh',
        timezone: 2
      });

      assert.ok(!isNaN(midnightRule.fajr.getTime()));
      assert.ok(!isNaN(oneSeventhRule.fajr.getTime()));
      // One-seventh allocates 1/7 of night, so Fajr is closer to Sunrise than Midnight (1/2 of night)
      assert.ok(oneSeventhRule.fajr.getTime() > midnightRule.fajr.getTime());
    });

    it('should gracefully handle extreme polar conditions (Tromso, 69.65 deg N) without NaN or Infinity', () => {
      const polarSummer = calculatePrayerTimes({
        coordinates: { latitude: 69.65, longitude: 18.96 },
        date: summerDate,
        method: 'MWL',
        highLatitudeRule: 'angle_based',
        timezone: 2
      });

      assert.ok(!isNaN(polarSummer.fajr.getTime()));
      assert.ok(!isNaN(polarSummer.sunrise.getTime()));
      assert.ok(!isNaN(polarSummer.dhuhr.getTime()));
      assert.ok(!isNaN(polarSummer.asr.getTime()));
      assert.ok(!isNaN(polarSummer.maghrib.getTime()));
      assert.ok(!isNaN(polarSummer.isha.getTime()));

      // Must be chronologically ascending
      assert.ok(polarSummer.fajr.getTime() < polarSummer.sunrise.getTime());
      assert.ok(polarSummer.sunrise.getTime() < polarSummer.dhuhr.getTime());
      assert.ok(polarSummer.dhuhr.getTime() < polarSummer.asr.getTime());
      assert.ok(polarSummer.asr.getTime() < polarSummer.maghrib.getTime());
      assert.ok(polarSummer.maghrib.getTime() < polarSummer.isha.getTime());
    });
  });

  describe('User Minute Offsets', () => {
    it('should apply positive and negative minute offsets accurately', () => {
      const base = calculatePrayerTimes({
        coordinates: { latitude: 21.4225, longitude: 39.8262 },
        date: testDate,
        method: 'UmmAlQura',
        timezone: 3
      });

      const withOffsets = calculatePrayerTimes({
        coordinates: { latitude: 21.4225, longitude: 39.8262 },
        date: testDate,
        method: 'UmmAlQura',
        timezone: 3,
        minuteOffsets: {
          fajr: -5,
          dhuhr: 3,
          asr: 10,
          maghrib: 2,
          isha: -2
        }
      });

      assert.strictEqual(
        Math.round((withOffsets.fajr.getTime() - base.fajr.getTime()) / 60000),
        -5
      );
      assert.strictEqual(
        Math.round((withOffsets.dhuhr.getTime() - base.dhuhr.getTime()) / 60000),
        3
      );
      assert.strictEqual(
        Math.round((withOffsets.asr.getTime() - base.asr.getTime()) / 60000),
        10
      );
      assert.strictEqual(
        Math.round((withOffsets.maghrib.getTime() - base.maghrib.getTime()) / 60000),
        2
      );
      assert.strictEqual(
        Math.round((withOffsets.isha.getTime() - base.isha.getTime()) / 60000),
        -2
      );
    });
  });

  describe('Determinism & Re-evaluation Invariance', () => {
    it('should produce 100% bit-for-bit identical outputs for repeated calculations', () => {
      const params = {
        coordinates: { latitude: 51.5074, longitude: -0.1278 }, // London
        date: testDate,
        method: 'MWL' as CalculationMethod,
        madhhab: 'standard' as const,
        timezone: 'Europe/London'
      };

      const baseline = calculatePrayerTimes(params);

      for (let i = 0; i < 50; i++) {
        const run = calculatePrayerTimes(params);
        assert.strictEqual(run.fajr.getTime(), baseline.fajr.getTime());
        assert.strictEqual(run.sunrise.getTime(), baseline.sunrise.getTime());
        assert.strictEqual(run.dhuhr.getTime(), baseline.dhuhr.getTime());
        assert.strictEqual(run.asr.getTime(), baseline.asr.getTime());
        assert.strictEqual(run.maghrib.getTime(), baseline.maghrib.getTime());
        assert.strictEqual(run.isha.getTime(), baseline.isha.getTime());
        assert.strictEqual(run.qibla.directionDegrees, baseline.qibla.directionDegrees);
      }
    });
  });

  describe('Input Validation & Error Handling', () => {
    it('should throw descriptive validation errors for out-of-bounds coordinates', () => {
      assert.throws(
        () => calculatePrayerTimes({
          coordinates: { latitude: 95.0, longitude: 0 },
          date: testDate
        }),
        /Latitude must be a finite number between -90.0 and 90.0/
      );

      assert.throws(
        () => calculatePrayerTimes({
          coordinates: { latitude: 0, longitude: 195.0 },
          date: testDate
        }),
        /Longitude must be a finite number between -180.0 and 180.0/
      );
    });

    it('should throw validation errors for invalid date', () => {
      assert.throws(
        () => calculatePrayerTimes({
          coordinates: { latitude: 20, longitude: 30 },
          date: 'not-a-date'
        }),
        /Provided date string could not be parsed/
      );
    });

    it('should throw validation error for unsupported calculation method', () => {
      assert.throws(
        () => calculatePrayerTimes({
          coordinates: { latitude: 20, longitude: 30 },
          date: testDate,
          method: 'InvalidMethod' as unknown as CalculationMethod
        }),
        /Invalid calculation method/
      );
    });

    it('should throw validation error for excessive minute offsets', () => {
      assert.throws(
        () => calculatePrayerTimes({
          coordinates: { latitude: 20, longitude: 30 },
          date: testDate,
          minuteOffsets: {
            fajr: 150 // max allowed is 120
          }
        }),
        /must be an integer between -120 and 120 minutes/
      );
    });
  });

  describe('Preset Global Cities', () => {
    it('should calculate valid prayer times for all 12 preset global cities', () => {
      for (const city of PRESET_CITIES) {
        const result = calculatePrayerTimes({
          coordinates: city.coordinates,
          date: testDate,
          method: city.defaultMethod,
          madhhab: city.defaultMadhhab,
          timezone: city.timezone
        });

        assert.ok(result.fajr instanceof Date);
        assert.ok(result.qibla.directionDegrees >= 0 && result.qibla.directionDegrees < 360);
        assert.ok(result.nextPrayer !== undefined);
      }
    });
  });
});
