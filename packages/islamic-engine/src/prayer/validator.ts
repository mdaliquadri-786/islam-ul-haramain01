/**
 * @file validator.ts
 * @package @islamic/islamic-engine
 * @description Input validation and sanitization for prayer calculation and Qibla requests.
 */

import {
  PrayerCalculationParams,
  PrayerValidationResult,
  QiblaValidationResult,
  CalculationMethod,
  AsrMadhhab,
  HighLatitudeRule,
  Coordinates
} from './types';

const VALID_METHODS: readonly CalculationMethod[] = [
  'MWL', 'ISNA', 'UmmAlQura', 'Karachi', 'Egyptian', 'Diyanet', 'MUIS', 'Custom'
];

const VALID_MADHHABS: readonly AsrMadhhab[] = ['standard', 'hanafi'];

const VALID_HIGH_LAT_RULES: readonly HighLatitudeRule[] = [
  'angle_based', 'midnight', 'one_seventh', 'none'
];

/**
 * Validates and sanitizes prayer calculation parameters.
 */
export function validatePrayerParams(input: unknown): PrayerValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return {
      isValid: false,
      errors: ['Input parameters must be a non-null object.']
    };
  }

  const p = input as Partial<PrayerCalculationParams>;

  // 1. Validate Coordinates
  if (!p.coordinates || typeof p.coordinates !== 'object') {
    errors.push('Missing or invalid coordinates object.');
  } else {
    const { latitude, longitude, elevation } = p.coordinates;
    if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90.0 || latitude > 90.0) {
      errors.push(`Latitude must be a finite number between -90.0 and 90.0. Received: ${latitude}`);
    }
    if (typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180.0 || longitude > 180.0) {
      errors.push(`Longitude must be a finite number between -180.0 and 180.0. Received: ${longitude}`);
    }
    if (elevation !== undefined) {
      if (typeof elevation !== 'number' || !Number.isFinite(elevation) || elevation < 0 || elevation > 9000) {
        errors.push(`Elevation must be a non-negative number up to 9000 meters. Received: ${elevation}`);
      }
    }
  }

  // 2. Validate Date
  let sanitizedDate: Date | null = null;
  if (!p.date) {
    sanitizedDate = new Date();
  } else if (p.date instanceof Date) {
    if (isNaN(p.date.getTime())) {
      errors.push('Provided Date instance is Invalid Date.');
    } else {
      sanitizedDate = p.date;
    }
  } else if (typeof p.date === 'string') {
    const parsed = new Date(p.date);
    if (isNaN(parsed.getTime())) {
      errors.push(`Provided date string could not be parsed: "${p.date}". Use YYYY-MM-DD format.`);
    } else {
      sanitizedDate = parsed;
    }
  } else {
    errors.push('Date must be a Date instance, ISO string, or YYYY-MM-DD string.');
  }

  // 3. Validate Calculation Method
  const method: CalculationMethod = p.method || 'MWL';
  if (!VALID_METHODS.includes(method)) {
    errors.push(`Invalid calculation method "${method}". Supported: ${VALID_METHODS.join(', ')}`);
  }

  // 4. Validate Asr Madhhab
  const madhhab: AsrMadhhab = p.madhhab || 'standard';
  if (!VALID_MADHHABS.includes(madhhab)) {
    errors.push(`Invalid Asr madhhab "${madhhab}". Supported: ${VALID_MADHHABS.join(', ')}`);
  }

  // 5. Validate High-Latitude Rule
  const highLatitudeRule: HighLatitudeRule = p.highLatitudeRule || 'angle_based';
  if (!VALID_HIGH_LAT_RULES.includes(highLatitudeRule)) {
    errors.push(`Invalid high-latitude rule "${highLatitudeRule}". Supported: ${VALID_HIGH_LAT_RULES.join(', ')}`);
  }

  // 6. Validate Minute Offsets
  if (p.minuteOffsets) {
    if (typeof p.minuteOffsets !== 'object') {
      errors.push('minuteOffsets must be an object.');
    } else {
      for (const [key, val] of Object.entries(p.minuteOffsets)) {
        if (val !== undefined) {
          if (typeof val !== 'number' || !Number.isFinite(val) || !Number.isInteger(val) || val < -120 || val > 120) {
            errors.push(`Offset for "${key}" must be an integer between -120 and 120 minutes. Received: ${val}`);
          }
        }
      }
    }
  }

  // 7. Validate Custom Method Parameters
  if (method === 'Custom') {
    if (!p.customMethodParams || typeof p.customMethodParams !== 'object') {
      errors.push('customMethodParams is required when calculation method is "Custom".');
    } else {
      const { fajrAngle, ishaAngle } = p.customMethodParams;
      if (typeof fajrAngle !== 'number' || !Number.isFinite(fajrAngle) || fajrAngle < 0 || fajrAngle > 30) {
        errors.push(`Custom fajrAngle must be between 0 and 30 degrees. Received: ${fajrAngle}`);
      }
      if (ishaAngle !== undefined) {
        if (typeof ishaAngle !== 'number' || !Number.isFinite(ishaAngle) || ishaAngle < 0 || ishaAngle > 30) {
          errors.push(`Custom ishaAngle must be between 0 and 30 degrees. Received: ${ishaAngle}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedParams: {
      coordinates: p.coordinates as Coordinates,
      date: sanitizedDate!,
      method,
      madhhab,
      highLatitudeRule,
      timezone: p.timezone,
      minuteOffsets: p.minuteOffsets,
      customMethodParams: p.customMethodParams
    }
  };
}

/**
 * Validates coordinate inputs for Qibla calculation.
 */
export function validateQiblaParams(lat: unknown, lng: unknown): QiblaValidationResult {
  const errors: string[] = [];

  const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
  const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;

  if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90.0 || latitude > 90.0) {
    errors.push(`Latitude must be a valid number between -90.0 and 90.0. Received: ${lat}`);
  }

  if (typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180.0 || longitude > 180.0) {
    errors.push(`Longitude must be a valid number between -180.0 and 180.0. Received: ${lng}`);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedCoordinates: {
      latitude: latitude as number,
      longitude: longitude as number
    }
  };
}
