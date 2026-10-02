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
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#111827' }}>
              {dict.quran.title}
            </h1>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '1.05rem' }}>
              {dict.quran.subtitle}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid #a7f3d0'
              }}
            >
              ✓ {dict.quran.verificationBadge} (114 {dict.quran.surah}, 6,236 {dict.quran.ayah})
            </span>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {surahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/${typedLocale}/quran/${surah.id}`}
              style={{
                display: 'block',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2.2rem',
                    height: '2.2rem',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#334155'
                  }}
                >
                  {surah.id}
                </span>
                <span
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    fontFamily: "Amiri, 'Traditional Arabic', serif",
                    color: '#065f46'
                  }}
                >
                  {surah.nameArabic}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{surah.nameTransliteration}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{surah.nameEnglish}</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.5rem'
                }}
              >
                <span>
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
