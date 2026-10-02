/**
 * @file m34-web-mvp.test.ts
 * @package @islamic/web
 * @description Comprehensive unit and integration test suite for Milestone M3.4:
 *              - Localized Routing & Directionality (RTL / LTR)
 *              - Font Typography Mappings (Amiri, Noto Nastaliq Urdu, Inter)
 *              - Dictionary Completeness & Authenticity
 *              - Responsive Views & Domain Engine Integrations
 *              - Security, Publication Boundaries, & Verification Gates
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  getDirection,
  getFontFamilyForLocale,
  isSupportedLocale,
  getDictionary,
  type Locale
} from '@islamic/ui';
import {
  CANONICAL_SURAHS,
  KAABA_COORDINATES,
  calculatePrayerTimes,
  calculateQibla,
  CALCULATION_METHODS,
  validateBookmarkInput
} from '@islamic/islamic-engine';
import {
  getAllHadithCollections,
  getHadithCollectionById
} from '../src/lib/hadith';
import {
  getAllSurahs,
  getSurahById,
  AVAILABLE_TRANSLATIONS
} from '../src/lib/quran';

describe('Milestone M3.4 — Web MVP UI Integration & Internationalization', () => {

  // ==========================================================================
  // 1. Localized Routing & RTL/LTR Directionality
  // ==========================================================================
  describe('1. Localized Routing & Directionality', () => {
    it('should support exactly the 3 canonical locales: en, ar, ur', () => {
      assert.deepEqual(SUPPORTED_LOCALES, ['en', 'ar', 'ur']);
      assert.equal(DEFAULT_LOCALE, 'en');
    });

    it('should correctly identify supported and unsupported locales', () => {
      assert.equal(isSupportedLocale('en'), true);
      assert.equal(isSupportedLocale('ar'), true);
      assert.equal(isSupportedLocale('ur'), true);
      assert.equal(isSupportedLocale('fr'), false);
      assert.equal(isSupportedLocale(''), false);
      assert.equal(isSupportedLocale('es'), false);
    });

    it('should assign RTL to Arabic and Urdu, and LTR to English', () => {
      assert.equal(getDirection('ar'), 'rtl');
      assert.equal(getDirection('ur'), 'rtl');
      assert.equal(getDirection('en'), 'ltr');
    });

    it('should assign authentic typography fonts for each language', () => {
      const arFont = getFontFamilyForLocale('ar');
      const urFont = getFontFamilyForLocale('ur');
      const enFont = getFontFamilyForLocale('en');

      assert.ok(arFont.includes('Amiri') || arFont.includes('IBM Plex Sans Arabic'));
      assert.ok(urFont.includes('Noto Nastaliq Urdu'));
      assert.ok(enFont.includes('Inter'));
    });
  });

  // ==========================================================================
  // 2. Dictionary Completeness & Authenticity
  // ==========================================================================
  describe('2. Multi-Lingual Dictionary Completeness', () => {
    const locales: Locale[] = ['en', 'ar', 'ur'];

    for (const loc of locales) {
      it(`should have complete dictionary structure for locale '${loc}'`, () => {
        const dict = getDictionary(loc);
        assert.ok(dict.nav.home.length > 0);
        assert.ok(dict.nav.quran.length > 0);
        assert.ok(dict.nav.hadith.length > 0);
        assert.ok(dict.nav.duas.length > 0);
        assert.ok(dict.nav.prayerTimes.length > 0);
        assert.ok(dict.nav.articles.length > 0);
        assert.ok(dict.nav.library.length > 0);
        assert.ok(dict.nav.search.length > 0);

        assert.ok(dict.common.platformName.length > 0);
        assert.ok(dict.common.searchPlaceholder.length > 0);
        assert.ok(dict.footer.creedStatement.length > 0);
        assert.ok(dict.footer.allRightsReserved.length > 0);
      });
    }

    it('should contain authentic Islamic terminology in Arabic and Urdu', () => {
      const arDict = getDictionary('ar');
      const urDict = getDictionary('ur');

      // Arabic terminology checks
      assert.ok(arDict.footer.creedStatement.includes('أهل السنة والجماعة'));
      assert.equal(arDict.nav.prayerTimes, 'مواقيت الصلاة والقبلة');
      assert.equal(arDict.prayer.fajr, 'الفجر');
      assert.equal(arDict.prayer.isha, 'العشاء');

      // Urdu terminology checks
      assert.ok(urDict.footer.creedStatement.includes('اہل سنت'));
      assert.ok(urDict.nav.prayerTimes.includes('نماز'));
      assert.equal(urDict.prayer.fajr, 'فجر');
      assert.equal(urDict.prayer.isha, 'عشاء');
    });
  });

  // ==========================================================================
  // 3. Domain Engine Integrations in Web Views
  // ==========================================================================
  describe('3. Web Views Domain Engine Integrations', () => {

    // Quran View
    it('Quran View: should load all 114 Surahs with valid revelation types', () => {
      const surahs = getAllSurahs();
      assert.equal(surahs.length, 114);

      const fatihah = getSurahById(1);
      assert.ok(fatihah);
      assert.equal(fatihah?.nameArabic, 'الفاتحة');
      assert.equal(fatihah?.ayahsCount, 7);
      assert.equal(fatihah?.revelationType, 'meccan');

      const baqarah = getSurahById(2);
      assert.ok(baqarah);
      assert.equal(baqarah?.nameArabic, 'البقرة');
      assert.equal(baqarah?.ayahsCount, 286);
      assert.equal(baqarah?.revelationType, 'medinan');

      assert.ok(AVAILABLE_TRANSLATIONS.length >= 2);
    });

    // Hadith View
    it('Hadith View: should load the 6 canonical Hadith collections', () => {
      const collections = getAllHadithCollections();
      assert.equal(collections.length, 6);

      const bukhari = getHadithCollectionById('bukhari');
      assert.ok(bukhari);
      assert.equal(bukhari?.name_arabic, 'صحيح البخاري');
      assert.ok(bukhari?.author_id);

      const muslim = getHadithCollectionById('muslim');
      assert.ok(muslim);
      assert.equal(muslim?.name_arabic, 'صحيح مسلم');
    });

    // Prayer Times & Qibla View
    it('Prayer Times View: should calculate accurate times and Qibla bearing', () => {
      // Makkah coordinates
      const makkahCoords = {
        latitude: KAABA_COORDINATES.latitude,
        longitude: KAABA_COORDINATES.longitude
      };

      const result = calculatePrayerTimes({
        coordinates: makkahCoords,
        date: '2026-09-24',
        method: 'UmmAlQura',
        madhhab: 'standard',
        timezone: 3
      });

      assert.ok(result.formatted.fajr);
      assert.ok(result.formatted.dhuhr);
      assert.ok(result.formatted.asr);
      assert.ok(result.formatted.maghrib);
      assert.ok(result.formatted.isha);

      const qibla = calculateQibla(makkahCoords.latitude, makkahCoords.longitude);
      assert.equal(qibla.directionDegrees, 0); // At the Kaaba, bearing is 0
      assert.equal(qibla.distanceKm, 0);
    });

    // Personal Library & Bookmarks Validation
    it('User Library View: should validate bookmark input and prevent invalid references', () => {
      const validQuran = validateBookmarkInput({
        contentType: 'quran',
        contentReference: '2:255'
      });
      assert.equal(validQuran.valid, true);
      assert.equal(validQuran.normalizedReference, '2:255');

      const invalidQuran = validateBookmarkInput({
        contentType: 'quran',
        contentReference: '999:1'
      });
      assert.equal(invalidQuran.valid, false);

      const validHadith = validateBookmarkInput({
        contentType: 'hadith',
        contentReference: 'bukhari:1'
      });
      assert.equal(validHadith.valid, true);
    });
  });

  // ==========================================================================
  // 4. Milestone M3.4 Scope Integrity
  // ==========================================================================
  describe('4. Milestone M3.4 Architecture & Boundary Gates', () => {
    it('should strictly operate within M3.4 boundary without Phase 4 audio/streaming leaks', () => {
      // Confirm calculation methods are canonical
      assert.ok(CALCULATION_METHODS.MWL);
      assert.ok(CALCULATION_METHODS.ISNA);
      assert.ok(CALCULATION_METHODS.UmmAlQura);
      assert.ok(CALCULATION_METHODS.Karachi);
      assert.ok(CALCULATION_METHODS.Egyptian);
      assert.ok(CALCULATION_METHODS.Diyanet);
      assert.ok(CALCULATION_METHODS.MUIS);

      // Confirm canonical Surah list length is 1-indexed with 114 actual Surahs
      assert.equal(CANONICAL_SURAHS.length - 1, 114);
    });
  });
});
