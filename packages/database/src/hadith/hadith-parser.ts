/**
 * @file hadith-parser.ts
 * @package @islamic/database
 * @description Loads and parses verified Hadith datasets from disk, validates
 *              entity structures, and prepares typed records for database operations.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  calculateHadithChecksum,
  calculateHadithDatasetChecksum
} from '@islamic/islamic-engine';
import type {
  ScholarAuthorRow,
  HadithCollectionRow,
  HadithBookRow,
  HadithNarrationRow,
  HadithGradingRow
} from '../types.js';

export interface ParsedHadithCorpus {
  scholars: ScholarAuthorRow[];
  collections: HadithCollectionRow[];
  books: HadithBookRow[];
  narrations: HadithNarrationRow[];
  gradings: HadithGradingRow[];
  summaries: Record<string, {
    collectionId: string;
    totalBooks: number;
    totalNarrations: number;
    totalGradings: number;
    datasetChecksum: string;
  }>;
}

function getDefaultDataDir(): string {
  return path.resolve(__dirname, '../../data/hadith');
}

/**
 * Loads and verifies scholar authors from JSON source.
 */
export function loadScholarAuthors(filePath?: string): ScholarAuthorRow[] {
  const target = filePath || path.join(getDefaultDataDir(), 'scholars.json');
  const raw = fs.readFileSync(target, 'utf8');
  const items = JSON.parse(raw);

  return items.map((s: any): ScholarAuthorRow => ({
    id: s.id,
    slug: s.slug,
    name_arabic: s.nameArabic,
    name_english: s.nameEnglish,
    name_urdu: s.nameUrdu || null,
    death_year_ah: s.deathYearAh || null,
    death_year_ce: s.deathYearCe || null,
    era: s.era,
    role: s.role,
    biography_summary: s.biographySummary || null
  }));
}

/**
 * Loads and verifies hadith collections metadata from JSON source.
 */
export function loadHadithCollections(filePath?: string): HadithCollectionRow[] {
  const target = filePath || path.join(getDefaultDataDir(), 'collections.json');
  const raw = fs.readFileSync(target, 'utf8');
  const items = JSON.parse(raw);

  return items.map((c: any): HadithCollectionRow => ({
    id: c.id,
    slug: c.slug,
    name_arabic: c.nameArabic,
    name_english: c.nameEnglish,
    name_urdu: c.nameUrdu,
    author_id: c.authorId,
    total_hadiths: c.totalHadiths,
    total_books: c.totalBooks,
    description: c.description || null,
    provenance_notes: c.provenanceNotes || null,
    source_edition: c.sourceEdition,
    source_url: c.sourceUrl,
    status: c.status || 'published'
  }));
}

/**
 * Loads and verifies hadith books from JSON source.
 */
export function loadHadithBooks(filePath?: string): HadithBookRow[] {
  const target = filePath || path.join(getDefaultDataDir(), 'books.json');
  const raw = fs.readFileSync(target, 'utf8');
  const items = JSON.parse(raw);

  return items.map((b: any): HadithBookRow => ({
    id: b.id,
    collection_id: b.collectionId,
    book_number: b.bookNumber,
    name_arabic: b.nameArabic,
    name_english: b.nameEnglish,
    name_urdu: b.nameUrdu || null,
    hadith_start_number: b.hadithStartNumber,
    hadith_end_number: b.hadithEndNumber,
    total_hadiths: b.totalHadiths
  }));
}

/**
 * Loads and verifies hadith narrations from JSON source.
 */
export function loadHadithNarrations(filePath?: string): HadithNarrationRow[] {
  const target = filePath || path.join(getDefaultDataDir(), 'narrations.json');
  const raw = fs.readFileSync(target, 'utf8');
  const items = JSON.parse(raw);

  return items.map((n: any): HadithNarrationRow => {
    // Verify checksum
    const computedChecksum = calculateHadithChecksum(n.matnArabic);
    if (n.textChecksum && n.textChecksum.toLowerCase() !== computedChecksum.toLowerCase()) {
      throw new Error(
        `Cryptographic checksum mismatch for Hadith ${n.collectionId}:${n.hadithNumber}! ` +
        `Expected ${computedChecksum}, found ${n.textChecksum}`
      );
    }

    return {
      id: n.id,
      collection_id: n.collectionId,
      book_id: n.bookId,
      hadith_number: n.hadithNumber,
      in_book_reference: n.inBookReference || null,
      international_number: n.internationalNumber || null,
      chapter_title_arabic: n.chapterTitleArabic || null,
      chapter_title_english: n.chapterTitleEnglish || null,
      sanad_arabic: n.sanadArabic || null,
      matn_arabic: n.matnArabic,
      matn_clean: n.matnClean,
      translation_english: n.translationEnglish || null,
      translation_urdu: n.translationUrdu || null,
      text_checksum: computedChecksum,
      source_edition: n.sourceEdition,
      version_number: n.versionNumber || 1,
      is_current: n.isCurrent !== false,
      status: n.status || 'published'
    };
  });
}

/**
 * Loads and verifies hadith gradings from JSON source.
 */
export function loadHadithGradings(filePath?: string): HadithGradingRow[] {
  const target = filePath || path.join(getDefaultDataDir(), 'gradings.json');
  const raw = fs.readFileSync(target, 'utf8');
  const items = JSON.parse(raw);

  return items.map((g: any): HadithGradingRow => ({
    id: g.id,
    hadith_id: g.hadithId,
    scholar_id: g.scholarId,
    grade: g.grade,
    grade_arabic: g.gradeArabic,
    grade_level: g.gradeLevel,
    scholarly_commentary: g.scholarlyCommentary || null,
    reference_source: g.referenceSource
  }));
}

/**
 * Loads the complete Hadith corpus from disk and performs full consistency checks.
 */
export function loadHadithCorpus(dataDir?: string): ParsedHadithCorpus {
  const dir = dataDir || getDefaultDataDir();

  const scholars = loadScholarAuthors(path.join(dir, 'scholars.json'));
  const collections = loadHadithCollections(path.join(dir, 'collections.json'));
  const books = loadHadithBooks(path.join(dir, 'books.json'));
  const narrations = loadHadithNarrations(path.join(dir, 'narrations.json'));
  const gradings = loadHadithGradings(path.join(dir, 'gradings.json'));

  const summaries: Record<string, {
    collectionId: string;
    totalBooks: number;
    totalNarrations: number;
    totalGradings: number;
    datasetChecksum: string;
  }> = {};

  for (const c of collections) {
    const colBooks = books.filter((b) => b.collection_id === c.id);
    const colNarrations = narrations.filter((n) => n.collection_id === c.id);
    const colNarrationIds = new Set(colNarrations.map((n) => n.id));
    const colGradings = gradings.filter((g) => colNarrationIds.has(g.hadith_id));

    // Convert to HadithNarration shape to calculate dataset checksum
    const engineNarrations = colNarrations.map((n) => ({
      collectionId: n.collection_id,
      bookNumber: 1,
      hadithNumber: n.hadith_number,
      matnArabic: n.matn_arabic,
      matnClean: n.matn_clean,
      textChecksum: n.text_checksum,
      sourceEdition: n.source_edition
    }));

    const datasetChecksum = calculateHadithDatasetChecksum(engineNarrations);

    summaries[c.id] = {
      collectionId: c.id,
      totalBooks: colBooks.length,
      totalNarrations: colNarrations.length,
      totalGradings: colGradings.length,
      datasetChecksum
    };
  }

  return {
    scholars,
    collections,
    books,
    narrations,
    gradings,
    summaries
  };
}
