/**
 * @file layout.tsx
 * @package @islamic/web
 * @description Root localized layout setting HTML lang, direction (RTL/LTR),
 *              font preconnects, global responsive header, footer, dynamic SEO metadata,
 *              alternate language hreflang links, and global JSON-LD structured schemas.
 * Milestone: M3.4 & Production Launch Optimization
 */

import '../globals.css';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import {
  isSupportedLocale,
  getDirection,
  type Locale,
  SUPPORTED_LOCALES,
} from '@islamic/ui';
import { NavigationHeader } from '@/components/NavigationHeader';
import { NavigationFooter } from '@/components/NavigationFooter';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ToastProvider } from '@/components/Toast';
import type { Metadata } from 'next';
import {
  constructPageMetadata,
  JsonLd,
  createWebSiteSchema,
  createOrganizationSchema,
  SITE_IDENTITY,
  getSiteUrl,
} from '@/lib/seo';

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';

  const title =
    typedLocale === 'ar'
      ? 'إسلام الحرمين — منصة رقمية للعلوم الإسلامية الأصيلة'
      : typedLocale === 'ur'
      ? 'اسلام الحرمین — مستند اسلامی علوم کا ڈیجیٹل پلیٹ فارم'
      : SITE_IDENTITY.defaultTitle;

  const description =
    typedLocale === 'ar'
      ? 'منصة إسلامية سنية رقمية متقدمة للقرآن الكريم بالسند العثماني، كتب السنة الستة مع أحكام المحدثين، حصن المسلم، والمواقيت الدقيقة.'
      : typedLocale === 'ur'
      ? 'اہل السنت والجماعت کے مطابق مستند ڈیجیٹل پلیٹ فارم: قرآن مجید، کتب ستہ، حصن المسلم کے اذکار اور اوقات نماز۔'
      : SITE_IDENTITY.defaultDescription;

  const baseMetadata = constructPageMetadata({
    title,
    description,
    path: '',
    locale: typedLocale,
  });

  return {
    ...baseMetadata,
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: SITE_IDENTITY.titleTemplate,
    },
    applicationName: SITE_IDENTITY.nameEnglish,
    authors: [{ name: SITE_IDENTITY.organization.name, url: getSiteUrl() }],
    generator: 'Next.js 15',
    keywords: [
      'Quran',
      'Hadith',
      'Sunnah',
      'Kutub al-Sittah',
      'Tafsir',
      'Islamic Knowledge',
      'Prayer Times',
      'Hisn al-Muslim',
      'Fiqh',
      'Ahl al-Sunnah',
      'إسلام الحرمين',
      'القرآن الكريم',
      'الحديث الشريف',
    ],
    creator: SITE_IDENTITY.nameEnglish,
    publisher: SITE_IDENTITY.organization.name,
    formatDetection: {
      telephone: false,
      date: false,
      address: false,
      email: false,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/manifest.webmanifest',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dir = getDirection(typedLocale);

  return (
    <html lang={typedLocale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#030712" />
        <JsonLd
          data={[
            createWebSiteSchema(typedLocale),
            createOrganizationSchema(),
          ]}
        />
      </head>
      <body>
        <ToastProvider>
          <NavigationHeader locale={typedLocale} />
          <main style={{ minHeight: 'calc(100vh - 180px)' }}>{children}</main>
          <NavigationFooter locale={typedLocale} />
          <MobileBottomNav locale={typedLocale} />
        </ToastProvider>
      </body>
    </html>
  );
}
