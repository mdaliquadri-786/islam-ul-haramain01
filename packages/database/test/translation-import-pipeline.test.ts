/**
 * @file translation-import-pipeline.test.ts
 * @package @islamic/database
 * @description Integration and verification tests for the Quran translation import pipeline.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  runTranslationImportPipeline,
  KNOWN_TRANSLATION_HASHES,
  SAHEEH_INTERNATIONAL_CONFIG
} from '../src/ingest/import-translations.js';
import { parseTanzilTranslation } from '../src/quran/tanzil-translation-parser.js';


describe('Quran Translation Import Pipeline & Seed Generation', () => {
  const scratchDir = path.resolve(process.cwd(), 'scratch/test-translation-import');
  const tempSeedPath = path.join(scratchDir, 'temp_seed_translations.sql');

  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  it('should successfully execute pipeline with verified Tanzil translation sources', () => {
    const result = runTranslationImportPipeline({
      outputSqlPath: tempSeedPath,
      verifySourceHashes: true
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.editions.length, 2);

    const en = result.editions.find((e) => e.editionId === 'en.sahih');
    assert.ok(en, 'English edition en.sahih must be present');
    assert.strictEqual(en.totalSurahs, 114);
    assert.strictEqual(en.totalAyahs, 6236);
    assert.strictEqual(en.validationResult.valid, true);
    assert.strictEqual(en.validationResult.issues.length, 0);
    assert.strictEqual(en.datasetHash.length, 64);

    const ur = result.editions.find((e) => e.editionId === 'ur.jalandhry');
    assert.ok(ur, 'Urdu edition ur.jalandhry must be present');
    assert.strictEqual(ur.totalSurahs, 114);
    assert.strictEqual(ur.totalAyahs, 6236);
    assert.strictEqual(ur.validationResult.valid, true);
    assert.strictEqual(ur.validationResult.issues.length, 0);
    assert.strictEqual(ur.datasetHash.length, 64);

    // Verify SQL seed file was created and contains valid content
    assert.ok(fs.existsSync(tempSeedPath), 'Generated SQL seed file must exist');
    const seedContent = fs.readFileSync(tempSeedPath, 'utf8');
    assert.ok(seedContent.includes("INSERT INTO public.quran_translation_editions"), 'Must insert translation editions');
    assert.ok(seedContent.includes("INSERT INTO public.quran_translations"), 'Must insert translated Ayahs');
    assert.ok(seedContent.includes("p_action := 'QURAN_TRANSLATION_INGEST'"), 'Must record audit event');
    assert.ok(seedContent.startsWith('-- Seed: seed_quran_translations.sql'), 'Must have seed header');
    assert.ok(seedContent.endsWith('COMMIT;\n'), 'Must be transactionally enclosed');
  });

  it('should abort immediately if raw source files are tampered with or do not match verified hashes', () => {
    const fakeDataDir = path.join(scratchDir, 'tampered-data');
    const fakeTransDir = path.join(fakeDataDir, 'translations');
    fs.mkdirSync(fakeTransDir, { recursive: true });

    // Copy metadata
    fs.copyFileSync(
      path.resolve(process.cwd(), 'data/quran/quran-data.xml'),
      path.join(fakeDataDir, 'quran-data.xml')
    );

    // Create tampered translation files
    fs.writeFileSync(path.join(fakeTransDir, 'en.sahih.txt'), '1|1|Tampered text\n');
    fs.writeFileSync(path.join(fakeTransDir, 'ur.jalandhry.txt'), '1|1|Tampered text\n');

    assert.throws(
      () => {
        runTranslationImportPipeline({
          dataDir: fakeDataDir,
          verifySourceHashes: true
        });
      },
      (err: Error) => {
        return err.message.includes('Source Verification Failure');
      },
      'Expected pipeline to abort on hash mismatch'
    );

    // Clean up tampered data dir
    fs.rmSync(fakeDataDir, { recursive: true, force: true });
  });

  it('should produce identical output when executed repeatedly (idempotence)', () => {
    const run1 = runTranslationImportPipeline({ verifySourceHashes: true });
    const run2 = runTranslationImportPipeline({ verifySourceHashes: true });

    assert.strictEqual(run1.editions[0].datasetHash, run2.editions[0].datasetHash);
    assert.strictEqual(run1.editions[1].datasetHash, run2.editions[1].datasetHash);
  });

  it('should detect when even a single character is tampered in translation text', () => {
    const run = runTranslationImportPipeline({ verifySourceHashes: true });
    const originalHash = run.editions[0].datasetHash;

    // Simulate tampering on a single Ayah in a test copy
    const candidate1 = path.resolve(process.cwd(), 'data/quran');
    const candidate2 = path.resolve(process.cwd(), 'packages/database/data/quran');
    const dataDir = fs.existsSync(candidate1) ? candidate1 : candidate2;
    const enContent = fs.readFileSync(path.join(dataDir, 'translations/en.sahih.txt'), 'utf8');
    // Tamper one character
    const tamperedContent = enContent.replace('Alif, Lam, Meem.', 'Alif, Lam, Meem!');
    const tamperedDataset = parseTanzilTranslation(tamperedContent, SAHEEH_INTERNATIONAL_CONFIG);

    assert.notStrictEqual(
      tamperedDataset.datasetSha256,
      originalHash,
      'Tampering one character must change the dataset SHA-256'
    );
  });
});

