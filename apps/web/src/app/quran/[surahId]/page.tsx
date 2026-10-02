/**
 * @file page.tsx
 * @package @islamic/web
 * @description Canonical Surah Reading View with Verified Human Translations (Milestone 2.2).
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getSurahById,
  getAyahsBySurahId,
  AVAILABLE_TRANSLATIONS,
  getTranslationsForSurah,
  loadTranslationDataset
} from '@/lib/quran';
import { BookmarkButton } from '@/components/BookmarkButton';

interface PageProps {
  params: Promise<{ surahId: string }>;
  searchParams: Promise<{ trans?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { surahId } = await params;
  const id = parseInt(surahId, 10);
  const surah = getSurahById(id);

  if (!surah) {
    return { title: 'Surah Not Found | ISLAM UL HARAMAIN' };
  }

  return {
    title: `Surah ${surah.nameTransliteration} (${surah.nameArabic}) | ISLAM UL HARAMAIN`,
    description: `Canonical Uthmani Arabic text and verified translations for Surah ${surah.nameTransliteration} (${surah.id}: 1-${surah.ayahsCount}).`
  };
}

export default async function SurahDetailPage({ params, searchParams }: PageProps) {
  const { surahId } = await params;
  const { trans } = await searchParams;

  const id = parseInt(surahId, 10);

  if (isNaN(id) || id < 1 || id > 114) {
    notFound();
  }

  const surah = getSurahById(id);
  if (!surah) {
    notFound();
  }

  const ayahs = getAyahsBySurahId(id);

  // Active translation selection: default to 'en.sahih' if not specified, 'none' to hide
  const activeTransId = trans === undefined ? 'en.sahih' : (trans === 'none' ? null : trans);
  const activeTranslationInfo = AVAILABLE_TRANSLATIONS.find((t) => t.id === activeTransId);
  const translationsMap = activeTransId ? getTranslationsForSurah(activeTransId, id) : new Map<number, string>();
  const activeDataset = activeTransId ? loadTranslationDataset(activeTransId) : null;

  // Determine if this Surah has an opening Bismillah presentation header
  // Surah 1: Bismillah is Ayah 1 (rendered within the Ayahs loop)
  // Surah 9 (At-Tawbah): No Bismillah
  // Surahs 2-114: Opening Bismillah header presentation
  const showBismillahHeader = id !== 1 && id !== 9;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/quran"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#2563eb',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          ← Back to Surah Index
        </Link>
      </nav>

      {/* Surah Header */}
      <header style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Surah {surah.id} • {surah.revelationType} • {surah.ayahsCount} Ayahs
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          margin: '0.5rem 0',
          fontFamily: 'Traditional Arabic, Amiri, "Scheherazade New", serif',
          color: '#111827'
        }}>
          {surah.nameArabic}
        </h1>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>
          {surah.nameTransliteration} ({surah.nameEnglish})
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
            border: '1px solid #a7f3d0'
          }}>
            Canonical Arabic Revelation • Medina Mushaf Standard
          </span>
          {activeTranslationInfo && (
            <span style={{
              display: 'inline-block',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              border: '1px solid #bfdbfe'
            }}>
              Human Translation: {activeTranslationInfo.name}
            </span>
          )}
        </div>
      </header>

      {/* Translation Selection Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
          Select Translation (Human Meaning):
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href={`/quran/${id}?trans=en.sahih`}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'none',
              backgroundColor: activeTransId === 'en.sahih' ? '#2563eb' : '#f3f4f6',
              color: activeTransId === 'en.sahih' ? '#ffffff' : '#374151'
            }}
          >
            English (Saheeh Int.)
          </Link>
          <Link
            href={`/quran/${id}?trans=ur.jalandhry`}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'none',
              backgroundColor: activeTransId === 'ur.jalandhry' ? '#2563eb' : '#f3f4f6',
              color: activeTransId === 'ur.jalandhry' ? '#ffffff' : '#374151'
            }}
          >
            اردو (جالندھری)
          </Link>
          <Link
            href={`/quran/${id}?trans=none`}
            style={{
              padding: '0.3rem 0.6rem',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'none',
              backgroundColor: activeTransId === null ? '#2563eb' : '#f3f4f6',
              color: activeTransId === null ? '#ffffff' : '#374151'
            }}
          >
            Arabic Only
          </Link>
        </div>
      </div>

      {/* Opening Bismillah Presentation Header (Surahs 2-114 except 9) */}
      {showBismillahHeader && (
        <div style={{
          textAlign: 'center',
          padding: '1.5rem',
          marginBottom: '2rem',
          backgroundColor: '#ffffff',
          border: '1px dashed #d1d5db',
          borderRadius: '0.5rem'
        }}>
          <div
            dir="rtl"
            style={{
              fontSize: '1.875rem',
              lineHeight: 1.8,
              fontFamily: 'Traditional Arabic, Amiri, "Scheherazade New", serif',
              color: '#1f2937'
            }}
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginTop: '0.5rem' }}>
            [Surah Opening Header — Distinct from Ayah numbering]
          </span>
        </div>
      )}

      {/* Canonical Ayahs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {ayahs.map((ayah) => {
          const transText = translationsMap.get(ayah.ayahNumber);
          return (
            <article
              key={ayah.id}
              style={{
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.2rem 0.6rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.375rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    {surah.id}:{ayah.ayahNumber}
                  </span>
                  <BookmarkButton
                    contentType="quran"
                    contentReference={`${surah.id}:${ayah.ayahNumber}`}
                    compact={true}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    Juz {ayah.juzNumber} • Page {ayah.pageNumber}
                  </span>
                  <span
                    title={`Source-Verbatim SHA-256: ${ayah.checksumSourceVerbatim}\nStructural Ayah SHA-256: ${ayah.checksumAyahStructural}`}
                    style={{
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      backgroundColor: '#f0fdf4',
                      color: '#15803d',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #bbf7d0'
                    }}
                  >
                    ✓ SHA-256:{ayah.checksumAyahStructural.slice(0, 8)}...
                  </span>
                </div>
              </div>

              {/* Verbatim Canonical Uthmani Arabic Text */}
              <p
                dir="rtl"
                style={{
                  fontSize: '1.75rem',
                  lineHeight: 2.2,
                  fontFamily: 'Traditional Arabic, Amiri, "Scheherazade New", serif',
                  margin: 0,
                  color: '#111827',
                  textAlign: 'right'
                }}
              >
                {ayah.textUthmani}{' '}
                <span style={{
                  display: 'inline-block',
                  fontSize: '1.1rem',
                  color: '#059669',
                  margin: '0 0.3rem',
                  userSelect: 'none'
                }}>
                  ۝{ayah.ayahNumber}
                </span>
              </p>

              {/* Human Translation Block (Clearly Separated & Styled) */}
              {transText && activeTranslationInfo && (
                <div style={{
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px dashed #e5e7eb',
                  backgroundColor: '#fafafa',
                  borderRadius: '0.375rem',
                  padding: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    <span style={{ fontWeight: 600, color: '#4b5563' }}>
                      Translation ({activeTranslationInfo.translator})
                    </span>
                    <span style={{ fontStyle: 'italic', fontSize: '0.7rem' }}>
                      Human interpretation of meaning
                    </span>
                  </div>

                  <p
                    dir={activeTranslationInfo.direction}
                    style={{
                      margin: 0,
                      fontSize: activeTranslationInfo.direction === 'rtl' ? '1.25rem' : '1.05rem',
                      lineHeight: activeTranslationInfo.direction === 'rtl' ? 2.0 : 1.6,
                      fontFamily: activeTranslationInfo.direction === 'rtl'
                        ? '"Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", serif'
                        : 'system-ui, -apple-system, sans-serif',
                      color: '#262626',
                      textAlign: activeTranslationInfo.direction === 'rtl' ? 'right' : 'left'
                    }}
                  >
                    {transText}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
        {id > 1 ? (
          <Link
            href={`/quran/${id - 1}${activeTransId ? `?trans=${activeTransId}` : '?trans=none'}`}
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
          >
            ← Previous Surah ({id - 1})
          </Link>
        ) : <div />}

        {id < 114 ? (
          <Link
            href={`/quran/${id + 1}${activeTransId ? `?trans=${activeTransId}` : '?trans=none'}`}
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
          >
            Next Surah ({id + 1}) →
          </Link>
        ) : <div />}
      </div>

      <footer style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.85rem', color: '#6b7280' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          <strong>Arabic Revelation Source:</strong> Canonical text provided by the{' '}
          <a
            href="https://tanzil.net"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline' }}
          >
            Tanzil Project
          </a>{' '}
          (Uthmani Text v1.1). Licensed under CC-BY 3.0. Zero modifications applied.
        </p>
        {activeDataset && (
          <p style={{ margin: 0 }}>
            <strong>Translation Provenance ({activeDataset.edition.title}):</strong> Translator:{' '}
            <em>{activeDataset.edition.translator}</em>. License: {activeDataset.edition.license}. Source: {activeDataset.edition.sourceName} (
            <a
              href={activeDataset.edition.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'underline' }}
            >
              tanzil.net/trans/
            </a>
            ). Dataset SHA-256:{' '}
            <code style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {activeDataset.datasetSha256.slice(0, 16)}...
            </code>
          </p>
        )}
      </footer>
    </div>
  );
}
