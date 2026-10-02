/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Domain types and interfaces for the Classical Tafsir Comparative Viewer.
 * Supports Tafsir Ibn Kathir and Tafsir Al-Sa'di as canonical Phase 4 sources.
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 *
 * CONTENT SAFETY NOTE:
 * - Classical Arabic tafsir text (Ibn Kathir, Al-Sa'di): Public Domain / verified_permissible
 *   (Source: CONTENT_LICENSE_MATRIX.md, line 55)
 * - Translations of tafsir are tracked separately with their own licensing fields.
 * - No AI-generated content is labeled or treated as classical tafsir text.
 * - The presence of any scholar in this viewer does NOT constitute project endorsement
 *   of every statement, nor does it imply theological certification.
 */

export type TafsirLicenseStatus =
  | 'verified_permissible'
  | 'unverified_pending'
  | 'restricted_takedown';

export type TafsirPublicationStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'published'
  | 'restricted'
  | 'unverified'
  | 'takedown';

export type TafsirContentAvailability =
  | 'full_text'
  | 'excerpt'
  | 'metadata_only'
  | 'unavailable';

export type TafsirReviewStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'rejected';

/**
 * A classical tafsir work (e.g. Tafsir Ibn Kathir, Tafsir Al-Sa'di).
 * Metadata-level representation. Source attribution is neutral;
 * presence in this catalog does NOT constitute theological endorsement.
 */
export interface TafsirWork {
  id: string;                        // 'ibn-kathir', 'al-sadi'
  slug: string;
  titleArabic: string;
  titleEnglish: string;
  titleUrdu: string;
  authorNameArabic: string;
  authorNameEnglish: string;
  authorNameUrdu: string;
  authorDeathYearHijri?: number;
  authorDeathYearCe?: number;
  descriptionEnglish?: string;
  descriptionArabic?: string;
  descriptionUrdu?: string;
  methodologyNotes?: string;         // Factual scholarly school notes only
  licenseType: string;
  licenseStatus: TafsirLicenseStatus;
  sourceUrl?: string;
  provenanceNotes?: string;
  attributionRequirement?: string;
  isActive: boolean;
  reviewStatus: TafsirReviewStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * A specific edition or translation of a tafsir work.
 * Translations are tracked separately as they have independent copyright status.
 */
export interface TafsirEdition {
  id: string;
  workId: string;
  editionIdentifier: string;
  languageCode: 'ar' | 'en' | 'ur';
  publisher?: string;
  editor?: string;
  translator?: string;
  editionYearCe?: number;
  licenseType: string;
  licenseStatus: TafsirLicenseStatus;
  licenseNotes?: string;
  attributionRequirement: string;
  sourceArchiveUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A single tafsir commentary entry for a specific Quran ayah.
 * text_content may be null if content is not yet ingested or license is pending.
 */
export interface TafsirEntry {
  id: string;
  workId: string;
  editionId?: string;
  surahId: number;                   // 1–114
  ayahNumber: number;                // 1–286 per surah
  ayahNumberEnd?: number;            // If this entry covers a range
  languageCode: 'ar' | 'en' | 'ur';
  textContent?: string | null;       // null if unavailable (NEVER fabricated)
  contentAvailability: TafsirContentAvailability;
  sourcePageReference?: string;
  sourceEditionIdentifier?: string;
  licenseStatus: TafsirLicenseStatus;
  contentSha256?: string;
  importDate?: string;
  importSource?: string;
  publicationStatus: TafsirPublicationStatus;
  versionNumber: number;
  isCurrent: boolean;
  parentVersionId?: string;
  changeSummary?: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A comparison view grouping entries from multiple tafsir works for the same ayah.
 * Used by the comparative viewer UI.
 */
export interface TafsirComparison {
  surahId: number;
  ayahNumber: number;
  entries: {
    work: TafsirWork;
    edition?: TafsirEdition;
    entry: TafsirEntry | null;       // null = no entry available for this work
  }[];
  comparedWorkIds: string[];
}

/**
 * Input for registering a new tafsir work (admin operation).
 */
export interface CreateTafsirWorkInput {
  id: string;
  slug: string;
  titleArabic: string;
  titleEnglish: string;
  titleUrdu: string;
  authorNameArabic: string;
  authorNameEnglish: string;
  authorNameUrdu: string;
  authorDeathYearHijri?: number;
  authorDeathYearCe?: number;
  descriptionEnglish?: string;
  descriptionArabic?: string;
  descriptionUrdu?: string;
  methodologyNotes?: string;
  licenseType?: string;
  licenseStatus?: TafsirLicenseStatus;
  sourceUrl?: string;
  provenanceNotes?: string;
  attributionRequirement?: string;
}

/**
 * Input for registering a tafsir entry (admin/importer operation).
 */
export interface CreateTafsirEntryInput {
  workId: string;
  editionId?: string;
  surahId: number;
  ayahNumber: number;
  ayahNumberEnd?: number;
  languageCode: 'ar' | 'en' | 'ur';
  textContent?: string;
  contentAvailability?: TafsirContentAvailability;
  sourcePageReference?: string;
  sourceEditionIdentifier?: string;
  licenseStatus?: TafsirLicenseStatus;
  importDate?: string;
  importSource?: string;
  publicationStatus?: TafsirPublicationStatus;
}

/**
 * Tafsir provenance verification result.
 */
export interface TafsirProvenanceResult {
  workId: string;
  entryId: string;
  surahId: number;
  ayahNumber: number;
  licenseStatus: TafsirLicenseStatus;
  licenseType: string;
  contentAvailability: TafsirContentAvailability;
  publicationStatus: TafsirPublicationStatus;
  attributionText: string;
  sourceReference?: string;
  verifiedPermissible: boolean;
}
