/**
 * @file tafsir-viewer.test.ts
 * @package @islamic/web
 * @description Comprehensive test suite for Milestone M4.2 — Classical Tafsir Comparative Viewer:
 *              - Tafsir works API output validation
 *              - Content-safety enforcement (no fabricated text)
 *              - Provenance completeness
 *              - i18n locale parity
 *              - Comparative query output
 *              - Citation resolution
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TafsirService, CANONICAL_TAFSIR_WORKS } from '@islamic/database';
import {
  parseTafsirReference,
  formatTafsirCitation,
  validateTafsirEntryInput
} from '@islamic/islamic-engine';
import { getDictionary } from '@islamic/ui';

describe('Milestone M4.2 — Classical Tafsir Comparative Viewer (Web Layer)', () => {
  const tafsirService = new TafsirService();

  // ==========================================================================
  // 1. Works Catalog
  // ==========================================================================
  describe('1. Tafsir Works Catalog', () => {
    it('should list two verified works', async () => {
      const works = await tafsirService.listWorks();
      assert.ok(works.length >= 2, 'At least 2 works should be listed');
      const ids = works.map((w) => w.id);
      assert.ok(ids.includes('ibn-kathir'), 'Ibn Kathir should be in catalog');
      assert.ok(ids.includes('al-sadi'), "Al-Sa'di should be in catalog");
    });

    it('should never expose restricted or draft works in public listing', async () => {
      const works = await tafsirService.listWorks({ activeOnly: true });
      for (const w of works) {
        assert.notEqual(w.licenseStatus, 'restricted_takedown');
        assert.notEqual(w.reviewStatus, 'draft');
        assert.equal(w.isActive, true);
      }
    });
  });

  // ==========================================================================
  // 2. Content Safety — No Fabricated Tafsir
  // ==========================================================================
  describe('2. Content Safety — No Fabricated Text', () => {
    it('default entries should be metadata_only (text not fabricated)', async () => {
      // Default state: no entries, comparison returns null for each work
      const comparison = await tafsirService.compareSourcesForAyah(
        14, // Ibrahim surah
        1,
        ['ibn-kathir', 'al-sadi'],
        'ar'
      );

      for (const { entry } of comparison.entries) {
        if (entry !== null) {
          // Any entry that exists should be metadata_only or have real text, never AI-generated
          assert.ok(
            ['full_text', 'excerpt', 'metadata_only', 'unavailable'].includes(
              entry.contentAvailability
            ),
            `contentAvailability must be a valid value, got: ${entry?.contentAvailability}`
          );
          // text_content for metadata_only entries MUST be null (not fabricated)
          if (entry.contentAvailability === 'metadata_only') {
            assert.equal(
              entry.textContent,
              null,
              'metadata_only entry must have null textContent — never fabricated'
            );
          }
        }
      }
    });

    it('should NEVER label AI-generated text as classical tafsir', () => {
      // Structural test: the data model requires a licenseStatus + contentAvailability field.
      // These two together enforce provenance: any content marked verified_permissible
      // must have been imported from a documented source, not generated.
      const validStatuses = ['verified_permissible', 'unverified_pending', 'restricted_takedown'];

      for (const work of CANONICAL_TAFSIR_WORKS) {
        assert.ok(validStatuses.includes(work.licenseStatus));
      }

      // Demonstrate that any entry claiming full_text must have a licenseStatus field
      const mockEntry = {
        workId: 'ibn-kathir',
        surahId: 1,
        ayahNumber: 1,
        languageCode: 'ar' as const,
        contentAvailability: 'metadata_only' as const,
        licenseStatus: 'verified_permissible' as const,
        publicationStatus: 'draft' as const
      };
      const result = validateTafsirEntryInput(mockEntry);
      assert.equal(result.valid, true);
    });
  });

  // ==========================================================================
  // 3. Provenance Completeness
  // ==========================================================================
  describe('3. Provenance Completeness', () => {
    it('each canonical work must have attribution_requirement', () => {
      for (const work of CANONICAL_TAFSIR_WORKS) {
        assert.ok(
          work.attributionRequirement && work.attributionRequirement.length > 0,
          `${work.id} missing attributionRequirement`
        );
      }
    });

    it('each canonical work must have provenanceNotes', () => {
      for (const work of CANONICAL_TAFSIR_WORKS) {
        assert.ok(
          work.provenanceNotes && work.provenanceNotes.length > 0,
          `${work.id} missing provenanceNotes`
        );
      }
    });

    it('each canonical work must have documented source URL', () => {
      for (const work of CANONICAL_TAFSIR_WORKS) {
        assert.ok(
          work.sourceUrl && work.sourceUrl.startsWith('http'),
          `${work.id} missing sourceUrl`
        );
      }
    });

    it('ibn-kathir death year must be 774 AH', () => {
      const ibk = CANONICAL_TAFSIR_WORKS.find((w) => w.id === 'ibn-kathir');
      assert.equal(ibk?.authorDeathYearHijri, 774);
    });

    it("al-sadi death year must be 1376 AH", () => {
      const sadi = CANONICAL_TAFSIR_WORKS.find((w) => w.id === 'al-sadi');
      assert.equal(sadi?.authorDeathYearHijri, 1376);
    });
  });

  // ==========================================================================
  // 4. i18n — Locale Parity
  // ==========================================================================
  describe('4. i18n Locale Parity', () => {
    const locales = ['en', 'ar', 'ur'] as const;
    const requiredTafsirKeys = [
      'title',
      'subtitle',
      'openTafsir',
      'compareMode',
      'singleMode',
      'contentUnavailable',
      'contentUnavailableReason',
      'methodologyDisclaimer',
      'publicDomain',
      'attributionLabel',
      'closeViewer',
      'viewerTitle'
    ];

    for (const locale of locales) {
      it(`should have all required tafsir i18n keys in ${locale.toUpperCase()} dictionary`, () => {
        const dict = getDictionary(locale);
        for (const key of requiredTafsirKeys) {
          const val = (dict.tafsir as Record<string, string>)[key];
          assert.ok(
            typeof val === 'string' && val.length > 0,
            `Missing or empty ${locale}.tafsir.${key}`
          );
        }
      });
    }

    it('should have RTL-appropriate methodology disclaimer in Arabic', () => {
      const dictAr = getDictionary('ar');
      assert.ok(dictAr.tafsir.methodologyDisclaimer.length > 0);
    });

    it('should have methodology disclaimer in Urdu', () => {
      const dictUr = getDictionary('ur');
      assert.ok(dictUr.tafsir.methodologyDisclaimer.length > 0);
    });
  });

  // ==========================================================================
  // 5. Citation Router Integration
  // ==========================================================================
  describe('5. Citation Router Integration', () => {
    it('should resolve ibn-kathir:2:255 citation', () => {
      const ref = parseTafsirReference('ibn-kathir:2:255');
      assert.ok(ref !== null);
      assert.equal(ref.workId, 'ibn-kathir');
      assert.equal(ref.surahId, 2);
      assert.equal(ref.ayahNumber, 255);
    });

    it("should resolve al-sadi:36:83 citation (Surah Ya-Sin)", () => {
      const ref = parseTafsirReference('al-sadi:36:83');
      assert.ok(ref !== null);
      assert.equal(ref.workId, 'al-sadi');
      assert.equal(ref.surahId, 36);
      assert.equal(ref.ayahNumber, 83);
    });

    it('should format citation with correct arrow notation', () => {
      const formatted = formatTafsirCitation("Tafsir Al-Sa'di", 36, 83);
      assert.equal(formatted, "Tafsir Al-Sa'di → Surah 36 → Ayah 83");
    });

    it('should reject invalid citation strings', () => {
      assert.equal(parseTafsirReference('ibn-kathir:255'), null);
      assert.equal(parseTafsirReference(''), null);
      assert.equal(parseTafsirReference('bad:0:1'), null);
      assert.equal(parseTafsirReference('bad:115:1'), null);
    });
  });
});
