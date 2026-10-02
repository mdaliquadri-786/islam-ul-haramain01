/**
 * @file tanzil-parser.test.ts
 * @description Comprehensive unit tests for the Tanzil XML parser and Quran validator.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseTanzilMetadata, parseTanzilUthmani } from '../src/quran/tanzil-parser.js';
import { validateQuranDataset } from '@islamic/islamic-engine';

describe('Tanzil Quran Parser & Dataset Validator', () => {
  const candidate1 = path.resolve(process.cwd(), 'packages/database/data/quran');
  const candidate2 = path.resolve(process.cwd(), 'data/quran');
  const dataDir = fs.existsSync(candidate1) ? candidate1 : candidate2;
  const metadataXml = fs.readFileSync(path.join(dataDir, 'quran-data.xml'), 'utf8');
  const uthmaniXml = fs.readFileSync(path.join(dataDir, 'quran-uthmani.xml'), 'utf8');

  it('should parse metadata XML with exactly 114 Surahs and 604 pages', () => {
    const metadata = parseTanzilMetadata(metadataXml);

    assert.strictEqual(metadata.surahs.length, 114, 'Expected exactly 114 Surahs');
    assert.strictEqual(metadata.juzs.length, 30, 'Expected exactly 30 Juzs');
    assert.strictEqual(metadata.quarters.length, 240, 'Expected exactly 240 Hizb quarters');
    assert.strictEqual(metadata.pages.length, 604, 'Expected exactly 604 Medina Mushaf pages');
    assert.strictEqual(metadata.sajdas.size, 15, 'Expected exactly 15 Sajdas');

    // Surah 1 checks
    const fatihah = metadata.surahs[0];
    assert.strictEqual(fatihah.id, 1);
    assert.strictEqual(fatihah.slug, 'alfaatiha');
    assert.strictEqual(fatihah.ayahsCount, 7);
    assert.strictEqual(fatihah.revelationType, 'meccan');

    // Surah 114 checks
    const nas = metadata.surahs[113];
    assert.strictEqual(nas.id, 114);
    assert.strictEqual(nas.ayahsCount, 6);
  });

  it('should parse Uthmani XML into exactly 6,236 Ayahs with complete boundary mappings', () => {
    const metadata = parseTanzilMetadata(metadataXml);
    const parsed = parseTanzilUthmani(uthmaniXml, metadata);

    assert.strictEqual(parsed.totalSurahs, 114);
    assert.strictEqual(parsed.totalAyahs, 6236, 'Expected exactly 6,236 Ayahs for Kufan counting convention');

    // Al-Fatihah checks
    const surah1Ayahs = parsed.ayahs.filter((a) => a.surahId === 1);
    assert.strictEqual(surah1Ayahs.length, 7);
    assert.strictEqual(surah1Ayahs[0].textUthmani, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
    assert.strictEqual(surah1Ayahs[0].textSourceVerbatim, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
    assert.strictEqual(surah1Ayahs[0].checksumSourceVerbatim, surah1Ayahs[0].checksumAyahStructural);
    assert.strictEqual(surah1Ayahs[0].juzNumber, 1);
    assert.strictEqual(surah1Ayahs[0].pageNumber, 1);

    // Al-Baqarah Ayah 1 Bismillah check
    const baqarahAyah1 = parsed.ayahs.find((a) => a.surahId === 2 && a.ayahNumber === 1);
    assert.ok(baqarahAyah1, 'Surah 2 Ayah 1 must exist');
    assert.strictEqual(baqarahAyah1.textUthmani, 'الٓمٓ', 'Structural Ayah 1 text must be verbatim الٓمٓ');
    assert.strictEqual(baqarahAyah1.bismillah, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'Bismillah attribute must be preserved');
    assert.strictEqual(baqarahAyah1.textSourceVerbatim, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ', 'Source verbatim must preserve Bismillah + Ayah 1');
    assert.notStrictEqual(baqarahAyah1.checksumSourceVerbatim, baqarahAyah1.checksumAyahStructural, 'Verbatim and structural checksums must differ when Bismillah is present');

    // At-Tawbah (Surah 9) Bismillah check (No Bismillah)
    const tawbahAyah1 = parsed.ayahs.find((a) => a.surahId === 9 && a.ayahNumber === 1);
    assert.ok(tawbahAyah1);
    assert.strictEqual(tawbahAyah1.bismillah, null, 'Surah 9 Ayah 1 must have no Bismillah');
    assert.strictEqual(tawbahAyah1.textSourceVerbatim, tawbahAyah1.textUthmani, 'Surah 9 source verbatim matches structural text');
    assert.strictEqual(tawbahAyah1.checksumSourceVerbatim, tawbahAyah1.checksumAyahStructural);

    // Checksums should be valid 64-char lowercase hex
    for (const ayah of parsed.ayahs.slice(0, 50)) {
      assert.match(ayah.checksumSourceVerbatim, /^[a-f0-9]{64}$/, 'Source-verbatim checksum must be 64-char lowercase hex');
      assert.match(ayah.checksumAyahStructural, /^[a-f0-9]{64}$/, 'Structural checksum must be 64-char lowercase hex');
      assert.strictEqual(ayah.textChecksum, ayah.checksumAyahStructural, 'textChecksum compatibility alias must equal structural checksum');
    }
  });

  it('should pass full Quran validation with 0 issues', () => {
    const metadata = parseTanzilMetadata(metadataXml);
    const parsed = parseTanzilUthmani(uthmaniXml, metadata);

    const validationResult = validateQuranDataset(parsed.surahs, parsed.ayahs, {
      expectedSurahsCount: 114,
      expectedAyahsCount: 6236,
      verifyChecksums: true
    });

    if (!validationResult.valid) {
      console.error('Validation issues:', validationResult.issues.slice(0, 5));
    }

    assert.strictEqual(validationResult.valid, true, 'Dataset must be 100% valid');
    assert.strictEqual(validationResult.issues.length, 0, 'Must have zero validation issues');
    assert.strictEqual(validationResult.totalSurahs, 114);
    assert.strictEqual(validationResult.totalAyahs, 6236);
    assert.match(validationResult.computedDatasetHash, /^[a-f0-9]{64}$/);
  });
});
