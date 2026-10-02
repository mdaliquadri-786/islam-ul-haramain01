/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for fetching Surah streaming track, Ayah timing segments, and legal provenance.
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

import { NextRequest, NextResponse } from 'next/server';
import { AudioService } from '@islamic/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surahId: string }> }
) {
  try {
    const { surahId } = await params;
    const surahNum = parseInt(surahId, 10);

    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid Surah number: '${surahId}'. Must be between 1 and 114.`
        },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reciterId = searchParams.get('reciterId') || 'alafasy';

    const audioService = new AudioService();
    const track = await audioService.getSurahTrack(reciterId, surahNum);

    if (!track) {
      return NextResponse.json(
        {
          success: false,
          error: `Audio track not found or not available for reciter '${reciterId}' and Surah ${surahNum}.`
        },
        { status: 404 }
      );
    }

    const provenance = await audioService.verifyAudioProvenance(reciterId, surahNum);

    return NextResponse.json({
      success: true,
      track,
      provenance
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch audio track descriptor.'
      },
      { status: 500 }
    );
  }
}
