/**
 * @file search-engine.test.ts
 * @package @islamic/islamic-engine
 * @description Unit tests for Multi-lingual search normalizer, language detection, snippet generation, and ranking.
 * Milestone: Phase 2 -> Milestone 2.5
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  detectSearchScript,
  normalizeEnglishForSearch,
  normalizeUrduForSearch,
  normalizeSearchQuery,
  tokenizeSearchQuery
} from '../src/search/normalizer';
import {
  calculateRelevanceScore,
  generateSnippet,
  sortSearchResults
} from '../src/search/ranking';
import { SearchResult } from '../src/search/types';

describe('Search Normalizer & Script Detection', () => {
  it('should detect scripts accurately', () => {
    assert.strictEqual(detectSearchScript('الحمد لله'), 'arabic');
    assert.strictEqual(detectSearchScript('In the name of Allah'), 'english');
    assert.strictEqual(detectSearchScript('تمام تعریفیں اللہ کے لیے ہیں'), 'urdu');
    assert.strictEqual(detectSearchScript('Surah البقرة'), 'mixed');
  });

  it('should normalize English search queries', () => {
    assert.strictEqual(normalizeEnglishForSearch('  The Beneficent, The Merciful!  '), 'the beneficent the merciful');
    assert.strictEqual(normalizeEnglishForSearch("Qur'an & Sunnah"), 'quran sunnah');
  });

  it('should normalize Urdu search queries', () => {
    const raw = 'شروع اَللّٰہ کے نام سے جو بڑا مہر بان نہایت رحم والا ہے';
    const norm = normalizeUrduForSearch(raw);
    assert.ok(!norm.includes('\u064E')); // No fatha/zabar
    assert.ok(!norm.includes('\u0650')); // No kasra/zer
    assert.ok(!norm.includes('\u0651')); // No shadda
  });

  it('should tokenize query into distinct terms', () => {
    const tokens = tokenizeSearchQuery('Day of Judgment');
    assert.deepStrictEqual(tokens, ['day', 'of', 'judgment']);

    const arTokens = tokenizeSearchQuery('مالك يوم الدين');
    assert.strictEqual(arTokens.length, 3);
  });
});

describe('Search Ranking & Snippet Generation', () => {
  it('should generate highlight snippets with <mark> tags', () => {
    const text = 'Praise be to Allah, the Lord of all creation, the Entirely Merciful, the Especially Merciful.';
    const snippet = generateSnippet(text, 'Entirely Merciful');
    assert.ok(snippet.includes('<mark>Entirely Merciful</mark>'));
  });

  it('should prioritize direct citation matches with top score (1000)', () => {
    const score = calculateRelevanceScore('2:255', {
      reference: '2:255',
      englishText: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence.'
    });
    assert.strictEqual(score.score, 1000);
    assert.strictEqual(score.matchField, 'citation');
  });

  it('should score exact phrase matches higher than partial token matches', () => {
    const exactMatch = calculateRelevanceScore('Especially Merciful', {
      reference: '1:1',
      englishText: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
    });

    const partialMatch = calculateRelevanceScore('Merciful Day', {
      reference: '1:1',
      englishText: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
    });

    assert.ok(exactMatch.score > partialMatch.score);
  });

  it('should sort results deterministically by score, type priority, and id', () => {
    const results: SearchResult[] = [
      {
        id: 'res-trans',
        type: 'quran_translation',
        title: 'Translation',
        reference: '2:255',
        canonicalUrl: '/quran/2#ayah-255',
        score: 100
      },
      {
        id: 'res-ayah',
        type: 'quran_ayah',
        title: 'Ayah',
        reference: '2:255',
        canonicalUrl: '/quran/2#ayah-255',
        score: 100
      },
      {
        id: 'res-hadith',
        type: 'hadith',
        title: 'Hadith',
        reference: 'Bukhari 1',
        canonicalUrl: '/hadith/bukhari#hadith-1',
        score: 1000
      }
    ];

    const sorted = sortSearchResults(results);
    // Bukhari 1 has score 1000 -> 1st
    assert.strictEqual(sorted[0].id, 'res-hadith');
    // Quran ayah has score 100, but type priority 4 > translation priority 1 -> 2nd
    assert.strictEqual(sorted[1].id, 'res-ayah');
    // Quran translation -> 3rd
    assert.strictEqual(sorted[2].id, 'res-trans');
  });
});
