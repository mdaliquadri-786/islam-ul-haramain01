/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Boundary types and data models for the Hadith computational engine,
 * supporting Kutub al-Sittah collections, books, narrations, sanad/matn separation,
 * and authenticated scholar grading attribution.
 */

export type HadithCollectionId =
  | 'bukhari'
  | 'muslim'
  | 'abu-dawud'
  | 'tirmidhi'
  | 'nasai'
  | 'ibn-majah'
  | string;

export type HadithGradeLevel =
  | 'sahih'
  | 'hasan'
  | 'daif'
  | 'mawdu';

export type ScholarRole =
  | 'compiler'
  | 'evaluator'
  | 'commentator'
  | 'scholar';

export interface ScholarAuthor {
  id: string; // UUID or deterministic slug-id
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu?: string;
  deathYearAh?: number;
  deathYearCe?: number;
  era: 'classical' | 'contemporary';
  role: ScholarRole;
  biographySummary?: string;
}

export interface HadithCollection {
  id: HadithCollectionId;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  authorId: string;
  totalHadiths: number;
  totalBooks: number;
  description?: string;
  provenanceNotes?: string;
  sourceEdition: string;
  sourceUrl: string;
  status: 'draft' | 'validated' | 'published' | 'retired';
}

export interface HadithBook {
  id?: number;
  collectionId: string;
  bookNumber: number;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu?: string;
  hadithStartNumber: number;
  hadithEndNumber: number;
  totalHadiths: number;
}

export interface HadithGrading {
  id?: number;
  hadithId?: number;
  hadithNumber: number;
  collectionId: string;
  scholarId: string;
  scholarSlug?: string;
  scholarName?: string;
  grade: string; // e.g. 'Sahih', 'Hasan', 'Daif', 'Sahih li Ghayrihi'
  gradeArabic: string; // e.g. 'صحيح', 'حسن', 'ضعيف'
  gradeLevel: HadithGradeLevel;
  scholarlyCommentary?: string;
  referenceSource: string;
}

export interface HadithNarration {
  id?: number;
  collectionId: string;
  bookNumber: number;
  hadithNumber: number;
  inBookReference?: string;
  internationalNumber?: number; // Darussalam numbering
  chapterTitleArabic?: string;
  chapterTitleEnglish?: string;
  sanadArabic?: string | null;
  matnArabic: string;
  matnClean: string;
  translationEnglish?: string;
  translationUrdu?: string;
  textChecksum: string; // SHA-256 of matnArabic UTF-8 bytes
  sourceEdition: string;
  gradings?: HadithGrading[];
}

export interface HadithValidationIssue {
  collectionId: string;
  hadithNumber: number;
  code: string;
  message: string;
}

export interface HadithValidationResult {
  valid: boolean;
  totalHadiths: number;
  totalBooks: number;
  totalGradings: number;
  datasetChecksum: string;
  issues: HadithValidationIssue[];
}
