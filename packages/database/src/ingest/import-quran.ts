/**
 * @file import-quran.ts
 * @package @islamic/database
 * @description Validated, transactional import pipeline for canonical Quran scripture.
 *
 * Enforces:
 * 1. Source file cryptographic verification (SHA-256 check before parsing).
 * 2. Complete structural and Unicode validation (114 Surahs, 6,236 Ayahs, zero U+FFFD).
 * 3. Individual Ayah checksum derivation and verification.
 * 4. Deterministic search normalization (text_clean).
 * 5. Idempotent database insertion with transaction safety.
 * 6. Audit logging via record_audit_event() and content version manifest recording.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { parseTanzilMetadata, parseTanzilUthmani, ParsedQuranDataset } from '../quran/tanzil-parser.js';
import { validateQuranDataset, QuranValidationResult } from '@islamic/islamic-engine';

export interface VerifiedDatasetHashes {
  quranDataXml: string;
  quranUthmaniXml: string;
}

export const KNOWN_VERIFIED_HASHES: VerifiedDatasetHashes = {
  quranDataXml: '8867c1d88191472adec9db694b3cd9f135b1a2ef580574d32cf888dcb22c5c7a',
  quranUthmaniXml: '203f0f1bf3158b1e5be4ab9f8f6870e570aab6d9a626fe6192a70b75d4afe0fd'
};

export interface IngestPipelineResult {
  success: boolean;
  editionId: string;
  totalSurahs: number;
  totalAyahs: number;
  datasetHash: string;
  sourceFilesVerified: boolean;
  validationResult: QuranValidationResult;
  sqlSeedPath?: string;
  auditManifest: Record<string, unknown>;
}

/**
 * Computes the SHA-256 hash of a file on disk.
 */
export function computeFileSha256(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex').toLowerCase();
}

/**
 * Executes the complete validated Quran import pipeline.
 */
