/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Domain types and interfaces for the Digital Islamic Books e-Reader.
 * Supports structured digital books, editions, volumes, chapters/sections,
 * reading progress, citations, and licensing/provenance.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 *
 * CONTENT SAFETY:
 * - Public domain classical Islamic works are separated from modern editions and translations.
 * - Digital content defaults to 'metadata_only' pending formal edition ingestion.
 * - No AI-generated or fabricated texts are permitted.
 * - Work presence does NOT constitute platform endorsement of every scholarly opinion.
 */

export type BookLicenseStatus =
  | 'verified_permissible'
  | 'unverified_pending'
  | 'restricted_takedown';

export type BookPublicationStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'restricted'
  | 'unverified'
  | 'takedown';

export type BookContentAvailability =
  | 'full_text'
  | 'excerpt'
  | 'metadata_only'
  | 'unavailable';

export type BookReviewStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type BookCategory =
  | 'hadith_literature'
  | 'aqeedah'
  | 'fiqh'
  | 'adab_zuhd'
  | 'seerah'
  | 'quranic_sciences'
  | 'general';

export type BookContentType =
  | 'paragraph'
  | 'heading'
  | 'hadith_quote'
  | 'quran_quote'
  | 'poetry'
  | 'footnote';

export type BookFormat = 'structured_text' | 'pdf' | 'epub';

/**
 * An abstract book/work entity (e.g. Riyad al-Salihin).
 */
