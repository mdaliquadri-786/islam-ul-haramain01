/**
 * @file route.ts
 * @package @islamic/web
 * @description API route handler for unified multi-lingual search and instant citation routing.
 * Route: GET /api/search
 * Milestone: Phase 2 -> Milestone 2.5
 * Hardening: M9 Phase 4 — Vulnerability Mitigation, Rate Limiting & Penetration Hardening
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeSearch } from '../../../lib/search';
import { SearchResultType } from '@islamic/islamic-engine';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting (Tier 2 — Query & Computation intensive endpoint)
  const rateLimit = enforceRateLimit(request, 'tier2_mutation');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q') || '';
    // Input Validation: Bound query string length to prevent regex DoS and memory bloat
    const query = rawQuery.slice(0, 200).trim();

    const typeParam = searchParams.get('type');
    const langParam = searchParams.get('lang');
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');

    // Input Validation: Bound pagination parameters strictly
    const rawLimit = limitParam ? parseInt(limitParam, 10) : 20;
    const limit = isNaN(rawLimit) ? 20 : Math.min(Math.max(rawLimit, 1), 50);

    const rawPage = pageParam ? parseInt(pageParam, 10) : 1;
    const page = isNaN(rawPage) ? 1 : Math.min(Math.max(rawPage, 1), 1000);
    const offset = (page - 1) * limit;

    let typeFilter: SearchResultType[] | undefined;
    if (typeParam && typeParam !== 'all') {
      const allowed: SearchResultType[] = ['quran_ayah', 'quran_translation', 'hadith', 'dua'];
      const parts = typeParam.split(',').filter((t): t is SearchResultType => allowed.includes(t as any));
      if (parts.length > 0) {
        typeFilter = parts;
      }
    }

    const language = (langParam === 'arabic' || langParam === 'english' || langParam === 'urdu')
      ? langParam
      : 'all';

    const response = await executeSearch({
      query,
      typeFilter,
      language,
      limit,
      offset
    });

    return NextResponse.json(response, {
      headers: rateLimit.headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal Search Error' },
      { status: 500, headers: rateLimit.headers }
    );
  }
}
