'use client';

/**
 * @file LanguageSwitcher.tsx
 * @package @islamic/web
 * @description Apple-inspired segmented language selector with tactile transitions,
 *              supporting English, Arabic, and Urdu with authentic native typography.
 * Milestone: M3.4 / Web UI Renaissance
 */

import { usePathname, useRouter } from 'next/navigation';
import { LOCALES, SUPPORTED_LOCALES, type Locale } from '@islamic/ui';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  compact?: boolean;
}

export function LanguageSwitcher({ currentLocale, compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLocaleChange = (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;

    // Replace the locale prefix in current pathname, or prepend target locale
    let newPath = pathname;
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as Locale)) {
      segments[0] = targetLocale;
      newPath = '/' + segments.join('/');
    } else {
      newPath = `/${targetLocale}${pathname === '/' ? '' : pathname}`;
    }

    router.push(newPath);
  };

  return (
    <div
      role="group"
      aria-label="Language Selector"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: 'rgba(241, 245, 249, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '0.25rem',
        borderRadius: '9999px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
        gap: '0.2rem'
      }}
    >
      {SUPPORTED_LOCALES.map((loc) => {
        const isSelected = loc === currentLocale;
        const info = LOCALES[loc];
        return (
          <button
            key={loc}
            type="button"
            onClick={() => handleLocaleChange(loc)}
            aria-pressed={isSelected}
            aria-label={`Switch to ${info.name} (${info.nativeName})`}
            style={{
              padding: compact ? '0.25rem 0.65rem' : '0.35rem 0.85rem',
              fontSize: compact ? '0.775rem' : '0.85rem',
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? '#ffffff' : '#475569',
              background: isSelected
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'transparent',
              border: isSelected
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid transparent',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: isSelected ? '0 2px 5px rgba(4, 120, 87, 0.25)' : 'none',
              transform: isSelected ? 'scale(1.02)' : 'none',
              transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: info.fontFamily,
              userSelect: 'none'
            }}
          >
            {info.nativeName}
          </button>
        );
      })}
    </div>
  );
}