export interface Book {
  id: string;                          // e.g. 'riyad-al-salihin'
  slug: string;                        // 'riyad-al-salihin'
  titleArabic: string;
  titleEnglish: string;
  titleUrdu: string;
  authorId?: string;
  authorNameArabic: string;
  authorNameEnglish: string;
  authorNameUrdu: string;
  authorDeathYearAh?: number;
  authorDeathYearCe?: number;
  descriptionArabic?: string;
  descriptionEnglish?: string;
  descriptionUrdu?: string;
  category: BookCategory;
  originalLanguage: string;
  volumeCount: number;
  licenseType: string;
  licenseStatus: BookLicenseStatus;
  sourceUrl?: string;
  provenanceNotes?: string;
  attributionRequirement?: string;
  isActive: boolean;
  reviewStatus: BookReviewStatus;
  publicationStatus: BookPublicationStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * A specific edition or translation of a book.
 */
export interface BookEdition {
  id: string;
  bookId: string;
  editionIdentifier: string;           // e.g. 'shamela-digital', 'dar-al-fikr-1995'
  editionTitle: string;
  languageCode: 'ar' | 'en' | 'ur';
  publisher?: string;
  editor?: string;
  translator?: string;
  publicationYearCe?: number;
  isbn?: string;
  volumeCount: number;
  format: BookFormat;
  licenseType: string;
  licenseStatus: BookLicenseStatus;
  licenseNotes?: string;
  attributionRequirement: string;
  provenanceNotes?: string;
  sourceArchiveUrl?: string;
  contentSha256?: string;
  isActive: boolean;
  reviewStatus: BookReviewStatus;
  publicationStatus: BookPublicationStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * A volume within a multi-volume book.
 */
export interface BookVolume {
  id: string;
  bookId: string;
  editionId?: string;
  volumeNumber: number;
  titleArabic?: string;
  titleEnglish?: string;
  titleUrdu?: string;
  pageCount?: number;
  createdAt: string;
}

/**
 * A section or chapter within a book volume.
 */
export interface BookSection {
  id: string;
  bookId: string;
  editionId?: string;
  volumeNumber: number;
  sectionNumber: number;
  parentSectionId?: string;
  titleArabic: string;
  titleEnglish?: string;
  titleUrdu?: string;
  chapterNumber?: number;
  startPage?: number;
  endPage?: number;
  orderIndex: number;
  createdAt: string;
}

/**
 * Content element (paragraph, heading, quote) within a book section.
 */
export interface BookContent {
  id: string;
  sectionId: string;
  bookId: string;
  editionId?: string;
  volumeNumber: number;
  pageNumber?: number;
  paragraphIndex: number;
  contentType: BookContentType;
  textAr?: string | null;
  textEn?: string | null;
  textUr?: string | null;
  contentAvailability: BookContentAvailability;
  contentSha256?: string;
  licenseStatus: BookLicenseStatus;
  publicationStatus: BookPublicationStatus;
  versionNumber: number;
  isCurrent: boolean;
  parentVersionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User reading progress tracking.
 */
export interface UserReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  editionId?: string;
  volumeNumber: number;
  sectionId?: string;
  pageNumber?: number;
  progressPercentage: number;          // 0.00 to 100.00
  lastReadAt: string;
  clientMutationId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Parsed citation reference for a book.
 * e.g. "riyad-al-salihin:1:45" or "riyad-al-salihin:1:p120"
 */
export interface BookCitation {
  bookSlug: string;
  volumeNumber: number;
  sectionNumber?: number;
  pageNumber?: number;
  isPageReference: boolean;
}

/**
 * Provenance verification summary for a book or edition.
 */
export interface BookProvenanceResult {
  bookId: string;
  bookSlug: string;
  editionId?: string;
  titleEnglish: string;
  authorNameEnglish: string;
  licenseStatus: BookLicenseStatus;
  licenseType: string;
  attributionRequirement: string;
  provenanceNotes?: string;
  sourceUrl?: string;
  contentAvailability: BookContentAvailability;
  verifiedPermissible: boolean;
}

/**
 * Book search result item.
 */
export interface BookSearchResult {
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  authorName: string;
  volumeNumber: number;
  sectionId: string;
  sectionTitle: string;
  pageNumber?: number;
  snippet: string;
  matchedLanguage: 'ar' | 'en' | 'ur';
}

// ============================================================================
// Input Types for Mutation / Registration
// ============================================================================

export interface CreateBookInput {
  id: string;
  slug: string;
  titleArabic: string;
  titleEnglish: string;
  titleUrdu: string;
  authorId?: string;
  authorNameArabic: string;
  authorNameEnglish: string;
  authorNameUrdu: string;
  authorDeathYearAh?: number;
  authorDeathYearCe?: number;
  descriptionArabic?: string;
  descriptionEnglish?: string;
  descriptionUrdu?: string;
  category: BookCategory;
  originalLanguage?: string;
  volumeCount?: number;
  licenseType?: string;
  licenseStatus?: BookLicenseStatus;
  sourceUrl?: string;
  provenanceNotes?: string;
  attributionRequirement?: string;
  reviewStatus?: BookReviewStatus;
  publicationStatus?: BookPublicationStatus;
}

export interface CreateBookEditionInput {
  bookId: string;
  editionIdentifier: string;
  editionTitle: string;
  languageCode: 'ar' | 'en' | 'ur';
  publisher?: string;
  editor?: string;
  translator?: string;
  publicationYearCe?: number;
  isbn?: string;
  volumeCount?: number;
  format?: BookFormat;
  licenseType?: string;
  licenseStatus?: BookLicenseStatus;
  licenseNotes?: string;
  attributionRequirement: string;
  provenanceNotes?: string;
  sourceArchiveUrl?: string;
  reviewStatus?: BookReviewStatus;
  publicationStatus?: BookPublicationStatus;
}

export interface CreateBookSectionInput {
  bookId: string;
  editionId?: string;
  volumeNumber?: number;
  sectionNumber: number;
  parentSectionId?: string;
  titleArabic: string;
  titleEnglish?: string;
  titleUrdu?: string;
  chapterNumber?: number;
  startPage?: number;
  endPage?: number;
  orderIndex?: number;
}

export interface CreateBookContentInput {
  sectionId: string;
  bookId: string;
  editionId?: string;
  volumeNumber?: number;
  pageNumber?: number;
  paragraphIndex?: number;
  contentType?: BookContentType;
  textAr?: string | null;
  textEn?: string | null;
  textUr?: string | null;
  contentAvailability?: BookContentAvailability;
  contentSha256?: string;
  licenseStatus?: BookLicenseStatus;
  publicationStatus?: BookPublicationStatus;
}

export interface SaveReadingProgressInput {
  bookId: string;
  editionId?: string;
  volumeNumber?: number;
  sectionId?: string;
  pageNumber?: number;
  progressPercentage: number;
  clientMutationId?: string;
}
