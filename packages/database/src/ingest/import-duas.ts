/**
 * @file import-duas.ts
 * @package @islamic/database
 * @description Ingestion pipeline for Duas & Adhkar engine, categories, authentic
 *              supplications from Hisn al-Muslim, cryptographic checksums, and seed generation.
 */

import * as fs from 'node:fs';
import {
  validateDuaDataset,
  DuaCategory,
  DuaSource,
  DuaAdhkar
} from '@islamic/islamic-engine';
import { loadDuaCorpus, ParsedDuaCorpus } from '../duas/duas-parser.js';

export interface DuaImportOptions {
  dataDir?: string;
  outputSqlPath?: string;
}

export interface DuaImportResult {
  success: boolean;
  totalSources: number;
  totalCategories: number;
  totalDuas: number;
  datasetChecksum: string;
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
 * Generates an idempotent SQL seed file for the Duas & Adhkar engine.
 */
export function generateDuaSqlSeedFile(
  outputPath: string,
  corpus: ParsedDuaCorpus,
  auditManifest: any
): void {
  const sqlChunks: string[] = [];

  sqlChunks.push(`-- ============================================================================
-- ISLAM UL HARAMAIN (إسلام الحرمين)
-- DUAS & ADHKAR ENGINE SEED DATA (M2.4)
-- Generated: ${auditManifest.timestamp}
-- Total Sources: ${corpus.sources.length}
-- Total Categories: ${corpus.categories.length}
-- Total Duas: ${corpus.duas.length}
-- Dataset Checksum: ${corpus.summary.datasetChecksum}
-- ============================================================================

BEGIN;

-- Temporarily enable seed override for idempotent updates
SET LOCAL app.allow_dua_override = 'true';

-- 1. Dua Sources Registry
`);

  for (const s of corpus.sources) {
    sqlChunks.push(
      `INSERT INTO public.dua_sources (id, slug, name_arabic, name_english, name_urdu, author, author_arabic, author_death_year_ah, author_death_year_ce, license, description, status) VALUES (${escapeSql(s.id)}, ${escapeSql(s.slug)}, ${escapeSql(s.name_arabic)}, ${escapeSql(s.name_english)}, ${escapeSql(s.name_urdu)}, ${escapeSql(s.author)}, ${escapeSql(s.author_arabic)}, ${s.author_death_year_ah !== null ? s.author_death_year_ah : 'NULL'}, ${s.author_death_year_ce !== null ? s.author_death_year_ce : 'NULL'}, ${escapeSql(s.license)}, ${escapeSql(s.description)}, ${escapeSql(s.status)})\nON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, author = EXCLUDED.author, author_arabic = EXCLUDED.author_arabic, author_death_year_ah = EXCLUDED.author_death_year_ah, author_death_year_ce = EXCLUDED.author_death_year_ce, license = EXCLUDED.license, description = EXCLUDED.description, status = EXCLUDED.status;\n`
    );
  }

  sqlChunks.push(`\n-- 2. Dua Categories\n`);

  for (const c of corpus.categories) {
    sqlChunks.push(
      `INSERT INTO public.dua_categories (id, slug, name_arabic, name_english, name_urdu, sort_order, total_duas) VALUES (${c.id}, ${escapeSql(c.slug)}, ${escapeSql(c.name_arabic)}, ${escapeSql(c.name_english)}, ${escapeSql(c.name_urdu)}, ${c.sort_order}, ${c.total_duas})\nON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name_arabic = EXCLUDED.name_arabic, name_english = EXCLUDED.name_english, name_urdu = EXCLUDED.name_urdu, sort_order = EXCLUDED.sort_order, total_duas = EXCLUDED.total_duas;\n`
    );
  }

  sqlChunks.push(`\n-- 3. Duas & Adhkar Records\n`);

  // Batch insert duas in chunks of 50
  const CHUNK_SIZE = 50;
  for (let i = 0; i < corpus.duas.length; i += CHUNK_SIZE) {
    const chunk = corpus.duas.slice(i, i + CHUNK_SIZE);
    sqlChunks.push(
      `INSERT INTO public.duas_adhkar (id, dua_id, category_id, source_id, item_number, arabic_text, transliteration, translation_english, translation_urdu, repeat_count, occasion_context, quran_surah, quran_ayah, hadith_collection, hadith_number, hadith_reference, hadith_grade, text_checksum, text_clean, version_number, is_current, status) VALUES\n`
    );

    const rowStrings = chunk.map(
      (d) =>
        `  (${d.id}, ${escapeSql(d.dua_id)}, ${d.category_id}, ${escapeSql(d.source_id)}, ${d.item_number}, ${escapeSql(d.arabic_text)}, ${escapeSql(d.transliteration)}, ${escapeSql(d.translation_english)}, ${escapeSql(d.translation_urdu)}, ${d.repeat_count}, ${escapeSql(d.occasion_context)}, ${d.quran_surah !== null ? d.quran_surah : 'NULL'}, ${escapeSql(d.quran_ayah)}, ${escapeSql(d.hadith_collection)}, ${escapeSql(d.hadith_number)}, ${escapeSql(d.hadith_reference)}, ${escapeSql(d.hadith_grade)}, ${escapeSql(d.text_checksum)}, ${escapeSql(d.text_clean)}, ${d.version_number}, ${d.is_current ? 'TRUE' : 'FALSE'}, ${escapeSql(d.status)})`
    );

    sqlChunks.push(
      rowStrings.join(',\n') +
        `\nON CONFLICT (dua_id) DO UPDATE SET category_id = EXCLUDED.category_id, source_id = EXCLUDED.source_id, item_number = EXCLUDED.item_number, arabic_text = EXCLUDED.arabic_text, transliteration = EXCLUDED.transliteration, translation_english = EXCLUDED.translation_english, translation_urdu = EXCLUDED.translation_urdu, repeat_count = EXCLUDED.repeat_count, occasion_context = EXCLUDED.occasion_context, quran_surah = EXCLUDED.quran_surah, quran_ayah = EXCLUDED.quran_ayah, hadith_collection = EXCLUDED.hadith_collection, hadith_number = EXCLUDED.hadith_number, hadith_reference = EXCLUDED.hadith_reference, hadith_grade = EXCLUDED.hadith_grade, text_checksum = EXCLUDED.text_checksum, text_clean = EXCLUDED.text_clean, version_number = EXCLUDED.version_number, is_current = EXCLUDED.is_current, status = EXCLUDED.status, updated_at = NOW();\n\n`
    );
  }

  // Reset category sequence to max id
  sqlChunks.push(`-- Reset primary key sequences
SELECT setval('public.dua_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.dua_categories));
SELECT setval('public.duas_adhkar_id_seq', (SELECT COALESCE(MAX(id), 1) FROM public.duas_adhkar));

COMMIT;
`);

  fs.writeFileSync(outputPath, sqlChunks.join(''), 'utf8');
}

/**
 * Runs the full Duas & Adhkar ingestion pipeline.
 */
export function runDuaImportPipeline(options: DuaImportOptions = {}): DuaImportResult {
  const startTime = Date.now();

  // 1. Read sources from disk
  const t0 = Date.now();
  const corpus = loadDuaCorpus(options.dataDir);
  const sourceReadMs = Date.now() - t0;

  // 2. Validate dataset
  const t1 = Date.now();
  const engineCategories: DuaCategory[] = corpus.categories.map((c) => ({
    id: c.id!,
    slug: c.slug,
    nameArabic: c.name_arabic,
    nameEnglish: c.name_english,
    nameUrdu: c.name_urdu ?? null,
    sortOrder: c.sort_order,
    totalDuas: c.total_duas
  }));

  const engineSources: DuaSource[] = corpus.sources.map((s) => ({
    id: s.id,
    slug: s.slug,
    nameArabic: s.name_arabic,
    nameEnglish: s.name_english,
    nameUrdu: s.name_urdu ?? null,
    author: s.author,
    authorArabic: s.author_arabic,
    authorDeathYearAh: s.author_death_year_ah ?? null,
    authorDeathYearCe: s.author_death_year_ce ?? null,
    license: s.license,
    description: s.description ?? null,
    status: s.status as any
  }));

  const categoryMap = new Map(corpus.categories.map((c) => [c.id!, c.slug]));

  const engineDuas: DuaAdhkar[] = corpus.duas.map((d) => ({
    id: d.dua_id,
    categoryId: d.category_id,
    categorySlug: d.category_slug || categoryMap.get(d.category_id) || '',
    sourceId: d.source_id,
    itemNumber: d.item_number,
    arabicText: d.arabic_text,
    transliteration: d.transliteration ?? null,
    translationEnglish: d.translation_english,
    translationUrdu: d.translation_urdu ?? null,
    repeatCount: d.repeat_count,
    occasionContext: d.occasion_context ?? null,
    quranSurah: d.quran_surah ?? null,
    quranAyah: d.quran_ayah ?? null,
    hadithCollection: d.hadith_collection ?? null,
    hadithNumber: d.hadith_number ?? null,
    hadithReference: d.hadith_reference ?? null,
    hadithGrade: d.hadith_grade ?? null,
    textChecksum: d.text_checksum,
    textClean: d.text_clean
  }));

  const valRes = validateDuaDataset(engineDuas, engineCategories, engineSources, {
    minDuas: 200,
    checkChecksums: true,
    checkEncoding: true
  });

  if (!valRes.isValid) {
    const errorDetails = valRes.issues.map((i) => `[${i.code}] ${i.message}`).join('\n');
    throw new Error(`Dua dataset validation failed with ${valRes.issues.length} errors:\n${errorDetails}`);
  }
  const validationMs = Date.now() - t1;

  // 3. Generate SQL seed
  let generatedSeedPath: string | undefined;
  let generatedSeedBytes: number | undefined;
  let sqlGenerationMs = 0;

  if (options.outputSqlPath) {
    const t2 = Date.now();
    const auditManifest = {
      timestamp: new Date().toISOString(),
      datasetChecksum: corpus.summary.datasetChecksum,
      totalSources: corpus.summary.totalSources,
      totalCategories: corpus.summary.totalCategories,
      totalDuas: corpus.summary.totalDuas
    };

    generateDuaSqlSeedFile(options.outputSqlPath, corpus, auditManifest);
    sqlGenerationMs = Date.now() - t2;

    const stats = fs.statSync(options.outputSqlPath);
    generatedSeedPath = options.outputSqlPath;
    generatedSeedBytes = stats.size;
  }

  const totalMs = Date.now() - startTime;

  return {
    success: true,
    totalSources: corpus.summary.totalSources,
    totalCategories: corpus.summary.totalCategories,
    totalDuas: corpus.summary.totalDuas,
    datasetChecksum: corpus.summary.datasetChecksum,
    generatedSeedPath,
    generatedSeedBytes,
    timings: {
      sourceReadMs,
      validationMs,
      sqlGenerationMs,
      totalMs
    }
  };
}
