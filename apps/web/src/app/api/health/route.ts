/**
 * @file route.ts
 * @package @islamic/web
 * @description Deep system health inspection endpoint.
 * Provides high-level operational status, component uptime, and latency metrics
 * without exposing credentials, connection strings, or internal infrastructure topology.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkDeepHealth } from '@islamic/database';
import { getAdminService } from '@/lib/admin';
import { withRequestCorrelation } from '@/lib/observability';

const WEB_APP_VERSION = '0.1.0';
const BUILD_IDENTIFIER = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || 'local-build';

export async function GET(request: NextRequest) {
  return withRequestCorrelation(request, async () => {
    let client = null;
    try {
      const adminService = await getAdminService();
      client = adminService.getClient();
    } catch {
      // In-memory or offline fallback
    }

    const health = await checkDeepHealth(client, WEB_APP_VERSION, BUILD_IDENTIFIER);
    const isHealthy = health.status === 'HEALTHY' || health.status === 'DEGRADED';

    return NextResponse.json(health, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  });
}
