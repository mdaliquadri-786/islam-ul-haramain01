/**
 * @file constants.ts
 * @package @islamic/islamic-engine
 * @description Canonical geographical coordinates, astronomical constants, and city presets.
 */

import { Coordinates, PresetCity, PrayerName } from './types';

/**
 * Authoritative canonical Kaaba coordinates in Makkah al-Mukarramah.
 * Used exclusively for all Qibla bearing and distance calculations.
 */
export const KAABA_COORDINATES: Readonly<Coordinates> = Object.freeze({
  latitude: 21.422487,
  longitude: 39.826206,
  elevation: 304 // Makkah elevation in meters
});

/**
 * Astronomical and mathematical constants.
 */
export const ASTRONOMICAL_CONSTANTS = Object.freeze({
  /** Mean radius of the Earth in kilometers (IUGG standard) */
  EARTH_RADIUS_KM: 6371.0,
  /** Standard solar atmospheric refraction + semidiameter at horizon in degrees */
  STANDARD_HORIZON_ALTITUDE: -0.8333,
  /** Dhuhr precaution delay in minutes after true solar transit */
  DEFAULT_DHUHR_PRECAUTION_MINUTES: 1.0,
  /** Default Imsak precaution interval before Fajr in minutes */
  DEFAULT_IMSAK_INTERVAL_MINUTES: 10.0,
  /** Maximum safe latitude before applying polar day/night approximation */
  MAX_ASTRONOMICAL_LATITUDE: 48.5,
  /** J2000.0 astronomical epoch Julian day */
  J2000_EPOCH: 2451545.0
});

/**
 * Prayer name multilingual metadata.
 */
export const PRAYER_NAMES_METADATA: Record<PrayerName, { arabic: string; english: string; urdu: string }> = Object.freeze({
  fajr: {
    arabic: 'الفجر',
    english: 'Fajr',
    urdu: 'فجر'
  },
  sunrise: {
    arabic: 'الشروق',
    english: 'Sunrise',
    urdu: 'طلوع آفتاب'
  },
  dhuhr: {
    arabic: 'الظهر',
    english: 'Dhuhr',
    urdu: 'ظہر'
  },
  asr: {
    arabic: 'العصر',
    english: 'Asr',
    urdu: 'عصر'
  },
  maghrib: {
    arabic: 'المغرب',
    english: 'Maghrib',
    urdu: 'مغرب'
  },
  isha: {
    arabic: 'العشاء',
    english: 'Isha',
    urdu: 'عشاء'
  }
});

/**
 * 16-point cardinal direction compass sectors.
 */
export const COMPASS_CARDINALS: readonly string[] = Object.freeze([
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
]);

/**
 * Global preset cities for testing and instant user selection.
 */
export const PRESET_CITIES: readonly PresetCity[] = Object.freeze([
  {
    id: 'makkah',
    name: 'Makkah al-Mukarramah',
    nameArabic: 'مكة المكرمة',
    nameUrdu: 'مکہ مکرمہ',
    country: 'Saudi Arabia',
    coordinates: { latitude: 21.4225, longitude: 39.8262 },
    timezone: 'Asia/Riyadh',
    defaultMethod: 'UmmAlQura',
    defaultMadhhab: 'standard'
  },
  {
    id: 'madinah',
    name: 'Al-Madinah al-Munawwarah',
    nameArabic: 'المدينة المنورة',
    nameUrdu: 'مدینہ منورہ',
    country: 'Saudi Arabia',
    coordinates: { latitude: 24.4672, longitude: 39.6111 },
    timezone: 'Asia/Riyadh',
    defaultMethod: 'UmmAlQura',
    defaultMadhhab: 'standard'
  },
  {
    id: 'jerusalem',
    name: 'Al-Quds (Jerusalem)',
    nameArabic: 'القدس الشريف',
    nameUrdu: 'القدس',
    country: 'Palestine',
    coordinates: { latitude: 31.7683, longitude: 35.2137 },
    timezone: 'Asia/Jerusalem',
    defaultMethod: 'MWL',
    defaultMadhhab: 'standard'
  },
  {
    id: 'cairo',
    name: 'Cairo',
    nameArabic: 'القاهرة',
    nameUrdu: 'قاہرہ',
    country: 'Egypt',
    coordinates: { latitude: 30.0444, longitude: 31.2357 },
    timezone: 'Africa/Cairo',
    defaultMethod: 'Egyptian',
    defaultMadhhab: 'standard'
  },
  {
    id: 'istanbul',
    name: 'Istanbul',
    nameArabic: 'إسطنبول',
    nameUrdu: 'استنبول',
    country: 'Turkey',
    coordinates: { latitude: 41.0082, longitude: 28.9784 },
    timezone: 'Europe/Istanbul',
    defaultMethod: 'Diyanet',
    defaultMadhhab: 'hanafi'
  },
  {
    id: 'karachi',
    name: 'Karachi',
    nameArabic: 'كراتشي',
    nameUrdu: 'کراچی',
    country: 'Pakistan',
    coordinates: { latitude: 24.8607, longitude: 67.0011 },
    timezone: 'Asia/Karachi',
    defaultMethod: 'Karachi',
    defaultMadhhab: 'hanafi'
  },
  {
    id: 'london',
    name: 'London',
    nameArabic: 'لندن',
    nameUrdu: 'لندن',
    country: 'United Kingdom',
    coordinates: { latitude: 51.5074, longitude: -0.1278 },
    timezone: 'Europe/London',
    defaultMethod: 'MWL',
    defaultMadhhab: 'standard'
  },
  {
    id: 'new_york',
    name: 'New York',
    nameArabic: 'نيويورك',
    nameUrdu: 'نیویارک',
    country: 'United States',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    timezone: 'America/New_York',
    defaultMethod: 'ISNA',
    defaultMadhhab: 'standard'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    nameArabic: 'سنغافورة',
    nameUrdu: 'سنگاپور',
    country: 'Singapore',
    coordinates: { latitude: 1.3521, longitude: 103.8198 },
    timezone: 'Asia/Singapore',
    defaultMethod: 'MUIS',
    defaultMadhhab: 'standard'
  },
  {
    id: 'oslo',
    name: 'Oslo',
    nameArabic: 'أوسلو',
    nameUrdu: 'اوسلو',
    country: 'Norway',
    coordinates: { latitude: 59.9139, longitude: 10.7522 },
    timezone: 'Europe/Oslo',
    defaultMethod: 'MWL',
    defaultMadhhab: 'standard'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    nameArabic: 'طوكيو',
    nameUrdu: 'ٹوکیو',
    country: 'Japan',
    coordinates: { latitude: 35.6762, longitude: 139.6503 },
    timezone: 'Asia/Tokyo',
    defaultMethod: 'MWL',
    defaultMadhhab: 'standard'
  },
  {
    id: 'sydney',
    name: 'Sydney',
    nameArabic: 'سيدني',
    nameUrdu: 'سڈنی',
    country: 'Australia',
    coordinates: { latitude: -33.8688, longitude: 151.2093 },
    timezone: 'Australia/Sydney',
    defaultMethod: 'MWL',
    defaultMadhhab: 'standard'
  }
]);
