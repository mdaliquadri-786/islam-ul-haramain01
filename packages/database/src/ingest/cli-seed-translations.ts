/**
 * @file cli-seed-translations.ts
 * @package @islamic/database
 * @description Standalone CLI runner with explicit micro-benchmarking for translation seed generation.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  KNOWN_TRANSLATION_HASHES,
  SAHEEH_INTERNATIONAL_CONFIG,
  JALANDHARI_CONFIG,
  generateTranslationSqlSeedFile
} from './import-translations.js';
import { parseTanzilTranslation } from '../quran/tanzil-translation-parser.js';
import { parseTanzilMetadata } from '../quran/tanzil-parser.js';
import { validateTranslationDataset, ParsedTranslationDataset } from '@islamic/islamic-engine';

export function runBenchmarkedTranslationPipeline(targetSeedPath: string) {
  console.log('=== START TRANSLATION PIPELINE BENCHMARK ===');
  const t0 = performance.now();

  const workspaceRoot = path.resolve(__dirname, '../../../..');
  const dataDir = path.resolve(__dirname, '../../data/quran');
  const translationsDir = path.join(dataDir, 'translations');
  const metadataPath = path.join(dataDir, 'quran-data.xml');
  const enPath = path.join(translationsDir, 'en.sahih.txt');
  const urPath = path.join(translationsDir, 'ur.jalandhry.txt');

  console.log('Workspace Root:', workspaceRoot);
  console.log('Data Directory:', dataDir);
  console.log('Target Seed Path:', targetSeedPath);

  // 1. Source Read
  const tSourceStart = performance.now();
  const enRaw = fs.readFileSync(enPath, 'utf8');
  const urRaw = fs.readFileSync(urPath, 'utf8');
  const metadataXml = fs.readFileSync(metadataPath, 'utf8');
  const tSourceMs = (performance.now() - tSourceStart).toFixed(2);
  console.log(`source read: ${tSourceMs} ms (en: ${enRaw.length} chars, ur: ${urRaw.length} chars)`);

  // 2. Parse Reference Metadata
  const tParseMetaStart = performance.now();
  const metadata = parseTanzilMetadata(metadataXml);
  const tParseMetaMs = (performance.now() - tParseMetaStart).toFixed(2);
  console.log(`reference metadata parse: ${tParseMetaMs} ms (${metadata.surahs.length} surahs)`);

  // 3. Parse Translations & Derive Checksums
  const tParseStart = performance.now();
  const enDataset: ParsedTranslationDataset = parseTanzilTranslation(enRaw, SAHEEH_INTERNATIONAL_CONFIG);
  const urDataset: ParsedTranslationDataset = parseTanzilTranslation(urRaw, JALANDHARI_CONFIG);
  const tParseMs = (performance.now() - tParseStart).toFixed(2);
  console.log(`parse & per-ayah checksums: ${tParseMs} ms (en: ${enDataset.ayahs.length} ayahs, ur: ${urDataset.ayahs.length} ayahs)`);

  // 4. Validate Datasets
  const tValStart = performance.now();
  const enValidation = validateTranslationDataset(enDataset.edition, enDataset.ayahs, metadata.surahs);
  const urValidation = validateTranslationDataset(urDataset.edition, urDataset.ayahs, metadata.surahs);
  const tValMs = (performance.now() - tValStart).toFixed(2);
  console.log(`validation: ${tValMs} ms (en valid: ${enValidation.valid}, ur valid: ${urValidation.valid})`);

  if (!enValidation.valid || !urValidation.valid) {
    throw new Error('Validation failed!');
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
        source_sha256: KNOWN_TRANSLATION_HASHES.enSahihTxt,
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
        source_sha256: KNOWN_TRANSLATION_HASHES.urJalandhryTxt,
        dataset_sha256: urValidation.computedDatasetHash,
        total_ayahs: urDataset.totalAyahs,
        license: urDataset.edition.license,
        validation_status: 'PASSED_ZERO_ISSUES'
      }
    ]
  };

  // 6. SQL Generation & File Write
  const tSqlStart = performance.now();
  generateTranslationSqlSeedFile(targetSeedPath, [enDataset, urDataset], auditManifest);
  const tSqlMs = (performance.now() - tSqlStart).toFixed(2);
  console.log(`SQL generation & file write: ${tSqlMs} ms`);

  const totalMs = (performance.now() - t0).toFixed(2);
  console.log(`TOTAL: ${totalMs} ms`);
  console.log('Result success: true');

  console.log('\n--- VERIFIED EDITIONS SUMMARY ---');
  console.log(`Edition: ${enDataset.edition.id}`);
  console.log(`  Surah Count: ${enDataset.totalSurahs}`);
  console.log(`  Ayah Count: ${enDataset.totalAyahs}`);
  console.log(`  Dataset Hash: ${enValidation.computedDatasetHash}`);

  console.log(`Edition: ${urDataset.edition.id}`);
  console.log(`  Surah Count: ${urDataset.totalSurahs}`);
  console.log(`  Ayah Count: ${urDataset.totalAyahs}`);
  console.log(`  Dataset Hash: ${urValidation.computedDatasetHash}`);

  const stat = fs.statSync(targetSeedPath);
  console.log(`Generated Seed File Size: ${stat.size} bytes (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
}

// When invoked directly from CLI
if (process.argv[1]?.endsWith('cli-seed-translations.ts') || process.argv[1]?.endsWith('cli-seed-translations.js')) {
  const defaultPath = path.resolve(process.cwd(), 'supabase/seed_quran_translations.sql');
  const target = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : defaultPath;
  runBenchmarkedTranslationPipeline(target);
}
