/**
 * @file search-service.test.ts
 * @package @islamic/database
 * @description Integration tests for SearchService across Quran, Translations, Hadith, and Duas.
 * Tests instant citation routing, multi-lingual matching, ranking, filters, and safety bounds.
 * Milestone: Phase 2 -> Milestone 2.5
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { SearchService } from '../src/search/search-service.js';

describe('SearchService: Integration Suite', () => {
  let searchService: SearchService;

  before(() => {
    searchService = new SearchService({ eagerLoad: true });
  });

  it('should load full corpus and report non-zero metrics', () => {
    const stats = searchService.getCorpusStats();
    assert.ok(stats.totalItems > 12000, `Expected total items > 12,000, got ${stats.totalItems}`);
    assert.strictEqual(stats.quranAyahs, 6236);
    assert.ok(stats.hadiths > 0);
    assert.ok(stats.duas > 0);
  });

  describe('Instant Citation Routing (< 10 ms)', () => {
    it('should instantly route Quran 2:255 (Ayat al-Kursi) with score 1000 and preview', async () => {
      const res = await searchService.search({ query: '2:255' });
      assert.ok(res.citation, 'Citation should be recognized');
      assert.strictEqual(res.citation.isDirectCitation, true);
      assert.strictEqual(res.citation.canonicalUrl, '/quran/2#ayah-255');
      assert.ok(res.citation.previewArabic?.includes('إِلَٰهَ إِلَّا هُوَ') && res.citation.previewArabic?.includes('ٱلْقَيُّومُ'));
      assert.ok(res.citation.previewTranslation?.includes('Ever-Living'));

      assert.ok(res.results.length > 0);
      assert.strictEqual(res.results[0].score, 1000);
      assert.strictEqual(res.results[0].reference, '2:255');
      assert.ok(res.executionTimeMs < 10, `Execution time was ${res.executionTimeMs} ms (expected < 10 ms)`);
    });

    it('should instantly route Bukhari 1 with score 1000 and Arabic/English preview', async () => {
      const res = await searchService.search({ query: 'Bukhari 1' });
      assert.ok(res.citation);
      assert.strictEqual(res.citation.isDirectCitation, true);
      assert.strictEqual(res.citation.canonicalUrl, '/hadith/bukhari#hadith-1');
      assert.ok(res.citation.previewArabic?.includes('إِنَّمَا') && res.citation.previewArabic?.includes('بِالنِّيَّاتِ'));
      assert.ok(res.citation.previewTranslation?.includes('intentions') || res.citation.previewTranslation?.includes('actions'));

      assert.ok(res.results.length > 0);
      assert.strictEqual(res.results[0].score, 1000);
      assert.ok(res.executionTimeMs < 10, `Execution time was ${res.executionTimeMs} ms (expected < 10 ms)`);
    });

    it('should route Muslim 93 (Hadith of Jibril)', async () => {
      const res = await searchService.search({ query: 'Muslim 93' });
      assert.ok(res.citation);
      assert.strictEqual(res.citation.canonicalUrl, '/hadith/muslim#hadith-93');
      assert.strictEqual(res.results[0].score, 1000);
    });
  });

  describe('Multi-Lingual Full-Text Search', () => {
    it('should search Arabic clean text across Quran and Hadith', async () => {
      const res = await searchService.search({ query: 'الحمد لله' });
      assert.ok(res.results.length > 0);
      assert.ok(res.results.some((r) => r.type === 'quran_ayah'));
    });

    it('should search English translations with highlighting', async () => {
      const res = await searchService.search({ query: 'Entirely Merciful' });
      assert.ok(res.results.length > 0);
      const first = res.results[0];
      assert.ok(first.highlightSnippet?.includes('<mark>Entirely Merciful</mark>'));
    });

    it('should search Urdu translations', async () => {
      const res = await searchService.search({ query: 'مہربان' });
      assert.ok(res.results.length > 0);
    });
  });

  describe('Filtering & Pagination', () => {
    it('should filter strictly by Dua type', async () => {
      const res = await searchService.search({
        query: 'protection',
        typeFilter: ['dua']
      });

      assert.ok(res.results.length > 0);
      for (const r of res.results) {
        assert.strictEqual(r.type, 'dua');
      }
    });

    it('should respect limit and offset correctly', async () => {
      const page1 = await searchService.search({ query: 'Lord', limit: 3, offset: 0 });
      const page2 = await searchService.search({ query: 'Lord', limit: 3, offset: 3 });

      assert.strictEqual(page1.results.length, 3);
      assert.strictEqual(page2.results.length, 3);
      assert.notStrictEqual(page1.results[0].id, page2.results[0].id);
      assert.strictEqual(page1.total, page2.total);
    });
  });

  describe('Safety Bounds & Boundary Defense', () => {
    it('should handle empty or whitespace query gracefully', async () => {
      const res = await searchService.search({ query: '   ' });
      assert.strictEqual(res.results.length, 0);
      assert.strictEqual(res.total, 0);
      assert.strictEqual(res.citation, null);
    });

    it('should safely truncate queries longer than 500 characters', async () => {
      const longQuery = 'Allah '.repeat(150); // ~900 chars
      const res = await searchService.search({ query: longQuery });
      assert.ok(res.query.length <= 500);
      assert.ok(res.executionTimeMs >= 0);
    });
  });
});
