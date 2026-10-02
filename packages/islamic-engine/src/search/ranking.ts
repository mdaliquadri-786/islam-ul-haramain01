/**
 * @file ranking.ts
 * @package @islamic/islamic-engine
 * @description Deterministic search scoring, ranking, and snippet generation.
 * Milestone: Phase 2 -> Milestone 2.5
 */

import { SearchResult, SearchResultType } from './types';
import {
  normalizeArabicForSearch,
  normalizeEnglishForSearch,
  normalizeUrduForSearch
} from './normalizer';

export interface ScoreDetails {
  score: number;
  matchField?: 'citation' | 'arabic' | 'english' | 'urdu' | 'mixed';
  snippet?: string;
}

export interface PreparedSearchQuery {
  raw: string;
  normQueryAr: string;
  normQueryEn: string;
  normQueryUr: string;
  tokensAr: string[];
  tokensEn: string[];
  tokensUr: string[];
}

/**
 * Pre-computes normalized representations of a search query across all target scripts once.
 * Eliminates repeated string transformations in tight search loops across large corpora.
 */
export function prepareSearchQuery(query: string): PreparedSearchQuery {
  const normAr = normalizeArabicForSearch(query);
  const normEn = normalizeEnglishForSearch(query);
  const normUr = normalizeUrduForSearch(query);

  return {
    raw: query,
    normQueryAr: normAr,
    normQueryEn: normEn,
    normQueryUr: normUr,
    tokensAr: normAr.split(/\s+/).filter(Boolean),
    tokensEn: normEn.split(/\s+/).filter(Boolean),
    tokensUr: normUr.split(/\s+/).filter(Boolean)
  };
}

/**
 * Generates an excerpt snippet with `<mark>` tags around matches.
 */
export function generateSnippet(
  originalText: string,
  matchedTerm: string,
  maxLength: number = 140
): string {
  if (!originalText || !matchedTerm) return originalText ? originalText.slice(0, maxLength) : '';

  const lowerText = originalText.toLowerCase();
  const lowerTerm = matchedTerm.toLowerCase();
  const idx = lowerText.indexOf(lowerTerm);

  if (idx === -1) {
    return originalText.length > maxLength
      ? originalText.slice(0, maxLength) + '...'
      : originalText;
  }

  const start = Math.max(0, idx - 40);
  const end = Math.min(originalText.length, idx + matchedTerm.length + 80);

  const prefix = start > 0 ? '...' : '';
  const suffix = end < originalText.length ? '...' : '';

  const matchedPart = originalText.substring(idx, idx + matchedTerm.length);
  const snippet =
    prefix +
    originalText.substring(start, idx) +
    `<mark>${matchedPart}</mark>` +
    originalText.substring(idx + matchedTerm.length, end) +
    suffix;

  return snippet;
}

/**
 * Calculates a deterministic relevance score between a search query and target document fields.
 */
