'use client';

/**
 * @file NavigationHeader.tsx
 * @package @islamic/web
 * @description Translucent Apple-inspired glass header with refined SVG iconography,
 *              tactile interaction states, brand crest, and mobile navigation drawer.
 * Milestone: M3.4 / Web UI Renaissance
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getDictionary, type Locale } from '@islamic/ui';
import {
  QuranIcon,
  HadithIcon,
  DuasIcon,
  MosqueIcon,
  BooksIcon,
  SearchIcon,
  BookmarkIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  StarEightPointIcon
} from './Icons';

interface NavigationHeaderProps {
  locale: Locale;
}

export function NavigationHeader({ locale }: NavigationHeaderProps) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}/quran`, label: dict.nav.quran, icon: QuranIcon },
    { href: `/${locale}/hadith`, label: dict.nav.hadith, icon: HadithIcon },
    { href: `/${locale}/duas`, label: dict.nav.duas, icon: DuasIcon },
    { href: `/${locale}/prayer-times`, label: dict.nav.prayerTimes, icon: MosqueIcon },
    { href: `/${locale}/articles`, label: dict.nav.articles, icon: BooksIcon },
    { href: `/${locale}/search`, label: dict.nav.search, icon: SearchIcon },
  ];

  return (
    <header className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            gap: '0.75rem',
            userSelect: 'none'
          }}
          aria-label={dict.common.platformName}
        >
          {/* Sacred Eight-Pointed Star Crest */}
          <div
            style={{
              position: 'relative',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #022c22 100%)',
              boxShadow: '0 2px 8px rgba(4, 120, 87, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff'
            }}
          >
            <StarEightPointIcon
              size={32}
              style={{
                position: 'absolute',
                color: 'rgba(251, 191, 36, 0.25)',
                strokeWidth: 1.2
              }}
            />
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#fef3c7',
                fontFamily: "Amiri, 'Traditional Arabic', serif",
                zIndex: 1,
                lineHeight: 1
              }}
            >
              ح
            </span>
          </div>

          <div>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#064e3b',
                lineHeight: 1.15,
                letterSpacing: '-0.01em'
              }}
            >
              {dict.common.platformName}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#059669',
                fontFamily: "Amiri, 'Traditional Arabic', serif",
                fontWeight: 700
              }}
            >
              {dict.common.platformNameArabic}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.35rem',
            margin: '0 auto'
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  padding: '0.45rem 0.8rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#064e3b' : '#334155',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{ color: isActive ? '#059669' : '#64748b' }}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right-Side Utility Actions (Language Switcher, Library, Search Trigger, Mobile Hamburger) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          {/* Quick Search Shortcut Capsule (Desktop) */}
          <Link
            href={`/${locale}/search`}
            className="btn-glass"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              display: 'none',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '9999px',
              textDecoration: 'none'
            }}
            aria-label={dict.common.search}
          >
            <SearchIcon size={14} style={{ color: '#059669' }} />
            <span style={{ color: '#64748b' }}>{dict.common.search}</span>
            <kbd
              style={{
                fontSize: '0.7rem',
                backgroundColor: 'rgba(0, 0, 0, 0.06)',
                padding: '0.1rem 0.35rem',
                borderRadius: '0.25rem',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: '#64748b'
              }}
            >
              ⌘K
            </kbd>
          </Link>

          {/* Language Switcher */}
          <LanguageSwitcher currentLocale={locale} compact={true} />

          {/* User Library Quick Access */}
          <Link
            href={`/${locale}/library`}
            style={{
              padding: '0.45rem 0.8rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#047857',
              backgroundColor: 'rgba(236, 253, 245, 0.9)',
              border: '1px solid rgba(167, 243, 208, 0.8)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
            aria-label={dict.nav.library}
          >
            <BookmarkIcon size={15} strokeWidth={2} />
            <span className="library-label">{dict.nav.library}</span>
          </Link>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="mobile-menu-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.45rem',
              backgroundColor: 'rgba(241, 245, 249, 0.8)',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            {mobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Expandable) */}
      {mobileMenuOpen && (
        <div
          className="animate-fade-in"
          style={{
            borderTop: '1px solid rgba(226, 232, 240, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '1rem 1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#047857' : '#1e293b',
                  backgroundColor: isActive ? '#ecfdf5' : '#f8fafc',
                  border: isActive ? '1px solid #a7f3d0' : '1px solid #f1f5f9',
                  borderRadius: '0.625rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <Icon size={18} strokeWidth={2} style={{ color: isActive ? '#059669' : '#64748b' }} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div
            style={{
              paddingTop: '0.75rem',
              marginTop: '0.25rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <Link
              href={`/${locale}/profile`}
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.6rem' }}
            >
              <UserIcon size={16} />
              <span>{dict.nav.profile}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Inline Responsive Media Query Styles for Desktop/Mobile Display */}
      <style jsx>{`
        @media (min-width: 900px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .library-label {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
