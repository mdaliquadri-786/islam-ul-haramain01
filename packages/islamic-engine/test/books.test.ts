/**
 * @file books.test.ts
 * @package @islamic/islamic-engine
 * @description Unit tests for Milestone M4.3 — Digital Islamic Books domain engine.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateBookInput,
  validateBookEditionInput,
  validateBookSectionInput,
  validateBookContentInput,
  validateReadingProgressInput,
  parseBookCitation,
  formatBookCitation,
  isBookPublic,
  isEditionPublic,
  isContentPublic,
  isBookLicenseCleared,
  isBookContentRestricted,
  buildBookProvenanceResult,
  validateBookmarkInput,
  type Book,
  type BookEdition,
  type BookContent
} from '../src/index.js';

describe('Milestone M4.3 — Digital Islamic Books Domain Engine', () => {
  describe('1. Book Input Validation', () => {
    it('should pass validation for a valid classical book', () => {
      const res = validateBookInput({
        id: 'riyad-al-salihin',
        slug: 'riyad-al-salihin',
        titleArabic: 'رياض الصالحين',
        titleEnglish: 'Riyad al-Salihin',
        titleUrdu: 'ریاض الصالحین',
        authorNameArabic: 'يحيى بن شرف النووي',
        authorNameEnglish: 'Imam Yahya ibn Sharaf al-Nawawi',
        authorNameUrdu: 'امام یحییٰ بن شرف النووی',
        authorDeathYearAh: 676,
        category: 'adab_zuhd',
        volumeCount: 1,
        licenseType: 'Public Domain',
        licenseStatus: 'verified_permissible'
      });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.errors.length, 0);
    });

    it('should reject invalid or missing identifiers', () => {
      const res = validateBookInput({
        id: 'INVALID ID WITH SPACES',
        slug: 'slug with spaces',
        titleArabic: '',
        titleEnglish: '',
        titleUrdu: '',
        authorNameArabic: '',
        authorNameEnglish: '',
        authorNameUrdu: '',
        category: 'general'
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('Book id must be')));
      assert.ok(res.errors.some((e) => e.includes('titleArabic is required')));
    });

    it('should reject invalid categories', () => {
      const res = validateBookInput({
        id: 'test-book',
        slug: 'test-book',
        titleArabic: 'كتاب',
        titleEnglish: 'Book',
        titleUrdu: 'کتاب',
        authorNameArabic: 'مؤلف',
        authorNameEnglish: 'Author',
        authorNameUrdu: 'مصنف',
        category: 'invalid_category' as any
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('Invalid category')));
    });

    it('should reject impossible Hijri death years', () => {
      const res = validateBookInput({
        id: 'test-book',
        slug: 'test-book',
        titleArabic: 'كتاب',
        titleEnglish: 'Book',
        titleUrdu: 'کتاب',
        authorNameArabic: 'مؤلف',
        authorNameEnglish: 'Author',
        authorNameUrdu: 'مصنف',
        authorDeathYearAh: 9999,
        category: 'general'
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('between 1 and 1500 AH')));
    });
  });

  describe('2. Edition & Section Validation', () => {
    it('should validate a valid edition input', () => {
      const res = validateBookEditionInput({
        bookId: 'riyad-al-salihin',
        editionIdentifier: 'dar-al-fikr-1995',
        editionTitle: 'رياض الصالحين - دار الفكر',
        languageCode: 'ar',
        format: 'structured_text',
        attributionRequirement: 'Dar al-Fikr edition.'
      });
      assert.strictEqual(res.valid, true);
    });

    it('should reject edition with invalid language', () => {
      const res = validateBookEditionInput({
        bookId: 'riyad-al-salihin',
        editionIdentifier: 'test-ed',
        editionTitle: 'Test',
        languageCode: 'fr' as any,
        attributionRequirement: ''
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('languageCode')));
    });

    it('should validate a section input', () => {
      const res = validateBookSectionInput({
        bookId: 'riyad-al-salihin',
        sectionNumber: 1,
        titleArabic: 'باب الإخلاص وإحضار النية',
        startPage: 1,
        endPage: 15
      });
      assert.strictEqual(res.valid, true);
    });

    it('should reject section when endPage < startPage', () => {
      const res = validateBookSectionInput({
        bookId: 'riyad-al-salihin',
        sectionNumber: 1,
        titleArabic: 'باب',
        startPage: 20,
        endPage: 10
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('endPage cannot be less than startPage')));
    });
  });

  describe('3. Content & Reading Progress Validation', () => {
    it('should validate book content element', () => {
      const res = validateBookContentInput({
        bookId: 'riyad-al-salihin',
        sectionId: 'sec-1',
        paragraphIndex: 1,
        contentType: 'hadith_quote',
        contentAvailability: 'metadata_only',
        licenseStatus: 'verified_permissible'
      });
      assert.strictEqual(res.valid, true);
    });

    it('should reject content with invalid contentType', () => {
      const res = validateBookContentInput({
        bookId: 'riyad-al-salihin',
        sectionId: 'sec-1',
        contentType: 'executable_script' as any
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('Invalid contentType')));
    });

    it('should validate reading progress input', () => {
      const res = validateReadingProgressInput({
        bookId: 'riyad-al-salihin',
        progressPercentage: 45.5,
        volumeNumber: 1,
        pageNumber: 30
      });
      assert.strictEqual(res.valid, true);
    });

    it('should reject out-of-range progress percentages', () => {
      const res1 = validateReadingProgressInput({
        bookId: 'riyad-al-salihin',
        progressPercentage: -5
      });
      assert.strictEqual(res1.valid, false);

      const res2 = validateReadingProgressInput({
        bookId: 'riyad-al-salihin',
        progressPercentage: 105
      });
      assert.strictEqual(res2.valid, false);
    });
  });

  describe('4. Citation Parser & Formatter', () => {
    it('should parse book:volume:section citation', () => {
      const cit = parseBookCitation('riyad-al-salihin:1:45');
      assert.ok(cit);
      assert.strictEqual(cit.bookSlug, 'riyad-al-salihin');
      assert.strictEqual(cit.volumeNumber, 1);
      assert.strictEqual(cit.sectionNumber, 45);
      assert.strictEqual(cit.isPageReference, false);
    });

    it('should parse book:volume:page citation', () => {
      const cit = parseBookCitation('riyad-al-salihin:2:p150');
      assert.ok(cit);
      assert.strictEqual(cit.bookSlug, 'riyad-al-salihin');
      assert.strictEqual(cit.volumeNumber, 2);
      assert.strictEqual(cit.pageNumber, 150);
      assert.strictEqual(cit.isPageReference, true);
    });

    it('should parse 2-part citation defaulting volume to 1', () => {
      const cit = parseBookCitation('al-arba-in-al-nawawiyyah:42');
      assert.ok(cit);
      assert.strictEqual(cit.bookSlug, 'al-arba-in-al-nawawiyyah');
      assert.strictEqual(cit.volumeNumber, 1);
      assert.strictEqual(cit.sectionNumber, 42);
    });

    it('should reject malformed citations', () => {
      assert.strictEqual(parseBookCitation(''), null);
      assert.strictEqual(parseBookCitation('onlyslug'), null);
      assert.strictEqual(parseBookCitation('slug:vol:sec:extra:extra'), null);
      assert.strictEqual(parseBookCitation('slug:0:1'), null);
      assert.strictEqual(parseBookCitation('slug:1:0'), null);
      assert.strictEqual(parseBookCitation('INVALID SLUG:1:1'), null);
    });

    it('should format citation for display', () => {
      const formatted = formatBookCitation('Riyad al-Salihin', 1, 45, false);
      assert.strictEqual(formatted, 'Riyad al-Salihin → Vol. 1 → Section 45');

      const formattedPage = formatBookCitation('Bidayat al-Mujtahid', 2, 85, true);
      assert.strictEqual(formattedPage, 'Bidayat al-Mujtahid → Vol. 2 → p. 85');
    });
  });

  describe('5. Publication & Licensing Gates', () => {
    const mockBook: Book = {
      id: 'test',
      slug: 'test',
      titleArabic: 'ت',
      titleEnglish: 'T',
      titleUrdu: 'ٹ',
      authorNameArabic: 'م',
      authorNameEnglish: 'A',
      authorNameUrdu: 'م',
      category: 'general',
      originalLanguage: 'ar',
      volumeCount: 1,
      licenseType: 'Public Domain',
      licenseStatus: 'verified_permissible',
      isActive: true,
      reviewStatus: 'approved',
      publicationStatus: 'published',
      createdAt: '',
      updatedAt: ''
    };

    it('should identify public books correctly', () => {
      assert.strictEqual(isBookPublic(mockBook), true);

      assert.strictEqual(isBookPublic({ ...mockBook, isActive: false }), false);
      assert.strictEqual(isBookPublic({ ...mockBook, licenseStatus: 'unverified_pending' }), false);
      assert.strictEqual(isBookPublic({ ...mockBook, reviewStatus: 'under_review' }), false);
      assert.strictEqual(isBookPublic({ ...mockBook, publicationStatus: 'draft' }), false);
    });

    it('should identify public editions correctly', () => {
      const mockEdition: BookEdition = {
        id: 'ed-1',
        bookId: 'test',
        editionIdentifier: 'e1',
        editionTitle: 'E1',
        languageCode: 'ar',
        volumeCount: 1,
        format: 'structured_text',
        licenseType: 'Public Domain',
        licenseStatus: 'verified_permissible',
        attributionRequirement: 'Attribution',
        isActive: true,
        reviewStatus: 'approved',
        publicationStatus: 'published',
        createdAt: '',
        updatedAt: ''
      };

      assert.strictEqual(isEditionPublic(mockEdition), true);
      assert.strictEqual(isEditionPublic({ ...mockEdition, publicationStatus: 'draft' }), false);
      assert.strictEqual(isEditionPublic({ ...mockEdition, licenseStatus: 'restricted_takedown' }), false);
    });

    it('should identify public content correctly', () => {
      const mockContent: BookContent = {
        id: 'c-1',
        sectionId: 's-1',
        bookId: 'test',
        volumeNumber: 1,
        paragraphIndex: 1,
        contentType: 'paragraph',
        contentAvailability: 'metadata_only',
        licenseStatus: 'verified_permissible',
        publicationStatus: 'published',
        versionNumber: 1,
        isCurrent: true,
        createdAt: '',
        updatedAt: ''
      };

      assert.strictEqual(isContentPublic(mockContent), true);
      assert.strictEqual(isContentPublic({ ...mockContent, isCurrent: false }), false);
      assert.strictEqual(isContentPublic({ ...mockContent, publicationStatus: 'draft' }), false);
      assert.strictEqual(isContentPublic({ ...mockContent, licenseStatus: 'unverified_pending' }), false);
    });

    it('should check license clearance and restrictions', () => {
      assert.strictEqual(isBookLicenseCleared('verified_permissible'), true);
      assert.strictEqual(isBookLicenseCleared('unverified_pending'), false);

      assert.strictEqual(isBookContentRestricted('restricted', 'verified_permissible'), true);
      assert.strictEqual(isBookContentRestricted('published', 'restricted_takedown'), true);
      assert.strictEqual(isBookContentRestricted('published', 'verified_permissible'), false);
    });

    it('should build complete provenance result', () => {
      const prov = buildBookProvenanceResult(mockBook);
      assert.strictEqual(prov.bookId, 'test');
      assert.strictEqual(prov.licenseStatus, 'verified_permissible');
      assert.strictEqual(prov.verifiedPermissible, true);
    });
  });

  describe('6. Library Bookmarks Integration with Book Content Type', () => {
    it('should validate book bookmark reference format', () => {
      const res = validateBookmarkInput({
        contentType: 'book',
        contentReference: 'riyad-al-salihin:1:45'
      });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.parsedMetadata?.bookId, 'riyad-al-salihin');
      assert.strictEqual(res.normalizedReference, 'riyad-al-salihin:1:45');
    });

    it('should validate simple book slug bookmark', () => {
      const res = validateBookmarkInput({
        contentType: 'book',
        contentReference: 'al-arba-in-al-nawawiyyah'
      });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.parsedMetadata?.bookId, 'al-arba-in-al-nawawiyyah');
    });

    it('should reject invalid book reference', () => {
      const res = validateBookmarkInput({
        contentType: 'book',
        contentReference: 'a'
      });
      assert.strictEqual(res.valid, false);
      assert.ok(res.errors.some((e) => e.includes('Invalid Book reference')));
    });
  });
});
