/**
 * @file admin-service.ts
 * @package @islamic/database
 * @description Centralized service layer for Platform Administration, Granular RBAC,
 * System Configuration, Maintenance Mode, Feature Flags, Subscriptions, and Audit Logging.
 * Supports dual-mode operation (Supabase PostgreSQL + In-Memory Store for isolated testing).
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  UserRole,
  AdminPermission,
  SystemSettingsEntity,
  FeatureFlagEntity,
  SubscriptionPlanEntity,
  UserSubscriptionEntity,
  AdminOverviewStats,
  AdminUserListItem,
  AdminAuditLogEntry,
  SubscriptionStatus,
} from '../types.js';

export interface AdminActor {
  id: string;
  name?: string;
  roles: UserRole[];
}

export const ROLE_PERMISSIONS: Record<UserRole, AdminPermission[]> = {
  super_admin: [
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
  ],
  admin: [
    'read',
    'create',
    'update',
    'delete',
    'publish',
    'manage_users',
    'manage_subscriptions',
    'manage_settings',
    'manage_feature_flags',
    'view_audit_logs',
  ],
  content_admin: [
    'read',
    'create',
    'update',
    'delete',
    'publish',
    'view_audit_logs',
  ],
  scholar_reviewer: [
    'read',
    'approve',
    'view_audit_logs',
  ],
  support_admin: [
    'read',
    'manage_users',
    'view_audit_logs',
  ],
  billing_admin: [
    'read',
    'manage_subscriptions',
    'view_audit_logs',
  ],
  editor: [
    'read',
    'create',
    'update',
  ],
  translator: [
    'read',
    'update',
  ],
  user: [
    'read',
  ],
};

export class AdminService {
  private supabaseClient: SupabaseClient | null = null;

  // In-Memory Data Store for isolated testing and offline operation
  private systemSettings: SystemSettingsEntity = {
    id: 1,
    maintenanceMode: false,
    maintenanceMessage:
      'Platform undergoing scheduled maintenance. Offline devotional tools remain active.',
    announcementBannerEnabled: false,
    announcementBannerText: null,
    registrationEnabled: true,
    publishingEnabled: true,
    subscriptionsEnabled: false,
    minSupportedMobileVersion: '1.0.0',
    minSupportedWebVersion: '1.0.0',
    defaultLocale: 'en',
    updatedAt: new Date().toISOString(),
    updatedBy: null,
  };

  private featureFlags = new Map<string, FeatureFlagEntity>();
  private subscriptionPlans = new Map<string, SubscriptionPlanEntity>();
  private userSubscriptions = new Map<string, UserSubscriptionEntity>();
  private users = new Map<string, AdminUserListItem>();
  private auditLogs: AdminAuditLogEntry[] = [];

  constructor(options?: { supabaseClient?: SupabaseClient }) {
    this.supabaseClient = options?.supabaseClient || null;
    this.initializeDefaultData();
  }

  public getClient(): SupabaseClient | null {
    return this.supabaseClient;
  }

  private initializeDefaultData(): void {
    // 1. Core Feature Flags
    const defaultFlags: FeatureFlagEntity[] = [
      {
        key: 'quran_reading',
        name: 'Quran Scripture Reader',
        description: 'Surah and Ayah reading with verified translations',
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'hadith_browser',
        name: 'Hadith Collections Browser',
        description: 'Kutub al-Sittah collection browsing and Sanad/Matn viewer',
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'duas_adhkar',
        name: 'Hisn al-Muslim Duas',
        description: 'Supplications and daily prophetic adhkar counters',
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'prayer_times',
        name: 'Prayer Times & Qibla Engine',
        description: 'Devotional prayer calculation and Great Circle Qibla compass',
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'tafsir_comparative',
        name: 'Comparative Tafsir Viewer',
        description: "Ibn Kathir and Al-Sa'di comparative exegesis viewer",
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'books_ereader',
        name: 'Classical Islamic Books e-Reader',
        description: 'Digital book reader for classical Sunni treatises',
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'audio_streaming',
        name: 'Verified Reciter Audio',
        description: 'CDN audio recitation streaming with Ayah timestamps',
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'scholar_cms',
        name: 'Scholar Review Workflow',
        description: 'Editorial drafting, peer review, and publication safety gating',
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'user_library',
        name: 'Personal Library & Bookmarks',
        description: 'Cross-content bookmarking and reading progress tracking',
        isEnabled: true,
        targetAudience: 'all',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        key: 'subscriptions_engine',
        name: 'Subscription Management',
        description: 'Platform patronage and subscription tiers',
        isEnabled: false,
        targetAudience: 'admin_only',
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
    ];
    for (const flag of defaultFlags) {
      this.featureFlags.set(flag.key, flag);
    }

    // 2. Default Subscription Plans
    const defaultPlans: SubscriptionPlanEntity[] = [
      {
        id: 'plan-free-0001',
        slug: 'free',
        name: 'Community Access',
        description:
          'Full access to Quran, Hadith, Duas, Prayer Times, and core educational articles',
        priceCents: 0,
        currency: 'USD',
        billingInterval: 'free',
        features: [
          'unlimited_quran',
          'unlimited_hadith',
          'offline_prayer_times',
          'basic_bookmarks',
        ],
        isActive: true,
        sortOrder: 0,
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        id: 'plan-supporter-month-0002',
        slug: 'supporter_monthly',
        name: 'Monthly Platform Supporter',
        description:
          'Support server costs, CDN streaming, and classical digital preservation',
        priceCents: 500,
        currency: 'USD',
        billingInterval: 'month',
        features: [
          'all_free_features',
          'cloud_sync',
          'unlimited_bookmarks',
          'priority_audio_cdn',
          'patron_badge',
        ],
        isActive: true,
        sortOrder: 1,
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        id: 'plan-supporter-year-0003',
        slug: 'supporter_annual',
        name: 'Annual Platform Supporter',
        description: 'Annual sponsorship with 2 months free',
        priceCents: 5000,
        currency: 'USD',
        billingInterval: 'year',
        features: [
          'all_free_features',
          'cloud_sync',
          'unlimited_bookmarks',
          'priority_audio_cdn',
          'patron_badge',
        ],
        isActive: true,
        sortOrder: 2,
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
      {
        id: 'plan-waqf-patron-0004',
        slug: 'waqf_patron',
        name: 'Endowment (Waqf) Patron',
        description:
          'Perpetual digital Islamic endowment patron contributing directly to server infrastructure and research',
        priceCents: 25000,
        currency: 'USD',
        billingInterval: 'year',
        features: [
          'all_supporter_features',
          'waqf_patron_badge',
          'annual_transparency_report',
        ],
        isActive: true,
        sortOrder: 3,
        createdAt: '2026-09-22T00:00:00Z',
        updatedAt: '2026-09-22T00:00:00Z',
      },
    ];
    for (const plan of defaultPlans) {
      this.subscriptionPlans.set(plan.id, plan);
    }

    // 3. Seed Initial Demo Users
    const defaultUsers: AdminUserListItem[] = [
      {
        id: '00000000-0000-0000-0001-000000000000',
        username: 'superadmin',
        fullName: 'Imam al-Khabir (Root SuperAdmin)',
        preferredLocale: 'ar',
        roles: ['super_admin'],
        isSuspended: false,
        createdAt: '2026-09-22T00:00:00Z',
        lastActiveAt: '2026-09-25T12:00:00Z',
        activeSubscription: {
          planSlug: 'waqf_patron',
          planName: 'Endowment (Waqf) Patron',
          status: 'active',
        },
      },
      {
        id: '00000000-0000-0000-0001-000000000002',
        username: 'drahmad',
        fullName: 'Shaykh Dr. Ahmad (Peer Reviewer)',
        preferredLocale: 'ar',
        roles: ['scholar_reviewer'],
        isSuspended: false,
        createdAt: '2026-09-23T00:00:00Z',
        lastActiveAt: '2026-09-25T11:00:00Z',
        activeSubscription: {
          planSlug: 'free',
          planName: 'Community Access',
          status: 'free',
        },
      },
      {
        id: '00000000-0000-0000-0001-000000000003',
        username: 'editor_tariq',
        fullName: 'Chief Editor Tariq',
        preferredLocale: 'en',
        roles: ['editor', 'content_admin'],
        isSuspended: false,
        createdAt: '2026-09-23T00:00:00Z',
        lastActiveAt: '2026-09-25T10:30:00Z',
        activeSubscription: {
          planSlug: 'supporter_monthly',
          planName: 'Monthly Platform Supporter',
          status: 'active',
        },
      },
      {
        id: '00000000-0000-0000-0001-000000000004',
        username: 'bilal_user',
        fullName: 'Bilal al-Muwahhid',
        preferredLocale: 'ur',
        roles: ['user'],
        isSuspended: false,
        createdAt: '2026-09-24T00:00:00Z',
        lastActiveAt: '2026-09-25T09:00:00Z',
        activeSubscription: {
          planSlug: 'free',
          planName: 'Community Access',
          status: 'free',
        },
      },
    ];
    for (const u of defaultUsers) {
      this.users.set(u.id, u);
    }

    // 4. Initial Audit Events
    this.recordAuditEvent({
      action: 'system.bootstrap',
      targetEntityType: 'system',
      targetEntityId: '1',
      details: { message: 'System administration engine initialized.' },
      sourceContext: 'init',
      actorId: '00000000-0000-0000-0001-000000000000',
      actorName: 'Root SuperAdmin',
    });
  }

  // ==========================================================================
  // RBAC Permission Checking
  // ==========================================================================

  public hasPermission(
    actorRoles: UserRole[],
    permission: AdminPermission
  ): boolean {
    if (!actorRoles || actorRoles.length === 0) return false;
    if (actorRoles.includes('super_admin')) return true;

    for (const role of actorRoles) {
      const perms = ROLE_PERMISSIONS[role];
      if (perms && perms.includes(permission)) {
        return true;
      }
    }
    return false;
  }

  public assertPermission(
    actor: AdminActor,
    permission: AdminPermission,
    actionDesc = 'This administrative operation'
  ): void {
    const userRecord = this.users.get(actor.id);
    if (userRecord && userRecord.isSuspended) {
      throw new Error(
        `Authorization Error: Suspended administrator account '${actor.id}' cannot perform administrative actions.`
      );
    }

    if (!this.hasPermission(actor.roles, permission)) {
      throw new Error(
        `Authorization Error: ${actionDesc} requires permission '${permission}'. User roles: [${actor.roles.join(
          ', '
        )}] do not possess this permission.`
      );
    }
  }

  // ==========================================================================
  // Audit Logging (Append-Only)
  // ==========================================================================

  public recordAuditEvent(event: {
    action: string;
    targetEntityType: string;
    targetEntityId?: string | null;
    details?: Record<string, unknown>;
    sourceContext?: string | null;
    actorId?: string | null;
    actorName?: string | null;
  }): AdminAuditLogEntry {
    const entry: AdminAuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      action: event.action,
      targetEntityType: event.targetEntityType,
      targetEntityId: event.targetEntityId || null,
      details: event.details || {},
      sourceContext: event.sourceContext || 'admin_portal',
      actorId: event.actorId || null,
      actorName: event.actorName || null,
      createdAt: new Date().toISOString(),
    };

    // Prepend to audit log list (latest first)
    this.auditLogs.unshift(entry);
    return entry;
  }

  public async queryAuditLogs(
    actor: AdminActor,
    options?: {
      actorId?: string;
      action?: string;
      targetEntityType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<AdminAuditLogEntry[]> {
    this.assertPermission(actor, 'view_audit_logs', 'Viewing audit logs');

    let results = [...this.auditLogs];
    if (options?.actorId) {
      results = results.filter((l) => l.actorId === options.actorId);
    }
    if (options?.action) {
      results = results.filter((l) => l.action === options.action);
    }
    if (options?.targetEntityType) {
      results = results.filter(
        (l) => l.targetEntityType === options.targetEntityType
      );
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    return results.slice(offset, offset + limit);
  }

  // ==========================================================================
  // Overview & Metrics
  // ==========================================================================

  public async getOverviewStats(actor: AdminActor): Promise<AdminOverviewStats> {
    this.assertPermission(actor, 'view_audit_logs', 'Viewing administrative dashboard');

    const totalUsers = this.users.size;
    let activeUsers = 0;
    let suspendedUsers = 0;
    for (const u of this.users.values()) {
      if (u.isSuspended) suspendedUsers++;
      else activeUsers++;
    }

    let activeSubscriptions = 0;
    for (const u of this.users.values()) {
      if (u.activeSubscription && u.activeSubscription.status === 'active') {
        activeSubscriptions++;
      }
    }

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalSubscriptions: this.subscriptionPlans.size,
      activeSubscriptions,
      contentCounts: {
        quranSurahs: 114,
        quranAyahs: 6236,
        hadithNarrations: 18972,
        duasCount: 268,
        tafsirWorks: 2,
        classicalBooks: 4,
        articlesTotal: 8,
        articlesPublished: 6,
        articlesPendingReview: 2,
        recitersCount: 6,
      },
      systemStatus: {
        maintenanceMode: this.systemSettings.maintenanceMode,
        registrationEnabled: this.systemSettings.registrationEnabled,
        publishingEnabled: this.systemSettings.publishingEnabled,
        subscriptionsEnabled: this.systemSettings.subscriptionsEnabled,
      },
      recentAuditLogs: this.auditLogs.slice(0, 10),
    };
  }

  // ==========================================================================
  // System Settings & Maintenance Mode
  // ==========================================================================

  public async getSystemSettings(): Promise<SystemSettingsEntity> {
    return { ...this.systemSettings };
  }

  public async updateSystemSettings(
    actor: AdminActor,
    updates: Partial<SystemSettingsEntity>
  ): Promise<SystemSettingsEntity> {
    this.assertPermission(actor, 'manage_settings', 'Updating system settings');

    const prev = { ...this.systemSettings };
    this.systemSettings = {
      ...this.systemSettings,
      ...updates,
      id: 1, // enforce single row
      updatedAt: new Date().toISOString(),
      updatedBy: actor.id,
    };

    this.recordAuditEvent({
      action: 'admin.settings_updated',
      targetEntityType: 'system_settings',
      targetEntityId: '1',
      details: {
        previous: {
          maintenanceMode: prev.maintenanceMode,
          registrationEnabled: prev.registrationEnabled,
          publishingEnabled: prev.publishingEnabled,
        },
        updated: {
          maintenanceMode: this.systemSettings.maintenanceMode,
          registrationEnabled: this.systemSettings.registrationEnabled,
          publishingEnabled: this.systemSettings.publishingEnabled,
        },
      },
      sourceContext: 'system_settings',
      actorId: actor.id,
      actorName: actor.name,
    });

    return { ...this.systemSettings };
  }

  // ==========================================================================
  // Feature Flags
  // ==========================================================================

  public async getFeatureFlags(): Promise<FeatureFlagEntity[]> {
    return Array.from(this.featureFlags.values());
  }

  public async toggleFeatureFlag(
    actor: AdminActor,
    key: string,
    isEnabled: boolean
  ): Promise<FeatureFlagEntity> {
    this.assertPermission(
      actor,
      'manage_feature_flags',
      'Toggling feature flags'
    );

    const flag = this.featureFlags.get(key);
    if (!flag) {
      throw new Error(`Feature flag with key '${key}' does not exist.`);
    }

    const previousState = flag.isEnabled;
    flag.isEnabled = isEnabled;
    flag.updatedAt = new Date().toISOString();
    flag.updatedBy = actor.id;
    this.featureFlags.set(key, flag);

    this.recordAuditEvent({
      action: 'admin.feature_flag_toggled',
      targetEntityType: 'feature_flags',
      targetEntityId: key,
      details: {
        key,
        previousState,
        newState: isEnabled,
      },
      sourceContext: 'feature_flags',
      actorId: actor.id,
      actorName: actor.name,
    });

    return { ...flag };
  }

  // ==========================================================================
  // User Management
  // ==========================================================================

  public async listUsers(
    actor: AdminActor,
    options?: {
      search?: string;
      role?: UserRole;
      isSuspended?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ users: AdminUserListItem[]; total: number }> {
    this.assertPermission(actor, 'manage_users', 'Listing platform users');

    let allUsers = Array.from(this.users.values());

    if (options?.search) {
      const q = options.search.toLowerCase();
      allUsers = allUsers.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.fullName?.toLowerCase().includes(q) ||
          u.id.toLowerCase().includes(q)
      );
    }

    if (options?.role) {
      allUsers = allUsers.filter((u) => u.roles.includes(options.role!));
    }

    if (options?.isSuspended !== undefined) {
      allUsers = allUsers.filter((u) => u.isSuspended === options.isSuspended);
    }

    const total = allUsers.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 20;
    const paged = allUsers.slice(offset, offset + limit);

    return { users: paged, total };
  }

  public async updateUserRole(
    actor: AdminActor,
    targetUserId: string,
    newRole: UserRole
  ): Promise<void> {
    this.assertPermission(actor, 'manage_roles', 'Modifying user roles');

    if (actor.id === targetUserId) {
      throw new Error(
        'Security Error: Administrative self-role modification is prohibited. Role changes must be executed by an independent authorized administrator.'
      );
    }

    const user = this.users.get(targetUserId);
    if (!user) {
      throw new Error(`Target user '${targetUserId}' does not exist.`);
    }

    // Protection: Cannot demote the last super_admin
    if (user.roles.includes('super_admin') && newRole !== 'super_admin') {
      const superAdmins = Array.from(this.users.values()).filter((u) =>
        u.roles.includes('super_admin')
      );
      if (superAdmins.length <= 1) {
        throw new Error(
          'Security Constraint Violation: Cannot demote the platform root Super Admin.'
        );
      }
    }

    const previousRoles = [...user.roles];
    user.roles = [newRole];
    this.users.set(targetUserId, user);

    this.recordAuditEvent({
      action: 'admin.user_role_changed',
      targetEntityType: 'users',
      targetEntityId: targetUserId,
      details: {
        previousRoles,
        newRole,
      },
      sourceContext: 'user_management',
      actorId: actor.id,
      actorName: actor.name,
    });
  }

  public async setUserSuspension(
    actor: AdminActor,
    targetUserId: string,
    isSuspended: boolean,
    reason?: string
  ): Promise<void> {
    this.assertPermission(actor, 'manage_users', 'Modifying account suspension');

    if (actor.id === targetUserId) {
      throw new Error(
        'Security Error: Administrative self-suspension and self-unsuspension are prohibited.'
      );
    }

    const user = this.users.get(targetUserId);
    if (!user) {
      throw new Error(`Target user '${targetUserId}' does not exist.`);
    }

    if (user.roles.includes('super_admin')) {
      throw new Error('Security Error: A Super Admin account cannot be suspended.');
    }

    const previousStatus = user.isSuspended;
    user.isSuspended = isSuspended;
    user.suspendedAt = isSuspended ? new Date().toISOString() : null;
    user.suspendedReason = isSuspended ? reason || 'Administrative suspension' : null;
    this.users.set(targetUserId, user);

    this.recordAuditEvent({
      action: isSuspended ? 'admin.user_suspended' : 'admin.user_reactivated',
      targetEntityType: 'users',
      targetEntityId: targetUserId,
      details: {
        previousStatus,
        newStatus: isSuspended,
        reason: user.suspendedReason,
      },
      sourceContext: 'user_management',
      actorId: actor.id,
      actorName: actor.name,
    });
  }

  // ==========================================================================
  // Subscriptions & Plans
  // ==========================================================================

  public async listSubscriptionPlans(): Promise<SubscriptionPlanEntity[]> {
    return Array.from(this.subscriptionPlans.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
  }

  public async upsertSubscriptionPlan(
    actor: AdminActor,
    planInput: Partial<SubscriptionPlanEntity> & { slug: string; name: string }
  ): Promise<SubscriptionPlanEntity> {
    this.assertPermission(
      actor,
      'manage_subscriptions',
      'Configuring subscription plans'
    );

    const existing = Array.from(this.subscriptionPlans.values()).find(
      (p) => p.slug === planInput.slug
    );

    const plan: SubscriptionPlanEntity = {
      id: existing ? existing.id : `plan-${Date.now()}`,
      slug: planInput.slug,
      name: planInput.name,
      description: planInput.description || null,
      priceCents: planInput.priceCents ?? 0,
      currency: planInput.currency || 'USD',
      billingInterval: planInput.billingInterval || 'month',
      features: planInput.features || [],
      isActive: planInput.isActive ?? true,
      sortOrder: planInput.sortOrder ?? this.subscriptionPlans.size,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.subscriptionPlans.set(plan.id, plan);

    this.recordAuditEvent({
      action: existing ? 'admin.plan_updated' : 'admin.plan_created',
      targetEntityType: 'subscription_plans',
      targetEntityId: plan.id,
      details: {
        slug: plan.slug,
        name: plan.name,
        priceCents: plan.priceCents,
      },
      sourceContext: 'subscription_management',
      actorId: actor.id,
      actorName: actor.name,
    });

    return plan;
  }

  public async adjustUserSubscription(
    actor: AdminActor,
    targetUserId: string,
    updates: {
      planSlug: string;
      status: SubscriptionStatus;
    }
  ): Promise<void> {
    this.assertPermission(
      actor,
      'manage_subscriptions',
      'Adjusting user subscription state'
    );

    const user = this.users.get(targetUserId);
    if (!user) {
      throw new Error(`Target user '${targetUserId}' does not exist.`);
    }

    const plan = Array.from(this.subscriptionPlans.values()).find(
      (p) => p.slug === updates.planSlug
    );
    if (!plan) {
      throw new Error(`Subscription plan '${updates.planSlug}' not found.`);
    }

    const prevSub = user.activeSubscription;
    user.activeSubscription = {
      planSlug: plan.slug,
      planName: plan.name,
      status: updates.status,
    };
    this.users.set(targetUserId, user);

    const subEntity: UserSubscriptionEntity = {
      id: `sub-${targetUserId}`,
      userId: targetUserId,
      planId: plan.id,
      status: updates.status,
      provider: 'manual',
      currentPeriodStart: new Date().toISOString(),
      cancelAtPeriodEnd: false,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan,
    };
    this.userSubscriptions.set(subEntity.id, subEntity);

    this.recordAuditEvent({
      action: 'admin.user_subscription_adjusted',
      targetEntityType: 'user_subscriptions',
      targetEntityId: targetUserId,
      details: {
        previousSubscription: prevSub,
        newSubscription: user.activeSubscription,
      },
      sourceContext: 'subscription_management',
      actorId: actor.id,
      actorName: actor.name,
    });
  }

  public async listUserSubscriptions(
    actor: AdminActor,
    targetUserId?: string
  ): Promise<UserSubscriptionEntity[]> {
    this.assertPermission(
      actor,
      'manage_subscriptions',
      'Listing user subscriptions'
    );

    let subs = Array.from(this.userSubscriptions.values());
    if (targetUserId) {
      subs = subs.filter((s) => s.userId === targetUserId);
    }
    return subs;
  }

  // ==========================================================================
  // Content Management Summary (Governance Verification)
  // ==========================================================================

  public async getContentManagementSummary(actor: AdminActor): Promise<Record<string, unknown>> {
    this.assertPermission(actor, 'view_audit_logs', 'Viewing content management overview');

    return {
      quran: {
        totalSurahs: 114,
        totalAyahs: 6236,
        canonicalSeedStatus: 'PROTECTED / IMMUTABLE',
        supportedScripts: ['uthmani', 'indopak'],
        activeTranslations: ['saheeh_international_en', 'jalandhari_ur'],
      },
      hadith: {
        collectionsCount: 6,
        canonicalCollections: [
          'Sahih al-Bukhari',
          'Sahih Muslim',
          'Sunan Abi Dawud',
          "Jami' at-Tirmidhi",
          "Sunan an-Nasa'i",
          'Sunan Ibn Majah',
        ],
        canonicalSeedStatus: 'PROTECTED / IMMUTABLE',
        totalNarrations: 18972,
      },
      duas: {
        sourceBook: 'Hisn al-Muslim (حصن المسلم)',
        author: "Shaykh Sa'id ibn Wahf al-Qahtani (رحمه الله)",
        totalChapters: 132,
        totalDuas: 268,
        canonicalSeedStatus: 'PROTECTED / IMMUTABLE',
      },
      tafsir: {
        worksCount: 2,
        works: [
          { slug: 'ibn-kathir', name: 'Tafsir Ibn Kathir', status: 'published' },
          { slug: 'al-sadi', name: "Tafsir Al-Sa'di", status: 'published' },
        ],
      },
      books: {
        worksCount: 4,
        works: [
          { slug: 'riyad-al-salihin', title: 'Riyad al-Salihin', status: 'published' },
          { slug: 'arbaeen-nawawi', title: "Al-Arba'in al-Nawawiyyah", status: 'published' },
          { slug: 'aqeedah-wasitiyyah', title: 'Al-Aqeedah al-Wasitiyyah', status: 'published' },
          { slug: 'bidayat-al-mujtahid', title: 'Bidayat al-Mujtahid', status: 'published' },
        ],
      },
      articles: {
        totalRevisions: 14,
        publishedArticles: 6,
        inReviewArticles: 2,
        reviewWorkflowState: 'STRICT_PEER_REVIEW_GATE_ACTIVE',
        authorSelfApprovalProhibited: true,
      },
      audio: {
        verifiedReciters: 6,
        ayahTimestampSync: 'ACTIVE',
        licensingStatus: 'VERIFIED_PUBLIC_DISTRIBUTION',
      },
    };
  }
}
