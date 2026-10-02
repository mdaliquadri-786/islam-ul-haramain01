/**
 * @file route.ts
 * @package @islamic/web
 * @description Administrative Overview KPI statistics API endpoint.
 * Protected by server-side RBAC validation.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminService } from '@/lib/admin';
import { authenticateAdminRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.errorResponse || !auth.actor) {
    return auth.errorResponse!;
  }

  try {
    const adminService = await getAdminService();
    const stats = await adminService.getOverviewStats(auth.actor);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to retrieve overview stats';
    const status = msg.includes('Authorization Error') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
