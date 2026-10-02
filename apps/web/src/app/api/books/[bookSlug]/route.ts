/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for fetching specific book details, editions, and table of contents.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import { NextRequest, NextResponse } from 'next/server';
import { BooksService } from '@islamic/database';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  try {
    const { bookSlug } = await params;
    if (!bookSlug || typeof bookSlug !== 'string' || bookSlug.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid book identifier.' }, { status: 400 });
    }

    const service = new BooksService();
    const book = await service.getBook(bookSlug);
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found or restricted.' }, { status: 404 });
    }

    const editions = await service.getEditions(book.id);
    const volumes = await service.getVolumes(book.id);
    const sections = await service.getSections(book.id, 1);
    const provenance = await service.getProvenance(book.id);
    const availability = await service.verifyBookAvailability(book.id);

    return NextResponse.json({
      success: true,
      book,
      editions,
      volumes,
      sections,
      provenance,
      availability
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch book.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
