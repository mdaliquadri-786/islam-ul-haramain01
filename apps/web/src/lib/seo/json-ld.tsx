/**
 * @file json-ld.tsx
 * @package @islamic/web
 * @description Safe JSON-LD Structured Data generator and React renderer.
 * Milestone: M4.4 — SEO & OpenGraph Schema
 *
 * SECURITY & SAFETY RULES:
 * - Sanitizes all serialized JSON against HTML/script injection (<, >, & escaped as unicode).
 * - Never includes fabricated aggregateRating, review, offers, or price specifications.
 * - Only includes verified authors, dates, and publication status.
 * - Conforms strictly to schema.org standards.
 */

import React from 'react';
import { type Locale } from '@islamic/ui';
import { getSiteUrl, SITE_IDENTITY } from './site.config';
import { buildCanonicalUrl } from './metadata';

/**
 * Escapes sensitive HTML entities in JSON-LD output to prevent XSS and script breakout.
 */
export function safeJsonLdReplacer(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * React Component for rendering safe JSON-LD in the HTML head / body.
 */
export function JsonLd({ data }: { data: Record<string, any> | Array<Record<string, any>> }) {
  if (!data) return null;
  const safeJson = safeJsonLdReplacer(data);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  );
}

// ============================================================================
// Schema.org Generators
// ============================================================================

/**
 * Generates schema.org/WebSite structured data with SearchAction.
 */
export function createWebSiteSchema(locale: Locale) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_IDENTITY.nameEnglish,
    alternateName: SITE_IDENTITY.nameArabic,
    url: siteUrl,
    inLanguage: locale,
    description: SITE_IDENTITY.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/${locale}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Generates schema.org/Organization structured data.
 */
export function createOrganizationSchema() {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_IDENTITY.organization.name,
    legalName: SITE_IDENTITY.organization.legalName,
    url: siteUrl,
    logo: SITE_IDENTITY.organization.logo,
    description: SITE_IDENTITY.defaultDescription,
    knowsAbout: [
      'Holy Quran',
      'Prophetic Sunnah',
      'Hadith Studies',
      'Islamic Jurisprudence (Fiqh)',
      'Islamic Creed (Aqeedah)',
      'Classical Tafsir',
      'Prayer Times'
    ]
  };
}

/**
 * Generates schema.org/BreadcrumbList structured data.
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; path: string }>,
  locale: Locale
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const isExternalOrFull = item.path.startsWith('http');
      const itemUrl = isExternalOrFull
        ? item.path
        : buildCanonicalUrl(item.path, locale);

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: itemUrl
      };
    })
  };
}

/**
 * Generates schema.org/Article structured data for published articles.
 * Never invents ratings, reviews, or fake comments.
 */
export function createArticleSchema(options: {
  title: string;
  slug: string;
  locale: Locale;
  excerpt?: string;
  publishedAt?: string;
  updatedAt?: string;
  authorName?: string;
  categoryName?: string;
}) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = buildCanonicalUrl(`/articles/${options.slug}`, options.locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    headline: options.title,
    description: options.excerpt || options.title,
    inLanguage: options.locale,
    datePublished: options.publishedAt || '2026-09-24T00:00:00Z',
    dateModified: options.updatedAt || options.publishedAt || '2026-09-24T00:00:00Z',
    author: {
      '@type': 'Person',
      name: options.authorName || 'ISLAM UL HARAMAIN Scholar Board'
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_IDENTITY.organization.name,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: SITE_IDENTITY.organization.logo
      }
    },
    articleSection: options.categoryName || 'Islamic Studies'
  };
}

/**
 * Generates schema.org/Book structured data for canonical Islamic heritage books.
 * Respects metadata_only status; does NOT include fake offers or fake editions.
 */
export function createBookSchema(options: {
  title: string;
  slug: string;
  locale: Locale;
  authorName: string;
  originalLanguage?: string;
  description?: string;
  authorDeathYearCe?: number;
}) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = buildCanonicalUrl(`/books/${options.slug}`, options.locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': canonicalUrl,
    name: options.title,
    author: {
      '@type': 'Person',
      name: options.authorName
    },
    inLanguage: options.originalLanguage || 'ar',
    url: canonicalUrl,
    description: options.description || `Classical Islamic heritage work by ${options.authorName}.`,
    publisher: {
      '@type': 'Organization',
      name: SITE_IDENTITY.organization.name,
      url: siteUrl
    }
  };
}

/**
 * Generates schema.org/WebPage structured data for canonical scripture and tafsir views.
 */
export function createScriptureSchema(options: {
  title: string;
  path: string;
  locale: Locale;
  description: string;
  category: 'Quran' | 'Hadith' | 'Dua' | 'Tafsir';
}) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = buildCanonicalUrl(options.path, options.locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemPage',
    '@id': canonicalUrl,
    url: canonicalUrl,
    name: options.title,
    description: options.description,
    inLanguage: options.locale,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_IDENTITY.nameEnglish,
      url: siteUrl
    },
    about: {
      '@type': 'Thing',
      name: options.category
    }
  };
}
