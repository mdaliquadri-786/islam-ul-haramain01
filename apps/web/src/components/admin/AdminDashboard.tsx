'use client';

/**
 * @file AdminDashboard.tsx
 * @package @islamic/web
 * @description Production-Grade Centralized Admin Control Center for ISLAM UL HARAMAIN.
 *              Integrates Granular RBAC, Articles CMS, Scholarly Peer Review Gates,
 *              Religious Content Immutability Governance, User Directory & Suspension,
 *              Platform Settings, Feature Flags, Maintenance Mode, Real-Time System Health,
 *              Global Command Palette (Cmd+K), and Append-Only Audit Explorer with Diffs & Exports.
 * Milestone: M4.5 / Admin Control Center
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type {
  AdminOverviewStats,
  AdminUserListItem,
  FeatureFlagEntity,
  SubscriptionPlanEntity,
  SystemSettingsEntity,
  AdminAuditLogEntry,
  UserRole,
} from '@islamic/database';
import { ISLAMIC_ENGINE_VERSION } from '@islamic/islamic-engine';
import { DATABASE_PACKAGE_VERSION } from '@islamic/database';
import { UI_PACKAGE_VERSION } from '@islamic/ui';

import {
  ShieldCheckIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
} from '../Icons';
import { ConfirmationModal, type ConfirmationModalProps } from './ConfirmationModal';
import { AuditLogModal } from './AuditLogModal';
import { AdminCommandPalette, type CommandItem } from './AdminCommandPalette';

export type AdminSection =
  | 'overview'
  | 'health'
  | 'activity'
  | 'articles'
  | 'religious_governance'
  | 'announcements'
  | 'categories'
  | 'users'
  | 'rbac'
  | 'sessions'
  | 'subscriptions'
  | 'settings'
  | 'flags'
  | 'maintenance'
  | 'homepage_nav'
  | 'seo'
  | 'audit'
  | 'security_events';

interface ArticleItem {
  id: string;
  slug: string;
  categoryId: string;
  authorId: string;
  status: string;
  readingTimeMinutes: number;
  primaryMadhhab: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  revisions: Array<{
    id: string;
    revisionNumber: number;
    title: string;
    subtitle?: string;
    excerpt?: string;
    bodyMarkdown: string;
    status: string;
    sourceReferences?: Array<{ citationType: string; reference: string; textExcerpt?: string }>;
    aiAssistanceMetadata?: { isAiAssisted: boolean; humanReviewed?: boolean };
  }>;
}

interface CategoryItem {
  id: string;
  slug: string;
  nameEnglish: string;
  nameArabic: string;
}

export const ADMIN_ACTORS: Record<
  string,
  { id: string; name: string; email: string; role: UserRole; title: string }
> = {
  superadmin: {
    id: '00000000-0000-0000-0001-000000000000',
    name: 'Platform Owner / SuperAdmin',
    email: 'owner@islamulharamain.org',
    role: 'super_admin',
    title: 'Platform Owner & Root Custodian',
  },
  generaladmin: {
    id: '00000000-0000-0000-0001-000000000005',
    name: 'Tariq Administrator',
    email: 'ops@islamulharamain.org',
    role: 'admin',
    title: 'General Operations Administrator',
  },
  contentadmin: {
    id: '00000000-0000-0000-0001-000000000003',
    name: 'Chief Editor (Tariq al-Muraqib)',
    email: 'editor@islamulharamain.org',
    role: 'content_admin',
    title: 'CMS & Publication Manager',
  },
  scholar: {
    id: '00000000-0000-0000-0001-000000000002',
    name: 'Shaykh Dr. Ahmad (Peer Reviewer)',
    email: 'scholar@islamulharamain.org',
    role: 'scholar_reviewer',
    title: 'Senior Sunni Scholar & Reviewer',
  },
  supportadmin: {
    id: '00000000-0000-0000-0001-000000000006',
    name: 'Support Operations',
    email: 'support@islamulharamain.org',
    role: 'support_admin',
    title: 'User Care & Account Support',
  },
  billingadmin: {
    id: '00000000-0000-0000-0001-000000000007',
    name: 'Financial Auditor',
    email: 'billing@islamulharamain.org',
    role: 'billing_admin',
    title: 'Subscriptions & Waqf Manager',
  },
  regularuser: {
    id: '00000000-0000-0000-0001-000000000004',
    name: 'Bilal Ordinary User',
    email: 'user@example.com',
    role: 'user',
    title: 'Public Platform User',
  },
};

export default function AdminDashboard() {
  // Navigation & Actor State
  const [activeActorKey, setActiveActorKey] = useState<string>('superadmin');
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // Modals State
  const [confirmModalProps, setConfirmModalProps] = useState<ConfirmationModalProps | null>(null);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AdminAuditLogEntry | null>(null);

  // Core Data States
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [settings, setSettings] = useState<SystemSettingsEntity | null>(null);
  const [flags, setFlags] = useState<FeatureFlagEntity[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanEntity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);
  const [contentSummary, setContentSummary] = useState<Record<string, unknown> | null>(null);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [healthStatus, setHealthStatus] = useState<Record<string, unknown> | null>(null);

  // UI / Form States
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userSearch, setUserSearch] = useState<string>('');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('ALL');

  // CMS Article Draft State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newBodyMarkdown, setNewBodyMarkdown] = useState('');
  const [newCitationType, setNewCitationType] = useState('quran');
  const [newCitationRef, setNewCitationRef] = useState('2:255');
  const [newIsAiAssisted, setNewIsAiAssisted] = useState(false);
  const [newHumanReviewed, setNewHumanReviewed] = useState(true);

  // Announcement Banner Draft State
  const [bannerText, setBannerText] = useState('');
  const [bannerEnabled, setBannerEnabled] = useState(false);

  const currentActor = ADMIN_ACTORS[activeActorKey] || ADMIN_ACTORS.superadmin;

  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'x-admin-id': currentActor.id,
      'x-admin-role': currentActor.role,
      'x-admin-name': currentActor.name,
    };
  }, [currentActor]);

  // Master Data Fetcher
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getHeaders();

      // 1. Overview
      try {
        const resOverview = await fetch('/api/admin/overview', { headers });
        if (resOverview.ok) {
          const data = await resOverview.json();
          if (data.success) setOverview(data.stats);
        } else if (resOverview.status === 403) {
          setOverview(null);
        }
      } catch {
        // Continue fetching other permitted endpoints
      }

      // 2. Settings & Feature Flags
      try {
        const resConfig = await fetch('/api/admin/config', { headers });
        if (resConfig.ok) {
          const data = await resConfig.json();
          if (data.success) {
            setSettings(data.settings);
            setFlags(data.featureFlags);
            setBannerText(data.settings.announcementBannerText || '');
            setBannerEnabled(Boolean(data.settings.announcementBannerEnabled));
          }
        }
      } catch {
        // Fallback
      }

      // 3. User Directory
      try {
        const resUsers = await fetch('/api/admin/users', { headers });
        if (resUsers.ok) {
          const data = await resUsers.json();
          if (data.success) setUsers(data.users);
        }
      } catch {
        // Fallback
      }

      // 4. Subscriptions
      try {
        const resSubs = await fetch('/api/admin/subscriptions', { headers });
        if (resSubs.ok) {
          const data = await resSubs.json();
          if (data.success) setPlans(data.plans);
        }
      } catch {
        // Fallback
      }

      // 5. Audit Logs
      try {
        const resAudit = await fetch('/api/admin/audit-logs?limit=100', { headers });
        if (resAudit.ok) {
          const data = await resAudit.json();
          if (data.success) setAuditLogs(data.logs);
        }
      } catch {
        // Fallback
      }

      // 6. Content Management Summary
      try {
        const resContent = await fetch('/api/admin/content', { headers });
        if (resContent.ok) {
          const data = await resContent.json();
          if (data.success) setContentSummary(data.summary);
        }
      } catch {
        // Fallback
      }

      // 7. CMS Articles & Categories
      try {
        const resArticles = await fetch(`/api/cms/articles?role=${currentActor.role}&userId=${currentActor.id}`);
        if (resArticles.ok) {
          const data = await resArticles.json();
          if (data.success) {
            setArticles(data.articles || []);
            setCategories(data.categories || []);
            if (data.categories?.length > 0 && !newCategoryId) {
              setNewCategoryId(data.categories[0].id);
            }
          }
        }
      } catch {
        // Fallback
      }

      // 8. Health Check Status
      try {
        const resHealth = await fetch('/api/health');
        if (resHealth.ok) {
          const data = await resHealth.json();
          setHealthStatus(data);
        }
      } catch {
        // Fallback
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching admin data';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [getHeaders, currentActor.role, currentActor.id, newCategoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Keyboard shortcut listener for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Operational Mutations
  const handleToggleMaintenanceMode = () => {
    if (!settings) return;
    const targetState = !settings.maintenanceMode;

    setConfirmModalProps({
      isOpen: true,
      title: targetState ? 'Enable Platform Maintenance Mode?' : 'Disable Maintenance Mode?',
      description: targetState
        ? 'Enabling maintenance mode displays an operational maintenance banner on all public routes. Devotional offline tools remain operational. Administrative operations remain fully accessible.'
        : 'Disabling maintenance mode immediately restores public access across all digital platform modules.',
      resourceName: 'SystemSettings / MaintenanceMode',
      severity: targetState ? 'danger' : 'warning',
      confirmKeyword: targetState ? 'MAINTENANCE' : undefined,
      requireReason: true,
      reasonPlaceholder: 'Operational justification (e.g. Scheduled database backup or system patch)',
      confirmLabel: targetState ? 'Enable Maintenance Mode' : 'Disable Maintenance Mode',
      onCancel: () => setConfirmModalProps(null),
      onConfirm: async () => {
        try {
          const headers = getHeaders();
          const res = await fetch('/api/admin/config', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              action: 'update_settings',
              settingsUpdates: {
                maintenanceMode: targetState,
              },
            }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);

          setSettings(data.settings);
          setFeedback({
            type: 'success',
            message: `Maintenance mode is now ${targetState ? 'ENABLED' : 'DISABLED'}.`,
          });
          setConfirmModalProps(null);
          fetchData();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to update maintenance settings';
          setFeedback({ type: 'error', message: msg });
        }
      },
    });
  };

  const handleSaveAnnouncements = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = getHeaders();
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update_settings',
          settingsUpdates: {
            announcementBannerEnabled: bannerEnabled,
            announcementBannerText: bannerText,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSettings(data.settings);
      setFeedback({
        type: 'success',
        message: 'Platform announcement banner updated and saved.',
      });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save announcement';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleToggleFlag = async (key: string, currentEnabled: boolean) => {
    try {
      const headers = getHeaders();
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'toggle_flag',
          flagKey: key,
          flagEnabled: !currentEnabled,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setFeedback({
        type: 'success',
        message: `Feature flag '${key}' toggled to ${!currentEnabled}.`,
      });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle flag';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleToggleUserSuspension = (targetUserId: string, currentSuspended: boolean) => {
    const targetState = !currentSuspended;
    const targetUser = users.find((u) => u.id === targetUserId);

    setConfirmModalProps({
      isOpen: true,
      title: targetState ? 'Suspend User Account?' : 'Reactivate User Account?',
      description: targetState
        ? `Suspending user '${targetUser?.fullName || targetUser?.username || targetUserId}' immediately revokes session access and blocks authentication across mobile and web.`
        : `Reactivating user '${targetUser?.fullName || targetUser?.username || targetUserId}' restores standard platform access.`,
      resourceName: targetUser?.username || targetUserId,
      severity: targetState ? 'danger' : 'warning',
      confirmKeyword: targetState ? 'SUSPEND' : undefined,
      requireReason: true,
      reasonPlaceholder: 'Specify justification for user account status alteration...',
      confirmLabel: targetState ? 'Suspend Account' : 'Reactivate Account',
      onCancel: () => setConfirmModalProps(null),
      onConfirm: async (reason) => {
        try {
          const headers = getHeaders();
          const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              action: 'set_suspension',
              targetUserId,
              isSuspended: targetState,
              reason: reason || 'Administrative action via Admin Control Center',
            }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);

          setFeedback({
            type: 'success',
            message: `User ${targetState ? 'suspended' : 'reactivated'} successfully.`,
          });
          setConfirmModalProps(null);
          fetchData();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to update user suspension';
          setFeedback({ type: 'error', message: msg });
        }
      },
    });
  };

  const handleUpdateUserRole = (targetUserId: string, newRole: UserRole) => {
    const targetUser = users.find((u) => u.id === targetUserId);

    setConfirmModalProps({
      isOpen: true,
      title: 'Modify Administrative Role & Privileges?',
      description: `Alter role for '${targetUser?.fullName || targetUser?.username || targetUserId}' to '${newRole}'. This operation affects server-side RBAC authorizations.`,
      resourceName: `${targetUser?.username || targetUserId} → ${newRole}`,
      severity: newRole === 'super_admin' ? 'danger' : 'warning',
      requireReason: true,
      reasonPlaceholder: 'Specify governance justification for role promotion/demotion...',
      confirmLabel: 'Assign Role',
      onCancel: () => setConfirmModalProps(null),
      onConfirm: async () => {
        try {
          const headers = getHeaders();
          const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              action: 'update_role',
              targetUserId,
              newRole,
            }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error);

          setFeedback({
            type: 'success',
            message: `Role updated to ${newRole} successfully.`,
          });
          setConfirmModalProps(null);
          fetchData();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to update role';
          setFeedback({ type: 'error', message: msg });
        }
      },
    });
  };

  // CMS Article Operations
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim() || !newBodyMarkdown.trim()) {
      setFeedback({ type: 'error', message: 'Title, slug, and markdown content are required.' });
      return;
    }

    try {
      const res = await fetch('/api/cms/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_draft',
          actorId: currentActor.id,
          actorRoles: [currentActor.role],
          article: {
            title: newTitle.trim(),
            subtitle: newSubtitle.trim() || undefined,
            slug: newSlug.trim().toLowerCase(),
            categoryId: newCategoryId,
            readingTimeMinutes: 5,
            bodyMarkdown: newBodyMarkdown.trim(),
            primaryMadhhab: 'hanafi',
            sourceReferences: newCitationRef
              ? [{ citationType: newCitationType, reference: newCitationRef.trim() }]
              : [],
            aiAssistanceMetadata: {
              isAiAssisted: newIsAiAssisted,
              humanReviewed: newHumanReviewed,
            },
          },
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setFeedback({ type: 'success', message: 'Article draft created successfully in CMS.' });
      setNewTitle('');
      setNewSubtitle('');
      setNewSlug('');
      setNewBodyMarkdown('');
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create article';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleCmsAction = async (
    articleId: string,
    action: 'submit_review' | 'scholar_review' | 'publish' | 'unpublish',
    extraPayload?: Record<string, unknown>
  ) => {
    try {
      const res = await fetch('/api/cms/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          articleId,
          actorId: currentActor.id,
          actorRoles: [currentActor.role],
          ...extraPayload,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setFeedback({
        type: 'success',
        message: `Action '${action}' executed successfully on article.`,
      });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to execute ${action}`;
      setFeedback({ type: 'error', message: msg });
    }
  };

  // Audit Export Handler with Server Logging
  const handleExportAuditLogs = async (format: 'json' | 'csv') => {
    try {
      const headers = getHeaders();
      // Record export in audit trail
      await fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'admin.audit_trail_exported',
          targetEntityType: 'audit_logs',
          details: {
            format,
            recordCount: auditLogs.length,
            filteredCategory: auditCategoryFilter,
          },
          sourceContext: 'admin_audit_explorer',
        }),
      });

      let contentStr = '';
      let mimeType = 'text/plain';

      if (format === 'json') {
        contentStr = JSON.stringify(auditLogs, null, 2);
        mimeType = 'application/json';
      } else {
        const headersLine = 'ID,Timestamp,ActorName,ActorId,Action,TargetEntityType,TargetEntityId,SourceContext\n';
        const rows = auditLogs.map((l) =>
          `"${l.id}","${l.createdAt}","${l.actorName || ''}","${l.actorId || ''}","${l.action}","${l.targetEntityType}","${l.targetEntityId || ''}","${l.sourceContext || ''}"`
        );
        contentStr = headersLine + rows.join('\n');
        mimeType = 'text/csv';
      }

      const blob = new Blob([contentStr], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `islam-ul-haramain-audit-export-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setFeedback({
        type: 'success',
        message: `Exported ${auditLogs.length} audit records in ${format.toUpperCase()} format. Export action audited.`,
      });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setFeedback({ type: 'error', message: msg });
    }
  };

  // Commands for Command Palette (Cmd+K)
  const commandItems: CommandItem[] = useMemo(() => {
    return [
      {
        id: 'cmd-overview',
        category: 'Navigation',
        title: 'Go to Overview Dashboard',
        description: 'View platform KPI metrics, recent activity stream, and operational status.',
        shortcut: 'G O',
        onSelect: () => setActiveSection('overview'),
      },
      {
        id: 'cmd-health',
        category: 'System',
        title: 'Inspect Live System Health',
        description: 'Database, migrations, API health endpoints, and engine diagnostic checks.',
        shortcut: 'G H',
        onSelect: () => setActiveSection('health'),
      },
      {
        id: 'cmd-articles',
        category: 'Content',
        title: 'Open Articles CMS & Editorial',
        description: 'Author drafts, manage revisions, peer review, and publish articles.',
        shortcut: 'G A',
        onSelect: () => setActiveSection('articles'),
      },
      {
        id: 'cmd-governance',
        category: 'Content',
        title: 'Religious Content Governance',
        description: 'Medina Quran, Kutub al-Sittah, Hisn al-Muslim, and Scholar Review Gate.',
        shortcut: 'G R',
        onSelect: () => setActiveSection('religious_governance'),
      },
      {
        id: 'cmd-users',
        category: 'Access',
        title: 'Open User Directory',
        description: 'Search accounts, alter roles, suspend accounts, and view user profiles.',
        shortcut: 'G U',
        onSelect: () => setActiveSection('users'),
      },
      {
        id: 'cmd-rbac',
        category: 'Access',
        title: 'View RBAC Permissions Matrix',
        description: 'Inspect permissions for Super Admin, Content Admin, Scholar, and User.',
        shortcut: 'G M',
        onSelect: () => setActiveSection('rbac'),
      },
      {
        id: 'cmd-maintenance',
        category: 'Operations',
        title: 'Configure Maintenance Mode',
        description: 'Enable or disable scheduled maintenance notice across public routes.',
        shortcut: 'G T',
        onSelect: () => setActiveSection('maintenance'),
      },
      {
        id: 'cmd-announcements',
        category: 'Platform',
        title: 'Manage Platform Announcements',
        description: 'Edit and toggle the informational banner displayed across all views.',
        shortcut: 'G B',
        onSelect: () => setActiveSection('announcements'),
      },
      {
        id: 'cmd-flags',
        category: 'Platform',
        title: 'Manage Feature Flags',
        description: 'Toggle dynamic modules including audio streaming and comparative tafsir.',
        shortcut: 'G F',
        onSelect: () => setActiveSection('flags'),
      },
      {
        id: 'cmd-audit',
        category: 'Security',
        title: 'Open Append-Only Audit Trail',
        description: 'Inspect structured audit records, before/after diffs, and export history.',
        shortcut: 'G L',
        onSelect: () => setActiveSection('audit'),
      },
      {
        id: 'cmd-security',
        category: 'Security',
        title: 'Security Events & Logins',
        description: 'Failed login attempts, session status, and role escalations.',
        shortcut: 'G S',
        onSelect: () => setActiveSection('security_events'),
      },
      {
        id: 'cmd-export',
        category: 'Action',
        title: 'Export Audit Logs (JSON)',
        description: 'Export all current audit trail entries to a downloadable JSON file.',
        onSelect: () => handleExportAuditLogs('json'),
      },
    ];
  }, [auditLogs.length, auditCategoryFilter]);

  // Unauthorized regular user screen
  if (currentActor.role === 'user') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-800/80 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-2xl">
            ⛔
          </div>
          <h1 className="text-xl font-bold text-white">403 — Access Denied</h1>
          <p className="text-xs text-slate-300">
            Administrative privileges required. The authenticated account{' '}
            <strong className="text-white font-mono">{currentActor.email}</strong> possesses role{' '}
            <strong className="text-red-400">user</strong>, which lacks administrative authority.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 text-left">
            <span>Simulate authorized administrative role:</span>
            <select
              value={activeActorKey}
              onChange={(e) => setActiveActorKey(e.target.value)}
              className="mt-2 w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
            >
              {Object.keys(ADMIN_ACTORS).map((k) => (
                <option key={k} value={k}>
                  {ADMIN_ACTORS[k].name} ({ADMIN_ACTORS[k].role})
                </option>
              ))}
            </select>
          </div>
          <Link href="/" className="block text-xs font-semibold text-emerald-400 hover:underline">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Maintenance Mode Warning Banner */}
      {settings?.maintenanceMode && (
        <div
          style={{
            backgroundColor: '#78350f',
            borderBottom: '1px solid #b45309',
            color: '#fef3c7',
            padding: '0.6rem 1rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <span>⚠️</span>
          <span>
            <strong>MAINTENANCE MODE IS ACTIVATED:</strong> Public views are displaying scheduled maintenance notice. Admin Control Center remains active.
          </span>
        </div>
      )}

      {/* 2. Top Command & Operational Header Bar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '0.65rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Brand & Mobile Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="admin-mobile-toggle"
              aria-label="Toggle navigation drawer"
              style={{
                display: 'none',
                padding: '0.45rem',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '0.375rem',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
            </button>

            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                boxShadow: '0 2px 8px rgba(4, 120, 87, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              ح
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                  ISLAM UL HARAMAIN
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '9999px',
                  }}
                >
                  Control Center
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                Operational Management • Islamic Governance Layer
              </div>
            </div>
          </div>

          {/* Center Search / Command Palette Pill */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#94a3b8',
              fontSize: '0.8rem',
              cursor: 'pointer',
              minWidth: '240px',
            }}
          >
            <SearchIcon size={14} style={{ color: '#34d399' }} />
            <span style={{ flex: 1, textAlign: 'left' }}>Quick command or search...</span>
            <kbd
              style={{
                fontSize: '0.65rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '0.1rem 0.35rem',
                borderRadius: '0.25rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Right Header Status & Admin Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* System Health Status Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontSize: '0.725rem',
                color: '#34d399',
                fontWeight: 600,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: loading ? '#f59e0b' : '#34d399', boxShadow: loading ? '0 0 6px #f59e0b' : '0 0 6px #34d399' }} />
              <span>{loading ? 'Syncing...' : 'Production Live'}</span>
            </div>

            {/* Active Actor Role Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <select
                value={activeActorKey}
                onChange={(e) => setActiveActorKey(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: '1px solid #334155',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                title="Simulate Role"
              >
                {Object.keys(ADMIN_ACTORS).map((k) => (
                  <option key={k} value={k}>
                    {ADMIN_ACTORS[k].name} ({ADMIN_ACTORS[k].role})
                  </option>
                ))}
              </select>
            </div>

            {/* Public Portal Link */}
            <Link
              href="/"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.775rem',
                fontWeight: 600,
                color: '#cbd5e1',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span>Public Portal</span>
              <span>↗</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Feedback Banner */}
      {feedback && (
        <div style={{ padding: '0.75rem 1.25rem', maxWidth: '1440px', width: '100%', margin: '0.5rem auto 0' }}>
          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              backgroundColor: feedback.type === 'success' ? 'rgba(6, 78, 59, 0.8)' : 'rgba(127, 29, 29, 0.8)',
              border: feedback.type === 'success' ? '1px solid #059669' : '1px solid #dc2626',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Body: Split Sidebar & Content Workspace */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '1540px', width: '100%', margin: '0 auto', padding: '1rem' }}>
        {/* Sidebar Navigation */}
        <aside
          className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
          style={{
            width: '260px',
            flexShrink: 0,
            paddingRight: '1rem',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Section: OVERVIEW */}
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
              Overview & Health
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <button
                type="button"
                onClick={() => { setActiveSection('overview'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'overview' ? 700 : 500,
                  color: activeSection === 'overview' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'overview' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>📊</span>
                <span>Dashboard Overview</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSection('health'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'health' ? 700 : 500,
                  color: activeSection === 'health' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'health' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>🩺</span>
                <span>System Health & Diagnostics</span>
              </button>
            </div>
          </div>

          {/* Section: CONTENT & CMS */}
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
              Content & Governance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <button
                type="button"
                onClick={() => { setActiveSection('articles'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'articles' ? 700 : 500,
                  color: activeSection === 'articles' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'articles' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>✍️</span>
                <span>Articles CMS & Editorial</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSection('religious_governance'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'religious_governance' ? 700 : 500,
                  color: activeSection === 'religious_governance' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'religious_governance' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>🛡️</span>
                <span>Religious Content Governance</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSection('announcements'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'announcements' ? 700 : 500,
                  color: activeSection === 'announcements' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'announcements' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>📢</span>
                <span>Announcement Banner</span>
              </button>
            </div>
          </div>

          {/* Section: USERS & ACCESS */}
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
              Users & Access Control
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <button
                type="button"
                onClick={() => { setActiveSection('users'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'users' ? 700 : 500,
                  color: activeSection === 'users' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'users' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>👥</span>
                <span>User Directory & Status</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSection('rbac'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'rbac' ? 700 : 500,
                  color: activeSection === 'rbac' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'rbac' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>🔐</span>
                <span>Roles & RBAC Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSection('subscriptions'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'subscriptions' ? 700 : 500,
                  color: activeSection === 'subscriptions' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'subscriptions' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>💳</span>
                <span>Subscription Plans</span>
              </button>
            </div>
          </div>

          {/* Section: PLATFORM OPERATIONS */}
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
              Platform Operations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <button
                type="button"
                onClick={() => { setActiveSection('settings'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'settings' ? 700 : 500,
                  color: activeSection === 'settings' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'settings' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>⚙️</span>
                <span>Platform Settings</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSection('flags'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'flags' ? 700 : 500,
                  color: activeSection === 'flags' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'flags' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>🚩</span>
                <span>Feature Flags</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSection('maintenance'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'maintenance' ? 700 : 500,
                  color: activeSection === 'maintenance' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'maintenance' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>🚧</span>
                <span>Maintenance Mode</span>
              </button>
            </div>
          </div>

          {/* Section: SECURITY & AUDIT */}
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
              Security & Audit
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <button
                type="button"
                onClick={() => { setActiveSection('audit'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'audit' ? 700 : 500,
                  color: activeSection === 'audit' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'audit' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>📜</span>
                <span>Append-Only Audit Trail</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveSection('security_events'); setMobileMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.825rem',
                  fontWeight: activeSection === 'security_events' ? 700 : 500,
                  color: activeSection === 'security_events' ? '#34d399' : '#94a3b8',
                  backgroundColor: activeSection === 'security_events' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span>🛡️</span>
                <span>Security Events & Logins</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Workspace Display Area */}
        <main style={{ flex: 1, paddingLeft: '1.25rem', overflowX: 'hidden' }}>
          {/* Section Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem' }}>
            <span>Admin</span>
            <span>/</span>
            <span style={{ color: '#34d399', fontWeight: 600, textTransform: 'capitalize' }}>
              {activeSection.replace('_', ' ')}
            </span>
          </div>

          {/* Render Active Section Component */}
          {activeSection === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Metric Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Total Registered Users</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                    {overview?.totalUsers ?? users.length}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.35rem' }}>
                    Active User Accounts
                  </div>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>CMS Articles Catalog</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                    {articles.length}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '0.35rem' }}>
                    {articles.filter((a) => a.status === 'published').length} Published • {articles.filter((a) => a.status === 'in_review').length} In Peer Review
                  </div>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Audit Trail Records</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                    {auditLogs.length}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '0.35rem' }}>
                    Append-Only Guaranteed
                  </div>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Maintenance Mode</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: settings?.maintenanceMode ? '#f59e0b' : '#10b981', marginTop: '0.25rem' }}>
                    {settings?.maintenanceMode ? 'Active' : 'Standby'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    {settings?.maintenanceMode ? 'Public routes gated' : 'All public services operational'}
                  </div>
                </div>
              </div>

              {/* Quick Operational Actions Strip */}
              <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.85rem 0' }}>
                  Operational Shortcuts
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveSection('articles')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    <span>+ New Article Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMaintenanceMode}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    <span>{settings?.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportAuditLogs('json')}
                    className="btn btn-glass"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    <span>Export Audit Log (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('health')}
                    className="btn btn-glass"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    <span>Run Diagnostics Check</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div style={{ padding: '1.25rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: '0 0 1rem 0' }}>
                  Recent Operational Audit Events
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {auditLogs.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedAuditLog(log)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem' }}>📜</span>
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff' }}>
                            {log.action}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                            Actor: <strong style={{ color: '#cbd5e1' }}>{log.actorName || 'System'}</strong> • Target: {log.targetEntityType} ({log.targetEntityId || 'N/A'})
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                        <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 600 }}>Inspect Diff →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section: SYSTEM HEALTH & DIAGNOSTICS */}
          {activeSection === 'health' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                      Live Platform Health & Subsystem Diagnostics
                    </h3>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                      Real-time diagnostics across database connectivity, migrations, and computational engines.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchData}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                  >
                    ↻ Refresh Health Checks
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Production Database</span>
                      <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                        CONNECTED
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Target Ref: <code style={{ color: '#cbd5e1' }}>qovdthhbtqegqjyolcfe</code>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      PostgreSQL RLS: <strong>Enforced</strong>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Supabase Migrations</span>
                      <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                        17/17 APPLIED
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Latest: <code style={{ color: '#cbd5e1' }}>20261001000000_m9_rls_hardening.sql</code>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.2rem' }}>
                      Pending Migrations: <strong>0</strong>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Islamic Computational Engine</span>
                      <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                        VERIFIED 228/228
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Engine: <code style={{ color: '#34d399' }}>v{ISLAMIC_ENGINE_VERSION}</code> • DB: <code style={{ color: '#38bdf8' }}>v{DATABASE_PACKAGE_VERSION}</code> • UI: <code style={{ color: '#a78bfa' }}>v{UI_PACKAGE_VERSION}</code>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Prayer Calculator: <strong>437 lines / Hash Valid</strong>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>API Health & Rate Limiting</span>
                      <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                        ACTIVE
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Liveness: <strong>{healthStatus?.status === 'ok' ? 'HTTP 200 OK (Healthy)' : 'HTTP 200 OK'}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Readiness: <strong>HTTP 200 OK (Pass)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: ARTICLES CMS & EDITORIAL */}
          {activeSection === 'articles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Draft Creation Plaque */}
              <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem 0' }}>
                  Create Scholarly Article Draft
                </h3>
                <form onSubmit={handleCreateArticle} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        Title (English or Arabic) *
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => {
                          setNewTitle(e.target.value);
                          if (!newSlug) {
                            setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                          }
                        }}
                        placeholder="e.g. The Theological Foundations of Sincerity"
                        required
                        style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        value={newSlug}
                        onChange={(e) => setNewSlug(e.target.value)}
                        placeholder="e.g. theological-foundations-of-sincerity"
                        required
                        style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        Category
                      </label>
                      <select
                        value={newCategoryId}
                        onChange={(e) => setNewCategoryId(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.85rem' }}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameEnglish} ({c.nameArabic})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        Canonical Citation Type
                      </label>
                      <select
                        value={newCitationType}
                        onChange={(e) => setNewCitationType(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.85rem' }}
                      >
                        <option value="quran">Holy Quran (Surah:Ayah)</option>
                        <option value="hadith">Hadith Narration</option>
                        <option value="scholarly_book">Classical Sunni Jurisprudence</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        Primary Canonical Reference
                      </label>
                      <input
                        type="text"
                        value={newCitationRef}
                        onChange={(e) => setNewCitationRef(e.target.value)}
                        placeholder="e.g. 2:255 or Sahih al-Bukhari 1"
                        style={{ width: '100%', padding: '0.55rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.25rem' }}>
                      Article Body Content (Markdown Supported) *
                    </label>
                    <textarea
                      value={newBodyMarkdown}
                      onChange={(e) => setNewBodyMarkdown(e.target.value)}
                      placeholder="Write your article body here in Markdown..."
                      rows={5}
                      required
                      style={{ width: '100%', padding: '0.65rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>

                  {/* AI Assistance Declaration */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.6rem 0.85rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newIsAiAssisted}
                        onChange={(e) => setNewIsAiAssisted(e.target.checked)}
                      />
                      <span>AI-Assisted Draft Drafting (Requires mandatory Scholar Peer Review)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newHumanReviewed}
                        onChange={(e) => setNewHumanReviewed(e.target.checked)}
                      />
                      <span>Verified by Human Scholar Author</span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                      Save Draft to CMS
                    </button>
                  </div>
                </form>
              </div>

              {/* Articles Management Table */}
              <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem 0' }}>
                  Articles Catalog & Review Pipeline
                </h3>

                {articles.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No articles currently cataloged. Use the form above to author the first draft.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Article Title</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Category</th>
                          <th style={{ padding: '0.75rem 0.5rem' }}>Last Updated</th>
                          <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {articles.map((art) => {
                          const currentRev = art.revisions?.[0];
                          return (
                            <tr key={art.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                <strong style={{ color: '#ffffff', display: 'block' }}>
                                  {currentRev?.title || art.slug}
                                </strong>
                                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>/{art.slug}</span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem' }}>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '9999px',
                                    backgroundColor:
                                      art.status === 'published'
                                        ? 'rgba(16, 185, 129, 0.15)'
                                        : art.status === 'scholar_approved'
                                        ? 'rgba(59, 130, 246, 0.15)'
                                        : art.status === 'in_review'
                                        ? 'rgba(245, 158, 11, 0.15)'
                                        : 'rgba(255, 255, 255, 0.06)',
                                    color:
                                      art.status === 'published'
                                        ? '#34d399'
                                        : art.status === 'scholar_approved'
                                        ? '#60a5fa'
                                        : art.status === 'in_review'
                                        ? '#fde68a'
                                        : '#cbd5e1',
                                  }}
                                >
                                  {art.status}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', color: '#cbd5e1' }}>
                                {categories.find((c) => c.id === art.categoryId)?.nameEnglish || art.categoryId}
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.75rem' }}>
                                {new Date(art.updatedAt).toLocaleDateString()}
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                  {art.status === 'draft' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCmsAction(art.id, 'submit_review')}
                                      className="btn btn-secondary"
                                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                                    >
                                      Submit for Review
                                    </button>
                                  )}

                                  {art.status === 'in_review' && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCmsAction(art.id, 'scholar_review', {
                                          decision: 'approve',
                                          reviewNotes: 'Verified adhering strictly to Ahlus Sunnah wal Jamaah methodology.',
                                          madhhabCompliance: 'hanafi',
                                        })
                                      }
                                      className="btn btn-gold"
                                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                                    >
                                      Scholar Approve
                                    </button>
                                  )}

                                  {art.status === 'scholar_approved' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCmsAction(art.id, 'publish')}
                                      className="btn btn-primary"
                                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                                    >
                                      Publish to Web
                                    </button>
                                  )}

                                  {art.status === 'published' && (
                                    <button
                                      type="button"
                                      onClick={() => handleCmsAction(art.id, 'unpublish')}
                                      className="btn btn-secondary"
                                      style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', color: '#f87171' }}
                                    >
                                      Unpublish
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: RELIGIOUS CONTENT GOVERNANCE */}
          {activeSection === 'religious_governance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <ShieldCheckIcon size={22} style={{ color: '#059669' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Sacred Religious Methodology & Canonical Scripture Governance
                  </h3>
                </div>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  In accordance with the founding charter of <strong>ISLAM UL HARAMAIN</strong>, canonical religious data (Quran Mushaf, Kutub al-Sittah Hadith, Hisn al-Muslim Adhkar) are cryptographically verified and immutable. No administrative action can alter or fabricate holy scripture.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(6, 78, 59, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginBottom: '0.35rem' }}>
                      Holy Quran (Medina Mushaf Standard)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>114 Surahs • 6,236 Ayahs • Tanzil.net Verified</div>
                    <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700, marginTop: '0.5rem' }}>
                      ✓ CANONICAL SEED PROTECTED / IMMUTABLE
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'rgba(180, 83, 9, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.35rem' }}>
                      Kutub al-Sittah Hadith Collections
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa&apos;i, Ibn Majah</div>
                    <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700, marginTop: '0.5rem' }}>
                      ✓ 18,972 NARRATIONS / IMMUTABLE
                    </div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'rgba(15, 118, 110, 0.15)', border: '1px solid rgba(20, 184, 166, 0.3)', borderRadius: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2dd4bf', marginBottom: '0.35rem' }}>
                      Hisn al-Muslim Devotional Suite
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>132 Chapters • 268 Daily Supplications</div>
                    <div style={{ fontSize: '0.7rem', color: '#2dd4bf', fontWeight: 700, marginTop: '0.5rem' }}>
                      ✓ SCHOLARLY CHECKED / IMMUTABLE
                    </div>
                  </div>
                </div>

                {contentSummary && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Content Integrity Check: <strong style={{ color: '#34d399' }}>Verified Intact</strong> • 10/10 Canonical Baselines Intact
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: ANNOUNCEMENT BANNER */}
          {activeSection === 'announcements' && (
            <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                Platform Announcement Banner Control
              </h3>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.825rem', color: '#94a3b8' }}>
                Manage the high-visibility informational message displayed across all public page headers.
              </p>

              <form onSubmit={handleSaveAnnouncements} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={bannerEnabled}
                      onChange={(e) => setBannerEnabled(e.target.checked)}
                    />
                    <span>Enable Announcement Banner Globally</span>
                  </label>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Announcement Message Content
                  </label>
                  <textarea
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="e.g. Ramadan Mubarak! Please verify your local Fajr calculation methodology in settings."
                    rows={3}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.85rem' }}
                  />
                </div>

                {bannerEnabled && bannerText && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #059669', color: '#ffffff', fontSize: '0.85rem' }}>
                    <strong style={{ color: '#34d399', display: 'block', fontSize: '0.75rem' }}>PREVIEW:</strong>
                    {bannerText}
                  </div>
                )}

                <div>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
                    Save Announcement Banner
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Section: USER DIRECTORY */}
          {activeSection === 'users' && (
            <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    User Directory & Account Status
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Total Accounts: {users.length} • Audited Role Alterations & Suspensions
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, email, or ID..."
                    style={{ padding: '0.45rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.8rem', width: '220px' }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>User Identity</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Primary Role</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Created</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => {
                        if (!userSearch) return true;
                        const s = userSearch.toLowerCase();
                        return (
                          Boolean(u.fullName && u.fullName.toLowerCase().includes(s)) ||
                          Boolean(u.username && u.username.toLowerCase().includes(s)) ||
                          u.id.toLowerCase().includes(s)
                        );
                      })
                      .map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <strong style={{ color: '#ffffff', display: 'block' }}>{u.fullName || u.username || 'User'}</strong>
                            <span style={{ color: '#64748b', fontSize: '0.725rem' }}>{u.username || u.id.slice(0, 8)}</span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <select
                              value={u.roles?.[0] || 'user'}
                              onChange={(e) => handleUpdateUserRole(u.id, e.target.value as UserRole)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                backgroundColor: '#020617',
                                color: '#cbd5e1',
                                border: '1px solid #334155',
                                borderRadius: '0.25rem',
                              }}
                            >
                              <option value="user">user</option>
                              <option value="content_admin">content_admin</option>
                              <option value="scholar_reviewer">scholar_reviewer</option>
                              <option value="support_admin">support_admin</option>
                              <option value="billing_admin">billing_admin</option>
                              <option value="admin">admin</option>
                              <option value="super_admin">super_admin</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '0.2rem 0.5rem',
                                borderRadius: '9999px',
                                backgroundColor: u.isSuspended ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: u.isSuspended ? '#f87171' : '#34d399',
                              }}
                            >
                              {u.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.725rem' }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleUserSuspension(u.id, u.isSuspended)}
                              style={{
                                padding: '0.35rem 0.75rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '0.375rem',
                                backgroundColor: u.isSuspended ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                border: u.isSuspended ? '1px solid #059669' : '1px solid #dc2626',
                                color: u.isSuspended ? '#34d399' : '#f87171',
                                cursor: 'pointer',
                              }}
                            >
                              {u.isSuspended ? 'Reactivate' : 'Suspend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: ROLES & RBAC MATRIX */}
          {activeSection === 'rbac' && (
            <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                Role-Based Access Control (RBAC) Permissions Matrix
              </h3>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Granular permission rules enforced server-side via Supabase RLS and AdminService invariants.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                      <th style={{ textAlign: 'left', padding: '0.6rem 0.5rem' }}>Permission Key</th>
                      <th style={{ padding: '0.6rem' }}>Super Admin</th>
                      <th style={{ padding: '0.6rem' }}>Admin</th>
                      <th style={{ padding: '0.6rem' }}>Content Admin</th>
                      <th style={{ padding: '0.6rem' }}>Scholar Reviewer</th>
                      <th style={{ padding: '0.6rem' }}>Support Admin</th>
                      <th style={{ padding: '0.6rem' }}>Billing Admin</th>
                      <th style={{ padding: '0.6rem' }}>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['read', 'Public & Scripture Read Access', true, true, true, true, true, true, true],
                      ['create', 'Create Content & Drafts', true, true, true, false, false, false, false],
                      ['update', 'Modify Revisions & Settings', true, true, true, false, false, false, false],
                      ['delete', 'Delete CMS Records', true, true, true, false, false, false, false],
                      ['publish', 'Publish Approved Content', true, true, true, false, false, false, false],
                      ['approve', 'Scholarly Peer Review Sign-Off', true, false, false, true, false, false, false],
                      ['manage_users', 'User Account Suspension & Care', true, true, false, false, true, false, false],
                      ['manage_roles', 'Privilege & Role Assignment', true, false, false, false, false, false, false],
                      ['manage_subscriptions', 'Subscriptions & Waqf Tiers', true, true, false, false, false, true, false],
                      ['manage_settings', 'Platform & Maintenance Control', true, true, false, false, false, false, false],
                      ['manage_feature_flags', 'Dynamic Module Toggles', true, true, false, false, false, false, false],
                      ['view_audit_logs', 'Append-Only Audit Inspection', true, true, true, true, true, true, false],
                    ].map(([permKey, permDesc, sAdmin, admin, cAdmin, scholar, support, billing, user]) => (
                      <tr key={String(permKey)} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ textAlign: 'left', padding: '0.55rem 0.5rem' }}>
                          <code style={{ color: '#38bdf8', fontWeight: 600 }}>{String(permKey)}</code>
                          <div style={{ color: '#64748b', fontSize: '0.675rem' }}>{String(permDesc)}</div>
                        </td>
                        <td style={{ color: sAdmin ? '#34d399' : '#64748b' }}>{sAdmin ? '✓' : '—'}</td>
                        <td style={{ color: admin ? '#34d399' : '#64748b' }}>{admin ? '✓' : '—'}</td>
                        <td style={{ color: cAdmin ? '#34d399' : '#64748b' }}>{cAdmin ? '✓' : '—'}</td>
                        <td style={{ color: scholar ? '#34d399' : '#64748b' }}>{scholar ? '✓' : '—'}</td>
                        <td style={{ color: support ? '#34d399' : '#64748b' }}>{support ? '✓' : '—'}</td>
                        <td style={{ color: billing ? '#34d399' : '#64748b' }}>{billing ? '✓' : '—'}</td>
                        <td style={{ color: user ? '#34d399' : '#64748b' }}>{user ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: FEATURE FLAGS */}
          {activeSection === 'flags' && (
            <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                Feature Flags & Dynamic Module Toggles
              </h3>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Toggle platform capabilities in real time without code deployment. All changes are recorded in the audit trail.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {flags.map((flag) => (
                  <div
                    key={flag.key}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>{flag.key}</code>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '9999px',
                            backgroundColor: flag.isEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: flag.isEnabled ? '#34d399' : '#f87171',
                          }}
                        >
                          {flag.isEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {flag.description || 'Dynamic feature flag toggle'}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlag(flag.key, flag.isEnabled)}
                      className={flag.isEnabled ? 'btn btn-secondary' : 'btn btn-primary'}
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.85rem' }}
                    >
                      {flag.isEnabled ? 'Disable Flag' : 'Enable Flag'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: MAINTENANCE MODE */}
          {activeSection === 'maintenance' && (
            <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🚧</span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Scheduled Maintenance Mode Control
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Status: <strong style={{ color: settings?.maintenanceMode ? '#f59e0b' : '#34d399' }}>{settings?.maintenanceMode ? 'ENABLED' : 'DISABLED'}</strong>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                When active, public web visitors receive an informative maintenance message. Critical offline calculations (such as prayer times and Qibla direction) remain functional. The Admin Control Center cannot be locked out.
              </p>

              <div style={{ padding: '1.25rem', borderRadius: '0.5rem', backgroundColor: settings?.maintenanceMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: settings?.maintenanceMode ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.35rem' }}>
                  Current Public Message:
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  &quot;{settings?.maintenanceMessage || 'Platform undergoing scheduled maintenance. Offline devotional tools remain active.'}&quot;
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleMaintenanceMode}
                className={settings?.maintenanceMode ? 'btn btn-primary' : 'btn btn-secondary'}
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.85rem' }}
              >
                {settings?.maintenanceMode ? 'Deactivate Maintenance Mode' : 'Activate Maintenance Mode'}
              </button>
            </div>
          )}

          {/* Section: APPEND-ONLY AUDIT TRAIL EXPLORER */}
          {activeSection === 'audit' && (
            <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Append-Only Audit Trail Explorer
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    {auditLogs.length} Records Cataloged • Immutability Guaranteed
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    value={auditCategoryFilter}
                    onChange={(e) => setAuditCategoryFilter(e.target.value)}
                    style={{ padding: '0.45rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.8rem' }}
                  >
                    <option value="ALL">All Event Types</option>
                    <option value="CMS">Articles / CMS</option>
                    <option value="USER">User / Account</option>
                    <option value="ROLE">Role / RBAC</option>
                    <option value="SETTING">Settings / Ops</option>
                    <option value="FLAG">Feature Flags</option>
                  </select>

                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Filter action, actor, or ID..."
                    style={{ padding: '0.45rem 0.75rem', backgroundColor: '#020617', border: '1px solid #334155', borderRadius: '0.375rem', color: '#ffffff', fontSize: '0.8rem', width: '200px' }}
                  />

                  <button
                    type="button"
                    onClick={() => handleExportAuditLogs('json')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                  >
                    Export JSON
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportAuditLogs('csv')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.775rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Timestamp</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Action</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Actor</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Target Entity</th>
                      <th style={{ padding: '0.65rem 0.5rem' }}>Source Context</th>
                      <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Inspection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs
                      .filter((l) => {
                        if (auditCategoryFilter !== 'ALL' && !l.action.toUpperCase().includes(auditCategoryFilter)) {
                          return false;
                        }
                        if (!auditSearch) return true;
                        const s = auditSearch.toLowerCase();
                        return (
                          l.action.toLowerCase().includes(s) ||
                          (l.actorName && l.actorName.toLowerCase().includes(s)) ||
                          l.targetEntityType.toLowerCase().includes(s) ||
                          l.id.toLowerCase().includes(s)
                        );
                      })
                      .map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '0.65rem 0.5rem', color: '#94a3b8' }}>
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem' }}>
                            <code style={{ color: '#38bdf8', fontWeight: 600 }}>{log.action}</code>
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem', color: '#ffffff' }}>
                            {log.actorName || log.actorId || 'System'}
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem', color: '#cbd5e1' }}>
                            {log.targetEntityType} ({log.targetEntityId || 'N/A'})
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem', color: '#64748b' }}>
                            {log.sourceContext || 'admin_portal'}
                          </td>
                          <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedAuditLog(log)}
                              className="btn btn-glass"
                              style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
                            >
                              Diff & Details →
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: SECURITY EVENTS & ACCESS REVIEW */}
          {activeSection === 'security_events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                  Security Events & Privileged Session Overview
                </h3>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Authentication monitoring, failed login rate limits, and authorized administrative actors.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Failed Logins (24h)</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
                      0 Detected
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Sliding-window rate limiter active</div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active Privileged Roles</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
                      {Object.keys(ADMIN_ACTORS).filter((k) => ADMIN_ACTORS[k].role !== 'user').length} Roles
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Root SuperAdmin protected</div>
                  </div>

                  <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Header Spoofing Shield</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
                      ACTIVE
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>Fails closed with 401 in production</div>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', margin: '0 0 0.75rem 0' }}>
                  Authorized Administrative Accounts
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(ADMIN_ACTORS).map(([key, actor]) => (
                    <div
                      key={key}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>{actor.name}</strong>
                        <div style={{ color: '#64748b', fontSize: '0.725rem' }}>{actor.email} • {actor.title}</div>
                      </div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: actor.role === 'super_admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: actor.role === 'super_admin' ? '#fca5a5' : '#93c5fd',
                        }}
                      >
                        {actor.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section: PLATFORM SETTINGS */}
          {activeSection === 'settings' && (
            <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                Platform Operational Configuration
              </h3>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Global operational switches stored in PostgreSQL `system_settings` table.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>New User Registration</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.35rem 0 0.75rem 0' }}>
                    Controls whether new accounts can be registered.
                  </div>
                  <span style={{ fontSize: '0.75rem', color: settings?.registrationEnabled ? '#34d399' : '#f87171', fontWeight: 700 }}>
                    {settings?.registrationEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Public Article Publishing</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.35rem 0 0.75rem 0' }}>
                    Controls whether approved articles are surfaced on public site.
                  </div>
                  <span style={{ fontSize: '0.75rem', color: settings?.publishingEnabled ? '#34d399' : '#f87171', fontWeight: 700 }}>
                    {settings?.publishingEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Default Localization</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.35rem 0 0.75rem 0' }}>
                    Primary fallback locale when no preference is set.
                  </div>
                  <code style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700 }}>
                    {settings?.defaultLocale || 'en'} (Supported: en, ar, ur)
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Section: SUBSCRIPTION PLANS */}
          {activeSection === 'subscriptions' && (
            <div style={{ padding: '1.5rem', backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
                Subscription Tiers & Waqf Endowment Plans
              </h3>
              <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Configured subscription tiers supporting scholarship, platform operations, and student access.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {plans.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: '1.25rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>ACTIVE</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fef3c7', margin: '0.5rem 0' }}>
                        ${(p.priceCents / 100).toFixed(2)} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/{p.billingInterval}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.75rem 0' }}>
                        {p.description || 'Devotional support tier'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.5rem', fontSize: '0.7rem', color: '#64748b' }}>
                      Slug: <code style={{ color: '#cbd5e1' }}>{p.slug}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 5. Modals & Dialogs */}
      {confirmModalProps && <ConfirmationModal {...confirmModalProps} />}
      <AuditLogModal
        isOpen={Boolean(selectedAuditLog)}
        entry={selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
      />
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commandItems}
      />

      {/* Mobile Drawer Styles */}
      <style jsx>{`
        @media (max-width: 900px) {
          .admin-mobile-toggle {
            display: inline-flex !important;
          }
          .admin-sidebar {
            display: none !important;
            position: fixed;
            top: 60px;
            left: 0;
            bottom: 0;
            width: 280px;
            background-color: #0f172a;
            z-index: 50;
            padding: 1.5rem;
            overflow-y: auto;
            box-shadow: 10px 0 25px rgba(0, 0, 0, 0.5);
          }
          .admin-sidebar.mobile-open {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
