/**
 * @file duas-engine.test.ts
 * @package @islamic/islamic-engine
 * @description Unit and integrity test suite for the Duas & Adhkar computational engine.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDuaChecksum,
  verifyDuaChecksum,
  calculateDuaDatasetChecksum,
  normalizeDuaSearchText,
  validateDuaDataset,
  DuaAdhkar,
  DuaCategory,
  DuaSource
} from '../src/index.js';

describe('Duas Engine: Cryptographic Checksum Integrity', () => {
  const sampleArabic = 'الحَمْـدُ لِلّهِ الّذي أَحْـيانا بَعْـدَ ما أَماتَـنا وَإليه النُّـشور';

  it('should calculate valid 64-char lowercase hexadecimal SHA-256 checksum', () => {
    const hash = calculateDuaChecksum(sampleArabic);
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it('should throw error when given empty or whitespace-only text', () => {
    assert.throws(() => calculateDuaChecksum(''), /cannot be empty/);
    assert.throws(() => calculateDuaChecksum('   '), /cannot be empty/);
  });

  it('should verify matching checksum with verifyDuaChecksum', () => {
    const hash = calculateDuaChecksum(sampleArabic);
    assert.equal(verifyDuaChecksum(sampleArabic, hash), true);
    assert.equal(verifyDuaChecksum(sampleArabic, hash.toUpperCase()), true);
  });

  it('should detect altered text or diacritics', () => {
    const hash = calculateDuaChecksum(sampleArabic);
    // Altered text
    const tampered = sampleArabic.replace('أَحْـيانا', 'احيانا');
    assert.equal(verifyDuaChecksum(tampered, hash), false);
  });

  it('should reject invalid checksum format in verifyDuaChecksum', () => {
    assert.equal(verifyDuaChecksum(sampleArabic, 'too-short'), false);
    assert.equal(verifyDuaChecksum(sampleArabic, ''), false);
  });

  it('should calculate deterministic dataset checksums sensitive to order and content', () => {
    const dua1: DuaAdhkar = {
      id: 'hisn-1',
      categoryId: 1,
      categorySlug: 'when-waking-up',
      sourceId: 'hisn-al-muslim',
      itemNumber: 1,
      arabicText: sampleArabic,
      transliteration: 'Alhamdu lillah...',
      translationEnglish: 'Praise is to Allah...',
      translationUrdu: null,
      repeatCount: 1,
      occasionContext: 'Upon waking',
      quranSurah: null,
      quranAyah: null,
      hadithCollection: 'bukhari',
      hadithNumber: null,
      hadithReference: 'Al-Bukhari 11/113',
      hadithGrade: 'Sahih',
      textChecksum: calculateDuaChecksum(sampleArabic),
      textClean: normalizeDuaSearchText(sampleArabic)
    };

    const text2 = 'سُبْحَانَ اللهِ وَبِحَمْدِهِ';
    const dua2: DuaAdhkar = {
      ...dua1,
      id: 'hisn-2',
      itemNumber: 2,
      arabicText: text2,
      textChecksum: calculateDuaChecksum(text2),
      textClean: normalizeDuaSearchText(text2)
    };

    const dsHash1 = calculateDuaDatasetChecksum([dua1, dua2]);
    const dsHash2 = calculateDuaDatasetChecksum([dua2, dua1]); // order shouldn't matter since it sorts internally
    assert.equal(dsHash1, dsHash2);

    const dua2Tampered = { ...dua2, textChecksum: '0'.repeat(64) };
    const dsHashTampered = calculateDuaDatasetChecksum([dua1, dua2Tampered]);
    assert.notEqual(dsHash1, dsHashTampered);
  });
});

describe('Duas Engine: Arabic Search Normalization', () => {
  it('should remove tashkeel / harakat and tanween', () => {
    const input = 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ';
    const output = normalizeDuaSearchText(input);
    assert.equal(output, 'الحمد لله رب العالمين');
  });

  it('should standardize alef variants and normalize alif maqsura and taa marbuta', () => {
    const input = 'إِنَّ أُمَّةَ عِيسَى عَلَيْهِ السَّلَامُ';
    const output = normalizeDuaSearchText(input);
    assert.equal(output, 'ان امه عيسي عليه السلام');
  });

  it('should strip tatweel / kashida and punctuation', () => {
    const input = 'سُــبْـحَـانَ اللهِ! {وَالْحَمْدُ لِلَّهِ}، [وَاللهُ أَكْبَرُ]؟';
    const output = normalizeDuaSearchText(input);
    assert.equal(output, 'سبحان الله والحمد لله والله اكبر');
  });

  it('should collapse whitespace and handle empty input gracefully', () => {
    assert.equal(normalizeDuaSearchText('   الله   أكبر   '), 'الله اكبر');
    assert.equal(normalizeDuaSearchText(''), '');
  });
});

describe('Duas Engine: Dataset Validation Suite', () => {
  const dummySource: DuaSource = {
    id: 'hisn-al-muslim',
    slug: 'hisn-al-muslim',
    nameArabic: 'حصن المسلم',
    nameEnglish: 'Fortress of the Muslim',
    nameUrdu: 'حصن المسلم',
    author: "Shaykh Sa'id al-Qahtani",
    authorArabic: 'سعيد القحطاني',
    authorDeathYearAh: 1440,
    authorDeathYearCe: 2018,
    license: 'Waqf',
    description: 'Authentic supplications',
    status: 'published'
  };

  const dummyCategory: DuaCategory = {
    id: 1,
    slug: 'when-waking-up',
    nameArabic: 'أذكار الاستيقاظ من النوم',
    nameEnglish: 'When waking up',
    nameUrdu: 'سو کر اٹھنے کی دعا',
    sortOrder: 1,
    totalDuas: 1
  };

  const validDua: DuaAdhkar = {
    id: 'hisn-1',
    categoryId: 1,
    categorySlug: 'when-waking-up',
    sourceId: 'hisn-al-muslim',
    itemNumber: 1,
    arabicText: 'الحَمْـدُ لِلّهِ الّذي أَحْـيانا بَعْـدَ ما أَماتَـنا وَإليه النُّـشور',
    transliteration: "Alhamdu lillahi...",
    translationEnglish: 'Praise is to Allah who gave us life...',
    translationUrdu: null,
    repeatCount: 1,
    occasionContext: 'When waking up',
    quranSurah: null,
    quranAyah: null,
    hadithCollection: 'bukhari',
    hadithNumber: null,
    hadithReference: 'Al-Bukhari 11/113',
    hadithGrade: 'Sahih',
    textChecksum: calculateDuaChecksum('الحَمْـدُ لِلّهِ الّذي أَحْـيانا بَعْـدَ ما أَماتَـنا وَإليه النُّـشور'),
    textClean: normalizeDuaSearchText('الحَمْـدُ لِلّهِ الّذي أَحْـيانا بَعْـدَ ما أَماتَـنا وَإليه النُّـشور')
  };

  it('should validate a correct dataset without any issues', () => {
    const res = validateDuaDataset([validDua], [dummyCategory], [dummySource]);
    assert.equal(res.isValid, true);
    assert.equal(res.issues.length, 0);
    assert.equal(res.totalDuas, 1);
    assert.equal(res.totalCategories, 1);
    assert.equal(res.datasetChecksum.length, 64);
  });

  it('should detect checksum mismatch', () => {
    const tampered = { ...validDua, textChecksum: 'a'.repeat(64) };
    const res = validateDuaDataset([tampered], [dummyCategory], [dummySource]);
    assert.equal(res.isValid, false);
    assert.equal(res.issues.some((i) => i.code === 'CHECKSUM_MISMATCH'), true);
  });

  it('should detect Unicode replacement character (U+FFFD)', () => {
    const corrupted = { ...validDua, arabicText: 'الحَمْـدُ \uFFFD لِلّهِ' };
    corrupted.textChecksum = calculateDuaChecksum(corrupted.arabicText);
    const res = validateDuaDataset([corrupted], [dummyCategory], [dummySource]);
    assert.equal(res.isValid, false);
    assert.equal(res.issues.some((i) => i.code === 'ENCODING_ERROR_ARABIC'), true);
  });

  it('should detect orphan category or source reference', () => {
    const orphanCat = { ...validDua, categoryId: 999 };
    orphanCat.textChecksum = calculateDuaChecksum(orphanCat.arabicText);
    const resCat = validateDuaDataset([orphanCat], [dummyCategory], [dummySource]);
    assert.equal(resCat.isValid, false);
    assert.equal(resCat.issues.some((i) => i.code === 'ORPHAN_CATEGORY_ID'), true);

    const orphanSrc = { ...validDua, sourceId: 'unknown-source' };
    orphanSrc.textChecksum = calculateDuaChecksum(orphanSrc.arabicText);
    const resSrc = validateDuaDataset([orphanSrc], [dummyCategory], [dummySource]);
    assert.equal(resSrc.isValid, false);
    assert.equal(resSrc.issues.some((i) => i.code === 'ORPHAN_SOURCE_ID'), true);
  });

  it('should detect duplicate Dua ID or item number', () => {
    const dua2 = { ...validDua, itemNumber: 2 };
    const resDupId = validateDuaDataset([validDua, dua2], [dummyCategory], [dummySource]);
    assert.equal(resDupId.isValid, false);
    assert.equal(resDupId.issues.some((i) => i.code === 'DUPLICATE_DUA_ID'), true);

    const dua3 = { ...validDua, id: 'hisn-2' };
    const resDupNum = validateDuaDataset([validDua, dua3], [dummyCategory], [dummySource]);
    assert.equal(resDupNum.isValid, false);
    assert.equal(resDupNum.issues.some((i) => i.code === 'DUPLICATE_ITEM_NUMBER'), true);
  });

  it('should detect invalid repeat count (< 1)', () => {
    const badCount = { ...validDua, repeatCount: 0 };
    const res = validateDuaDataset([badCount], [dummyCategory], [dummySource]);
    assert.equal(res.isValid, false);
    assert.equal(res.issues.some((i) => i.code === 'INVALID_REPEAT_COUNT'), true);
  });

  it('should detect invalid Quran Surah number', () => {
    const badSurah = { ...validDua, quranSurah: 115 };
    const res = validateDuaDataset([badSurah], [dummyCategory], [dummySource]);
    assert.equal(res.isValid, false);
    assert.equal(res.issues.some((i) => i.code === 'INVALID_QURAN_SURAH'), true);
  });
});