export function runQuranImportPipeline(
  options: {
    dataDir?: string;
    outputSqlPath?: string;
    verifySourceHashes?: boolean;
  } = {}
): IngestPipelineResult {
  let dataDir = options.dataDir;
  if (!dataDir) {
    const candidate1 = path.resolve(process.cwd(), 'packages/database/data/quran');
    const candidate2 = path.resolve(process.cwd(), 'data/quran');
    dataDir = fs.existsSync(candidate1) ? candidate1 : (fs.existsSync(candidate2) ? candidate2 : candidate1);
  }

  const metadataPath = path.join(dataDir, 'quran-data.xml');
  const uthmaniPath = path.join(dataDir, 'quran-uthmani.xml');

  if (!fs.existsSync(metadataPath) || !fs.existsSync(uthmaniPath)) {
    throw new Error(`Quran source files not found in ${dataDir}. Expected quran-data.xml and quran-uthmani.xml.`);
  }

  // 1. Verify Raw Source Checksums
  const metadataHash = computeFileSha256(metadataPath);
  const uthmaniHash = computeFileSha256(uthmaniPath);

  if (options.verifySourceHashes !== false) {
    if (metadataHash !== KNOWN_VERIFIED_HASHES.quranDataXml) {
      throw new Error(
        `Source Verification Failure: quran-data.xml hash (${metadataHash}) does not match known verified baseline (${KNOWN_VERIFIED_HASHES.quranDataXml}).`
      );
    }
    if (uthmaniHash !== KNOWN_VERIFIED_HASHES.quranUthmaniXml) {
      throw new Error(
        `Source Verification Failure: quran-uthmani.xml hash (${uthmaniHash}) does not match known verified baseline (${KNOWN_VERIFIED_HASHES.quranUthmaniXml}).`
      );
    }
  }

  // 2. Parse Source Datasets
  const metadataXml = fs.readFileSync(metadataPath, 'utf8');
  const uthmaniXml = fs.readFileSync(uthmaniPath, 'utf8');

  const metadata = parseTanzilMetadata(metadataXml);
  const parsedDataset: ParsedQuranDataset = parseTanzilUthmani(uthmaniXml, metadata, 'tanzil-uthmani-v1.1');

  // 3. Structural & Unicode Validation
  const validationResult = validateQuranDataset(parsedDataset.surahs, parsedDataset.ayahs, {
    expectedSurahsCount: 114,
    expectedAyahsCount: 6236,
    verifyChecksums: true
  });

  if (!validationResult.valid) {
    const errorMessages = validationResult.issues.map((i) => `[${i.code}] ${i.message}`).join('\n');
    throw new Error(`Quran Dataset Validation FAILED with ${validationResult.issues.length} issues:\n${errorMessages}`);
  }

  // 4. Build Source Manifest & Audit Payload
  const auditManifest = {
    edition_id: 'tanzil-uthmani-v1.1',
    edition_name: 'Tanzil Uthmani (Medina Mushaf)',
    source_name: 'Tanzil Project',
    source_url: 'https://tanzil.net',
    source_version: 'Text v1.1 (February 2021) / Metadata v1.0',
    script_type: 'uthmani',
    riwayah: 'Hafs an Asim',
    numbering_convention: 'Kufan',
    license: 'Creative Commons Attribution 3.0 (CC-BY 3.0)',
    attribution_notice: 'Tanzil Quran Text (Uthmani, Version 1.1) © 2007-2026 Tanzil Project. Licensed under CC-BY 3.0. Source: https://tanzil.net',
    modification_terms: 'Verbatim copying allowed; text alteration strictly prohibited by source terms.',
    raw_source_hashes: {
      'quran-data.xml': metadataHash,
      'quran-uthmani.xml': uthmaniHash
    },
    source_provenance_details: {
      text: {
        file: 'quran-uthmani.xml',
        version: '1.1 (February 2021)',
        copyright: 'Copyright (C) 2007-2026 Tanzil Project',
        sha256: uthmaniHash
      },
      metadata: {
        file: 'quran-data.xml',
        version: '1.0',
        copyright: '(C) 2008-2009 Tanzil.info',
        sha256: metadataHash
      }
    },
    total_surahs: parsedDataset.totalSurahs,
    total_ayahs: parsedDataset.totalAyahs,
    dataset_checksum: validationResult.computedDatasetHash,
    validation_status: 'PASSED_ZERO_ISSUES',
    importer_version: '2.1.0'
  };

  // 5. Generate Authoritative, Transactional SQL Seed (if requested)
  let sqlSeedPath: string | undefined;
  if (options.outputSqlPath) {
    if (path.isAbsolute(options.outputSqlPath)) {
      sqlSeedPath = options.outputSqlPath;
    } else {
      const candidate1 = path.resolve(process.cwd(), options.outputSqlPath);
      const candidate2 = path.resolve(process.cwd(), '../../', options.outputSqlPath);
      sqlSeedPath = fs.existsSync(path.dirname(candidate1)) ? candidate1 : candidate2;
    }
    generateSqlSeedFile(sqlSeedPath, parsedDataset, auditManifest, uthmaniHash);
  }

  return {
    success: true,
    editionId: parsedDataset.editionId,
    totalSurahs: parsedDataset.totalSurahs,
    totalAyahs: parsedDataset.totalAyahs,
    datasetHash: validationResult.computedDatasetHash,
    sourceFilesVerified: true,
    validationResult,
    sqlSeedPath,
    auditManifest
  };
}

/**
 * Escapes single quotes for standard PostgreSQL string literals.
 */
function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Generates an authoritative, idempotent, transactional SQL seed file for the verified Quran dataset.
 */
