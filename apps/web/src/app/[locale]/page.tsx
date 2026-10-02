/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Homepage for ISLAM UL HARAMAIN with atmospheric hero glow,
 *              interactive search capsule, SVG iconography, editorial card hierarchy,
 *              and platform verification metrics.
 * Milestone: M3.4 / Web UI Renaissance
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { ISLAMIC_ENGINE_VERSION } from '@islamic/islamic-engine';
import { DATABASE_PACKAGE_VERSION } from '@islamic/database';
import { UI_PACKAGE_VERSION } from '@islamic/ui';

import type { Metadata } from 'next';
import { constructPageMetadata, SITE_IDENTITY } from '@/lib/seo';
import {
  QuranIcon,
  HadithIcon,
  DuasIcon,
  MosqueIcon,
  BooksIcon,
  SearchIcon,
  BookmarkIcon,
  StarEightPointIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from '@/components/Icons';

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

  // Search recommendation quick tags
  const quickSearchTags = [
    { label: 'آية الكرسي (2:255)', query: '2:255' },
    { label: 'سورة الملك (67)', query: '67' },
    { label: 'إنما الأعمال بالنيات', query: 'الأعمال بالنيات' },
    { label: 'أذكار الصباح', query: 'أذكار الصباح' },
    { label: 'Umm Al-Qura', query: 'Umm Al-Qura' },
  ];

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* 1. Atmospheric Hero Section with Radial Glow */}
      <section
        className="atmospheric-hero"
        style={{
          padding: '3.5rem 1.5rem 3rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          borderRadius: '1.5rem',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Sacred Bismillah Calligraphic Seal */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span
            className="glass-pill"
            style={{
              padding: '0.35rem 0.95rem',
              color: '#065f46',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(236, 253, 245, 0.85)'
            }}
          >
            <StarEightPointIcon size={14} style={{ color: '#d97706' }} />
            <span>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
          </span>
        </div>

        {/* Primary Platform Name & Arabic Calligraphy */}
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.25rem)',
            fontWeight: 900,
            color: '#064e3b',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '0.6rem'
          }}
        >
          {dict.common.platformName}
        </h1>

        <div
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            color: '#059669',
            fontFamily: "Amiri, 'Traditional Arabic', serif",
            fontWeight: 700,
            marginBottom: '1.25rem',
            lineHeight: 1.3
          }}
        >
          {dict.common.platformNameArabic}
        </div>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#475569',
            maxWidth: '780px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.65,
            fontWeight: 400
          }}
        >
          {dict.common.tagline}
        </p>

        {/* 2. Interactive Global Search Capsule */}
        <div style={{ maxWidth: '720px', margin: '0 auto 1.5rem' }}>
          <form
            action={`/${typedLocale}/search`}
            method="GET"
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              boxShadow: '0 8px 25px -4px rgba(4, 120, 87, 0.15), 0 2px 6px rgba(0, 0, 0, 0.04)',
              borderRadius: '9999px',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ position: 'absolute', left: typedLocale === 'en' ? '1.25rem' : 'auto', right: typedLocale !== 'en' ? '1.25rem' : 'auto', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <SearchIcon size={20} style={{ color: '#059669' }} />
            </div>

            <input
              type="text"
              name="q"
              placeholder={dict.common.searchPlaceholder}
              aria-label={dict.common.search}
              className="glass-input"
              style={{
                borderRadius: '9999px',
                paddingLeft: typedLocale === 'en' ? '3.2rem' : '1.25rem',
                paddingRight: typedLocale !== 'en' ? '3.2rem' : '1.25rem',
                paddingTop: '1rem',
                paddingBottom: '1rem',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                fontSize: '1rem'
              }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                position: 'absolute',
                right: typedLocale === 'en' ? '0.35rem' : 'auto',
                left: typedLocale !== 'en' ? '0.35rem' : 'auto',
                borderRadius: '9999px',
                padding: '0.65rem 1.4rem'
              }}
            >
              <span>{dict.common.search}</span>
            </button>
          </form>
        </div>

        {/* Quick Search Shortcut Tags */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Trending:</span>
          {quickSearchTags.map((tag) => (
            <Link
              key={tag.query}
              href={`/${typedLocale}/search?q=${encodeURIComponent(tag.query)}`}
              className="glass-pill"
              style={{ fontSize: '0.75rem', textDecoration: 'none' }}
            >
              <span>{tag.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Canonical Core Spiritual Engines Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#064e3b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <StarEightPointIcon size={20} style={{ color: '#059669' }} />
              <span>{dict.common.platformName} — Primary Canonical Suite</span>
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
              Direct access to the Holy Quran, Kutub al-Sittah Hadith, Hisn al-Muslim Duas, and astronomical prayer calculations.
            </p>
          </div>
        </div>

        {/* Editorial Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* Card 1: Holy Quran */}
          <Link
            href={`/${typedLocale}/quran`}
            className="card-editorial card-emerald"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(4, 120, 87, 0.25)'
                }}
              >
                <QuranIcon size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#047857',
                  backgroundColor: '#ffffff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid #a7f3d0'
                }}
              >
                114 Surahs • Medina Mushaf
              </span>
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#064e3b',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{dict.quran.title}</span>
              <ArrowRightIcon size={16} />
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              {dict.quran.subtitle}
            </p>
          </Link>

          {/* Card 2: Hadith Collections */}
          <Link
            href={`/${typedLocale}/hadith`}
            className="card-editorial card-gold"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#b45309',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(180, 83, 9, 0.25)'
                }}
              >
                <HadithIcon size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#92400e',
                  backgroundColor: '#ffffff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid #fde68a'
                }}
              >
                Kutub al-Sittah
              </span>
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#78350f',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{dict.hadith.title}</span>
              <ArrowRightIcon size={16} />
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              {dict.hadith.subtitle}
            </p>
          </Link>

          {/* Card 3: Daily Adhkar & Duas */}
          <Link
            href={`/${typedLocale}/duas`}
            className="card-editorial"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#0f766e',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(15, 118, 110, 0.25)'
                }}
              >
                <DuasIcon size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0f766e',
                  backgroundColor: '#f0fdfa',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid #99f6e4'
                }}
              >
                Hisn al-Muslim
              </span>
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#134e4a',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{dict.duas.title}</span>
              <ArrowRightIcon size={16} />
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              {dict.duas.subtitle}
            </p>
          </Link>

          {/* Card 4: Prayer Times & Qibla Direction */}
          <Link
            href={`/${typedLocale}/prayer-times`}
            className="card-editorial"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#1e40af',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(30, 64, 175, 0.25)'
                }}
              >
                <MosqueIcon size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1e40af',
                  backgroundColor: '#eff6ff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid #bfdbfe'
                }}
              >
                Astronomical Precision
              </span>
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#1e3a8a',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{dict.nav.prayerTimes}</span>
              <ArrowRightIcon size={16} />
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              {dict.prayer.fajr}, {dict.prayer.dhuhr}, {dict.prayer.asr}, {dict.prayer.maghrib}, {dict.prayer.isha} • {dict.prayer.qiblaBearing}
            </p>
          </Link>

          {/* Card 5: Scholarly Articles & Research */}
          <Link
            href={`/${typedLocale}/articles`}
            className="card-editorial"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#5b21b6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(91, 33, 182, 0.25)'
                }}
              >
                <BooksIcon size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#5b21b6',
                  backgroundColor: '#f5f3ff',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid #ddd6fe'
                }}
              >
                Peer-Reviewed
              </span>
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#4c1d95',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{dict.articles.title}</span>
              <ArrowRightIcon size={16} />
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              {dict.articles.subtitle}
            </p>
          </Link>

          {/* Card 6: Personal Library & Bookmarks */}
          <Link
            href={`/${typedLocale}/library`}
            className="card-editorial"
            style={{ backgroundColor: '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
              <div
                style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#9d174d',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 8px rgba(157, 23, 77, 0.25)'
                }}
              >
                <BookmarkIcon size={24} />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#9d174d',
                  backgroundColor: '#fdf2f8',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  border: '1px solid #fbcfe8'
                }}
              >
                Sync & Notes
              </span>
            </div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#831843',
                marginBottom: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{dict.library.title}</span>
              <ArrowRightIcon size={16} />
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              {dict.library.subtitle}
            </p>
          </Link>
        </div>
      </section>

      {/* 4. Verified Platform Statistics & Scholarly Integrity Strip */}
      <section
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #022c22 100%)',
          borderRadius: '1.25rem',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(4, 120, 87, 0.25)',
          marginBottom: '3rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fef3c7', lineHeight: 1 }}>
              114
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d1fae5', marginTop: '0.35rem' }}>
              Surahs (Medina Standard)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fef3c7', lineHeight: 1 }}>
              6,236
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d1fae5', marginTop: '0.35rem' }}>
              Ayahs Verified
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fef3c7', lineHeight: 1 }}>
              6
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d1fae5', marginTop: '0.35rem' }}>
              Canonical Hadith Books
            </div>
          </div>

          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fef3c7', lineHeight: 1 }}>
              4
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#d1fae5', marginTop: '0.35rem' }}>
              Sunnah Madhhabs Supported
            </div>
          </div>
        </div>
      </section>

      {/* 5. Subsystem Status & Integrity Badges */}
      <section
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '1rem',
          fontSize: '0.875rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#064e3b', fontWeight: 700 }}>
            <ShieldCheckIcon size={18} style={{ color: '#059669' }} />
            <span>{dict.footer.status} — Verified Operational</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: '#64748b', fontSize: '0.825rem' }}>
            <div>
              Engine: <code style={{ color: '#047857', fontWeight: 600 }}>v{ISLAMIC_ENGINE_VERSION}</code>
            </div>
            <div>
              Database: <code style={{ color: '#047857', fontWeight: 600 }}>v{DATABASE_PACKAGE_VERSION}</code>
            </div>
            <div>
              UI Tokens: <code style={{ color: '#047857', fontWeight: 600 }}>v{UI_PACKAGE_VERSION}</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
