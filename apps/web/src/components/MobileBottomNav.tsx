'use client';

/**
 * @file MobileBottomNav.tsx
 * @package @islamic/web
 * @description Apple-style floating translucent bottom dock for mobile viewports.
 *              Provides one-thumb navigation to primary spiritual and scholarly modules.
 * Milestone: M3.4 / Web UI Renaissance
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@islamic/ui';
import {
  MosqueIcon,
  QuranIcon,
  HadithIcon,
  DuasIcon,
  ClockIcon,
  BookmarkIcon
} from './Icons';

interface MobileBottomNavProps {
  locale: Locale;
}

export function MobileBottomNav({ locale }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}`, label: 'Home', icon: MosqueIcon, exact: true },
    { href: `/${locale}/quran`, label: 'Quran', icon: QuranIcon },
    { href: `/${locale}/hadith`, label: 'Hadith', icon: HadithIcon },
    { href: `/${locale}/duas`, label: 'Duas', icon: DuasIcon },
    { href: `/${locale}/prayer-times`, label: 'Prayer', icon: ClockIcon },
    { href: `/${locale}/library`, label: 'Saved', icon: BookmarkIcon },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="mobile-bottom-dock"
    >
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        const IconComponent = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem 0.5rem',
              borderRadius: '0.75rem',
              color: isActive ? '#34d399' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              textDecoration: 'none',
              fontSize: '0.65rem',
              fontWeight: isActive ? 700 : 500,
              gap: '0.2rem',
              minWidth: '3.2rem',
              transition: 'all 0.18s ease-in-out'
            }}
          >
            <IconComponent
              size={18}
              strokeWidth={isActive ? 2.25 : 1.75}
              style={{
                filter: isActive ? 'drop-shadow(0 0 4px rgba(52, 211, 153, 0.5))' : 'none'
              }}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