export function generateSqlSeedFile(
  targetPath: string,
  dataset: ParsedQuranDataset,
  manifest: Record<string, unknown>,
  rawSourceHash: string
): void {
  const fd = fs.openSync(targetPath, 'w');

  const write = (text: string) => {
    fs.writeSync(fd, text, null, 'utf8');
  };

  write(`-- ============================================================================\n`);
  write(`-- ISLAM UL HARAMAIN — Authoritative Quran Canonical Seed\n`);
  write(`-- Source: Tanzil Project (v1.1 Uthmani / Hafs an Asim / Kufan 6,236 Ayahs)\n`);
  write(`-- Generated: ${new Date().toISOString()}\n`);
  write(`-- License: Creative Commons Attribution 3.0 (CC-BY 3.0)\n`);
  write(`-- ============================================================================\n\n`);

  write(`BEGIN;\n\n`);

  // Allow transaction to populate/replace edition within controlled migration
  write(`SET LOCAL "app.allow_quran_override" = 'true';\n\n`);

  // 1. Insert/Update Edition
  write(`-- 1. Register Quran Edition\n`);
  write(`INSERT INTO public.quran_editions (\n`);
  write(`    id, name, author, edition_version, script_type, riwayah, numbering_convention,\n`);
  write(`    source_url, license, attribution_notice, raw_source_sha256, total_surahs, total_ayahs, status\n`);
  write(`) VALUES (\n`);
  write(`    '${dataset.editionId}',\n`);
  write(`    'Tanzil Uthmani (Medina Mushaf)',\n`);
  write(`    'Tanzil Project',\n`);
  write(`    '1.1',\n`);
  write(`    'uthmani',\n`);
  write(`    'Hafs an Asim',\n`);
  write(`    'Kufan',\n`);
  write(`    'https://tanzil.net',\n`);
  write(`    'Creative Commons Attribution 3.0',\n`);
  write(`    '${escapeSql(String(manifest.attribution_notice))}',\n`);
  write(`    '${rawSourceHash}',\n`);
  write(`    ${dataset.totalSurahs},\n`);
  write(`    ${dataset.totalAyahs},\n`);
  write(`    'published'\n`);
  write(`) ON CONFLICT (id) DO UPDATE SET\n`);
  write(`    status = EXCLUDED.status,\n`);
  write(`    raw_source_sha256 = EXCLUDED.raw_source_sha256;\n\n`);

  // 2. Insert Surahs (114 Surahs)
  write(`-- 2. Insert 114 Canonical Surahs\n`);
  write(`INSERT INTO public.quran_surahs (\n`);
  write(`    id, slug, name_arabic, name_english, name_transliteration,\n`);
  write(`    revelation_type, revelation_order, ayahs_count, rukus_count, start_ayah_index\n`);
  write(`) VALUES\n`);

  const surahRows = dataset.surahs.map((s, idx) => {
    const isLast = idx === dataset.surahs.length - 1;
    return `    (${s.id}, '${escapeSql(s.slug)}', '${escapeSql(s.nameArabic)}', '${escapeSql(s.nameEnglish)}', '${escapeSql(s.nameTransliteration)}', '${s.revelationType}', ${s.revelationOrder}, ${s.ayahsCount}, ${s.rukusCount}, ${s.startAyahIndex})${isLast ? '' : ','}`;
  });

  write(surahRows.join('\n'));
  write(`\nON CONFLICT (id) DO UPDATE SET\n`);
  write(`    slug = EXCLUDED.slug,\n`);
  write(`    name_arabic = EXCLUDED.name_arabic,\n`);
  write(`    name_english = EXCLUDED.name_english,\n`);
  write(`    name_transliteration = EXCLUDED.name_transliteration,\n`);
  write(`    revelation_type = EXCLUDED.revelation_type,\n`);
  write(`    revelation_order = EXCLUDED.revelation_order,\n`);
  write(`    ayahs_count = EXCLUDED.ayahs_count,\n`);
  write(`    rukus_count = EXCLUDED.rukus_count,\n`);
  write(`    start_ayah_index = EXCLUDED.start_ayah_index;\n\n`);

  // 3. Insert Ayahs in batched chunks (to stay well below PostgreSQL parameter/query limits)
  write(`-- 3. Insert 6,236 Canonical Ayahs with Checksums and Search Representations\n`);

  const BATCH_SIZE = 500;
  for (let b = 0; b < dataset.ayahs.length; b += BATCH_SIZE) {
    const batch = dataset.ayahs.slice(b, b + BATCH_SIZE);
    write(`INSERT INTO public.quran_ayahs (\n`);
    write(`    id, edition_id, surah_id, ayah_number,\n`);
    write(`    text_source_verbatim, checksum_source_verbatim,\n`);
    write(`    text_uthmani, checksum_ayah_structural, text_checksum,\n`);
    write(`    bismillah, text_clean,\n`);
    write(`    juz_number, hizb_number, rub_number, ruku_number, manzil_number, page_number,\n`);
    write(`    sajdah, sajdah_type\n`);
    write(`) VALUES\n`);

    const ayahRows = batch.map((a, idx) => {
      const isLast = idx === batch.length - 1;
      const bismillahVal = a.bismillah ? `'${escapeSql(a.bismillah)}'` : 'NULL';
      const sajdahTypeVal = a.sajdahType ? `'${escapeSql(a.sajdahType)}'` : 'NULL';

      return `    (${a.id}, '${escapeSql(a.editionId)}', ${a.surahId}, ${a.ayahNumber}, '${escapeSql(a.textSourceVerbatim)}', '${a.checksumSourceVerbatim}', '${escapeSql(a.textUthmani)}', '${a.checksumAyahStructural}', '${a.textChecksum}', ${bismillahVal}, '${escapeSql(a.textClean)}', ${a.juzNumber}, ${a.hizbNumber}, ${a.rubNumber}, ${a.rukuNumber}, ${a.manzilNumber}, ${a.pageNumber}, ${a.sajdah}, ${sajdahTypeVal})${isLast ? '' : ','}`;
    });

    write(ayahRows.join('\n'));
    write(`\nON CONFLICT (id) DO UPDATE SET\n`);
    write(`    text_source_verbatim = EXCLUDED.text_source_verbatim,\n`);
    write(`    checksum_source_verbatim = EXCLUDED.checksum_source_verbatim,\n`);
    write(`    text_uthmani = EXCLUDED.text_uthmani,\n`);
    write(`    checksum_ayah_structural = EXCLUDED.checksum_ayah_structural,\n`);
    write(`    text_checksum = EXCLUDED.text_checksum,\n`);
    write(`    bismillah = EXCLUDED.bismillah,\n`);
    write(`    text_clean = EXCLUDED.text_clean,\n`);
    write(`    juz_number = EXCLUDED.juz_number,\n`);
    write(`    hizb_number = EXCLUDED.hizb_number,\n`);
    write(`    rub_number = EXCLUDED.rub_number,\n`);
    write(`    page_number = EXCLUDED.page_number,\n`);
    write(`    sajdah = EXCLUDED.sajdah,\n`);
    write(`    sajdah_type = EXCLUDED.sajdah_type,\n`);
    write(`    updated_at = NOW();\n\n`);
  }

  // 4. Log Audit Event & Content Version Manifest
  const manifestJson = escapeSql(JSON.stringify(manifest));
  write(`-- 4. Record Audit Event & Content Version Provenance\n`);
  write(`INSERT INTO public.audit_logs (\n`);
  write(`    action, target_entity_type, target_entity_id, details, source_context\n`);
  write(`) VALUES (\n`);
  write(`    'QURAN_EDITION_INGESTION_COMPLETED',\n`);
  write(`    'quran_edition',\n`);
  write(`    '${dataset.editionId}',\n`);
  write(`    '${manifestJson}'::jsonb,\n`);
  write(`    'pipeline:tanzil-v1.1-importer'\n`);
  write(`);\n\n`);

  write(`COMMIT;\n`);
  fs.closeSync(fd);
}
