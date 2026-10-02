/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Comprehensive type definitions for the Prayer Times and Qibla calculation engine.
 */

export type CalculationMethod =
  | 'MWL'             // Muslim World League
  | 'ISNA'            // Islamic Society of North America
  | 'UmmAlQura'       // Umm al-Qura University, Makkah
  | 'Karachi'         // University of Islamic Sciences, Karachi
  | 'Egyptian'        // Egyptian General Authority of Survey
  | 'Diyanet'         // Directorate of Religious Affairs, Turkey
  | 'MUIS'            // Majlis Ugama Islam Singapura
  | 'Custom';         // User-defined parameters

export type AsrMadhhab =
  | 'standard'        // Majority (Shafi'i, Maliki, Hanbali) - shadow factor 1
  | 'hanafi';         // Hanafi - shadow factor 2

export type HighLatitudeRule =
  | 'angle_based'     // Angle-based approximation (alpha / 60 of night)
  | 'midnight'        // Half of night (night / 2)
  | 'one_seventh'     // 1/7 of night (night / 7)
  | 'none';           // Do not adjust (may produce undefined in polar regions)

export interface Coordinates {
  latitude: number;
  longitude: number;
  elevation?: number; // Elevation in meters above sea level
}

export interface MinuteOffsets {
  fajr?: number;
  sunrise?: number;
  dhuhr?: number;
  asr?: number;
  maghrib?: number;
  isha?: number;
}

export interface CustomMethodParameters {
  fajrAngle: number;
  ishaAngle?: number;
  ishaIntervalMinutes?: number;
  maghribAngle?: number;
  maghribIntervalMinutes?: number;
}

export interface CalculationMethodDetails {
  id: CalculationMethod;
  name: string;
  nameArabic: string;
  organization: string;
  fajrAngle: number;
  ishaAngle?: number;
  ishaIntervalMinutes?: number; // e.g., 90 min for Umm al-Qura
  maghribAngle?: number;
  maghribIntervalMinutes?: number;
  description: string;
}

export interface PrayerCalculationParams {
  coordinates: Coordinates;
  date: Date | string; // Date instance or YYYY-MM-DD string
  method?: CalculationMethod;
  madhhab?: AsrMadhhab;
  highLatitudeRule?: HighLatitudeRule;
  timezone?: string | number; // e.g. "Asia/Riyadh", "UTC+3", or numeric offset in hours (3, -5)
  minuteOffsets?: MinuteOffsets;
  customMethodParams?: CustomMethodParameters;
}

export type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface NextPrayerInfo {
  name: PrayerName;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  time: Date;
  formatted: string;
  formatted12: string;
  timeRemainingMs: number;
  timeRemainingFormatted: string;
}

export interface PrayerTimesFormatted {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak?: string;
  midnight?: string;
  lastThird?: string;
}

export interface QiblaCalculationResult {
  directionDegrees: number; // 0..360 initial bearing clockwise from North
  cardinalDirection: string; // e.g. "ESE", "NE", "W"
  distanceKm: number; // Great-circle distance to Kaaba in kilometers
  kaabaCoordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  imsak?: Date;
  midnight?: Date;
  lastThird?: Date;
  formatted: PrayerTimesFormatted;
  formatted12: PrayerTimesFormatted;
  method: CalculationMethod;
  methodName: string;
  madhhab: AsrMadhhab;
  highLatitudeRule: HighLatitudeRule;
  coordinates: Coordinates;
  date: string; // YYYY-MM-DD
  timezoneOffsetHours: number;
  offsetsApplied: Required<MinuteOffsets>;
  qibla: QiblaCalculationResult;
  nextPrayer?: NextPrayerInfo;
  solarData: {
    declinationDegrees: number;
    equationOfTimeMinutes: number;
    solarNoonHours: number;
    dayDurationHours: number;
    nightDurationHours: number;
    highLatitudeAdjusted: boolean;
  };
}

export interface PrayerValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedParams?: PrayerCalculationParams;
}

export interface QiblaValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedCoordinates?: Coordinates;
}

export interface PresetCity {
  id: string;
  name: string;
  nameArabic: string;
  nameUrdu: string;
  country: string;
  coordinates: Coordinates;
  timezone: string;
  defaultMethod: CalculationMethod;
  defaultMadhhab: AsrMadhhab;
}
