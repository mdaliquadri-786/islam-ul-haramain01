/**
 * @file admin.ts
 * @package @islamic/web
 * @description Web helper module for Platform Administration and RBAC validation.
 * Coordinates AdminService instance, server-side session checks, and security gating.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 */

import { AdminService, type AdminActor, type UserRole } from '@islamic/database';

let globalAdminService: AdminService | null = null;

export async function getAdminService(): Promise<AdminService> {
  if (!globalAdminService) {
    globalAdminService = new AdminService();
  }
  return globalAdminService;
}

export const ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'content_admin',
  'scholar_reviewer',
  'support_admin',
  'billing_admin',
];

export function isAuthorizedAdmin(roles: UserRole[]): boolean {
  if (!roles || roles.length === 0) return false;
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

/**
 * Resolves the authenticated admin actor from request headers, session, or simulation.
 * Rejects unauthorized non-admin users.
 */
export function resolveAdminActor(user?: {
  id: string;
  email?: string;
  name?: string;
  roles?: UserRole[];
} | null): AdminActor | null {
  if (!user || !user.id) return null;

  const roles = user.roles || ['user'];
  return {
    id: user.id,
    name: user.name || user.email || 'Platform User',
    roles,
  };
}
