/**
 * @file quran-translation.test.ts
 * @package @islamic/islamic-engine
 * @description Unit tests for Quran translation checksum computation and dataset validation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateTranslationChecksum,
  verifyTranslationChecksum,
  calculateTranslationDatasetChecksum
} from '../src/quran/translation-checksum.js';
import { validateTranslationDataset } from '../src/quran/translation-validator.js';
import { QuranSurah } from '../src/quran/types.js';
import { QuranTranslationEdition, QuranTranslationAyah } from '../src/quran/translation-types.js';

describe('Quran Translation Engine: Cryptographic Checksum Integrity', () => {
  it('should compute valid 64-character SHA-256 digest', () => {
    const text = 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';
    const checksum = calculateTranslationChecksum(text);

    assert.strictEqual(checksum.length, 64);
    assert.match(checksum, /^[a-f0-9]{64}$/);
  });

  it('should be deterministic and reproducible for identical input', () => {
    const text = 'شروع الله کا نام لے کر جو بڑا مہربان نہایت رحم والا ہے';
    const c1 = calculateTranslationChecksum(text);
    const c2 = calculateTranslationChecksum(text);

    assert.strictEqual(c1, c2);
  });

  it('should produce completely different digest for even a single character change', () => {
    const t1 = 'This is the Book about which there is no doubt';
    const t2 = 'This is the Book about which there is no doubt.';
    const c1 = calculateTranslationChecksum(t1);
    const c2 = calculateTranslationChecksum(t2);

    assert.notStrictEqual(c1, c2);
  });

  it('should throw an error when translation text is null or empty', () => {
    assert.throws(() => calculateTranslationChecksum(''), /Translation text cannot be null or empty/);
  });

  it('should correctly verify checksum with verifyTranslationChecksum', () => {
    const text = 'Guide us to the straight path -';
    const checksum = calculateTranslationChecksum(text);

    assert.strictEqual(verifyTranslationChecksum(text, checksum), true);
    assert.strictEqual(verifyTranslationChecksum(text, 'invalidchecksum0000000000000000000000000000000000000000000000000000'), false);
  });

  it('should compute deterministic dataset checksum sensitive to order', () => {
    const checksums1 = [
      calculateTranslationChecksum('verse 1'),
      calculateTranslationChecksum('verse 2'),
      calculateTranslationChecksum('verse 3')
    ];
    const checksums2 = [
      checksums1[1],
      checksums1[0],
      checksums1[2]
    ];

    const hash1 = calculateTranslationDatasetChecksum(checksums1);
    const hash2 = calculateTranslationDatasetChecksum(checksums2);

    assert.strictEqual(hash1.length, 64);
    assert.strictEqual(hash2.length, 64);
    assert.notStrictEqual(hash1, hash2);
  });
});

describe('Quran Translation Engine: Dataset Validation Failure Detection', () => {
  const dummyEdition: QuranTranslationEdition = {
    id: 'test.en',
    slug: 'test-english',
    languageCode: 'en',
    title: 'Test English Translation',
    translator: 'Test Translator',
    sourceName: 'Test Source',
    sourceUrl: 'https://example.com',
    sourceVersion: '1.0',
    license: 'CC-BY',
    copyrightStatement: 'Copyright (C) 2026',
    attributionText: 'Test Attribution',
    sourceFileName: 'test.txt',
    sourceSha256: '0000000000000000000000000000000000000000000000000000000000000000',
    datasetSha256: '0000000000000000000000000000000000000000000000000000000000000000',
    sourceAcquiredAt: '2026-09-23T00:00:00Z',
    totalSurahs: 2,
    totalAyahs: 4,
    status: 'validated'
  };

  const dummySurahs: QuranSurah[] = [
    {
      id: 1,
      slug: 'al-fatihah',
      nameArabic: 'الفاتحة',
      nameEnglish: 'The Opening',
      nameTransliteration: 'Al-Fatihah',
      revelationType: 'meccan',
      revelationOrder: 5,
      ayahsCount: 2,
      rukusCount: 1,
      startAyahIndex: 0
    },
    {
      id: 2,
      slug: 'al-baqarah',
      nameArabic: 'البقرة',
      nameEnglish: 'The Cow',
      nameTransliteration: 'Al-Baqarah',
      revelationType: 'medinan',
      revelationOrder: 87,
      ayahsCount: 2,
      rukusCount: 1,
      startAyahIndex: 2
    }
  ];

  function createValidAyahs(): QuranTranslationAyah[] {
    const a1Text = 'Translation of 1:1';
    const a2Text = 'Translation of 1:2';
    const a3Text = 'Translation of 2:1';
    const a4Text = 'Translation of 2:2';

    return [
      { surahNumber: 1, ayahNumber: 1, ayahId: 1, translationText: a1Text, textChecksum: calculateTranslationChecksum(a1Text) },
      { surahNumber: 1, ayahNumber: 2, ayahId: 2, translationText: a2Text, textChecksum: calculateTranslationChecksum(a2Text) },
      { surahNumber: 2, ayahNumber: 1, ayahId: 3, translationText: a3Text, textChecksum: calculateTranslationChecksum(a3Text) },
      { surahNumber: 2, ayahNumber: 2, ayahId: 4, translationText: a4Text, textChecksum: calculateTranslationChecksum(a4Text) }
    ];
  }

  it('should pass validation on a structurally valid dataset', () => {
    const ayahs = createValidAyahs();
    const result = validateTranslationDataset(dummyEdition, ayahs, dummySurahs, {
      expectedSurahsCount: 2,
      expectedAyahsCount: 4
    });

    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.issues.length, 0);
    assert.strictEqual(result.totalSurahs, 2);
    assert.strictEqual(result.totalAyahs, 4);
    assert.strictEqual(result.computedDatasetHash.length, 64);
  });

  it('should detect checksum mismatch', () => {
    const ayahs = createValidAyahs();
    ayahs[0].textChecksum = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    const result = validateTranslationDataset(dummyEdition, ayahs, dummySurahs, {
      expectedSurahsCount: 2,
      expectedAyahsCount: 4
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'CHECKSUM_MISMATCH'));
  });

  it('should detect Unicode replacement character (U+FFFD)', () => {
    const ayahs = createValidAyahs();
    ayahs[1].translationText = 'Corrupted text \uFFFD here';
    ayahs[1].textChecksum = calculateTranslationChecksum(ayahs[1].translationText);

    const result = validateTranslationDataset(dummyEdition, ayahs, dummySurahs, {
      expectedSurahsCount: 2,
      expectedAyahsCount: 4
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'UNICODE_REPLACEMENT_CHAR'));
  });

  it('should detect duplicate Ayahs', () => {
    const ayahs = createValidAyahs();
    ayahs[1].ayahNumber = 1; // Duplicate 1:1

    const result = validateTranslationDataset(dummyEdition, ayahs, dummySurahs, {
      expectedSurahsCount: 2,
      expectedAyahsCount: 4,
      verifyChecksums: false
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'DUPLICATE_TRANSLATION_AYAH'));
  });

  it('should detect out-of-order Ayahs', () => {
    const ayahs = createValidAyahs();
    ayahs[1].ayahNumber = 5; // Should be 2

    const result = validateTranslationDataset(dummyEdition, ayahs, dummySurahs, {
      expectedSurahsCount: 2,
      expectedAyahsCount: 4,
      verifyChecksums: false
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'AYAH_SEQUENCE_ERROR'));
  });

  it('should detect orphan Ayahs referencing invalid Surah', () => {
    const ayahs = createValidAyahs();
    ayahs[2].surahNumber = 999; // Non-existent

    const result = validateTranslationDataset(dummyEdition, ayahs, dummySurahs, {
      expectedSurahsCount: 2,
      expectedAyahsCount: 4,
      verifyChecksums: false
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'ORPHAN_TRANSLATION_SURAH'));
  });
});
