/**
 * @file import-translations.ts
 * @package @islamic/database
 * @description Validated, transactional import pipeline for Quran translations (Saheeh International & Jalandhari).
 *
 * Enforces:
 * 1. Source file cryptographic verification (SHA-256 check before parsing).
 * 2. Complete structural and Unicode validation (114 Surahs, 6,236 Ayahs, zero U+FFFD).
 * 3. Individual Ayah checksum derivation and verification.
 * 4. Referential alignment with canonical M2.1 Ayah IDs.
 * 5. Idempotent database insertion with transaction safety.
 * 6. Audit logging via record_audit_event() and content version manifest recording.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import {
  parseTanzilTranslation,
  TranslationSourceConfig
} from '../quran/tanzil-translation-parser.js';
import { parseTanzilMetadata } from '../quran/tanzil-parser.js';
import {
  validateTranslationDataset,
  TranslationValidationResult,
  ParsedTranslationDataset
} from '@islamic/islamic-engine';

export interface VerifiedTranslationHashes {
  enSahihTxt: string;
  urJalandhryTxt: string;
}

export const KNOWN_TRANSLATION_HASHES: VerifiedTranslationHashes = {
  enSahihTxt: 'a1778a1a56695d9b59ae910809ec46d9f4a55f05961de51cd56e6ebcf9040883',
  urJalandhryTxt: 'c7e982b49b5e6f275559985caaf24f5e0136950f73f50f1a6c6f6a5281617c6a'
};

export const SAHEEH_INTERNATIONAL_CONFIG: TranslationSourceConfig = {
  id: 'en.sahih',
  slug: 'saheeh-international',
  languageCode: 'en',
  title: 'Saheeh International (English Translation)',
  translator: 'Saheeh International',
  sourceName: 'Tanzil Project Translations Repository',
  sourceUrl: 'https://tanzil.net/trans/',
  sourceVersion: 'April 24, 2011',
  publisher: 'Abul-Qasim Publishing House',
  publicationYear: 1997,
  license: 'Non-Commercial Permissible with Attribution',
  copyrightStatement:
    'Copyright (C) 1997 Saheeh International / Abul-Qasim Publishing House. Distributed non-commercially with attribution via Tanzil Project.',
  attributionText:
    'Translation by Saheeh International. Provided via Tanzil Project (https://tanzil.net/trans/).',
  sourceFileName: 'en.sahih.txt',
  sourceSha256: KNOWN_TRANSLATION_HASHES.enSahihTxt
};

export const JALANDHARI_CONFIG: TranslationSourceConfig = {
  id: 'ur.jalandhry',
  slug: 'fateh-muhammad-jalandhari',
  languageCode: 'ur',
  title: 'مولانا فتح محمد جالندھری (اردو ترجمہ)',
  translator: 'Fateh Muhammad Jalandhry',
  sourceName: 'Tanzil Project Translations Repository',
  sourceUrl: 'https://tanzil.net/trans/',
  sourceVersion: 'December 24, 2010',
  publisher: 'Historical Public Domain (Subcontinent Heritage)',
  publicationYear: 1900,
  license: 'Public Domain',
  copyrightStatement:
    'Public Domain (first published 1900, Amritsar). Digitized and verified via Tanzil Project.',
  attributionText:
    'Urdu translation by Maulana Fateh Muhammad Jalandhari (Public Domain). Provided via Tanzil Project (https://tanzil.net/trans/).',
  sourceFileName: 'ur.jalandhry.txt',
  sourceSha256: KNOWN_TRANSLATION_HASHES.urJalandhryTxt
};

export interface TranslationIngestResult {
  success: boolean;
  editions: {
    editionId: string;
    totalSurahs: number;
    totalAyahs: number;
    datasetHash: string;
    validationResult: TranslationValidationResult;
  }[];
  sqlSeedPath?: string;
  auditManifest: Record<string, unknown>;
}

/**
 * Computes SHA-256 hash of a file on disk.
 */
function computeFileSha256(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex').toLowerCase();
}

/**
 * Escapes single quotes for standard SQL text literals.
 */
function sqlEscape(val: string | null | undefined): string {
  if (val === null || val === undefined) return 'NULL';
  return `'${val.replace(/'/g, "''")}'`;
}

/**
 * Executes the complete validated Quran translation import pipeline for both Saheeh International and Jalandhari.
 */
