/**
 * @file books-ereader.test.ts
 * @package @islamic/web
 * @description Comprehensive test suite for Milestone M4.3 — Digital Islamic Books e-Reader (Web Layer):
 *              - Books catalog output validation
 *              - Content safety enforcement (no fabricated text, metadata-only default)
 *              - Provenance completeness for all canonical books
 *              - i18n locale parity across EN, AR, UR
 *              - Citation parser & formatter verification
 *              - Reading progress tracking
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BooksService, CANONICAL_BOOKS } from '@islamic/database';
import {
  parseBookCitation,
  formatBookCitation
} from '@islamic/islamic-engine';
import { getDictionary, type Locale } from '@islamic/ui';

describe('Milestone M4.3 — Digital Islamic Books e-Reader (Web Layer)', () => {
  const booksService = new BooksService();

  // ==========================================================================
  // 1. Books Catalog
  // ==========================================================================
  describe('1. Books Catalog', () => {
    it('should list all 4 canonical classical books', async () => {
      const books = await booksService.listBooks();
      assert.ok(books.length >= 4, 'Should list at least 4 classical works');
      const ids = books.map((b) => b.id);
      assert.ok(ids.includes('riyad-al-salihin'), 'Riyad al-Salihin must be present');
      assert.ok(ids.includes('al-arba-in-al-nawawiyyah'), 'Al-Arbain must be present');
      assert.ok(ids.includes('al-aqeedah-al-wasitiyyah'), 'Al-Wasitiyyah must be present');
      assert.ok(ids.includes('bidayat-al-mujtahid'), 'Bidayat al-Mujtahid must be present');
    });

    it('should never expose restricted or draft books in public listing', async () => {
      const books = await booksService.listBooks();
      for (const b of books) {
        assert.notEqual(b.licenseStatus, 'restricted_takedown');
        assert.notEqual(b.publicationStatus, 'draft');
        assert.notEqual(b.publicationStatus, 'takedown');
        assert.equal(b.isActive, true);
      }
    });
  });

  // ==========================================================================
  // 2. Content Safety — No Fabricated Text
  // ==========================================================================
  describe('2. Content Safety — No Fabricated Text', () => {
    it('canonical books should default to metadata_only content availability', async () => {
      for (const b of CANONICAL_BOOKS) {
        const avail = await booksService.verifyBookAvailability(b.id);
        assert.strictEqual(avail.available, true);
        assert.strictEqual(avail.contentAvailability, 'metadata_only');
        assert.ok(avail.message.includes('pending verified digital edition ingestion'));
      }
    });

    it('content entries in catalog should not contain fabricated text', async () => {
      const sec = await booksService.getSections('riyad-al-salihin', 1);
      assert.ok(sec.length > 0);
      const contents = await booksService.getContentForSection(sec[0].id);
      for (const c of contents) {
        assert.strictEqual(c.contentAvailability, 'metadata_only');
        assert.strictEqual(c.textAr, null);
        assert.strictEqual(c.textEn, null);
      }
    });
  });

  // ==========================================================================
  // 3. Provenance Completeness
  // ==========================================================================
  describe('3. Provenance Completeness', () => {
    it('each canonical book must have mandatory attribution requirements', () => {
      for (const b of CANONICAL_BOOKS) {
        assert.ok(
          b.attributionRequirement && b.attributionRequirement.length > 10,
          `${b.id} missing attribution requirement`
        );
      }
    });

    it('each canonical book must have documented provenance notes', () => {
      for (const b of CANONICAL_BOOKS) {
        assert.ok(
          b.provenanceNotes && b.provenanceNotes.length > 15,
          `${b.id} missing provenance notes`
        );
      }
    });

    it('each canonical book must have a verified public domain license', () => {
      for (const b of CANONICAL_BOOKS) {
        assert.strictEqual(b.licenseStatus, 'verified_permissible');
        assert.ok(b.licenseType.toLowerCase().includes('public domain'));
      }
    });

    it('author death years must match historical Sunni biographical records', () => {
      const riyad = CANONICAL_BOOKS.find((b) => b.id === 'riyad-al-salihin')!;
      assert.strictEqual(riyad.authorDeathYearAh, 676);
      assert.strictEqual(riyad.authorDeathYearCe, 1277);

      const wasitiyyah = CANONICAL_BOOKS.find((b) => b.id === 'al-aqeedah-al-wasitiyyah')!;
      assert.strictEqual(wasitiyyah.authorDeathYearAh, 728);
      assert.strictEqual(wasitiyyah.authorDeathYearCe, 1328);

      const bidayat = CANONICAL_BOOKS.find((b) => b.id === 'bidayat-al-mujtahid')!;
      assert.strictEqual(bidayat.authorDeathYearAh, 595);
      assert.strictEqual(bidayat.authorDeathYearCe, 1198);
    });
  });

  // ==========================================================================
  // 4. i18n Locale Parity
  // ==========================================================================
  describe('4. i18n Locale Parity', () => {
    const requiredKeys = [
      'title',
      'subtitle',
      'catalogTitle',
      'catalogSubtitle',
      'author',
      'died',
      'volumes',
      'volume',
      'sections',
      'chapters',
      'readBook',
      'openReader',
      'tableOfContents',
      'readingProgress',
      'markCompleted',
      'resumeReading',
      'lastRead',
      'provenance',
      'licenseStatus',
      'publicDomain',
      'attribution',
      'source',
      'contentUnavailable',
      'contentUnavailableReason',
      'metadataOnlyNotice',
      'searchPlaceholder',
      'searchInBook',
      'searchResults',
      'noResults',
      'fontSize',
      'readingWidth',
      'readingTheme',
      'prevSection',
      'nextSection',
      'closeReader',
      'methodologyDisclaimer',
      'categoryHadithLiterature',
      'categoryAqeedah',
      'categoryFiqh',
      'categoryAdabZuhd',
      'categoryGeneral'
    ];

    for (const loc of ['en', 'ar', 'ur'] as Locale[]) {
      it(`should have all required books keys in '${loc}' dictionary`, () => {
        const dict = getDictionary(loc);
        assert.ok(dict.books, `dict.books missing in locale '${loc}'`);
        for (const k of requiredKeys) {
          const val = (dict.books as any)[k];
          assert.ok(
            val && typeof val === 'string' && val.trim().length > 0,
            `Key '${k}' missing or empty in locale '${loc}'`
          );
        }
      });
    }

    it('should have neutral methodology disclaimer in all 3 languages', () => {
      const enDict = getDictionary('en');
      const arDict = getDictionary('ar');
      const urDict = getDictionary('ur');

      assert.ok(enDict.books.methodologyDisclaimer.includes('neutral'));
      assert.ok(arDict.books.methodologyDisclaimer.includes('محايد'));
      assert.ok(urDict.books.methodologyDisclaimer.includes('غیر جانبدارانہ'));
    });
  });

  // ==========================================================================
  // 5. Citation Resolution
  // ==========================================================================
  describe('5. Citation Resolution', () => {
    it('should resolve standard book:volume:section citations', () => {
      const cit = parseBookCitation('riyad-al-salihin:1:1');
      assert.ok(cit);
      assert.strictEqual(cit.bookSlug, 'riyad-al-salihin');
      assert.strictEqual(cit.volumeNumber, 1);
      assert.strictEqual(cit.sectionNumber, 1);
      assert.strictEqual(cit.isPageReference, false);
    });

    it('should resolve page citations', () => {
      const cit = parseBookCitation('bidayat-al-mujtahid:2:p250');
      assert.ok(cit);
      assert.strictEqual(cit.bookSlug, 'bidayat-al-mujtahid');
      assert.strictEqual(cit.volumeNumber, 2);
      assert.strictEqual(cit.pageNumber, 250);
      assert.strictEqual(cit.isPageReference, true);
    });

    it('should format citation strings correctly', () => {
      const formatted = formatBookCitation('Riyad al-Salihin', 1, 1, false);
      assert.strictEqual(formatted, 'Riyad al-Salihin → Vol. 1 → Section 1');
    });

    it('should reject malformed citations', () => {
      assert.strictEqual(parseBookCitation('not-a-citation'), null);
      assert.strictEqual(parseBookCitation('book:0:1'), null);
      assert.strictEqual(parseBookCitation('book:1:0'), null);
    });
  });

  // ==========================================================================
  // 6. User Reading Progress
  // ==========================================================================
  describe('6. Reading Progress Tracking', () => {
    it('should record reading progress and return it', async () => {
      const progress = await booksService.saveReadingProgress('user-reader-1', {
        bookId: 'riyad-al-salihin',
        volumeNumber: 1,
        progressPercentage: 35.0
      });
      assert.strictEqual(progress.progressPercentage, 35.0);

      const fetched = await booksService.getReadingProgress('user-reader-1', 'riyad-al-salihin');
      assert.ok(fetched);
      assert.strictEqual(fetched.progressPercentage, 35.0);
    });
  });
});
