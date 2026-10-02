/**
 * @file route.ts
 * @package @islamic/web
 * @description Container readiness probe endpoint.
 * Performs shallow database connectivity check without querying user data or exposing credentials.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkReadiness } from '@islamic/database';
import { getAdminService } from '@/lib/admin';
import { withRequestCorrelation } from '@/lib/observability';

export async function GET(request: NextRequest) {
  return withRequestCorrelation(request, async () => {
    let client = null;
    try {
      const adminService = await getAdminService();
      client = adminService.getClient();
    } catch {
      // In-memory or offline fallback
    }

    const readiness = await checkReadiness(client);

    if (!readiness.ready) {
      return NextResponse.json(
        {
          status: 'UNREADY',
          timestamp: readiness.timestamp,
          checks: readiness.checks,
          reason: readiness.reason || 'Database unavailable',
        },
        {
          status: 503,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    return NextResponse.json(
      {
        status: 'READY',
        timestamp: readiness.timestamp,
        checks: readiness.checks,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  });
}
