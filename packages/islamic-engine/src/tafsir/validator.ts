/**
 * @file validator.ts
 * @package @islamic/islamic-engine
 * @description Validators, reference helpers, and publication-gate logic for the
 *              Classical Tafsir Comparative Viewer.
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 */

import { CANONICAL_SURAHS } from '../search/citation-router';
import type {
  CreateTafsirWorkInput,
  CreateTafsirEntryInput,
  TafsirEntry,
  TafsirWork,
  TafsirLicenseStatus,
  TafsirPublicationStatus,
  TafsirProvenanceResult
} from './types';

// ============================================================================
// Canonical Ayah Counts (derived from CANONICAL_SURAHS)
// ============================================================================

function getAyahCount(surahId: number): number | null {
  const surah = CANONICAL_SURAHS.find((s) => s.number === surahId);
  return surah ? surah.ayahsCount : null;
}

// ============================================================================
// Tafsir Work Validation
// ============================================================================

export interface TafsirWorkValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTafsirWorkInput(
  input: CreateTafsirWorkInput
): TafsirWorkValidationResult {
  const errors: string[] = [];

  if (!input.id || !/^[a-z0-9-]+$/.test(input.id.trim())) {
    errors.push('Work id must be a non-empty lowercase kebab-case string (a-z, 0-9, -).');
  }
  if (!input.slug || !/^[a-z0-9-]+$/.test(input.slug.trim())) {
    errors.push('Slug must be a non-empty lowercase kebab-case string.');
  }
  if (!input.titleArabic || input.titleArabic.trim().length === 0) {
    errors.push('titleArabic is required.');
  }
  if (!input.titleEnglish || input.titleEnglish.trim().length === 0) {
    errors.push('titleEnglish is required.');
  }
  if (!input.titleUrdu || input.titleUrdu.trim().length === 0) {
    errors.push('titleUrdu is required.');
  }
  if (!input.authorNameArabic || input.authorNameArabic.trim().length === 0) {
    errors.push('authorNameArabic is required.');
  }
  if (!input.authorNameEnglish || input.authorNameEnglish.trim().length === 0) {
    errors.push('authorNameEnglish is required.');
  }
  if (!input.authorNameUrdu || input.authorNameUrdu.trim().length === 0) {
    errors.push('authorNameUrdu is required.');
  }
  if (
    input.authorDeathYearHijri !== undefined &&
    (input.authorDeathYearHijri < 1 || input.authorDeathYearHijri > 1500)
  ) {
    errors.push('authorDeathYearHijri must be between 1 and 1500 AH if provided.');
  }
  if (
    input.licenseStatus !== undefined &&
    !['verified_permissible', 'unverified_pending', 'restricted_takedown'].includes(
      input.licenseStatus
    )
  ) {
    errors.push('licenseStatus must be one of: verified_permissible, unverified_pending, restricted_takedown.');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Tafsir Entry Validation
// ============================================================================

export interface TafsirEntryValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTafsirEntryInput(
  input: CreateTafsirEntryInput
): TafsirEntryValidationResult {
  const errors: string[] = [];

  if (!input.workId || input.workId.trim().length === 0) {
    errors.push('workId is required.');
  }
  if (!input.surahId || input.surahId < 1 || input.surahId > 114) {
    errors.push('surahId must be between 1 and 114.');
  } else {
    const maxAyah = getAyahCount(input.surahId);
    if (maxAyah !== null) {
      if (input.ayahNumber < 1 || input.ayahNumber > maxAyah) {
        errors.push(
          `ayahNumber ${input.ayahNumber} is out of bounds for Surah ${input.surahId} (max: ${maxAyah}).`
        );
      }
      if (
        input.ayahNumberEnd !== undefined &&
        (input.ayahNumberEnd < input.ayahNumber || input.ayahNumberEnd > maxAyah)
      ) {
        errors.push(
          `ayahNumberEnd ${input.ayahNumberEnd} is invalid for Surah ${input.surahId}.`
        );
      }
    }
  }
  if (!['ar', 'en', 'ur'].includes(input.languageCode)) {
    errors.push('languageCode must be one of: ar, en, ur.');
  }
  if (
    input.publicationStatus !== undefined &&
    !['draft', 'under_review', 'approved', 'published', 'restricted', 'unverified', 'takedown'].includes(
      input.publicationStatus
    )
  ) {
    errors.push('publicationStatus has an invalid value.');
  }
  if (
    input.licenseStatus !== undefined &&
    !['verified_permissible', 'unverified_pending', 'restricted_takedown'].includes(
      input.licenseStatus
    )
  ) {
    errors.push('licenseStatus has an invalid value.');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// Quran Reference Parsing
// ============================================================================

export interface TafsirReference {
  workId: string;
  surahId: number;
  ayahNumber: number;
}

/**
 * Parses a tafsir citation string like "ibn-kathir:2:255" into structured parts.
 */
export function parseTafsirReference(ref: string): TafsirReference | null {
  const parts = ref.trim().split(':');
  if (parts.length !== 3) return null;
  const [workId, surahStr, ayahStr] = parts;
  const surahId = parseInt(surahStr, 10);
  const ayahNumber = parseInt(ayahStr, 10);
  if (
    !workId ||
    isNaN(surahId) ||
    isNaN(ayahNumber) ||
    surahId < 1 ||
    surahId > 114 ||
    ayahNumber < 1
  ) {
    return null;
  }
  const maxAyah = getAyahCount(surahId);
  if (maxAyah !== null && ayahNumber > maxAyah) return null;
  return { workId, surahId, ayahNumber };
}

/**
 * Formats a tafsir citation for display.
 * e.g. "Tafsir Ibn Kathir → Surah 2 → Ayah 255"
 */
export function formatTafsirCitation(
  workTitleEnglish: string,
  surahId: number,
  ayahNumber: number
): string {
  return `${workTitleEnglish} → Surah ${surahId} → Ayah ${ayahNumber}`;
}

// ============================================================================
// Publication Gate
// ============================================================================

/**
 * Determines whether a tafsir entry is publicly presentable.
 * SAFETY: Only published + verified_permissible entries are public-facing.
 */
export function isTafsirEntryPublic(entry: TafsirEntry): boolean {
  return (
    entry.isCurrent &&
    entry.publicationStatus === 'published' &&
    entry.licenseStatus === 'verified_permissible'
  );
}

/**
 * Determines whether a tafsir work is publicly listed.
 */
export function isTafsirWorkPublic(work: TafsirWork): boolean {
  return (
    work.isActive &&
    work.licenseStatus === 'verified_permissible' &&
    work.reviewStatus === 'approved'
  );
}

// ============================================================================
// License Status Helpers
// ============================================================================

export function isLicenseCleared(status: TafsirLicenseStatus): boolean {
  return status === 'verified_permissible';
}

export function isContentRestricted(
  publicationStatus: TafsirPublicationStatus,
  licenseStatus: TafsirLicenseStatus
): boolean {
  return (
    publicationStatus === 'restricted' ||
    publicationStatus === 'takedown' ||
    licenseStatus === 'restricted_takedown'
  );
}

// ============================================================================
// Provenance Verification
// ============================================================================

export function buildTafsirProvenanceResult(
  work: TafsirWork,
  entry: TafsirEntry
): TafsirProvenanceResult {
  return {
    workId: work.id,
    entryId: entry.id,
    surahId: entry.surahId,
    ayahNumber: entry.ayahNumber,
    licenseStatus: entry.licenseStatus,
    licenseType: work.licenseType,
    contentAvailability: entry.contentAvailability,
    publicationStatus: entry.publicationStatus,
    attributionText:
      work.attributionRequirement ||
      `Classical Tafsir: ${work.titleEnglish} by ${work.authorNameEnglish}.`,
    sourceReference: entry.sourcePageReference,
    verifiedPermissible:
      entry.licenseStatus === 'verified_permissible' &&
      entry.publicationStatus === 'published' &&
      entry.isCurrent
  };
}
