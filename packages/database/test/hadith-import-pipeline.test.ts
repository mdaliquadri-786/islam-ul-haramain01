/**
 * @file hadith-import-pipeline.test.ts
 * @package @islamic/database
 * @description Test suite for the Hadith collections import pipeline, parser,
 *              cryptographic checksum verification, and tampering detection.
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {
  loadHadithCorpus,
  loadScholarAuthors,
  loadHadithCollections,
  loadHadithBooks,
  loadHadithNarrations,
  loadHadithGradings
} from '../src/hadith/hadith-parser.js';
import { runHadithImportPipeline } from '../src/ingest/import-hadith.js';
import {
  calculateHadithChecksum,
  validateHadithDataset,
  HadithCollection,
  HadithBook,
  HadithNarration,
  HadithGrading
} from '@islamic/islamic-engine';

describe('Hadith Ingestion & Parsing Pipeline', () => {
  const dataDir = path.resolve(__dirname, '../data/hadith');

  it('should successfully load all 15 scholars with complete metadata', () => {
    const scholars = loadScholarAuthors(path.join(dataDir, 'scholars.json'));
    assert.strictEqual(scholars.length, 15);

    const bukhari = scholars.find((s) => s.slug === 'imam-bukhari');
    assert.ok(bukhari);
    assert.strictEqual(bukhari.role, 'compiler');
    assert.strictEqual(bukhari.death_year_ah, 256);
    assert.strictEqual(bukhari.era, 'classical');

    const albani = scholars.find((s) => s.slug === 'al-albani');
    assert.ok(albani);
    assert.strictEqual(albani.role, 'evaluator');
    assert.strictEqual(albani.death_year_ah, 1420);
    assert.strictEqual(albani.era, 'contemporary');
  });

  it('should successfully load all 6 Kutub al-Sittah collections', () => {
    const collections = loadHadithCollections(path.join(dataDir, 'collections.json'));
    assert.strictEqual(collections.length, 6);

    const expectedIds = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah'];
    for (const id of expectedIds) {
      const col = collections.find((c) => c.id === id);
      assert.ok(col, `Collection ${id} must exist`);
      assert.strictEqual(col.status, 'published');
      assert.ok(col.name_arabic.length > 0);
      assert.ok(col.name_english.length > 0);
      assert.ok(col.total_hadiths > 0);
      assert.ok(col.total_books > 0);
    }
  });

  it('should load canonical books with correct collection associations', () => {
    const books = loadHadithBooks(path.join(dataDir, 'books.json'));
    assert.ok(books.length >= 300, `Expected at least 300 books across Kutub al-Sittah, found ${books.length}`);

    for (const b of books) {
      assert.ok(b.collection_id);
      assert.ok(b.book_number >= 0);
      assert.ok(b.name_arabic);
      assert.ok(b.name_english);
    }
  });

  it('should verify that all narrations have valid SHA-256 checksums matching matn_arabic', () => {
    const narrations = loadHadithNarrations(path.join(dataDir, 'narrations.json'));
    assert.ok(narrations.length >= 300, `Expected at least 300 narrations, got ${narrations.length}`);

    for (const n of narrations) {
      const expectedChecksum = calculateHadithChecksum(n.matn_arabic);
      assert.strictEqual(
        n.text_checksum.toLowerCase(),
        expectedChecksum.toLowerCase(),
        `Checksum mismatch for narration ${n.collection_id}:${n.hadith_number}`
      );
      assert.ok(!n.matn_arabic.includes('\uFFFD'), `Narration ${n.collection_id}:${n.hadith_number} has U+FFFD`);
    }
  });

  it('should verify that all gradings have valid grade_level and attribution', () => {
    const gradings = loadHadithGradings(path.join(dataDir, 'gradings.json'));
    assert.ok(gradings.length >= 800, `Expected at least 800 gradings, got ${gradings.length}`);

    const validLevels = new Set(['sahih', 'hasan', 'daif', 'mawdu']);
    for (const g of gradings) {
      assert.ok(validLevels.has(g.grade_level), `Invalid grade_level: ${g.grade_level}`);
      assert.ok(g.scholar_id, 'Scholar ID is required');
      assert.ok(g.grade.length > 0, 'Grade string is required');
      assert.ok(g.grade_arabic.length > 0, 'Grade Arabic is required');
      assert.ok(g.reference_source.length > 0, 'Reference source is required');
    }
  });

  it('should load complete corpus and calculate deterministic dataset checksums', () => {
    const corpus = loadHadithCorpus(dataDir);
    assert.strictEqual(corpus.scholars.length, 15);
    assert.strictEqual(corpus.collections.length, 6);
    assert.strictEqual(corpus.books.length, 339);
    assert.strictEqual(corpus.narrations.length, 308);
    assert.strictEqual(corpus.gradings.length, 910);

    for (const c of corpus.collections) {
      const summary = corpus.summaries[c.id];
      assert.ok(summary, `Summary for ${c.id} must exist`);
      assert.ok(summary.totalNarrations >= 50, `Expected at least 50 narrations for ${c.id}`);
      assert.ok(summary.datasetChecksum.length === 64, `Dataset checksum for ${c.id} must be 64-char SHA-256`);
    }
  });

  it('should execute runHadithImportPipeline and generate seed SQL file under 1 second', () => {
    const testSeedPath = path.resolve(__dirname, '../../../supabase/test_seed_hadith.sql');
    const result = runHadithImportPipeline({
      dataDir,
      outputSqlPath: testSeedPath
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.totalCollections, 6);
    assert.strictEqual(result.totalNarrations, 308);
    assert.strictEqual(result.totalGradings, 910);
    assert.ok(result.timings.totalMs < 1000, `Pipeline took ${result.timings.totalMs} ms, expected < 1000 ms`);

    assert.ok(fs.existsSync(testSeedPath));
    const stat = fs.statSync(testSeedPath);
    assert.ok(stat.size > 800000, `Seed file size should be > 800 KB, got ${stat.size} bytes`);

    // Clean up temporary test seed file
    fs.unlinkSync(testSeedPath);
  });

  it('should detect tampering if matn_arabic is modified', () => {
    const narrations = loadHadithNarrations(path.join(dataDir, 'narrations.json'));
    const first = { ...narrations[0] };
    const originalChecksum = first.text_checksum;

    // Tamper with text
    first.matn_arabic = first.matn_arabic + ' [TAMPERED]';
    const tamperedChecksum = calculateHadithChecksum(first.matn_arabic);

    assert.notStrictEqual(tamperedChecksum, originalChecksum);

    const dummyCollection: HadithCollection = {
      id: 'bukhari',
      slug: 'sahih-al-bukhari',
      nameArabic: 'صحيح البخاري',
      nameEnglish: 'Sahih al-Bukhari',
      nameUrdu: 'صحیح البخاری',
      authorId: '00000000-0000-0000-0001-000000000001',
      totalHadiths: 1,
      totalBooks: 1,
      sourceEdition: 'Test',
      sourceUrl: 'https://test.com',
      status: 'published'
    };

    const dummyNarration: HadithNarration = {
      id: 1,
      collectionId: 'bukhari',
      bookNumber: 1,
      hadithNumber: 1,
      matnArabic: first.matn_arabic,
      matnClean: 'clean text',
      textChecksum: originalChecksum, // old checksum
      sourceEdition: 'Test'
    };

    const valResult = validateHadithDataset(dummyCollection, [], [dummyNarration], [], {
      checkChecksums: true,
      minHadiths: 1
    });

    assert.strictEqual(valResult.valid, false);
    const checksumIssue = valResult.issues.find((i) => i.code === 'CHECKSUM_MISMATCH');
    assert.ok(checksumIssue, 'Must detect CHECKSUM_MISMATCH on tampered text');
  });
});
