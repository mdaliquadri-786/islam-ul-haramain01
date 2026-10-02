/**
 * @file route.ts
 * @package @islamic/web
 * @description Public API endpoint for querying published articles.
 * Method: GET /api/articles
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArticleService } from '@/lib/articles';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;
    const language = searchParams.get('language') || undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    const service = await getArticleService();
    const result = await service.listPublicArticles({
      categorySlug,
      language,
      limit,
      offset
    });

    const categories = await service.listCategories();

    return NextResponse.json({
      success: true,
      articles: result.articles,
      total: result.total,
      categories,
      limit,
      offset
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
