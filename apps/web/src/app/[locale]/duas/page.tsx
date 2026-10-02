/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Duas & Adhkar Index — Fortress of the Muslim (Hisn al-Muslim) category browser.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllDuaCategories, getDuaSource, getDuaCorpusSummary } from '@/lib/duas';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { buildDuasIndexMetadata, JsonLd, createBreadcrumbSchema } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildDuasIndexMetadata(typedLocale);
}

export default async function DuasIndexPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const categories = getAllDuaCategories();
  const source = getDuaSource();
  const summary = getDuaCorpusSummary();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.duas.title, path: '/duas' }
          ],
          typedLocale
        )}
      />
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#111827' }}>
              {dict.duas.title}
            </h1>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '1.05rem' }}>
              {dict.duas.subtitle}
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
              ✓ Hisn al-Muslim (حصن المسلم)
            </span>
          </div>
        </div>
      </header>

      {/* Source Provenance Card */}
      {source && (
        <section
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: '1 1 500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📖</span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  {source.name_english} ({source.name_arabic})
                </h2>
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#475569', fontSize: '0.9rem' }}>
                Author: <strong>{source.author}</strong> ({source.author_arabic}) (رحمه الله).
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#0369a1' }}>
                <span>📜 License: <strong>{source.license}</strong></span>
                <span>🔐 Dataset Hash: <code style={{ fontFamily: 'monospace' }}>{summary.datasetChecksum.slice(0, 16)}...</code></span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#047857' }}>{summary.totalCategories}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{dict.duas.chapter}</div>
              </div>
              <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#047857' }}>{summary.totalDuas}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{dict.duas.title}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${typedLocale}/duas/${cat.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#047857',
                      backgroundColor: '#ecfdf5',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #a7f3d0'
                    }}
                  >
                    #{cat.sort_order}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#4b5563',
                      backgroundColor: '#f1f5f9',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.375rem'
                    }}
                  >
                    {cat.total_duas} {dict.duas.title}
                  </span>
                </div>

                <div
                  dir="rtl"
                  style={{
                    fontFamily: "Amiri, 'Traditional Arabic', serif",
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#065f46',
                    marginBottom: '0.5rem',
                    lineHeight: '1.5'
                  }}
                >
                  {cat.name_arabic}
                </div>

                <div style={{ fontSize: '0.975rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                  {cat.name_english}
                </div>

                {cat.name_urdu && (
                  <div
                    dir="rtl"
                    style={{
                      fontFamily: "'Noto Nastaliq Urdu', serif",
                      fontSize: '0.875rem',
                      color: '#64748b',
                      marginTop: '0.25rem'
                    }}
                  >
                    {cat.name_urdu}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#047857' }}>
                  {dict.common.readMore} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
