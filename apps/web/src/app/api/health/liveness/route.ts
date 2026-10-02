/**
 * @file route.ts
 * @package @islamic/web
 * @description Container process liveness probe endpoint.
 * Returns 200 OK immediately without database or external network queries.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkLiveness } from '@islamic/database';
import { withRequestCorrelation } from '@/lib/observability';

export async function GET(request: NextRequest) {
  return withRequestCorrelation(request, async () => {
    const result = checkLiveness();
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  });
}
