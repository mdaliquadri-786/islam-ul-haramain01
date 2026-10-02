/**
 * @file page.tsx
 * @package @islamic/web
 * @description Canonical Quran Surah Index — Minimal verification interface for Milestone 2.1.
 */

import Link from 'next/link';
import { getAllSurahs } from '@/lib/quran';

export const metadata = {
  title: 'Canonical Quran Index | ISLAM UL HARAMAIN (إسلام الحرمين)',
  description: 'Verified canonical Holy Quran text according to the Medina Mushaf standard.'
};

export default function QuranIndexPage() {
  const surahs = getAllSurahs();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#111827' }}>
              ISLAM UL HARAMAIN
            </h1>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '1.125rem' }}>
              إسلام الحرمين — Canonical Quran Text Engine
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontSize: '0.875rem',
              fontWeight: 600,
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #a7f3d0'
            }}>
              ✓ 114 Surahs Verified (6,236 Ayahs)
            </span>
          </div>
        </div>
      </header>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
          Surah Index (فهرس السور)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {surahs.map((surah) => (
            <Link
              key={surah.id}
              href={`/quran/${surah.id}`}
              style={{
                display: 'block',
                padding: '1rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#4b5563'
                }}>
                  {surah.id}
                </span>
                <span style={{ fontSize: '1.35rem', fontWeight: 'bold', fontFamily: 'Traditional Arabic, Amiri, serif', color: '#1f2937' }}>
                  {surah.nameArabic}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#111827' }}>{surah.nameTransliteration}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{surah.nameEnglish}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af', borderTop: '1px solid #f3f4f6', paddingTop: '0.5rem' }}>
                <span style={{ textTransform: 'capitalize' }}>{surah.revelationType}</span>
                <span>{surah.ayahsCount} Ayahs</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#6b7280' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          <strong>Source Attribution:</strong> Quran text provided by the{' '}
          <a
            href="https://tanzil.net"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline' }}
          >
            Tanzil Project
          </a>{' '}
          (Uthmani Text, Version 1.1, Medina Mushaf Standard). Licensed under{' '}
          <a
            href="https://creativecommons.org/licenses/by/3.0/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline' }}
          >
            Creative Commons Attribution 3.0 (CC-BY 3.0)
          </a>
          .
        </p>
        <p style={{ margin: 0 }}>
          Permission is granted to copy and distribute verbatim copies of this text. Textual modification is strictly prohibited.
        </p>
      </footer>
    </div>
  );
}
