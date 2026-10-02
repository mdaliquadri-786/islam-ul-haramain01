/**
 * @file import-hadith.ts
 * @package @islamic/database
 * @description Ingestion pipeline for Hadith collections, books, narrations,
 *              cryptographic checksums, and authenticated multi-scholar gradings.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  validateHadithDataset,
  HadithCollection,
  HadithBook,
  HadithNarration,
  HadithGrading
} from '@islamic/islamic-engine';
import { loadHadithCorpus, ParsedHadithCorpus } from '../hadith/hadith-parser.js';

export interface HadithImportOptions {
  dataDir?: string;
  outputSqlPath?: string;
}

export interface HadithImportResult {
  success: boolean;
  totalScholars: number;
  totalCollections: number;
  totalBooks: number;
  totalNarrations: number;
  totalGradings: number;
  summaries: Record<string, {
    collectionId: string;
    totalBooks: number;
    totalNarrations: number;
    totalGradings: number;
    datasetChecksum: string;
  }>;
  generatedSeedPath?: string;
  generatedSeedBytes?: number;
  timings: {
    sourceReadMs: number;
    validationMs: number;
    sqlGenerationMs: number;
    totalMs: number;
  };
}

function escapeSql(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

/**
 * Generates an idempotent SQL seed file for the Hadith collections engine.
 */
