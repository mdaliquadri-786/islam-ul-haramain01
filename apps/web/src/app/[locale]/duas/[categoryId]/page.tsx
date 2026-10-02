/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Category-specific Duas & Adhkar viewer with classical Arabic RTL typography,
 *              transliteration, English translation, repetition targets, and scholarly citations.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getDuaCategoryBySlug,
  getDuasByCategory,
  getAllDuaCategories,
  getDuaSource
} from '@/lib/duas';
import { BookmarkButton } from '@/components/BookmarkButton';
import { getDictionary, isSupportedLocale, SUPPORTED_LOCALES, type Locale } from '@islamic/ui';
import type { Metadata } from 'next';
import {
  buildDuaCategoryMetadata,
  JsonLd,
  createBreadcrumbSchema,
  createScriptureSchema
} from '@/lib/seo';

interface PageProps {
  params: Promise<{
    locale: string;
    categoryId: string;
  }>;
}

export async function generateStaticParams() {
  const categories = getAllDuaCategories();
  const params: { locale: string; categoryId: string }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const c of categories) {
      params.push({ locale, categoryId: c.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, categoryId } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  const category = getDuaCategoryBySlug(categoryId);
  if (!category || !isSupportedLocale(locale)) return { title: 'Category Not Found | ISLAM UL HARAMAIN' };

  return buildDuaCategoryMetadata(category, typedLocale);
}

export default async function LocalizedDuaCategoryDetailPage({ params }: PageProps) {
  const { locale, categoryId } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  const category = getDuaCategoryBySlug(categoryId);
  if (!category) {
    notFound();
  }

  const duas = getDuasByCategory(category.id!);
  const source = getDuaSource();

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.nav.duas, path: '/duas' },
            { name: `${category.name_english} (${category.name_arabic})`, path: `/duas/${category.slug}` }
          ],
          typedLocale
        )}
      />
      <JsonLd
        data={createScriptureSchema({
          title: `${category.name_english} (${category.name_arabic})`,
          path: `/duas/${category.slug}`,
          locale: typedLocale,
          description: `Authentic supplications for ${category.name_english} from Hisn al-Muslim.`,
          category: 'Dua'
        })}
      />
      {/* Top Breadcrumb Navigation */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Link href={`/${typedLocale}`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.home}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <Link href={`/${typedLocale}/duas`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.duas}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ color: '#6b7280' }}>{category.name_english}</span>
        </div>
      </nav>

      {/* Category Header Card */}
      <header
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: '1 1 500px' }}>
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
                {dict.duas.chapter} #{category.sort_order}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {source?.name_english || 'Hisn al-Muslim'}
              </span>
            </div>

            <h1
              dir="rtl"
              style={{
                fontFamily: "Amiri, 'Traditional Arabic', serif",
                fontSize: '2rem',
                fontWeight: 700,
                color: '#065f46',
                margin: '0.5rem 0',
                lineHeight: '1.6'
              }}
            >
              {category.name_arabic}
            </h1>

            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
              {category.name_english}
            </div>

            {category.name_urdu && (
              <div
                dir="rtl"
                style={{
                  fontFamily: "'Noto Nastaliq Urdu', serif",
                  fontSize: '1rem',
                  color: '#475569',
                  marginTop: '0.25rem'
                }}
              >
                {category.name_urdu}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #a7f3d0'
              }}
            >
              {duas.length} {dict.duas.title}
            </span>
          </div>
        </div>
      </header>

      {/* Duas List */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {duas.map((dua, index) => {
          return (
            <article
              key={dua.dua_id}
              id={dua.dua_id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}
            >
              {/* Dua Top Metadata Bar */}
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
                    Dua #{index + 1}
                  </span>
                  <span style={{ color: '#9ca3af' }}>•</span>
                  <span style={{ color: '#6b7280', fontFamily: 'monospace' }}>
                    {dua.dua_id}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '0.375rem',
                      backgroundColor: dua.repeat_count > 1 ? '#fef3c7' : '#f3f4f6',
                      color: dua.repeat_count > 1 ? '#92400e' : '#374151',
                      border: dua.repeat_count > 1 ? '1px solid #fde68a' : '1px solid #e5e7eb'
                    }}
                  >
                    🔁 {dict.duas.repeatCount}: {dua.repeat_count}x
                  </span>
                  <BookmarkButton
                    contentType="dua"
                    contentReference={dua.dua_id}
                    compact={true}
                  />
                </div>
              </div>

              {/* Context / Occasion Callout if present */}
              {dua.occasion_context && (
                <div
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f0fdf4',
                    borderBottom: '1px solid #dcfce7',
                    fontSize: '0.85rem',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span>📌 {dict.duas.occasion}:</span>
                  <span>{dua.occasion_context}</span>
                </div>
              )}

              {/* Canonical Arabic Text */}
              <div
                dir="rtl"
                className="font-quran"
                style={{
                  padding: '2rem 1.5rem',
                  fontSize: '1.65rem',
                  lineHeight: '2.4',
                  color: '#0f172a',
                  textAlign: 'right',
                  whiteSpace: 'pre-line'
                }}
              >
                {dua.arabic_text}
              </div>

              {/* Transliteration */}
              {dua.transliteration && (
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: '#fafafa',
                    borderTop: '1px solid #f3f4f6',
                    fontStyle: 'italic',
                    color: '#334155',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontStyle: 'normal', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {dict.duas.transliteration}
                  </div>
                  {dua.transliteration}
                </div>
              )}

              {/* English Translation */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderTop: '1px solid #f3f4f6',
                  color: '#1e293b',
                  fontSize: '1rem',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-line'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {dict.duas.englishTranslation}
                </div>
                {dua.translation_english}
              </div>

              {/* Citations Footer */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  fontSize: '0.825rem'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  {dua.quran_surah && (
                    <span
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #bfdbfe',
                        fontWeight: 600
                      }}
                    >
                      📖 Quran {dua.quran_surah}:{dua.quran_ayah}
                    </span>
                  )}

                  {dua.hadith_collection && (
                    <span
                      style={{
                        backgroundColor: '#f5f3ff',
                        color: '#5b21b6',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #ddd6fe',
                        fontWeight: 600,
                        textTransform: 'capitalize'
                      }}
                    >
                      📜 {dua.hadith_collection} {dua.hadith_number ? `#${dua.hadith_number}` : ''}
                    </span>
                  )}

                  {dua.hadith_grade && (
                    <span
                      style={{
                        backgroundColor: '#ecfdf5',
                        color: '#065f46',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid #a7f3d0',
                        fontWeight: 600
                      }}
                    >
                      ✓ {dua.hadith_grade}
                    </span>
                  )}
                </div>

                {dua.hadith_reference && (
                  <div style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    <strong>Reference:</strong> {dua.hadith_reference}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Bottom Category Navigation */}
      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          href={`/${typedLocale}/duas`}
          style={{ color: '#047857', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
        >
          ← {dict.duas.title}
        </Link>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          ISLAM UL HARAMAIN — {dict.common.platformNameArabic}
        </span>
      </footer>
    </div>
  );
}
