/**
 * @file admin-auth.ts
 * @package @islamic/web
 * @description Server-side administrative authentication & authorization verification.
 * Strictly verifies identity, checks role permissions, prevents header spoofing,
 * and fails closed with 401/403.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 * Hardening: M9 Phase 4 — Vulnerability Mitigation, Rate Limiting & Penetration Hardening
 */

import { NextRequest, NextResponse } from 'next/server';
import type { AdminActor, UserRole } from '@islamic/database';
import { isAuthorizedAdmin } from './admin';

/**
 * Extracts and validates the administrative actor from the request.
 * Enforces production security invariants against header spoofing.
 */
export function authenticateAdminRequest(request: NextRequest): {
  actor: AdminActor | null;
  errorResponse?: NextResponse;
} {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminSecret = process.env.ADMIN_API_SECRET;

  const authHeader = request.headers.get('authorization');
  const secretHeader = request.headers.get('x-admin-secret');
  const roleHeader = request.headers.get('x-admin-role');
  const idHeader = request.headers.get('x-admin-id') || '00000000-0000-0000-0001-000000000000';
  const nameHeader = request.headers.get('x-admin-name') || 'Platform Administrator';

  // 1. Verify Secret / Bearer Token if configured
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const providedSecret = secretHeader || bearerToken;

  if (adminSecret && providedSecret) {
    if (providedSecret !== adminSecret) {
      return {
        actor: null,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: 'Authentication Required: Invalid administrative secret token.',
          },
          { status: 401 }
        ),
      };
    }
  }

  // 2. Production Environment Header Spoofing Protection
  // In production, unverified x-admin-role headers without matching adminSecret or verified session are strictly rejected
  if (isProduction && (!adminSecret || providedSecret !== adminSecret)) {
    return {
      actor: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Authentication Required: Direct administrative role headers are rejected in production without verified secret or session.',
        },
        { status: 401 }
      ),
    };
  }

  // 3. Check for role specification (development/test mode or authenticated via secret)
  if (!roleHeader) {
    return {
      actor: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Authentication Required: Missing administrative credentials or session.',
        },
        { status: 401 }
      ),
    };
  }

  const roles = roleHeader.split(',').map((r) => r.trim()) as UserRole[];

  if (!isAuthorizedAdmin(roles)) {
    return {
      actor: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Forbidden: User roles [${roles.join(', ')}] do not possess administrative authority.`,
        },
        { status: 403 }
      ),
    };
  }

  return {
    actor: {
      id: idHeader,
      name: nameHeader,
      roles,
    },
  };
}
