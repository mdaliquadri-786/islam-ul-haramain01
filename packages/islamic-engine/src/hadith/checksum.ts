/**
 * @file checksum.ts
 * @package @islamic/islamic-engine
 * @description Deterministic cryptographic checksum utilities for Hadith narrations and collections.
 */

import { createHash } from 'node:crypto';
import type { HadithNarration } from './types.js';

/**
 * Calculates the SHA-256 cryptographic digest over the UTF-8 bytes of a Hadith Arabic text / matn.
 *
 * @param text The exact Arabic text string.
 * @returns 64-character lowercase hexadecimal SHA-256 digest.
 * @throws Error if text is empty or invalid.
 */
export function calculateHadithChecksum(text: string): string {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Hadith text cannot be empty or non-string');
  }

  return createHash('sha256').update(Buffer.from(text, 'utf8')).digest('hex');
}

/**
 * Verifies that a given Hadith checksum matches the recalculated SHA-256 hash.
 *
 * @param text The Arabic text to verify.
 * @param expectedChecksum The 64-character hexadecimal digest.
 * @returns True if checksum matches, false otherwise.
 */
export function verifyHadithChecksum(text: string, expectedChecksum: string): boolean {
  if (!expectedChecksum || typeof expectedChecksum !== 'string' || expectedChecksum.length !== 64) {
    return false;
  }

  try {
    const computed = calculateHadithChecksum(text);
    return computed === expectedChecksum.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Calculates a reproducible, deterministic whole-dataset checksum for a collection of Hadith narrations.
 *
 * Aggregates sorted rows formatted as:
 * `<collection_id>:<hadith_number>:<text_checksum>`
 *
 * @param narrations Array of Hadith narration records.
 * @returns 64-character lowercase hexadecimal SHA-256 digest of the entire dataset.
 */
export function calculateHadithDatasetChecksum(narrations: HadithNarration[]): string {
  const sorted = [...narrations].sort((a, b) => {
    if (a.collectionId !== b.collectionId) {
      return a.collectionId.localeCompare(b.collectionId);
    }
    return a.hadithNumber - b.hadithNumber;
  });

  const lines = sorted.map((h) => `${h.collectionId}:${h.hadithNumber}:${h.textChecksum}`);
  const payload = lines.join('\n');

  return createHash('sha256').update(Buffer.from(payload, 'utf8')).digest('hex');
}
