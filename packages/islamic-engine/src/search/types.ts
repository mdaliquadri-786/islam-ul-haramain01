/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Boundary types for Multi-lingual Full-Text Search (FTS) & Citation Router.
 * Milestone: Phase 2 -> Milestone 2.5
 */

export type SearchResultType = 'quran_ayah' | 'quran_translation' | 'hadith' | 'dua';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  reference: string;
  canonicalUrl: string;
  arabicText?: string;
  translationText?: string;
  transliteration?: string;
  score: number;
  matchField?: 'citation' | 'arabic' | 'english' | 'urdu' | 'mixed';
  highlightSnippet?: string;
  metadata?: Record<string, unknown>;
}

export type CitationType = 'quran' | 'hadith';

export interface ParsedQuranCitation {
  type: 'quran';
  surahNumber: number;
  ayahNumber: number;
  surahNameEnglish: string;
  surahNameArabic: string;
  surahNameTransliteration: string;
  rawQuery: string;
}

export interface ParsedHadithCitation {
  type: 'hadith';
  collectionId: string;
  collectionNameEnglish: string;
  collectionNameArabic: string;
  hadithNumber: number;
  rawQuery: string;
}

export type ParsedCitation = ParsedQuranCitation | ParsedHadithCitation;

export interface ResolvedCitation {
  isDirectCitation: true;
  citation: ParsedCitation;
  canonicalUrl: string;
  displayText: string;
  previewArabic?: string;
  previewTranslation?: string;
}

export interface SearchQuery {
  query: string;
  typeFilter?: SearchResultType[];
  language?: 'all' | 'arabic' | 'english' | 'urdu';
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  query: string;
  citation: ResolvedCitation | null;
  results: SearchResult[];
  total: number;
  limit: number;
  offset: number;
  executionTimeMs: number;
}
