/**
 * @file checksum.ts
 * @package @islamic/islamic-engine
 * @description Cryptographic SHA-256 hash generator and validator for article revisions.
 *              Ensures immutable content snapshots and tampering detection.
 */

import { createHash } from 'node:crypto';
import type { ArticleSourceReference } from './types.js';

/**
 * Calculates a deterministic cryptographic SHA-256 hash of an article revision.
 * Canonicalizes title, subtitle, excerpt, body markdown, and source references.
 */
export function calculateArticleContentHash(
  title: string,
  bodyMarkdown: string,
  sourceReferences: ArticleSourceReference[] = [],
  subtitle?: string,
  excerpt?: string
): string {
  // Normalize source references deterministically
  const normalizedRefs = sourceReferences.map(ref => ({
    citationType: ref.citationType,
    reference: ref.reference.trim(),
    textExcerpt: ref.textExcerpt ? ref.textExcerpt.trim() : undefined,
    attribution: ref.attribution ? ref.attribution.trim() : undefined
  }));

  const payload = JSON.stringify({
    title: title.trim(),
    subtitle: subtitle ? subtitle.trim() : null,
    excerpt: excerpt ? excerpt.trim() : null,
    body: bodyMarkdown.replace(/\r\n/g, '\n').trim(),
    refs: normalizedRefs
  });

  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

/**
 * Verifies whether the provided article content matches an expected SHA-256 hash.
 */
export function verifyArticleContentHash(
  expectedHash: string,
  title: string,
  bodyMarkdown: string,
  sourceReferences: ArticleSourceReference[] = [],
  subtitle?: string,
  excerpt?: string
): boolean {
  const computed = calculateArticleContentHash(title, bodyMarkdown, sourceReferences, subtitle, excerpt);
  return computed.toLowerCase() === expectedHash.toLowerCase();
}
