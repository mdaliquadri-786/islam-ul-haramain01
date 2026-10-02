/**
 * @file site.config.ts
 * @package @islamic/web
 * @description Authoritative site identity and canonical configuration for ISLAM UL HARAMAIN.
 * Milestone: M4.4 — SEO & OpenGraph Schema
 *
 * GOVERNANCE:
 * - Single canonical site identity configuration.
 * - Origin configurable via NEXT_PUBLIC_SITE_URL or SITE_URL environment variables.
 * - Default fallback to 'https://islamulharamain.com'.
 * - Preserves existing authentic 3 locales (en, ar, ur).
 * - Zero fabricated claims, authors, publishers, or licenses.
 */

import { type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@islamic/ui';

export const DEFAULT_CANONICAL_ORIGIN = 'https://islamulharamain.com';

/**
 * Resolves the canonical site base URL from environment variables or falls back to production default.
 * Trims any trailing slashes to guarantee clean canonical path concatenation.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const baseUrl = (envUrl && envUrl.trim().length > 0) ? envUrl.trim() : DEFAULT_CANONICAL_ORIGIN;
  return baseUrl.replace(/\/+$/, '');
}

export const SITE_IDENTITY = {
  name: 'ISLAM UL HARAMAIN | إسلام الحرمين',
  nameEnglish: 'ISLAM UL HARAMAIN',
  nameArabic: 'إسلام الحرمين',
  tagline: 'Comprehensive Digital Platform for Classical Islamic Knowledge',
  defaultTitle: 'ISLAM UL HARAMAIN — Classical Islamic Knowledge Platform',
  titleTemplate: '%s | ISLAM UL HARAMAIN',
  defaultDescription:
    'Production-grade Sunni Islamic digital platform providing canonical Quran with Uthmani text, verified Kutub al-Sittah Hadith with authenticated scholar gradings, Hisn al-Muslim Duas, deterministic Prayer Times, Classical Tafsir, and peer-reviewed Islamic scholarship.',
  supportedLocales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  openGraph: {
    siteName: 'ISLAM UL HARAMAIN',
    defaultType: 'website' as const,
    defaultImage: '/images/og-default.png'
  },
  twitter: {
    cardType: 'summary' as const,
    creator: '@IslamUlHaramain'
  },
  organization: {
    name: 'ISLAM UL HARAMAIN (إسلام الحرمين)',
    legalName: 'ISLAM UL HARAMAIN Foundation',
    url: DEFAULT_CANONICAL_ORIGIN,
    logo: `${DEFAULT_CANONICAL_ORIGIN}/images/logo.png`,
    foundingMethodology: 'Ahl al-Sunnah wa al-Jama‘ah',
    sameAs: [] as string[]
  }
} as const;

export const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  ar: 'ar_SA',
  ur: 'ur_PK'
};
