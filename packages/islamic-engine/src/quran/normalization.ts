/**
 * @file normalization.ts
 * @package @islamic/engine
 * @description Deterministic Arabic text normalization for full-text search indexing.
 *
 * INVIOLABLE SAFETY RULE:
 * This normalization is strictly derived and isolated into a dedicated `text_clean` field.
 * It is NEVER applied to or substituted for canonical `text_uthmani`.
 */

// Regular expressions for deterministic stripping and replacement
const QURANIC_MARKS_REGEX = /[\u0610-\u061A\u06D6-\u06ED]/gu;
const TASHKEEL_REGEX = /[\u064B-\u065F\u0670]/gu;
const TATWEEL_REGEX = /\u0640/gu;
const ALEF_VARIANTS_REGEX = /[\u0622\u0623\u0625\u0671]/gu;
const ALEF_MAKSURA_REGEX = /\u0649/gu;
const TA_MARBUTA_REGEX = /\u0629/gu;
const MULTI_SPACE_REGEX = /\s+/gu;

/**
 * Deterministically normalizes Arabic text for search and index lookups.
 *
 * Sequence of transformations:
 * 1. Strips Quranic pause marks, sajdah indicators, and liturgical symbols (U+0610-061A, U+06D6-06ED).
 * 2. Strips all diacritics / tashkeel (fathah, dammah, kasrah, tanween, sukun, shaddah, dagger alef: U+064B-065F, U+0670).
 * 3. Strips Tatweel / Kashida elongation characters (U+0640).
 * 4. Unifies Alef variants (آ, أ, إ, ٱ) into standard bare Alef (ا, U+0627).
 * 5. Normalizes Alef Maksura (ى, U+0649) to Yeh (ي, U+064A).
 * 6. Normalizes Ta Marbuta (ة, U+0629) to Ha (ه, U+0647).
 * 7. Collapses consecutive whitespace into a single space and trims edges.
 *
 * @param rawText Verbatim input Arabic text.
 * @returns Deterministic, search-normalized Arabic string.
 */
export function normalizeArabicForSearch(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  return rawText
    .replace(QURANIC_MARKS_REGEX, '')
    .replace(TASHKEEL_REGEX, '')
    .replace(TATWEEL_REGEX, '')
    .replace(ALEF_VARIANTS_REGEX, '\u0627')
    .replace(ALEF_MAKSURA_REGEX, '\u064A')
    .replace(TA_MARBUTA_REGEX, '\u0647')
    .replace(MULTI_SPACE_REGEX, ' ')
    .trim();
}
