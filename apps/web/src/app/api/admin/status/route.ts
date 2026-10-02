/**
 * @file route.ts
 * @package @islamic/web
 * @description Public platform operational status endpoint.
 * Consumed by Mobile Flutter application and Web middleware to check maintenance mode
 * and minimum supported version without requiring authentication.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 */

import { NextResponse } from 'next/server';
import { getAdminService } from '@/lib/admin';

export async function GET() {
  try {
    const adminService = await getAdminService();
    const settings = await adminService.getSystemSettings();

    return NextResponse.json({
      success: true,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      announcementBannerEnabled: settings.announcementBannerEnabled,
      announcementBannerText: settings.announcementBannerText,
      minSupportedMobileVersion: settings.minSupportedMobileVersion,
      minSupportedWebVersion: settings.minSupportedWebVersion,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to query platform status';
    return NextResponse.json(
      {
        success: false,
        error: msg,
        maintenanceMode: false,
      },
      { status: 500 }
    );
  }
}
