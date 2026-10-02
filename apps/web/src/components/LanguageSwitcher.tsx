'use client';

/**
 * @file LanguageSwitcher.tsx
 * @package @islamic/web
 * @description Accessible language selector component supporting English, Arabic, and Urdu.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
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
        backgroundColor: '#f1f5f9',
        padding: '0.2rem',
        borderRadius: '0.5rem',
        border: '1px solid #e2e8f0',
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
              padding: compact ? '0.25rem 0.5rem' : '0.35rem 0.75rem',
              fontSize: compact ? '0.75rem' : '0.85rem',
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? '#ffffff' : '#475569',
              backgroundColor: isSelected ? '#047857' : 'transparent',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
              fontFamily: info.fontFamily
            }}
          >
            {info.nativeName}
          </button>
        );
      })}
    </div>
  );
}