export function generateHadithSqlSeedFile(
  outputPath: string,
  corpus: ParsedHadithCorpus,
  auditManifest: any
): void {
  const sqlChunks: string[] = [];

  sqlChunks.push(`-- ============================================================================
-- ISLAM UL HARAMAIN (إسلام الحرمين)
-- HADITH COLLECTIONS ENGINE SEED DATA (M2.3)
-- Generated: ${auditManifest.timestamp}
-- Total Scholars: ${corpus.scholars.length}
-- Total Collections: ${corpus.collections.length}
-- Total Books: ${corpus.books.length}
-- Total Narrations: ${corpus.narrations.length}
-- Total Gradings: ${corpus.gradings.length}
-- ============================================================================

BEGIN;

-- Temporarily enable seed override for idempotent updates
SET LOCAL app.allow_hadith_override = 'true';

-- 1. Scholars & Authors Registry
`);

  for (const s of corpus.scholars) {
    sqlChunks.push(
      `INSERT INTO public.scholars_authors (id, slug, name_arabic, name_english, name_urdu, death_year_ah, death_year_ce, era, role, biography_summary) VALUES (${escapeSql(s.id)}, ${escapeSql(s.slug)}, ${escapeSql(s.name_arabic)}, ${escapeSql(s.name_english)}, ${escapeSql(s.name_urdu)}, ${s.death_year_ah !== null ? s.death_year_ah : 'NULL'}, ${s.death_year_ce !== null ? s.death_year_ce : 'NULL'}, ${escapeSql(s.era)}, ${escapeSql(s.role)}, ${escapeSql(s.biography_summary)})\nON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, death_year_ah = EXCLUDED.death_year_ah, death_year_ce = EXCLUDED.death_year_ce, era = EXCLUDED.era, role = EXCLUDED.role, biography_summary = EXCLUDED.biography_summary;\n`
    );
  }

  sqlChunks.push(`\n-- 2. Hadith Collections\n`);

  for (const c of corpus.collections) {
    sqlChunks.push(
      `INSERT INTO public.hadith_collections (id, slug, name_arabic, name_english, name_urdu, author_id, total_hadiths, total_books, description, provenance_notes, source_edition, source_url, status) VALUES (${escapeSql(c.id)}, ${escapeSql(c.slug)}, ${escapeSql(c.name_arabic)}, ${escapeSql(c.name_english)}, ${escapeSql(c.name_urdu)}, ${escapeSql(c.author_id)}, ${c.total_hadiths}, ${c.total_books}, ${escapeSql(c.description)}, ${escapeSql(c.provenance_notes)}, ${escapeSql(c.source_edition)}, ${escapeSql(c.source_url)}, ${escapeSql(c.status)})\nON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, author_id = EXCLUDED.author_id, total_hadiths = EXCLUDED.total_hadiths, total_books = EXCLUDED.total_books, description = EXCLUDED.description, provenance_notes = EXCLUDED.provenance_notes, source_edition = EXCLUDED.source_edition, source_url = EXCLUDED.source_url, status = EXCLUDED.status;\n`
    );
  }

  sqlChunks.push(`\n-- 3. Hadith Books / Chapters\n`);

  // Batch insert books
  const bookChunks: string[] = [];
  for (const b of corpus.books) {
    bookChunks.push(
      `(${b.id !== undefined ? b.id : 'DEFAULT'}, ${escapeSql(b.collection_id)}, ${b.book_number}, ${escapeSql(b.name_arabic)}, ${escapeSql(b.name_english)}, ${escapeSql(b.name_urdu)}, ${b.hadith_start_number}, ${b.hadith_end_number}, ${b.total_hadiths})`
    );
  }

  // Insert in batches of 100
  const BOOK_BATCH_SIZE = 100;
  for (let i = 0; i < bookChunks.length; i += BOOK_BATCH_SIZE) {
    const batch = bookChunks.slice(i, i + BOOK_BATCH_SIZE);
    sqlChunks.push(
      `INSERT INTO public.hadith_books (id, collection_id, book_number, name_arabic, name_english, name_urdu, hadith_start_number, hadith_end_number, total_hadiths) VALUES\n  ${batch.join(',\n  ')}\nON CONFLICT (collection_id, book_number) DO UPDATE SET name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, hadith_start_number = EXCLUDED.hadith_start_number, hadith_end_number = EXCLUDED.hadith_end_number, total_hadiths = EXCLUDED.total_hadiths;\n`
    );
  }

  sqlChunks.push(`\n-- 4. Hadith Narrations (Canons with cryptographic checksums)\n`);

  const narrationChunks: string[] = [];
  for (const n of corpus.narrations) {
    narrationChunks.push(
      `(${n.id !== undefined ? n.id : 'DEFAULT'}, ${escapeSql(n.collection_id)}, ${n.book_id}, ${n.hadith_number}, ${escapeSql(n.in_book_reference)}, ${n.international_number !== null && n.international_number !== undefined ? n.international_number : 'NULL'}, ${escapeSql(n.chapter_title_arabic)}, ${escapeSql(n.chapter_title_english)}, ${escapeSql(n.sanad_arabic)}, ${escapeSql(n.matn_arabic)}, ${escapeSql(n.matn_clean)}, ${escapeSql(n.translation_english)}, ${escapeSql(n.translation_urdu)}, ${escapeSql(n.text_checksum)}, ${escapeSql(n.source_edition)}, ${n.version_number || 1}, ${n.is_current !== false ? 'TRUE' : 'FALSE'}, ${escapeSql(n.status || 'published')})`
    );
  }

  const NARRATION_BATCH_SIZE = 50;
  for (let i = 0; i < narrationChunks.length; i += NARRATION_BATCH_SIZE) {
    const batch = narrationChunks.slice(i, i + NARRATION_BATCH_SIZE);
    sqlChunks.push(
      `INSERT INTO public.hadith_narrations (id, collection_id, book_id, hadith_number, in_book_reference, international_number, chapter_title_arabic, chapter_title_english, sanad_arabic, matn_arabic, matn_clean, translation_english, translation_urdu, text_checksum, source_edition, version_number, is_current, status) VALUES\n  ${batch.join(',\n  ')}\nON CONFLICT (collection_id, hadith_number, version_number) DO UPDATE SET in_book_reference = EXCLUDED.in_book_reference, international_number = EXCLUDED.international_number, sanad_arabic = EXCLUDED.sanad_arabic, matn_arabic = EXCLUDED.matn_arabic, matn_clean = EXCLUDED.matn_clean, translation_english = EXCLUDED.translation_english, translation_urdu = EXCLUDED.translation_urdu, text_checksum = EXCLUDED.text_checksum, source_edition = EXCLUDED.source_edition, is_current = EXCLUDED.is_current, status = EXCLUDED.status;\n`
    );
  }

  sqlChunks.push(`\n-- 5. Hadith Gradings (Attributed Authenticity Evaluations)\n`);

  const gradingChunks: string[] = [];
  for (const g of corpus.gradings) {
    gradingChunks.push(
      `(${g.id !== undefined ? g.id : 'DEFAULT'}, ${g.hadith_id}, ${escapeSql(g.scholar_id)}, ${escapeSql(g.grade)}, ${escapeSql(g.grade_arabic)}, ${escapeSql(g.grade_level)}, ${escapeSql(g.scholarly_commentary)}, ${escapeSql(g.reference_source)})`
    );
  }

  const GRADING_BATCH_SIZE = 100;
  for (let i = 0; i < gradingChunks.length; i += GRADING_BATCH_SIZE) {
    const batch = gradingChunks.slice(i, i + GRADING_BATCH_SIZE);
    sqlChunks.push(
      `INSERT INTO public.hadith_gradings (id, hadith_id, scholar_id, grade, grade_arabic, grade_level, scholarly_commentary, reference_source) VALUES\n  ${batch.join(',\n  ')}\nON CONFLICT (hadith_id, scholar_id) DO UPDATE SET grade = EXCLUDED.grade, grade_arabic = EXCLUDED.grade_arabic, grade_level = EXCLUDED.grade_level, scholarly_commentary = EXCLUDED.scholarly_commentary, reference_source = EXCLUDED.reference_source;\n`
    );
  }

  sqlChunks.push(`
COMMIT;
-- End of Hadith Collections Engine Seed Data
`);

  fs.writeFileSync(outputPath, sqlChunks.join(''), 'utf8');
}

/**
 * Executes the complete Hadith import pipeline.
 */
