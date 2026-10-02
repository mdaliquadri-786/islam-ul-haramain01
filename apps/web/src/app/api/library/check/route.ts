/**
 * @file route.ts
 * @package @islamic/web
 * @description Quick status endpoint to check if an item is currently bookmarked by the user.
 * Method: GET /api/library/check?type=...&ref=...
 * Milestone: M3.3 — User Library & Bookmarks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLibraryService, resolveActor } from '@/lib/library';
import type { BookmarkContentType } from '@islamic/islamic-engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('type') as BookmarkContentType | null;
    const contentReference = searchParams.get('ref');
    const userId = searchParams.get('userId') || undefined;

    if (!contentType || !contentReference) {
      return NextResponse.json(
        { success: false, error: 'Missing type or ref query parameter.' },
        { status: 400 }
      );
    }

    const actor = resolveActor(userId);
    const service = await getLibraryService();

    const isBookmarked = await service.isBookmarked(contentType, contentReference, actor);

    return NextResponse.json({
      success: true,
      contentType,
      contentReference,
      isBookmarked
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
