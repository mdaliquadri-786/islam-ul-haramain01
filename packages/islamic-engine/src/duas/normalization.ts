/**
 * @file normalization.ts
 * @package @islamic/islamic-engine
 * @description Diacritic stripping and search normalization for Arabic Duas & Adhkar.
 */

/**
 * Normalizes Arabic text for diacritic-tolerant full-text and trigram search indexing.
 * Strips tashkeel (harakat), tanween, unifies alefs, removes tatweel, and collapses whitespace.
 *
 * @param text The input Arabic text with diacritics.
 * @returns Clean normalized text suitable for search indexing.
 */
export function normalizeDuaSearchText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove harakat / tashkeel & Quranic marks
    .normalize('NFC')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')   // unify alefs (أ إ آ ٱ -> ا)
    .replace(/\u0649/g, '\u064A')                         // alif maqsura (ى -> ي)
    .replace(/\u0629/g, '\u0647')                         // taa marbuta (ة -> ه)
    .replace(/\u0640/g, '')                               // remove tatweel / kashida
    .replace(/[\*\.\,\،\؛\:\؟\?\!\(\)\[\]\{\}\<\>\"\'\`]/g, ' ') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}
