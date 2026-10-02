/**
 * @file validator.ts
 * @package @islamic/islamic-engine
 * @description Canonical reference validation for the User Library & Bookmarks system.
 * Enforces rigorous boundary checks for Quran, Hadith, Duas, and Articles.
 * Milestone: M3.3 — User Library & Bookmarks
 */

import { CANONICAL_SURAHS } from '../search/citation-router.js';
import type { BookmarkContentType, CreateBookmarkInput } from './types.js';

export interface BookmarkValidationResult {
  valid: boolean;
  errors: string[];
  normalizedReference?: string;
  parsedMetadata?: {
    surahNumber?: number;
    ayahNumber?: number;
    hadithCollection?: string;
    hadithNumber?: number;
    duaCategory?: string;
    articleId?: string;
    bookId?: string;
  };
}

const SUPPORTED_CONTENT_TYPES: readonly BookmarkContentType[] = ['quran', 'hadith', 'dua', 'article', 'book'];

const VALID_HADITH_COLLECTIONS: Record<string, string> = {
  bukhari: 'bukhari',
  muslim: 'muslim',
  abudawud: 'abudawud',
  tirmidhi: 'tirmidhi',
  nasai: 'nasai',
  ibnmajah: 'ibnmajah'
};

/**
 * Validates a user bookmark input against canonical scripture bounds and supported content types.
 */
export function validateBookmarkInput(input: CreateBookmarkInput): BookmarkValidationResult {
  const errors: string[] = [];

  // 1. Content Type Check
  if (!input.contentType || !SUPPORTED_CONTENT_TYPES.includes(input.contentType)) {
    return {
      valid: false,
      errors: [`Unsupported content type: '${input.contentType}'. Supported types: ${SUPPORTED_CONTENT_TYPES.join(', ')}.`]
    };
  }

  // 2. Reference Presence Check
  if (!input.contentReference || typeof input.contentReference !== 'string' || input.contentReference.trim().length === 0) {
    return {
      valid: false,
      errors: ['Content reference cannot be empty.']
    };
  }

  const rawRef = input.contentReference.trim();

  // 3. Domain Specific Validations
  switch (input.contentType) {
    case 'quran': {
      // Support formats: "2:255", "surah:ayah", or explicit input.surahNumber + input.ayahNumber
      let surah = input.surahNumber;
      let ayah = input.ayahNumber;

      if (!surah || !ayah) {
        const parts = rawRef.split(/[:\s,.-]/).filter(Boolean);
        if (parts.length >= 2) {
          surah = parseInt(parts[0], 10);
          ayah = parseInt(parts[1], 10);
        }
      }

      if (!surah || isNaN(surah) || !ayah || isNaN(ayah)) {
        errors.push(`Invalid Quran reference format: '${rawRef}'. Expected 'surah:ayah' (e.g. '2:255').`);
        break;
      }

      if (surah < 1 || surah > 114) {
        errors.push(`Invalid Surah number: ${surah}. Quran contains exactly 114 Surahs (1..114).`);
        break;
      }

      const surahInfo = CANONICAL_SURAHS[surah];
      if (!surahInfo || ayah < 1 || ayah > surahInfo.ayahsCount) {
        errors.push(
          `Invalid Ayah number ${ayah} for Surah ${surahInfo ? surahInfo.nameEnglish : surah}. Surah contains ${surahInfo ? surahInfo.ayahsCount : 0} Ayahs.`
        );
        break;
      }

      const normalizedReference = `${surah}:${ayah}`;
      return {
        valid: true,
        errors: [],
        normalizedReference,
        parsedMetadata: {
          surahNumber: surah,
          ayahNumber: ayah
        }
      };
    }

    case 'hadith': {
      // Support formats: "bukhari:1", "bukhari 1", or explicit collection + number
      let col = input.hadithCollection?.toLowerCase();
      let num = input.hadithNumber;

      if (!col || !num) {
        const match = rawRef.match(/^([a-z\-]+)[:\s]+(\d+)$/i);
        if (match) {
          col = match[1].toLowerCase().replace(/[^a-z]/g, '');
          num = parseInt(match[2], 10);
        }
      }

      if (!col || !VALID_HADITH_COLLECTIONS[col]) {
        errors.push(
          `Invalid or unsupported Hadith collection: '${col || rawRef}'. Supported collections: ${Object.keys(VALID_HADITH_COLLECTIONS).join(', ')}.`
        );
        break;
      }

      if (!num || isNaN(num) || num < 1) {
        errors.push(`Invalid Hadith number: '${num || rawRef}'. Must be a positive integer >= 1.`);
        break;
      }

      const normalizedReference = `${col}:${num}`;
      return {
        valid: true,
        errors: [],
        normalizedReference,
        parsedMetadata: {
          hadithCollection: col,
          hadithNumber: num
        }
      };
    }

    case 'dua': {
      // Dua reference format: category-slug or category-slug:item_index
      const cleaned = rawRef.toLowerCase().trim();
      if (cleaned.length < 2) {
        errors.push(`Invalid Dua reference: '${rawRef}'. Must specify a valid category or supplication identifier.`);
        break;
      }

      return {
        valid: true,
        errors: [],
        normalizedReference: cleaned,
        parsedMetadata: {
          duaCategory: cleaned.split(':')[0]
        }
      };
    }

    case 'article': {
      const cleaned = rawRef.trim();
      if (cleaned.length < 2) {
        errors.push(`Invalid Article reference: '${rawRef}'. Expected article UUID or slug.`);
        break;
      }

      return {
        valid: true,
        errors: [],
        normalizedReference: cleaned,
        parsedMetadata: {
          articleId: cleaned
        }
      };
    }

    case 'book': {
      const cleaned = rawRef.toLowerCase().trim();
      if (cleaned.length < 2) {
        errors.push(`Invalid Book reference: '${rawRef}'. Expected book slug (e.g. 'riyad-al-salihin') or location.`);
        break;
      }

      const bookSlug = cleaned.split(':')[0];
      return {
        valid: true,
        errors: [],
        normalizedReference: cleaned,
        parsedMetadata: {
          bookId: bookSlug
        }
      };
    }

    default:
      errors.push(`Unsupported content type '${input.contentType}'.`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
