/**
 * @file route.ts
 * @package @islamic/web
 * @description Public API endpoint for retrieving a single published article by slug.
 * Method: GET /api/articles/[slug]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArticleService } from '@/lib/articles';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || slug.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Missing article slug.' }, { status: 400 });
    }

    const service = await getArticleService();
    const data = await service.getPublicArticleBySlug(slug);

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Article not found or not published.' },
        { status: 404 }
      );
    }

    // Public response: strictly excludes internal scholar review notes or unapproved draft content
    return NextResponse.json({
      success: true,
      article: data.article,
      revision: {
        id: data.revision.id,
        revisionNumber: data.revision.revisionNumber,
        title: data.revision.title,
        subtitle: data.revision.subtitle,
        excerpt: data.revision.excerpt,
        bodyMarkdown: data.revision.bodyMarkdown,
        contentHash: data.revision.contentHash,
        sourceReferences: data.revision.sourceReferences,
        licensingMetadata: data.revision.licensingMetadata,
        createdAt: data.revision.createdAt
      },
      category: data.category
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
