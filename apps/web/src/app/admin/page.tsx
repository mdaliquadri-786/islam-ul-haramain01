/**
 * @file page.tsx
 * @package @islamic/web
 * @description Dedicated root Administration Portal route (/admin).
 * Centralized dashboard for platform operations, user management, and governance.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 */

import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  return <AdminDashboard />;
}
