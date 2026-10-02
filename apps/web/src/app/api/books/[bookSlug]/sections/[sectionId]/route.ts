/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for fetching section content within a book.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import { NextRequest, NextResponse } from 'next/server';
import { BooksService } from '@islamic/database';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bookSlug: string; sectionId: string }> }
) {
  try {
    const { bookSlug, sectionId } = await params;
    if (!bookSlug || !sectionId) {
      return NextResponse.json({ success: false, error: 'Missing parameters.' }, { status: 400 });
    }

    const service = new BooksService();
    const book = await service.getBook(bookSlug);
    if (!book) {
      return NextResponse.json({ success: false, error: 'Book not found.' }, { status: 404 });
    }

    const section = await service.getSection(sectionId);
    if (!section || section.bookId !== book.id) {
      return NextResponse.json({ success: false, error: 'Section not found.' }, { status: 404 });
    }

    const contents = await service.getContentForSection(sectionId);

    return NextResponse.json({
      success: true,
      bookId: book.id,
      section,
      contents
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch section content.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
