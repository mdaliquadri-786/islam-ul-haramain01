/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for querying the Verified Reciter Catalog.
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

import { NextResponse } from 'next/server';
import { AudioService } from '@islamic/database';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const audioService = new AudioService();
    const reciters = await audioService.listReciters({ activeOnly: true });

    return NextResponse.json({
      success: true,
      reciters,
      count: reciters.length
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch reciters catalog.'
      },
      { status: 500 }
    );
  }
}
