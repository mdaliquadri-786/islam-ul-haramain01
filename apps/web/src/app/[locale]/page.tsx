/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Homepage for ISLAM UL HARAMAIN with multi-lingual search,
 *              canonical engine cards, and devotional suite shortcuts.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { ISLAMIC_ENGINE_VERSION } from '@islamic/islamic-engine';
import { DATABASE_PACKAGE_VERSION } from '@islamic/database';
import { UI_PACKAGE_VERSION } from '@islamic/ui';

import type { Metadata } from 'next';
import { constructPageMetadata, SITE_IDENTITY } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

  return constructPageMetadata({
    title,
    description,
    path: '',
    locale: typedLocale
  });
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  const engineCards = [
    {
      href: `/${typedLocale}/quran`,
      title: dict.quran.title,
      description: dict.quran.subtitle,
      icon: '📖',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      color: '#166534'
    },
    {
      href: `/${typedLocale}/hadith`,
      title: dict.hadith.title,
      description: dict.hadith.subtitle,
      icon: '📜',
      bg: '#f8fafc',
      border: '#cbd5e1',
      color: '#0f172a'
    },
    {
      href: `/${typedLocale}/duas`,
      title: dict.duas.title,
      description: dict.duas.subtitle,
      icon: '🤲',
      bg: '#fffbeb',
      border: '#fde68a',
      color: '#92400e'
    },
    {
      href: `/${typedLocale}/prayer-times`,
      title: dict.nav.prayerTimes,
      description: `${dict.prayer.fajr}, ${dict.prayer.dhuhr}, ${dict.prayer.asr}, ${dict.prayer.maghrib}, ${dict.prayer.isha} • ${dict.prayer.qiblaBearing}`,
      icon: '🕌',
      bg: '#eff6ff',
      border: '#bfdbfe',
      color: '#1e40af'
    },
    {
      href: `/${typedLocale}/articles`,
      title: dict.articles.title,
      description: dict.articles.subtitle,
      icon: '✍️',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      color: '#5b21b6'
    },
    {
      href: `/${typedLocale}/search`,
      title: dict.nav.search,
      description: dict.common.searchPlaceholder,
      icon: '🔍',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      color: '#065f46'
    },
    {
      href: `/${typedLocale}/library`,
      title: dict.library.title,
      description: dict.library.subtitle,
      icon: '🔖',
      bg: '#fdf2f8',
      border: '#fbcfe8',
      color: '#9d174d'
    },
    {
      href: `/${typedLocale}/profile`,
      title: dict.profile.title,
      description: dict.profile.subtitle,
      icon: '⚙️',
      bg: '#f8fafc',
      border: '#e2e8f0',
      color: '#334155'
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Hero Header */}
      <section style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#064e3b',
            marginBottom: '0.5rem',
            lineHeight: 1.3
          }}
        >
          {dict.common.platformName}
        </h1>
        <div
          style={{
            fontSize: '1.4rem',
            color: '#10b981',
            fontFamily: "Amiri, 'Traditional Arabic', serif",
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}
        >
          {dict.common.platformNameArabic}
        </div>
        <p
          style={{
            fontSize: '1.1rem',
            color: '#475569',
            maxWidth: '750px',
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          {dict.common.tagline}
        </p>
      </section>

      {/* Global Search Bar */}
      <section style={{ marginBottom: '3rem' }}>
        <form
          action={`/${typedLocale}/search`}
          method="GET"
          style={{
            display: 'flex',
            gap: '0.5rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >
          <input
            type="text"
            name="q"
            placeholder={dict.common.searchPlaceholder}
            aria-label={dict.common.search}
            style={{
              flex: 1,
              padding: '0.9rem 1.25rem',
              fontSize: '1rem',
              border: '2px solid #059669',
              borderRadius: '0.5rem',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#059669',
              color: '#ffffff',
              padding: '0.9rem 1.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {dict.common.search}
          </button>
        </form>
      </section>

      {/* Canonical Core Engines Grid */}
      <section style={{ marginBottom: '3rem' }}>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '1.25rem'
          }}
        >
          {dict.common.platformName} — {dict.nav.quran}, {dict.nav.hadith}, {dict.nav.duas} & {dict.nav.prayerTimes}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {engineCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              style={{
                display: 'block',
                padding: '1.5rem',
                backgroundColor: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: card.color,
                  marginBottom: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{card.icon}</span>
                <span>{card.title} →</span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: '#475569',
                  lineHeight: 1.5
                }}
              >
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Platform Subsystem Status */}
      <section
        style={{
          backgroundColor: '#f8fafc',
          padding: '1.25rem 1.5rem',
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0',
          fontSize: '0.875rem'
        }}
      >
        <h3
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#334155',
            margin: '0 0 0.5rem 0'
          }}
        >
          {dict.footer.status}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', color: '#64748b' }}>
          <div>
            Islamic Computational Engine: <code style={{ color: '#047857', fontWeight: 600 }}>{ISLAMIC_ENGINE_VERSION}</code>
          </div>
          <div>
            Database & Schema Layer: <code style={{ color: '#047857', fontWeight: 600 }}>{DATABASE_PACKAGE_VERSION}</code>
          </div>
          <div>
            UI Tokens & Localization: <code style={{ color: '#047857', fontWeight: 600 }}>{UI_PACKAGE_VERSION}</code>
          </div>
        </div>
      </section>
    </div>
  );
}
