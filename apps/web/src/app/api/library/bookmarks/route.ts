/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for querying, saving, and removing User Library Bookmarks.
 * Methods: GET, POST, DELETE /api/library/bookmarks
 * Milestone: M3.3 — User Library & Bookmarks
 * Hardening: M9 Phase 4 — Vulnerability Mitigation, Rate Limiting & Penetration Hardening
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLibraryService, resolveActor } from '@/lib/library';
import type { BookmarkContentType } from '@islamic/islamic-engine';
import { enforceRateLimit } from '@/lib/rate-limit';

const ALLOWED_CONTENT_TYPES: BookmarkContentType[] = ['quran', 'hadith', 'dua', 'article'];

export async function GET(request: NextRequest) {
  const rateLimit = enforceRateLimit(request, 'tier2_mutation');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawType = searchParams.get('type') as BookmarkContentType | null;
    const contentType = rawType && ALLOWED_CONTENT_TYPES.includes(rawType) ? rawType : undefined;
    const folderName = searchParams.get('folder')?.slice(0, 100) || undefined;

    const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
    const limit = isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 100);

    const rawOffset = parseInt(searchParams.get('offset') || '0', 10);
    const offset = isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0);

    const userId = searchParams.get('userId')?.slice(0, 64) || undefined;

    const actor = resolveActor(userId);
    const service = await getLibraryService();

    const { bookmarks, total } = await service.listUserBookmarks(actor, {
      contentType,
      folderName,
      limit,
      offset
    });

    // Resolve live canonical content for each bookmark
    const resolvedItems = await Promise.all(
      bookmarks.map(b => service.resolveBookmarkContent(b, actor))
    );

    return NextResponse.json({
      success: true,
      items: resolvedItems,
      total,
      limit,
      offset
    }, { headers: rateLimit.headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 400, headers: rateLimit.headers });
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = enforceRateLimit(request, 'tier2_mutation');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const body = await request.json();

    // Input Validation
    if (!body.contentType || !ALLOWED_CONTENT_TYPES.includes(body.contentType)) {
      return NextResponse.json(
        { success: false, error: `Invalid contentType. Must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}` },
        { status: 400, headers: rateLimit.headers }
      );
    }

    if (!body.contentReference || typeof body.contentReference !== 'string') {
      return NextResponse.json(
        { success: false, error: 'contentReference string is required.' },
        { status: 400, headers: rateLimit.headers }
      );
    }

    // Bounded string lengths to prevent payload bloat
    const sanitizedNote = body.note ? String(body.note).slice(0, 1000) : undefined;
    const sanitizedFolder = body.folderName ? String(body.folderName).slice(0, 100) : undefined;
    const sanitizedTags = Array.isArray(body.tags)
      ? body.tags.slice(0, 10).map((t: unknown) => String(t).slice(0, 50))
      : undefined;

    const actor = resolveActor(body.userId);
    const service = await getLibraryService();

    const bookmark = await service.createBookmark(
      {
        contentType: body.contentType,
        contentReference: body.contentReference.slice(0, 200),
        surahNumber: typeof body.surahNumber === 'number' ? body.surahNumber : undefined,
        ayahNumber: typeof body.ayahNumber === 'number' ? body.ayahNumber : undefined,
        hadithCollection: body.hadithCollection ? String(body.hadithCollection).slice(0, 100) : undefined,
        hadithNumber: typeof body.hadithNumber === 'number' ? body.hadithNumber : undefined,
        duaCategory: body.duaCategory ? String(body.duaCategory).slice(0, 100) : undefined,
        articleId: body.articleId ? String(body.articleId).slice(0, 100) : undefined,
        folderName: sanitizedFolder,
        note: sanitizedNote,
        tags: sanitizedTags,
        clientMutationId: body.clientMutationId ? String(body.clientMutationId).slice(0, 100) : undefined
      },
      actor
    );

    const resolved = await service.resolveBookmarkContent(bookmark, actor);

    return NextResponse.json({
      success: true,
      bookmark,
      resolved
    }, { headers: rateLimit.headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Duplicate') ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status, headers: rateLimit.headers });
  }
}

export async function DELETE(request: NextRequest) {
  const rateLimit = enforceRateLimit(request, 'tier2_mutation');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get('id')?.slice(0, 64);
    const rawType = searchParams.get('type') as BookmarkContentType | null;
    const contentType = rawType && ALLOWED_CONTENT_TYPES.includes(rawType) ? rawType : null;
    const contentReference = searchParams.get('ref')?.slice(0, 200);
    const userId = searchParams.get('userId')?.slice(0, 64) || undefined;

    const actor = resolveActor(userId);
    const service = await getLibraryService();

    if (bookmarkId) {
      await service.removeBookmark(bookmarkId, actor);
      return NextResponse.json({ success: true, removedId: bookmarkId }, { headers: rateLimit.headers });
    }

    if (contentType && contentReference) {
      const removed = await service.removeBookmarkByReference(contentType, contentReference, actor);
      return NextResponse.json({ success: true, removedReference: contentReference, removed }, { headers: rateLimit.headers });
    }

    return NextResponse.json(
      { success: false, error: 'Must provide either bookmark ID or type and reference.' },
      { status: 400, headers: rateLimit.headers }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 400, headers: rateLimit.headers });
  }
}
