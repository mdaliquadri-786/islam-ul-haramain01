/**
 * @file page.tsx
 * @package @islamic/web
 * @description Canonical Hadith Narration Viewer with distinct Sanad, Matn,
 *              English translation, and authenticated scholar gradings.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getHadithCollectionById,
  getHadithBooks,
  getHadithNarrations,
  getHadithGradings,
  getScholarsMap,
  getCollectionSummary
} from '@/lib/hadith';
import { BookmarkButton } from '@/components/BookmarkButton';

interface PageProps {
  params: Promise<{
    collectionId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { collectionId } = await params;
  const col = getHadithCollectionById(collectionId);
  if (!col) return { title: 'Collection Not Found' };

  return {
    title: `${col.name_english} (${col.name_arabic}) | ISLAM UL HARAMAIN`,
    description: `Verified narrations from ${col.name_english} with Sanad/Matn separation and authenticated multi-scholar gradings.`
  };
}

export default async function HadithCollectionDetailPage({ params }: PageProps) {
  const { collectionId } = await params;
  const col = getHadithCollectionById(collectionId);
  if (!col) {
    notFound();
  }

  const books = getHadithBooks(collectionId);
  const narrations = getHadithNarrations(collectionId);
  const gradings = getHadithGradings(collectionId);
  const scholarsMap = getScholarsMap();
  const author = scholarsMap.get(col.author_id);
  const summary = getCollectionSummary(collectionId);

  // Group gradings by hadith_id
  const gradingsByHadithId = new Map<number, typeof gradings>();
  for (const g of gradings) {
    const list = gradingsByHadithId.get(g.hadith_id) || [];
    list.push(g);
    gradingsByHadithId.set(g.hadith_id, list);
  }

  // Helper for grade level badge colors
  function getGradeBadgeStyle(level: string) {
    switch (level) {
      case 'sahih':
        return { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' };
      case 'hasan':
        return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
      case 'daif':
        return { bg: '#fffbeb', text: '#92400e', border: '#fde68a' };
      case 'mawdu':
        return { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Breadcrumb Navigation */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Link href="/" style={{ color: '#047857', textDecoration: 'none' }}>
            Home
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <Link href="/hadith" style={{ color: '#047857', textDecoration: 'none' }}>
            Hadith Collections
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ color: '#6b7280', fontWeight: 600 }}>{col.name_english}</span>
        </div>
      </nav>

      {/* Header Banner */}
      <header style={{
        marginBottom: '2.5rem',
        padding: '2rem',
        backgroundColor: '#f8fafc',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 'bold', fontFamily: 'Traditional Arabic, Amiri, serif', color: '#047857', marginBottom: '0.5rem' }}>
              {col.name_arabic}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              {col.name_english}
            </h1>
            <div style={{ fontSize: '1rem', color: '#334155', marginBottom: '0.5rem' }}>
              <strong>Compiler:</strong> {author?.name_english} ({author?.name_arabic})
              {author?.death_year_ah && ` — d. ${author.death_year_ah} AH / ${author.death_year_ce} CE`}
            </div>
            <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.9rem', maxWidth: '700px', lineHeight: '1.5' }}>
              {col.description}
            </p>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #a7f3d0'
            }}>
              ✓ {narrations.length} Narrations Loaded
            </span>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              fontSize: '0.8rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px'
            }}>
              {books.length} Books in Canon
            </span>
          </div>
        </div>

        {summary && (
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <span><strong>Edition:</strong> {col.source_edition}</span>
            <span style={{ fontFamily: 'monospace' }}>
              <strong>Dataset SHA-256:</strong> {summary.datasetChecksum}
            </span>
          </div>
        )}
      </header>

      {/* Narrations Stream */}
      <main>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: '#1e293b' }}>
            Verified Hadith Narrations (الأحاديث النبوية)
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Displaying {narrations.length} canonical records
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {narrations.map((narration) => {
            const narGradings = gradingsByHadithId.get(narration.id!) || [];

            return (
              <article
                key={narration.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                {/* Narration Metadata Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1.25rem',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: '0.825rem',
                  color: '#475569'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: '#047857',
                      color: '#ffffff',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '0.25rem'
                    }}>
                      Hadith #{narration.hadith_number}
                    </span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {narration.in_book_reference}
                    </span>
                    {narration.international_number && (
                      <span style={{ color: '#64748b' }}>
                        (Darussalam #{narration.international_number})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookmarkButton
                      contentType="hadith"
                      contentReference={`${collectionId}:${narration.hadith_number}`}
                      compact={true}
                    />
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color: '#94a3b8',
                      backgroundColor: '#ffffff',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      SHA-256: {narration.text_checksum.slice(0, 12)}...
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                  {/* Sanad Section (Chain of Transmission) */}
                  {narration.sanad_arabic && (
                    <div style={{
                      marginBottom: '1.25rem',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#f8fafc',
                      borderRadius: '0.5rem',
                      borderRight: '3px solid #cbd5e1'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        الإسناد — Chain of Transmission
                      </div>
                      <div
                        dir="rtl"
                        style={{
                          fontSize: '1.1rem',
                          fontFamily: 'Traditional Arabic, Amiri, serif',
                          color: '#475569',
                          lineHeight: '1.9'
                        }}
                      >
                        {narration.sanad_arabic}
                      </div>
                    </div>
                  )}

                  {/* Matn Section (Prophetic Text) */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div
                      dir="rtl"
                      style={{
                        fontSize: '1.45rem',
                        fontWeight: 600,
                        fontFamily: 'Traditional Arabic, Amiri, serif',
                        color: '#0f172a',
                        lineHeight: '2.2',
                        textAlign: 'right'
                      }}
                    >
                      {narration.matn_arabic}
                    </div>
                  </div>

                  {/* English Translation */}
                  {narration.translation_english && (
                    <div style={{
                      marginBottom: '1.5rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.975rem',
                      color: '#1e293b',
                      lineHeight: '1.65'
                    }}>
                      {narration.translation_english}
                    </div>
                  )}

                  {/* Scholar Authenticity Gradings */}
                  {narGradings.length > 0 && (
                    <div style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        أحكام المحدثين — Authenticity Evaluations
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {narGradings.map((g) => {
                          const scholar = scholarsMap.get(g.scholar_id);
                          const style = getGradeBadgeStyle(g.grade_level);

                          return (
                            <div
                              key={g.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.35rem 0.75rem',
                                backgroundColor: style.bg,
                                color: style.text,
                                border: `1px solid ${style.border}`,
                                borderRadius: '0.375rem',
                                fontSize: '0.8rem'
                              }}
                            >
                              <strong style={{ fontWeight: 600 }}>
                                {scholar ? scholar.name_english : 'Scholar'}:
                              </strong>
                              <span>{g.grade}</span>
                              <span style={{
                                fontFamily: 'Traditional Arabic, Amiri, serif',
                                fontSize: '0.95rem',
                                fontWeight: 'bold'
                              }}>
                                ({g.grade_arabic})
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          <strong>Verification Notice:</strong> Text presented verbatim from authoritative primary compendiums.
          Immutability is enforced via cryptographic SHA-256 digests and database trigger barriers.
        </p>
      </footer>
    </div>
  );
}
