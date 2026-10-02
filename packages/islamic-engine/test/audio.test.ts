/**
 * @file audio.test.ts
 * @description Unit tests for Audio Streaming & Verified Reciter Catalog domain engine.
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateAudioReciterInput,
  validateAudioTrackInput,
  findActiveAyahForTimestamp,
  calculateTrackProgress,
  formatPlaybackTime
} from '../src/audio/validator.js';
import type { AyahTimingSegment } from '../src/audio/types.js';

describe('Audio Streaming Engine: Reciter & Track Validation', () => {
  describe('Reciter Input Validation', () => {
    it('should PASS for valid reciter registration input', () => {
      const res = validateAudioReciterInput({
        id: 'alafasy',
        nameArabic: 'مشاري بن راشد العفاسي',
        nameEnglish: 'Mishary Rashid Alafasy',
        nameUrdu: 'مشاری راشد العفاسی',
        style: 'murattal',
        bioEnglish: 'Renowned Kuwaiti Qari and Imam.'
      });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.errors.length, 0);
    });

    it('should REJECT invalid or missing reciter ID', () => {
      const res1 = validateAudioReciterInput({
        id: 'Alafasy 123!',
        nameArabic: 'مشاري',
        nameEnglish: 'Mishary',
        nameUrdu: 'مشاری'
      });
      assert.strictEqual(res1.valid, false);
      assert.ok(res1.errors.some(e => e.includes('lowercase alphanumeric')));

      const res2 = validateAudioReciterInput({
        id: '',
        nameArabic: 'مشاري',
        nameEnglish: 'Mishary',
        nameUrdu: 'مشاری'
      });
      assert.strictEqual(res2.valid, false);
    });

    it('should REJECT missing localized names', () => {
      const res = validateAudioReciterInput({
        id: 'al-husary',
        nameArabic: '',
        nameEnglish: '',
        nameUrdu: ''
      });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.errors.length, 3);
    });

    it('should REJECT invalid recitation style', () => {
      const res = validateAudioReciterInput({
        id: 'test-qari',
        nameArabic: 'القارئ',
        nameEnglish: 'Test Qari',
        nameUrdu: 'ٹیسٹ قاری',
        style: 'pop_style' as any
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('Invalid recitation style')));
    });
  });

  describe('Audio Track Validation', () => {
    const validTrack = {
      reciterId: 'alafasy',
      surahId: 1,
      audioUrl: 'https://cdn.islamicplatform.org/audio/alafasy/001.mp3',
      durationSeconds: 42,
      fileSizeBytes: 672000,
      sourceArchive: 'EveryAyah / Archive.org verified open archive',
      attributionRequirement: 'Recitation by Sheikh Mishary Rashid Alafasy',
      redistributionStatus: 'verified_permissible' as const,
      timingSegments: [
        { ayahNumber: 1, startMs: 0, endMs: 6000 },
        { ayahNumber: 2, startMs: 6000, endMs: 12000 },
        { ayahNumber: 3, startMs: 12000, endMs: 18000 },
        { ayahNumber: 4, startMs: 18000, endMs: 24000 },
        { ayahNumber: 5, startMs: 24000, endMs: 30000 },
        { ayahNumber: 6, startMs: 30000, endMs: 36000 },
        { ayahNumber: 7, startMs: 36000, endMs: 42000 }
      ]
    };

    it('should PASS for valid Surah track descriptor', () => {
      const res = validateAudioTrackInput(validTrack);
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.errors.length, 0);
    });

    it('should REJECT invalid Surah ID bounds (< 1 or > 114)', () => {
      const res1 = validateAudioTrackInput({ ...validTrack, surahId: 0 });
      assert.strictEqual(res1.valid, false);

      const res2 = validateAudioTrackInput({ ...validTrack, surahId: 115 });
      assert.strictEqual(res2.valid, false);
    });

    it('should REJECT invalid audio URL', () => {
      const res = validateAudioTrackInput({ ...validTrack, audioUrl: 'not-a-valid-url' });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('valid URL')));
    });

    it('should REJECT non-positive duration or file size', () => {
      const res = validateAudioTrackInput({ ...validTrack, durationSeconds: -5, fileSizeBytes: 0 });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('Duration seconds')));
      assert.ok(res.errors.some(e => e.includes('File size')));
    });

    it('should REJECT overlapping or disordered timing segments', () => {
      const res = validateAudioTrackInput({
        ...validTrack,
        timingSegments: [
          { ayahNumber: 1, startMs: 0, endMs: 6000 },
          { ayahNumber: 2, startMs: 5000, endMs: 12000 } // Overlaps with segment 1
        ]
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some(e => e.includes('overlaps with preceding segment')));
    });
  });

  describe('Ayah Timestamp Synchronization & Playback Helpers', () => {
    const segments: AyahTimingSegment[] = [
      { ayahNumber: 1, startMs: 0, endMs: 5000 },
      { ayahNumber: 2, startMs: 5000, endMs: 11000 },
      { ayahNumber: 3, startMs: 11000, endMs: 17000 },
      { ayahNumber: 4, startMs: 17000, endMs: 23000 }
    ];

    it('should accurately identify active Ayah across timestamps', () => {
      assert.strictEqual(findActiveAyahForTimestamp(segments, 0), 1);
      assert.strictEqual(findActiveAyahForTimestamp(segments, 2500), 1);
      assert.strictEqual(findActiveAyahForTimestamp(segments, 5000), 2);
      assert.strictEqual(findActiveAyahForTimestamp(segments, 10999), 2);
      assert.strictEqual(findActiveAyahForTimestamp(segments, 11000), 3);
      assert.strictEqual(findActiveAyahForTimestamp(segments, 18500), 4);
      assert.strictEqual(findActiveAyahForTimestamp(segments, 30000), 4); // Past last segment
    });

    it('should return null for empty segments or negative timestamp', () => {
      assert.strictEqual(findActiveAyahForTimestamp([], 1000), null);
      assert.strictEqual(findActiveAyahForTimestamp(segments, -500), null);
    });

    it('should correctly calculate track progress percentage', () => {
      assert.strictEqual(calculateTrackProgress(0, 100000), 0);
      assert.strictEqual(calculateTrackProgress(50000, 100000), 50);
      assert.strictEqual(calculateTrackProgress(75000, 100000), 75);
      assert.strictEqual(calculateTrackProgress(100000, 100000), 100);
      assert.strictEqual(calculateTrackProgress(150000, 100000), 100);
      assert.strictEqual(calculateTrackProgress(0, 0), 0);
    });

    it('should format playback time into standard MM:SS or HH:MM:SS', () => {
      assert.strictEqual(formatPlaybackTime(0), '00:00');
      assert.strictEqual(formatPlaybackTime(5000), '00:05');
      assert.strictEqual(formatPlaybackTime(65000), '01:05');
      assert.strictEqual(formatPlaybackTime(3665000), '01:01:05');
      assert.strictEqual(formatPlaybackTime(-1000), '00:00');
      assert.strictEqual(formatPlaybackTime(NaN), '00:00');
    });
  });
});
