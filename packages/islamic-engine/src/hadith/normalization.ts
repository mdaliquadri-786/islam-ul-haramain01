/**
 * @file normalization.ts
 * @package @islamic/islamic-engine
 * @description Search normalization for Hadith Arabic texts and matn.
 *
 * SAFETY RULE:
 * This normalization is strictly derived and isolated into `matn_clean`.
 * It is NEVER substituted for canonical `matn_arabic`.
 */

import { normalizeArabicForSearch } from '../quran/normalization.js';

/**
 * Normalizes Hadith Arabic text for diacritic-tolerant full-text search.
 *
 * @param text The verbatim Arabic text.
 * @returns Cleaned Arabic text without tashkeel, tatweel, and with normalized orthography.
 */
export function normalizeHadithSearchText(text: string): string {
  return normalizeArabicForSearch(text);
}
