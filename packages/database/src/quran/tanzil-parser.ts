/**
 * @file tanzil-parser.ts
 * @package @islamic/database
 * @description Robust, verified parser for Tanzil Project Quran XML datasets.
 * Parses structural metadata (quran-data.xml) and canonical text (quran-uthmani.xml).
 */

import {
  QuranSurah,
  QuranAyah,
  calculateSourceVerbatimChecksum,
  calculateStructuralAyahChecksum,
  normalizeArabicForSearch
} from '@islamic/islamic-engine';

export interface TanzilMetadata {
  surahs: QuranSurah[];
  juzs: { index: number; sura: number; aya: number }[];
  quarters: { index: number; sura: number; aya: number }[];
  pages: { index: number; sura: number; aya: number }[];
  sajdas: Map<string, { sajdah: boolean; sajdahType: string }>;
}

export interface ParsedQuranDataset {
  editionId: string;
  surahs: QuranSurah[];
  ayahs: QuranAyah[];
  totalSurahs: number;
  totalAyahs: number;
}

/**
 * Creates a URL-friendly slug from an English transliterated Surah name.
 */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’`-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Parses Tanzil structural metadata XML (quran-data.xml).
 */
export function parseTanzilMetadata(xmlContent: string): TanzilMetadata {
  const surahs: QuranSurah[] = [];
  const juzs: { index: number; sura: number; aya: number }[] = [];
  const quarters: { index: number; sura: number; aya: number }[] = [];
  const pages: { index: number; sura: number; aya: number }[] = [];
  const sajdas = new Map<string, { sajdah: boolean; sajdahType: string }>();

  // 1. Parse Surahs
  const suraRegex = /<sura\s+index="(\d+)"\s+ayas="(\d+)"\s+start="(\d+)"\s+name="([^"]+)"\s+tname="([^"]+)"\s+ename="([^"]+)"\s+type="(Meccan|Medinan)"\s+order="(\d+)"\s+rukus="(\d+)"\s*\/>/g;
  let match: RegExpExecArray | null;

  while ((match = suraRegex.exec(xmlContent)) !== null) {
    const id = parseInt(match[1], 10);
    const ayahsCount = parseInt(match[2], 10);
    const startAyahIndex = parseInt(match[3], 10);
    const nameArabic = match[4];
    const nameTransliteration = match[5];
    const nameEnglish = match[6];
    const revelationType = match[7].toLowerCase() as 'meccan' | 'medinan';
    const revelationOrder = parseInt(match[8], 10);
    const rukusCount = parseInt(match[9], 10);

    surahs.push({
      id,
      slug: slugify(nameTransliteration),
      nameArabic,
      nameEnglish,
      nameTransliteration,
      revelationType,
      revelationOrder,
      ayahsCount,
      rukusCount,
      startAyahIndex
    });
  }

  // 2. Parse Juzs (Parts)
  const juzRegex = /<juz\s+index="(\d+)"\s+sura="(\d+)"\s+aya="(\d+)"\s*\/>/g;
  while ((match = juzRegex.exec(xmlContent)) !== null) {
    juzs.push({
      index: parseInt(match[1], 10),
      sura: parseInt(match[2], 10),
      aya: parseInt(match[3], 10)
    });
  }

  // 3. Parse Hizb Quarters
  const quarterRegex = /<quarter\s+index="(\d+)"\s+sura="(\d+)"\s+aya="(\d+)"\s*\/>/g;
  while ((match = quarterRegex.exec(xmlContent)) !== null) {
    quarters.push({
      index: parseInt(match[1], 10),
      sura: parseInt(match[2], 10),
      aya: parseInt(match[3], 10)
    });
  }

  // 4. Parse Pages (Medina Mushaf page mapping)
  const pageRegex = /<page\s+index="(\d+)"\s+sura="(\d+)"\s+aya="(\d+)"\s*\/>/g;
  while ((match = pageRegex.exec(xmlContent)) !== null) {
    pages.push({
      index: parseInt(match[1], 10),
      sura: parseInt(match[2], 10),
      aya: parseInt(match[3], 10)
    });
  }

  // 5. Parse Sajdas
  const sajdaRegex = /<sajda\s+index="(\d+)"\s+sura="(\d+)"\s+aya="(\d+)"\s+type="([^"]+)"\s*\/>/g;
  while ((match = sajdaRegex.exec(xmlContent)) !== null) {
    const sura = parseInt(match[2], 10);
    const aya = parseInt(match[3], 10);
    const sajdahType = match[4];
    sajdas.set(`${sura}:${aya}`, { sajdah: true, sajdahType });
  }

  return { surahs, juzs, quarters, pages, sajdas };
}

/**
 * Finds the index of an item in a list of starts (e.g. juz, page, quarter).
 */
function findLocationIndex(
  starts: { index: number; sura: number; aya: number }[],
  sura: number,
  aya: number
): number {
  let low = 0;
  let high = starts.length - 1;
  let best = 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const item = starts[mid];
    const itemPos = item.sura * 1000 + item.aya;
    const targetPos = sura * 1000 + aya;

    if (itemPos <= targetPos) {
      best = item.index;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return best;
}

/**
 * Parses Tanzil Uthmani XML (quran-uthmani.xml) and binds structural metadata.
 */
export function parseTanzilUthmani(
  uthmaniXml: string,
  metadata: TanzilMetadata,
  editionId: string = 'tanzil-uthmani-v1.1'
): ParsedQuranDataset {
  const ayahs: QuranAyah[] = [];
  let globalAyahIndex = 1;

  // Split into lines to iterate cleanly
  const lines = uthmaniXml.split('\n');
  let currentSurahId = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect <sura index="X" ...>
    const suraMatch = line.match(/<sura\s+index="(\d+)"/);
    if (suraMatch) {
      currentSurahId = parseInt(suraMatch[1], 10);
      continue;
    }

    // Detect <aya index="Y" text="..." (optional bismillah="...") />
    const ayaMatch = line.match(/<aya\s+index="(\d+)"\s+text="([^"]+)"(?:\s+bismillah="([^"]+)")?\s*\/>/);
    if (ayaMatch && currentSurahId > 0) {
      const ayahNumber = parseInt(ayaMatch[1], 10);
      const textUthmani = ayaMatch[2];
      const bismillah = ayaMatch[3] || null;

      // Source-verbatim canonical representation:
      // Preserves the exact representation supplied by the verified Tanzil source,
      // where for Surahs 2-114 Bismillah is encoded together with the first Ayah.
      const textSourceVerbatim = bismillah ? `${bismillah} ${textUthmani}` : textUthmani;

      // Deterministic search text normalization (derived strictly from textUthmani, never used for canonical hashes)
      const textClean = normalizeArabicForSearch(textUthmani);

      // Cryptographic SHA-256 calculations:
      // 1. Source-verbatim checksum computed strictly on UTF-8 bytes of textSourceVerbatim
      const checksumSourceVerbatim = calculateSourceVerbatimChecksum(textSourceVerbatim);
      // 2. Structural Ayah checksum computed strictly on UTF-8 bytes of textUthmani
      const checksumAyahStructural = calculateStructuralAyahChecksum(textUthmani);
      // 3. Compatibility alias
      const textChecksum = checksumAyahStructural;

      // Boundary lookups
      const juzNumber = findLocationIndex(metadata.juzs, currentSurahId, ayahNumber);
      const quarterIndex = findLocationIndex(metadata.quarters, currentSurahId, ayahNumber);
      const pageNumber = findLocationIndex(metadata.pages, currentSurahId, ayahNumber);

      // Rub & Hizb calculation: quarterIndex is 1..240, 4 quarters per hizb
      const rubNumber = quarterIndex;
      const hizbNumber = Math.ceil(quarterIndex / 4);

      // Sajda check
      const sajdaKey = `${currentSurahId}:${ayahNumber}`;
      const sajdaInfo = metadata.sajdas.get(sajdaKey);
      const sajdah = Boolean(sajdaInfo?.sajdah);
      const sajdahType = sajdaInfo?.sajdahType || null;

      // Approximate Manzil (7 stages): traditional distribution
      let manzilNumber = 1;
      if (currentSurahId >= 50) manzilNumber = 7;
      else if (currentSurahId >= 37) manzilNumber = 6;
      else if (currentSurahId >= 27) manzilNumber = 5;
      else if (currentSurahId >= 17) manzilNumber = 4;
      else if (currentSurahId >= 10) manzilNumber = 3;
      else if (currentSurahId >= 5) manzilNumber = 2;

      ayahs.push({
        id: globalAyahIndex,
        editionId,
        surahId: currentSurahId,
        ayahNumber,
        textSourceVerbatim,
        checksumSourceVerbatim,
        textUthmani,
        checksumAyahStructural,
        textChecksum,
        bismillah,
        textClean,
        juzNumber,
        hizbNumber,
        rubNumber,
        rukuNumber: 1, // Populated from metadata if needed
        manzilNumber,
        pageNumber,
        sajdah,
        sajdahType
      });

      globalAyahIndex++;
    }
  }

  return {
    editionId,
    surahs: metadata.surahs,
    ayahs,
    totalSurahs: metadata.surahs.length,
    totalAyahs: ayahs.length
  };
}
