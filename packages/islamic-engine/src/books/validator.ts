/**
 * @file validator.ts
 * @package @islamic/islamic-engine
 * @description Validators, citation helpers, publication gates, and provenance logic
 *              for the Digital Islamic Books e-Reader.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import type {
  CreateBookInput,
  CreateBookEditionInput,
  CreateBookSectionInput,
  CreateBookContentInput,
  SaveReadingProgressInput,
  Book,
  BookEdition,
  BookContent,
  BookLicenseStatus,
  BookPublicationStatus,
  BookCitation,
  BookProvenanceResult,
  BookCategory
} from './types.js';

export interface BookValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_BOOK_CATEGORIES: readonly BookCategory[] = [
  'hadith_literature',
  'aqeedah',
  'fiqh',
  'adab_zuhd',
  'seerah',
  'quranic_sciences',
  'general'
];

const VALID_LICENSE_STATUSES: readonly BookLicenseStatus[] = [
  'verified_permissible',
  'unverified_pending',
  'restricted_takedown'
];

const VALID_PUBLICATION_STATUSES: readonly BookPublicationStatus[] = [
  'draft',
  'under_review',
  'approved',
  'published',
  'restricted',
  'unverified',
  'takedown'
];

// ============================================================================
// 1. Book Input Validation
// ============================================================================

export function validateBookInput(input: CreateBookInput): BookValidationResult {
  const errors: string[] = [];

  if (!input.id || !/^[a-z0-9-]+$/.test(input.id.trim())) {
    errors.push('Book id must be a non-empty lowercase kebab-case string.');
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
  if (input.category && !VALID_BOOK_CATEGORIES.includes(input.category)) {
    errors.push(`Invalid category: '${input.category}'. Allowed: ${VALID_BOOK_CATEGORIES.join(', ')}.`);
  }
  if (
    input.authorDeathYearAh !== undefined &&
    (input.authorDeathYearAh < 1 || input.authorDeathYearAh > 1500)
  ) {
    errors.push('authorDeathYearAh must be between 1 and 1500 AH if provided.');
  }
  if (input.volumeCount !== undefined && input.volumeCount < 1) {
    errors.push('volumeCount must be at least 1.');
  }
  if (input.licenseStatus && !VALID_LICENSE_STATUSES.includes(input.licenseStatus)) {
    errors.push(`Invalid licenseStatus: '${input.licenseStatus}'.`);
  }
  if (input.publicationStatus && !VALID_PUBLICATION_STATUSES.includes(input.publicationStatus)) {
    errors.push(`Invalid publicationStatus: '${input.publicationStatus}'.`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 2. Book Edition Validation
// ============================================================================

export function validateBookEditionInput(input: CreateBookEditionInput): BookValidationResult {
  const errors: string[] = [];

  if (!input.bookId || input.bookId.trim().length === 0) {
    errors.push('bookId is required.');
  }
  if (!input.editionIdentifier || input.editionIdentifier.trim().length === 0) {
    errors.push('editionIdentifier is required.');
  }
  if (!input.editionTitle || input.editionTitle.trim().length === 0) {
    errors.push('editionTitle is required.');
  }
  if (!['ar', 'en', 'ur'].includes(input.languageCode)) {
    errors.push(`languageCode must be 'ar', 'en', or 'ur'.`);
  }
  if (input.licenseStatus && !VALID_LICENSE_STATUSES.includes(input.licenseStatus)) {
    errors.push(`Invalid licenseStatus: '${input.licenseStatus}'.`);
  }
  if (input.publicationStatus && !VALID_PUBLICATION_STATUSES.includes(input.publicationStatus)) {
    errors.push(`Invalid publicationStatus: '${input.publicationStatus}'.`);
  }
  if (input.format && !['structured_text', 'pdf', 'epub'].includes(input.format)) {
    errors.push(`Invalid format: '${input.format}'.`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 3. Book Section Validation
// ============================================================================

export function validateBookSectionInput(input: CreateBookSectionInput): BookValidationResult {
  const errors: string[] = [];

  if (!input.bookId || input.bookId.trim().length === 0) {
    errors.push('bookId is required.');
  }
  if (input.sectionNumber === undefined || input.sectionNumber < 1) {
    errors.push('sectionNumber must be an integer >= 1.');
  }
  if (!input.titleArabic || input.titleArabic.trim().length === 0) {
    errors.push('titleArabic is required.');
  }
  if (input.volumeNumber !== undefined && input.volumeNumber < 1) {
    errors.push('volumeNumber must be >= 1.');
  }
  if (
    input.startPage !== undefined &&
    input.endPage !== undefined &&
    input.endPage < input.startPage
  ) {
    errors.push('endPage cannot be less than startPage.');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 4. Book Content Validation
// ============================================================================

export function validateBookContentInput(input: CreateBookContentInput): BookValidationResult {
  const errors: string[] = [];

  if (!input.bookId || input.bookId.trim().length === 0) {
    errors.push('bookId is required.');
  }
  if (!input.sectionId || input.sectionId.trim().length === 0) {
    errors.push('sectionId is required.');
  }
  if (input.paragraphIndex !== undefined && input.paragraphIndex < 1) {
    errors.push('paragraphIndex must be an integer >= 1.');
  }
  if (
    input.contentType &&
    !['paragraph', 'heading', 'hadith_quote', 'quran_quote', 'poetry', 'footnote'].includes(
      input.contentType
    )
  ) {
    errors.push(`Invalid contentType: '${input.contentType}'.`);
  }
  if (
    input.contentAvailability &&
    !['full_text', 'excerpt', 'metadata_only', 'unavailable'].includes(input.contentAvailability)
  ) {
    errors.push(`Invalid contentAvailability: '${input.contentAvailability}'.`);
  }
  if (input.licenseStatus && !VALID_LICENSE_STATUSES.includes(input.licenseStatus)) {
    errors.push(`Invalid licenseStatus: '${input.licenseStatus}'.`);
  }
  if (input.publicationStatus && !VALID_PUBLICATION_STATUSES.includes(input.publicationStatus)) {
    errors.push(`Invalid publicationStatus: '${input.publicationStatus}'.`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 5. Reading Progress Validation
// ============================================================================

export function validateReadingProgressInput(input: SaveReadingProgressInput): BookValidationResult {
  const errors: string[] = [];

  if (!input.bookId || input.bookId.trim().length === 0) {
    errors.push('bookId is required.');
  }
  if (
    input.progressPercentage === undefined ||
    isNaN(input.progressPercentage) ||
    input.progressPercentage < 0 ||
    input.progressPercentage > 100
  ) {
    errors.push('progressPercentage must be a number between 0 and 100.');
  }
  if (input.volumeNumber !== undefined && input.volumeNumber < 1) {
    errors.push('volumeNumber must be >= 1.');
  }
  if (input.pageNumber !== undefined && input.pageNumber < 1) {
    errors.push('pageNumber must be >= 1.');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 6. Citation Parser & Formatter
// ============================================================================

/**
 * Parses a citation string like:
 * - "riyad-al-salihin:1:45" (book:volume:section)
 * - "riyad-al-salihin:1:p120" (book:volume:page)
 * - "riyad-al-salihin:45" (book:section, default volume 1)
 */
