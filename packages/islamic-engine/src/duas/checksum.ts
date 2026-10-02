/**
 * @file checksum.ts
 * @package @islamic/islamic-engine
 * @description Cryptographic SHA-256 checksum calculation and verification for Duas & Adhkar.
 */

import { createHash } from 'node:crypto';
import type { DuaAdhkar } from './types.js';

/**
 * Calculates the SHA-256 cryptographic digest over the UTF-8 bytes of a Dua's canonical Arabic text.
 *
 * @param text The exact Arabic text string with tashkeel.
 * @returns 64-character lowercase hexadecimal SHA-256 digest.
 * @throws Error if text is empty or invalid.
 */
export function calculateDuaChecksum(text: string): string {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Dua Arabic text cannot be empty or non-string');
  }

  return createHash('sha256').update(Buffer.from(text.trim(), 'utf8')).digest('hex');
}

/**
 * Verifies that a given Dua checksum matches the calculated SHA-256 hash.
 *
 * @param text The Arabic text to verify.
 * @param expectedChecksum The 64-character hexadecimal digest.
 * @returns True if checksum matches, false otherwise.
 */
export function verifyDuaChecksum(text: string, expectedChecksum: string): boolean {
  if (!expectedChecksum || typeof expectedChecksum !== 'string' || expectedChecksum.length !== 64) {
    return false;
  }

  try {
    const computed = calculateDuaChecksum(text);
    return computed === expectedChecksum.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Calculates a reproducible, deterministic whole-dataset checksum for a collection of Duas.
 *
 * Aggregates sorted rows formatted as:
 * `<category_id>:<item_number>:<text_checksum>`
 *
 * @param duas Array of DuaAdhkar records.
 * @returns 64-character lowercase hexadecimal SHA-256 digest of the entire dataset.
 */
export function calculateDuaDatasetChecksum(duas: DuaAdhkar[]): string {
  const sorted = [...duas].sort((a, b) => {
    if (a.categoryId !== b.categoryId) {
      return a.categoryId - b.categoryId;
    }
    return a.itemNumber - b.itemNumber;
  });

  const lines = sorted.map((d) => `${d.categoryId}:${d.itemNumber}:${d.textChecksum}`);
  const payload = lines.join('\n');

  return createHash('sha256').update(Buffer.from(payload, 'utf8')).digest('hex');
}
