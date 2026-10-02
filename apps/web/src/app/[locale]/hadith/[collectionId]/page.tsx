/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Hadith Narration Viewer with distinct Sanad, Matn,
 *              translations, authenticated scholar gradings, and bookmark integration.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getHadithCollectionById,
  getHadithNarrations,
  getHadithGradings,
  getScholarsMap
} from '@/lib/hadith';
import { BookmarkButton } from '@/components/BookmarkButton';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import type { Metadata } from 'next';
import {
  buildHadithCollectionMetadata,
  JsonLd,
  createBreadcrumbSchema,
  createScriptureSchema
} from '@/lib/seo';

interface PageProps {
  params: Promise<{
    locale: string;
    collectionId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, collectionId } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  const col = getHadithCollectionById(collectionId);
  if (!col || !isSupportedLocale(locale)) return { title: 'Collection Not Found' };

  return buildHadithCollectionMetadata(col, typedLocale);
}

export default async function LocalizedHadithCollectionDetailPage({ params }: PageProps) {
  const { locale, collectionId } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  const col = getHadithCollectionById(collectionId);
  if (!col) {
    notFound();
  }

  const narrations = getHadithNarrations(collectionId);
  const gradings = getHadithGradings(collectionId);
  const scholarsMap = getScholarsMap();
  const author = scholarsMap.get(col.author_id);

  // Group gradings by hadith_id
  const gradingsByHadithId = new Map<number, typeof gradings>();
  for (const g of gradings) {
    const list = gradingsByHadithId.get(g.hadith_id) || [];
    list.push(g);
    gradingsByHadithId.set(g.hadith_id, list);
  }

  function getGradeBadgeStyle(level: string) {
    switch (level) {
      case 'sahih':
        return { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' };
      case 'hasan':
        return { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' };
      case 'daif':
        return { bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
    }
  }

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.hadith.title, path: '/hadith' },
            { name: col.name_english, path: `/hadith/${col.id}` }
          ],
          typedLocale
        )}
      />
      <JsonLd
        data={createScriptureSchema({
          title: `${col.name_english} (${col.name_arabic})`,
          path: `/hadith/${col.id}`,
          locale: typedLocale,
          description: `Verified narrations from ${col.name_english} with Sanad/Matn separation and authenticated multi-scholar gradings.`,
          category: 'Hadith'
        })}
      />
      {/* Top Breadcrumb Navigation */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Link href={`/${typedLocale}`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.home}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <Link href={`/${typedLocale}/hadith`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.hadith}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ color: '#6b7280' }}>{col.name_english}</span>
        </div>
      </nav>

      {/* Collection Header Card */}
      <header
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.375rem'
                }}
              >
                {col.id.toUpperCase()}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Canonical Kutub al-Sittah
              </span>
            </div>

            <h1
              dir="rtl"
              style={{
                fontFamily: "Amiri, 'Traditional Arabic', serif",
                fontSize: '2.2rem',
                fontWeight: 700,
                color: '#065f46',
                margin: '0.5rem 0',
                lineHeight: '1.4'
              }}
            >
              {col.name_arabic}
            </h1>

            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              {col.name_english}
            </div>

            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              Compiler: <strong>{author?.name_english}</strong> (d. {author?.death_year_ah} AH)
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.35rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #a7f3d0'
              }}
            >
              {narrations.length} Benchmark Narrations
            </span>
          </div>
        </div>
      </header>

      {/* Narrations List */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {narrations.map((narration) => {
          const narrationGradings = gradingsByHadithId.get(narration.id || 0) || [];
          return (
            <article
              key={narration.id || narration.hadith_number}
              id={`hadith-${narration.hadith_number}`}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
              }}
            >
              {/* Narration Header Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>
                    Hadith #{narration.hadith_number}
                  </span>
                  <span style={{ color: '#9ca3af' }}>•</span>
                  <span style={{ color: '#6b7280' }}>
                    {dict.hadith.reference} {narration.in_book_reference || narration.international_number || narration.hadith_number}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookmarkButton
                    contentType="hadith"
                    contentReference={`${col.id} ${narration.hadith_number}`}
                    compact={true}
                  />
                </div>
              </div>

              {/* Sanad / Isnad Section (if present) */}
              {narration.sanad_arabic && (
                <div
                  dir="rtl"
                  style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: '#fbfcfd',
                    borderBottom: '1px dashed #e5e7eb',
                    fontFamily: "Amiri, 'Traditional Arabic', serif",
                    fontSize: '1.25rem',
                    lineHeight: '2.2',
                    color: '#64748b',
                    textAlign: 'right'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {dict.hadith.isnad}
                  </div>
                  {narration.sanad_arabic}
                </div>
              )}

              {/* Matn Section (Arabic Text) */}
              <div
                dir="rtl"
                className="font-quran"
                style={{
                  padding: '1.5rem',
                  fontSize: '1.6rem',
                  lineHeight: '2.4',
                  color: '#0f172a',
                  textAlign: 'right',
                  whiteSpace: 'pre-line'
                }}
              >
                {narration.matn_arabic}
              </div>

              {/* English Translation */}
              {narration.translation_english && (
                <div
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderTop: '1px solid #f3f4f6',
                    color: '#334155',
                    fontSize: '1rem',
                    lineHeight: '1.7'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    English Translation (Darussalam)
                  </div>
                  {narration.translation_english}
                </div>
              )}

              {/* Multi-Scholar Gradings Footer */}
              {narrationGradings.length > 0 && (
                <div
                  style={{
                    padding: '0.85rem 1.5rem',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    alignItems: 'center',
                    fontSize: '0.8rem'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#64748b' }}>{dict.hadith.grade}:</span>
                  {narrationGradings.map((g, idx) => {
                    const badge = getGradeBadgeStyle(g.grade_level);
                    const scholar = scholarsMap.get(g.scholar_id);
                    return (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontWeight: 600
                        }}
                      >
                        ✓ {g.grade} ({scholar ? scholar.name_english : g.scholar_id})
                      </span>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Bottom Navigation */}
      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          href={`/${typedLocale}/hadith`}
          style={{ color: '#047857', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
        >
          ← {dict.hadith.title}
        </Link>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          ISLAM UL HARAMAIN — {dict.common.platformNameArabic}
        </span>
      </footer>
    </div>
  );
}
