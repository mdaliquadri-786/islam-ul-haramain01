/**
 * @file tafsir.test.ts
 * @package @islamic/islamic-engine
 * @description Comprehensive test suite for Milestone M4.2 — Classical Tafsir domain engine:
 *              - Tafsir work validation
 *              - Tafsir entry validation with Quran bounds checking
 *              - Reference parser
 *              - Publication gate
 *              - License status helpers
 *              - Provenance result builder
 *              - Citation formatter
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateTafsirWorkInput,
  validateTafsirEntryInput,
  parseTafsirReference,
  formatTafsirCitation,
  isTafsirEntryPublic,
  isTafsirWorkPublic,
  isLicenseCleared,
  isContentRestricted,
  buildTafsirProvenanceResult,
  type TafsirWork,
  type TafsirEntry
} from '@islamic/islamic-engine';

// ============================================================================
// Test Fixtures
// ============================================================================

const validWorkInput = {
  id: 'test-work',
  slug: 'test-work',
  titleArabic: 'تفسير اختباري',
  titleEnglish: 'Test Tafsir Work',
  titleUrdu: 'ٹیسٹ تفسیر',
  authorNameArabic: 'مؤلف اختباري',
  authorNameEnglish: 'Test Author',
  authorNameUrdu: 'ٹیسٹ مصنف',
  authorDeathYearHijri: 500,
  authorDeathYearCe: 1106,
  licenseType: 'Public Domain',
  licenseStatus: 'verified_permissible' as const
};

const validEntryInput = {
  workId: 'ibn-kathir',
  surahId: 2,
  ayahNumber: 255,
  languageCode: 'ar' as const,
  contentAvailability: 'metadata_only' as const,
  licenseStatus: 'verified_permissible' as const,
  publicationStatus: 'published' as const
};

const publishedEntry: TafsirEntry = {
  id: 'entry-1',
  workId: 'ibn-kathir',
  surahId: 2,
  ayahNumber: 255,
  languageCode: 'ar',
  textContent: null,
  contentAvailability: 'metadata_only',
  licenseStatus: 'verified_permissible',
  publicationStatus: 'published',
  versionNumber: 1,
  isCurrent: true,
  createdAt: '2026-09-24T00:00:00.000Z',
  updatedAt: '2026-09-24T00:00:00.000Z'
};

const publishedWork: TafsirWork = {
  id: 'ibn-kathir',
  slug: 'ibn-kathir',
  titleArabic: 'تفسير القرآن العظيم',
  titleEnglish: "Tafsir Ibn Kathir",
  titleUrdu: 'تفسیر ابن کثیر',
  authorNameArabic: 'إسماعيل بن كثير',
  authorNameEnglish: 'Ibn Kathir',
  authorNameUrdu: 'ابن کثیر',
  authorDeathYearHijri: 774,
  licenseType: 'Public Domain',
  licenseStatus: 'verified_permissible',
  isActive: true,
  reviewStatus: 'approved',
  attributionRequirement: 'Tafsir Ibn Kathir by Ibn Kathir.',
  createdAt: '2026-09-24T00:00:00.000Z',
  updatedAt: '2026-09-24T00:00:00.000Z'
};

// ============================================================================
// 1. Tafsir Work Validation
// ============================================================================

describe('M4.2 — Tafsir Domain Engine: Work Validation', () => {
  it('should PASS for a valid tafsir work input', () => {
    const result = validateTafsirWorkInput(validWorkInput);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should FAIL if id contains uppercase or spaces', () => {
    const result = validateTafsirWorkInput({ ...validWorkInput, id: 'Ibn Kathir' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.toLowerCase().includes('id')));
  });

  it('should FAIL if titleArabic is empty', () => {
    const result = validateTafsirWorkInput({ ...validWorkInput, titleArabic: '' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('titleArabic')));
  });

  it('should FAIL if authorNameUrdu is missing', () => {
    const result = validateTafsirWorkInput({
      ...validWorkInput,
      authorNameUrdu: ''
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('authorNameUrdu')));
  });

  it('should FAIL if death year is out of valid Hijri range', () => {
    const result = validateTafsirWorkInput({
      ...validWorkInput,
      authorDeathYearHijri: 2000
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('authorDeathYearHijri')));
  });

  it('should FAIL if licenseStatus is invalid', () => {
    const result = validateTafsirWorkInput({
      ...validWorkInput,
      licenseStatus: 'unknown' as never
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('licenseStatus')));
  });
});

// ============================================================================
// 2. Tafsir Entry Validation
// ============================================================================

describe('M4.2 — Tafsir Domain Engine: Entry Validation', () => {
  it('should PASS for a valid Ayah Kursi entry (2:255)', () => {
    const result = validateTafsirEntryInput(validEntryInput);
    assert.equal(result.valid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should PASS for Al-Fatihah first ayah (1:1)', () => {
    const result = validateTafsirEntryInput({
      ...validEntryInput,
      surahId: 1,
      ayahNumber: 1,
      languageCode: 'ar'
    });
    assert.equal(result.valid, true);
  });

  it('should PASS for last ayah of An-Nas (114:6)', () => {
    const result = validateTafsirEntryInput({
      ...validEntryInput,
      surahId: 114,
      ayahNumber: 6,
      languageCode: 'ur'
    });
    assert.equal(result.valid, true);
  });

  it('should FAIL for surahId = 0 (below minimum)', () => {
    const result = validateTafsirEntryInput({ ...validEntryInput, surahId: 0 });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('surahId')));
  });

  it('should FAIL for surahId = 115 (above maximum)', () => {
    const result = validateTafsirEntryInput({ ...validEntryInput, surahId: 115 });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('surahId')));
  });

  it('should FAIL for out-of-bounds ayah (Al-Fatihah has only 7 ayahs)', () => {
    const result = validateTafsirEntryInput({
      ...validEntryInput,
      surahId: 1,
      ayahNumber: 8
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('ayahNumber')));
  });

  it('should FAIL for invalid languageCode', () => {
    const result = validateTafsirEntryInput({
      ...validEntryInput,
      languageCode: 'fr' as never
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('languageCode')));
  });

  it('should FAIL for invalid publicationStatus', () => {
    const result = validateTafsirEntryInput({
      ...validEntryInput,
      publicationStatus: 'fabricated' as never
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('publicationStatus')));
  });

  it('should FAIL for invalid licenseStatus', () => {
    const result = validateTafsirEntryInput({
      ...validEntryInput,
      licenseStatus: 'open-access' as never
    });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('licenseStatus')));
  });

  it('should FAIL if workId is empty', () => {
    const result = validateTafsirEntryInput({ ...validEntryInput, workId: '' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('workId')));
  });
});

// ============================================================================
// 3. Reference Parser
// ============================================================================

describe('M4.2 — Tafsir Domain Engine: Citation Router', () => {
  it('should parse a valid tafsir citation: ibn-kathir:2:255', () => {
    const ref = parseTafsirReference('ibn-kathir:2:255');
    assert.ok(ref !== null);
    assert.equal(ref.workId, 'ibn-kathir');
    assert.equal(ref.surahId, 2);
    assert.equal(ref.ayahNumber, 255);
  });

  it('should parse al-sadi:1:1', () => {
    const ref = parseTafsirReference('al-sadi:1:1');
    assert.ok(ref !== null);
    assert.equal(ref.workId, 'al-sadi');
    assert.equal(ref.surahId, 1);
    assert.equal(ref.ayahNumber, 1);
  });

  it('should return null for invalid format (missing part)', () => {
    assert.equal(parseTafsirReference('ibn-kathir:255'), null);
  });

  it('should return null for surah 0', () => {
    assert.equal(parseTafsirReference('ibn-kathir:0:255'), null);
  });

  it('should return null for surah 115', () => {
    assert.equal(parseTafsirReference('ibn-kathir:115:1'), null);
  });

  it('should return null for out-of-bounds ayah (Al-Fatihah has only 7)', () => {
    assert.equal(parseTafsirReference('ibn-kathir:1:10'), null);
  });

  it('should format citation correctly', () => {
    const result = formatTafsirCitation('Tafsir Ibn Kathir', 2, 255);
    assert.equal(result, 'Tafsir Ibn Kathir → Surah 2 → Ayah 255');
  });
});

// ============================================================================
// 4. Publication Gate
// ============================================================================

describe('M4.2 — Tafsir Domain Engine: Publication Gate', () => {
  it('should mark published + verified + current entry as public', () => {
    assert.equal(isTafsirEntryPublic(publishedEntry), true);
  });

  it('should block draft entry from public access', () => {
    const draft = { ...publishedEntry, publicationStatus: 'draft' as const };
    assert.equal(isTafsirEntryPublic(draft), false);
  });

  it('should block under_review entry from public access', () => {
    const review = { ...publishedEntry, publicationStatus: 'under_review' as const };
    assert.equal(isTafsirEntryPublic(review), false);
  });

  it('should block takedown entry from public access', () => {
    const takedown = {
      ...publishedEntry,
      publicationStatus: 'takedown' as const,
      licenseStatus: 'restricted_takedown' as const
    };
    assert.equal(isTafsirEntryPublic(takedown), false);
  });

  it('should block non-current entry from public access', () => {
    const old = { ...publishedEntry, isCurrent: false };
    assert.equal(isTafsirEntryPublic(old), false);
  });

  it('should block entry with restricted license from public access', () => {
    const restricted = {
      ...publishedEntry,
      licenseStatus: 'restricted_takedown' as const
    };
    assert.equal(isTafsirEntryPublic(restricted), false);
  });

  it('should mark active + approved + verified work as public', () => {
    assert.equal(isTafsirWorkPublic(publishedWork), true);
  });

  it('should block inactive work from public listing', () => {
    assert.equal(isTafsirWorkPublic({ ...publishedWork, isActive: false }), false);
  });

  it('should block draft work from public listing', () => {
    assert.equal(
      isTafsirWorkPublic({ ...publishedWork, reviewStatus: 'draft' }),
      false
    );
  });
});

// ============================================================================
// 5. License Helpers
// ============================================================================

describe('M4.2 — Tafsir Domain Engine: License Status Helpers', () => {
  it('should confirm verified_permissible is cleared', () => {
    assert.equal(isLicenseCleared('verified_permissible'), true);
  });

  it('should reject unverified_pending as not cleared', () => {
    assert.equal(isLicenseCleared('unverified_pending'), false);
  });

  it('should identify restricted_takedown as restricted', () => {
    assert.equal(isContentRestricted('takedown', 'restricted_takedown'), true);
  });

  it('should not flag published + verified as restricted', () => {
    assert.equal(isContentRestricted('published', 'verified_permissible'), false);
  });
});

// ============================================================================
// 6. Provenance Result
// ============================================================================

describe('M4.2 — Tafsir Domain Engine: Provenance Result Builder', () => {
  it('should build correct provenance result for published entry', () => {
    const result = buildTafsirProvenanceResult(publishedWork, publishedEntry);
    assert.equal(result.workId, 'ibn-kathir');
    assert.equal(result.surahId, 2);
    assert.equal(result.ayahNumber, 255);
    assert.equal(result.licenseStatus, 'verified_permissible');
    assert.equal(result.verifiedPermissible, true);
    assert.ok(result.attributionText.length > 0);
  });

  it('should mark provenance as not verified for draft entry', () => {
    const draft = { ...publishedEntry, publicationStatus: 'draft' as const };
    const result = buildTafsirProvenanceResult(publishedWork, draft);
    assert.equal(result.verifiedPermissible, false);
  });
});
