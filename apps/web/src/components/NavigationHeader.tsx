/**
 * @file NavigationHeader.tsx
 * @package @islamic/web
 * @description Global responsive navigation header with localized routing,
 *              language selector, and direct links to all canonical engines.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getDictionary, type Locale } from '@islamic/ui';

interface NavigationHeaderProps {
  locale: Locale;
}

export function NavigationHeader({ locale }: NavigationHeaderProps) {
  const dict = getDictionary(locale);

  const navLinks = [
    { href: `/${locale}/quran`, label: dict.nav.quran, icon: '📖' },
    { href: `/${locale}/hadith`, label: dict.nav.hadith, icon: '📜' },
    { href: `/${locale}/duas`, label: dict.nav.duas, icon: '🤲' },
    { href: `/${locale}/prayer-times`, label: dict.nav.prayerTimes, icon: '🕌' },
    { href: `/${locale}/articles`, label: dict.nav.articles, icon: '✍️' },
    { href: `/${locale}/books`, label: dict.nav.books, icon: '📚' },
    { href: `/${locale}/search`, label: dict.nav.search, icon: '🔍' },
  ];

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        {/* Brand & Home Link */}
        <Link
          href={`/${locale}`}
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          <div
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '0.375rem',
              backgroundColor: '#047857',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem'
            }}
          >
            ح
          </div>
          <div>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#064e3b',
                lineHeight: 1.2
              }}
            >
              {dict.common.platformName}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                fontWeight: 500
              }}
            >
              {dict.common.platformNameArabic}
            </div>
          </div>
        </Link>

        {/* Primary Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            flexWrap: 'wrap'
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '0.4rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right-Side Utility Actions (Language Switcher, Library, Profile) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          {/* Language Switcher */}
          <LanguageSwitcher currentLocale={locale} compact={true} />

          {/* User Library Quick Access */}
          <Link
            href={`/${locale}/library`}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#047857',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>🔖</span>
            <span>{dict.nav.library}</span>
          </Link>

          {/* User Profile / Settings */}
          <Link
            href={`/${locale}/profile`}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#475569',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>⚙️</span>
            <span>{dict.nav.profile}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
