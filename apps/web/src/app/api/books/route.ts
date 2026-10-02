/**
 * @file route.ts
 * @package @islamic/web
 * @description API endpoint for listing digital Islamic books.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import { NextRequest, NextResponse } from 'next/server';
import { BooksService } from '@islamic/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const language = searchParams.get('lang') || undefined;
    const query = searchParams.get('q') || undefined;

    const service = new BooksService();
    const books = await service.listBooks({ category, language, query });

    return NextResponse.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch books catalog.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
