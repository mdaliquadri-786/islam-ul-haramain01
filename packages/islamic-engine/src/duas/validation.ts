/**
 * @file validation.ts
 * @package @islamic/islamic-engine
 * @description Ingestion and structural dataset validator for Duas & Adhkar,
 *              categories, citations, repetition targets, and cryptographic checksums.
 */

import { calculateDuaChecksum, calculateDuaDatasetChecksum } from './checksum.js';
import type {
  DuaSource,
  DuaCategory,
  DuaAdhkar,
  DuaValidationIssue,
  DuaValidationResult
} from './types.js';

export interface ValidateDuaOptions {
  checkChecksums?: boolean;
  checkEncoding?: boolean;
  minDuas?: number;
}

/**
 * Validates a complete Duas & Adhkar dataset for structural consistency,
 * cryptographic integrity, category foreign keys, citation validity, and encoding correctness.
 *
 * @param duas Array of DuaAdhkar records.
 * @param categories Optional array of DuaCategory records to validate against.
 * @param sources Optional array of DuaSource records to validate against.
 * @param options Validation options.
 * @returns Comprehensive DuaValidationResult.
 */
export function validateDuaDataset(
  duas: DuaAdhkar[],
  categories?: DuaCategory[],
  sources?: DuaSource[],
  options: ValidateDuaOptions = {}
): DuaValidationResult {
  const issues: DuaValidationIssue[] = [];
  const checkChecksums = options.checkChecksums !== false;
  const checkEncoding = options.checkEncoding !== false;

  // 1. Minimum count check
  if (options.minDuas !== undefined && duas.length < options.minDuas) {
    issues.push({
      duaId: 'corpus',
      categoryId: 0,
      itemNumber: 0,
      code: 'COUNT_BELOW_MINIMUM',
      message: `Expected at least ${options.minDuas} duas, got ${duas.length}`
    });
  }

  // 2. Category lookup set
  const categoryIds = new Set<number>();
  const categorySlugs = new Set<string>();
  if (categories && categories.length > 0) {
    for (const c of categories) {
      if (!c.id || c.id <= 0) {
        issues.push({
          duaId: 'category',
          categoryId: c.id,
          itemNumber: 0,
          code: 'INVALID_CATEGORY_ID',
          message: `Category has invalid ID: ${c.id}`
        });
      }
      if (!c.slug || c.slug.trim().length === 0) {
        issues.push({
          duaId: 'category',
          categoryId: c.id,
          itemNumber: 0,
          code: 'INVALID_CATEGORY_SLUG',
          message: `Category ID ${c.id} has empty slug`
        });
      }
      categoryIds.add(c.id);
      categorySlugs.add(c.slug);
    }
  }

  // 3. Source lookup set
  const sourceIds = new Set<string>();
  if (sources && sources.length > 0) {
    for (const s of sources) {
      if (!s.id || s.id.trim().length === 0) {
        issues.push({
          duaId: 'source',
          categoryId: 0,
          itemNumber: 0,
          code: 'INVALID_SOURCE_ID',
          message: 'Source has empty ID'
        });
      }
      sourceIds.add(s.id);
    }
  }

  // 4. Duplicate ID check
  const seenDuaIds = new Set<string>();
  const seenItemNumbers = new Set<number>();

  for (const d of duas) {
    // ID checks
    if (!d.id || d.id.trim().length === 0) {
      issues.push({
        duaId: 'empty',
        categoryId: d.categoryId,
        itemNumber: d.itemNumber,
        code: 'MISSING_DUA_ID',
        message: 'Dua record missing ID'
      });
    } else if (seenDuaIds.has(d.id)) {
      issues.push({
        duaId: d.id,
        categoryId: d.categoryId,
        itemNumber: d.itemNumber,
        code: 'DUPLICATE_DUA_ID',
        message: `Duplicate Dua ID encountered: ${d.id}`
      });
    }
    seenDuaIds.add(d.id);

    // Item number checks
    if (!d.itemNumber || d.itemNumber <= 0) {
      issues.push({
        duaId: d.id,
        categoryId: d.categoryId,
        itemNumber: d.itemNumber,
        code: 'INVALID_ITEM_NUMBER',
        message: `Invalid item number: ${d.itemNumber}`
      });
    } else if (seenItemNumbers.has(d.itemNumber)) {
      issues.push({
        duaId: d.id,
        categoryId: d.categoryId,
        itemNumber: d.itemNumber,
        code: 'DUPLICATE_ITEM_NUMBER',
        message: `Duplicate item number encountered: ${d.itemNumber}`
      });
    }
    seenItemNumbers.add(d.itemNumber);

    // Category FK checks
    if (categories && categories.length > 0) {
      if (!categoryIds.has(d.categoryId)) {
        issues.push({
          duaId: d.id,
          categoryId: d.categoryId,
          itemNumber: d.itemNumber,
          code: 'ORPHAN_CATEGORY_ID',
          message: `Dua ${d.id} references non-existent categoryId: ${d.categoryId}`
        });
      }
      if (!categorySlugs.has(d.categorySlug)) {
        issues.push({
          duaId: d.id,
          categoryId: d.categoryId,
          itemNumber: d.itemNumber,
          code: 'ORPHAN_CATEGORY_SLUG',
          message: `Dua ${d.id} references non-existent categorySlug: ${d.categorySlug}`
        });
      }
    }

    // Source FK checks
    if (sources && sources.length > 0 && !sourceIds.has(d.sourceId)) {
      issues.push({
        duaId: d.id,
        categoryId: d.categoryId,
        itemNumber: d.itemNumber,
        code: 'ORPHAN_SOURCE_ID',
        message: `Dua ${d.id} references non-existent sourceId: ${d.sourceId}`
      });
    }

    // Arabic text checks
    if (!d.arabicText || d.arabicText.trim().length === 0) {
      issues.push({
        duaId: d.id,
        categoryId: d.categoryId,
        itemNumber: d.itemNumber,
        code: 'MISSING_ARABIC_TEXT',
        message: `Dua ${d.id} has empty Arabic text`
      });
    }

    // English translation checks
    if (!d.translationEnglish || d.translationEnglish.trim().length === 0) {
      issues.push({
        duaId: d.id,
        categoryId: d.categoryId,
        itemNumber: d.itemNumber,
        code: 'MISSING_ENGLISH_TRANSLATION',
        message: `Dua ${d.id} has empty English translation`
      });
    }

    // Repetition count check
    if (d.repeatCount === undefined || d.repeatCount < 1) {
      issues.push({
        duaId: d.id,
        categoryId: d.categoryId,
        itemNumber: d.itemNumber,
        code: 'INVALID_REPEAT_COUNT',
        message: `Dua ${d.id} has invalid repeat count: ${d.repeatCount}. Must be >= 1`
      });
    }

    // Quran citation validation
    if (d.quranSurah !== null) {
      if (d.quranSurah < 1 || d.quranSurah > 114) {
        issues.push({
          duaId: d.id,
          categoryId: d.categoryId,
          itemNumber: d.itemNumber,
          code: 'INVALID_QURAN_SURAH',
          message: `Dua ${d.id} has invalid Quran surah: ${d.quranSurah}`
        });
      }
    }

    // Checksum verification
    if (checkChecksums && d.arabicText && d.arabicText.trim().length > 0) {
      const computed = calculateDuaChecksum(d.arabicText);
      if (computed !== d.textChecksum.toLowerCase()) {
        issues.push({
          duaId: d.id,
          categoryId: d.categoryId,
          itemNumber: d.itemNumber,
          code: 'CHECKSUM_MISMATCH',
          message: `Dua ${d.id} checksum mismatch! Stored: ${d.textChecksum}, Computed: ${computed}`
        });
      }
    }

    // Encoding verification (no replacement chars U+FFFD)
    if (checkEncoding) {
      if (d.arabicText.includes('\uFFFD')) {
        issues.push({
          duaId: d.id,
          categoryId: d.categoryId,
          itemNumber: d.itemNumber,
          code: 'ENCODING_ERROR_ARABIC',
          message: `Dua ${d.id} contains Unicode replacement character (U+FFFD) in Arabic text`
        });
      }
      if (d.transliteration && d.transliteration.includes('\uFFFD')) {
        issues.push({
          duaId: d.id,
          categoryId: d.categoryId,
          itemNumber: d.itemNumber,
          code: 'ENCODING_ERROR_TRANSLITERATION',
          message: `Dua ${d.id} contains Unicode replacement character (U+FFFD) in transliteration`
        });
      }
      if (d.translationEnglish && d.translationEnglish.includes('\uFFFD')) {
        issues.push({
          duaId: d.id,
          categoryId: d.categoryId,
          itemNumber: d.itemNumber,
          code: 'ENCODING_ERROR_ENGLISH',
          message: `Dua ${d.id} contains Unicode replacement character (U+FFFD) in English translation`
        });
      }
    }
  }

  const datasetChecksum = calculateDuaDatasetChecksum(duas);

  return {
    isValid: issues.length === 0,
    totalDuas: duas.length,
    totalCategories: categories ? categories.length : 0,
    issues,
    datasetChecksum
  };
}
