/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for fetching tafsir entries for a specific Ayah.
 * Supports multi-source comparison and single-source queries.
 * Only published, license-cleared entries are returned.
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 */

import { NextRequest, NextResponse } from 'next/server';
import { TafsirService } from '@islamic/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ surahId: string; ayahId: string }> }
) {
  try {
    const { surahId, ayahId } = await params;
    const surahNum = parseInt(surahId, 10);
    const ayahNum = parseInt(ayahId, 10);

    if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
      return NextResponse.json(
        { success: false, error: `Invalid Surah number: '${surahId}'. Must be 1–114.` },
        { status: 400 }
      );
    }
    if (isNaN(ayahNum) || ayahNum < 1 || ayahNum > 286) {
      return NextResponse.json(
        { success: false, error: `Invalid Ayah number: '${ayahId}'. Must be 1–286.` },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const langParam = searchParams.get('lang') || 'ar';
    const workIdsParam = searchParams.get('works');

    const languageCode = ['ar', 'en', 'ur'].includes(langParam)
      ? (langParam as 'ar' | 'en' | 'ur')
      : 'ar';

    const workIds = workIdsParam
      ? workIdsParam.split(',').map((w) => w.trim()).filter(Boolean)
      : ['ibn-kathir', 'al-sadi'];

    const tafsirService = new TafsirService();

    const comparison = await tafsirService.compareSourcesForAyah(
      surahNum,
      ayahNum,
      workIds,
      languageCode
    );

    return NextResponse.json({
      success: true,
      surahId: surahNum,
      ayahId: ayahNum,
      languageCode,
      comparison
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch tafsir entries.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
