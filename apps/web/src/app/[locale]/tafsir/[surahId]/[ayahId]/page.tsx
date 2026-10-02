/**
 * @file page.tsx
 * @package @islamic/web
 * @description Dedicated Classical Tafsir Comparative Viewer page.
 * Route: /[locale]/tafsir/[surahId]/[ayahId]
 * Shows canonical Quran ayah + comparative tafsir from Ibn Kathir and Al-Sa'di.
 *
 * CONTENT SAFETY:
 * - Canonical Quran text fetched from existing Quran data layer (never duplicated in tafsir).
 * - Tafsir comparison fetched from TafsirService (no content fabrication).
 * - Content unavailability shown honestly when text pending ingestion.
 *
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSurahById, getAyahsBySurahId } from '@/lib/quran';
import { TafsirService } from '@islamic/database';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { TafsirViewer } from '@/components/TafsirViewer';
import { BookmarkButton } from '@/components/BookmarkButton';
import type { Metadata } from 'next';
import {
  buildTafsirAyahMetadata,
  JsonLd,
  createBreadcrumbSchema,
  createScriptureSchema
} from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string; surahId: string; ayahId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, surahId, ayahId } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  const surahNum = parseInt(surahId, 10);
  const ayahNum = parseInt(ayahId, 10);
  const surah = getSurahById(surahNum);

  if (!surah || !isSupportedLocale(locale)) {
    return { title: 'Tafsir Not Found | ISLAM UL HARAMAIN' };
  }

  return buildTafsirAyahMetadata(surah, ayahNum, typedLocale);
}

export default async function TafsirAyahPage({ params }: PageProps) {
  const { locale, surahId, ayahId } = await params;

  if (!isSupportedLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  const surahNum = parseInt(surahId, 10);
  const ayahNum = parseInt(ayahId, 10);

  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) notFound();
  if (isNaN(ayahNum) || ayahNum < 1) notFound();

  const surah = getSurahById(surahNum);
  if (!surah) notFound();

  // Validate ayah number against canonical Quran data
  if (ayahNum > surah.ayahsCount) notFound();

  // Fetch canonical Quran ayah text from existing data layer
  const ayahs = getAyahsBySurahId(surahNum);
  const ayah = ayahs.find((a) => a.ayahNumber === ayahNum);
  const ayahText = ayah?.textUthmani || '';

  // Fetch tafsir comparison server-side
  const tafsirService = new TafsirService();
  const comparison = await tafsirService.compareSourcesForAyah(
    surahNum,
    ayahNum,
    ['ibn-kathir', 'al-sadi'],
    'ar'
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.nav.quran, path: '/quran' },
            { name: `Surah ${surahNum}`, path: `/quran/${surahNum}` },
            { name: `Tafsir ${surahNum}:${ayahNum}`, path: `/tafsir/${surahNum}/${ayahNum}` }
          ],
          typedLocale
        )}
      />
      <JsonLd
        data={createScriptureSchema({
          title: `Tafsir Surah ${surah.nameTransliteration} ${surahNum}:${ayahNum}`,
          path: `/tafsir/${surahNum}/${ayahNum}`,
          locale: typedLocale,
          description: `Classical comparative tafsir for Surah ${surah.nameTransliteration} Ayah ${ayahNum} — Tafsir Ibn Kathir and Tafsir Al-Sa'di.`,
          category: 'Tafsir'
        })}
      />
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
          <Link href={`/${typedLocale}`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.home}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <Link href={`/${typedLocale}/quran`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.quran}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <Link
            href={`/${typedLocale}/quran/${surahNum}`}
            style={{ color: '#047857', textDecoration: 'none' }}
          >
            Surah {surahNum}: {surah.nameTransliteration}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ color: '#6b7280' }}>
            {dict.tafsir.title} — {surahNum}:{ayahNum}
          </span>
        </div>
      </nav>

      {/* Page Header */}
      <header
        style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
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
                {dict.tafsir.title}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {surah.nameTransliteration} ({surahNum}:{ayahNum})
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
              {surah.nameArabic} — آية {ayahNum}
            </h1>
            <div style={{ fontSize: '1rem', color: '#374151' }}>
              {dict.tafsir.subtitle}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <BookmarkButton
              contentType="quran"
              contentReference={`${surahNum}:${ayahNum}`}
              compact={false}
            />
          </div>
        </div>
      </header>

      {/* Canonical Ayah Display — from existing Quran data layer */}
      {ayahText && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            {surahNum}:{ayahNum} — {surah.nameTransliteration} ({surah.nameEnglish})
          </div>
          <div
            dir="rtl"
            className="font-quran"
            style={{
              fontFamily: "Amiri, 'Traditional Arabic', serif",
              fontSize: '2rem',
              lineHeight: '2.5',
              color: '#0f172a',
              textAlign: 'right'
            }}
          >
            {ayahText}
          </div>
        </div>
      )}

      {/* Tafsir Comparative Viewer */}
      <TafsirViewer
        surahId={surahNum}
        ayahNumber={ayahNum}
        surahName={surah.nameTransliteration}
        ayahText={ayahText}
        locale={typedLocale}
        initialComparison={comparison}
        dict={dict}
      />

      {/* Navigation */}
      <footer
        style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <Link
          href={`/${typedLocale}/quran/${surahNum}`}
          style={{ color: '#047857', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
        >
          ← {surah.nameTransliteration}
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {ayahNum > 1 && (
            <Link
              href={`/${typedLocale}/tafsir/${surahNum}/${ayahNum - 1}`}
              style={{
                color: '#047857',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '0.3rem 0.6rem',
                border: '1px solid #86efac',
                borderRadius: '0.375rem'
              }}
            >
              ← {surahNum}:{ayahNum - 1}
            </Link>
          )}
          {ayahNum < surah.ayahsCount && (
            <Link
              href={`/${typedLocale}/tafsir/${surahNum}/${ayahNum + 1}`}
              style={{
                color: '#047857',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '0.3rem 0.6rem',
                border: '1px solid #86efac',
                borderRadius: '0.375rem'
              }}
            >
              {surahNum}:{ayahNum + 1} →
            </Link>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          ISLAM UL HARAMAIN — {dict.common.platformNameArabic}
        </span>
      </footer>
    </div>
  );
}
