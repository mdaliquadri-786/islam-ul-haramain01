/**
 * @file route.ts
 * @package @islamic/web
 * @description Next.js API Route for deterministic Qibla bearing calculation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateQibla, validateQiblaParams } from '@islamic/islamic-engine';

export async function GET(request: NextRequest) {
  const t0 = performance.now();
  const searchParams = request.nextUrl.searchParams;

  const latParam = searchParams.get('lat') ?? searchParams.get('latitude');
  const lngParam = searchParams.get('lng') ?? searchParams.get('longitude');

  if (!latParam || !lngParam) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required query parameters: "lat" and "lng" are required.'
      },
      { status: 400 }
    );
  }

  const validation = validateQiblaParams(latParam, lngParam);
  if (!validation.isValid) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid coordinates for Qibla calculation',
        details: validation.errors
      },
      { status: 400 }
    );
  }

  try {
    const { latitude, longitude } = validation.sanitizedCoordinates!;
    const qibla = calculateQibla(latitude, longitude);
    const executionMs = Math.round((performance.now() - t0) * 1000) / 1000;

    return NextResponse.json(
      {
        success: true,
        data: qibla,
        metrics: {
          executionMs
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable'
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
