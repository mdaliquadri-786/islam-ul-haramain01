/**
 * @file NavigationFooter.tsx
 * @package @islamic/web
 * @description Global responsive footer with Sunni creed commitment,
 *              canonical links, CC-BY-SA 4.0 licensing, and subsystem status.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { getDictionary, type Locale, UI_PACKAGE_VERSION } from '@islamic/ui';
import { ISLAMIC_ENGINE_VERSION } from '@islamic/islamic-engine';
import { DATABASE_PACKAGE_VERSION } from '@islamic/database';

interface NavigationFooterProps {
  locale: Locale;
}

export function NavigationFooter({ locale }: NavigationFooterProps) {
  const dict = getDictionary(locale);

  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#94a3b8',
        padding: '3rem 1.5rem 2rem',
        marginTop: '4rem',
        borderTop: '1px solid #1e293b',
        fontSize: '0.875rem'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* Column 1: Identity & Doctrinal Statement */}
        <div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.25rem'
            }}
          >
            {dict.common.platformName}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: '#10b981',
              fontWeight: 600,
              marginBottom: '0.85rem'
            }}
          >
            {dict.common.platformNameArabic}
          </div>
          <p
            style={{
              fontSize: '0.825rem',
              lineHeight: '1.6',
              color: '#cbd5e1'
            }}
          >
            {dict.footer.creedStatement}
          </p>
        </div>

        {/* Column 2: Canonical Engines */}
        <div>
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.75rem'
            }}
          >
            {dict.nav.quran} & {dict.nav.hadith}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <li>
              <Link href={`/${locale}/quran`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                📖 {dict.quran.title}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/hadith`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                📜 {dict.hadith.title}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/duas`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                🤲 {dict.duas.title}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/prayer-times`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                🕌 {dict.prayer.nextPrayer} & {dict.prayer.qiblaBearing}
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
              marginBottom: '0.75rem'
            }}
          >
            {dict.nav.articles} & {dict.nav.library}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <li>
              <Link href={`/${locale}/articles`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                ✍️ {dict.articles.title}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/search`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                🔍 {dict.common.search}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/library`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                🔖 {dict.library.title}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/profile`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                ⚙️ {dict.profile.title}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/cms`} style={{ color: '#94a3b8', textDecoration: 'none' }}>
                🛡️ {dict.nav.cms}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Subsystem Status & Licensing */}
        <div>
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '0.75rem'
            }}
          >
            {dict.footer.status}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem' }}>
            <div>Engine: <code style={{ color: '#34d399' }}>{ISLAMIC_ENGINE_VERSION}</code></div>
            <div>Database: <code style={{ color: '#34d399' }}>{DATABASE_PACKAGE_VERSION}</code></div>
            <div>UI Tokens & i18n: <code style={{ color: '#34d399' }}>{UI_PACKAGE_VERSION}</code></div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4' }}>
            {dict.footer.allRightsReserved}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid #1e293b',
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
          © {new Date().getFullYear()} ISLAM UL HARAMAIN (إسلام الحرمين). Verified Classical Sunni Islamic Platform.
        </div>
        <div>
          Web MVP v1.0.0 • Next.js 15 App Router • TypeScript
        </div>
      </div>
    </footer>
  );
}
