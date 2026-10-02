/**
 * @file validation.ts
 * @package @islamic/engine
 * @description Comprehensive structural, textual, and referential validator for Quran datasets.
 */

import { QuranSurah, QuranAyah, QuranValidationResult, QuranValidationIssue } from './types.js';
import {
  calculateAyahChecksum,
  calculateSourceVerbatimChecksum,
  calculateStructuralAyahChecksum
} from './checksum.js';

const HTML_MARKUP_REGEX = /<[^>]+>/;

export interface ValidationOptions {
  expectedSurahsCount?: number;
  expectedAyahsCount?: number;
  verifyChecksums?: boolean;
}

/**
 * Validates a complete parsed Quran dataset against religious structural and Unicode integrity rules.
 *
 * @param surahs Array of parsed Surahs (expected 114).
 * @param ayahs Array of parsed Ayahs (expected 6,236 for Hafs Kufan convention).
 * @param options Configurable validation expectations.
 * @returns QuranValidationResult with boolean validity and list of detected issues.
 */
export function validateQuranDataset(
  surahs: QuranSurah[],
  ayahs: QuranAyah[],
  options: ValidationOptions = {}
): QuranValidationResult {
  const expectedSurahs = options.expectedSurahsCount ?? 114;
  const expectedAyahs = options.expectedAyahsCount ?? 6236;
  const shouldVerifyChecksums = options.verifyChecksums ?? true;

  const issues: QuranValidationIssue[] = [];

  // 1. Structural Surah Validation
  if (surahs.length !== expectedSurahs) {
    issues.push({
      severity: 'error',
      code: 'SURAH_COUNT_MISMATCH',
      message: `Expected ${expectedSurahs} Surahs, found ${surahs.length}.`
    });
  }

  const surahMap = new Map<number, QuranSurah>();
  const seenSlugs = new Set<string>();

  for (let i = 0; i < surahs.length; i++) {
    const surah = surahs[i];
    const expectedId = i + 1;

    if (surah.id !== expectedId) {
      issues.push({
        severity: 'error',
        code: 'SURAH_SEQUENCE_ERROR',
        message: `Surah at index ${i} has ID ${surah.id}, expected ${expectedId}.`,
        surahId: surah.id
      });
    }

    if (seenSlugs.has(surah.slug)) {
      issues.push({
        severity: 'error',
        code: 'DUPLICATE_SURAH_SLUG',
        message: `Duplicate Surah slug '${surah.slug}' detected.`,
        surahId: surah.id
      });
    }
    seenSlugs.add(surah.slug);

    if (!surah.nameArabic || surah.nameArabic.trim().length === 0) {
      issues.push({
        severity: 'error',
        code: 'EMPTY_SURAH_NAME',
        message: `Surah ${surah.id} has empty Arabic name.`,
        surahId: surah.id
      });
    }

    if (surah.ayahsCount <= 0) {
      issues.push({
        severity: 'error',
        code: 'INVALID_AYAH_COUNT',
        message: `Surah ${surah.id} has invalid ayahsCount: ${surah.ayahsCount}.`,
        surahId: surah.id
      });
    }

    surahMap.set(surah.id, surah);
  }

  // 2. Structural Ayah Validation
  if (ayahs.length !== expectedAyahs) {
    issues.push({
      severity: 'error',
      code: 'AYAH_COUNT_MISMATCH',
      message: `Expected ${expectedAyahs} Ayahs according to verified convention, found ${ayahs.length}.`
    });
  }

  // Track continuity per surah
  const surahAyahCounters = new Map<number, number>();
  const seenAyahKeys = new Set<string>();

  for (let idx = 0; idx < ayahs.length; idx++) {
    const ayah = ayahs[idx];
    const expectedGlobalId = idx + 1;

    if (ayah.id !== expectedGlobalId) {
      issues.push({
        severity: 'error',
        code: 'GLOBAL_AYAH_INDEX_ERROR',
        message: `Ayah at offset ${idx} has global ID ${ayah.id}, expected ${expectedGlobalId}.`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
    }

    const surah = surahMap.get(ayah.surahId);
    if (!surah) {
      issues.push({
        severity: 'error',
        code: 'ORPHAN_AYAH',
        message: `Ayah references non-existent Surah ID ${ayah.surahId}.`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
      continue;
    }

    const currentCount = surahAyahCounters.get(ayah.surahId) || 0;
    const expectedAyahNumber = currentCount + 1;

    if (ayah.ayahNumber !== expectedAyahNumber) {
      issues.push({
        severity: 'error',
        code: 'AYAH_SEQUENCE_ERROR',
        message: `Surah ${ayah.surahId} Ayah ${ayah.ayahNumber} is out of sequence (expected ${expectedAyahNumber}).`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
    }
    surahAyahCounters.set(ayah.surahId, expectedAyahNumber);

    const key = `${ayah.surahId}:${ayah.ayahNumber}`;
    if (seenAyahKeys.has(key)) {
      issues.push({
        severity: 'error',
        code: 'DUPLICATE_AYAH',
        message: `Duplicate Ayah detected: Surah ${ayah.surahId} Ayah ${ayah.ayahNumber}.`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
    }
    seenAyahKeys.add(key);

    // 3. Text & Unicode Integrity Validation
    if (!ayah.textUthmani || ayah.textUthmani.trim().length === 0) {
      issues.push({
        severity: 'error',
        code: 'EMPTY_CANONICAL_TEXT',
        message: `Ayah ${key} has empty canonical text.`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
    }

    if (ayah.textSourceVerbatim !== undefined) {
      if (!ayah.textSourceVerbatim || ayah.textSourceVerbatim.trim().length === 0) {
        issues.push({
          severity: 'error',
          code: 'EMPTY_SOURCE_VERBATIM_TEXT',
          message: `Ayah ${key} has empty source-verbatim text.`,
          surahId: ayah.surahId,
          ayahNumber: ayah.ayahNumber
        });
      }

      if (ayah.textSourceVerbatim.includes('\uFFFD')) {
        issues.push({
          severity: 'error',
          code: 'UNICODE_REPLACEMENT_CHAR',
          message: `Ayah ${key} source-verbatim text contains illegal Unicode replacement character (U+FFFD).`,
          surahId: ayah.surahId,
          ayahNumber: ayah.ayahNumber
        });
      }

      // Check deterministic coherence between source-verbatim and structural representation
      const expectedVerbatim = ayah.bismillah
        ? `${ayah.bismillah} ${ayah.textUthmani}`
        : ayah.textUthmani;

      if (ayah.textSourceVerbatim !== expectedVerbatim) {
        issues.push({
          severity: 'error',
          code: 'SOURCE_VERBATIM_COHERENCE_MISMATCH',
          message: `Ayah ${key} source-verbatim text does not match deterministic combination of bismillah and textUthmani.`,
          surahId: ayah.surahId,
          ayahNumber: ayah.ayahNumber
        });
      }
    }

    if (ayah.textUthmani.includes('\uFFFD')) {
      issues.push({
        severity: 'error',
        code: 'UNICODE_REPLACEMENT_CHAR',
        message: `Ayah ${key} contains illegal Unicode replacement character (U+FFFD).`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
    }

    if (HTML_MARKUP_REGEX.test(ayah.textUthmani)) {
      issues.push({
        severity: 'error',
        code: 'ACCIDENTAL_HTML_MARKUP',
        message: `Ayah ${key} contains unexpected HTML/markup characters.`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
    }

    // 4. Checksum Verification
    if (shouldVerifyChecksums) {
      if (ayah.checksumSourceVerbatim && ayah.textSourceVerbatim) {
        const computedVerbatimChecksum = calculateSourceVerbatimChecksum(ayah.textSourceVerbatim);
        if (computedVerbatimChecksum !== ayah.checksumSourceVerbatim.toLowerCase().trim()) {
          issues.push({
            severity: 'error',
            code: 'SOURCE_VERBATIM_CHECKSUM_MISMATCH',
            message: `Ayah ${key} checksum_source_verbatim does not match computed SHA-256 of text_source_verbatim.`,
            surahId: ayah.surahId,
            ayahNumber: ayah.ayahNumber
          });
        }
      }

      if (ayah.checksumAyahStructural) {
        const computedStructural = calculateStructuralAyahChecksum(ayah.textUthmani);
        if (computedStructural !== ayah.checksumAyahStructural.toLowerCase().trim()) {
          issues.push({
            severity: 'error',
            code: 'CHECKSUM_MISMATCH',
            message: `Ayah ${key} checksum_ayah_structural does not match computed SHA-256 of text_uthmani.`,
            surahId: ayah.surahId,
            ayahNumber: ayah.ayahNumber
          });
        }
      }

      if (ayah.textChecksum) {
        const computedStructural = calculateStructuralAyahChecksum(ayah.textUthmani);
        if (computedStructural !== ayah.textChecksum.toLowerCase().trim()) {
          issues.push({
            severity: 'error',
            code: 'CHECKSUM_MISMATCH',
            message: `Ayah ${key} text_checksum does not match computed SHA-256 of text_uthmani.`,
            surahId: ayah.surahId,
            ayahNumber: ayah.ayahNumber
          });
        }
      }

      if (!ayah.checksumAyahStructural && !ayah.textChecksum) {
        issues.push({
          severity: 'error',
          code: 'MISSING_CHECKSUM',
          message: `Ayah ${key} has no structural Ayah checksum recorded.`,
          surahId: ayah.surahId,
          ayahNumber: ayah.ayahNumber
        });
      }
    }

    // 5. Spatial & Navigation Bounds Validation
    if (ayah.juzNumber < 1 || ayah.juzNumber > 30) {
      issues.push({
        severity: 'error',
        code: 'INVALID_JUZ_BOUNDS',
        message: `Ayah ${key} has invalid juzNumber: ${ayah.juzNumber} (must be 1-30).`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
    }

    if (ayah.pageNumber < 1 || ayah.pageNumber > 604) {
      issues.push({
        severity: 'error',
        code: 'INVALID_PAGE_BOUNDS',
        message: `Ayah ${key} has invalid pageNumber: ${ayah.pageNumber} (must be 1-604 for Medina Mushaf).`,
        surahId: ayah.surahId,
        ayahNumber: ayah.ayahNumber
      });
    }
  }

  // 6. Verify that each Surah contains exactly its declared ayahsCount
  for (const [surahId, surah] of surahMap.entries()) {
    const actualCount = surahAyahCounters.get(surahId) || 0;
    if (actualCount !== surah.ayahsCount) {
      issues.push({
        severity: 'error',
        code: 'SURAH_AYAH_COUNT_MISMATCH',
        message: `Surah ${surahId} (${surah.slug}) declared ayahsCount is ${surah.ayahsCount}, but ${actualCount} ayahs were found.`,
        surahId
      });
    }
  }

  // Compute dataset-wide deterministic hash across all ayah checksums
  const datasetHashInput = ayahs
    .map((a) => a.checksumSourceVerbatim || a.checksumAyahStructural || a.textChecksum || calculateAyahChecksum(a.textUthmani))
    .join('\n');
  const computedDatasetHash = calculateAyahChecksum(datasetHashInput);

  return {
    valid: issues.length === 0,
    totalSurahs: surahs.length,
    totalAyahs: ayahs.length,
    issues,
    computedDatasetHash
  };
}