export function runHadithImportPipeline(options: HadithImportOptions = {}): HadithImportResult {
  const t0 = performance.now();
  const dataDir = options.dataDir || path.resolve(__dirname, '../../data/hadith');
  const outputSqlPath = options.outputSqlPath || path.resolve(__dirname, '../../../../supabase/seed_hadith.sql');

  // 1. Source Read & Parse
  const tReadStart = performance.now();
  const corpus = loadHadithCorpus(dataDir);
  const sourceReadMs = performance.now() - tReadStart;

  // 2. Validate Datasets via @islamic/islamic-engine
  const tValStart = performance.now();
  for (const c of corpus.collections) {
    const colBooks: HadithBook[] = corpus.books
      .filter((b) => b.collection_id === c.id)
      .map((b) => ({
        id: b.id,
        collectionId: b.collection_id,
        bookNumber: b.book_number,
        nameArabic: b.name_arabic,
        nameEnglish: b.name_english,
        nameUrdu: b.name_urdu || undefined,
        hadithStartNumber: b.hadith_start_number,
        hadithEndNumber: b.hadith_end_number,
        totalHadiths: b.total_hadiths
      }));

    const colNarrations: HadithNarration[] = corpus.narrations
      .filter((n) => n.collection_id === c.id)
      .map((n) => ({
        id: n.id,
        collectionId: n.collection_id,
        bookNumber: 1,
        hadithNumber: n.hadith_number,
        inBookReference: n.in_book_reference || undefined,
        internationalNumber: n.international_number || undefined,
        chapterTitleArabic: n.chapter_title_arabic || undefined,
        chapterTitleEnglish: n.chapter_title_english || undefined,
        sanadArabic: n.sanad_arabic || undefined,
        matnArabic: n.matn_arabic,
        matnClean: n.matn_clean,
        translationEnglish: n.translation_english || undefined,
        translationUrdu: n.translation_urdu || undefined,
        textChecksum: n.text_checksum,
        sourceEdition: n.source_edition
      }));

    const colNarrationIds = new Set(colNarrations.map((n) => n.id));
    const colGradings: HadithGrading[] = corpus.gradings
      .filter((g) => colNarrationIds.has(g.hadith_id))
      .map((g) => {
        const narration = colNarrations.find((n) => n.id === g.hadith_id);
        return {
          id: g.id,
          hadithId: g.hadith_id,
          hadithNumber: narration ? narration.hadithNumber : 1,
          collectionId: c.id,
          scholarId: g.scholar_id,
          grade: g.grade,
          gradeArabic: g.grade_arabic,
          gradeLevel: g.grade_level,
          scholarlyCommentary: g.scholarly_commentary || undefined,
          referenceSource: g.reference_source
        };
      });

    const engineCollection: HadithCollection = {
      id: c.id,
      slug: c.slug,
      nameArabic: c.name_arabic,
      nameEnglish: c.name_english,
      nameUrdu: c.name_urdu,
      authorId: c.author_id,
      totalHadiths: c.total_hadiths,
      totalBooks: c.total_books,
      description: c.description || undefined,
      provenanceNotes: c.provenance_notes || undefined,
      sourceEdition: c.source_edition,
      sourceUrl: c.source_url,
      status: c.status
    };

    const valResult = validateHadithDataset(engineCollection, colBooks, colNarrations, colGradings, {
      checkChecksums: true,
      checkEncoding: true,
      minHadiths: 50 // each collection has at least 50 narrations in benchmark
    });

    if (!valResult.valid) {
      throw new Error(`Validation failed for collection ${c.id}: ${JSON.stringify(valResult.issues, null, 2)}`);
    }
  }
  const validationMs = performance.now() - tValStart;

  // 3. Assemble Audit Manifest
  const auditManifest = {
    event: 'HADITH_COLLECTIONS_ENGINE_IMPORT_VERIFIED',
    timestamp: new Date().toISOString(),
    importerVersion: '2.3.0',
    totalScholars: corpus.scholars.length,
    totalCollections: corpus.collections.length,
    totalBooks: corpus.books.length,
    totalNarrations: corpus.narrations.length,
    totalGradings: corpus.gradings.length,
    summaries: corpus.summaries
  };

  // 4. SQL Generation & File Write
  const tSqlStart = performance.now();
  generateHadithSqlSeedFile(outputSqlPath, corpus, auditManifest);
  const sqlGenerationMs = performance.now() - tSqlStart;

  const totalMs = performance.now() - t0;
  const stat = fs.statSync(outputSqlPath);

  return {
    success: true,
    totalScholars: corpus.scholars.length,
    totalCollections: corpus.collections.length,
    totalBooks: corpus.books.length,
    totalNarrations: corpus.narrations.length,
    totalGradings: corpus.gradings.length,
    summaries: corpus.summaries,
    generatedSeedPath: outputSqlPath,
    generatedSeedBytes: stat.size,
    timings: {
      sourceReadMs,
      validationMs,
      sqlGenerationMs,
      totalMs
    }
  };
}
