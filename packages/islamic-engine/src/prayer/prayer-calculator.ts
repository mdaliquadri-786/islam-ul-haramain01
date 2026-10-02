/**
 * @file prayer-calculator.ts
 * @package @islamic/islamic-engine
 * @description Core deterministic calculation engine for Islamic prayer times,
 * coordinating astronomical algorithms, madhhab preferences, high-latitude adjustments,
 * offsets, and Qibla bearing.
 */

import {
  PrayerCalculationParams,
  PrayerTimesResult,
  PrayerName,
  NextPrayerInfo,
  PrayerTimesFormatted,
  MinuteOffsets,
  AsrMadhhab,
  HighLatitudeRule
} from './types';
import {
  ASTRONOMICAL_CONSTANTS,
  PRAYER_NAMES_METADATA
} from './constants';
import {
  julianDay,
  sunCoordinates,
  solarTransit,
  hourAngle,
  asrAltitude,
  horizonDip,
  nightPortion,
  clampLatitudeForPolar,
  fixHour
} from './astronomy';
import { getMethodParameters } from './methods';
import { calculateQibla } from './qibla';
import { validatePrayerParams } from './validator';

const TIMEZONE_OFFSET_CACHE = new Map<string, number>();
const MAX_TZ_CACHE_SIZE = 500;

/**
 * Resolves the UTC timezone offset in hours from an IANA timezone string,
 * offset string (e.g., "+03:00", "UTC+5"), numeric offset, or longitude estimate.
 */
