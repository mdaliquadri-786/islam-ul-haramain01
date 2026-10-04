/**
 * @file layout.tsx
 * @package @islamic/web
 * @description Global Public Layout (Server Component) wrapping public routes in ThemeProvider,
 *              providing a glassmorphic sticky top navigation bar (Quran, Hadith, Fiqh, Seerah, Tasawwuf),
 *              mounting the global CommandPalette (Cmd+K), and rendering an authoritative canonical footer.
 */

import React from 'react';
import Link from 'next/link';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { CommandPalette } from '@/components/CommandPalette';
import { ISLAMIC_ENGINE_VERSION } from '@islamic/islamic-engine';
import { DATABASE_PACKAGE_VERSION } from '@islamic/database';
import { UI_PACKAGE_VERSION } from '@islamic/ui';
import { ShieldCheckIcon, StarEightPointIcon } from '@/components/Icons';

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentLocale = locale || 'en';

  const navLinks = [
    { label: currentLocale === 'ar' ? 'القرآن الكريم' : 'Quran', href: `/${currentLocale}/quran`, icon: '📖' },
    { label: currentLocale === 'ar' ? 'الحديث الشريف' : 'Hadith', href: `/${currentLocale}/hadith`, icon: '📚' },
    { label: currentLocale === 'ar' ? 'الفقه المقارن' : 'Fiqh', href: `/${currentLocale}/#fiqh`, icon: '⚖️' },
    { label: currentLocale === 'ar' ? 'السيرة النبوية' : 'Seerah', href: `/${currentLocale}/seerah`, icon: '📜' },
    { label: currentLocale === 'ar' ? 'التزكية والتصوف' : 'Tasawwuf', href: `/${currentLocale}/tasawwuf`, icon: '🕊️' },
    { label: currentLocale === 'ar' ? 'حصن المسلم' : 'Duas', href: `/${currentLocale}/duas`, icon: '🤲' },
    { label: currentLocale === 'ar' ? 'مواقيت الصلاة' : 'Prayer', href: `/${currentLocale}/prayer-times`, icon: '🕌' },
  ];

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary, #030712)' }}>
        {/* 1. Glassmorphism Sticky Top Navigation Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            backgroundColor: 'rgba(3, 7, 18, 0.78)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.65rem 1.25rem',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            {/* Brand Logo & Calligraphic Seal */}
            <Link
              href={`/${currentLocale}` as any}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(5, 150, 105, 0.2)',
                  border: '1px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                }}
              >
                <ShieldCheckIcon size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.95rem', letterSpacing: '-0.02em', display: 'block' }}>
                  ISLAM UL HARAMAIN
                </strong>
                <span style={{ fontSize: '0.675rem', color: '#94a3b8', display: 'block' }}>
                  إسلام الحرمين الشريفين
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                overflowX: 'auto',
                padding: '0.2rem 0',
              }}
            >
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#cbd5e1',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Command Palette Trigger Capsule */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                <span>Search</span>
                <kbd
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                  }}
                >
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>
        </header>

        {/* 2. Main Page Content */}
        <main style={{ flex: 1 }}>{children}</main>

        {/* 3. Global Public Footer */}
        <footer
          style={{
            backgroundColor: '#020617',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '3rem 1.5rem 2.5rem',
            color: '#94a3b8',
            fontSize: '0.8rem',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.5rem',
              }}
            >
              <div style={{ maxWidth: '420px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                  <StarEightPointIcon size={20} style={{ color: '#10b981' }} />
                  <strong style={{ fontSize: '1rem' }}>ISLAM UL HARAMAIN / إسلام الحرمين</strong>
                </div>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#64748b' }}>
                  Comprehensive Sunni Islamic Platform built on the Medina Mushaf standard, Kutub al-Sittah Hadith narrations, the 4 orthodox Madhhabs, and precise astronomical prayer calculation.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Sciences</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <Link href={`/${currentLocale}/quran` as any} style={{ color: '#94a3b8', textDecoration: 'none' }}>Medina Mushaf</Link>
                    <Link href={`/${currentLocale}/hadith` as any} style={{ color: '#94a3b8', textDecoration: 'none' }}>Kutub al-Sittah</Link>
                    <Link href={`/${currentLocale}/seerah` as any} style={{ color: '#94a3b8', textDecoration: 'none' }}>Prophetic Biography</Link>
                    <Link href={`/${currentLocale}/tasawwuf` as any} style={{ color: '#94a3b8', textDecoration: 'none' }}>Spiritual Purification</Link>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Devotional</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <Link href={`/${currentLocale}/prayer-times` as any} style={{ color: '#94a3b8', textDecoration: 'none' }}>Prayer Times & Qibla</Link>
                    <Link href={`/${currentLocale}/duas` as any} style={{ color: '#94a3b8', textDecoration: 'none' }}>Hisn al-Muslim Adhkar</Link>
                    <Link href={`/${currentLocale}/library` as any} style={{ color: '#94a3b8', textDecoration: 'none' }}>Personal Bookmarks</Link>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                paddingTop: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                fontSize: '0.75rem',
              }}
            >
              <div>
                © {new Date().getFullYear()} ISLAM UL HARAMAIN. Dedicated as a perpetual Islamic educational Waqf.
              </div>
              <div style={{ color: '#64748b' }}>
                Engine v{ISLAMIC_ENGINE_VERSION} • DB v{DATABASE_PACKAGE_VERSION} • UI v{UI_PACKAGE_VERSION}
              </div>
            </div>
          </div>
        </footer>

        {/* 4. Global Cmd+K Command Palette */}
        <CommandPalette />
      </div>
    </ThemeProvider>
  );
}
