/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Quran Surah Index — 114 Surahs according to the Medina Mushaf standard.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllSurahs } from '@/lib/quran';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { buildQuranIndexMetadata, JsonLd, createBreadcrumbSchema } from '@/lib/seo';
import { ShieldCheckIcon, QuranIcon } from '@/components/Icons';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildQuranIndexMetadata(typedLocale);
}

export default async function QuranIndexPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const surahs = getAllSurahs();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.quran.title, path: '/quran' }
          ],
          typedLocale
        )}
      />
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <QuranIcon size={26} style={{ color: '#059669' }} />
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#064e3b', letterSpacing: '-0.02em' }}>
                {dict.quran.title}
              </h1>
            </div>
            <p style={{ margin: 0, color: '#475569', fontSize: '1.05rem' }}>
              {dict.quran.subtitle}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              className="glass-pill"
              style={{
                backgroundColor: 'rgba(236, 253, 245, 0.9)',
                color: '#065f46',
                border: '1px solid rgba(167, 243, 208, 0.9)',
                padding: '0.4rem 0.95rem'
              }}
            >
              <ShieldCheckIcon size={16} style={{ color: '#059669' }} />
              <span>{dict.quran.verificationBadge} (114 {dict.quran.surah}, 6,236 {dict.quran.ayah})</span>
            </span>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {surahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/${typedLocale}/quran/${surah.id}`}
              className="card-editorial"
              style={{
                backgroundColor: '#ffffff',
                padding: '1.25rem',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.3rem',
                    height: '2.3rem',
                    backgroundColor: 'rgba(236, 253, 245, 0.8)',
                    border: '1px solid rgba(167, 243, 208, 0.7)',
                    borderRadius: '0.625rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#065f46'
                  }}
                >
                  {surah.id}
                </span>
                <span
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    fontFamily: "Amiri, 'Traditional Arabic', serif",
                    color: '#047857',
                    lineHeight: 1
                  }}
                >
                  {surah.nameArabic}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                  {surah.nameTransliteration}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{surah.nameEnglish}</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.85rem',
                  fontSize: '0.775rem',
                  color: '#64748b',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.6rem'
                }}
              >
                <span style={{ fontWeight: 600, color: surah.revelationType === 'meccan' ? '#b45309' : '#047857' }}>
                  {surah.revelationType === 'meccan' ? dict.quran.revelationMakkah : dict.quran.revelationMadinah}
                </span>
                <span>{surah.ayahsCount} {dict.quran.ayah}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
