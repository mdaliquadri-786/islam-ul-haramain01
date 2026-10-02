/**
 * @file prayer-service.test.ts
 * @package @islamic/database
 * @description Integration tests and performance benchmarks for PrayerService.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PrayerService,
  mapRowToPrayerSettings,
  prayerSettingsToParams,
  UserPrayerSettingsRow
} from '../src/prayer/prayer-service';
import { PRESET_CITIES } from '@islamic/islamic-engine';

describe('PrayerService: Database Integration & Benchmarks', () => {
  const service = new PrayerService();

  it('should map database row to UserPrayerSettingsEntity correctly', () => {
    const row: UserPrayerSettingsRow = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      user_id: 'b1ffcd88-8b0a-4df7-aa5c-5aa8ac270b22',
      calculation_method: 'UmmAlQura',
      asr_madhhab: 'standard',
      high_latitude_rule: 'angle_based',
      latitude: 21.4225,
      longitude: 39.8262,
      city_name: 'Makkah',
      timezone: 'Asia/Riyadh',
      fajr_offset_minutes: 0,
      dhuhr_offset_minutes: 2,
      asr_offset_minutes: 0,
      maghrib_offset_minutes: 0,
      isha_offset_minutes: 0,
      updated_at: '2026-09-24T06:00:00.000Z'
    };

    const entity = mapRowToPrayerSettings(row);
    assert.strictEqual(entity.id, row.id);
    assert.strictEqual(entity.userId, row.user_id);
    assert.strictEqual(entity.calculationMethod, 'UmmAlQura');
    assert.strictEqual(entity.asrMadhhab, 'standard');
    assert.strictEqual(entity.highLatitudeRule, 'angle_based');
    assert.strictEqual(entity.latitude, 21.4225);
    assert.strictEqual(entity.longitude, 39.8262);
    assert.strictEqual(entity.dhuhrOffsetMinutes, 2);
  });

  it('should convert UserPrayerSettingsEntity to PrayerCalculationParams', () => {
    const entity = {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      userId: 'b1ffcd88-8b0a-4df7-aa5c-5aa8ac270b22',
      calculationMethod: 'Karachi' as const,
      asrMadhhab: 'hanafi' as const,
      highLatitudeRule: 'midnight' as const,
      latitude: 24.8607,
      longitude: 67.0011,
      cityName: 'Karachi',
      timezone: 'Asia/Karachi',
      fajrOffsetMinutes: 0,
      dhuhrOffsetMinutes: 0,
      asrOffsetMinutes: 5,
      maghribOffsetMinutes: 0,
      ishaOffsetMinutes: 0,
      updatedAt: '2026-09-24T06:00:00.000Z'
    };

    const testDate = new Date('2026-09-24T12:00:00Z');
    const params = prayerSettingsToParams(entity, testDate);

    assert.strictEqual(params.coordinates.latitude, 24.8607);
    assert.strictEqual(params.coordinates.longitude, 67.0011);
    assert.strictEqual(params.method, 'Karachi');
    assert.strictEqual(params.madhhab, 'hanafi');
    assert.strictEqual(params.highLatitudeRule, 'midnight');
    assert.strictEqual(params.minuteOffsets?.asr, 5);

    const result = service.calculateTimes(params);
    assert.strictEqual(result.method, 'Karachi');
    assert.strictEqual(result.madhhab, 'hanafi');
  });

  it('should calculate Qibla bearing directly via service', () => {
    const qibla = service.getQibla(51.5074, -0.1278); // London
    assert.ok(Math.abs(qibla.directionDegrees - 118.99) < 0.2);
    assert.strictEqual(qibla.cardinalDirection, 'ESE');
  });

  it('should benchmark prayer times calculation throughput (> 1,000 calcs/sec, < 1 ms avg)', () => {
    const testDate = new Date('2026-09-24T12:00:00Z');
    const iterations = 1000;
    const t0 = performance.now();

    for (let i = 0; i < iterations; i++) {
      const city = PRESET_CITIES[i % PRESET_CITIES.length];
      service.calculateTimes({
        coordinates: city.coordinates,
        date: testDate,
        method: city.defaultMethod,
        madhhab: city.defaultMadhhab,
        timezone: city.timezone
      });
    }

    const totalMs = performance.now() - t0;
    const avgMs = totalMs / iterations;

    console.log('\n--- Prayer Calculation Benchmark ---');
    console.log(`Iterations:        ${iterations}`);
    console.log(`Total Time:        ${totalMs.toFixed(2)} ms`);
    console.log(`Avg per Calc:      ${avgMs.toFixed(4)} ms`);
    console.log(`Calculations/sec:  ${Math.round((iterations / totalMs) * 1000)}`);

    assert.ok(avgMs < 1.0, `Average calculation time should be < 1.0 ms, was ${avgMs.toFixed(4)} ms`);
  });

  it('should benchmark Qibla calculation throughput (> 50,000 calcs/sec, < 0.05 ms avg)', () => {
    const iterations = 5000;
    const t0 = performance.now();

    for (let i = 0; i < iterations; i++) {
      const city = PRESET_CITIES[i % PRESET_CITIES.length];
      service.getQibla(city.coordinates.latitude, city.coordinates.longitude);
    }

    const totalMs = performance.now() - t0;
    const avgMs = totalMs / iterations;

    console.log('\n--- Qibla Calculation Benchmark ---');
    console.log(`Iterations:        ${iterations}`);
    console.log(`Total Time:        ${totalMs.toFixed(2)} ms`);
    console.log(`Avg per Calc:      ${avgMs.toFixed(5)} ms`);
    console.log(`Calculations/sec:  ${Math.round((iterations / totalMs) * 1000)}`);

    assert.ok(avgMs < 0.05, `Average Qibla calculation time should be < 0.05 ms, was ${avgMs.toFixed(5)} ms`);
  });
});
