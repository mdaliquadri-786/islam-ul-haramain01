/**
 * @file checksum.ts
 * @package @islamic/engine
 * @description Cryptographic checksum computation for canonical Quran scripture.
 * Enforces SHA-256 integrity verification over verbatim source text.
 */

import { createHash } from 'node:crypto';

/**
 * Computes the deterministic SHA-256 checksum for the source-verbatim representation.
 * Computed strictly on the verbatim UTF-8 bytes supplied by the verified source.
 *
 * @param textSourceVerbatim The exact source-verbatim Quran representation.
 * @returns 64-character lowercase hexadecimal SHA-256 digest.
 */
export function calculateSourceVerbatimChecksum(textSourceVerbatim: string): string {
  if (typeof textSourceVerbatim !== 'string' || textSourceVerbatim.length === 0) {
    throw new Error('Source-verbatim text cannot be null or empty for cryptographic checksum calculation.');
  }

  return createHash('sha256')
    .update(Buffer.from(textSourceVerbatim, 'utf8'))
    .digest('hex')
    .toLowerCase();
}

/**
 * Computes the deterministic SHA-256 checksum for the parsed structural Ayah text.
 * Computed strictly on the verbatim UTF-8 bytes of textUthmani.
 *
 * @param textUthmani The deterministically parsed structural Ayah text.
 * @returns 64-character lowercase hexadecimal SHA-256 digest.
 */
export function calculateStructuralAyahChecksum(textUthmani: string): string {
  if (typeof textUthmani !== 'string' || textUthmani.length === 0) {
    throw new Error('Structural Ayah text cannot be null or empty for cryptographic checksum calculation.');
  }

  return createHash('sha256')
    .update(Buffer.from(textUthmani, 'utf8'))
    .digest('hex')
    .toLowerCase();
}

/**
 * Computes the deterministic SHA-256 checksum for an Ayah text (legacy/compatibility alias for structural Ayah).
 *
 * @param textUthmani The canonical Uthmani Arabic text.
 * @returns 64-character lowercase hexadecimal SHA-256 digest.
 */
export function calculateAyahChecksum(textUthmani: string): string {
  return calculateStructuralAyahChecksum(textUthmani);
}

/**
 * Verifies that a given Ayah text matches an expected SHA-256 checksum.
 *
 * @param text The verbatim text.
 * @param expectedChecksum The claimed 64-character hex checksum.
 * @returns boolean true if identical, false otherwise.
 */
export function verifyAyahChecksum(text: string, expectedChecksum: string): boolean {
  if (!text || !expectedChecksum) return false;
  const computed = calculateAyahChecksum(text);
  return computed === expectedChecksum.toLowerCase().trim();
}

