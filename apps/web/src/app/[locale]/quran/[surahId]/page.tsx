/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Surah Reading View with verified translations, RTL typography,
 *              cryptographic provenance badges, and bookmark integration.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getSurahById,
  getAyahsBySurahId,
  AVAILABLE_TRANSLATIONS,
  getTranslationsForSurah
} from '@/lib/quran';
import { BookmarkButton } from '@/components/BookmarkButton';
import { AudioPlayer } from '@/components/AudioPlayer';
import { AyahPlayButton } from '@/components/AyahPlayButton';
import { TafsirButton } from '@/components/TafsirButton';
import { AudioService } from '@islamic/database';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import type { Metadata } from 'next';
import {
  buildSurahMetadata,
  JsonLd,
  createBreadcrumbSchema,
  createScriptureSchema
} from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string; surahId: string }>;
  searchParams: Promise<{ trans?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, surahId } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  const id = parseInt(surahId, 10);
  const surah = getSurahById(id);

  if (!surah || !isSupportedLocale(locale)) {
    return { title: 'Surah Not Found | ISLAM UL HARAMAIN' };
  }

  return buildSurahMetadata(surah, typedLocale);
}

export default async function LocalizedSurahDetailPage({ params, searchParams }: PageProps) {
  const { locale, surahId } = await params;
  const { trans } = await searchParams;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  const id = parseInt(surahId, 10);
  if (isNaN(id) || id < 1 || id > 114) {
    notFound();
  }

  const surah = getSurahById(id);
  if (!surah) {
    notFound();
  }

  const ayahs = getAyahsBySurahId(id);

  // Active translation selection: default based on active locale
  let defaultTrans = 'en.sahih';
  if (typedLocale === 'ur') defaultTrans = 'ur.jalandhry';
  if (typedLocale === 'ar') defaultTrans = 'none';

  const activeTransId = trans === undefined ? (defaultTrans === 'none' ? null : defaultTrans) : (trans === 'none' ? null : trans);
  const activeTranslationInfo = AVAILABLE_TRANSLATIONS.find((t) => t.id === activeTransId);
  const translationsMap = activeTransId ? getTranslationsForSurah(activeTransId, id) : new Map<number, string>();

  // Audio Streaming Catalog & Track
  const audioService = new AudioService();
  const reciters = await audioService.listReciters();
  const initialTrack = await audioService.getSurahTrack('alafasy', id);

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.nav.quran, path: '/quran' },
            {
              name: `Surah ${surah.id}: ${surah.nameTransliteration} (${surah.nameArabic})`,
              path: `/quran/${surah.id}`
            }
          ],
          typedLocale
        )}
      />
      <JsonLd
        data={createScriptureSchema({
          title: `Surah ${surah.nameTransliteration} (${surah.nameArabic})`,
          path: `/quran/${surah.id}`,
          locale: typedLocale,
          description: `Holy Quran Surah ${surah.nameTransliteration} with ${surah.ayahsCount} verses in Medina Mushaf text.`,
          category: 'Quran'
        })}
      />
      {/* Top Breadcrumb Navigation */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Link href={`/${typedLocale}`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.home}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <Link href={`/${typedLocale}/quran`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.quran}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ color: '#6b7280' }}>
            Surah {surah.id}: {surah.nameTransliteration} ({surah.nameArabic})
          </span>
        </div>
      </nav>

      {/* Surah Header Card */}
      <header
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '2rem',
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
                Surah #{surah.id}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                {surah.revelationType === 'meccan' ? dict.quran.revelationMakkah : dict.quran.revelationMadinah} • {surah.ayahsCount} {dict.quran.ayah}
              </span>
            </div>

            <h1
              dir="rtl"
              style={{
                fontFamily: "Amiri, 'Traditional Arabic', serif",
                fontSize: '2.4rem',
                fontWeight: 700,
                color: '#065f46',
                margin: '0.5rem 0',
                lineHeight: '1.4'
              }}
            >
              سُورَةُ {surah.nameArabic}
            </h1>

            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
              {surah.nameTransliteration} — {surah.nameEnglish}
            </div>
          </div>

          {/* Translation Selector Pill Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              {dict.quran.translation}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {AVAILABLE_TRANSLATIONS.map((t) => {
                const isActive = activeTransId === t.id;
                return (
                  <Link
                    key={t.id}
                    href={`/${typedLocale}/quran/${surah.id}?trans=${t.id}`}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      backgroundColor: isActive ? '#047857' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                      border: `1px solid ${isActive ? '#047857' : '#cbd5e1'}`
                    }}
                  >
                    {t.language === 'en' ? 'EN (Saheeh)' : 'UR (جالندھری)'}
                  </Link>
                );
              })}
              <Link
                href={`/${typedLocale}/quran/${surah.id}?trans=none`}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  backgroundColor: activeTransId === null ? '#047857' : '#f1f5f9',
                  color: activeTransId === null ? '#ffffff' : '#475569',
                  border: `1px solid ${activeTransId === null ? '#047857' : '#cbd5e1'}`
                }}
              >
                {dict.quran.none}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Synchronized Quran Audio Streaming Player */}
      <AudioPlayer
        surahId={id}
        surahName={surah.nameTransliteration}
        reciters={reciters}
        initialTrack={initialTrack}
        locale={typedLocale}
        dict={dict}
      />

      {/* Ayahs Stream */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {ayahs.map((ayah) => {
          const translationText = translationsMap.get(ayah.ayahNumber);
          return (
            <article
              key={ayah.ayahNumber}
              id={`ayah-${ayah.ayahNumber}`}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Ayah Header Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.2rem 0.6rem',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#334155'
                    }}
                  >
                    {surah.id}:{ayah.ayahNumber}
                  </span>
                  <AyahPlayButton
                    ayahNumber={ayah.ayahNumber}
                    label={dict.audio.play}
                  />
                  <TafsirButton
                    surahId={surah.id}
                    ayahNumber={ayah.ayahNumber}
                    surahName={surah.nameTransliteration}
                    ayahText={ayah.textUthmani}
                    locale={typedLocale}
                    label={dict.tafsir.openTafsir}
                    dict={dict}
                  />
                  <BookmarkButton
                    contentType="quran"
                    contentReference={`${surah.id}:${ayah.ayahNumber}`}
                    compact={true}
                  />
                </div>

                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {dict.quran.juz} {ayah.juzNumber} • {dict.quran.page} {ayah.pageNumber}
                </span>
              </div>

              {/* Canonical Uthmani Arabic Text */}
              <div
                dir="rtl"
                className="font-quran"
                style={{
                  fontSize: '1.85rem',
                  lineHeight: '2.5',
                  color: '#0f172a',
                  textAlign: 'right',
                  marginBottom: translationText ? '1.25rem' : '0'
                }}
              >
                {ayah.textUthmani}
              </div>

              {/* Verified Translation Text if active */}
              {translationText && (
                <div
                  dir={activeTranslationInfo?.language === 'ur' ? 'rtl' : 'ltr'}
                  className={activeTranslationInfo?.language === 'ur' ? 'font-urdu' : 'font-latin'}
                  style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '1.05rem',
                    color: '#334155',
                    lineHeight: '1.8'
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {activeTranslationInfo?.name}
                  </div>
                  {translationText}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Bottom Navigation */}
      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          href={`/${typedLocale}/quran`}
          style={{ color: '#047857', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
        >
          ← {dict.quran.title}
        </Link>
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          ISLAM UL HARAMAIN — {dict.common.platformNameArabic}
        </span>
      </footer>
    </div>
  );
}