export function parseBookCitation(citation: string): BookCitation | null {
  if (!citation || typeof citation !== 'string') return null;

  const parts = citation.trim().split(':');
  if (parts.length < 2 || parts.length > 3) return null;

  const bookSlug = parts[0].toLowerCase().trim();
  if (!/^[a-z0-9-]+$/.test(bookSlug)) return null;

  if (parts.length === 2) {
    // format: book:section or book:pPage
    const target = parts[1].trim();
    if (target.startsWith('p') || target.startsWith('P')) {
      const pageNum = parseInt(target.substring(1), 10);
      if (isNaN(pageNum) || pageNum < 1) return null;
      return {
        bookSlug,
        volumeNumber: 1,
        pageNumber: pageNum,
        isPageReference: true
      };
    }

    const secNum = parseInt(target, 10);
    if (isNaN(secNum) || secNum < 1) return null;
    return {
      bookSlug,
      volumeNumber: 1,
      sectionNumber: secNum,
      isPageReference: false
    };
  }

  // 3 parts: book:vol:section or book:vol:pPage
  const volNum = parseInt(parts[1], 10);
  if (isNaN(volNum) || volNum < 1) return null;

  const target = parts[2].trim();
  if (target.startsWith('p') || target.startsWith('P')) {
    const pageNum = parseInt(target.substring(1), 10);
    if (isNaN(pageNum) || pageNum < 1) return null;
    return {
      bookSlug,
      volumeNumber: volNum,
      pageNumber: pageNum,
      isPageReference: true
    };
  }

  const secNum = parseInt(target, 10);
  if (isNaN(secNum) || secNum < 1) return null;
  return {
    bookSlug,
    volumeNumber: volNum,
    sectionNumber: secNum,
    isPageReference: false
  };
}

