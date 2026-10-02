/**
 * @file route.ts
 * @package @islamic/web
 * @description CMS API endpoint for managing article drafts, revisions, scholar reviews, and publication.
 * Methods: GET /api/cms/articles, POST /api/cms/articles
 * Hardening: M9 Phase 4 — Vulnerability Mitigation, Rate Limiting & Penetration Hardening
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArticleService } from '@/lib/articles';
import type { ActorContext } from '@islamic/database';
import type { UserRole } from '@islamic/islamic-engine';
import { enforceRateLimit } from '@/lib/rate-limit';

const CMS_ROLES: UserRole[] = ['super_admin', 'content_admin', 'scholar_reviewer', 'editor'];

export async function GET(request: NextRequest): Promise<NextResponse> {
  const rateLimit = enforceRateLimit(request, 'tier2_mutation');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawRole = searchParams.get('role');
    const actorRole = (rawRole && CMS_ROLES.includes(rawRole as UserRole)) ? (rawRole as UserRole) : 'editor';
    const actorId = searchParams.get('userId')?.slice(0, 64) || '00000000-0000-0000-0001-000000000003';

    const actor: ActorContext = {
      id: actorId,
      roles: [actorRole]
    };

    const service = await getArticleService();
    const articles = await service.getCmsArticles(actor);
    const categories = await service.listCategories();

    return NextResponse.json({
      success: true,
      articles,
      categories
    }, { headers: rateLimit.headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: rateLimit.headers });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimit = enforceRateLimit(request, 'tier1_auth');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const body = await request.json();
    const action = body.action || 'create_draft';
    const actorId = (body.actorId || '00000000-0000-0000-0001-000000000001').slice(0, 64);
    const rawRoles: UserRole[] = Array.isArray(body.actorRoles) ? body.actorRoles : ['user'];
    const actorRoles = rawRoles.filter((r) => CMS_ROLES.includes(r) || r === 'user');

    const actor: ActorContext = {
      id: actorId,
      roles: actorRoles
    };

    // Role-based privilege gating for CMS operations
    const hasRole = (allowed: UserRole[]) => actorRoles.some((r) => allowed.includes(r));

    switch (action) {
      case 'create_draft':
      case 'submit_review': {
        if (!hasRole(['editor', 'content_admin', 'super_admin'])) {
          return NextResponse.json(
            { success: false, error: `Forbidden: Authoring actions require editor or admin role.` },
            { status: 403, headers: rateLimit.headers }
          );
        }
        break;
      }
      case 'assign_scholar': {
        if (!hasRole(['content_admin', 'super_admin'])) {
          return NextResponse.json(
            { success: false, error: `Forbidden: Assigning scholar reviewers requires content admin authority.` },
            { status: 403, headers: rateLimit.headers }
          );
        }
        break;
      }
      case 'add_comment':
      case 'submit_decision': {
        if (!hasRole(['scholar_reviewer', 'super_admin'])) {
          return NextResponse.json(
            { success: false, error: `Forbidden: Scholar decisions require verified scholar_reviewer role.` },
            { status: 403, headers: rateLimit.headers }
          );
        }
        break;
      }
      case 'publish': {
        if (!hasRole(['content_admin', 'super_admin'])) {
          return NextResponse.json(
            { success: false, error: `Forbidden: Publishing articles requires content_admin or super_admin authority.` },
            { status: 403, headers: rateLimit.headers }
          );
        }
        break;
      }
      default: {
        return NextResponse.json(
          { success: false, error: `Unsupported CMS action '${action}'.` },
          { status: 400, headers: rateLimit.headers }
        );
      }
    }

    const service = await getArticleService();

    switch (action) {
      case 'create_draft': {
        const { article, revision } = await service.createArticleDraft(body.payload, actor);
        return NextResponse.json({ success: true, article, revision }, { headers: rateLimit.headers });
      }

      case 'submit_review': {
        const article = await service.submitForReview(body.articleId, body.revisionId, actor);
        return NextResponse.json({ success: true, article }, { headers: rateLimit.headers });
      }

      case 'assign_scholar': {
        const review = await service.assignScholarReviewer(body.articleId, body.revisionId, body.reviewerId, actor);
        return NextResponse.json({ success: true, review }, { headers: rateLimit.headers });
      }

      case 'add_comment': {
        const comment = await service.addReviewComment(body.payload, actor);
        return NextResponse.json({ success: true, comment }, { headers: rateLimit.headers });
      }

      case 'submit_decision': {
        const result = await service.submitReviewDecision(body.reviewId, body.decision, body.scholarlyNotes, actor);
        return NextResponse.json({ success: true, review: result.review, article: result.article }, { headers: rateLimit.headers });
      }

      case 'publish': {
        const article = await service.publishArticle(body.articleId, body.revisionId, actor);
        return NextResponse.json({ success: true, article }, { headers: rateLimit.headers });
      }

      default: {
        return NextResponse.json(
          { success: false, error: `Unsupported CMS action '${action}'.` },
          { status: 400, headers: rateLimit.headers }
        );
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    const status = message.includes('Authorization Error') || message.includes('Forbidden') ? 403 : 400;
    return NextResponse.json({ success: false, error: message }, { status, headers: rateLimit.headers });
  }
}
