/**
 * @file duas-import-pipeline.test.ts
 * @package @islamic/database
 * @description Ingestion pipeline and structural verification tests for Duas & Adhkar engine.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  loadDuaSources,
  loadDuaCategories,
  loadDuas,
  loadDuaCorpus,
  runDuaImportPipeline
} from '../src/index.js';
import { calculateDuaChecksum } from '@islamic/islamic-engine';

describe('Duas & Adhkar Ingestion & Parsing Pipeline', () => {
  it('should successfully load the Dua source edition with complete metadata', () => {
    const sources = loadDuaSources();
    assert.equal(sources.length, 1);
    const hisn = sources[0];
    assert.equal(hisn.id, 'hisn-al-muslim');
    assert.equal(hisn.slug, 'hisn-al-muslim');
    assert.ok(hisn.name_arabic.includes('حِصْنُ المُسْلِمِ'));
    assert.ok(hisn.name_english.includes('Fortress of the Muslim'));
    assert.equal(hisn.author_death_year_ah, 1440);
    assert.equal(hisn.status, 'published');
  });

  it('should successfully load all 132 categories with sequential ordering', () => {
    const categories = loadDuaCategories();
    assert.equal(categories.length, 132);

    for (let i = 0; i < categories.length; i++) {
      const c = categories[i];
      assert.equal(c.sort_order, i + 1);
      assert.ok(c.slug.length > 0);
      assert.ok(c.name_arabic.length > 0);
      assert.ok(c.name_english.length > 0);
      assert.ok(c.total_duas >= 0);
    }
  });

  it('should verify that all 268 duas have valid SHA-256 checksums matching arabic_text', () => {
    const duas = loadDuas();
    assert.equal(duas.length, 268);

    for (const d of duas) {
      assert.ok(d.dua_id.startsWith('hisn-'));
      assert.ok(d.arabic_text.length >= 3);
      assert.ok(d.translation_english.length >= 3);
      assert.ok(d.repeat_count >= 1);

      const computed = calculateDuaChecksum(d.arabic_text);
      assert.equal(
        d.text_checksum,
        computed,
        `Checksum mismatch for dua ${d.dua_id}`
      );
    }
  });

  it('should load complete corpus and calculate deterministic dataset checksum', () => {
    const corpus1 = loadDuaCorpus();
    const corpus2 = loadDuaCorpus();

    assert.equal(corpus1.sources.length, 1);
    assert.equal(corpus1.categories.length, 132);
    assert.equal(corpus1.duas.length, 268);
    assert.equal(corpus1.summary.datasetChecksum, corpus2.summary.datasetChecksum);
    assert.match(corpus1.summary.datasetChecksum, /^[0-9a-f]{64}$/);
  });

  it('should execute runDuaImportPipeline and generate seed SQL file under 1 second', () => {
    const tmpSeedPath = path.resolve(__dirname, '../data/duas/tmp_test_seed.sql');

    try {
      const res = runDuaImportPipeline({
        outputSqlPath: tmpSeedPath
      });

      assert.equal(res.success, true);
      assert.equal(res.totalSources, 1);
      assert.equal(res.totalCategories, 132);
      assert.equal(res.totalDuas, 268);
      assert.ok(res.timings.totalMs < 1000, `Execution took ${res.timings.totalMs}ms (expected < 1000ms)`);

      assert.ok(fs.existsSync(tmpSeedPath));
      const content = fs.readFileSync(tmpSeedPath, 'utf8');
      assert.ok(content.includes('DUAS & ADHKAR ENGINE SEED DATA'));
      assert.ok(content.includes('INSERT INTO public.dua_sources'));
      assert.ok(content.includes('INSERT INTO public.dua_categories'));
      assert.ok(content.includes('INSERT INTO public.duas_adhkar'));
      assert.ok(content.includes('COMMIT;'));
    } finally {
      if (fs.existsSync(tmpSeedPath)) {
        fs.unlinkSync(tmpSeedPath);
      }
    }
  });

  it('should detect tampering if arabic_text is modified', () => {
    const tmpDuasPath = path.resolve(__dirname, '../data/duas/tmp_tampered_duas.json');
    const originalDuas = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../data/duas/duas.json'), 'utf8')
    );

    // Tamper with first dua's arabicText without updating checksum
    const tampered = JSON.parse(JSON.stringify(originalDuas));
    tampered[0].arabicText = 'تلاعب بالنص الشريف';

    fs.writeFileSync(tmpDuasPath, JSON.stringify(tampered, null, 2), 'utf8');

    try {
      assert.throws(
        () => loadDuas(tmpDuasPath),
        /cryptographic checksum mismatch/i
      );
    } finally {
      if (fs.existsSync(tmpDuasPath)) {
        fs.unlinkSync(tmpDuasPath);
      }
    }
  });
});