export function resolveTimezoneOffsetHours(
  timezone: string | number | undefined,
  date: Date,
  longitude: number
): number {
  if (typeof timezone === 'number' && Number.isFinite(timezone)) {
    return timezone;
  }

  if (typeof timezone === 'string' && timezone.trim().length > 0) {
    const trimmed = timezone.trim();
    // Parse offset patterns like "+03:00", "-05", "UTC+3", "GMT-4"
    const match = trimmed.match(/^(?:UTC|GMT)?([+-]?\d{1,2})(?::?(\d{2}))?$/i);
    if (match) {
      const sign = match[1].startsWith('-') ? -1 : 1;
      const hours = Math.abs(parseInt(match[1], 10));
      const mins = match[2] ? parseInt(match[2], 10) / 60.0 : 0;
      return sign * (hours + mins);
    }

    // Check cache
    const cacheKey = `${trimmed}_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    if (TIMEZONE_OFFSET_CACHE.has(cacheKey)) {
      return TIMEZONE_OFFSET_CACHE.get(cacheKey)!;
    }

    // Try standard IANA timezone via Intl.DateTimeFormat
    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: trimmed,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const parts = dtf.formatToParts(date);
      const map: Record<string, string> = {};
      for (const p of parts) map[p.type] = p.value;

      const localDate = new Date(Date.UTC(
        parseInt(map.year, 10),
        parseInt(map.month, 10) - 1,
        parseInt(map.day, 10),
        parseInt(map.hour, 10) % 24,
        parseInt(map.minute, 10),
        parseInt(map.second, 10)
      ));
      const diffMs = localDate.getTime() - date.getTime();
      const offset = Math.round((diffMs / 3600000) * 100) / 100;

      if (TIMEZONE_OFFSET_CACHE.size >= MAX_TZ_CACHE_SIZE) {
        TIMEZONE_OFFSET_CACHE.clear();
      }
      TIMEZONE_OFFSET_CACHE.set(cacheKey, offset);
      return offset;
    } catch {
      // Fallback to longitude estimate
    }
  }

  // Natural solar timezone estimate based on longitude (15 degrees per hour)
  return Math.round((longitude / 15.0) * 2) / 2;
}

/**
 * Formats decimal hours into a 24-hour time string ("HH:mm").
 */
export function format24Hour(hours: number): string {
  const totalMinutes = Math.round(hours * 60.0);
  const h = Math.floor(totalMinutes / 60.0) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Formats decimal hours into a 12-hour time string ("h:mm A").
 */
export function format12Hour(hours: number): string {
  const totalMinutes = Math.round(hours * 60.0);
  let h = Math.floor(totalMinutes / 60.0) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Converts local decimal hours to a JavaScript Date object in UTC.
 */
export function decimalHoursToUtcDate(
  year: number,
  month: number,
  day: number,
  localHours: number,
  timezoneOffsetHours: number
): Date {
  const totalMinutes = Math.round(localHours * 60.0);
  const localH = Math.floor(totalMinutes / 60.0);
  const localM = totalMinutes % 60;
  // Calculate UTC hour by subtracting local timezone offset
  const utcHours = localH - timezoneOffsetHours;
  const ms = Date.UTC(year, month - 1, day, Math.floor(utcHours), localM + Math.round((utcHours % 1) * 60), 0, 0);
  return new Date(ms);
}

/**
 * Primary calculation function for prayer times.
 *
 * @param params PrayerCalculationParams specifying coordinates, date, method, madhhab, etc.
 * @returns Complete PrayerTimesResult object with all times, formatting, metadata, and Qibla
 */
export function calculatePrayerTimes(params: PrayerCalculationParams): PrayerTimesResult {
  const validation = validatePrayerParams(params);
  if (!validation.isValid || !validation.sanitizedParams) {
    throw new Error(`Prayer calculation validation failed: ${validation.errors.join('; ')}`);
  }

  const p = validation.sanitizedParams;
  const { coordinates, method, minuteOffsets } = p;
  const madhhab: AsrMadhhab = p.madhhab ?? 'standard';
  const highLatitudeRule: HighLatitudeRule = p.highLatitudeRule ?? 'angle_based';
  const dateObj = p.date instanceof Date ? p.date : new Date(p.date);

  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // 1-12
  const day = dateObj.getDate();
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const tzOffset = resolveTimezoneOffsetHours(p.timezone, dateObj, coordinates.longitude);
  const methodParams = getMethodParameters(method, p.customMethodParams);

  // 1. Initial Julian Day at approximate local noon (in UTC)
  const approxNoonUtcHour = 12.0 - (coordinates.longitude / 15.0);
  const jdNoon = julianDay(year, month, day, approxNoonUtcHour);

  // 2. Solar coordinates at noon
  const solarNoonCoords = sunCoordinates(jdNoon);
  const initialTransit = solarTransit(coordinates.longitude, tzOffset, solarNoonCoords.equationOfTime);

  // 3. Polar latitude safety clamp
  const effectiveLat = clampLatitudeForPolar(coordinates.latitude, solarNoonCoords.declination);
  const isPolarAdjusted = effectiveLat !== coordinates.latitude;

  // Horizon angle with elevation adjustment
  const dip = horizonDip(coordinates.elevation);
  const horizonAlt = ASTRONOMICAL_CONSTANTS.STANDARD_HORIZON_ALTITUDE - dip;

  // 4. Two-Pass Iterative Astronomical Solver
  // Pass 1: Compute approximate times using solar noon coordinates
  const hSunApprox = hourAngle(effectiveLat, solarNoonCoords.declination, horizonAlt);
  const hSun = hSunApprox ?? 6.0; // fallback to 6 hours if extreme

  let approxSunrise = initialTransit - hSun;
  let approxSunset = initialTransit + hSun;

  // Night duration in hours (Sunset to Sunrise)
  let nightDuration = 24.0 - (approxSunset - approxSunrise);
  if (nightDuration <= 0) nightDuration = 24.0;

  // Fajr Hour Angle
  const hFajrApprox = hourAngle(effectiveLat, solarNoonCoords.declination, -methodParams.fajrAngle);
  let rawFajr = hFajrApprox !== null ? initialTransit - hFajrApprox : null;

  // Asr Hour Angle
  const shadowFactor = madhhab === 'hanafi' ? 2.0 : 1.0;
  const asrAltDeg = asrAltitude(effectiveLat, solarNoonCoords.declination, shadowFactor);
  const hAsrApprox = hourAngle(effectiveLat, solarNoonCoords.declination, asrAltDeg);
  const rawAsr = initialTransit + (hAsrApprox ?? 3.5);

  // Maghrib
  let rawMaghrib = approxSunset;
  if (methodParams.maghribIntervalMinutes !== undefined) {
    rawMaghrib = approxSunset + (methodParams.maghribIntervalMinutes / 60.0);
  } else if (methodParams.maghribAngle !== undefined) {
    const hMaghrib = hourAngle(effectiveLat, solarNoonCoords.declination, -methodParams.maghribAngle);
    if (hMaghrib !== null) rawMaghrib = initialTransit + hMaghrib;
  }

  // Isha
  let rawIsha: number | null = null;
  if (methodParams.ishaIntervalMinutes !== undefined) {
    rawIsha = rawMaghrib + (methodParams.ishaIntervalMinutes / 60.0);
  } else if (methodParams.ishaAngle !== undefined) {
    const hIshaApprox = hourAngle(effectiveLat, solarNoonCoords.declination, -methodParams.ishaAngle);
    if (hIshaApprox !== null) rawIsha = initialTransit + hIshaApprox;
  }

  // 5. Apply High-Latitude Rules if twilight angle fails or exceeds limit
  let highLatApplied = isPolarAdjusted;

  const fajrPortion = nightPortion(highLatitudeRule, methodParams.fajrAngle, nightDuration);
  const ishaAngleForPortion = methodParams.ishaAngle ?? 18.0;
  const ishaPortion = nightPortion(highLatitudeRule, ishaAngleForPortion, nightDuration);

  if (rawFajr === null || rawFajr < (approxSunrise - fajrPortion)) {
    if (highLatitudeRule !== 'none') {
      rawFajr = approxSunrise - fajrPortion;
      highLatApplied = true;
    } else if (rawFajr === null) {
      rawFajr = approxSunrise - fajrPortion;
    }
  }

  if (rawIsha === null || (methodParams.ishaAngle !== undefined && rawIsha > (rawMaghrib + ishaPortion))) {
    if (highLatitudeRule !== 'none' && methodParams.ishaIntervalMinutes === undefined) {
      rawIsha = rawMaghrib + ishaPortion;
      highLatApplied = true;
    } else if (rawIsha === null) {
      rawIsha = rawMaghrib + ishaPortion;
    }
  }

  // 6. Refinement Pass (Pass 2): re-evaluate sun coordinates at estimated times
  function refineTime(initialTime: number, angleDeg: number, isMorning: boolean): number {
    const utcHour = initialTime - tzOffset;
    const jd = julianDay(year, month, day, utcHour);
    const coords = sunCoordinates(jd);
    const transit = solarTransit(coordinates.longitude, tzOffset, coords.equationOfTime);
    const h = hourAngle(effectiveLat, coords.declination, angleDeg);
    if (h === null) return initialTime;
    return isMorning ? transit - h : transit + h;
  }

  const refinedSunrise = refineTime(approxSunrise, horizonAlt, true);
  const refinedSunset = refineTime(approxSunset, horizonAlt, false);
  const refinedTransit = initialTransit + (ASTRONOMICAL_CONSTANTS.DEFAULT_DHUHR_PRECAUTION_MINUTES / 60.0);

  let finalFajr = rawFajr;
  if (hFajrApprox !== null && !highLatApplied) {
    finalFajr = refineTime(rawFajr, -methodParams.fajrAngle, true);
  }

  const finalAsr = refineTime(rawAsr, asrAltDeg, false);

  let finalMaghrib = refinedSunset;
  if (methodParams.maghribIntervalMinutes !== undefined) {
    finalMaghrib = refinedSunset + (methodParams.maghribIntervalMinutes / 60.0);
  } else if (methodParams.maghribAngle !== undefined) {
    finalMaghrib = refineTime(rawMaghrib, -methodParams.maghribAngle, false);
  }

  let finalIsha = rawIsha;
  if (methodParams.ishaIntervalMinutes !== undefined) {
    finalIsha = finalMaghrib + (methodParams.ishaIntervalMinutes / 60.0);
  } else if (methodParams.ishaAngle !== undefined && !highLatApplied) {
    finalIsha = refineTime(rawIsha, -methodParams.ishaAngle, false);
  }

  // 7. Apply User Minute Offsets
  const offsets: Required<MinuteOffsets> = {
    fajr: minuteOffsets?.fajr ?? 0,
    sunrise: minuteOffsets?.sunrise ?? 0,
    dhuhr: minuteOffsets?.dhuhr ?? 0,
    asr: minuteOffsets?.asr ?? 0,
    maghrib: minuteOffsets?.maghrib ?? 0,
    isha: minuteOffsets?.isha ?? 0
  };

  const fajrHours = finalFajr + (offsets.fajr / 60.0);
  const sunriseHours = refinedSunrise + (offsets.sunrise / 60.0);
  const dhuhrHours = refinedTransit + (offsets.dhuhr / 60.0);
  const asrHours = finalAsr + (offsets.asr / 60.0);
  const maghribHours = finalMaghrib + (offsets.maghrib / 60.0);
  const ishaHours = finalIsha + (offsets.isha / 60.0);

  // Devotional extra times
  const imsakHours = fajrHours - (ASTRONOMICAL_CONSTANTS.DEFAULT_IMSAK_INTERVAL_MINUTES / 60.0);
  // Islamic Midnight = halfway between Maghrib and next day's Fajr
  const midnightHours = maghribHours + (fixHour(fajrHours + 24.0 - maghribHours) / 2.0);
  // Last Third of Night = 2/3 of the way from Maghrib to Fajr
  const lastThirdHours = maghribHours + ((fixHour(fajrHours + 24.0 - maghribHours) * 2.0) / 3.0);

  // 8. Convert to UTC Date instances
  const fajrDate = decimalHoursToUtcDate(year, month, day, fajrHours, tzOffset);
  const sunriseDate = decimalHoursToUtcDate(year, month, day, sunriseHours, tzOffset);
  const dhuhrDate = decimalHoursToUtcDate(year, month, day, dhuhrHours, tzOffset);
  const asrDate = decimalHoursToUtcDate(year, month, day, asrHours, tzOffset);
  const maghribDate = decimalHoursToUtcDate(year, month, day, maghribHours, tzOffset);
  const ishaDate = decimalHoursToUtcDate(year, month, day, ishaHours, tzOffset);

  const imsakDate = decimalHoursToUtcDate(year, month, day, imsakHours, tzOffset);
  const midnightDate = decimalHoursToUtcDate(year, month, day, midnightHours, tzOffset);
  const lastThirdDate = decimalHoursToUtcDate(year, month, day, lastThirdHours, tzOffset);

  // 9. Format Strings
  const formatted: PrayerTimesFormatted = {
    fajr: format24Hour(fajrHours),
    sunrise: format24Hour(sunriseHours),
    dhuhr: format24Hour(dhuhrHours),
    asr: format24Hour(asrHours),
    maghrib: format24Hour(maghribHours),
    isha: format24Hour(ishaHours),
    imsak: format24Hour(imsakHours),
    midnight: format24Hour(midnightHours),
    lastThird: format24Hour(lastThirdHours)
  };

  const formatted12: PrayerTimesFormatted = {
    fajr: format12Hour(fajrHours),
    sunrise: format12Hour(sunriseHours),
    dhuhr: format12Hour(dhuhrHours),
    asr: format12Hour(asrHours),
    maghrib: format12Hour(maghribHours),
    isha: format12Hour(ishaHours),
    imsak: format12Hour(imsakHours),
    midnight: format12Hour(midnightHours),
    lastThird: format12Hour(lastThirdHours)
  };

  // 10. Compute Qibla
  const qibla = calculateQibla(coordinates.latitude, coordinates.longitude);

  // 11. Determine Next Prayer relative to reference time
  const now = dateObj.getTime();
  const prayerSchedule: Array<{ name: PrayerName; time: Date; formatted: string; formatted12: string }> = [
    { name: 'fajr', time: fajrDate, formatted: formatted.fajr, formatted12: formatted12.fajr },
    { name: 'sunrise', time: sunriseDate, formatted: formatted.sunrise, formatted12: formatted12.sunrise },
    { name: 'dhuhr', time: dhuhrDate, formatted: formatted.dhuhr, formatted12: formatted12.dhuhr },
    { name: 'asr', time: asrDate, formatted: formatted.asr, formatted12: formatted12.asr },
    { name: 'maghrib', time: maghribDate, formatted: formatted.maghrib, formatted12: formatted12.maghrib },
    { name: 'isha', time: ishaDate, formatted: formatted.isha, formatted12: formatted12.isha }
  ];

  let nextPrayerItem = prayerSchedule.find(pItem => pItem.time.getTime() > now);
  if (!nextPrayerItem) {
    // If all prayers today have passed, next prayer is Fajr tomorrow
    const tomorrowFajrDate = new Date(fajrDate.getTime() + (24 * 60 * 60 * 1000));
    nextPrayerItem = {
      name: 'fajr',
      time: tomorrowFajrDate,
      formatted: formatted.fajr,
      formatted12: formatted12.fajr
    };
  }

  const timeRemainingMs = Math.max(0, nextPrayerItem.time.getTime() - now);
  const remMinutes = Math.floor(timeRemainingMs / 60000);
  const remHours = Math.floor(remMinutes / 60);
  const remMins = remMinutes % 60;
  const timeRemainingFormatted = `${remHours}h ${remMins}m`;

  const meta = PRAYER_NAMES_METADATA[nextPrayerItem.name];
  const nextPrayer: NextPrayerInfo = {
    name: nextPrayerItem.name,
    nameArabic: meta.arabic,
    nameEnglish: meta.english,
    nameUrdu: meta.urdu,
    time: nextPrayerItem.time,
    formatted: nextPrayerItem.formatted,
    formatted12: nextPrayerItem.formatted12,
    timeRemainingMs,
    timeRemainingFormatted
  };

  const dayDurationHours = Math.round((refinedSunset - refinedSunrise) * 100) / 100;

  return {
    fajr: fajrDate,
    sunrise: sunriseDate,
    dhuhr: dhuhrDate,
    asr: asrDate,
    maghrib: maghribDate,
    isha: ishaDate,
    imsak: imsakDate,
    midnight: midnightDate,
    lastThird: lastThirdDate,
    formatted,
    formatted12,
    method: methodParams.id,
    methodName: methodParams.name,
    madhhab,
    highLatitudeRule,
    coordinates,
    date: dateString,
    timezoneOffsetHours: tzOffset,
    offsetsApplied: offsets,
    qibla,
    nextPrayer,
    solarData: {
      declinationDegrees: Math.round(solarNoonCoords.declination * 1000) / 1000,
      equationOfTimeMinutes: Math.round(solarNoonCoords.equationOfTime * 1000) / 1000,
      solarNoonHours: Math.round(refinedTransit * 1000) / 1000,
      dayDurationHours,
      nightDurationHours: Math.round((24.0 - dayDurationHours) * 100) / 100,
      highLatitudeAdjusted: highLatApplied
    }
  };
}
