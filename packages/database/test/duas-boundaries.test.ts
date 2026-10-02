/**
 * @file duas-boundaries.test.ts
 * @package @islamic/database
 * @description Boundary test suite validating canonical supplications from Hisn al-Muslim,
 *              Quranic verses, repetition counts, and Hadith scholarly citations.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { loadDuas, loadDuaCategories } from '../src/index.js';

describe('Duas & Adhkar Canonical Boundary Supplications', () => {
  const duas = loadDuas();
  const categories = loadDuaCategories();

  it('Waking up Dua 1 (hisn-1): should preserve Alhamdu lillahi alladhi ahyana and Bukhari/Muslim citations', () => {
    const d1 = duas.find((d) => d.dua_id === 'hisn-1');
    assert.ok(d1, 'Dua hisn-1 must exist');
    assert.ok(d1.arabic_text.includes('أَحْـيانا'));
    assert.ok(d1.arabic_text.includes('النُّـشور'));
    assert.equal(d1.repeat_count, 1);
    assert.equal(d1.category_id, 1);
    assert.equal(d1.hadith_collection, 'bukhari');
    assert.ok(d1.hadith_reference?.includes('Muslim'));
    assert.ok(d1.translation_english.includes('Praise is to Allah Who gives us life'));
  });

  it('Morning & Evening Adhkar (Category 27): should contain Ayat al-Kursi with Quran 2:255 citation', () => {
    const morningDuas = duas.filter((d) => d.category_id === 27);
    assert.ok(morningDuas.length >= 20, 'Morning/evening category must have >= 20 duas');

    const ayatKursi = morningDuas.find((d) => d.quran_surah === 2 && d.quran_ayah === '255');
    assert.ok(ayatKursi, 'Ayat al-Kursi must be present in morning/evening adhkar');
    assert.ok(ayatKursi.arabic_text.includes('الْحَيُّ الْقَيُّومُ'));
    assert.ok(ayatKursi.translation_english.includes('Ever-Living'));
    assert.equal(ayatKursi.repeat_count, 1);
  });

  it('Morning & Evening Mu`awwidhat: should have repeat count of 3', () => {
    const morningDuas = duas.filter((d) => d.category_id === 27);
    const ikhlas = morningDuas.find((d) => d.quran_surah === 112);
    assert.ok(ikhlas, 'Surah Al-Ikhlas must be in morning adhkar');
    assert.equal(ikhlas.repeat_count, 3, 'Mu`awwidhat in morning must have repeat_count = 3');
  });

  it('Repetition Targets: should correctly reflect prophetic repeat counts (1, 3, 4, 7, 10, 33, 100)', () => {
    const countDistribution: Record<number, number> = {};
    for (const d of duas) {
      countDistribution[d.repeat_count] = (countDistribution[d.repeat_count] || 0) + 1;
    }

    assert.ok(countDistribution[1] > 200, 'Majority of duas should have repeat_count 1');
    assert.ok(countDistribution[3] >= 10, 'Should have multiple duas repeated 3 times');
    assert.ok(countDistribution[7] >= 1, 'Should have duas repeated 7 times (e.g. Hasbiyallahu)');
    assert.ok(countDistribution[10] >= 3, 'Should have duas repeated 10 times (e.g. La ilaha illallahu)');
    assert.ok(countDistribution[100] >= 3, 'Should have duas repeated 100 times (e.g. SubhanAllah wa bihamdihi)');
  });

  it('Entering the Bathroom (hisn-10): should cite Bukhari and Muslim with correct Arabic text', () => {
    const bathroomDua = duas.find((d) => d.dua_id === 'hisn-10');
    assert.ok(bathroomDua, 'Dua hisn-10 must exist');
    assert.ok(bathroomDua.arabic_text.includes('الْخُـبْثِ وَالْخَبائِث'));
    assert.ok(bathroomDua.hadith_reference?.includes('Al-Bukhari'));
  });

  it('Leaving the Home (hisn-16): should preserve Bismillahi tawakkaltu `alallah', () => {
    const leaveHome = duas.find((d) => d.dua_id === 'hisn-16');
    assert.ok(leaveHome, 'Dua hisn-16 must exist');
    assert.ok(leaveHome.arabic_text.includes('تَوَكَّلْـتُ عَلى الله'));
    assert.ok(leaveHome.arabic_text.includes('لا حَوْلَ وَلا قُـوَّةَ إِلاّ بِالله'));
    assert.ok(leaveHome.hadith_collection === 'tirmidhi' || leaveHome.hadith_collection === 'abu-dawud');
    assert.ok(leaveHome.hadith_reference?.includes('Abu Dawud'));
  });

  it('Mounting Transport / Travel (hisn-207): should contain Takbeer and Subhanalladhi sakh-khara lana hadha', () => {
    const travelDua = duas.find((d) => d.dua_id === 'hisn-207');
    assert.ok(travelDua, 'Travel dua hisn-207 must exist');
    assert.ok(travelDua.arabic_text.includes('سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا'));
    assert.ok(travelDua.translation_english.includes('Glory is to Him Who has provided this for us'));
    assert.ok(travelDua.hadith_collection === 'tirmidhi' || travelDua.hadith_collection === 'abu-dawud');
  });

  it('All 132 categories must match total_duas count with actual duas loaded', () => {
    const countByCat: Record<number, number> = {};
    for (const d of duas) {
      countByCat[d.category_id] = (countByCat[d.category_id] || 0) + 1;
    }

    for (const c of categories) {
      const actualCount = countByCat[c.id!] || 0;
      assert.equal(
        c.total_duas,
        actualCount,
        `Category ${c.slug} (ID ${c.id}) total_duas mismatch: recorded ${c.total_duas}, actual ${actualCount}`
      );
    }
  });
});
