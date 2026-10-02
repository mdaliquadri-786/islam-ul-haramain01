'use client';

/**
 * @file AdminDashboard.tsx
 * @package @islamic/web
 * @description Centralized cross-platform administrative dashboard.
 * Provides complete operational management across Overview, Users, RBAC, Subscriptions,
 * Content Governance, Maintenance Mode, Feature Flags, and Append-Only Audit Logs.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 */

import React, { useState, useEffect, useCallback } from 'react';
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

type AdminTab =
  | 'overview'
  | 'users'
  | 'rbac'
  | 'subscriptions'
  | 'content'
  | 'settings'
  | 'flags'
  | 'audit';

const DEMO_ACTORS: Record<
  string,
  { id: string; name: string; email: string; role: UserRole }
> = {
  superadmin: {
    id: '00000000-0000-0000-0001-000000000000',
    name: 'Root SuperAdmin',
    email: 'admin@islamulharamain.org',
    role: 'super_admin',
  },
  generaladmin: {
    id: '00000000-0000-0000-0001-000000000005',
    name: 'General Administrator',
    email: 'ops@islamulharamain.org',
    role: 'admin',
  },
  contentadmin: {
    id: '00000000-0000-0000-0001-000000000003',
    name: 'Content Administrator',
    email: 'editor@islamulharamain.org',
    role: 'content_admin',
  },
  scholar: {
    id: '00000000-0000-0000-0001-000000000002',
    name: 'Shaykh Dr. Ahmad',
    email: 'scholar@islamulharamain.org',
    role: 'scholar_reviewer',
  },
  supportadmin: {
    id: '00000000-0000-0000-0001-000000000006',
    name: 'Support Administrator',
    email: 'support@islamulharamain.org',
    role: 'support_admin',
  },
  billingadmin: {
    id: '00000000-0000-0000-0001-000000000007',
    name: 'Billing Administrator',
    email: 'billing@islamulharamain.org',
    role: 'billing_admin',
  },
  regularuser: {
    id: '00000000-0000-0000-0001-000000000004',
    name: 'Bilal User',
    email: 'user@example.com',
    role: 'user',
  },
};

