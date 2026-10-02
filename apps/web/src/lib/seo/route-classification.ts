/**
 * @file route-classification.ts
 * @package @islamic/web
 * @description Route indexing classification: public vs. private routes.
 * Milestone: M4.4 — SEO & OpenGraph Schema
 *
 * POLICY:
 * - Public informational & devotional content is indexable.
 * - Private, user-isolated, authentication, administrative, and CMS routes are strictly noindex/nofollow.
 * - Search query pages (with dynamic parameters) are noindex to prevent indexing explosion.
 * - Book reader routes with metadata_only notices do NOT index duplicate thin content.
 */

import type { Metadata } from 'next';

export const PUBLIC_STATIC_ROUTES = [
  '',
  '/quran',
  '/hadith',
  '/duas',
  '/prayer-times',
  '/articles',
  '/books'
] as const;

export const PRIVATE_ROUTE_SEGMENTS = [
  'admin',
  'cms',
  'library',
  'profile',
  'search',
  'api'
] as const;

/**
 * Strips locale prefix (/en, /ar, /ur) and trailing slashes to obtain the clean path.
 */
export function normalizePath(path: string): string {
  if (!path) return '';
  let clean = path.trim();
  // Remove query params or hash if present
  clean = clean.split('?')[0].split('#')[0];
  // Remove leading /en, /ar, /ur
  clean = clean.replace(/^\/(?:en|ar|ur)(?:\/|$)/, '/');
  // Normalize leading slash
  if (!clean.startsWith('/')) clean = '/' + clean;
  // Remove trailing slash if longer than 1 char
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean === '/' ? '' : clean;
}

/**
 * Determines whether a given route path should be publicly indexed by search engines.
 */
export function isPublicIndexableRoute(path: string): boolean {
  const normalized = normalizePath(path);
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length === 0) {
    return true; // Home route is indexable
  }

  const firstSegment = segments[0].toLowerCase();

  // If first segment is private, strictly not indexable
  if (PRIVATE_ROUTE_SEGMENTS.includes(firstSegment as any)) {
    return false;
  }

  return true;
}

/**
 * Builds Next.js standard robots metadata object based on public/private status and options.
 */
export function getRobotsDirectives(
  isPublic: boolean,
  options?: { noindex?: boolean; nofollow?: boolean }
): Metadata['robots'] {
  const shouldIndex = isPublic && !options?.noindex;
  const shouldFollow = options?.nofollow !== undefined ? !options.nofollow : isPublic;

  if (!shouldIndex) {
    return {
      index: false,
      follow: shouldFollow,
      nocache: true,
      googleBot: {
        index: false,
        follow: shouldFollow,
        noimageindex: true
      }
    };
  }

  return {
    index: true,
    follow: shouldFollow,
    nocache: false,
    googleBot: {
      index: true,
      follow: shouldFollow,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  };
}
