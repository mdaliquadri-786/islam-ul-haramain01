/**
 * @file prayer.ts
 * @package @islamic/web
 * @description Helper utilities and re-exports for Prayer Times & Qibla in the web application.
 */

import {
  calculatePrayerTimes,
  calculateQibla,
  PrayerCalculationParams,
  PrayerTimesResult,
  QiblaCalculationResult,
  PRESET_CITIES,
  CALCULATION_METHODS,
  PresetCity,
  CalculationMethod,
  AsrMadhhab,
  HighLatitudeRule
} from '@islamic/islamic-engine/src/prayer/index.js';

export {
  calculatePrayerTimes,
  calculateQibla,
  PRESET_CITIES,
  CALCULATION_METHODS
};
export type {
  PrayerCalculationParams,
  PrayerTimesResult,
  QiblaCalculationResult,
  PresetCity,
  CalculationMethod,
  AsrMadhhab,
  HighLatitudeRule
};

/**
 * Gets default city preset (Makkah al-Mukarramah).
 */
export function getDefaultPresetCity(): PresetCity {
  return PRESET_CITIES[0];
}

/**
 * Finds a preset city by its ID.
 */
export function findPresetCityById(id: string): PresetCity | undefined {
  return PRESET_CITIES.find(c => c.id === id);
}
