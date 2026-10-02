/**
 * @file translation-validator.ts
 * @package @islamic/islamic-engine
 * @description Comprehensive structural, textual, and referential validator for Quran translation datasets.
 */

import { QuranSurah } from './types.js';
import {
  QuranTranslationAyah,
  QuranTranslationEdition,
  TranslationValidationResult,
  TranslationValidationIssue
} from './translation-types.js';
import {
  calculateTranslationChecksum,
  calculateTranslationDatasetChecksum
} from './translation-checksum.js';

export interface TranslationValidationOptions {
  expectedSurahsCount?: number;
  expectedAyahsCount?: number;
  verifyChecksums?: boolean;
}

/**
 * Validates a complete parsed Quran translation dataset against structural rules and canonical Ayah references.
 *
 * @param edition The translation edition metadata.
 * @param ayahs Array of translated Ayahs (expected 6,236 matching Hafs Kufan convention).
 * @param referenceSurahs Canonical Surahs array (expected 114 Surahs from M2.1).
 * @param options Configurable validation options.
 * @returns TranslationValidationResult with boolean validity, issue list, and dataset hash.
 */
export function validateTranslationDataset(
  edition: QuranTranslationEdition,
  ayahs: QuranTranslationAyah[],
  referenceSurahs: QuranSurah[],
  options: TranslationValidationOptions = {}
): TranslationValidationResult {
  const expectedSurahs = options.expectedSurahsCount ?? 114;
  const expectedAyahs = options.expectedAyahsCount ?? 6236;
  const shouldVerifyChecksums = options.verifyChecksums ?? true;

  const issues: TranslationValidationIssue[] = [];

  // 1. Surah Reference Map
  const surahMap = new Map<number, QuranSurah>();
  for (const s of referenceSurahs) {
    surahMap.set(s.id, s);
  }

  if (surahMap.size !== expectedSurahs) {
    issues.push({
      severity: 'error',
      code: 'REFERENCE_SURAHS_COUNT_MISMATCH',
      message: `Reference Surahs must contain ${expectedSurahs} chapters, found ${surahMap.size}.`
    });
  }

  // 2. Global Ayahs Count Validation
  if (ayahs.length !== expectedAyahs) {
    issues.push({
      severity: 'error',
      code: 'TRANSLATION_AYAH_COUNT_MISMATCH',
      message: `Expected ${expectedAyahs} translated Ayahs for edition '${edition.id}', found ${ayahs.length}.`
    });
  }

  // 3. Sequential & Boundary Verification
  const surahAyahCounters = new Map<number, number>();
  const seenKeys = new Set<string>();
  const computedAyahChecksums: string[] = [];

  for (let idx = 0; idx < ayahs.length; idx++) {
    const ayah = ayahs[idx];
    const expectedGlobalId = idx + 1;

    // Check global Ayah ID alignment
    if (ayah.ayahId !== expectedGlobalId) {
      issues.push({
        severity: 'error',
        code: 'GLOBAL_AYAH_ID_MISMATCH',
        message: `Translated Ayah at offset ${idx} has ayahId ${ayah.ayahId}, expected ${expectedGlobalId}.`,
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.ayahNumber
      });
    }

    const refSurah = surahMap.get(ayah.surahNumber);
    if (!refSurah) {
      issues.push({
        severity: 'error',
        code: 'ORPHAN_TRANSLATION_SURAH',
        message: `Translation references invalid Surah ID ${ayah.surahNumber}.`,
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.ayahNumber
      });
      continue;
    }

    // Check Ayah continuity within Surah
    const currentAyahCount = surahAyahCounters.get(ayah.surahNumber) || 0;
    const expectedAyahNumber = currentAyahCount + 1;

    if (ayah.ayahNumber !== expectedAyahNumber) {
      issues.push({
        severity: 'error',
        code: 'AYAH_SEQUENCE_ERROR',
        message: `Surah ${ayah.surahNumber} Ayah ${ayah.ayahNumber} is out of sequence (expected ${expectedAyahNumber}).`,
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.ayahNumber
      });
    }
    surahAyahCounters.set(ayah.surahNumber, expectedAyahNumber);

    // Check duplicate mapping
    const key = `${ayah.surahNumber}:${ayah.ayahNumber}`;
    if (seenKeys.has(key)) {
      issues.push({
        severity: 'error',
        code: 'DUPLICATE_TRANSLATION_AYAH',
        message: `Duplicate translation record for ${key}.`,
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.ayahNumber
      });
    }
    seenKeys.add(key);

    // 4. Text & Unicode Integrity Validation
    if (!ayah.translationText || ayah.translationText.trim().length === 0) {
      issues.push({
        severity: 'error',
        code: 'EMPTY_TRANSLATION_TEXT',
        message: `Ayah ${key} has empty translation text.`,
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.ayahNumber
      });
    }

    if (ayah.translationText && ayah.translationText.includes('\uFFFD')) {
      issues.push({
        severity: 'error',
        code: 'UNICODE_REPLACEMENT_CHAR',
        message: `Ayah ${key} contains illegal Unicode replacement character (U+FFFD).`,
        surahNumber: ayah.surahNumber,
        ayahNumber: ayah.ayahNumber
      });
    }

    // 5. Checksum Derivation & Verification
    const calculatedChecksum = ayah.translationText
      ? calculateTranslationChecksum(ayah.translationText)
      : '';
    computedAyahChecksums.push(calculatedChecksum);

    if (shouldVerifyChecksums && calculatedChecksum) {
      if (ayah.textChecksum.toLowerCase().trim() !== calculatedChecksum) {
        issues.push({
          severity: 'error',
          code: 'CHECKSUM_MISMATCH',
          message: `Ayah ${key} text_checksum (${ayah.textChecksum}) does not match computed SHA-256 (${calculatedChecksum}).`,
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.ayahNumber
        });
      }
    }
  }

  // 6. Verify Per-Surah Ayahs Counts against Canonical References
  for (const [surahId, surah] of surahMap.entries()) {
    const actualCount = surahAyahCounters.get(surahId) || 0;
    if (actualCount !== surah.ayahsCount) {
      issues.push({
        severity: 'error',
        code: 'SURAH_AYAH_COUNT_MISMATCH',
        message: `Surah ${surahId} expected ${surah.ayahsCount} translated Ayahs, found ${actualCount}.`,
        surahNumber: surahId
      });
    }
  }

  // 7. Compute Deterministic Dataset-Wide Hash
  const computedDatasetHash = calculateTranslationDatasetChecksum(computedAyahChecksums);

  return {
    valid: issues.length === 0,
    editionId: edition.id,
    totalSurahs: surahAyahCounters.size,
    totalAyahs: ayahs.length,
    issues,
    computedDatasetHash
  };
}