export function calculateRelevanceScore(
  queryInput: string | PreparedSearchQuery,
  doc: {
    reference: string;
    refClean?: string;
    arabicClean?: string;
    arabicOriginal?: string;
    englishText?: string;
    englishClean?: string;
    urduText?: string;
    urduClean?: string;
  }
): ScoreDetails {
  const prep: PreparedSearchQuery = typeof queryInput === 'string'
    ? prepareSearchQuery(queryInput)
    : queryInput;

  if (!prep.raw || (prep.tokensAr.length === 0 && prep.tokensEn.length === 0 && prep.tokensUr.length === 0)) {
    return { score: 0 };
  }

  // 1. Direct Reference / Citation match (e.g. "2:255" in "2:255" or "Bukhari 1" in "Sahih al-Bukhari 1")
  const cleanRef = doc.refClean || doc.reference.toLowerCase().replace(/[:\s\-#]/g, '');
  const cleanQuery = prep.raw.toLowerCase().replace(/[:\s\-#]/g, '');
  if (cleanRef === cleanQuery || cleanRef.includes(cleanQuery) || cleanQuery.includes(cleanRef)) {
    return {
      score: 1000,
      matchField: 'citation',
      snippet: doc.englishText || doc.arabicOriginal || doc.reference
    };
  }

  let highestScore = 0;
  let bestField: 'arabic' | 'english' | 'urdu' | undefined;
  let bestSnippet = '';

  // 2. Check Arabic Clean text
  if (doc.arabicClean && prep.normQueryAr) {
    if (doc.arabicClean.includes(prep.normQueryAr)) {
      const score = 150 + (doc.arabicClean === prep.normQueryAr ? 50 : 0);
      if (score > highestScore) {
        highestScore = score;
        bestField = 'arabic';
        bestSnippet = generateSnippet(doc.arabicOriginal || doc.arabicClean, prep.raw);
      }
    } else if (prep.tokensAr.length > 0) {
      let matchedTokens = 0;
      for (const t of prep.tokensAr) {
        if (doc.arabicClean.includes(t)) matchedTokens++;
      }
      if (matchedTokens === prep.tokensAr.length) {
        const score = 80 + matchedTokens * 5;
        if (score > highestScore) {
          highestScore = score;
          bestField = 'arabic';
          bestSnippet = generateSnippet(doc.arabicOriginal || doc.arabicClean, prep.tokensAr[0]);
        }
      } else if (matchedTokens > 0) {
        const score = 20 + matchedTokens * 5;
        if (score > highestScore) {
          highestScore = score;
          bestField = 'arabic';
          bestSnippet = generateSnippet(doc.arabicOriginal || doc.arabicClean, prep.tokensAr[0]);
        }
      }
    }
  }

  // 3. Check English Text
  const enClean = doc.englishClean || (doc.englishText ? doc.englishText.toLowerCase() : undefined);
  if (enClean && prep.normQueryEn) {
    if (enClean.includes(prep.normQueryEn)) {
      const score = 120 + (enClean === prep.normQueryEn ? 30 : 0);
      if (score > highestScore) {
        highestScore = score;
        bestField = 'english';
        bestSnippet = generateSnippet(doc.englishText || enClean, prep.raw);
      }
    } else if (prep.tokensEn.length > 0) {
      let matchedTokens = 0;
      for (const t of prep.tokensEn) {
        if (enClean.includes(t)) matchedTokens++;
      }
      if (matchedTokens === prep.tokensEn.length) {
        const score = 70 + matchedTokens * 5;
        if (score > highestScore) {
          highestScore = score;
          bestField = 'english';
          bestSnippet = generateSnippet(doc.englishText || enClean, prep.tokensEn[0]);
        }
      } else if (matchedTokens > 0) {
        const score = 15 + matchedTokens * 5;
        if (score > highestScore) {
          highestScore = score;
          bestField = 'english';
          bestSnippet = generateSnippet(doc.englishText || enClean, prep.tokensEn[0]);
        }
      }
    }
  }

  // 4. Check Urdu Text
  const urClean = doc.urduClean || (doc.urduText ? normalizeUrduForSearch(doc.urduText) : undefined);
  if (urClean && prep.normQueryUr) {
    if (urClean.includes(prep.normQueryUr)) {
      const score = 120 + (urClean === prep.normQueryUr ? 30 : 0);
      if (score > highestScore) {
        highestScore = score;
        bestField = 'urdu';
        bestSnippet = generateSnippet(doc.urduText || urClean, prep.raw);
      }
    } else if (prep.tokensUr.length > 0) {
      let matchedTokens = 0;
      for (const t of prep.tokensUr) {
        if (urClean.includes(t)) matchedTokens++;
      }
      if (matchedTokens === prep.tokensUr.length) {
        const score = 70 + matchedTokens * 5;
        if (score > highestScore) {
          highestScore = score;
          bestField = 'urdu';
          bestSnippet = generateSnippet(doc.urduText || urClean, prep.tokensUr[0]);
        }
      } else if (matchedTokens > 0) {
        const score = 15 + matchedTokens * 5;
        if (score > highestScore) {
          highestScore = score;
          bestField = 'urdu';
          bestSnippet = generateSnippet(doc.urduText || urClean, prep.tokensUr[0]);
        }
      }
    }
  }

  return {
    score: highestScore,
    matchField: bestField,
    snippet: bestSnippet
  };
}

/**
 * Type precedence order for sorting when scores are equal:
 * Quran Ayah -> Hadith -> Dua -> Translation
 */
const TYPE_PRIORITY: Record<SearchResultType, number> = {
  quran_ayah: 4,
  hadith: 3,
  dua: 2,
  quran_translation: 1
};

/**
 * Deterministically sorts search results by score DESC, type priority DESC, and ID ASC.
 */
export function sortSearchResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    const typeDiff = TYPE_PRIORITY[b.type] - TYPE_PRIORITY[a.type];
    if (typeDiff !== 0) {
      return typeDiff;
    }
    return a.id.localeCompare(b.id);
  });
}
