/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for the Classical Tafsir Works catalog.
 * Returns active, license-cleared, approved tafsir works only.
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 */

import { NextResponse } from 'next/server';
import { TafsirService } from '@islamic/database';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours

export async function GET() {
  try {
    const tafsirService = new TafsirService();
    const works = await tafsirService.listWorks({ activeOnly: true });

    return NextResponse.json({
      success: true,
      works,
      count: works.length
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch tafsir works.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
