/**
 * @file quran-import-pipeline.test.ts
 * @description Integration test for the validated Quran import pipeline and SQL seed generator.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { runQuranImportPipeline, KNOWN_VERIFIED_HASHES } from '../src/ingest/import-quran.js';

describe('Quran Import Pipeline & Seed Generation', () => {
  const testSeedOutputPath = path.resolve(__dirname, '../../../supabase/test_seed_quran.sql');

  it('should successfully execute pipeline with verified Tanzil sources', () => {
    const result = runQuranImportPipeline({
      outputSqlPath: testSeedOutputPath,
      verifySourceHashes: true
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.totalSurahs, 114);
    assert.strictEqual(result.totalAyahs, 6236);
    assert.strictEqual(result.sourceFilesVerified, true);
    assert.strictEqual(result.validationResult.valid, true);
    assert.strictEqual(result.validationResult.issues.length, 0);

    // Verify manifest contents
    assert.strictEqual(result.auditManifest.edition_id, 'tanzil-uthmani-v1.1');
    assert.strictEqual(result.auditManifest.source_name, 'Tanzil Project');
    assert.strictEqual(result.auditManifest.riwayah, 'Hafs an Asim');
    assert.strictEqual(result.auditManifest.numbering_convention, 'Kufan');
    assert.strictEqual(result.auditManifest.total_surahs, 114);
    assert.strictEqual(result.auditManifest.total_ayahs, 6236);

    // Verify generated SQL seed file
    assert.ok(fs.existsSync(testSeedOutputPath), 'Seed file must exist');
    const stats = fs.statSync(testSeedOutputPath);
    assert.ok(stats.size > 1_500_000, `Seed file size must be > 1.5MB (got ${stats.size} bytes)`);

    const seedContent = fs.readFileSync(testSeedOutputPath, 'utf8');
    assert.ok(seedContent.startsWith('-- ============================================================================'), 'Must have proper header');
    assert.ok(seedContent.includes('INSERT INTO public.quran_editions'), 'Must insert edition');
    assert.ok(seedContent.includes('INSERT INTO public.quran_surahs'), 'Must insert surahs');
    assert.ok(seedContent.includes('INSERT INTO public.quran_ayahs'), 'Must insert ayahs');
    assert.ok(seedContent.includes('text_source_verbatim'), 'Must insert text_source_verbatim');
    assert.ok(seedContent.includes('checksum_source_verbatim'), 'Must insert checksum_source_verbatim');
    assert.ok(seedContent.includes('INSERT INTO public.audit_logs'), 'Must record audit log');
    assert.ok(seedContent.includes('COMMIT;'), 'Must conclude with transaction commit');

    // Clean up temporary test seed file
    fs.unlinkSync(testSeedOutputPath);
  });

  it('should abort immediately if raw source files are tampered with or do not match verified hashes', () => {
    const tempDir = path.resolve(process.cwd(), 'scratch/fake-quran-data');
    fs.mkdirSync(tempDir, { recursive: true });

    const fakeMetadata = path.join(tempDir, 'quran-data.xml');
    const fakeUthmani = path.join(tempDir, 'quran-uthmani.xml');

    fs.writeFileSync(fakeMetadata, '<quran>corrupted</quran>', 'utf8');
    fs.writeFileSync(fakeUthmani, '<quran>corrupted</quran>', 'utf8');

    assert.throws(
      () => {
        runQuranImportPipeline({
          dataDir: tempDir,
          verifySourceHashes: true
        });
      },
      (err: Error) => {
        return err.message.includes('Source Verification Failure');
      },
      'Pipeline must throw Source Verification Failure when source hash does not match'
    );

    // Clean up temporary test files
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should produce identical output when executed repeatedly (idempotence)', () => {
    const run1 = runQuranImportPipeline({ verifySourceHashes: true });
    const run2 = runQuranImportPipeline({ verifySourceHashes: true });

    assert.strictEqual(run1.datasetHash, run2.datasetHash);
    assert.strictEqual(run1.totalSurahs, run2.totalSurahs);
    assert.strictEqual(run1.totalAyahs, run2.totalAyahs);
  });
});