export function runTranslationImportPipeline(
  options: {
    dataDir?: string;
    outputSqlPath?: string;
    verifySourceHashes?: boolean;
  } = {}
): TranslationIngestResult {
  let dataDir = options.dataDir;
  if (!dataDir) {
    const candidate1 = path.resolve(process.cwd(), 'packages/database/data/quran');
    const candidate2 = path.resolve(process.cwd(), 'data/quran');
    dataDir = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : candidate1);
  }

  const translationsDir = path.join(dataDir, 'translations');
  const metadataPath = path.join(dataDir, 'quran-data.xml');
  const enPath = path.join(translationsDir, 'en.sahih.txt');
  const urPath = path.join(translationsDir, 'ur.jalandhry.txt');

  if (!fs.existsSync(metadataPath)) {
    throw new Error(`Quran metadata file not found at ${metadataPath}.`);
  }
  if (!fs.existsSync(enPath) || !fs.existsSync(urPath)) {
    throw new Error(`Translation files not found in ${translationsDir}. Expected en.sahih.txt and ur.jalandhry.txt.`);
  }

  // 1. Verify Raw Source Hashes
  const enHash = computeFileSha256(enPath);
  const urHash = computeFileSha256(urPath);

  if (options.verifySourceHashes !== false) {
    if (enHash !== KNOWN_TRANSLATION_HASHES.enSahihTxt) {
      throw new Error(
        `Source Verification Failure: en.sahih.txt hash (${enHash}) does not match known baseline (${KNOWN_TRANSLATION_HASHES.enSahihTxt}).`
      );
    }
    if (urHash !== KNOWN_TRANSLATION_HASHES.urJalandhryTxt) {
      throw new Error(
        `Source Verification Failure: ur.jalandhry.txt hash (${urHash}) does not match known baseline (${KNOWN_TRANSLATION_HASHES.urJalandhryTxt}).`
      );
    }
  }

  // 2. Parse Reference Metadata
  const metadataXml = fs.readFileSync(metadataPath, 'utf8');
  const metadata = parseTanzilMetadata(metadataXml);

  // 3. Parse Translation Datasets
  const enContent = fs.readFileSync(enPath, 'utf8');
  const urContent = fs.readFileSync(urPath, 'utf8');

  const enDataset: ParsedTranslationDataset = parseTanzilTranslation(enContent, SAHEEH_INTERNATIONAL_CONFIG);
  const urDataset: ParsedTranslationDataset = parseTanzilTranslation(urContent, JALANDHARI_CONFIG);

  // 4. Validate Datasets
  const enValidation = validateTranslationDataset(enDataset.edition, enDataset.ayahs, metadata.surahs);
  if (!enValidation.valid) {
    throw new Error(
      `Validation Failure for ${enDataset.edition.id}: ${enValidation.issues.map((i) => i.message).join('; ')}`
    );
  }

  const urValidation = validateTranslationDataset(urDataset.edition, urDataset.ayahs, metadata.surahs);
  if (!urValidation.valid) {
    throw new Error(
      `Validation Failure for ${urDataset.edition.id}: ${urValidation.issues.map((i) => i.message).join('; ')}`
    );
  }

  // 5. Assemble Audit Manifest
  const auditManifest = {
    event: 'QURAN_TRANSLATION_IMPORT_VERIFIED',
    timestamp: new Date().toISOString(),
    importer_version: '2.2.0',
    editions: [
      {
        id: enDataset.edition.id,
        slug: enDataset.edition.slug,
        title: enDataset.edition.title,
        translator: enDataset.edition.translator,
        language: enDataset.edition.languageCode,
        source_sha256: enHash,
        dataset_sha256: enValidation.computedDatasetHash,
        total_ayahs: enDataset.totalAyahs,
        license: enDataset.edition.license,
        validation_status: 'PASSED_ZERO_ISSUES'
      },
      {
        id: urDataset.edition.id,
        slug: urDataset.edition.slug,
        title: urDataset.edition.title,
        translator: urDataset.edition.translator,
        language: urDataset.edition.languageCode,
        source_sha256: urHash,
        dataset_sha256: urValidation.computedDatasetHash,
        total_ayahs: urDataset.totalAyahs,
        license: urDataset.edition.license,
        validation_status: 'PASSED_ZERO_ISSUES'
      }
    ]
  };

  // 6. Generate Authoritative, Transactional SQL Seed (if requested)
  let sqlSeedPath: string | undefined;
  if (options.outputSqlPath) {
    if (path.isAbsolute(options.outputSqlPath)) {
      sqlSeedPath = options.outputSqlPath;
    } else {
      const candidate1 = path.resolve(process.cwd(), options.outputSqlPath);
      const candidate2 = path.resolve(process.cwd(), '../../', options.outputSqlPath);
      sqlSeedPath = fs.existsSync(path.dirname(candidate1)) ? candidate1 : candidate2;
    }
    generateTranslationSqlSeedFile(sqlSeedPath, [enDataset, urDataset], auditManifest);
  }

  return {
    success: true,
    editions: [
      {
        editionId: enDataset.edition.id,
        totalSurahs: enDataset.totalSurahs,
        totalAyahs: enDataset.totalAyahs,
        datasetHash: enValidation.computedDatasetHash,
        validationResult: enValidation
      },
      {
        editionId: urDataset.edition.id,
        totalSurahs: urDataset.totalSurahs,
        totalAyahs: urDataset.totalAyahs,
        datasetHash: urValidation.computedDatasetHash,
        validationResult: urValidation
      }
    ],
    sqlSeedPath,
    auditManifest
  };
}

/**
 * Generates an idempotent, fully transactional PostgreSQL seed file for translations.
 */
