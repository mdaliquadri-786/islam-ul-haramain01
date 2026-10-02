/**
 * @file robots.ts
 * @package @islamic/web
 * @description Dynamic robots.txt generator for Next.js App Router.
 * Milestone: M4.4 — SEO & OpenGraph Schema
 *
 * POLICY & SECURITY:
 * - Allows public crawling of canonical religious text, scholarly articles, and public indexes.
 * - Disallows private routes: admin, CMS, personal library, user profile, internal API routes.
 * - Disallows search pages with query parameters to prevent indexing explosion.
 * - References canonical sitemap index.
 * - NOTE: Robots rules are for crawler guidance; security/RLS remains enforced at the server layer.
 */

import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/*/admin',
          '/*/admin/*',
          '/*/cms',
          '/*/cms/*',
          '/*/library',
          '/*/library/*',
          '/*/profile',
          '/*/profile/*',
          '/*/search',
          '/admin',
          '/cms',
          '/library',
          '/profile',
          '/search'
        ]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
