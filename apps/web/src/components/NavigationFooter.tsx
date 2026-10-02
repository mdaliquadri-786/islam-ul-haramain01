/**
 * @file NavigationFooter.tsx
 * @package @islamic/web
 * @description Cinematic midnight luxury footer with Sunni creed plaque,
 *              SVG iconography, verified trust badges, and subsystem health indicators.
 * Milestone: M3.4 / Web UI Renaissance
 */

import Link from 'next/link';
import { getDictionary, type Locale, UI_PACKAGE_VERSION } from '@islamic/ui';
import { ISLAMIC_ENGINE_VERSION } from '@islamic/islamic-engine';
import { DATABASE_PACKAGE_VERSION } from '@islamic/database';
import {
  QuranIcon,
  HadithIcon,
  DuasIcon,
  MosqueIcon,
  BooksIcon,
  SearchIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  StarEightPointIcon
} from './Icons';

interface NavigationFooterProps {
  locale: Locale;
}

export function NavigationFooter({ locale }: NavigationFooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0b1120 0%, #020617 100%)',
        color: '#94a3b8',
        padding: '4rem 1.5rem 2.5rem',
        marginTop: '5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.875rem',
        position: 'relative'
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}
      >
        {/* Column 1: Identity & Doctrinal Creed Plaque */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              ح
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                {dict.common.platformName}
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#34d399',
                  fontFamily: "Amiri, 'Traditional Arabic', serif",
                  fontWeight: 700
                }}
              >
                {dict.common.platformNameArabic}
              </div>
            </div>
          </div>

          {/* Sunni Creed Sacred Plaque */}
          <div
            style={{
              padding: '1rem',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(6, 78, 59, 0.25)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
              marginTop: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <ShieldCheckIcon size={16} />
              <span>Ahlus Sunnah wal Jama&apos;ah Creed</span>
            </div>
            <p
              style={{
                fontSize: '0.825rem',
                lineHeight: '1.65',
                color: '#cbd5e1',
                margin: 0
              }}
            >
              {dict.footer.creedStatement}
            </p>
          </div>
        </div>

        {/* Column 2: Canonical Sacred Engines */}
        <div>
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <StarEightPointIcon size={16} style={{ color: '#34d399' }} />
            <span>{dict.nav.quran} & {dict.nav.hadith}</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li>
              <Link href={`/${locale}/quran`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.15s ease' }}>
                <QuranIcon size={16} style={{ color: '#34d399' }} />
                <span>{dict.quran.title}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/hadith`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.15s ease' }}>
                <HadithIcon size={16} style={{ color: '#34d399' }} />
                <span>{dict.hadith.title}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/duas`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.15s ease' }}>
                <DuasIcon size={16} style={{ color: '#34d399' }} />
                <span>{dict.duas.title}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/prayer-times`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'color 0.15s ease' }}>
                <MosqueIcon size={16} style={{ color: '#34d399' }} />
                <span>{dict.prayer.nextPrayer} & {dict.prayer.qiblaBearing}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Scholarly Knowledge & Personal Tools */}
        <div>
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <BooksIcon size={16} style={{ color: '#fbbf24' }} />
            <span>{dict.nav.articles} & {dict.nav.library}</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <li>
              <Link href={`/${locale}/articles`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <BooksIcon size={16} style={{ color: '#cbd5e1' }} />
                <span>{dict.articles.title}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/search`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <SearchIcon size={16} style={{ color: '#cbd5e1' }} />
                <span>{dict.common.search}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/library`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookmarkIcon size={16} style={{ color: '#cbd5e1' }} />
                <span>{dict.library.title}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/profile`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem' }}>⚙️</span>
                <span>{dict.profile.title}</span>
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/cms`} style={{ color: '#94a3b8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheckIcon size={16} style={{ color: '#34d399' }} />
                <span>{dict.nav.cms}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Subsystem Health & Scholarly Verification */}
        <div>
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#34d399',
                display: 'inline-block',
                boxShadow: '0 0 8px #34d399'
              }}
            />
            <span>{dict.footer.status}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.375rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span>Engine:</span>
              <code style={{ color: '#34d399', fontWeight: 600 }}>v{ISLAMIC_ENGINE_VERSION}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.375rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span>Database:</span>
              <code style={{ color: '#34d399', fontWeight: 600 }}>v{DATABASE_PACKAGE_VERSION}</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.6rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '0.375rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span>UI Tokens:</span>
              <code style={{ color: '#34d399', fontWeight: 600 }}>v{UI_PACKAGE_VERSION}</code>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.5' }}>
            {dict.footer.allRightsReserved}
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.75rem',
          color: '#64748b'
        }}
      >
        <div>
          © {new Date().getFullYear()} ISLAM UL HARAMAIN (إسلام الحرمين). Verified Classical Sunni Islamic Digital Platform.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Tanzil.net Verified</span>
          <span>•</span>
          <span>Kutub al-Sittah Verified</span>
          <span>•</span>
          <span>Next.js 15 App Router</span>
        </div>
      </div>
    </footer>
  );
}
