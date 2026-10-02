/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Hadith Collections Index — Kutub al-Sittah viewer interface.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllHadithCollections, getScholarsMap, getCollectionSummary } from '@/lib/hadith';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { buildHadithIndexMetadata, JsonLd, createBreadcrumbSchema } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildHadithIndexMetadata(typedLocale);
}

export default async function HadithIndexPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const collections = getAllHadithCollections();
  const scholarsMap = getScholarsMap();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.hadith.title, path: '/hadith' }
          ],
          typedLocale
        )}
      />
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#111827' }}>
              {dict.hadith.title}
            </h1>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '1.05rem' }}>
              {dict.hadith.subtitle}
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
              ✓ Kutub al-Sittah (الكتب الستة)
            </span>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {collections.map((col) => {
            const author = scholarsMap.get(col.author_id);
            const summary = getCollectionSummary(col.id);

            return (
              <Link
                key={col.id}
                href={`/${typedLocale}/hadith/${col.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'transform 0.15s, border-color 0.15s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        fontFamily: "Amiri, 'Traditional Arabic', serif",
                        color: '#047857'
                      }}
                    >
                      {col.name_arabic}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                      {col.id.toUpperCase()}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#111827' }}>
                    {col.name_english}
                  </h2>
                  <div style={{ fontSize: '0.9rem', color: '#475569', fontFamily: "'Noto Nastaliq Urdu', serif", marginBottom: '0.75rem' }}>
                    {col.name_urdu}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    <strong>Compiler:</strong> {author?.name_english}
                    {author?.death_year_ah && (
                      <span style={{ color: '#64748b' }}> (d. {author.death_year_ah} AH)</span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                    {col.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    <span>Canonical Corpus: <strong>{col.total_hadiths.toLocaleString()}</strong> {dict.hadith.isnad}</span>
                    <span><strong>{col.total_books}</strong> Chapters</span>
                  </div>
                  {summary && (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                      SHA-256: {summary.datasetChecksum.slice(0, 16)}...
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
