/**
 * @file astronomy.ts
 * @package @islamic/islamic-engine
 * @description Pure mathematical and astronomical formulas for solar position,
 * equation of time, solar transit, hour angle, and shadow calculations based on
 * standard Jean Meeus Astronomical Algorithms.
 */

import { HighLatitudeRule } from './types';
import { ASTRONOMICAL_CONSTANTS } from './constants';

export function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180.0;
}

export function toDeg(radians: number): number {
  return (radians * 180.0) / Math.PI;
}

export function fixAngle(degrees: number): number {
  const a = degrees % 360.0;
  return a < 0 ? a + 360.0 : a;
}

export function fixHour(hours: number): number {
  const h = hours % 24.0;
  return h < 0 ? h + 24.0 : h;
}

/**
 * Calculates the Julian Day for a given Gregorian date and UTC hour.
 */
export function julianDay(year: number, month: number, day: number, hourUtc = 12.0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716))
           + Math.floor(30.6001 * (m + 1))
           + day
           + b
           - 1524.5
           + (hourUtc / 24.0);
  return jd;
}

export interface SolarCoordinates {
  declination: number; // In degrees
  rightAscension: number; // In degrees
  equationOfTime: number; // In minutes
}

/**
 * Computes solar declination and equation of time using high-precision Meeus algorithms.
 */
export function sunCoordinates(jd: number): SolarCoordinates {
  const d = jd - ASTRONOMICAL_CONSTANTS.J2000_EPOCH;
  const t = d / 36525.0; // Julian centuries since J2000.0

  // Geometric mean longitude of the Sun (degrees)
  const l0 = fixAngle(280.46646 + 36000.76983 * t + 0.0003032 * t * t);

  // Mean anomaly of the Sun (degrees)
  const m = fixAngle(357.52911 + 35999.05029 * t - 0.0001537 * t * t);
  const mRad = toRad(m);

  // Sun equation of center (degrees)
  const c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(mRad)
          + (0.019993 - 0.000101 * t) * Math.sin(2 * mRad)
          + 0.000289 * Math.sin(3 * mRad);

  // Sun true longitude (degrees)
  const trueLong = fixAngle(l0 + c);

  // Apparent longitude correcting for nutation and aberration
  const omega = 125.04 - 1934.136 * t;
  const lambda = fixAngle(trueLong - 0.00569 - 0.00478 * Math.sin(toRad(omega)));
  const lambdaRad = toRad(lambda);

  // Mean obliquity of the ecliptic (degrees)
  const eps0 = 23.439291 - 0.0130042 * t - 0.00000016 * t * t + 0.000000504 * t * t * t;
  const eps = eps0 + 0.00256 * Math.cos(toRad(omega));
  const epsRad = toRad(eps);

  // Declination (degrees)
  const sinDec = Math.sin(epsRad) * Math.sin(lambdaRad);
  const declination = toDeg(Math.asin(Math.max(-1.0, Math.min(1.0, sinDec))));

  // Right Ascension (degrees)
  const raRad = Math.atan2(Math.cos(epsRad) * Math.sin(lambdaRad), Math.cos(lambdaRad));
  const rightAscension = fixAngle(toDeg(raRad));

  // Equation of Time (minutes)
  const y = Math.tan(epsRad / 2.0) ** 2;
  const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;
  const l0Rad = toRad(l0);

  const eot = 4.0 * toDeg(
    y * Math.sin(2.0 * l0Rad)
    - 2.0 * e * Math.sin(mRad)
    + 4.0 * e * y * Math.sin(mRad) * Math.cos(2.0 * l0Rad)
    - 0.5 * (y ** 2) * Math.sin(4.0 * l0Rad)
    - 1.25 * (e ** 2) * Math.sin(2.0 * mRad)
  );

  return {
    declination,
    rightAscension,
    equationOfTime: eot
  };
}

/**
 * Calculates local solar transit (solar noon) in decimal hours of the local day.
 */
export function solarTransit(longitude: number, timezoneOffsetHours: number, eotMinutes: number): number {
  return 12.0 + timezoneOffsetHours - (longitude / 15.0) - (eotMinutes / 60.0);
}

/**
 * Calculates the hour angle (in decimal hours) for a given solar altitude angle.
 * Returns null if the sun never reaches the specified altitude (polar day/night or twilight exception).
 */
export function hourAngle(latitude: number, declination: number, altitudeDegrees: number): number | null {
  const phi = toRad(latitude);
  const delta = toRad(declination);
  const alpha = toRad(altitudeDegrees);

  const cosH = (Math.sin(alpha) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));

  if (cosH > 1.0 || cosH < -1.0) {
    return null; // Sun never reaches this altitude
  }

  const hRad = Math.acos(cosH);
  return toDeg(hRad) / 15.0; // Convert degrees to hours (15 deg = 1 hr)
}

/**
 * Calculates the solar altitude angle for Asr based on shadow factor.
 * Shadow factor N = 1 (Standard / Shafi'i, Maliki, Hanbali) or N = 2 (Hanafi).
 */
export function asrAltitude(latitude: number, declination: number, shadowFactor: number): number {
  const d = Math.abs(latitude - declination);
  const shadowAtNoon = Math.tan(toRad(d));
  const totalShadow = shadowFactor + shadowAtNoon;
  const altitudeRad = Math.atan(1.0 / totalShadow);
  return toDeg(altitudeRad);
}

/**
 * Evaluates horizon dip adjustment due to observer elevation above sea level.
 */
export function horizonDip(elevationMeters = 0): number {
  if (elevationMeters <= 0) return 0;
  return 0.0347 * Math.sqrt(elevationMeters);
}

/**
 * Computes the maximum twilight portion of the night allocated to Fajr or Isha
 * under the specified high-latitude rule.
 */
export function nightPortion(rule: HighLatitudeRule, angleDegrees: number, nightDurationHours: number): number {
  switch (rule) {
    case 'midnight':
      return nightDurationHours / 2.0;
    case 'one_seventh':
      return nightDurationHours / 7.0;
    case 'angle_based':
    default:
      // Portion is (angle / 60.0) of the night
      return (angleDegrees / 60.0) * nightDurationHours;
  }
}

/**
 * Clamps latitude for extreme polar regions where 24h perpetual day or night occurs,
 * adopting the nearest latitude convention established by the Islamic Fiqh Academy.
 */
export function clampLatitudeForPolar(latitude: number, declination: number): number {
  const phi = toRad(latitude);
  const delta = toRad(declination);
  const cosSunrise = (Math.sin(toRad(ASTRONOMICAL_CONSTANTS.STANDARD_HORIZON_ALTITUDE)) - Math.sin(phi) * Math.sin(delta))
                   / (Math.cos(phi) * Math.cos(delta));

  // If sunrise/sunset does not occur at this latitude, clamp to safe maximum latitude
  if (cosSunrise > 1.0 || cosSunrise < -1.0 || Math.abs(latitude) > ASTRONOMICAL_CONSTANTS.MAX_ASTRONOMICAL_LATITUDE) {
    return Math.sign(latitude) * ASTRONOMICAL_CONSTANTS.MAX_ASTRONOMICAL_LATITUDE;
  }
  return latitude;
}
