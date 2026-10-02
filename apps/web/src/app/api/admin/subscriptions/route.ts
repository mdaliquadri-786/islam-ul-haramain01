/**
 * @file route.ts
 * @package @islamic/web
 * @description Administrative Subscriptions & Plans API endpoint.
 * Manages tiers, waqf patron endowments, and user subscription states.
 * Strictly audited and forbids any raw credit card/CVV storage.
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
    const userId = searchParams.get('userId') || undefined;

    const adminService = await getAdminService();
    const plans = await adminService.listSubscriptionPlans();
    const userSubs = await adminService.listUserSubscriptions(auth.actor, userId);

    return NextResponse.json({
      success: true,
      plans,
      userSubscriptions: userSubs,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to query subscriptions';
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
    const { action, plan, targetUserId, planSlug, status } = body;
    const adminService = await getAdminService();

    if (action === 'upsert_plan') {
      if (!plan || !plan.slug || !plan.name) {
        return NextResponse.json(
          { success: false, error: 'plan object with slug and name is required' },
          { status: 400 }
        );
      }
      const saved = await adminService.upsertSubscriptionPlan(auth.actor, plan);
      return NextResponse.json({
        success: true,
        message: `Plan ${saved.slug} saved successfully`,
        plan: saved,
      });
    }

    if (action === 'adjust_user_subscription') {
      if (!targetUserId || !planSlug || !status) {
        return NextResponse.json(
          { success: false, error: 'targetUserId, planSlug, and status are required' },
          { status: 400 }
        );
      }
      await adminService.adjustUserSubscription(auth.actor, targetUserId, {
        planSlug,
        status,
      });
      return NextResponse.json({
        success: true,
        message: `Subscription for user ${targetUserId} adjusted to ${planSlug} (${status})`,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action: ${action}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Subscription mutation failed';
    const status = msg.includes('Authorization Error') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
