/**
 * @file normalizer.ts
 * @package @islamic/islamic-engine
 * @description Unified search query normalization for Arabic, English, and Urdu.
 * Provides deterministic diacritic stripping, character unification, and script detection.
 * Milestone: Phase 2 -> Milestone 2.5
 */

export { normalizeArabicForSearch } from '../quran/normalization.js';
import { normalizeArabicForSearch } from '../quran/normalization.js';

/**
 * Characters unique to Urdu or typical in Perso-Arabic Urdu typography:
 * ٹ (U+0679), ڈ (U+0688), ڑ (U+0691), ں (U+06BA), ے (U+06D2), ھ (U+06BE), چ (U+0686), پ (U+067E), ژ (U+0698)
 */
const URDU_CHARACTER_REGEX = /[\u0679\u0688\u0691\u06BA\u06D2\u06BE\u0686\u067E\u0698]/;

/**
 * General Arabic / Perso-Arabic Unicode block:
 * U+0600-U+06FF (Arabic), U+0750-U+077F (Arabic Supplement)
 */
const ARABIC_SCRIPT_REGEX = /[\u0600-\u06FF\u0750-\u077F]/;

/**
 * Detects the predominant script of a search query.
 */
export function detectSearchScript(query: string): 'arabic' | 'urdu' | 'english' | 'mixed' {
  const trimmed = query.trim();
  if (!trimmed) return 'english';

  const hasArabic = ARABIC_SCRIPT_REGEX.test(trimmed);
  const hasLatin = /[a-zA-Z]/.test(trimmed);
  const hasUrdu = URDU_CHARACTER_REGEX.test(trimmed);

  if (hasArabic && hasLatin) return 'mixed';
  if (hasUrdu) return 'urdu';
  if (hasArabic) return 'arabic';
  return 'english';
}

/**
 * Normalizes an English search term by lowercasing, stripping punctuation,
 * and collapsing multiple whitespace characters.
 */
export function normalizeEnglishForSearch(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[’'`"“”]/g, '')               // Strip apostrophes/quotes
    .replace(/[^a-z0-9\s]/g, ' ')           // Replace punctuation with spaces
    .replace(/\s+/g, ' ')                   // Collapse multiple spaces
    .trim();
}

/**
 * Normalizes an Urdu search term by stripping diacritics (aerab),
 * normalizing Yeh variants (e.g. Bari Yeh ے -> ی for search matching where appropriate),
 * normalizing Heh variants, and removing punctuation.
 */
export function normalizeUrduForSearch(text: string): string {
  if (!text) return '';
  return text
    // Remove Arabic/Urdu diacritics (harakat/aerab: zer, zabar, pesh, jazm, tanween)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Tatweel
    .replace(/\u0640/g, '')
    // Normalize Alef variants
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')
    // Normalize Urdu Do-Chashmi Heh / Gol Heh
    .replace(/[\u06C1\u06C2\u06C3]/g, '\u0647')
    // Normalize punctuation
    .replace(/[،؛؟۔!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Unified Search Query Normalizer.
 * Normalizes query string based on specified or automatically detected language.
 */
export function normalizeSearchQuery(query: string, lang?: 'all' | 'arabic' | 'english' | 'urdu'): string {
  if (!query) return '';

  const detected = lang && lang !== 'all' ? lang : detectSearchScript(query);

  switch (detected) {
    case 'arabic':
      return normalizeArabicForSearch(query);
    case 'urdu':
      return normalizeUrduForSearch(query);
    case 'english':
      return normalizeEnglishForSearch(query);
    case 'mixed':
    default:
      // For mixed queries, apply Arabic normalization to Arabic parts and lowercase Latin parts
      return normalizeArabicForSearch(query).toLowerCase();
  }
}

/**
 * Tokenizes a query into search keywords.
 */
export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeSearchQuery(query);
  return normalized
    .split(/\s+/)
    .filter((token) => token.length > 0);
}
