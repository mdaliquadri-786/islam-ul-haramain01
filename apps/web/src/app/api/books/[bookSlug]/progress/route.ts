/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for user reading progress tracking within a book.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 * Hardening: M9 Phase 4 — Vulnerability Mitigation, Rate Limiting & Penetration Hardening
 */

import { NextRequest, NextResponse } from 'next/server';
import { BooksService } from '@islamic/database';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  const rateLimit = enforceRateLimit(request, 'tier2_mutation');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const { bookSlug } = await params;
    const sanitizedSlug = bookSlug.slice(0, 100);

    const rawUserId = request.headers.get('x-user-id') || request.nextUrl.searchParams.get('userId') || 'default-reader';
    const userId = rawUserId.slice(0, 64);

    const service = new BooksService();
    const book = await service.getBook(sanitizedSlug);
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found.' }, { status: 404, headers: rateLimit.headers });
    }

    const progress = await service.getReadingProgress(userId, book.id);

    return NextResponse.json({
      success: true,
      bookId: book.id,
      progress
    }, { headers: rateLimit.headers });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch progress.';
    return NextResponse.json({ success: false, error: msg }, { status: 500, headers: rateLimit.headers });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  const rateLimit = enforceRateLimit(request, 'tier2_mutation');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const { bookSlug } = await params;
    const sanitizedSlug = bookSlug.slice(0, 100);

    const body = await request.json();
    const rawUserId = request.headers.get('x-user-id') || body.userId || 'default-reader';
    const userId = String(rawUserId).slice(0, 64);

    const service = new BooksService();
    const book = await service.getBook(sanitizedSlug);
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found.' }, { status: 404, headers: rateLimit.headers });
    }

    const rawPct = Number(body.progressPercentage);
    const progressPercentage = isNaN(rawPct) ? 0 : Math.min(Math.max(rawPct, 0), 100);

    const progress = await service.saveReadingProgress(userId, {
      bookId: book.id,
      volumeNumber: typeof body.volumeNumber === 'number' ? body.volumeNumber : undefined,
      sectionId: body.sectionId ? String(body.sectionId).slice(0, 100) : undefined,
      pageNumber: typeof body.pageNumber === 'number' ? body.pageNumber : undefined,
      progressPercentage,
      clientMutationId: body.clientMutationId ? String(body.clientMutationId).slice(0, 100) : undefined
    });

    return NextResponse.json({
      success: true,
      progress
    }, { headers: rateLimit.headers });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to save progress.';
    return NextResponse.json({ success: false, error: msg }, { status: 400, headers: rateLimit.headers });
  }
}
