/**
 * @file audio-streaming.test.ts
 * @package @islamic/web
 * @description Comprehensive test suite for Milestone M4.1 Audio Streaming & Verified Reciters:
 *              - Reciters Catalog API & Localization
 *              - Surah Audio Track Descriptors & Timing Segments
 *              - Legal Provenance & Licensing Integrity
 *              - Quarantine & Takedown Protocol
 *              - Player Utilities & Ayah Synchronization
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  findActiveAyahForTimestamp,
  formatPlaybackTime,
  calculateTrackProgress
} from '@islamic/islamic-engine';
import { AudioService } from '@islamic/database';
import { getDictionary } from '@islamic/ui';

describe('Milestone M4.1 — Audio Streaming & Verified Reciter Catalog', () => {
  const audioService = new AudioService();

  // ==========================================================================
  // 1. Reciter Catalog & Verification
  // ==========================================================================
  describe('1. Verified Reciter Catalog', () => {
    it('should contain all 6 canonical verified reciters', async () => {
      const reciters = await audioService.listReciters();
      assert.equal(reciters.length >= 6, true);

      const expectedReciterIds = [
        'alafasy',
        'al-husary',
        'abdul-basit',
        'al-minshawi',
        'al-ghamdi',
        'ash-shuraim'
      ];

      for (const id of expectedReciterIds) {
        const found = reciters.find((r) => r.id === id);
        assert.ok(found, `Expected reciter ${id} to be present in catalog`);
        assert.ok(found.nameArabic.length > 0, `Reciter ${id} must have Arabic name`);
        assert.ok(found.nameEnglish.length > 0, `Reciter ${id} must have English name`);
        assert.ok(found.nameUrdu.length > 0, `Reciter ${id} must have Urdu name`);
        assert.equal(found.isActive, true, `Reciter ${id} must be active`);
      }
    });

    it('should have localized audio dictionary strings in all 3 supported languages', () => {
      const dictEn = getDictionary('en');
      const dictAr = getDictionary('ar');
      const dictUr = getDictionary('ur');

      assert.ok(dictEn.audio.title.length > 0);
      assert.ok(dictEn.audio.play.length > 0);
      assert.ok(dictEn.audio.verifiedLicensing.length > 0);
      assert.ok(dictEn.audio.attribution.length > 0);

      assert.ok(dictAr.audio.title.length > 0);
      assert.ok(dictAr.audio.play.length > 0);
      assert.ok(dictAr.audio.verifiedLicensing.length > 0);
      assert.ok(dictAr.audio.attribution.length > 0);

      assert.ok(dictUr.audio.title.length > 0);
      assert.ok(dictUr.audio.play.length > 0);
      assert.ok(dictUr.audio.verifiedLicensing.length > 0);
      assert.ok(dictUr.audio.attribution.length > 0);
    });
  });

  // ==========================================================================
  // 2. Surah Tracks & Ayah Timing Segments
  // ==========================================================================
  describe('2. Surah Audio Tracks & Ayah Timestamp Synchronization', () => {
    it('should provide verified streaming track for Al-Fatihah (1) with 7 Ayah segments', async () => {
      const track = await audioService.getSurahTrack('alafasy', 1);
      assert.ok(track !== null);
      assert.equal(track.reciterId, 'alafasy');
      assert.equal(track.surahId, 1);
      assert.equal(track.timingSegments.length, 7);
      assert.equal(track.redistributionStatus, 'verified_permissible');
      assert.ok(track.audioUrl.startsWith('https://'));
    });

    it('should provide verified streaming track for Al-Ikhlas (112) with 4 Ayah segments', async () => {
      const track = await audioService.getSurahTrack('al-husary', 112);
      assert.ok(track !== null);
      assert.equal(track.surahId, 112);
      assert.equal(track.timingSegments.length, 4);
    });

    it('should track active Ayah correctly across playback time', () => {
      const sampleSegments = [
        { ayahNumber: 1, startMs: 0, endMs: 4000 },
        { ayahNumber: 2, startMs: 4000, endMs: 9000 },
        { ayahNumber: 3, startMs: 9000, endMs: 14000 }
      ];

      assert.equal(findActiveAyahForTimestamp(sampleSegments, 0), 1);
      assert.equal(findActiveAyahForTimestamp(sampleSegments, 2000), 1);
      assert.equal(findActiveAyahForTimestamp(sampleSegments, 3999), 1);
      assert.equal(findActiveAyahForTimestamp(sampleSegments, 4000), 2);
      assert.equal(findActiveAyahForTimestamp(sampleSegments, 8999), 2);
      assert.equal(findActiveAyahForTimestamp(sampleSegments, 9000), 3);
      assert.equal(findActiveAyahForTimestamp(sampleSegments, 15000), 3);
    });

    it('should format playback times accurately', () => {
      assert.equal(formatPlaybackTime(0), '00:00');
      assert.equal(formatPlaybackTime(61000), '01:01');
      assert.equal(formatPlaybackTime(3600000), '01:00:00');
    });

    it('should calculate track progress percentage within bounds', () => {
      assert.equal(calculateTrackProgress(0, 60000), 0);
      assert.equal(calculateTrackProgress(30000, 60000), 50);
      assert.equal(calculateTrackProgress(60000, 60000), 100);
      assert.equal(calculateTrackProgress(90000, 60000), 100);
    });
  });

  // ==========================================================================
  // 3. Legal Provenance & Takedown Protocol
  // ==========================================================================
  describe('3. Legal Provenance & Takedown Enforcement', () => {
    it('should verify explicit provenance and attribution requirements', async () => {
      const verification = await audioService.verifyAudioProvenance('alafasy', 1);
      assert.ok(verification !== null);
      assert.equal(verification.verified, true);
      assert.equal(verification.legalStatus, 'verified_permissible');
      assert.equal(verification.takedownContact, 'legal@islamicplatform.org');
      assert.ok(verification.attributionText.includes('Mishary Rashid Alafasy'));
    });

    it('should quarantine and refuse streaming for takedown tracks', async () => {
      const adminActor = { id: 'admin-1', roles: ['super_admin' as const] };
      await audioService.quarantineTrack('al-ghamdi', 114, 'Copyright notice received', adminActor);

      const track = await audioService.getSurahTrack('al-ghamdi', 114);
      assert.equal(track, null);
    });
  });
});
