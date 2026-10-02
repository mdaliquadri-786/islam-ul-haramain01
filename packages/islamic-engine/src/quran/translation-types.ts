/**
 * @file translation-types.ts
 * @package @islamic/islamic-engine
 * @description Strongly typed domain definitions for Quran translation editions and Ayah translations.
 */

export type TranslationStatus = 'draft' | 'validated' | 'published' | 'retired';

export interface QuranTranslationEdition {
  id: string; // e.g. 'en.sahih', 'ur.jalandhry'
  slug: string; // e.g. 'saheeh-international', 'fateh-muhammad-jalandhari'
  languageCode: string; // 'en', 'ur'
  title: string;
  translator: string;
  sourceName: string;
  sourceUrl: string;
  sourceVersion: string;
  publisher?: string;
  publicationYear?: number;
  license: string;
  copyrightStatement: string;
  attributionText: string;
  sourceFileName: string;
  sourceSha256: string;
  datasetSha256: string;
  sourceAcquiredAt: string;
  totalSurahs: number;
  totalAyahs: number;
  status: TranslationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuranTranslationAyah {
  surahNumber: number; // 1 to 114
  ayahNumber: number; // 1 to 286
  ayahId: number; // Global Ayah index 1 to 6236 (matching quran_ayahs.id)
  translationText: string; // Verbatim translation text
  translatorNote?: string; // Optional footnote / translator clarification
  sourceReference?: string;
  textChecksum: string; // 64-char lowercase SHA-256 of translationText (UTF-8 bytes)
}

export interface ParsedTranslationDataset {
  edition: QuranTranslationEdition;
  ayahs: QuranTranslationAyah[];
  totalSurahs: number;
  totalAyahs: number;
  datasetSha256: string;
}

export interface TranslationValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  surahNumber?: number;
  ayahNumber?: number;
}

export interface TranslationValidationResult {
  valid: boolean;
  editionId: string;
  totalSurahs: number;
  totalAyahs: number;
  issues: TranslationValidationIssue[];
  computedDatasetHash: string;
}
