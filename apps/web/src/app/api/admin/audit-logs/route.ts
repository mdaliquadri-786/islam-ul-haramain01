/**
 * @file route.ts
 * @package @islamic/web
 * @description Administrative Audit Logs API endpoint.
 * Exposes append-only audit trail with filtering and pagination.
 * Strictly requires 'view_audit_logs' permission.
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
    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get('actorId') || undefined;
    const action = searchParams.get('action') || undefined;
    const targetEntityType = searchParams.get('targetEntityType') || undefined;
    const limit = Number(searchParams.get('limit')) || 50;
    const offset = Number(searchParams.get('offset')) || 0;

    const adminService = await getAdminService();
    const logs = await adminService.queryAuditLogs(auth.actor, {
      actorId,
      action,
      targetEntityType,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to query audit logs';
    const status = msg.includes('Authorization Error') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
