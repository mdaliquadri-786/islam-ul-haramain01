/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for searching within a specific digital Islamic book.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import { NextRequest, NextResponse } from 'next/server';
import { BooksService } from '@islamic/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookSlug: string }> }
) {
  try {
    const { bookSlug } = await params;
    const query = request.nextUrl.searchParams.get('q');
    const volumeStr = request.nextUrl.searchParams.get('volume');

    if (!bookSlug || !query || query.trim().length === 0) {
      return NextResponse.json({ success: true, count: 0, results: [] });
    }

    const volume = volumeStr ? parseInt(volumeStr, 10) : undefined;
    const service = new BooksService();
    const book = await service.getBook(bookSlug);
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found.' }, { status: 404 });
    }

    const results = await service.searchBook(book.id, query, { volume });

    return NextResponse.json({
      success: true,
      bookId: book.id,
      query,
      count: results.length,
      results
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Search failed.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
