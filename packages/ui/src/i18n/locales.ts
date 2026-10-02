/**
 * @file locales.ts
 * @package @islamic/ui
 * @description Locale constants and configuration helpers.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import type { Locale, Direction, LocaleInfo } from './types';

export const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'ar', 'ur'] as const;

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALES: Record<Locale, LocaleInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    fontFamily: "'IBM Plex Sans Arabic', 'Noto Naskh Arabic', 'Amiri', serif"
  },
  ur: {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    dir: 'rtl',
    fontFamily: "'Noto Nastaliq Urdu', 'Nafees Nastaleeq', serif"
  }
};

/**
 * Checks if a given string is a supported locale.
 */
export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * Gets reading direction for a locale ('rtl' for Arabic and Urdu, 'ltr' for English).
 */
export function getDirection(locale: Locale): Direction {
  return LOCALES[locale]?.dir ?? 'ltr';
}

/**
 * Gets typography font-family declaration for a locale.
 */
export function getFontFamilyForLocale(locale: Locale): string {
  return LOCALES[locale]?.fontFamily ?? LOCALES.en.fontFamily;
}

/**
 * Gets full configuration object for a locale.
 */
export function getLocaleInfo(locale: Locale): LocaleInfo {
  return LOCALES[locale] ?? LOCALES[DEFAULT_LOCALE];
}