/**
 * Formats a canonical book citation for display.
 */
export function formatBookCitation(
  bookTitleEnglish: string,
  volumeNumber: number,
  targetNumber: number,
  isPage: boolean = false
): string {
  const refType = isPage ? 'p.' : 'Section';
  return `${bookTitleEnglish} → Vol. ${volumeNumber} → ${refType} ${targetNumber}`;
}

// ============================================================================
// 7. Publication & License Gates
// ============================================================================

export function isBookPublic(book: Book): boolean {
  return (
    book.isActive &&
    book.licenseStatus === 'verified_permissible' &&
    book.reviewStatus === 'approved' &&
    book.publicationStatus === 'published'
  );
}

export function isEditionPublic(edition: BookEdition): boolean {
  return (
    edition.isActive &&
    edition.licenseStatus === 'verified_permissible' &&
    edition.reviewStatus === 'approved' &&
    edition.publicationStatus === 'published'
  );
}

export function isContentPublic(content: BookContent): boolean {
  return (
    content.isCurrent &&
    content.licenseStatus === 'verified_permissible' &&
    content.publicationStatus === 'published'
  );
}

export function isBookLicenseCleared(status: BookLicenseStatus): boolean {
  return status === 'verified_permissible';
}

export function isBookContentRestricted(
  publicationStatus: BookPublicationStatus,
  licenseStatus: BookLicenseStatus
): boolean {
  return (
    publicationStatus === 'restricted' ||
    publicationStatus === 'takedown' ||
    licenseStatus === 'restricted_takedown'
  );
}

// ============================================================================
// 8. Provenance Verification Builder
// ============================================================================

export function buildBookProvenanceResult(
  book: Book,
  edition?: BookEdition
): BookProvenanceResult {
  const licenseStatus = edition ? edition.licenseStatus : book.licenseStatus;
  const licenseType = edition ? edition.licenseType : book.licenseType;
  const attribution =
    (edition && edition.attributionRequirement) ||
    book.attributionRequirement ||
    `${book.titleEnglish} by ${book.authorNameEnglish}.`;

  return {
    bookId: book.id,
    bookSlug: book.slug,
    editionId: edition?.id,
    titleEnglish: book.titleEnglish,
    authorNameEnglish: book.authorNameEnglish,
    licenseStatus,
    licenseType,
    attributionRequirement: attribution,
    provenanceNotes: edition?.provenanceNotes || book.provenanceNotes,
    sourceUrl: edition?.sourceArchiveUrl || book.sourceUrl,
    contentAvailability: 'metadata_only',
    verifiedPermissible:
      licenseStatus === 'verified_permissible' &&
      book.publicationStatus === 'published' &&
      (!edition || edition.publicationStatus === 'published')
  };
}
