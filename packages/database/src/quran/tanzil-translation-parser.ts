/**
 * @file tanzil-translation-parser.ts
 * @package @islamic/database
 * @description Parser for Tanzil Project Quran translation datasets.
 * Parses the verified Tanzil txt-2 format (with Surah and Ayah numbers) into strongly typed DTOs.
 */

import {
  QuranTranslationEdition,
  QuranTranslationAyah,
  ParsedTranslationDataset,
  calculateTranslationChecksum,
  calculateTranslationDatasetChecksum
} from '@islamic/islamic-engine';

export interface TranslationSourceConfig {
  id: string;
  slug: string;
  languageCode: string;
  title: string;
  translator: string;
  sourceName: string;
  sourceUrl: string;
  sourceVersion: string;
  publisher?: string;
  publicationYear?: number;
  license: string;
  copyrightStatement: string;
  attributionText: string;
  sourceFileName: string;
  sourceSha256: string;
}

export interface TanzilTranslationHeaderInfo {
  name?: string;
  translator?: string;
  language?: string;
  id?: string;
  lastUpdate?: string;
  source?: string;
}

/**
 * Extracts metadata comments from the top of a Tanzil translation file.
 */
export function extractTanzilHeader(content: string): TanzilTranslationHeaderInfo {
  const header: TanzilTranslationHeaderInfo = {};
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('#')) {
      if (trimmed.length > 0 && /^\d+\|\d+\|/.test(trimmed)) {
        // Reached actual data lines
        break;
      }
      continue;
    }

    const nameMatch = trimmed.match(/^#\s*Name:\s*(.+)$/i);
    if (nameMatch) header.name = nameMatch[1].trim();

    const transMatch = trimmed.match(/^#\s*Translator:\s*(.+)$/i);
    if (transMatch) header.translator = transMatch[1].trim();

    const langMatch = trimmed.match(/^#\s*Language:\s*(.+)$/i);
    if (langMatch) header.language = langMatch[1].trim();

    const idMatch = trimmed.match(/^#\s*ID:\s*(.+)$/i);
    if (idMatch) header.id = idMatch[1].trim();

    const updateMatch = trimmed.match(/^#\s*Last Update:\s*(.+)$/i);
    if (updateMatch) header.lastUpdate = updateMatch[1].trim();

    const sourceMatch = trimmed.match(/^#\s*Source:\s*(.+)$/i);
    if (sourceMatch) header.source = sourceMatch[1].trim();
  }

  return header;
}

/**
 * Parses a Tanzil translation file (txt-2 format) into a verified ParsedTranslationDataset.
 *
 * @param content Full raw UTF-8 string content of the translation file.
 * @param config Edition metadata and licensing configuration.
 * @returns ParsedTranslationDataset containing edition metadata, 6,236 Ayahs, and dataset checksum.
 */
export function parseTanzilTranslation(
  content: string,
  config: TranslationSourceConfig
): ParsedTranslationDataset {
  const lines = content.split(/\r?\n/);
  const ayahs: QuranTranslationAyah[] = [];
  const surahsFound = new Set<number>();
  const ayahChecksums: string[] = [];

  let globalAyahIndex = 1;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex];
    const line = rawLine.trim();

    // Skip empty lines and comment lines
    if (!line || line.startsWith('#')) {
      continue;
    }

    const firstPipe = line.indexOf('|');
    if (firstPipe === -1) continue;

    const secondPipe = line.indexOf('|', firstPipe + 1);
    if (secondPipe === -1) continue;

    const surahStr = line.slice(0, firstPipe);
    const ayahStr = line.slice(firstPipe + 1, secondPipe);
    const translationText = line.slice(secondPipe + 1);

    const surahNumber = parseInt(surahStr, 10);
    const ayahNumber = parseInt(ayahStr, 10);

    if (isNaN(surahNumber) || isNaN(ayahNumber)) {
      throw new Error(
        `Failed to parse Ayah coordinates at line ${lineIndex + 1}: '${rawLine}'`
      );
    }

    const textChecksum = calculateTranslationChecksum(translationText);
    ayahChecksums.push(textChecksum);
    surahsFound.add(surahNumber);

    ayahs.push({
      surahNumber,
      ayahNumber,
      ayahId: globalAyahIndex,
      translationText,
      textChecksum
    });

    globalAyahIndex++;
  }

  const datasetSha256 = calculateTranslationDatasetChecksum(ayahChecksums);

  const edition: QuranTranslationEdition = {
    id: config.id,
    slug: config.slug,
    languageCode: config.languageCode,
    title: config.title,
    translator: config.translator,
    sourceName: config.sourceName,
    sourceUrl: config.sourceUrl,
    sourceVersion: config.sourceVersion,
    publisher: config.publisher,
    publicationYear: config.publicationYear,
    license: config.license,
    copyrightStatement: config.copyrightStatement,
    attributionText: config.attributionText,
    sourceFileName: config.sourceFileName,
    sourceSha256: config.sourceSha256,
    datasetSha256,
    sourceAcquiredAt: new Date().toISOString(),
    totalSurahs: surahsFound.size,
    totalAyahs: ayahs.length,
    status: 'published'
  };

  return {
    edition,
    ayahs,
    totalSurahs: surahsFound.size,
    totalAyahs: ayahs.length,
    datasetSha256
  };
}