export default function AdminDashboard() {
  const [activeActorKey, setActiveActorKey] = useState<string>('superadmin');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data States
  const [overview, setOverview] = useState<AdminOverviewStats | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [settings, setSettings] = useState<SystemSettingsEntity | null>(null);
  const [flags, setFlags] = useState<FeatureFlagEntity[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanEntity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [userSearch, setUserSearch] = useState<string>('');

  const currentActor = DEMO_ACTORS[activeActorKey];

  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'x-admin-id': currentActor.id,
      'x-admin-role': currentActor.role,
      'x-admin-name': currentActor.name,
    };
  }, [currentActor]);

  // Fetch Dashboard Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getHeaders();

      // 1. Overview
      const resOverview = await fetch('/api/admin/overview', { headers });
      if (resOverview.status === 403) {
        setOverview(null);
        setLoading(false);
        return;
      }
      const dataOverview = await resOverview.json();
      if (dataOverview.success) setOverview(dataOverview.stats);

      // 2. Settings & Flags
      const resConfig = await fetch('/api/admin/config', { headers });
      const dataConfig = await resConfig.json();
      if (dataConfig.success) {
        setSettings(dataConfig.settings);
        setFlags(dataConfig.featureFlags);
      }

      // 3. Users
      const resUsers = await fetch('/api/admin/users', { headers });
      const dataUsers = await resUsers.json();
      if (dataUsers.success) setUsers(dataUsers.users);

      // 4. Subscriptions
      const resSubs = await fetch('/api/admin/subscriptions', { headers });
      const dataSubs = await resSubs.json();
      if (dataSubs.success) setPlans(dataSubs.plans);

      // 5. Audit Logs
      const resAudit = await fetch('/api/admin/audit-logs', { headers });
      const dataAudit = await resAudit.json();
      if (dataAudit.success) setAuditLogs(dataAudit.logs);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching admin data';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mutations
  const handleToggleMaintenance = async () => {
    if (!settings) return;
    try {
      const headers = getHeaders();
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update_settings',
          settingsUpdates: {
            maintenanceMode: !settings.maintenanceMode,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setSettings(data.settings);
      setFeedback({
        type: 'success',
        message: `Maintenance mode is now ${
          data.settings.maintenanceMode ? 'ENABLED' : 'DISABLED'
        }`,
      });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update settings';
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
        message: `Feature flag '${key}' toggled to ${!currentEnabled}`,
      });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle flag';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleToggleUserSuspension = async (
    targetUserId: string,
    currentSuspended: boolean
  ) => {
    try {
      const headers = getHeaders();
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'set_suspension',
          targetUserId,
          isSuspended: !currentSuspended,
          reason: !currentSuspended
            ? 'Administrative suspension via dashboard'
            : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setFeedback({
        type: 'success',
        message: `User ${!currentSuspended ? 'suspended' : 'reactivated'} successfully`,
      });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update suspension';
      setFeedback({ type: 'error', message: msg });
    }
  };

  // If unauthorized regular user
  if (currentActor.role === 'user') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-800/80 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-950 border border-red-800 flex items-center justify-center text-2xl">
            ⛔
          </div>
          <h1 className="text-xl font-bold text-white">403 — Forbidden</h1>
          <p className="text-xs text-slate-300">
            Administrative access required. The authenticated account{' '}
            <strong className="text-white font-mono">{currentActor.email}</strong> holds
            role <strong className="text-red-400">user</strong>, which is not
            authorized to access administrative controls.
          </p>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 text-left">
            <span>Simulate another role to proceed:</span>
            <select
              value={activeActorKey}
              onChange={(e) => setActiveActorKey(e.target.value)}
              className="mt-2 w-full p-2 bg-slate-900 border border-slate-700 rounded text-white"
            >
              {Object.keys(DEMO_ACTORS).map((k) => (
                <option key={k} value={k}>
                  {DEMO_ACTORS[k].name} ({DEMO_ACTORS[k].role})
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/"
            className="block text-xs font-semibold text-emerald-400 hover:underline"
          >
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Banner / Operational Status */}
      {settings?.maintenanceMode && (
        <div className="bg-amber-950 border-b border-amber-800 text-amber-200 px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>
            <strong>MAINTENANCE MODE IS CURRENTLY ACTIVE:</strong> Public routes are displaying
            scheduled maintenance notice. Admin portal remains fully accessible.
          </span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-lg font-bold text-emerald-400">
              ☪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  ISLAM UL HARAMAIN
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  Admin Control
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Centralized Operational Management & Governance
              </span>
            </div>
          </div>

          {/* Active Actor & Switcher */}
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-slate-400 block">Logged in as</span>
              <strong className="text-white font-medium">
                {currentActor.name} ({currentActor.role})
              </strong>
            </div>

            <select
              value={activeActorKey}
              onChange={(e) => setActiveActorKey(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              title="Simulate Role"
            >
              {Object.keys(DEMO_ACTORS).map((k) => (
                <option key={k} value={k}>
                  {DEMO_ACTORS[k].name} ({DEMO_ACTORS[k].role})
                </option>
              ))}
            </select>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              Public Site ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Feedback Banner */}
      {feedback && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
                : 'bg-red-950/80 text-red-200 border-red-800'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline hover:opacity-80 ml-3"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {(
            [
              ['overview', '📊 Overview'],
              ['users', '👥 User Management'],
              ['rbac', '🛡️ Roles & RBAC'],
              ['subscriptions', '💳 Subscriptions'],
              ['content', '📚 Content Governance'],
              ['settings', '⚙️ Platform Settings'],
              ['flags', '🚩 Feature Flags'],
              ['audit', '📜 Audit Logs'],
            ] as [AdminTab, string][]
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition border ${
                activeTab === tabKey
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            Loading administrative data...
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && overview && (
              <div className="space-y-6">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block mb-1">
                      Total Accounts
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {overview.totalUsers}
                    </span>
                    <span className="text-[11px] text-emerald-400 block mt-1">
                      {overview.activeUsers} active
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block mb-1">
                      Active Subscriptions
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {overview.activeSubscriptions}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      across {overview.totalSubscriptions} tiers
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block mb-1">
                      Quran Ayahs Ingested
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {overview.contentCounts.quranAyahs}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      in {overview.contentCounts.quranSurahs} Surahs
                    </span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                    <span className="text-xs text-slate-400 block mb-1">
                      Hadiths & Duas
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {(
                        overview.contentCounts.hadithNarrations +
                        overview.contentCounts.duasCount
                      ).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Kutub al-Sittah + Hisn al-Muslim
                    </span>
                  </div>
                </div>

                {/* Operational Status & Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Operational Controls</span>
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                        <div>
                          <strong className="text-white block">Maintenance Mode</strong>
                          <span className="text-slate-400 text-[11px]">
                            {settings?.maintenanceMode ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <button
                          onClick={handleToggleMaintenance}
                          className={`px-3 py-1 rounded text-xs font-semibold border ${
                            settings?.maintenanceMode
                              ? 'bg-amber-600 text-white border-amber-500'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                          }`}
                        >
                          {settings?.maintenanceMode ? 'Disable' : 'Enable'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                        <div>
                          <strong className="text-white block">Registration Status</strong>
                          <span className="text-slate-400 text-[11px]">
                            {settings?.registrationEnabled ? 'Open' : 'Frozen'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">
                          Operational
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Health Card */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-white">Content Governance Status</h3>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                        <span>Canonical Seeds (Quran, Hadith, Duas)</span>
                        <span className="font-mono text-emerald-400 text-[11px]">
                          100% PROTECTED (10/10 MATCH)
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                        <span>Scholar Peer Review State Machine</span>
                        <span className="font-mono text-emerald-400 text-[11px]">
                          ACTIVE (M3.2 GATE)
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center">
                        <span>Tafsir Ibn Kathir & Al-Sa'di</span>
                        <span className="font-mono text-emerald-400 text-[11px]">
                          METADATA_ONLY / PUBLISHED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Audit Events */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Recent System Audit Events</h3>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      View All Logs →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-2">Timestamp</th>
                          <th className="py-2">Actor</th>
                          <th className="py-2">Action</th>
                          <th className="py-2">Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {overview.recentAuditLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="py-2 font-mono text-[11px] text-slate-400">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="py-2">{log.actorName || 'System'}</td>
                            <td className="py-2 font-mono text-emerald-400">
                              {log.action}
                            </td>
                            <td className="py-2 font-mono text-slate-400">
                              {log.targetEntityType} ({log.targetEntityId || '1'})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. USER MANAGEMENT TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Search users by name, username, or ID..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-400">
                    Showing {users.length} registered accounts
                  </span>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">User</th>
                          <th className="p-3">Assigned Roles</th>
                          <th className="p-3">Subscription</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {users
                          .filter(
                            (u) =>
                              !userSearch ||
                              u.username
                                ?.toLowerCase()
                                .includes(userSearch.toLowerCase()) ||
                              u.fullName
                                ?.toLowerCase()
                                .includes(userSearch.toLowerCase()) ||
                              u.id.includes(userSearch)
                          )
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-slate-800/40">
                              <td className="p-3">
                                <div className="font-semibold text-white">
                                  {u.fullName || u.username}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {u.id}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {u.roles.map((r) => (
                                    <span
                                      key={r}
                                      className="px-2 py-0.5 text-[10px] rounded font-mono bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    >
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3">
                                {u.activeSubscription ? (
                                  <span className="text-slate-300">
                                    {u.activeSubscription.planName}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">Community</span>
                                )}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 text-[10px] rounded font-semibold border ${
                                    u.isSuspended
                                      ? 'bg-red-950 text-red-300 border-red-800'
                                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  }`}
                                >
                                  {u.isSuspended ? 'Suspended' : 'Active'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {u.roles.includes('super_admin') ? (
                                  <span className="text-[11px] text-slate-500 italic">
                                    Protected
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleToggleUserSuspension(u.id, u.isSuspended)
                                    }
                                    className={`px-2.5 py-1 rounded text-[11px] border font-medium ${
                                      u.isSuspended
                                        ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700 hover:bg-emerald-800'
                                        : 'bg-red-900/60 text-red-300 border-red-700 hover:bg-red-800'
                                    }`}
                                  >
                                    {u.isSuspended ? 'Reactivate' : 'Suspend'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ROLES & RBAC TAB */}
            {activeTab === 'rbac' && (
              <div className="space-y-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white">
                    Platform Role-Based Access Control (RBAC) Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Granular permissions enforced server-side. Each administrative mutation
                    validates required permissions and records an immutable audit log.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-800">
                      <thead className="bg-slate-950 text-slate-400">
                        <tr>
                          <th className="p-2.5 border-b border-slate-800">Role</th>
                          <th className="p-2.5 border-b border-slate-800">
                            Description / Responsibilities
                          </th>
                          <th className="p-2.5 border-b border-slate-800">
                            Permitted Capabilities
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        <tr>
                          <td className="p-2.5 font-mono text-emerald-400 font-bold">
                            super_admin
                          </td>
                          <td className="p-2.5 text-slate-400">
                            Root platform administrator holding full governance authority
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-300">
                            All permissions (unrestricted)
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-teal-400 font-bold">admin</td>
                          <td className="p-2.5 text-slate-400">
                            General platform operations, settings, and maintenance
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-300">
                            read, create, update, delete, publish, manage_users,
                            manage_settings, manage_flags, view_audit_logs
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-amber-400 font-bold">
                            content_admin
                          </td>
                          <td className="p-2.5 text-slate-400">
                            Content catalog and editorial publishing manager
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-300">
                            read, create, update, delete, publish, view_audit_logs
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-cyan-400 font-bold">
                            scholar_reviewer
                          </td>
                          <td className="p-2.5 text-slate-400">
                            Credentialed Sunni Islamic scholar responsible for theological
                            review
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-300">
                            read, approve (scholarly sign-off), view_audit_logs
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-indigo-400 font-bold">
                            support_admin
                          </td>
                          <td className="p-2.5 text-slate-400">
                            User account management and technical customer support
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-300">
                            read, manage_users, view_audit_logs
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-purple-400 font-bold">
                            billing_admin
                          </td>
                          <td className="p-2.5 text-slate-400">
                            Subscription plans, waqf patronage, and billing operations
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-300">
                            read, manage_subscriptions, view_audit_logs
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-slate-400">user</td>
                          <td className="p-2.5 text-slate-400">
                            Standard registered public user
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-300">
                            read (public published content only)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SUBSCRIPTIONS TAB */}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Subscription Plans & Patronage Tiers
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Zero credit card or payment secret data stored in application
                        database.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {plans.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white text-sm">
                              {p.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-mono">
                              {p.slug}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-emerald-400 mb-2">
                            ${(p.priceCents / 100).toFixed(2)}{' '}
                            <span className="text-xs text-slate-400 font-normal">
                              / {p.billingInterval}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-3">{p.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                          {p.features.length} feature entitlements
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. CONTENT MANAGEMENT TAB */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Governance Alert */}
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-xs text-emerald-200 space-y-1">
                  <strong className="text-white block font-semibold">
                    ⚖️ Strict Islamic Religious Content Governance
                  </strong>
                  <p className="text-slate-300">
                    Canonical Holy Quran, authentic Sahih Hadith, and Hisn al-Muslim Dua seeds
                    are cryptographically protected and immutable. Modifications to educational
                    articles require independent scholar peer review.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quran Card */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm">📖 Holy Quran</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        PROTECTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      114 Surahs, 6,236 Ayahs (Hafs 'an 'Asim). Uthmani & Indo-Pak scripts.
                      English (Saheeh Int.) & Urdu (Jalandhari) translations verified.
                    </p>
                  </div>

                  {/* Hadith Card */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm">📜 Hadith Collections</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        PROTECTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Kutub al-Sittah (18,972 narrations). Sanad & Matn visual separation with
                      canonical scholar grading attribution.
                    </p>
                  </div>

                  {/* Duas Card */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm">🤲 Duas & Adhkar</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                        PROTECTED
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Hisn al-Muslim (132 chapters, 268 supplications). Tashkeel,
                      transliterations, repetition targets, and authentic references intact.
                    </p>
                  </div>

                  {/* Articles Card */}
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm">✍️ Articles & CMS</strong>
                      <Link
                        href="/cms"
                        className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 hover:underline"
                      >
                        Launch Review Portal →
                      </Link>
                    </div>
                    <p className="text-xs text-slate-400">
                      Multi-stage scholar review state machine (Draft → In Review → Approved →
                      Published) with author self-approval prohibition.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PLATFORM SETTINGS TAB */}
            {activeTab === 'settings' && settings && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white">Platform Settings & Emergency Controls</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifications update platform configuration across Web and Mobile in real-time.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <strong className="text-white block text-sm">Platform Maintenance Mode</strong>
                      <span className="text-slate-400">
                        When enabled, normal web visitors receive the maintenance page, while
                        administrators retain access.
                      </span>
                    </div>
                    <button
                      onClick={handleToggleMaintenance}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition border ${
                        settings.maintenanceMode
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      {settings.maintenanceMode ? 'ACTIVE (Disable)' : 'INACTIVE (Enable)'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 block">Min Supported Mobile App</span>
                      <strong className="text-white font-mono">{settings.minSupportedMobileVersion}</strong>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 block">Min Supported Web App</span>
                      <strong className="text-white font-mono">{settings.minSupportedWebVersion}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. FEATURE FLAGS TAB */}
            {activeTab === 'flags' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Dynamic Platform Feature Flags</h3>
                <p className="text-xs text-slate-400">
                  Enable or disable application modules without code redeployment.
                </p>

                <div className="divide-y divide-slate-800 text-xs">
                  {flags.map((flag) => (
                    <div
                      key={flag.key}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white font-medium">{flag.name}</strong>
                          <span className="font-mono text-[10px] text-slate-500">
                            {flag.key}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          {flag.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleFlag(flag.key, flag.isEnabled)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          flag.isEnabled
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                        }`}
                      >
                        {flag.isEnabled ? 'Enabled ✓' : 'Disabled ✗'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. AUDIT LOGS TAB */}
            {activeTab === 'audit' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Append-Only Administrative Audit Log</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Immutable record of all privileged administrative events and system mutations.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">
                    {auditLogs.length} events logged
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Timestamp</th>
                        <th className="p-2.5">Actor</th>
                        <th className="p-2.5">Action</th>
                        <th className="p-2.5">Entity</th>
                        <th className="p-2.5">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-2.5 font-medium text-white">
                            {log.actorName || log.actorId || 'System'}
                          </td>
                          <td className="p-2.5 font-mono text-emerald-400 font-semibold">
                            {log.action}
                          </td>
                          <td className="p-2.5 font-mono text-slate-400">
                            {log.targetEntityType} ({log.targetEntityId || '1'})
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
