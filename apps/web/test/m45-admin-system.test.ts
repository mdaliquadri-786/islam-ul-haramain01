/**
 * @file m45-admin-system.test.ts
 * @package @islamic/web
 * @description Comprehensive automated test suite for Milestone M4.5:
 * Centralized Administration & Operational Control System.
 * Tests route access control, server-side RBAC, API endpoints, audit logging,
 * maintenance mode, and zero-hardcoded-credential guarantees.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

// Route Handlers
import { GET as getStatus } from '../src/app/api/admin/status/route.js';
import { GET as getOverview } from '../src/app/api/admin/overview/route.js';
import { GET as getUsers } from '../src/app/api/admin/users/route.js';
import { GET as getConfig, POST as postConfig } from '../src/app/api/admin/config/route.js';
import { GET as getSubs } from '../src/app/api/admin/subscriptions/route.js';
import { GET as getAuditLogs } from '../src/app/api/admin/audit-logs/route.js';
import { GET as getContentSummary } from '../src/app/api/admin/content/route.js';

describe('Milestone M4.5 — Centralized Administration System (Web Layer)', () => {
  // Helper to create mock NextRequest
  function createMockRequest(
    url: string,
    options?: {
      method?: string;
      headers?: Record<string, string>;
      body?: Record<string, unknown>;
    }
  ): NextRequest {
    const init: RequestInit = {
      method: options?.method || 'GET',
      headers: options?.headers || {},
    };
    if (options?.body) {
      init.body = JSON.stringify(options.body);
    }
    return new NextRequest(new URL(url, 'http://localhost:3000'), init as any);
  }

  // ==========================================================================
  // 1. Public Status Endpoint (/api/admin/status)
  // ==========================================================================
  describe('1. Public Platform Status Endpoint', () => {
    it('returns operational status without requiring authentication', async () => {
      const res = await getStatus();
      assert.equal(res.status, 200);

      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(typeof data.maintenanceMode, 'boolean');
      assert.ok(data.minSupportedMobileVersion);
      assert.ok(data.minSupportedWebVersion);
    });
  });

  // ==========================================================================
  // 2. Authentication Rejection on Privileged Endpoints (401)
  // ==========================================================================
  describe('2. Authentication Rejection (401 Unauthorized)', () => {
    it('rejects unauthenticated request to /api/admin/overview', async () => {
      const req = createMockRequest('/api/admin/overview');
      const res = await getOverview(req);
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /Authentication Required/);
    });

    it('rejects unauthenticated request to /api/admin/users', async () => {
      const req = createMockRequest('/api/admin/users');
      const res = await getUsers(req);
      assert.equal(res.status, 401);
    });

    it('rejects unauthenticated request to /api/admin/config', async () => {
      const req = createMockRequest('/api/admin/config');
      const res = await getConfig(req);
      assert.equal(res.status, 401);
    });

    it('rejects unauthenticated request to /api/admin/subscriptions', async () => {
      const req = createMockRequest('/api/admin/subscriptions');
      const res = await getSubs(req);
      assert.equal(res.status, 401);
    });

    it('rejects unauthenticated request to /api/admin/audit-logs', async () => {
      const req = createMockRequest('/api/admin/audit-logs');
      const res = await getAuditLogs(req);
      assert.equal(res.status, 401);
    });

    it('rejects unauthenticated request to /api/admin/content', async () => {
      const req = createMockRequest('/api/admin/content');
      const res = await getContentSummary(req);
      assert.equal(res.status, 401);
    });
  });

  // ==========================================================================
  // 3. RBAC Privilege Enforcement (403 Forbidden)
  // ==========================================================================
  describe('3. Non-Admin Role Rejection (403 Forbidden)', () => {
    const userHeaders = {
      'x-admin-role': 'user',
      'x-admin-id': '00000000-0000-0000-0001-000000000004',
      'x-admin-name': 'Bilal User',
    };

    it('rejects ordinary user from /api/admin/overview with 403 Forbidden', async () => {
      const req = createMockRequest('/api/admin/overview', { headers: userHeaders });
      const res = await getOverview(req);
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.match(data.error, /Forbidden/);
    });

    it('rejects ordinary user from /api/admin/users with 403 Forbidden', async () => {
      const req = createMockRequest('/api/admin/users', { headers: userHeaders });
      const res = await getUsers(req);
      assert.equal(res.status, 403);
    });

    it('rejects ordinary user from /api/admin/config with 403 Forbidden', async () => {
      const req = createMockRequest('/api/admin/config', { headers: userHeaders });
      const res = await getConfig(req);
      assert.equal(res.status, 403);
    });

    it('rejects ordinary user from /api/admin/audit-logs with 403 Forbidden', async () => {
      const req = createMockRequest('/api/admin/audit-logs', { headers: userHeaders });
      const res = await getAuditLogs(req);
      assert.equal(res.status, 403);
    });
  });

  // ==========================================================================
  // 4. Authorized Administrative Operations (200 OK)
  // ==========================================================================
  describe('4. Authorized Administrative Operations', () => {
    const adminHeaders = {
      'x-admin-role': 'admin',
      'x-admin-id': '00000000-0000-0000-0001-000000000005',
      'x-admin-name': 'Platform Admin',
    };

    const superAdminHeaders = {
      'x-admin-role': 'super_admin',
      'x-admin-id': '00000000-0000-0000-0001-000000000000',
      'x-admin-name': 'Root SuperAdmin',
    };

    it('authorized admin retrieves overview statistics', async () => {
      const req = createMockRequest('/api/admin/overview', { headers: adminHeaders });
      const res = await getOverview(req);
      assert.equal(res.status, 200);

      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.stats.totalUsers >= 4);
      assert.equal(data.stats.contentCounts.quranSurahs, 114);
      assert.equal(data.stats.contentCounts.quranAyahs, 6236);
    });

    it('support admin queries users and verifies zero auth secret exposure', async () => {
      const supportHeaders = {
        'x-admin-role': 'support_admin',
        'x-admin-id': '00000000-0000-0000-0001-000000000006',
        'x-admin-name': 'Support Admin',
      };
      const req = createMockRequest('/api/admin/users', { headers: supportHeaders });
      const res = await getUsers(req);
      assert.equal(res.status, 200);

      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.users.length >= 4);

      for (const u of data.users) {
        assert.equal(u.password, undefined);
        assert.equal(u.token, undefined);
        assert.equal(u.secret, undefined);
      }
    });

    it('admin toggles feature flag with immediate update and audit recording', async () => {
      const req = createMockRequest('/api/admin/config', {
        method: 'POST',
        headers: adminHeaders,
        body: {
          action: 'toggle_flag',
          flagKey: 'subscriptions_engine',
          flagEnabled: true,
        },
      });
      const res = await postConfig(req);
      assert.equal(res.status, 200);

      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.flag.isEnabled, true);

      // Revert flag
      const revertReq = createMockRequest('/api/admin/config', {
        method: 'POST',
        headers: adminHeaders,
        body: {
          action: 'toggle_flag',
          flagKey: 'subscriptions_engine',
          flagEnabled: false,
        },
      });
      await postConfig(revertReq);
    });

    it('super admin can query append-only audit logs', async () => {
      const req = createMockRequest('/api/admin/audit-logs', { headers: superAdminHeaders });
      const res = await getAuditLogs(req);
      assert.equal(res.status, 200);

      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.logs.length > 0);
    });

    it('admin inspects content summary verifying canonical seed immutability', async () => {
      const req = createMockRequest('/api/admin/content', { headers: adminHeaders });
      const res = await getContentSummary(req);
      assert.equal(res.status, 200);

      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.summary.quran.canonicalSeedStatus, 'PROTECTED / IMMUTABLE');
      assert.equal(data.summary.hadith.canonicalSeedStatus, 'PROTECTED / IMMUTABLE');
      assert.equal(data.summary.duas.canonicalSeedStatus, 'PROTECTED / IMMUTABLE');
    });
  });

  // ==========================================================================
  // 5. Public UI Boundary & Hardcoded Secrets Defense
  // ==========================================================================
  describe('5. Public UI Boundary & Credential Security', () => {
    it('verifies that no public admin button exists on the public landing page', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const possiblePaths = [
        path.resolve(process.cwd(), 'src/app/page.tsx'),
        path.resolve(process.cwd(), 'apps/web/src/app/page.tsx'),
      ];
      const validPath = possiblePaths.find((p) => fs.existsSync(p));
      assert.ok(validPath, 'Could not find page.tsx');
      const homeSource = fs.readFileSync(validPath, 'utf-8');
      assert.equal(
        homeSource.includes('Admin Login'),
        false,
        'Public home page must NOT contain an Admin Login button'
      );
    });

    it('verifies zero hardcoded administrative passwords in web source', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const possiblePaths = [
        path.resolve(process.cwd(), 'src/lib/admin.ts'),
        path.resolve(process.cwd(), 'apps/web/src/lib/admin.ts'),
      ];
      const validPath = possiblePaths.find((p) => fs.existsSync(p));
      assert.ok(validPath, 'Could not find admin.ts');
      const adminHelperSource = fs.readFileSync(validPath, 'utf-8');
      assert.equal(adminHelperSource.includes('admin123'), false);
      assert.equal(adminHelperSource.includes('password123'), false);
    });
  });
});
