/**
 * @file index.ts
 * @package @islamic/ui
 * @description Internationalization (i18n) exports and dictionary resolver.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import type { Locale, Dictionary } from './types';
import { DEFAULT_LOCALE, isSupportedLocale } from './locales';
import { en } from './dictionaries/en';
import { ar } from './dictionaries/ar';
import { ur } from './dictionaries/ur';

export * from './types';
export * from './locales';
export { en, ar, ur };

const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  ar,
  ur
};

/**
 * Resolves dictionary for a locale, falling back to English if invalid.
 */
export function getDictionary(locale: string): Dictionary {
  if (isSupportedLocale(locale)) {
    return DICTIONARIES[locale];
  }
  return DICTIONARIES[DEFAULT_LOCALE];
}
