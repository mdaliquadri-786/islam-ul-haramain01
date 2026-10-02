/**
 * @file route.ts
 * @package @islamic/web
 * @description Administrative System Configuration & Feature Flags API endpoint.
 * Controls Maintenance Mode, Emergency Flags, Announcements, and Dynamic Module Toggles.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 * Hardening: M9 Phase 4 — Vulnerability Mitigation, Rate Limiting & Penetration Hardening
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminService } from '@/lib/admin';
import { authenticateAdminRequest } from '@/lib/admin-auth';
import { enforceRateLimit } from '@/lib/rate-limit';

const ALLOWED_SETTING_KEYS = new Set([
  'maintenanceMode',
  'maintenanceMessage',
  'registrationEnabled',
  'publishingEnabled',
  'subscriptionsEnabled',
  'minSupportedMobileVersion',
  'minSupportedWebVersion',
  'announcementBanner',
  'announcementBannerEnabled',
  'announcementBannerText',
  'defaultLocale',
]);

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
    const adminService = await getAdminService();
    const settings = await adminService.getSystemSettings();
    const flags = await adminService.getFeatureFlags();

    return NextResponse.json({
      success: true,
      settings,
      featureFlags: flags,
    }, { headers: rateLimit.headers });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to query system configuration';
    return NextResponse.json({ success: false, error: msg }, { status: 500, headers: rateLimit.headers });
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
    const { action, settingsUpdates, flagKey, flagEnabled } = body;
    const adminService = await getAdminService();

    if (action === 'update_settings') {
      if (!settingsUpdates || typeof settingsUpdates !== 'object' || Array.isArray(settingsUpdates)) {
        return NextResponse.json(
          { success: false, error: 'settingsUpdates object is required' },
          { status: 400, headers: rateLimit.headers }
        );
      }

      // Input Validation: Filter out unauthorized or prototype keys
      const sanitizedUpdates: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(settingsUpdates)) {
        if (!ALLOWED_SETTING_KEYS.has(k)) {
          return NextResponse.json(
            { success: false, error: `Invalid setting property: '${k}' is not configurable.` },
            { status: 400, headers: rateLimit.headers }
          );
        }
        sanitizedUpdates[k] = v;
      }

      const updated = await adminService.updateSystemSettings(auth.actor, sanitizedUpdates);
      return NextResponse.json({
        success: true,
        message: 'System settings updated successfully',
        settings: updated,
      }, { headers: rateLimit.headers });
    }

    if (action === 'toggle_flag') {
      if (!flagKey || typeof flagKey !== 'string' || typeof flagEnabled !== 'boolean') {
        return NextResponse.json(
          { success: false, error: 'flagKey string and flagEnabled boolean are required' },
          { status: 400, headers: rateLimit.headers }
        );
      }
      const flag = await adminService.toggleFeatureFlag(auth.actor, flagKey.slice(0, 100), flagEnabled);
      return NextResponse.json({
        success: true,
        message: `Feature flag ${flagKey} toggled to ${flagEnabled}`,
        flag,
      }, { headers: rateLimit.headers });
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action: ${action}` },
      { status: 400, headers: rateLimit.headers }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Configuration mutation failed';
    const status = msg.includes('Authorization Error') ? 403 : 500;
    return NextResponse.json({ success: false, error: msg }, { status, headers: rateLimit.headers });
  }
}
