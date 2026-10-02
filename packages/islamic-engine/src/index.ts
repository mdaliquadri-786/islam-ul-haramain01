/**
 * @file index.ts
 * @package @islamic/islamic-engine
 * @description Boundary exports for the Islamic computational engine.
 */

export * from './types';
export * from './quran/types';
export * from './quran/checksum';
export * from './quran/normalization';
export * from './quran/validation';
export * from './quran/translation-types';
export * from './quran/translation-checksum';
export * from './quran/translation-validator';
export * from './hadith/types';
export * from './hadith/checksum';
export * from './hadith/normalization';
export * from './hadith/sanad-parser';
export * from './hadith/validation';
export * from './duas/types';
export * from './duas/checksum';
export * from './duas/normalization';
export * from './duas/validation';
export * from './search/types';
export * from './search/citation-router';
export * from './search/normalizer';
export * from './search/ranking';
export * from './prayer';
export * from './articles';
export * from './library';
export * from './audio';
export * from './tafsir';
export * from './books';

/**
 * Version identifier for the Islamic Engine boundary.
 */
export const ISLAMIC_ENGINE_VERSION = '0.11.0-books-ereader';
