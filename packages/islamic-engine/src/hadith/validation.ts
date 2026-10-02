/**
 * @file validation.ts
 * @package @islamic/islamic-engine
 * @description Ingestion and structural dataset validator for Hadith collections,
 * books, narrations, and authenticated gradings.
 */

import { calculateHadithChecksum, calculateHadithDatasetChecksum } from './checksum.js';
import type {
  HadithBook,
  HadithCollection,
  HadithGrading,
  HadithNarration,
  HadithValidationIssue,
  HadithValidationResult,
} from './types.js';

export interface ValidateHadithOptions {
  checkChecksums?: boolean;
  checkEncoding?: boolean;
  checkSequential?: boolean;
  minHadiths?: number;
}

const VALID_GRADE_LEVELS = new Set(['sahih', 'hasan', 'daif', 'mawdu']);

/**
 * Validates a complete Hadith dataset for structural consistency, cryptographic
 * integrity, grading attribution, and encoding correctness.
 *
 * @param collection The Hadith collection metadata.
 * @param books Array of book/chapter divisions.
 * @param narrations Array of Hadith narration records.
 * @param gradings Array of scholar grading records.
 * @param options Validation options.
 * @returns Comprehensive HadithValidationResult.
 */
export function validateHadithDataset(
  collection: HadithCollection,
  books: HadithBook[],
  narrations: HadithNarration[],
  gradings: HadithGrading[] = [],
  options: ValidateHadithOptions = {}
): HadithValidationResult {
  const issues: HadithValidationIssue[] = [];
  const checkChecksums = options.checkChecksums !== false;
  const checkEncoding = options.checkEncoding !== false;

  // 1. Collection metadata validation
  if (!collection.id || collection.id.trim().length === 0) {
    issues.push({
      collectionId: collection.id || 'unknown',
      hadithNumber: 0,
      code: 'INVALID_COLLECTION_ID',
      message: 'Collection ID is missing or empty',
    });
  }

  if (!collection.nameArabic || collection.nameArabic.trim().length === 0) {
    issues.push({
      collectionId: collection.id,
      hadithNumber: 0,
      code: 'MISSING_COLLECTION_NAME_ARABIC',
      message: 'Collection Arabic name is missing',
    });
  }

  // 2. Minimum count check
  if (options.minHadiths !== undefined && narrations.length < options.minHadiths) {
    issues.push({
      collectionId: collection.id,
      hadithNumber: 0,
      code: 'COUNT_BELOW_MINIMUM',
      message: `Expected at least ${options.minHadiths} hadiths, got ${narrations.length}`,
    });
  }

  // 3. Books validation
  const bookNumbers = new Set<number>();
  for (const b of books) {
    if (b.collectionId !== collection.id) {
      issues.push({
        collectionId: collection.id,
        hadithNumber: 0,
        code: 'BOOK_COLLECTION_MISMATCH',
        message: `Book ${b.bookNumber} has collectionId ${b.collectionId}, expected ${collection.id}`,
      });
    }

    if (bookNumbers.has(b.bookNumber)) {
      issues.push({
        collectionId: collection.id,
        hadithNumber: 0,
        code: 'DUPLICATE_BOOK_NUMBER',
        message: `Duplicate book number: ${b.bookNumber}`,
      });
    }
    bookNumbers.add(b.bookNumber);
  }

  // 4. Narrations validation
  const seenHadithNumbers = new Set<number>();
  for (let i = 0; i < narrations.length; i++) {
    const h = narrations[i];

    if (h.collectionId !== collection.id) {
      issues.push({
        collectionId: h.collectionId,
        hadithNumber: h.hadithNumber,
        code: 'COLLECTION_MISMATCH',
        message: `Hadith ${h.hadithNumber} collectionId '${h.collectionId}' does not match '${collection.id}'`,
      });
    }

    if (h.hadithNumber <= 0) {
      issues.push({
        collectionId: collection.id,
        hadithNumber: h.hadithNumber,
        code: 'INVALID_HADITH_NUMBER',
        message: `Invalid hadith number: ${h.hadithNumber}`,
      });
    }

    if (seenHadithNumbers.has(h.hadithNumber)) {
      issues.push({
        collectionId: collection.id,
        hadithNumber: h.hadithNumber,
        code: 'DUPLICATE_HADITH_NUMBER',
        message: `Duplicate hadith number: ${h.hadithNumber}`,
      });
    }
    seenHadithNumbers.add(h.hadithNumber);

    // Text validation
    if (!h.matnArabic || h.matnArabic.trim().length === 0) {
      issues.push({
        collectionId: collection.id,
        hadithNumber: h.hadithNumber,
        code: 'EMPTY_MATN',
        message: `Hadith ${h.hadithNumber} has empty Arabic text`,
      });
    }

    // Encoding validation
    if (checkEncoding) {
      if (h.matnArabic && h.matnArabic.includes('\uFFFD')) {
        issues.push({
          collectionId: collection.id,
          hadithNumber: h.hadithNumber,
          code: 'UNICODE_REPLACEMENT_CHAR',
          message: `Hadith ${h.hadithNumber} contains Unicode replacement character (U+FFFD)`,
        });
      }

      if (h.translationEnglish && h.translationEnglish.includes('\uFFFD')) {
        issues.push({
          collectionId: collection.id,
          hadithNumber: h.hadithNumber,
          code: 'UNICODE_REPLACEMENT_CHAR_TRANSLATION',
          message: `Hadith ${h.hadithNumber} English translation contains Unicode replacement character (U+FFFD)`,
        });
      }
    }

    // Cryptographic checksum verification
    if (checkChecksums && h.matnArabic && h.matnArabic.trim().length > 0) {
      try {
        const computed = calculateHadithChecksum(h.matnArabic);
        if (h.textChecksum && computed !== h.textChecksum.toLowerCase()) {
          issues.push({
            collectionId: collection.id,
            hadithNumber: h.hadithNumber,
            code: 'CHECKSUM_MISMATCH',
            message: `Checksum mismatch for hadith ${h.hadithNumber}: expected ${computed}, found ${h.textChecksum}`,
          });
        }
      } catch (err: unknown) {
        issues.push({
          collectionId: collection.id,
          hadithNumber: h.hadithNumber,
          code: 'CHECKSUM_ERROR',
          message: `Failed computing checksum for hadith ${h.hadithNumber}: ${(err as Error).message}`,
        });
      }
    }
  }

  // 5. Gradings validation
  const seenGradings = new Set<string>();
  for (const g of gradings) {
    if (g.collectionId !== collection.id) {
      issues.push({
        collectionId: g.collectionId,
        hadithNumber: g.hadithNumber,
        code: 'GRADING_COLLECTION_MISMATCH',
        message: `Grading for hadith ${g.hadithNumber} has collectionId ${g.collectionId}, expected ${collection.id}`,
      });
    }

    if (!VALID_GRADE_LEVELS.has(g.gradeLevel)) {
      issues.push({
        collectionId: collection.id,
        hadithNumber: g.hadithNumber,
        code: 'INVALID_GRADE_LEVEL',
        message: `Invalid gradeLevel '${g.gradeLevel}' for hadith ${g.hadithNumber}. Must be sahih, hasan, daif, or mawdu`,
      });
    }

    if (!g.scholarId || g.scholarId.trim().length === 0) {
      issues.push({
        collectionId: collection.id,
        hadithNumber: g.hadithNumber,
        code: 'MISSING_SCHOLAR_ID',
        message: `Grading for hadith ${g.hadithNumber} missing scholarId`,
      });
    }

    const gradingKey = `${g.hadithNumber}:${g.scholarId}`;
    if (seenGradings.has(gradingKey)) {
      issues.push({
        collectionId: collection.id,
        hadithNumber: g.hadithNumber,
        code: 'DUPLICATE_SCHOLAR_GRADING',
        message: `Duplicate grading for hadith ${g.hadithNumber} from scholar ${g.scholarId}`,
      });
    }
    seenGradings.add(gradingKey);
  }

  const datasetChecksum = narrations.length > 0 ? calculateHadithDatasetChecksum(narrations) : '';

  return {
    valid: issues.length === 0,
    totalHadiths: narrations.length,
    totalBooks: books.length,
    totalGradings: gradings.length,
    datasetChecksum,
    issues,
  };
}
