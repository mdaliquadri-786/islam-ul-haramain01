/**
 * @file admin-service.test.ts
 * @package @islamic/database
 * @description Comprehensive unit test suite for AdminService.
 * Validates RBAC permissions, system configuration, maintenance mode,
 * feature flags, user management, subscriptions, audit logging, and content governance.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AdminService,
  type AdminActor,
  type UserRole,
  type AdminPermission,
} from '../src/admin/admin-service.js';

describe('Milestone M4.5 — Centralized Admin Service & Operational Control', () => {
  const service = new AdminService();

  const superAdminActor: AdminActor = {
    id: '00000000-0000-0000-0001-000000000000',
    name: 'Root SuperAdmin',
    roles: ['super_admin'],
  };

  const generalAdminActor: AdminActor = {
    id: '00000000-0000-0000-0001-000000000005',
    name: 'General Admin',
    roles: ['admin'],
  };

  const contentAdminActor: AdminActor = {
    id: '00000000-0000-0000-0001-000000000003',
    name: 'Content Admin',
    roles: ['content_admin'],
  };

  const scholarActor: AdminActor = {
    id: '00000000-0000-0000-0001-000000000002',
    name: 'Dr. Ahmad',
    roles: ['scholar_reviewer'],
  };

  const supportAdminActor: AdminActor = {
    id: '00000000-0000-0000-0001-000000000006',
    name: 'Support Admin',
    roles: ['support_admin'],
  };

  const billingAdminActor: AdminActor = {
    id: '00000000-0000-0000-0001-000000000007',
    name: 'Billing Admin',
    roles: ['billing_admin'],
  };

  const regularUserActor: AdminActor = {
    id: '00000000-0000-0000-0001-000000000004',
    name: 'Bilal User',
    roles: ['user'],
  };

  // ==========================================================================
  // 1. RBAC & Granular Permission Tests
  // ==========================================================================
  describe('1. RBAC & Permission Enforcement', () => {
    it('super_admin holds all granular permissions', () => {
      const allPerms: AdminPermission[] = [
        'read',
        'create',
        'update',
        'delete',
        'publish',
        'approve',
        'manage_users',
        'manage_roles',
        'manage_subscriptions',
        'manage_settings',
        'manage_feature_flags',
        'view_audit_logs',
      ];
      for (const p of allPerms) {
        assert.equal(
          service.hasPermission(superAdminActor.roles, p),
          true,
          `super_admin must have permission: ${p}`
        );
      }
    });

    it('general admin holds operational permissions but cannot manage_roles', () => {
      assert.equal(service.hasPermission(generalAdminActor.roles, 'manage_settings'), true);
      assert.equal(service.hasPermission(generalAdminActor.roles, 'manage_users'), true);
      assert.equal(service.hasPermission(generalAdminActor.roles, 'manage_feature_flags'), true);
      assert.equal(service.hasPermission(generalAdminActor.roles, 'manage_roles'), false);
    });

    it('content_admin can publish but cannot manage_users or manage_settings', () => {
      assert.equal(service.hasPermission(contentAdminActor.roles, 'publish'), true);
      assert.equal(service.hasPermission(contentAdminActor.roles, 'create'), true);
      assert.equal(service.hasPermission(contentAdminActor.roles, 'manage_users'), false);
      assert.equal(service.hasPermission(contentAdminActor.roles, 'manage_settings'), false);
    });

    it('scholar_reviewer can approve but cannot publish or manage_settings', () => {
      assert.equal(service.hasPermission(scholarActor.roles, 'approve'), true);
      assert.equal(service.hasPermission(scholarActor.roles, 'publish'), false);
      assert.equal(service.hasPermission(scholarActor.roles, 'manage_settings'), false);
    });

    it('billing_admin can manage_subscriptions but cannot manage_settings', () => {
      assert.equal(service.hasPermission(billingAdminActor.roles, 'manage_subscriptions'), true);
      assert.equal(service.hasPermission(billingAdminActor.roles, 'manage_settings'), false);
    });

    it('regular user has only read permission; all privileged actions denied', () => {
      assert.equal(service.hasPermission(regularUserActor.roles, 'read'), true);
      assert.equal(service.hasPermission(regularUserActor.roles, 'manage_settings'), false);
      assert.equal(service.hasPermission(regularUserActor.roles, 'manage_users'), false);
      assert.equal(service.hasPermission(regularUserActor.roles, 'manage_roles'), false);
      assert.equal(service.hasPermission(regularUserActor.roles, 'publish'), false);
      assert.equal(service.hasPermission(regularUserActor.roles, 'view_audit_logs'), false);
    });
  });

  // ==========================================================================
  // 2. System Settings & Maintenance Mode
  // ==========================================================================
  describe('2. System Configuration & Maintenance Mode', () => {
    it('retrieves default system settings', async () => {
      const settings = await service.getSystemSettings();
      assert.equal(settings.id, 1);
      assert.equal(settings.maintenanceMode, false);
      assert.equal(settings.registrationEnabled, true);
      assert.equal(settings.publishingEnabled, true);
      assert.equal(settings.defaultLocale, 'en');
    });

    it('authorized admin can activate Maintenance Mode and record audit event', async () => {
      const updated = await service.updateSystemSettings(generalAdminActor, {
        maintenanceMode: true,
        maintenanceMessage: 'Emergency server patching in progress. Offline features available.',
      });

      assert.equal(updated.maintenanceMode, true);
      assert.equal(
        updated.maintenanceMessage,
        'Emergency server patching in progress. Offline features available.'
      );

      // Verify audit log
      const logs = await service.queryAuditLogs(superAdminActor, {
        action: 'admin.settings_updated',
      });
      assert.ok(logs.length > 0);
      assert.equal(logs[0].actorId, generalAdminActor.id);
      assert.equal((logs[0].details as any).updated.maintenanceMode, true);

      // Revert maintenance mode for subsequent tests
      await service.updateSystemSettings(generalAdminActor, {
        maintenanceMode: false,
      });
    });

    it('unauthorized user cannot update system settings (fails closed)', async () => {
      await assert.rejects(
        async () => {
          await service.updateSystemSettings(regularUserActor, {
            maintenanceMode: true,
          });
        },
        /Authorization Error.*manage_settings/
      );
    });
  });

  // ==========================================================================
  // 3. Feature Flags
  // ==========================================================================
  describe('3. Dynamic Feature Flags', () => {
    it('lists all initialized feature flags', async () => {
      const flags = await service.getFeatureFlags();
      assert.ok(flags.length >= 10);
      const quranFlag = flags.find((f) => f.key === 'quran_reading');
      assert.ok(quranFlag);
      assert.equal(quranFlag.isEnabled, true);

      const subFlag = flags.find((f) => f.key === 'subscriptions_engine');
      assert.ok(subFlag);
      assert.equal(subFlag.isEnabled, false); // initially admin only
    });

    it('authorized admin can toggle feature flags', async () => {
      const toggled = await service.toggleFeatureFlag(
        generalAdminActor,
        'subscriptions_engine',
        true
      );
      assert.equal(toggled.isEnabled, true);

      const logs = await service.queryAuditLogs(superAdminActor, {
        action: 'admin.feature_flag_toggled',
      });
      assert.ok(logs.length > 0);
      assert.equal((logs[0].details as any).key, 'subscriptions_engine');
      assert.equal((logs[0].details as any).newState, true);

      // Revert flag
      await service.toggleFeatureFlag(generalAdminActor, 'subscriptions_engine', false);
    });

    it('unauthorized user cannot toggle feature flags', async () => {
      await assert.rejects(
        async () => {
          await service.toggleFeatureFlag(regularUserActor, 'quran_reading', false);
        },
        /Authorization Error.*manage_feature_flags/
      );
    });
  });

  // ==========================================================================
  // 4. User Management & Suspension
  // ==========================================================================
  describe('4. User Management & Security Controls', () => {
    it('lists platform users without exposing auth secrets or tokens', async () => {
      const { users, total } = await service.listUsers(supportAdminActor);
      assert.ok(total >= 4);
      assert.ok(users.length >= 4);

      for (const u of users) {
        assert.ok(u.id);
        assert.ok(u.roles.length > 0);
        // Assert absence of any secret fields
        assert.equal((u as any).password, undefined);
        assert.equal((u as any).encrypted_password, undefined);
        assert.equal((u as any).access_token, undefined);
        assert.equal((u as any).refresh_token, undefined);
      }
    });

    it('searches users by username, full name, or ID', async () => {
      const result = await service.listUsers(supportAdminActor, { search: 'bilal' });
      assert.equal(result.total, 1);
      assert.equal(result.users[0].username, 'bilal_user');
    });

    it('filters users by role', async () => {
      const result = await service.listUsers(supportAdminActor, { role: 'scholar_reviewer' });
      assert.equal(result.total, 1);
      assert.equal(result.users[0].username, 'drahmad');
    });

    it('super_admin can update user roles with audit trail', async () => {
      await service.updateUserRole(
        superAdminActor,
        '00000000-0000-0000-0001-000000000004', // bilal_user
        'editor'
      );

      const { users } = await service.listUsers(supportAdminActor, { search: 'bilal_user' });
      assert.deepEqual(users[0].roles, ['editor']);

      // Revert role
      await service.updateUserRole(
        superAdminActor,
        '00000000-0000-0000-0001-000000000004',
        'user'
      );
    });

    it('cannot demote the platform root super_admin', async () => {
      await assert.rejects(
        async () => {
          await service.updateUserRole(
            superAdminActor,
            '00000000-0000-0000-0001-000000000000',
            'user'
          );
        },
        /Security Constraint Violation/
      );
    });

    it('support_admin can suspend and reactivate user with reason', async () => {
      const targetId = '00000000-0000-0000-0001-000000000004';
      await service.setUserSuspension(
        supportAdminActor,
        targetId,
        true,
        'Investigating terms of service violation'
      );

      let { users } = await service.listUsers(supportAdminActor, { search: 'bilal_user' });
      assert.equal(users[0].isSuspended, true);
      assert.equal(users[0].suspendedReason, 'Investigating terms of service violation');

      // Reactivate
      await service.setUserSuspension(supportAdminActor, targetId, false);
      users = (await service.listUsers(supportAdminActor, { search: 'bilal_user' })).users;
      assert.equal(users[0].isSuspended, false);
    });

    it('cannot suspend a super_admin account', async () => {
      await assert.rejects(
        async () => {
          await service.setUserSuspension(
            supportAdminActor,
            '00000000-0000-0000-0001-000000000000',
            true
          );
        },
        /Security Error: A Super Admin account cannot be suspended/
      );
    });
  });

  // ==========================================================================
  // 5. Subscription Management Foundation
  // ==========================================================================
  describe('5. Subscription Management Foundation', () => {
    it('lists initialized subscription plans', async () => {
      const plans = await service.listSubscriptionPlans();
      assert.ok(plans.length >= 4);
      assert.equal(plans[0].slug, 'free');
      assert.equal(plans[0].priceCents, 0);

      const waqfPlan = plans.find((p) => p.slug === 'waqf_patron');
      assert.ok(waqfPlan);
      assert.equal(waqfPlan.priceCents, 25000);
    });

    it('billing_admin can upsert subscription plans and adjust user subscriptions', async () => {
      const newPlan = await service.upsertSubscriptionPlan(billingAdminActor, {
        slug: 'institutional_waqf',
        name: 'Institutional Waqf Partner',
        description: 'Endowment for universities and masajid',
        priceCents: 100000,
        billingInterval: 'year',
        features: ['all_features', 'institutional_dashboard'],
      });
      assert.ok(newPlan.id);
      assert.equal(newPlan.slug, 'institutional_waqf');

      // Adjust user subscription
      await service.adjustUserSubscription(
        billingAdminActor,
        '00000000-0000-0000-0001-000000000004',
        {
          planSlug: 'institutional_waqf',
          status: 'active',
        }
      );

      const subs = await service.listUserSubscriptions(
        billingAdminActor,
        '00000000-0000-0000-0001-000000000004'
      );
      assert.ok(subs.length > 0);
      assert.equal(subs[0].status, 'active');
      assert.equal(subs[0].plan?.slug, 'institutional_waqf');
    });

    it('regular user cannot adjust subscriptions (fails closed)', async () => {
      await assert.rejects(
        async () => {
          await service.adjustUserSubscription(
            regularUserActor,
            '00000000-0000-0000-0001-000000000004',
            { planSlug: 'free', status: 'free' }
          );
        },
        /Authorization Error.*manage_subscriptions/
      );
    });
  });

  // ==========================================================================
  // 6. Content Governance & Operational Metrics
  // ==========================================================================
  describe('6. Content Governance & Dashboard Overview', () => {
    it('dashboard overview compiles authentic metrics and recent audits', async () => {
      const stats = await service.getOverviewStats(generalAdminActor);
      assert.ok(stats.totalUsers >= 4);
      assert.equal(stats.contentCounts.quranSurahs, 114);
      assert.equal(stats.contentCounts.quranAyahs, 6236);
      assert.equal(stats.contentCounts.hadithNarrations, 18972);
      assert.equal(stats.contentCounts.duasCount, 268);
      assert.equal(stats.contentCounts.tafsirWorks, 2);
      assert.equal(stats.contentCounts.classicalBooks, 4);
      assert.ok(stats.recentAuditLogs.length > 0);
    });

    it('content management summary confirms canonical seeds remain protected', async () => {
      const summary = (await service.getContentManagementSummary(
        generalAdminActor
      )) as any;
      assert.equal(summary.quran.canonicalSeedStatus, 'PROTECTED / IMMUTABLE');
      assert.equal(summary.hadith.canonicalSeedStatus, 'PROTECTED / IMMUTABLE');
      assert.equal(summary.duas.canonicalSeedStatus, 'PROTECTED / IMMUTABLE');
      assert.equal(summary.articles.authorSelfApprovalProhibited, true);
    });

    it('unauthorized user cannot access administrative overview (fails closed)', async () => {
      await assert.rejects(
        async () => {
          await service.getOverviewStats(regularUserActor);
        },
        /Authorization Error.*view_audit_logs/
      );
    });
  });
});
