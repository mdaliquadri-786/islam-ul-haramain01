/**
 * @file translation-boundaries.test.ts
 * @package @islamic/database
 * @description Validates boundary cases (1:1, 1:7, 2:1, 2:2, 2:255, 2:286, 9:1, 9:129, 114:1, 114:6)
 * for both Saheeh International and Maulana Fateh Muhammad Jalandhari.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parseTanzilTranslation } from '../src/quran/tanzil-translation-parser.js';
import {
  SAHEEH_INTERNATIONAL_CONFIG,
  JALANDHARI_CONFIG
} from '../src/ingest/import-translations.js';

describe('Quran Translation Boundary Cases Verification', () => {
  const candidate1 = path.resolve(process.cwd(), 'data/quran');
  const candidate2 = path.resolve(process.cwd(), 'packages/database/data/quran');
  const dataDir = fs.existsSync(candidate1) ? candidate1 : candidate2;
  const enPath = path.join(dataDir, 'translations/en.sahih.txt');
  const urPath = path.join(dataDir, 'translations/ur.jalandhry.txt');

  const enContent = fs.readFileSync(enPath, 'utf8');
  const urContent = fs.readFileSync(urPath, 'utf8');

  const enDataset = parseTanzilTranslation(enContent, SAHEEH_INTERNATIONAL_CONFIG);
  const urDataset = parseTanzilTranslation(urContent, JALANDHARI_CONFIG);

  function getAyah(dataset: typeof enDataset, surah: number, ayah: number) {
    return dataset.ayahs.find((a) => a.surahNumber === surah && a.ayahNumber === ayah);
  }

  describe('English (Saheeh International) Boundaries', () => {
    it('1:1 (Al-Fatihah Opening)', () => {
      const a = getAyah(enDataset, 1, 1);
      assert.ok(a);
      assert.strictEqual(a.translationText, 'In the name of Allah, the Entirely Merciful, the Especially Merciful.');
    });

    it('1:7 (Al-Fatihah Final Ayah)', () => {
      const a = getAyah(enDataset, 1, 7);
      assert.ok(a);
      assert.strictEqual(
        a.translationText,
        'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.'
      );
    });

    it('2:1 (Al-Baqarah Opening Muqattaat - no Bismillah prefix)', () => {
      const a = getAyah(enDataset, 2, 1);
      assert.ok(a);
      assert.strictEqual(a.translationText, 'Alif, Lam, Meem.');
    });

    it('2:2 (Al-Baqarah Second Ayah)', () => {
      const a = getAyah(enDataset, 2, 2);
      assert.ok(a);
      assert.strictEqual(
        a.translationText,
        'This is the Book about which there is no doubt, a guidance for those conscious of Allah -'
      );
    });

    it('2:255 (Ayat al-Kursi)', () => {
      const a = getAyah(enDataset, 2, 255);
      assert.ok(a);
      assert.ok(a.translationText.startsWith('Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence.'));
    });

    it('2:286 (Al-Baqarah Final Ayah)', () => {
      const a = getAyah(enDataset, 2, 286);
      assert.ok(a);
      assert.ok(a.translationText.startsWith('Allah does not charge a soul except [with that within] its capacity.'));
    });

    it('9:1 (At-Tawbah Opening - no Bismillah)', () => {
      const a = getAyah(enDataset, 9, 1);
      assert.ok(a);
      assert.strictEqual(
        a.translationText,
        '[This is a declaration of] disassociation, from Allah and His Messenger, to those with whom you had made a treaty among the polytheists.'
      );
    });

    it('9:129 (At-Tawbah Final Ayah)', () => {
      const a = getAyah(enDataset, 9, 129);
      assert.ok(a);
      assert.ok(a.translationText.startsWith('But if they turn away, [O Muhammad], say, "Sufficient for me is Allah;'));
    });

    it('114:1 (An-Nas Opening)', () => {
      const a = getAyah(enDataset, 114, 1);
      assert.ok(a);
      assert.strictEqual(a.translationText, 'Say, "I seek refuge in the Lord of mankind,');
    });

    it('114:6 (An-Nas Final Ayah of Quran)', () => {
      const a = getAyah(enDataset, 114, 6);
      assert.ok(a);
      assert.strictEqual(a.translationText, 'From among the jinn and mankind."');
    });
  });

  describe('Urdu (Fateh Muhammad Jalandhari) Boundaries', () => {
    it('1:1 (Al-Fatihah Opening)', () => {
      const a = getAyah(urDataset, 1, 1);
      assert.ok(a);
      assert.strictEqual(a.translationText, 'شروع الله کا نام لے کر جو بڑا مہربان نہایت رحم والا ہے');
    });

    it('1:7 (Al-Fatihah Final Ayah)', () => {
      const a = getAyah(urDataset, 1, 7);
      assert.ok(a);
      assert.strictEqual(
        a.translationText,
        'ان لوگوں کے رستے جن پر تو اپنا فضل وکرم کرتا رہا نہ ان کے جن پر غصے ہوتا رہا اور نہ گمراہوں کے'
      );
    });

    it('2:1 (Al-Baqarah Opening Muqattaat - no Bismillah prefix)', () => {
      const a = getAyah(urDataset, 2, 1);
      assert.ok(a);
      assert.strictEqual(a.translationText, 'الم');
    });

    it('2:2 (Al-Baqarah Second Ayah)', () => {
      const a = getAyah(urDataset, 2, 2);
      assert.ok(a);
      assert.strictEqual(
        a.translationText,
        'یہ کتاب (قرآن مجید) اس میں کچھ شک نہیں (کہ کلامِ خدا ہے۔ خدا سے) ڈرنے والوں کی رہنما ہے'
      );
    });

    it('2:255 (Ayat al-Kursi)', () => {
      const a = getAyah(urDataset, 2, 255);
      assert.ok(a);
      assert.ok(a.translationText.startsWith('خدا (وہ معبود برحق ہے کہ) اس کے سوا کوئی عبادت کے لائق نہیں'));
    });

    it('2:286 (Al-Baqarah Final Ayah)', () => {
      const a = getAyah(urDataset, 2, 286);
      assert.ok(a);
      assert.ok(a.translationText.startsWith('خدا کسی شخص کو اس کی طاقت سے زیادہ تکلیف نہیں دیتا'));
    });

    it('9:1 (At-Tawbah Opening - no Bismillah)', () => {
      const a = getAyah(urDataset, 9, 1);
      assert.ok(a);
      assert.strictEqual(
        a.translationText,
        '(اے اہل اسلام اب) خدا اور اس کے رسول کی طرف سے مشرکوں سے جن سے تم نے عہد کر رکھا تھا بیزاری (اور جنگ کی تیاری) ہے'
      );
    });

    it('9:129 (At-Tawbah Final Ayah)', () => {
      const a = getAyah(urDataset, 9, 129);
      assert.ok(a);
      assert.ok(a.translationText.startsWith('پھر اگر یہ لوگ پھر جائیں (اور نہ مانیں) تو کہہ دو کہ خدا مجھے کفایت کرتا ہے'));
    });

    it('114:1 (An-Nas Opening)', () => {
      const a = getAyah(urDataset, 114, 1);
      assert.ok(a);
      assert.strictEqual(a.translationText, 'کہو کہ میں لوگوں کے پروردگار کی پناہ مانگتا ہوں');
    });

    it('114:6 (An-Nas Final Ayah of Quran)', () => {
      const a = getAyah(urDataset, 114, 6);
      assert.ok(a);
      assert.strictEqual(a.translationText, 'وہ جنّات میں سے (ہو) یا انسانوں میں سے');
    });
  });
});
