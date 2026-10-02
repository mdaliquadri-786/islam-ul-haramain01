/**
 * @file quran-engine.test.ts
 * @description Unit tests for Islamic Engine Quran normalization, checksums, and validation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  normalizeArabicForSearch,
  calculateAyahChecksum,
  calculateSourceVerbatimChecksum,
  calculateStructuralAyahChecksum,
  verifyAyahChecksum,
  validateQuranDataset,
  QuranSurah,
  QuranAyah
} from '../src/index.js';

describe('Quran Engine: Arabic Search Normalization', () => {
  it('should strip harakat (tashkeel) deterministically', () => {
    const raw = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
    const clean = normalizeArabicForSearch(raw);
    assert.strictEqual(clean, 'بسم الله الرحمن الرحيم');
  });

  it('should unify Alef variants to bare Alef (ا)', () => {
    // آ (U+0622), أ (U+0623), إ (U+0625), ٱ (U+0671)
    const raw = 'ءَامَنُوا۟ أَنزَلَ إِيَّاكَ ٱهْدِنَا';
    const clean = normalizeArabicForSearch(raw);
    assert.ok(clean.includes('انزل'), 'Alef Hamza Above must normalize to ا');
    assert.ok(clean.includes('اياك'), 'Alef Hamza Below must normalize to ا');
    assert.ok(clean.includes('اهدنا'), 'Alef Wasla must normalize to ا');
  });

  it('should normalize Alef Maksura (ى) to Yeh (ي) and Ta Marbuta (ة) to Ha (ه)', () => {
    const raw = 'هُدًى لِّلْمُتَّقِينَ وَالصَّلَاةَ';
    const clean = normalizeArabicForSearch(raw);
    assert.ok(clean.includes('هدي'), 'Alef Maksura should normalize to Yeh');
    assert.ok(clean.includes('الصلاه'), 'Ta Marbuta should normalize to Ha');
  });

  it('should strip Tatweel and Quranic pause marks', () => {
    // Tatweel (ـ) and Small High Meem (\u06D8)
    const raw = 'الرَّحْمَـٰنِۘ الرَّحِيمِ';
    const clean = normalizeArabicForSearch(raw);
    assert.strictEqual(clean, 'الرحمن الرحيم');
  });

  it('should be idempotent (normalizing twice produces identical output)', () => {
    const raw = 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ';
    const pass1 = normalizeArabicForSearch(raw);
    const pass2 = normalizeArabicForSearch(pass1);
    assert.strictEqual(pass1, pass2);
  });
});

describe('Quran Engine: Cryptographic Checksum Integrity', () => {
  const bismillah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

  it('should compute valid 64-char SHA-256 digest', () => {
    const hash = calculateAyahChecksum(bismillah);
    assert.strictEqual(hash.length, 64);
    assert.match(hash, /^[a-f0-9]{64}$/);
  });

  it('should produce identical digest for identical input', () => {
    const hash1 = calculateAyahChecksum(bismillah);
    const hash2 = calculateAyahChecksum(bismillah);
    assert.strictEqual(hash1, hash2);
  });

  it('should produce completely different digest for even a single character change', () => {
    const altered = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيم'; // Removed final Kasrah
    const hash1 = calculateAyahChecksum(bismillah);
    const hash2 = calculateAyahChecksum(altered);
    assert.notStrictEqual(hash1, hash2);
  });

  it('should correctly verify checksum with verifyAyahChecksum', () => {
    const hash = calculateAyahChecksum(bismillah);
    assert.strictEqual(verifyAyahChecksum(bismillah, hash), true);
    assert.strictEqual(verifyAyahChecksum(bismillah, '0'.repeat(64)), false);
  });

  it('should compute distinct checksums for source-verbatim vs structural text when Bismillah is prepended', () => {
    const verbatim = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ';
    const structural = 'الٓمٓ';
    const verbatimHash = calculateSourceVerbatimChecksum(verbatim);
    const structuralHash = calculateStructuralAyahChecksum(structural);

    assert.notStrictEqual(verbatimHash, structuralHash);
    assert.strictEqual(verbatimHash.length, 64);
    assert.strictEqual(structuralHash.length, 64);
  });

  it('should throw when input is empty string', () => {
    assert.throws(() => calculateAyahChecksum(''), /cannot be null or empty/);
  });
});

describe('Quran Engine: Dataset Validation Failure Detection', () => {
  const mockSurahs: QuranSurah[] = [
    {
      id: 1,
      slug: 'al-fatihah',
      nameArabic: 'الفاتحة',
      nameEnglish: 'The Opening',
      nameTransliteration: 'Al-Faatiha',
      revelationType: 'meccan',
      revelationOrder: 5,
      ayahsCount: 2,
      rukusCount: 1,
      startAyahIndex: 0
    }
  ];

  const mockAyahs: QuranAyah[] = [
    {
      id: 1,
      editionId: 'test-edition',
      surahId: 1,
      ayahNumber: 1,
      textSourceVerbatim: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      checksumSourceVerbatim: calculateSourceVerbatimChecksum('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'),
      textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      checksumAyahStructural: calculateStructuralAyahChecksum('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'),
      textChecksum: calculateStructuralAyahChecksum('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ'),
      bismillah: null,
      textClean: 'بسم الله الرحمن الرحيم',
      juzNumber: 1,
      hizbNumber: 1,
      rubNumber: 1,
      rukuNumber: 1,
      manzilNumber: 1,
      pageNumber: 1,
      sajdah: false
    },
    {
      id: 2,
      editionId: 'test-edition',
      surahId: 1,
      ayahNumber: 2,
      textSourceVerbatim: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      checksumSourceVerbatim: calculateSourceVerbatimChecksum('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ'),
      textUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      checksumAyahStructural: calculateStructuralAyahChecksum('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ'),
      textChecksum: calculateStructuralAyahChecksum('ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ'),
      bismillah: null,
      textClean: 'الحمد لله رب العالمين',
      juzNumber: 1,
      hizbNumber: 1,
      rubNumber: 1,
      rukuNumber: 1,
      manzilNumber: 1,
      pageNumber: 1,
      sajdah: false
    }
  ];

  it('should detect checksum mismatch', () => {
    const tamperedAyahs = [
      {
        ...mockAyahs[0],
        checksumAyahStructural: 'f'.repeat(64),
        textChecksum: 'f'.repeat(64) // Forged checksum
      },
      mockAyahs[1]
    ];

    const result = validateQuranDataset(mockSurahs, tamperedAyahs, {
      expectedSurahsCount: 1,
      expectedAyahsCount: 2
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'CHECKSUM_MISMATCH'));
  });

  it('should detect Unicode replacement character (U+FFFD)', () => {
    const corruptAyahs = [
      {
        ...mockAyahs[0],
        textUthmani: 'بِسْمِ \uFFFD الرَّحْمَٰنِ',
        textChecksum: calculateAyahChecksum('بِسْمِ \uFFFD الرَّحْمَٰنِ')
      },
      mockAyahs[1]
    ];

    const result = validateQuranDataset(mockSurahs, corruptAyahs, {
      expectedSurahsCount: 1,
      expectedAyahsCount: 2
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'UNICODE_REPLACEMENT_CHAR'));
  });

  it('should detect accidental HTML tags', () => {
    const htmlAyahs = [
      {
        ...mockAyahs[0],
        textUthmani: 'بِسْمِ <b>اللَّهِ</b>',
        textChecksum: calculateAyahChecksum('بِسْمِ <b>اللَّهِ</b>')
      },
      mockAyahs[1]
    ];

    const result = validateQuranDataset(mockSurahs, htmlAyahs, {
      expectedSurahsCount: 1,
      expectedAyahsCount: 2
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'ACCIDENTAL_HTML_MARKUP'));
  });

  it('should detect out-of-order Ayahs', () => {
    const outOfOrderAyahs = [mockAyahs[1], mockAyahs[0]];

    const result = validateQuranDataset(mockSurahs, outOfOrderAyahs, {
      expectedSurahsCount: 1,
      expectedAyahsCount: 2
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'AYAH_SEQUENCE_ERROR' || i.code === 'GLOBAL_AYAH_INDEX_ERROR'));
  });

  it('should detect source-verbatim coherence mismatch', () => {
    const incoherentAyahs = [
      {
        ...mockAyahs[0],
        bismillah: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
        textUthmani: 'الٓمٓ',
        textSourceVerbatim: 'الٓمٓ فقط' // Does not match bismillah + ' ' + textUthmani
      },
      mockAyahs[1]
    ];

    const result = validateQuranDataset(mockSurahs, incoherentAyahs, {
      expectedSurahsCount: 1,
      expectedAyahsCount: 2,
      verifyChecksums: false
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'SOURCE_VERBATIM_COHERENCE_MISMATCH'));
  });

  it('should detect source-verbatim checksum mismatch', () => {
    const tamperedVerbatimAyahs = [
      {
        ...mockAyahs[0],
        checksumSourceVerbatim: '0'.repeat(64) // Forged verbatim checksum
      },
      mockAyahs[1]
    ];

    const result = validateQuranDataset(mockSurahs, tamperedVerbatimAyahs, {
      expectedSurahsCount: 1,
      expectedAyahsCount: 2,
      verifyChecksums: true
    });

    assert.strictEqual(result.valid, false);
    assert.ok(result.issues.some((i) => i.code === 'SOURCE_VERBATIM_CHECKSUM_MISMATCH'));
  });
});
