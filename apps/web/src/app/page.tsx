import Link from 'next/link';
import { ISLAMIC_ENGINE_VERSION } from '@islamic/islamic-engine';
import { DATABASE_PACKAGE_VERSION } from '@islamic/database';
import { UI_PACKAGE_VERSION } from '@islamic/ui';
import type { Metadata } from 'next';
import { constructPageMetadata, SITE_IDENTITY } from '@/lib/seo';

export const metadata: Metadata = constructPageMetadata({
  title: SITE_IDENTITY.defaultTitle,
  description: SITE_IDENTITY.defaultDescription,
  path: '',
  locale: 'en'
});

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', maxWidth: '850px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#111827' }}>
            ISLAM UL HARAMAIN (إسلام الحرمين)
          </h1>
          <p style={{ margin: 0, color: '#4b5563', fontSize: '1.1rem' }}>
            Comprehensive Digital Platform for Classical Islamic Knowledge
          </p>
        </div>
        <Link
          href="/library"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#047857',
            color: '#ffffff',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          🔖 My Library
        </Link>
      </header>

      <section style={{ marginBottom: '2.5rem' }}>
        <form action="/search" method="GET" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            name="q"
            placeholder="Search Quran citation (e.g. 2:255), Hadith (Bukhari 1), or text in Arabic / English / Urdu..."
            style={{
              flex: 1,
              padding: '0.85rem 1.25rem',
              fontSize: '1rem',
              border: '2px solid #059669',
              borderRadius: '0.5rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#059669',
              color: '#ffffff',
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#374151' }}>
          Core Canonical Engines & Features
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <Link
            href="/library"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: '#fdf2f8',
              border: '1px solid #fbcfe8',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#9d174d', marginBottom: '0.5rem' }}>
              Personal Library & Bookmarks →
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
              Authenticated personal repository for saving Quran Ayahs, Hadith narrations, Duas, and Articles with tags, notes, and strict source provenance.
            </p>
          </Link>

          <Link
            href="/search"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#065f46', marginBottom: '0.5rem' }}>
              Full-Text Search & Citation Router →
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
              Instant primary citation routing (&lt;10 ms SLA for 2:255, Bukhari 1, Muslim 93) & multi-lingual search across Arabic, English, and Urdu corpora.
            </p>
          </Link>

          <Link
            href="/quran"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#166534', marginBottom: '0.5rem' }}>
              Holy Quran Text Engine →
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
              114 Surahs (6,236 Ayahs) in Medina Mushaf standard with Saheeh International (English) and Fateh Muhammad Jalandhari (Urdu) translations.
            </p>
          </Link>

          <Link
            href="/hadith"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>
              Hadith Collections Engine →
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
              Kutub al-Sittah (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah) with Isnad/Matn separation, SHA-256 integrity, and multi-scholar gradings.
            </p>
          </Link>

          <Link
            href="/duas"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
              Duas & Adhkar Engine →
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
              Hisn al-Muslim (حصن المسلم) containing 132 categories and 268 authentic supplications with Arabic tashkeel, transliteration, repetition counts, and citations.
            </p>
          </Link>

          <Link
            href="/prayer-times"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem' }}>
              Prayer Times & Qibla Engine →
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
              Deterministic, sub-millisecond calculation across 7 global calculation authorities (MWL, ISNA, Umm al-Qura, Karachi, Egyptian, Diyanet, MUIS), Asr madhhabs, high-latitude adjustments, and Great-Circle Qibla compass bearing.
            </p>
          </Link>

          <Link
            href="/articles"
            style={{
              display: 'block',
              padding: '1.5rem',
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#5b21b6', marginBottom: '0.5rem' }}>
              Articles & Scholarly Research →
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
              Verified Sunni research articles with peer review workflow, author self-approval prohibition, immutable revision hashes, and primary source citation routing.
            </p>
          </Link>
        </div>
      </section>

      <section style={{ backgroundColor: '#f9fafb', padding: '1.25rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem 0', color: '#374151' }}>Platform Subsystem Status</h3>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem', color: '#4b5563' }}>
          <li>Islamic Engine: <code>{ISLAMIC_ENGINE_VERSION}</code></li>
          <li>Database Layer: <code>{DATABASE_PACKAGE_VERSION}</code></li>
          <li>UI Component Tokens: <code>{UI_PACKAGE_VERSION}</code></li>
        </ul>
      </section>
    </div>
  );
}
