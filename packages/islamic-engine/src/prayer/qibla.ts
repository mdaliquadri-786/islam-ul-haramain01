/**
 * @file qibla.ts
 * @package @islamic/islamic-engine
 * @description Deterministic Great-Circle Qibla calculation to the Holy Kaaba in Makkah.
 */

import { QiblaCalculationResult } from './types';
import { KAABA_COORDINATES, ASTRONOMICAL_CONSTANTS, COMPASS_CARDINALS } from './constants';
import { toRad, toDeg, fixAngle } from './astronomy';

/**
 * Calculates the initial Great-Circle bearing from an observer's location to the Kaaba,
 * along with the geodesic distance and 16-point cardinal compass representation.
 *
 * @param latitude Observer's latitude in degrees (-90 to +90)
 * @param longitude Observer's longitude in degrees (-180 to +180)
 * @returns QiblaCalculationResult containing normalized bearing (0..360 deg), cardinal, and distance in km
 */
export function calculateQibla(latitude: number, longitude: number): QiblaCalculationResult {
  // Validate finite numbers
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(`Invalid coordinates for Qibla calculation: lat=${latitude}, lng=${longitude}`);
  }

  // Normalize longitude to -180..180
  let normLng = longitude % 360.0;
  if (normLng > 180.0) normLng -= 360.0;
  if (normLng < -180.0) normLng += 360.0;

  // Clamp latitude to -90..90
  const normLat = Math.max(-90.0, Math.min(90.0, latitude));

  const kLat = KAABA_COORDINATES.latitude;
  const kLng = KAABA_COORDINATES.longitude;

  // Great-circle distance using Haversine formula
  const phi1 = toRad(normLat);
  const phi2 = toRad(kLat);
  const deltaPhi = toRad(kLat - normLat);
  const deltaLambda = toRad(kLng - normLng);

  const a = (Math.sin(deltaPhi / 2.0) ** 2)
          + Math.cos(phi1) * Math.cos(phi2) * (Math.sin(deltaLambda / 2.0) ** 2);
  const c = 2.0 * Math.atan2(Math.sqrt(Math.max(0.0, Math.min(1.0, a))), Math.sqrt(Math.max(0.0, 1.0 - a)));
  const distanceKm = Math.round((ASTRONOMICAL_CONSTANTS.EARTH_RADIUS_KM * c) * 100) / 100;

  // Proximity to Kaaba: within 100 meters (0.1 km)
  if (distanceKm < 0.1) {
    return {
      directionDegrees: 0,
      cardinalDirection: 'KAABA',
      distanceKm,
      kaabaCoordinates: {
        latitude: kLat,
        longitude: kLng
      }
    };
  }

  // Antipodal point check: distance near half Earth circumference (~20,015 km)
  if (Math.abs(distanceKm - (Math.PI * ASTRONOMICAL_CONSTANTS.EARTH_RADIUS_KM)) < 2.0) {
    return {
      directionDegrees: 0,
      cardinalDirection: 'ANTIPODE',
      distanceKm,
      kaabaCoordinates: {
        latitude: kLat,
        longitude: kLng
      }
    };
  }

  // Initial forward Great-Circle bearing
  // y = sin(dLng) * cos(lat2)
  // x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dLng)
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let bearing = toDeg(Math.atan2(y, x));
  bearing = fixAngle(bearing);
  // Round to 2 decimal places for clean precision
  bearing = Math.round(bearing * 100) / 100;

  // 16-point compass rose lookup
  // Each sector is 360 / 16 = 22.5 degrees, offset by half a sector (11.25 deg)
  const sectorIndex = Math.floor(fixAngle(bearing + 11.25) / 22.5) % 16;
  const cardinalDirection = COMPASS_CARDINALS[sectorIndex] || 'N';

  return {
    directionDegrees: bearing,
    cardinalDirection,
    distanceKm,
    kaabaCoordinates: {
      latitude: kLat,
      longitude: kLng
    }
  };
}
