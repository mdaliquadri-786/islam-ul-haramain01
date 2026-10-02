/**
 * @file route.ts
 * @package @islamic/web
 * @description Next.js API Route for deterministic prayer times calculation.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  calculatePrayerTimes,
  validatePrayerParams,
  CalculationMethod,
  AsrMadhhab,
  HighLatitudeRule
} from '@islamic/islamic-engine';

export async function GET(request: NextRequest) {
  const t0 = performance.now();
  const searchParams = request.nextUrl.searchParams;

  const latParam = searchParams.get('lat') ?? searchParams.get('latitude');
  const lngParam = searchParams.get('lng') ?? searchParams.get('longitude');
  const elevationParam = searchParams.get('elevation');
  const dateParam = searchParams.get('date');
  const methodParam = searchParams.get('method') as CalculationMethod | null;
  const madhhabParam = searchParams.get('madhhab') as AsrMadhhab | null;
  const highLatParam = searchParams.get('highLatitudeRule') as HighLatitudeRule | null;
  const tzParam = searchParams.get('timezone') ?? searchParams.get('tz');

  // Offsets
  const offsetFajr = searchParams.get('offset_fajr');
  const offsetSunrise = searchParams.get('offset_sunrise');
  const offsetDhuhr = searchParams.get('offset_dhuhr');
  const offsetAsr = searchParams.get('offset_asr');
  const offsetMaghrib = searchParams.get('offset_maghrib');
  const offsetIsha = searchParams.get('offset_isha');

  // Default to Makkah if coordinates are omitted
  const latitude = latParam ? parseFloat(latParam) : 21.4225;
  const longitude = lngParam ? parseFloat(lngParam) : 39.8262;
  const elevation = elevationParam ? parseFloat(elevationParam) : undefined;

  const parseOffset = (val: string | null): number | undefined => {
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const rawParams = {
    coordinates: {
      latitude,
      longitude,
      elevation
    },
    date: dateParam || new Date(),
    method: methodParam || 'MWL',
    madhhab: madhhabParam || 'standard',
    highLatitudeRule: highLatParam || 'angle_based',
    timezone: tzParam || undefined,
    minuteOffsets: {
      fajr: parseOffset(offsetFajr),
      sunrise: parseOffset(offsetSunrise),
      dhuhr: parseOffset(offsetDhuhr),
      asr: parseOffset(offsetAsr),
      maghrib: parseOffset(offsetMaghrib),
      isha: parseOffset(offsetIsha)
    }
  };

  const validation = validatePrayerParams(rawParams);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid prayer calculation parameters',
        details: validation.errors
      },
      { status: 400 }
    );
  }

  try {
    const prayerTimes = calculatePrayerTimes(validation.sanitizedParams!);
    const executionMs = Math.round((performance.now() - t0) * 100) / 100;

    return NextResponse.json(
      {
        success: true,
        data: prayerTimes,
        metrics: {
          executionMs
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
        }
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown calculation error';
    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}
