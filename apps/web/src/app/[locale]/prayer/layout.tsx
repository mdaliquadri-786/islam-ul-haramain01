/**
 * @file layout.tsx
 * @package @islamic/web
 * @description Layout ensuring canonical URL points to authoritative /prayer-times route.
 * Milestone: M4.4 — SEO & OpenGraph Schema
 */

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { isSupportedLocale, type Locale } from '@islamic/ui';
import { buildCanonicalUrl, buildAlternateLanguageUrls } from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';

  return {
    alternates: {
      canonical: buildCanonicalUrl('/prayer-times', typedLocale),
      languages: buildAlternateLanguageUrls('/prayer-times')
    }
  };
}

export default function PrayerAliasLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
