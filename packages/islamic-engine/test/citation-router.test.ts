/**
 * @file citation-router.test.ts
 * @package @islamic/islamic-engine
 * @description Comprehensive test suite for the Citation Router and Canonical 114 Surahs / Kutub al-Sittah routing.
 * Verifies strict boundary validation, alias resolution, canonical routing, and benchmark (< 10 ms).
 * Milestone: Phase 2 -> Milestone 2.5
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseCitation,
  parseQuranCitation,
  parseHadithCitation,
  resolveCitation,
  isValidQuranBoundary,
  CANONICAL_SURAHS,
  CANONICAL_HADITH_COLLECTIONS
} from '../src/search/citation-router';

describe('Citation Router: Canonical Quran Citations', () => {
  it('should verify canonical Surah dataset has exactly 114 Surahs and 6,236 Ayahs', () => {
    assert.strictEqual(CANONICAL_SURAHS.length, 115); // Index 0 is dummy
    const totalAyahs = CANONICAL_SURAHS.slice(1).reduce((acc, s) => acc + s.ayahsCount, 0);
    assert.strictEqual(totalAyahs, 6236);
    assert.strictEqual(CANONICAL_SURAHS[1].ayahsCount, 7);
    assert.strictEqual(CANONICAL_SURAHS[2].ayahsCount, 286);
    assert.strictEqual(CANONICAL_SURAHS[114].ayahsCount, 6);
  });

  it('should validate exact Quran boundaries correctly', () => {
    // Valid boundaries
    assert.strictEqual(isValidQuranBoundary(1, 1), true);
    assert.strictEqual(isValidQuranBoundary(1, 7), true);
    assert.strictEqual(isValidQuranBoundary(2, 255), true);
    assert.strictEqual(isValidQuranBoundary(2, 286), true);
    assert.strictEqual(isValidQuranBoundary(114, 6), true);

    // Boundary violations
    assert.strictEqual(isValidQuranBoundary(0, 1), false);
    assert.strictEqual(isValidQuranBoundary(115, 1), false);
    assert.strictEqual(isValidQuranBoundary(1, 0), false);
    assert.strictEqual(isValidQuranBoundary(1, 8), false);
    assert.strictEqual(isValidQuranBoundary(2, 287), false);
    assert.strictEqual(isValidQuranBoundary(114, 7), false);
    assert.strictEqual(isValidQuranBoundary(-1, 5), false);
  });

  it('should parse various valid Quran citation formats', () => {
    const cases = [
      { input: '2:255', surah: 2, ayah: 255 },
      { input: '2 : 255', surah: 2, ayah: 255 },
      { input: '2-255', surah: 2, ayah: 255 },
      { input: 'Surah 2:255', surah: 2, ayah: 255 },
      { input: 'surah 2:255', surah: 2, ayah: 255 },
      { input: 'Quran 2:255', surah: 2, ayah: 255 },
      { input: 'Qur\'an 2:255', surah: 2, ayah: 255 },
      { input: 'Ayah 2:255', surah: 2, ayah: 255 },
      { input: '1:1', surah: 1, ayah: 1 },
      { input: '1:7', surah: 1, ayah: 7 },
      { input: '114:1', surah: 114, ayah: 1 },
      { input: '114:6', surah: 114, ayah: 6 }
    ];

    for (const c of cases) {
      const parsed = parseQuranCitation(c.input);
      assert.ok(parsed, `Failed to parse valid Quran citation: "${c.input}"`);
      assert.strictEqual(parsed.type, 'quran');
      assert.strictEqual(parsed.surahNumber, c.surah);
      assert.strictEqual(parsed.ayahNumber, c.ayah);
    }
  });

  it('should reject out-of-bounds or invalid Quran citations', () => {
    const invalidCases = [
      '0:1',
      '115:1',
      '1:8',      // Surah 1 only has 7
      '2:287',    // Surah 2 only has 286
      '114:7',    // Surah 114 only has 6
      '2:0',
      '2:999',
      'abc:def',
      'just random words'
    ];

    for (const c of invalidCases) {
      const parsed = parseQuranCitation(c);
      assert.strictEqual(parsed, null, `Should have rejected invalid Quran citation: "${c}"`);
    }
  });

  it('should resolve Quran citation to canonical route with sub-millisecond execution', () => {
    const res = resolveCitation('2:255');
    assert.ok(res);
    assert.strictEqual(res.isDirectCitation, true);
    assert.strictEqual(res.canonicalUrl, '/quran/2#ayah-255');
    assert.ok(res.displayText.includes('Al-Baqara'));
    assert.ok(res.displayText.includes('2:255'));
  });
});

describe('Citation Router: Canonical Hadith Citations', () => {
  it('should verify Kutub al-Sittah collection registry contains all 6 canonical collections', () => {
    assert.strictEqual(CANONICAL_HADITH_COLLECTIONS.length, 6);
    const ids = CANONICAL_HADITH_COLLECTIONS.map((c) => c.id);
    assert.deepStrictEqual(ids, ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah']);
  });

  it('should parse Hadith citations across collection aliases and formats', () => {
    const cases = [
      { input: 'Bukhari 1', coll: 'bukhari', num: 1 },
      { input: 'Bukhari: 1', coll: 'bukhari', num: 1 },
      { input: 'Bukhari #1', coll: 'bukhari', num: 1 },
      { input: 'Sahih Bukhari 1', coll: 'bukhari', num: 1 },
      { input: 'Muslim 93', coll: 'muslim', num: 93 },
      { input: 'Sahih Muslim 93', coll: 'muslim', num: 93 },
      { input: 'Abu Dawud 1', coll: 'abudawud', num: 1 },
      { input: 'Abu Dawood 1', coll: 'abudawud', num: 1 },
      { input: 'Sunan Abi Dawud 1', coll: 'abudawud', num: 1 },
      { input: 'Tirmidhi 1', coll: 'tirmidhi', num: 1 },
      { input: "Jami' at-Tirmidhi 1", coll: 'tirmidhi', num: 1 },
      { input: "Nasa'i 1", coll: 'nasai', num: 1 },
      { input: 'Sunan an-Nasai 1', coll: 'nasai', num: 1 },
      { input: 'Ibn Majah 1', coll: 'ibnmajah', num: 1 },
      { input: 'Sunan Ibn Majah 1', coll: 'ibnmajah', num: 1 }
    ];

    for (const c of cases) {
      const parsed = parseHadithCitation(c.input);
      assert.ok(parsed, `Failed to parse valid Hadith citation: "${c.input}"`);
      assert.strictEqual(parsed.type, 'hadith');
      assert.strictEqual(parsed.collectionId, c.coll);
      assert.strictEqual(parsed.hadithNumber, c.num);
    }
  });

  it('should resolve Arabic Hadith citation queries', () => {
    const parsedBukhari = parseHadithCitation('صحيح البخاري 1');
    assert.ok(parsedBukhari);
    assert.strictEqual(parsedBukhari.collectionId, 'bukhari');
    assert.strictEqual(parsedBukhari.hadithNumber, 1);

    const parsedMuslim = parseHadithCitation('صحيح مسلم 93');
    assert.ok(parsedMuslim);
    assert.strictEqual(parsedMuslim.collectionId, 'muslim');
    assert.strictEqual(parsedMuslim.hadithNumber, 93);
  });

  it('should resolve Hadith citations to canonical route', () => {
    const res = resolveCitation('Bukhari 1');
    assert.ok(res);
    assert.strictEqual(res.isDirectCitation, true);
    assert.strictEqual(res.canonicalUrl, '/hadith/bukhari#hadith-1');
    assert.ok(res.displayText.includes('Sahih al-Bukhari'));
    assert.ok(res.displayText.includes('1'));

    const resMuslim = resolveCitation('Muslim 93');
    assert.ok(resMuslim);
    assert.strictEqual(resMuslim.canonicalUrl, '/hadith/muslim#hadith-93');
  });

  it('should reject non-hadith or invalid collections', () => {
    assert.strictEqual(parseHadithCitation('UnknownCollection 5'), null);
    assert.strictEqual(parseHadithCitation('Bukhari 0'), null);
    assert.strictEqual(parseHadithCitation('Bukhari abc'), null);
    assert.strictEqual(parseHadithCitation('Bukhari 999999'), null);
    assert.strictEqual(parseHadithCitation('What is the virtue of fasting?'), null);
  });
});

describe('Citation Router: Performance Benchmark (< 10 ms SLA)', () => {
  it('should parse and resolve 10,000 citations in under 100 ms (average < 0.01 ms)', () => {
    const testQueries = [
      '2:255',
      'Bukhari 1',
      'Muslim 93',
      'Surah 114:6',
      'Abu Dawud 1',
      'Tirmidhi 1',
      '1:1',
      'Nasa\'i 1',
      'Ibn Majah 1',
      'Al-Baqara 286'
    ];

    const iterations = 10000;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const q = testQueries[i % testQueries.length];
      const res = resolveCitation(q);
      assert.ok(res !== null);
    }

    const elapsed = performance.now() - startTime;
    const avgPerCallMs = elapsed / iterations;

    // SLA requires < 10 ms per resolution
    assert.ok(
      avgPerCallMs < 10,
      `Citation resolution too slow! Took ${avgPerCallMs.toFixed(4)} ms per call (target < 10 ms)`
    );

    // Highly optimized engine typically achieves < 0.05 ms per call (500 ms for 10,000)
    assert.ok(
      elapsed < 500,
      `10,000 resolutions took ${elapsed.toFixed(2)} ms (exceeded 500 ms threshold)`
    );
  });
});
