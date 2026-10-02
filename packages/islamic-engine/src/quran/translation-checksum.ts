/**
 * @file translation-checksum.ts
 * @package @islamic/islamic-engine
 * @description Cryptographic checksum computation for Quran translations.
 * Enforces strict SHA-256 integrity verification over verbatim human-authored translations.
 */

import { createHash } from 'node:crypto';

/**
 * Computes the deterministic SHA-256 checksum for an individual translated Ayah text.
 * Computed strictly on the verbatim UTF-8 bytes of translationText without pre-normalization.
 *
 * @param translationText The exact translation text.
 * @returns 64-character lowercase hexadecimal SHA-256 digest.
 */
export function calculateTranslationChecksum(translationText: string): string {
  if (typeof translationText !== 'string' || translationText.length === 0) {
    throw new Error('Translation text cannot be null or empty for cryptographic checksum calculation.');
  }

  return createHash('sha256')
    .update(Buffer.from(translationText, 'utf8'))
    .digest('hex')
    .toLowerCase();
}

/**
 * Verifies that a given translated Ayah text matches an expected SHA-256 checksum.
 *
 * @param translationText The exact translation text.
 * @param expectedChecksum The claimed 64-character hex checksum.
 * @returns boolean true if identical, false otherwise.
 */
export function verifyTranslationChecksum(translationText: string, expectedChecksum: string): boolean {
  if (!translationText || !expectedChecksum) return false;
  const computed = calculateTranslationChecksum(translationText);
  return computed === expectedChecksum.toLowerCase().trim();
}

/**
 * Computes the canonical deterministic dataset-wide SHA-256 checksum for a translation edition.
 * The canonical ordering is:
 * 1. Sequential Ayahs ordered strictly by Surah (1..114) and Ayah (1..N).
 * 2. Newline-separated (`\n`) per-Ayah SHA-256 checksums.
 * 3. Hashed using SHA-256 over the resulting UTF-8 string.
 *
 * @param ayahChecksums Ordered list of exactly 6,236 per-Ayah SHA-256 checksums.
 * @returns 64-character lowercase hexadecimal SHA-256 digest.
 */
export function calculateTranslationDatasetChecksum(ayahChecksums: string[]): string {
  if (!Array.isArray(ayahChecksums) || ayahChecksums.length === 0) {
    throw new Error('Ayah checksums list cannot be empty for dataset checksum calculation.');
  }

  const payload = ayahChecksums.join('\n');
  return createHash('sha256')
    .update(Buffer.from(payload, 'utf8'))
    .digest('hex')
    .toLowerCase();
}
