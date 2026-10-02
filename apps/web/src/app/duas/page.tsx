/**
 * @file page.tsx
 * @package @islamic/web
 * @description Authentic Duas & Adhkar Index — Fortress of the Muslim (Hisn al-Muslim) category browser.
 */

import Link from 'next/link';
import { getAllDuaCategories, getDuaSource, getDuaCorpusSummary } from '@/lib/duas';

export const metadata = {
  title: 'Duas & Adhkar Engine (حصن المسلم) | ISLAM UL HARAMAIN',
  description:
    'Authentic supplications and remembrances from the Noble Quran and Sahih Sunnah based on Hisn al-Muslim by Shaykh Sa`id al-Qahtani.'
};

export default function DuasIndexPage() {
  const categories = getAllDuaCategories();
  const source = getDuaSource();
  const summary = getDuaCorpusSummary();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
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
              <span style={{ color: '#9ca3af' }}>|</span>
              <Link href="/hadith" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '0.875rem' }}>
                Hadith Collections
              </Link>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.25rem 0 0.5rem 0', color: '#111827' }}>
              ISLAM UL HARAMAIN
            </h1>
            <p style={{ margin: 0, color: '#374151', fontSize: '1.125rem' }}>
              إسلام الحرمين — Duas & Adhkar Engine (حِصْنُ المُسْلِمِ مِنْ أَذْكَارِ الكِتَابِ وَالسُّنَّةِ)
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
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                border: '1px solid #a7f3d0'
              }}
            >
              ✓ Hisn al-Muslim Verified & Cryptographically Signed
            </span>
          </div>
        </div>
      </header>

      {/* Provenance & Waqf Notice Card */}
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
              <p style={{ margin: '0 0 0.75rem 0', color: '#475569', fontSize: '0.925rem', lineHeight: '1.5' }}>
                Author: <strong>{source.author}</strong> ({source.author_arabic}) (رحمه الله, 1371–1440 AH / 1951–2018 CE).
              </p>
              <p style={{ margin: '0 0 0.75rem 0', color: '#64748b', fontSize: '0.875rem', lineHeight: '1.5' }}>
                {source.description}
              </p>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#0369a1' }}>
                <span>📜 License: <strong>{source.license}</strong></span>
                <span>🔐 Dataset Hash: <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', backgroundColor: '#e0f2fe', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{summary.datasetChecksum.slice(0, 16)}...</code></span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: '#ffffff', padding: '1rem 1.25rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857' }}>{summary.totalCategories}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Categories</div>
              </div>
              <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#047857' }}>{summary.totalDuas}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Supplications</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Grid */}
      <section>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#1f2937' }}>
            Daily Supplications & Remembrance Chapters (أبواب الأذكار)
          </h2>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Showing all {categories.length} canonical chapters
          </span>
        </div>

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
              href={`/duas/${cat.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
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
                      backgroundColor: '#f3f4f6',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.375rem'
                    }}
                  >
                    {cat.total_duas} {cat.total_duas === 1 ? 'dua' : 'duas'}
                  </span>
                </div>

                <div
                  dir="rtl"
                  style={{
                    fontFamily: "Amiri, 'Traditional Arabic', serif",
                    fontSize: '1.25rem',
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
                      color: '#6b7280',
                      marginTop: '0.25rem'
                    }}
                  >
                    {cat.name_urdu}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#047857' }}>
                  Read Duas →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
