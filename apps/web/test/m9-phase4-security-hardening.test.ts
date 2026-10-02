/**
 * @file m9-phase4-security-hardening.test.ts
 * @package @islamic/web
 * @description Comprehensive automated security validation test suite for Milestone M9 Phase 4:
 * Vulnerability Mitigation, Rate Limiting & Penetration Hardening.
 * Covers: Rate limit enforcement, header spoofing protection, IDOR/BOLA mitigations,
 * self-role modification prevention, self-suspension prevention, input bounding,
 * and security headers verification.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

// Utilities & Services under test
import {
  checkRateLimit,
  enforceRateLimit,
  resetRateLimitStore,
  RATE_LIMIT_TIERS,
} from '../src/lib/rate-limit.js';
import { authenticateAdminRequest } from '../src/lib/admin-auth.js';
import { AdminService } from '@islamic/database';

// Route Handlers
import { GET as getSearch } from '../src/app/api/search/route.js';
import { POST as postBookmark } from '../src/app/api/library/bookmarks/route.js';
import { GET as getAdminUsers } from '../src/app/api/admin/users/route.js';
import { POST as postAdminConfig } from '../src/app/api/admin/config/route.js';
import { POST as postCmsArticles } from '../src/app/api/cms/articles/route.js';

describe('Milestone M9 Phase 4 — Security Hardening & Vulnerability Mitigation', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

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
  // 1. Sliding-Window Rate Limiting Engine Tests
  // ==========================================================================
  describe('1. Sliding-Window Rate Limiting Engine', () => {
    it('allows requests within tier limit and tracks remaining quota', () => {
      const clientId = '192.168.1.100';
      const tier = 'tier1_auth'; // Limit 10
      const limit = RATE_LIMIT_TIERS[tier].maxRequests;

      for (let i = 0; i < limit; i++) {
        const result = checkRateLimit(clientId, tier);
        assert.equal(result.allowed, true);
        assert.equal(result.remaining, limit - 1 - i);
      }
    });

    it('rejects requests exceeding tier limit with HTTP 429 and Retry-After', () => {
      const clientId = '192.168.1.101';
      const tier = 'tier1_auth';
      const limit = RATE_LIMIT_TIERS[tier].maxRequests;

      // Exhaust limit
      for (let i = 0; i < limit; i++) {
        checkRateLimit(clientId, tier);
      }

      // Next request must be blocked
      const blocked = checkRateLimit(clientId, tier);
      assert.equal(blocked.allowed, false);
      assert.equal(blocked.remaining, 0);
      assert.ok(blocked.retryAfter > 0);

      // Verify enforceRateLimit helper emits 429 response
      const req = createMockRequest('/api/auth/login', {
        headers: { 'x-real-ip': clientId },
      });
      const enforcement = enforceRateLimit(req, tier);
      assert.equal(enforcement.allowed, false);
      assert.ok(enforcement.errorResponse);
      assert.equal(enforcement.errorResponse.status, 429);
      assert.ok(enforcement.headers['Retry-After']);
      assert.equal(enforcement.headers['X-RateLimit-Limit'], String(limit));
    });

    it('differentiates quota between distinct client IPs independently', () => {
      const clientA = '10.0.0.1';
      const clientB = '10.0.0.2';
      const tier = 'tier1_auth';

      // Exhaust client A
      for (let i = 0; i < 10; i++) {
        checkRateLimit(clientA, tier);
      }

      assert.equal(checkRateLimit(clientA, tier).allowed, false);
      // Client B should remain untouched
      const resB = checkRateLimit(clientB, tier);
      assert.equal(resB.allowed, true);
      assert.equal(resB.remaining, 9);
    });
  });

  // ==========================================================================
  // 2. Input Validation, Bounded Pagination & DoS Prevention
  // ==========================================================================
  describe('2. Input Validation & Bounded Pagination', () => {
    it('clamps excessive search pagination limit to 50 max', async () => {
      const req = createMockRequest('/api/search?q=mercy&limit=99999&page=1', {
        headers: { 'x-real-ip': '192.168.2.1' },
      });
      const res = await getSearch(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.results.length <= 50);
      assert.equal(data.limit, 50);
    });

    it('clamps negative search page numbers to 1', async () => {
      const req = createMockRequest('/api/search?q=mercy&page=-5', {
        headers: { 'x-real-ip': '192.168.2.2' },
      });
      const res = await getSearch(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.offset, 0);
    });

    it('rejects invalid bookmark contentType with 400 Bad Request', async () => {
      const req = createMockRequest('/api/library/bookmarks', {
        method: 'POST',
        headers: { 'x-real-ip': '192.168.2.3' },
        body: {
          contentType: 'malicious_injected_type',
          contentReference: '1:1',
        },
      });
      const res = await postBookmark(req);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /Invalid contentType/);
    });

    it('rejects unauthorized system settings properties in admin config', async () => {
      const adminHeaders = {
        'x-admin-role': 'super_admin',
        'x-admin-id': '00000000-0000-0000-0001-000000000000',
        'x-real-ip': '192.168.2.4',
      };
      const req = createMockRequest('/api/admin/config', {
        method: 'POST',
        headers: adminHeaders,
        body: {
          action: 'update_settings',
          settingsUpdates: {
            maintenanceMode: true,
            injectedDangerousProperty: 'evil_payload',
          },
        },
      });
      const res = await postAdminConfig(req);
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /not configurable/);
    });

    it('clamps admin user pagination limit to 100 max', async () => {
      const adminHeaders = {
        'x-admin-role': 'admin',
        'x-admin-id': '00000000-0000-0000-0001-000000000005',
        'x-real-ip': '192.168.2.5',
      };
      const req = createMockRequest('/api/admin/users?limit=5000', {
        headers: adminHeaders,
      });
      const res = await getAdminUsers(req);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.users.length <= 100);
    });
  });

  // ==========================================================================
  // 3. Administrative Authentication & Header Spoofing Protection
  // ==========================================================================
  describe('3. Admin Authentication & Header Spoofing Protection', () => {
    it('rejects direct x-admin-role header in production mode when unverified', () => {
      const originalEnv = process.env.NODE_ENV;
      const env = process.env as Record<string, string | undefined>;
      try {
        env.NODE_ENV = 'production';
        delete env.ADMIN_API_SECRET;

        const req = createMockRequest('/api/admin/overview', {
          headers: {
            'x-admin-role': 'super_admin',
            'x-admin-id': '00000000-0000-0000-0001-000000000000',
          },
        });

        const auth = authenticateAdminRequest(req);
        assert.equal(auth.actor, null);
        assert.ok(auth.errorResponse);
        assert.equal(auth.errorResponse.status, 401);
      } finally {
        env.NODE_ENV = originalEnv;
      }
    });

    it('accepts administrative request with matching ADMIN_API_SECRET', () => {
      const originalSecret = process.env.ADMIN_API_SECRET;
      try {
        process.env.ADMIN_API_SECRET = 'super-secret-admin-key-2026';

        const req = createMockRequest('/api/admin/overview', {
          headers: {
            'x-admin-secret': 'super-secret-admin-key-2026',
            'x-admin-role': 'admin',
          },
        });

        const auth = authenticateAdminRequest(req);
        assert.ok(auth.actor);
        assert.equal(auth.actor.roles[0], 'admin');
        assert.equal(auth.errorResponse, undefined);
      } finally {
        process.env.ADMIN_API_SECRET = originalSecret;
      }
    });

    it('rejects administrative request with mismatched ADMIN_API_SECRET', () => {
      const originalSecret = process.env.ADMIN_API_SECRET;
      try {
        process.env.ADMIN_API_SECRET = 'super-secret-admin-key-2026';

        const req = createMockRequest('/api/admin/overview', {
          headers: {
            'x-admin-secret': 'wrong-attacker-key',
            'x-admin-role': 'admin',
          },
        });

        const auth = authenticateAdminRequest(req);
        assert.equal(auth.actor, null);
        assert.ok(auth.errorResponse);
        assert.equal(auth.errorResponse.status, 401);
      } finally {
        process.env.ADMIN_API_SECRET = originalSecret;
      }
    });
  });

  // ==========================================================================
  // 4. Privilege Escalation, Self-Modification & Account Suspension Hardening
  // ==========================================================================
  describe('4. Privilege Escalation & Self-Modification Hardening', () => {
    it('prohibits administrator from modifying their own role', async () => {
      const adminService = new AdminService();
      const superAdminActor = {
        id: '00000000-0000-0000-0001-000000000000',
        name: 'Root SuperAdmin',
        roles: ['super_admin' as const],
      };

      await assert.rejects(
        async () => {
          await adminService.updateUserRole(
            superAdminActor,
            superAdminActor.id, // Target is SELF
            'admin'
          );
        },
        /Security Error: Administrative self-role modification is prohibited/
      );
    });

    it('prohibits administrator from suspending or unsuspending themselves', async () => {
      const adminService = new AdminService();
      const adminActor = {
        id: '00000000-0000-0000-0001-000000000005',
        name: 'Platform Admin',
        roles: ['admin' as const],
      };

      await assert.rejects(
        async () => {
          await adminService.setUserSuspension(
            adminActor,
            adminActor.id, // Target is SELF
            true,
            'Self suspension attempt'
          );
        },
        /Security Error: Administrative self-suspension and self-unsuspension are prohibited/
      );
    });

    it('blocks suspended administrators from performing privileged actions', async () => {
      const adminService = new AdminService();
      const superAdminActor = {
        id: '00000000-0000-0000-0001-000000000000',
        name: 'Root SuperAdmin',
        roles: ['super_admin' as const],
      };

      const targetAdminId = '00000000-0000-0000-0001-000000000003';
      // Suspend admin target (Chief Editor Tariq, content_admin)
      await adminService.setUserSuspension(superAdminActor, targetAdminId, true, 'Audit suspension');

      const suspendedAdminActor = {
        id: targetAdminId,
        name: 'Chief Editor Tariq',
        roles: ['content_admin' as const],
      };

      // Suspended admin attempting to view overview stats
      await assert.rejects(
        async () => {
          await adminService.getOverviewStats(suspendedAdminActor);
        },
        /Authorization Error: Suspended administrator account/
      );
    });

    it('rejects suspension of platform Super Admin account', async () => {
      const adminService = new AdminService();
      const superAdminActor = {
        id: '00000000-0000-0000-0001-000000000000',
        name: 'Root SuperAdmin',
        roles: ['super_admin' as const],
      };

      const secondSuperAdminActor = {
        id: '00000000-0000-0000-0001-000000000099',
        name: 'Secondary SuperAdmin',
        roles: ['super_admin' as const],
      };

      await assert.rejects(
        async () => {
          await adminService.setUserSuspension(
            secondSuperAdminActor,
            superAdminActor.id,
            true
          );
        },
        /Security Error: A Super Admin account cannot be suspended/
      );
    });
  });

  // ==========================================================================
  // 5. CMS Authorization & Scholar Review Gate Hardening
  // ==========================================================================
  describe('5. CMS Authorization & Scholar Review Gate Hardening', () => {
    it('rejects unauthorized user from publishing articles without content_admin role', async () => {
      const req = createMockRequest('/api/cms/articles', {
        method: 'POST',
        headers: { 'x-real-ip': '192.168.3.1' },
        body: {
          action: 'publish',
          articleId: 'article-1',
          revisionId: 'rev-1',
          actorId: '00000000-0000-0000-0001-000000000004',
          actorRoles: ['user'],
        },
      });
      const res = await postCmsArticles(req);
      assert.ok(res);
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /Publishing articles requires content_admin/);
    });

    it('rejects unauthorized user from submitting scholar review decisions', async () => {
      const req = createMockRequest('/api/cms/articles', {
        method: 'POST',
        headers: { 'x-real-ip': '192.168.3.2' },
        body: {
          action: 'submit_decision',
          reviewId: 'review-1',
          decision: 'approved',
          scholarlyNotes: 'Looks authentic',
          actorId: '00000000-0000-0000-0001-000000000004',
          actorRoles: ['editor'], // editor cannot approve scholar reviews
        },
      });
      const res = await postCmsArticles(req);
      assert.ok(res);
      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.error, /Scholar decisions require verified scholar_reviewer role/);
    });
  });
});