export function generateTranslationSqlSeedFile(
  targetPath: string,
  datasets: ParsedTranslationDataset[],
  manifest: Record<string, unknown>
): void {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const fd = fs.openSync(targetPath, 'w');
  const write = (text: string) => {
    fs.writeSync(fd, text, null, 'utf8');
  };

  write(`-- Seed: seed_quran_translations.sql\n`);
  write(`-- Description: Authoritative, verified Quran translations seed (Saheeh International & Jalandhari).\n`);
  write(`-- Generated At: ${new Date().toISOString()}\n`);
  write(`-- Total Editions: ${datasets.length}\n`);
  write(`-- Total Ayah Translations: ${datasets.reduce((acc, d) => acc + d.totalAyahs, 0)}\n\n`);

  write(`BEGIN;\n\n`);
  write(`-- Set break-glass session setting for controlled seed generation\n`);
  write(`SET LOCAL "app.allow_quran_override" = 'true';\n\n`);

  // Insert Editions
  write(`-- ============================================================================\n`);
  write(`-- 1. Quran Translation Editions\n`);
  write(`-- ============================================================================\n\n`);

  for (const ds of datasets) {
    const e = ds.edition;
    write(
      `INSERT INTO public.quran_translation_editions (\n` +
      `    id, slug, language_code, title, translator, source_name, source_url, source_version,\n` +
      `    publisher, publication_year, license, copyright_statement, attribution_text,\n` +
      `    source_file_name, source_sha256, dataset_sha256, source_acquired_at, total_surahs, total_ayahs, status\n` +
      `) VALUES (\n` +
      `    ${sqlEscape(e.id)}, ${sqlEscape(e.slug)}, ${sqlEscape(e.languageCode)}, ${sqlEscape(e.title)},\n` +
      `    ${sqlEscape(e.translator)}, ${sqlEscape(e.sourceName)}, ${sqlEscape(e.sourceUrl)}, ${sqlEscape(e.sourceVersion)},\n` +
      `    ${sqlEscape(e.publisher)}, ${e.publicationYear ?? 'NULL'}, ${sqlEscape(e.license)}, ${sqlEscape(e.copyrightStatement)},\n` +
      `    ${sqlEscape(e.attributionText)}, ${sqlEscape(e.sourceFileName)}, ${sqlEscape(e.sourceSha256)},\n` +
      `    ${sqlEscape(e.datasetSha256)}, ${sqlEscape(e.sourceAcquiredAt)}, ${e.totalSurahs}, ${e.totalAyahs}, 'published'\n` +
      `) ON CONFLICT (id) DO UPDATE SET\n` +
      `    title = EXCLUDED.title,\n` +
      `    attribution_text = EXCLUDED.attribution_text,\n` +
      `    dataset_sha256 = EXCLUDED.dataset_sha256,\n` +
      `    updated_at = NOW();\n\n`
    );
  }

  // Insert Translated Ayahs in batches
  write(`-- ============================================================================\n`);
  write(`-- 2. Quran Translated Ayahs\n`);
  write(`-- ============================================================================\n\n`);

  for (const ds of datasets) {
    write(`-- Ingesting Edition: ${ds.edition.id} (${ds.edition.title}) - ${ds.totalAyahs} Ayahs\n`);
    const BATCH_SIZE = 100;
    for (let i = 0; i < ds.ayahs.length; i += BATCH_SIZE) {
      const batch = ds.ayahs.slice(i, i + BATCH_SIZE);
      write(
        `INSERT INTO public.quran_translations (\n` +
        `    edition_id, surah_number, ayah_number, ayah_id, translation_text, translator_note, source_reference, text_checksum\n` +
        `) VALUES\n`
      );

      const rowsSql = batch.map((a) => {
        return (
          `  (${sqlEscape(ds.edition.id)}, ${a.surahNumber}, ${a.ayahNumber}, ${a.ayahId}, ` +
          `${sqlEscape(a.translationText)}, ${sqlEscape(a.translatorNote)}, ${sqlEscape(a.sourceReference)}, ${sqlEscape(a.textChecksum)})`
        );
      });

      write(rowsSql.join(',\n'));
      write(
        `\nON CONFLICT (edition_id, surah_number, ayah_number) DO UPDATE SET\n` +
        `    ayah_id = EXCLUDED.ayah_id,\n` +
        `    translation_text = EXCLUDED.translation_text,\n` +
        `    translator_note = EXCLUDED.translator_note,\n` +
        `    text_checksum = EXCLUDED.text_checksum;\n\n`
      );
    }
  }

  // Record Audit Event
  write(`-- ============================================================================\n`);
  write(`-- 3. Ingestion Audit Record\n`);
  write(`-- ============================================================================\n\n`);

  const manifestJson = JSON.stringify(manifest).replace(/'/g, "''");
  write(
    `SELECT public.record_audit_event(\n` +
    `    p_action := 'QURAN_TRANSLATION_INGEST',\n` +
    `    p_target_entity_type := 'quran_translation_editions',\n` +
    `    p_target_entity_id := 'bilingual-en-ur',\n` +
    `    p_details := '${manifestJson}'::jsonb,\n` +
    `    p_source_context := 'packages/database/src/ingest/import-translations.ts'\n` +
    `);\n\n`
  );

  write(`COMMIT;\n`);
  fs.closeSync(fd);
}

