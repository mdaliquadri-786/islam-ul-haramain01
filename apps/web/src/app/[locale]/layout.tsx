/**
 * @file layout.tsx
 * @package @islamic/web
 * @description Root localized layout setting HTML lang, direction (RTL/LTR),
 *              font preconnects, and global responsive header and footer.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import '../globals.css';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isSupportedLocale, getDirection, type Locale, SUPPORTED_LOCALES } from '@islamic/ui';
import { NavigationHeader } from '@/components/NavigationHeader';
import { NavigationFooter } from '@/components/NavigationFooter';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ToastProvider } from '@/components/Toast';

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

import type { Metadata } from 'next';
import {
  constructPageMetadata,
  JsonLd,
  createWebSiteSchema,
  createOrganizationSchema,
  SITE_IDENTITY
} from '@/lib/seo';

export async function generateMetadata({
  params
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

  const meta = constructPageMetadata({
    title,
    description,
    path: '',
    locale: typedLocale
  });

  return {
    ...meta,
    title: {
      default: title,
      template: SITE_IDENTITY.titleTemplate
    }
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <JsonLd data={[createWebSiteSchema(typedLocale), createOrganizationSchema()]} />
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
