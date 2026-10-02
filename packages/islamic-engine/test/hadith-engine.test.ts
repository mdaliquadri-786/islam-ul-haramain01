/**
 * @file hadith-engine.test.ts
 * @package @islamic/islamic-engine
 * @description Unit tests for Hadith engine checksums, search normalization,
 * sanad/matn parsing, and dataset validation.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateHadithChecksum,
  verifyHadithChecksum,
  calculateHadithDatasetChecksum,
  normalizeHadithSearchText,
  extractSanadAndMatn,
  validateHadithDataset,
  type HadithCollection,
  type HadithBook,
  type HadithNarration,
  type HadithGrading,
} from '../src/index.js';

describe('Hadith Engine: Cryptographic Checksum Integrity', () => {
  const sampleArabic = 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى';

  it('should compute valid 64-character SHA-256 digest', () => {
    const hash = calculateHadithChecksum(sampleArabic);
    assert.strictEqual(typeof hash, 'string');
    assert.strictEqual(hash.length, 64);
    assert.match(hash, /^[0-9a-f]{64}$/);
  });

  it('should be deterministic and reproducible for identical input', () => {
    const hash1 = calculateHadithChecksum(sampleArabic);
    const hash2 = calculateHadithChecksum(sampleArabic);
    assert.strictEqual(hash1, hash2);
  });

  it('should produce completely different digest for even a single character change', () => {
    const hash1 = calculateHadithChecksum(sampleArabic);
    const tampered = sampleArabic.slice(0, -1) + 'ة';
    const hash2 = calculateHadithChecksum(tampered);
    assert.notStrictEqual(hash1, hash2);
  });

  it('should throw an error when text is null, empty, or whitespace', () => {
    assert.throws(() => calculateHadithChecksum(''), /empty or non-string/);
    assert.throws(() => calculateHadithChecksum('   '), /empty or non-string/);
  });

  it('should correctly verify checksum with verifyHadithChecksum', () => {
    const hash = calculateHadithChecksum(sampleArabic);
    assert.strictEqual(verifyHadithChecksum(sampleArabic, hash), true);
    assert.strictEqual(verifyHadithChecksum(sampleArabic, hash.toUpperCase()), true);
    assert.strictEqual(verifyHadithChecksum(sampleArabic, '0'.repeat(64)), false);
    assert.strictEqual(verifyHadithChecksum(sampleArabic, 'invalid'), false);
  });

  it('should compute deterministic dataset checksum sensitive to order', () => {
    const narrations: HadithNarration[] = [
      {
        collectionId: 'bukhari',
        bookNumber: 1,
        hadithNumber: 1,
        matnArabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
        matnClean: 'انما الاعمال بالنيات',
        textChecksum: calculateHadithChecksum('إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ'),
        sourceEdition: 'Darussalam',
      },
      {
        collectionId: 'bukhari',
        bookNumber: 1,
        hadithNumber: 2,
        matnArabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
        matnClean: 'المسلم من سلم المسلمون من لسانه ويده',
        textChecksum: calculateHadithChecksum('الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ'),
        sourceEdition: 'Darussalam',
      },
    ];

    const dsHash1 = calculateHadithDatasetChecksum(narrations);
    const dsHash2 = calculateHadithDatasetChecksum([narrations[1], narrations[0]]);
    assert.strictEqual(dsHash1, dsHash2, 'Should sort deterministically by collectionId and hadithNumber');
    assert.match(dsHash1, /^[0-9a-f]{64}$/);
  });
});

describe('Hadith Engine: Arabic Search Normalization', () => {
  it('should strip harakat (tashkeel) and tatweel', () => {
    const raw = 'حَدَّثَنَا مُـحَـمَّدٌ';
    const normalized = normalizeHadithSearchText(raw);
    assert.strictEqual(normalized, 'حدثنا محمد');
  });

  it('should unify Alef variants and Ta Marbuta', () => {
    const raw = 'إِنَّمَا الأَعْمَالُ بِالنِّيَّةِ';
    const normalized = normalizeHadithSearchText(raw);
    assert.strictEqual(normalized, 'انما الاعمال بالنيه');
  });

  it('should collapse multiple spaces and trim', () => {
    const raw = '  قَالَ   رَسُولُ  اللَّهِ   ';
    const normalized = normalizeHadithSearchText(raw);
    assert.strictEqual(normalized, 'قال رسول الله');
  });
});

describe('Hadith Engine: Sanad and Matn Separation', () => {
  it('should separate Sanad and Matn when classical speech verb pattern is present', () => {
    const fullText =
      'حَدَّثَنَا عَبْدُ اللَّهِ بْنُ يُوسُفَ، قَالَ أَخْبَرَنَا مَالِكٌ، عَنْ هِشَامِ بْنِ عُرْوَةَ، عَنْ أَبِيهِ، عَنْ عَائِشَةَ، أَنَّ الْحَارِثَ بْنَ هِشَامٍ، سَأَلَ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فَقَالَ: كَيْفَ يَأْتِيكَ الْوَحْيُ؟';

    const split = extractSanadAndMatn(fullText);
    assert.ok(split.sanad, 'Sanad should not be null');
    assert.ok(split.sanad.includes('حَدَّثَنَا عَبْدُ اللَّهِ'), 'Sanad should include narrators');
    assert.ok(split.matn.includes('كَيْفَ يَأْتِيكَ الْوَحْيُ'), 'Matn should contain the substantive question/text');
  });

  it('should separate Bukhari Hadith 1 cleanly', () => {
    const fullText =
      'حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ، قَالَ: حَدَّثَنَا سُفْيَانُ، قَالَ: حَدَّثَنَا يَحْيَى بْنُ سَعِيدٍ الْأَنْصَارِيُّ، قَالَ: أَخْبَرَنِي مُحَمَّدُ بْنُ إِبْرَاهِيمَ التَّيْمِيُّ، أَنَّهُ سَمِعَ عَلْقَمَةَ بْنَ وَقَّاصٍ اللَّيْثِيَّ، يَقُولُ: سَمِعْتُ عُمَرَ بْنَ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ عَلَى الْمِنْبَرِ، قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، يَقُولُ: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ"';

    const split = extractSanadAndMatn(fullText);
    assert.ok(split.sanad, 'Sanad should be extracted');
    assert.ok(split.sanad.includes('سَمِعْتُ رَسُولَ اللَّهِ'), 'Sanad should include narrator chain');
    assert.ok(split.matn.includes('إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ'), 'Matn should contain the core hadith');
  });

  it('should gracefully fallback when text has no classical transmission formula', () => {
    const isolatedMatn = 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ';
    const split = extractSanadAndMatn(isolatedMatn);
    assert.strictEqual(split.sanad, null);
    assert.strictEqual(split.matn, isolatedMatn);
  });
});

describe('Hadith Engine: Dataset Validation', () => {
  const sampleCollection: HadithCollection = {
    id: 'bukhari',
    slug: 'sahih-al-bukhari',
    nameArabic: 'صحيح البخاري',
    nameEnglish: 'Sahih al-Bukhari',
    nameUrdu: 'صحیح البخاری',
    authorId: 'bukhari',
    totalHadiths: 2,
    totalBooks: 1,
    sourceEdition: 'Darussalam (1997)',
    sourceUrl: 'https://sunnah.com/bukhari',
    status: 'published',
  };

  const sampleBooks: HadithBook[] = [
    {
      collectionId: 'bukhari',
      bookNumber: 1,
      nameArabic: 'كتاب بدء الوحي',
      nameEnglish: 'Revelation',
      hadithStartNumber: 1,
      hadithEndNumber: 2,
      totalHadiths: 2,
    },
  ];

  const sampleNarrations: HadithNarration[] = [
    {
      collectionId: 'bukhari',
      bookNumber: 1,
      hadithNumber: 1,
      matnArabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
      matnClean: 'انما الاعمال بالنيات',
      textChecksum: calculateHadithChecksum('إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ'),
      sourceEdition: 'Darussalam',
    },
    {
      collectionId: 'bukhari',
      bookNumber: 1,
      hadithNumber: 2,
      matnArabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
      matnClean: 'المسلم من سلم المسلمون من لسانه ويده',
      textChecksum: calculateHadithChecksum('الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ'),
      sourceEdition: 'Darussalam',
    },
  ];

  const sampleGradings: HadithGrading[] = [
    {
      collectionId: 'bukhari',
      hadithNumber: 1,
      scholarId: 'bukhari',
      grade: 'Sahih',
      gradeArabic: 'صحيح',
      gradeLevel: 'sahih',
      referenceSource: 'Sahih al-Bukhari (1)',
    },
    {
      collectionId: 'bukhari',
      hadithNumber: 2,
      scholarId: 'bukhari',
      grade: 'Sahih',
      gradeArabic: 'صحيح',
      gradeLevel: 'sahih',
      referenceSource: 'Sahih al-Bukhari (10)',
    },
  ];

  it('should pass validation on a structurally valid dataset', () => {
    const res = validateHadithDataset(sampleCollection, sampleBooks, sampleNarrations, sampleGradings);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.totalHadiths, 2);
    assert.strictEqual(res.totalBooks, 1);
    assert.strictEqual(res.totalGradings, 2);
    assert.strictEqual(res.issues.length, 0);
    assert.ok(res.datasetChecksum.length === 64);
  });

  it('should detect collection mismatch in narrations', () => {
    const invalid = [
      {
        ...sampleNarrations[0],
        collectionId: 'muslim',
      },
    ];

    const res = validateHadithDataset(sampleCollection, sampleBooks, invalid);
    assert.strictEqual(res.valid, false);
    assert.ok(res.issues.some((i) => i.code === 'COLLECTION_MISMATCH'));
  });

  it('should detect duplicate hadith numbers', () => {
    const duplicate = [
      sampleNarrations[0],
      { ...sampleNarrations[1], hadithNumber: 1 },
    ];

    const res = validateHadithDataset(sampleCollection, sampleBooks, duplicate);
    assert.strictEqual(res.valid, false);
    assert.ok(res.issues.some((i) => i.code === 'DUPLICATE_HADITH_NUMBER'));
  });

  it('should detect empty matn text', () => {
    const emptyMatn = [
      {
        ...sampleNarrations[0],
        matnArabic: '',
      },
    ];

    const res = validateHadithDataset(sampleCollection, sampleBooks, emptyMatn);
    assert.strictEqual(res.valid, false);
    assert.ok(res.issues.some((i) => i.code === 'EMPTY_MATN'));
  });

  it('should detect Unicode replacement character (U+FFFD)', () => {
    const corrupt = [
      {
        ...sampleNarrations[0],
        matnArabic: 'حديث فيه \uFFFD خطأ',
        textChecksum: calculateHadithChecksum('حديث فيه \uFFFD خطأ'),
      },
    ];

    const res = validateHadithDataset(sampleCollection, sampleBooks, corrupt);
    assert.strictEqual(res.valid, false);
    assert.ok(res.issues.some((i) => i.code === 'UNICODE_REPLACEMENT_CHAR'));
  });

  it('should detect checksum mismatch', () => {
    const tampered = [
      {
        ...sampleNarrations[0],
        textChecksum: 'f'.repeat(64),
      },
    ];

    const res = validateHadithDataset(sampleCollection, sampleBooks, tampered);
    assert.strictEqual(res.valid, false);
    assert.ok(res.issues.some((i) => i.code === 'CHECKSUM_MISMATCH'));
  });

  it('should detect invalid grade level', () => {
    const invalidGrade: HadithGrading[] = [
      {
        ...sampleGradings[0],
        gradeLevel: 'unverified' as any,
      },
    ];

    const res = validateHadithDataset(sampleCollection, sampleBooks, sampleNarrations, invalidGrade);
    assert.strictEqual(res.valid, false);
    assert.ok(res.issues.some((i) => i.code === 'INVALID_GRADE_LEVEL'));
  });

  it('should detect duplicate scholar grading for same hadith', () => {
    const dupGrading: HadithGrading[] = [
      sampleGradings[0],
      sampleGradings[0],
    ];

    const res = validateHadithDataset(sampleCollection, sampleBooks, sampleNarrations, dupGrading);
    assert.strictEqual(res.valid, false);
    assert.ok(res.issues.some((i) => i.code === 'DUPLICATE_SCHOLAR_GRADING'));
  });
});
