/**
 * @file route.ts
 * @package @islamic/web
 * @description Administrative User Management API endpoint.
 * Supports paginated listing, role modification, and account suspension/reactivation.
 * Strictly audited and protected by server-side RBAC.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 * Hardening: M9 Phase 4 — Vulnerability Mitigation, Rate Limiting & Penetration Hardening
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminService } from '@/lib/admin';
import { authenticateAdminRequest } from '@/lib/admin-auth';
import type { UserRole } from '@islamic/database';
import { enforceRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const rateLimit = enforceRateLimit(request, 'tier1_auth');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  const auth = authenticateAdminRequest(request);
  if (auth.errorResponse || !auth.actor) {
    return auth.errorResponse!;
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get('search');
    const search = rawSearch ? rawSearch.slice(0, 100) : undefined;
    const role = (searchParams.get('role') as UserRole) || undefined;
    const isSuspendedParam = searchParams.get('isSuspended');
    const isSuspended = isSuspendedParam !== null ? isSuspendedParam === 'true' : undefined;

    const rawLimit = Number(searchParams.get('limit')) || 20;
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    const rawOffset = Number(searchParams.get('offset')) || 0;
    const offset = Math.max(rawOffset, 0);

    const adminService = await getAdminService();
    const result = await adminService.listUsers(auth.actor, {
      search,
      role,
      isSuspended,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      users: result.users,
      total: result.total,
    }, { headers: rateLimit.headers });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to list users';
    const status = msg.includes('Authorization Error') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status, headers: rateLimit.headers });
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = enforceRateLimit(request, 'tier1_auth');
  if (!rateLimit.allowed) {
    return rateLimit.errorResponse!;
  }

  const auth = authenticateAdminRequest(request);
  if (auth.errorResponse || !auth.actor) {
    return auth.errorResponse!;
  }

  try {
    const body = await request.json();
    const { action, targetUserId, newRole, isSuspended, reason } = body;

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'targetUserId is required' },
        { status: 400, headers: rateLimit.headers }
      );
    }

    const sanitizedTargetId = targetUserId.slice(0, 64);
    const sanitizedReason = reason ? String(reason).slice(0, 500) : undefined;

    const adminService = await getAdminService();

    if (action === 'update_role') {
      if (!newRole || typeof newRole !== 'string') {
        return NextResponse.json(
          { success: false, error: 'newRole is required for update_role action' },
          { status: 400, headers: rateLimit.headers }
        );
      }
      await adminService.updateUserRole(auth.actor, sanitizedTargetId, newRole as UserRole);
      return NextResponse.json({
        success: true,
        message: `Role for user ${sanitizedTargetId} updated to ${newRole}`,
      }, { headers: rateLimit.headers });
    }

    if (action === 'set_suspension') {
      if (typeof isSuspended !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'isSuspended boolean is required' },
          { status: 400, headers: rateLimit.headers }
        );
      }
      await adminService.setUserSuspension(auth.actor, sanitizedTargetId, isSuspended, sanitizedReason);
      return NextResponse.json({
        success: true,
        message: `User ${sanitizedTargetId} ${isSuspended ? 'suspended' : 'reactivated'} successfully`,
      }, { headers: rateLimit.headers });
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action: ${action}` },
      { status: 400, headers: rateLimit.headers }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'User management mutation failed';
    const status = msg.includes('Authorization Error') || msg.includes('Security') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status, headers: rateLimit.headers });
  }
}
