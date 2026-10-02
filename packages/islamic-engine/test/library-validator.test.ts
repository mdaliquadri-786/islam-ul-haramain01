/**
 * @file library-validator.test.ts
 * @description Unit tests for User Library & Bookmarks canonical reference validation.
 * Milestone: M3.3 — User Library & Bookmarks
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateBookmarkInput } from '../src/library/validator.js';

describe('User Library & Bookmarks: Reference Validator', () => {
  describe('Content Type Validation', () => {
    it('should REJECT unsupported content types', () => {
      const res = validateBookmarkInput({
        contentType: 'audio_track' as any,
        contentReference: '123'
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('Unsupported content type'));
    });

    it('should REJECT empty content reference', () => {
      const res = validateBookmarkInput({
        contentType: 'quran',
        contentReference: '   '
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('cannot be empty'));
    });
  });

  describe('Quran Reference Validation', () => {
    it('should pass valid Quran citations within canonical bounds', () => {
      const testCases = ['1:1', '1:7', '2:255', '2:286', '114:1', '114:6'];
      for (const ref of testCases) {
        const res = validateBookmarkInput({
          contentType: 'quran',
          contentReference: ref
        });
        assert.strictEqual(res.valid, true, `Expected ${ref} to be valid`);
        assert.strictEqual(res.normalizedReference, ref);
      }
    });

    it('should REJECT out-of-bounds Surah numbers (> 114 or < 1)', () => {
      const res1 = validateBookmarkInput({ contentType: 'quran', contentReference: '0:1' });
      assert.strictEqual(res1.valid, false);

      const res2 = validateBookmarkInput({ contentType: 'quran', contentReference: '115:1' });
      assert.strictEqual(res2.valid, false);
      assert.ok(res2.errors[0].includes('114 Surahs'));
    });

    it('should REJECT out-of-bounds Ayah numbers for specific Surah', () => {
      // Al-Fatihah has 7 ayahs; 1:8 is invalid
      const res1 = validateBookmarkInput({ contentType: 'quran', contentReference: '1:8' });
      assert.strictEqual(res1.valid, false);
      assert.ok(res1.errors[0].includes('Invalid Ayah number 8 for Surah The Opening'));

      // Al-Baqarah has 286 ayahs; 2:287 is invalid
      const res2 = validateBookmarkInput({ contentType: 'quran', contentReference: '2:287' });
      assert.strictEqual(res2.valid, false);
      assert.ok(res2.errors[0].includes('Invalid Ayah number 287'));
    });
  });

  describe('Hadith Reference Validation', () => {
    it('should pass valid Kutub al-Sittah references', () => {
      const testCases = [
        { ref: 'bukhari:1', col: 'bukhari', num: 1 },
        { ref: 'bukhari 1', col: 'bukhari', num: 1 },
        { ref: 'muslim:93', col: 'muslim', num: 93 },
        { ref: 'abudawud:1500', col: 'abudawud', num: 1500 },
        { ref: 'tirmidhi:2400', col: 'tirmidhi', num: 2400 },
        { ref: 'nasai:1200', col: 'nasai', num: 1200 },
        { ref: 'ibnmajah:400', col: 'ibnmajah', num: 400 }
      ];

      for (const tc of testCases) {
        const res = validateBookmarkInput({
          contentType: 'hadith',
          contentReference: tc.ref
        });
        assert.strictEqual(res.valid, true, `Expected ${tc.ref} to be valid`);
        assert.strictEqual(res.normalizedReference, `${tc.col}:${tc.num}`);
        assert.strictEqual(res.parsedMetadata?.hadithCollection, tc.col);
        assert.strictEqual(res.parsedMetadata?.hadithNumber, tc.num);
      }
    });

    it('should REJECT invalid or unrecognized Hadith collection', () => {
      const res = validateBookmarkInput({
        contentType: 'hadith',
        contentReference: 'fake_collection:1'
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors[0].includes('unsupported Hadith collection'));
    });

    it('should REJECT Hadith number < 1', () => {
      const res = validateBookmarkInput({
        contentType: 'hadith',
        contentReference: 'bukhari:0'
      });
      assert.strictEqual(res.valid, false);
    });
  });

  describe('Dua Reference Validation', () => {
    it('should pass valid Dua references', () => {
      const res = validateBookmarkInput({
        contentType: 'dua',
        contentReference: 'when-waking-up:1'
      });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.normalizedReference, 'when-waking-up:1');
      assert.strictEqual(res.parsedMetadata?.duaCategory, 'when-waking-up');
    });
  });

  describe('Article Reference Validation', () => {
    it('should pass valid Article slug or UUID reference', () => {
      const res = validateBookmarkInput({
        contentType: 'article',
        contentReference: 'foundations-of-sunni-creed'
      });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.normalizedReference, 'foundations-of-sunni-creed');
    });
  });
});
