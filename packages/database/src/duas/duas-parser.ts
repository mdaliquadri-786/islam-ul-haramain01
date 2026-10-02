/**
 * @file duas-parser.ts
 * @package @islamic/database
 * @description Loads and parses verified Duas & Adhkar datasets from disk,
 *              validates structural consistency, and prepares typed records for database seeding.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  calculateDuaChecksum,
  calculateDuaDatasetChecksum
} from '@islamic/islamic-engine';
import type {
  DuaSourceRow,
  DuaCategoryRow,
  DuaAdhkarRow
} from '../types.js';

export interface ParsedDuaCorpus {
  sources: DuaSourceRow[];
  categories: DuaCategoryRow[];
  duas: DuaAdhkarRow[];
  summary: {
    totalSources: number;
    totalCategories: number;
    totalDuas: number;
    datasetChecksum: string;
  };
}

function getDefaultDataDir(): string {
  return path.resolve(__dirname, '../../data/duas');
}

/**
 * Loads and parses Dua sources metadata from JSON file.
 */
export function loadDuaSources(filePath?: string): DuaSourceRow[] {
  const target = filePath || path.join(getDefaultDataDir(), 'sources.json');
  const raw = fs.readFileSync(target, 'utf8');
  const items = JSON.parse(raw);

  return items.map((s: any): DuaSourceRow => ({
    id: s.id,
    slug: s.slug,
    name_arabic: s.nameArabic,
    name_english: s.nameEnglish,
    name_urdu: s.nameUrdu || null,
    author: s.author,
    author_arabic: s.authorArabic,
    author_death_year_ah: s.authorDeathYearAh !== undefined ? s.authorDeathYearAh : null,
    author_death_year_ce: s.authorDeathYearCe !== undefined ? s.authorDeathYearCe : null,
    license: s.license,
    description: s.description || null,
    status: s.status || 'published'
  }));
}

/**
 * Loads and parses Dua categories metadata from JSON file.
 */
export function loadDuaCategories(filePath?: string): DuaCategoryRow[] {
  const target = filePath || path.join(getDefaultDataDir(), 'categories.json');
  const raw = fs.readFileSync(target, 'utf8');
  const items = JSON.parse(raw);

  return items.map((c: any): DuaCategoryRow => ({
    id: c.id,
    slug: c.slug,
    name_arabic: c.nameArabic,
    name_english: c.nameEnglish,
    name_urdu: c.nameUrdu || null,
    sort_order: c.sortOrder,
    total_duas: c.totalDuas
  }));
}

/**
 * Loads and parses Duas & Adhkar from JSON file, verifying individual checksums.
 */
export function loadDuas(filePath?: string): DuaAdhkarRow[] {
  const target = filePath || path.join(getDefaultDataDir(), 'duas.json');
  const raw = fs.readFileSync(target, 'utf8');
  const items = JSON.parse(raw);

  return items.map((d: any): DuaAdhkarRow => {
    const arabicText = d.arabicText.trim();
    const computedHash = calculateDuaChecksum(arabicText);

    if (d.textChecksum && d.textChecksum.toLowerCase() !== computedHash) {
      throw new Error(
        `Dua ${d.id} cryptographic checksum mismatch on load! Expected ${d.textChecksum}, computed ${computedHash}`
      );
    }

    return {
      id: d.itemNumber,
      dua_id: d.id,
      category_id: d.categoryId,
      category_slug: d.categorySlug,
      source_id: d.sourceId,
      item_number: d.itemNumber,
      arabic_text: arabicText,
      transliteration: d.transliteration || null,
      translation_english: d.translationEnglish,
      translation_urdu: d.translationUrdu || null,
      repeat_count: d.repeatCount || 1,
      occasion_context: d.occasionContext || null,
      quran_surah: d.quranSurah !== undefined ? d.quranSurah : null,
      quran_ayah: d.quranAyah !== undefined ? d.quranAyah : null,
      hadith_collection: d.hadithCollection || null,
      hadith_number: d.hadithNumber || null,
      hadith_reference: d.hadithReference || null,
      hadith_grade: d.hadithGrade || null,
      text_checksum: computedHash,
      text_clean: d.textClean,
      version_number: d.versionNumber || 1,
      is_current: d.isCurrent !== undefined ? d.isCurrent : true,
      status: d.status || 'published'
    };
  });
}

/**
 * Loads the complete Duas & Adhkar corpus and computes whole-dataset cryptographic checksum.
 */
export function loadDuaCorpus(dataDir?: string): ParsedDuaCorpus {
  const dir = dataDir || getDefaultDataDir();

  const sources = loadDuaSources(path.join(dir, 'sources.json'));
  const categories = loadDuaCategories(path.join(dir, 'categories.json'));
  const duas = loadDuas(path.join(dir, 'duas.json'));

  const datasetChecksum = calculateDuaDatasetChecksum(
    duas.map((d) => ({
      id: d.dua_id,
      categoryId: d.category_id,
      categorySlug: '',
      sourceId: d.source_id,
      itemNumber: d.item_number,
      arabicText: d.arabic_text,
      transliteration: d.transliteration ?? null,
      translationEnglish: d.translation_english,
      translationUrdu: d.translation_urdu ?? null,
      repeatCount: d.repeat_count,
      occasionContext: d.occasion_context ?? null,
      quranSurah: d.quran_surah ?? null,
      quranAyah: d.quran_ayah ?? null,
      hadithCollection: d.hadith_collection ?? null,
      hadithNumber: d.hadith_number ?? null,
      hadithReference: d.hadith_reference ?? null,
      hadithGrade: d.hadith_grade ?? null,
      textChecksum: d.text_checksum,
      textClean: d.text_clean
    }))
  );

  return {
    sources,
    categories,
    duas,
    summary: {
      totalSources: sources.length,
      totalCategories: categories.length,
      totalDuas: duas.length,
      datasetChecksum
    }
  };
}
