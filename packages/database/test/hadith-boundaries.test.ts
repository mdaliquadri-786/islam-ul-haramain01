/**
 * @file hadith-boundaries.test.ts
 * @package @islamic/database
 * @description Boundary tests for canonical Hadith narrations across Kutub al-Sittah:
 *              Bukhari Hadith 1 (Intentions), Muslim Hadith 93 (Jibril),
 *              Abu Dawud Hadith 1, Tirmidhi Hadith 1, Nasa'i Hadith 1, Ibn Majah Hadith 1.
 */

import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as path from 'node:path';
import {
  loadHadithNarrations,
  loadHadithGradings,
  loadScholarAuthors,
  loadHadithCollections
} from '../src/hadith/hadith-parser.js';

describe('Hadith Boundary Narrations & Scholarly Gradings Verification', () => {
  const dataDir = path.resolve(__dirname, '../data/hadith');
  const narrations = loadHadithNarrations(path.join(dataDir, 'narrations.json'));
  const gradings = loadHadithGradings(path.join(dataDir, 'gradings.json'));
  const scholars = loadScholarAuthors(path.join(dataDir, 'scholars.json'));
  const collections = loadHadithCollections(path.join(dataDir, 'collections.json'));

  const scholarMap = new Map(scholars.map((s) => [s.id, s]));

  it('Bukhari Hadith 1: should preserve Innama al-a`malu bin-niyyat, Sanad, Matn, English, and consensus gradings', () => {
    const h1 = narrations.find((n) => n.collection_id === 'bukhari' && n.hadith_number === 1);
    assert.ok(h1, 'Bukhari Hadith 1 must exist');

    // Verify Sanad
    assert.ok(h1.sanad_arabic, 'Sanad must be present');
    assert.ok(h1.sanad_arabic.includes('الْحُمَيْدِيُّ'), 'Sanad mentions Al-Humaydi');
    assert.ok(h1.sanad_arabic.includes('سُفْيَانُ'), 'Sanad mentions Sufyan');
    assert.ok(h1.sanad_arabic.includes('عُمَرَ بْنَ الْخَطَّابِ'), 'Sanad mentions Umar ibn al-Khattab');

    // Verify Matn
    assert.ok(h1.matn_arabic.includes('إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ'), 'Matn contains famous opening phrase');
    assert.ok(h1.matn_arabic.includes('هِجْرَتُهُ'), 'Matn contains hijrah phrase');

    // Verify Clean search text
    assert.ok(h1.matn_clean.includes('انما الاعمال بالنيات'));

    // Verify English translation
    assert.ok(h1.translation_english, 'English translation must be present');
    assert.ok(h1.translation_english.toLowerCase().includes('intentions'));

    // Verify Gradings
    const h1Gradings = gradings.filter((g) => g.hadith_id === h1.id);
    assert.ok(h1Gradings.length >= 2, 'Must have at least compiler & Darussalam consensus gradings');

    const bukhariGrade = h1Gradings.find((g) => {
      const sch = scholarMap.get(g.scholar_id);
      return sch?.slug === 'imam-bukhari';
    });
    assert.ok(bukhariGrade, 'Imam al-Bukhari consensus grading must be attributed');
    assert.strictEqual(bukhariGrade.grade_level, 'sahih');
    assert.strictEqual(bukhariGrade.grade_arabic, 'صحيح بالإجماع');
  });

  it('Muslim Hadith 93 (Book 1, Hadith 1): should preserve the famous Hadith of Jibril', () => {
    const jibril = narrations.find((n) => n.collection_id === 'muslim' && n.hadith_number === 93);
    assert.ok(jibril, 'Muslim Hadith 93 (Book 1 Hadith 1) must exist');

    assert.ok(jibril.sanad_arabic, 'Sanad must be present');
    assert.ok(jibril.sanad_arabic.includes('يَحْيَى بْنِ يَعْمَرَ'), 'Sanad mentions Yahya ibn Ya`mar');
    assert.ok(jibril.sanad_arabic.includes('عَبْدُ اللَّهِ بْنُ عُمَرَ'), 'Sanad mentions Abdullah ibn Umar');

    // Verify Matn covers Islam, Iman, Ihsan, Hour
    assert.ok(jibril.matn_arabic.includes('الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ'));
    assert.ok(jibril.matn_arabic.includes('الإِيمَانِ'));
    assert.ok(jibril.matn_arabic.includes('الإِحْسَانِ'));
    assert.ok(jibril.matn_arabic.includes('السَّاعَةِ'));
    assert.ok(jibril.matn_arabic.includes('جِبْرِيلُ أَتَاكُمْ يُعَلِّمُكُمْ دِينَكُمْ'));

    // Verify English translation
    assert.ok(jibril.translation_english?.includes('Islam'));

    // Verify Gradings
    const jibrilGradings = gradings.filter((g) => g.hadith_id === jibril.id);
    assert.ok(jibrilGradings.length >= 2);
    const muslimGrade = jibrilGradings.find((g) => {
      const sch = scholarMap.get(g.scholar_id);
      return sch?.slug === 'imam-muslim';
    });
    assert.ok(muslimGrade);
    assert.strictEqual(muslimGrade.grade_level, 'sahih');
  });

  it('Abu Dawud Hadith 1: should have explicit multi-scholar evaluations', () => {
    const ad1 = narrations.find((n) => n.collection_id === 'abudawud' && n.hadith_number === 1);
    assert.ok(ad1, 'Abu Dawud Hadith 1 must exist');

    assert.ok(ad1.matn_arabic.includes('أَبْعَدَ'));

    const ad1Gradings = gradings.filter((g) => g.hadith_id === ad1.id);
    assert.ok(ad1Gradings.length >= 3, 'Must have at least 3 scholar evaluations');

    const albani = ad1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'al-albani');
    assert.ok(albani, 'Al-Albani grading must exist');
    assert.strictEqual(albani.grade_level, 'sahih');

    const arnaut = ad1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'arnaut');
    assert.ok(arnaut, 'Shu`ayb al-Arna`ut grading must exist');
    assert.strictEqual(arnaut.grade_level, 'sahih');

    const zubair = ad1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'zubair-ali-zai');
    assert.ok(zubair, 'Zubair Ali Zai grading must exist');
    assert.strictEqual(zubair.grade_level, 'hasan');
  });

  it('Tirmidhi Hadith 1: should have multi-scholar evaluations by Ahmad Shakir, Al-Albani, Zubair Ali Zai', () => {
    const tirm1 = narrations.find((n) => n.collection_id === 'tirmidhi' && n.hadith_number === 1);
    assert.ok(tirm1, 'Tirmidhi Hadith 1 must exist');
    assert.ok(tirm1.matn_arabic.includes('لاَ تُقْبَلُ صَلاَةٌ بِغَيْرِ طُهُورٍ'));

    const tirm1Gradings = gradings.filter((g) => g.hadith_id === tirm1.id);
    assert.ok(tirm1Gradings.length >= 3);

    const shakir = tirm1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'ahmad-shakir');
    assert.ok(shakir, 'Ahmad Muhammad Shakir grading must exist');
    assert.strictEqual(shakir.grade_level, 'sahih');

    const albani = tirm1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'al-albani');
    assert.ok(albani, 'Al-Albani grading must exist');
    assert.strictEqual(albani.grade_level, 'sahih');

    const zubair = tirm1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'zubair-ali-zai');
    assert.ok(zubair, 'Zubair Ali Zai grading must exist');
    assert.strictEqual(zubair.grade_level, 'sahih');
  });

  it('Nasa`i Hadith 1: should have evaluations by Al-Albani and Abu Ghuddah', () => {
    const nas1 = narrations.find((n) => n.collection_id === 'nasai' && n.hadith_number === 1);
    assert.ok(nas1, 'Nasa`i Hadith 1 must exist');
    assert.ok(nas1.matn_arabic.includes('إِذَا اسْتَيْقَظَ أَحَدُكُمْ مِنْ نَوْمِهِ'));

    const nas1Gradings = gradings.filter((g) => g.hadith_id === nas1.id);
    assert.ok(nas1Gradings.length >= 2);

    const albani = nas1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'al-albani');
    assert.ok(albani);
    assert.strictEqual(albani.grade_level, 'sahih');

    const abuGhuddah = nas1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'abu-ghuddah');
    assert.ok(abuGhuddah);
    assert.strictEqual(abuGhuddah.grade_level, 'sahih');
  });

  it('Ibn Majah Hadith 1: should have evaluations by Al-Albani, Shu`ayb al-Arna`ut, Abd al-Baqi', () => {
    const ibnm1 = narrations.find((n) => n.collection_id === 'ibnmajah' && n.hadith_number === 1);
    assert.ok(ibnm1, 'Ibn Majah Hadith 1 must exist');
    assert.ok(ibnm1.matn_arabic.includes('مَا أَمَرْتُكُمْ بِهِ فَخُذُوهُ'));

    const ibnm1Gradings = gradings.filter((g) => g.hadith_id === ibnm1.id);
    assert.ok(ibnm1Gradings.length >= 3);

    const albani = ibnm1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'al-albani');
    assert.ok(albani);
    assert.strictEqual(albani.grade_level, 'sahih');

    const arnaut = ibnm1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'arnaut');
    assert.ok(arnaut);
    assert.strictEqual(arnaut.grade_level, 'sahih');

    const baqi = ibnm1Gradings.find((g) => scholarMap.get(g.scholar_id)?.slug === 'abd-al-baqi');
    assert.ok(baqi);
    assert.strictEqual(baqi.grade_level, 'sahih');
  });

  it('All 6 Kutub al-Sittah collections must have published status and author foreign key links', () => {
    assert.strictEqual(collections.length, 6);
    for (const c of collections) {
      assert.strictEqual(c.status, 'published');
      const author = scholarMap.get(c.author_id);
      assert.ok(author, `Author ${c.author_id} for collection ${c.id} must exist in scholars registry`);
      assert.strictEqual(author.role, 'compiler');
    }
  });
});
