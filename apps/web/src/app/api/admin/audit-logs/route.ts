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

export async function POST(request: NextRequest) {
  const auth = authenticateAdminRequest(request);
  if (auth.errorResponse || !auth.actor) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const { action, targetEntityType, targetEntityId, details, sourceContext } = body;

    if (!action || typeof action !== 'string' || !targetEntityType || typeof targetEntityType !== 'string') {
      return NextResponse.json(
        { success: false, error: 'action and targetEntityType are required strings.' },
        { status: 400 }
      );
    }

    const adminService = await getAdminService();
    const entry = adminService.recordAuditEvent({
      action: action.slice(0, 100),
      targetEntityType: targetEntityType.slice(0, 100),
      targetEntityId: targetEntityId ? String(targetEntityId).slice(0, 100) : null,
      details: typeof details === 'object' && details !== null ? details : {},
      sourceContext: sourceContext ? String(sourceContext).slice(0, 100) : 'admin_portal',
      actorId: auth.actor.id,
      actorName: auth.actor.name,
    });

    return NextResponse.json({
      success: true,
      entry,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to record audit event';
    const status = msg.includes('Authorization Error') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
