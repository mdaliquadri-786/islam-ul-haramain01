/**
 * @file layout.tsx
 * @package @islamic/web
 * @description Layout providing metadata and structured data for the client Prayer Times dashboard.
 * Milestone: M4.4 — SEO & OpenGraph Schema
 */

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { isSupportedLocale, getDictionary, type Locale } from '@islamic/ui';
import { buildPrayerTimesMetadata, JsonLd, createBreadcrumbSchema } from '@/lib/seo';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildPrayerTimesMetadata(typedLocale);
}

export default async function PrayerTimesLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  const dict = getDictionary(typedLocale);

  return (
    <>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.nav.prayerTimes, path: '/prayer-times' }
          ],
          typedLocale
        )}
      />
      {children}
    </>
  );
}
