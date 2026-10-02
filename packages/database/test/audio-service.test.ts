/**
 * @file audio-service.test.ts
 * @description Comprehensive unit & integration tests for AudioService:
 * Reciter Catalog, Surah Track Retrieval, Ayah Timestamp Sync, Legal Provenance, and Takedown Quarantine.
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AudioService, CANONICAL_VERIFIED_RECITERS } from '../src/audio/audio-service.js';
import type { ActorContext } from '../src/articles/article-service.js';

describe('AudioService: Reciter Catalog & Streaming Track Engine', () => {
  let audioService: AudioService;

  const adminActor: ActorContext = {
    id: '00000000-0000-0000-0000-000000000000',
    roles: ['super_admin']
  };

  const userActor: ActorContext = {
    id: '11111111-1111-1111-1111-111111111111',
    roles: ['user']
  };

  beforeEach(() => {
    audioService = new AudioService();
  });

  describe('1. Reciter Catalog Query & Verification', () => {
    it('should list all canonical verified reciters', async () => {
      const reciters = await audioService.listReciters();
      assert.strictEqual(reciters.length >= 6, true);
      assert.ok(reciters.some((r) => r.id === 'alafasy'));
      assert.ok(reciters.some((r) => r.id === 'al-husary'));
      assert.ok(reciters.some((r) => r.id === 'abdul-basit'));
      assert.ok(reciters.some((r) => r.id === 'al-minshawi'));
    });

    it('should get a single reciter by ID with all multilingual metadata', async () => {
      const reciter = await audioService.getReciterById('alafasy');
      assert.ok(reciter !== null);
      assert.strictEqual(reciter.nameEnglish, 'Mishary Rashid Alafasy');
      assert.strictEqual(reciter.nameArabic, 'مشاري بن راشد العفاسي');
      assert.strictEqual(reciter.style, 'murattal');
      assert.strictEqual(reciter.isActive, true);
    });

    it('should return null for non-existent reciter ID', async () => {
      const reciter = await audioService.getReciterById('non-existent-reciter');
      assert.strictEqual(reciter, null);
    });
  });

  describe('2. Surah Track Retrieval & Ayah Timing Segments', () => {
    it('should retrieve a valid track for Surah Al-Fatihah (1)', async () => {
      const track = await audioService.getSurahTrack('alafasy', 1);
      assert.ok(track !== null);
      assert.strictEqual(track.reciterId, 'alafasy');
      assert.strictEqual(track.surahId, 1);
      assert.strictEqual(track.redistributionStatus, 'verified_permissible');
      assert.ok(track.audioUrl.startsWith('https://'));
      assert.strictEqual(track.timingSegments.length, 7);
      assert.strictEqual(track.timingSegments[0].ayahNumber, 1);
      assert.strictEqual(track.timingSegments[6].ayahNumber, 7);
    });

    it('should retrieve a valid track for Surah Al-Baqarah (2) with 286 timing segments', async () => {
      const track = await audioService.getSurahTrack('al-husary', 2);
      assert.ok(track !== null);
      assert.strictEqual(track.surahId, 2);
      assert.strictEqual(track.timingSegments.length, 286);
      assert.strictEqual(track.timingSegments[0].ayahNumber, 1);
      assert.strictEqual(track.timingSegments[285].ayahNumber, 286);
    });

    it('should list all 114 Surah tracks for a verified reciter', async () => {
      const tracks = await audioService.listSurahTracksForReciter('alafasy');
      assert.strictEqual(tracks.length, 114);
      assert.strictEqual(tracks[0].surahId, 1);
      assert.strictEqual(tracks[113].surahId, 114);
    });

    it('should return null for out-of-range Surah numbers (< 1 or > 114)', async () => {
      const track0 = await audioService.getSurahTrack('alafasy', 0);
      const track115 = await audioService.getSurahTrack('alafasy', 115);
      assert.strictEqual(track0, null);
      assert.strictEqual(track115, null);
    });
  });

  describe('3. Legal Provenance & Attribution Integrity', () => {
    it('should verify audio provenance for a permissible track', async () => {
      const verification = await audioService.verifyAudioProvenance('alafasy', 1);
      assert.ok(verification !== null);
      assert.strictEqual(verification.verified, true);
      assert.strictEqual(verification.legalStatus, 'verified_permissible');
      assert.ok(verification.attributionText.includes('Mishary Rashid Alafasy'));
      assert.strictEqual(verification.takedownContact, 'legal@islamicplatform.org');
    });

    it('should return null provenance for non-existent track', async () => {
      const verification = await audioService.verifyAudioProvenance('unknown', 999);
      assert.strictEqual(verification, null);
    });
  });

  describe('4. Administrative Operations & Takedown Protocol', () => {
    it('should allow admin to register a new reciter', async () => {
      const newReciter = await audioService.registerReciter(
        {
          id: 'al-ajmy',
          nameArabic: 'أحمد بن علي العجمي',
          nameEnglish: 'Ahmed Al-Ajmy',
          nameUrdu: 'احمد بن علی العجمی',
          style: 'murattal',
          bioEnglish: 'Saudi Quran reciter known for smooth Murattal recitation.'
        },
        adminActor
      );

      assert.strictEqual(newReciter.id, 'al-ajmy');
      const retrieved = await audioService.getReciterById('al-ajmy');
      assert.ok(retrieved !== null);
      assert.strictEqual(retrieved.nameEnglish, 'Ahmed Al-Ajmy');
    });

    it('should REJECT reciter registration by non-admin actor', async () => {
      await assert.rejects(
        async () => {
          await audioService.registerReciter(
            {
              id: 'unauthorized',
              nameArabic: 'اسم',
              nameEnglish: 'Name',
              nameUrdu: 'نام'
            },
            userActor
          );
        },
        (err: Error) => {
          assert.ok(err.message.includes('Authorization Violation'));
          return true;
        }
      );
    });

    it('should support immediate takedown quarantine of a compromised track', async () => {
      // 1. Surah 114 track is initially available
      const beforeTrack = await audioService.getSurahTrack('alafasy', 114);
      assert.ok(beforeTrack !== null);

      // 2. Legal notice causes quarantine
      const quarantined = await audioService.quarantineTrack(
        'alafasy',
        114,
        'Copyright claim received pending review',
        adminActor
      );
      assert.strictEqual(quarantined.redistributionStatus, 'restricted_takedown');

      // 3. getSurahTrack now refuses to serve the quarantined track to users
      const afterTrack = await audioService.getSurahTrack('alafasy', 114);
      assert.strictEqual(afterTrack, null);
    });

    it('should REJECT takedown quarantine invocation by regular users', async () => {
      await assert.rejects(
        async () => {
          await audioService.quarantineTrack('alafasy', 1, 'fake takedown', userActor);
        },
        (err: Error) => {
          assert.ok(err.message.includes('Authorization Violation'));
          return true;
        }
      );
    });
  });
});
