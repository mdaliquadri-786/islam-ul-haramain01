/**
 * @file page.tsx
 * @package @islamic/web
 * @description Canonical Hadith Collections Index — Kutub al-Sittah viewer interface.
 */

import Link from 'next/link';
import { getAllHadithCollections, getScholarsMap, getCollectionSummary } from '@/lib/hadith';

export const metadata = {
  title: 'Kutub al-Sittah Hadith Collections | ISLAM UL HARAMAIN (إسلام الحرمين)',
  description: 'Verified canonical Hadith compendiums with authenticated scholar gradings and cryptographic checksums.'
};

export default function HadithIndexPage() {
  const collections = getAllHadithCollections();
  const scholarsMap = getScholarsMap();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <Link href="/" style={{ color: '#047857', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                ← Platform Home
              </Link>
              <span style={{ color: '#9ca3af' }}>|</span>
              <Link href="/quran" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '0.875rem' }}>
                Quran Engine
              </Link>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.25rem 0 0.5rem 0', color: '#111827' }}>
              ISLAM UL HARAMAIN
            </h1>
            <p style={{ margin: 0, color: '#374151', fontSize: '1.125rem' }}>
              إسلام الحرمين — Canonical Hadith Collections Engine (الكتب الستة)
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.375rem 0.875rem',
              borderRadius: '9999px',
              border: '1px solid #a7f3d0'
            }}>
              ✓ Kutub al-Sittah Verified & Cryptographically Signed
            </span>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#1f2937' }}>
            The Six Canonical Books of Hadith (الكتب الستة)
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
            Preserving classical Isnad transmission, Matn integrity, and multi-scholar authenticity gradings (Al-Albani, Shu'ayb al-Arna'ut, Ahmad Shakir, Zubair Ali Zai).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {collections.map((col) => {
            const author = scholarsMap.get(col.author_id);
            const summary = getCollectionSummary(col.id);

            return (
              <Link
                key={col.id}
                href={`/hadith/${col.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Traditional Arabic, Amiri, serif', color: '#047857' }}>
                      {col.name_arabic}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                      {col.id.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: '#111827' }}>
                    {col.name_english}
                  </h3>
                  <div style={{ fontSize: '0.9rem', color: '#4b5563', fontFamily: 'Noto Nastaliq Urdu, Jameel Noori Nastaleeq, serif', marginBottom: '0.75rem' }}>
                    {col.name_urdu}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    <strong>Compiler:</strong> {author?.name_english}
                    {author?.death_year_ah && (
                      <span style={{ color: '#6b7280' }}> (d. {author.death_year_ah} AH / {author.death_year_ce} CE)</span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                    {col.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    <span>Canonical Corpus: <strong>{col.total_hadiths.toLocaleString()}</strong> Hadiths</span>
                    <span><strong>{col.total_books}</strong> Books</span>
                  </div>
                  {summary && (
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      SHA-256: {summary.datasetChecksum.slice(0, 16)}...
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#6b7280' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          <strong>Textual & Scholarly Provenance:</strong> Arabic Hadith texts represent public-domain classical Islamic heritage (3rd century AH).
          Multi-scholar gradings are attributed to their published works: Shaykh al-Albani (<em>Silsilat al-Ahadith al-Sahihah / Da'ifah</em>),
          Shaykh Shu'ayb al-Arna'ut, Shaykh Ahmad Shakir, Shaykh Zubair Ali Zai, and Darussalam Research Division.
        </p>
        <p style={{ margin: 0 }}>
          Cryptographic SHA-256 checksums are deterministically verified for every narration to guarantee verbatim textual immutability.
        </p>
      </footer>
    </div>
  );
}
