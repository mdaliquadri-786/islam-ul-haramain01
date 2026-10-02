/**
 * @file layout.tsx
 * @package @islamic/web
 * @description Layout providing noindex metadata for CMS & Scholar Review Portal.
 * Milestone: M4.4 — SEO & OpenGraph Schema
 */

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { isSupportedLocale, type Locale } from '@islamic/ui';
import { buildPrivatePageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildPrivatePageMetadata('CMS & Scholar Review Portal', typedLocale);
}

export default function CmsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
