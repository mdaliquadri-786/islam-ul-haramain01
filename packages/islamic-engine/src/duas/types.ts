/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Domain types and data models for Duas and Adhkar engine.
 */

export interface DuaSource {
  id: string;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string | null;
  author: string;
  authorArabic: string;
  authorDeathYearAh: number | null;
  authorDeathYearCe: number | null;
  license: string;
  description: string | null;
  status: 'draft' | 'validated' | 'published' | 'retired';
}

export interface DuaCategory {
  id: number;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string | null;
  sortOrder: number;
  totalDuas: number;
}

export interface DuaCitation {
  quranSurah: number | null;
  quranAyah: string | null;
  hadithCollection: string | null;
  hadithNumber: string | null;
  hadithReference: string | null;
  hadithGrade: string | null;
}

export interface DuaAdhkar {
  id: string;
  categoryId: number;
  categorySlug: string;
  sourceId: string;
  itemNumber: number;
  arabicText: string;
  transliteration: string | null;
  translationEnglish: string;
  translationUrdu: string | null;
  repeatCount: number;
  occasionContext: string | null;
  quranSurah: number | null;
  quranAyah: string | null;
  hadithCollection: string | null;
  hadithNumber: string | null;
  hadithReference: string | null;
  hadithGrade: string | null;
  textChecksum: string;
  textClean: string;
}

export interface DuaValidationIssue {
  duaId: string;
  categoryId: number;
  itemNumber: number;
  code: string;
  message: string;
}

export interface DuaValidationResult {
  isValid: boolean;
  totalDuas: number;
  totalCategories: number;
  issues: DuaValidationIssue[];
  datasetChecksum: string;
}
