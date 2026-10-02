/**
 * @file types.ts
 * @package @islamic/engine
 * @description Boundary types for canonical Quran text engine, structural metadata, and validation.
 */

export interface QuranEdition {
  id: string;
  name: string;
  author: string;
  editionVersion: string;
  scriptType: 'uthmani' | 'indopak' | 'clean';
  riwayah: string;
  numberingConvention: string;
  sourceUrl: string;
  downloadUrl?: string;
  license: string;
  attributionNotice: string;
  rawSourceSha256: string;
  totalSurahs: number;
  totalAyahs: number;
  status: 'draft' | 'published' | 'archived';
  createdAt?: string;
}

export interface QuranSurah {
  id: number;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  revelationType: 'meccan' | 'medinan';
  revelationOrder: number;
  ayahsCount: number;
  rukusCount: number;
  startAyahIndex: number;
}

export interface QuranAyah {
  id: number;                          // 1 to 6236 global index
  editionId: string;
  surahId: number;                     // 1 to 114
  ayahNumber: number;                  // 1 to 286
  textSourceVerbatim: string;          // Source-verbatim canonical representation from verified source
  checksumSourceVerbatim: string;      // SHA-256 hex of textSourceVerbatim (UTF-8 bytes)
  textUthmani: string;                 // Deterministically parsed structural Ayah text
  checksumAyahStructural: string;      // SHA-256 hex of textUthmani (UTF-8 bytes)
  textChecksum: string;                // Alias/compatibility field identical to checksumAyahStructural
  bismillah?: string | null;           // Surah opening Bismillah header deterministically parsed from source
  textClean: string;                   // Deterministic normalized plain text for search
  juzNumber: number;                   // 1 to 30
  hizbNumber: number;                  // 1 to 60
  rubNumber: number;                   // 1 to 240
  rukuNumber: number;                  // 1 to 556
  manzilNumber: number;                // 1 to 7
  pageNumber: number;                  // 1 to 604
  sajdah: boolean;
  sajdahType?: string | null;
}

export interface QuranValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  surahId?: number;
  ayahNumber?: number;
}

export interface QuranValidationResult {
  valid: boolean;
  totalSurahs: number;
  totalAyahs: number;
  issues: QuranValidationIssue[];
  computedDatasetHash: string;
}

export interface QuranImportManifest {
  editionId: string;
  sourceName: string;
  sourceUrl: string;
  sourceVersion: string;
  rawSourceSha256: string;
  license: string;
  attributionNotice: string;
  riwayah: string;
  numberingConvention: string;
  importedAt: string;
  importerVersion: string;
  totalSurahs: number;
  totalAyahs: number;
  validationResult: {
    passed: boolean;
    issuesCount: number;
  };
}
