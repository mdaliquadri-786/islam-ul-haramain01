/**
 * @file citation-validator.ts
 * @package @islamic/islamic-engine
 * @description Validates article religious source citations against the M2.5 Citation Router.
 *              Ensures scriptures cited in articles exist within canonical boundaries.
 */

import { resolveCitation } from '../search/citation-router.js';
import type { ArticleSourceReference } from './types.js';

export interface CitationValidationIssue {
  reference: string;
  citationType: string;
  issue: string;
}

export interface ArticleCitationsValidationResult {
  valid: boolean;
  issues: CitationValidationIssue[];
  resolvedCitations: Array<{
    original: ArticleSourceReference;
    canonicalRoute?: string;
  }>;
}

/**
 * Validates an array of article source citations against the canonical corpus.
 */
export function validateArticleCitations(
  references: ArticleSourceReference[]
): ArticleCitationsValidationResult {
  const issues: CitationValidationIssue[] = [];
  const resolvedCitations: ArticleCitationsValidationResult['resolvedCitations'] = [];

  for (const ref of references) {
    if (!ref.reference || ref.reference.trim().length === 0) {
      issues.push({
        reference: '',
        citationType: ref.citationType,
        issue: 'Empty citation reference.'
      });
      continue;
    }

    if (ref.citationType === 'external') {
      resolvedCitations.push({ original: ref });
      continue;
    }

    // Resolve against canonical citation router (Quran, Hadith)
    if (ref.citationType === 'quran' || ref.citationType === 'hadith') {
      const resolved = resolveCitation(ref.reference);

      if (!resolved || !resolved.isDirectCitation) {
        issues.push({
          reference: ref.reference,
          citationType: ref.citationType,
          issue: `Unverifiable scripture citation '${ref.reference}'. Does not match canonical boundaries.`
        });
        continue;
      }

      if (ref.citationType === 'quran' && resolved.citation.type !== 'quran') {
        issues.push({
          reference: ref.reference,
          citationType: ref.citationType,
          issue: `Citation type mismatch: '${ref.reference}' resolved to ${resolved.citation.type}, expected quran.`
        });
        continue;
      }

      if (ref.citationType === 'hadith' && resolved.citation.type !== 'hadith') {
        issues.push({
          reference: ref.reference,
          citationType: ref.citationType,
          issue: `Citation type mismatch: '${ref.reference}' resolved to ${resolved.citation.type}, expected hadith.`
        });
        continue;
      }

      resolvedCitations.push({
        original: ref,
        canonicalRoute: resolved.canonicalUrl
      });
      continue;
    }

    if (ref.citationType === 'dua') {
      // Validate dua reference e.g. "hisn 1" or "hisn-1"
      const match = ref.reference.match(/(?:hisn|dua)[-\s]*(\d+)/i);
      if (match) {
        const duaNum = parseInt(match[1], 10);
        if (duaNum >= 1 && duaNum <= 268) {
          resolvedCitations.push({
            original: ref,
            canonicalRoute: `/duas#dua-${duaNum}`
          });
          continue;
        }
      }
      issues.push({
        reference: ref.reference,
        citationType: ref.citationType,
        issue: `Unverifiable dua citation '${ref.reference}'. Valid Hisn al-Muslim index is 1..268.`
      });
      continue;
    }

    resolvedCitations.push({
      original: ref
    });
  }

  return {
    valid: issues.length === 0,
    issues,
    resolvedCitations
  };
}
