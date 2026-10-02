/**
 * @file i18n.test.ts
 * @package @islamic/ui
 * @description Automated unit tests for i18n dictionaries, directionality, and locale resolution.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isSupportedLocale,
  getDirection,
  getFontFamilyForLocale,
  getLocaleInfo,
  getDictionary,
  en,
  ar,
  ur
} from '../src/index';

describe('i18n: Locale Configuration & Validation', () => {
  it('should support exactly en, ar, and ur locales', () => {
    assert.deepEqual(SUPPORTED_LOCALES, ['en', 'ar', 'ur']);
    assert.equal(DEFAULT_LOCALE, 'en');
  });

  it('should validate supported and unsupported locales correctly', () => {
    assert.equal(isSupportedLocale('en'), true);
    assert.equal(isSupportedLocale('ar'), true);
    assert.equal(isSupportedLocale('ur'), true);
    assert.equal(isSupportedLocale('fr'), false);
    assert.equal(isSupportedLocale('id'), false);
    assert.equal(isSupportedLocale(''), false);
  });

  it('should assign correct text direction for each locale', () => {
    assert.equal(getDirection('en'), 'ltr');
    assert.equal(getDirection('ar'), 'rtl');
    assert.equal(getDirection('ur'), 'rtl');
  });

  it('should provide appropriate typography font families for each locale', () => {
    assert.match(getFontFamilyForLocale('en'), /Inter/i);
    assert.match(getFontFamilyForLocale('ar'), /IBM Plex Sans Arabic/i);
    assert.match(getFontFamilyForLocale('ur'), /Noto Nastaliq Urdu/i);
  });

  it('should return complete locale information with native names', () => {
    const enInfo = getLocaleInfo('en');
    assert.equal(enInfo.nativeName, 'English');
    assert.equal(enInfo.dir, 'ltr');

    const arInfo = getLocaleInfo('ar');
    assert.equal(arInfo.nativeName, 'العربية');
    assert.equal(arInfo.dir, 'rtl');

    const urInfo = getLocaleInfo('ur');
    assert.equal(urInfo.nativeName, 'اردو');
    assert.equal(urInfo.dir, 'rtl');
  });
});

describe('i18n: Dictionary Completeness & Key Parity', () => {
  function getNestedKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    let keys: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        keys = keys.concat(getNestedKeys(v as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys.sort();
  }

  const enKeys = getNestedKeys(en as unknown as Record<string, unknown>);
  const arKeys = getNestedKeys(ar as unknown as Record<string, unknown>);
  const urKeys = getNestedKeys(ur as unknown as Record<string, unknown>);

  it('should contain non-empty key set in English dictionary', () => {
    assert.ok(enKeys.length > 50, `Expected >50 keys, got ${enKeys.length}`);
  });

  it('should have 100% key parity between English and Arabic dictionaries', () => {
    assert.deepEqual(
      arKeys,
      enKeys,
      'Arabic dictionary keys must exactly match English dictionary keys'
    );
  });

  it('should have 100% key parity between English and Urdu dictionaries', () => {
    assert.deepEqual(
      urKeys,
      enKeys,
      'Urdu dictionary keys must exactly match English dictionary keys'
    );
  });

  it('should have zero undefined, null, or empty string values in any dictionary', () => {
    for (const [loc, dict] of [['en', en], ['ar', ar], ['ur', ur]] as const) {
      const keys = getNestedKeys(dict as unknown as Record<string, unknown>);
      for (const k of keys) {
        const parts = k.split('.');
        let val: unknown = dict;
        for (const p of parts) {
          val = (val as Record<string, unknown>)[p];
        }
        assert.equal(
          typeof val,
          'string',
          `Locale ${loc} key ${k} must be string`
        );
        assert.ok(
          (val as string).trim().length > 0,
          `Locale ${loc} key ${k} must not be empty`
        );
      }
    }
  });

  it('should fallback to English dictionary for invalid locale', () => {
    const fallback = getDictionary('es');
    assert.deepEqual(fallback, en);

    const validAr = getDictionary('ar');
    assert.deepEqual(validAr, ar);

    const validUr = getDictionary('ur');
    assert.deepEqual(validUr, ur);
  });
});
