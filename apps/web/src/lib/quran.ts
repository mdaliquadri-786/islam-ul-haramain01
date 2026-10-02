/**
 * @file quran.ts
 * @package @islamic/web
 * @description Server-side accessor for canonical Quran data and human-authored translations.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  parseTanzilMetadata,
  parseTanzilUthmani,
  parseTanzilTranslation,
  ParsedQuranDataset,
  SAHEEH_INTERNATIONAL_CONFIG,
  JALANDHARI_CONFIG
} from '@islamic/database';
import {
  QuranSurah,
  QuranAyah,
  ParsedTranslationDataset
} from '@islamic/islamic-engine';

// In-memory cache for parsed canonical dataset to avoid re-reading disk on every request
let cachedDataset: ParsedQuranDataset | null = null;
const cachedTranslations = new Map<string, ParsedTranslationDataset>();

function resolveQuranDataDir(): string {
  const candidate1 = path.resolve(process.cwd(), 'packages/database/data/quran');
  const candidate2 = path.resolve(process.cwd(), '../../packages/database/data/quran');
  const candidate3 = path.resolve(process.cwd(), 'data/quran');

  if (fs.existsSync(candidate1)) return candidate1;
  if (fs.existsSync(candidate2)) return candidate2;
  if (fs.existsSync(candidate3)) return candidate3;

  throw new Error('Canonical Quran dataset directory not found on server.');
}

function loadCanonicalDataset(): ParsedQuranDataset {
  if (cachedDataset) {
    return cachedDataset;
  }

  const dataDir = resolveQuranDataDir();
  const metadataPath = path.join(dataDir, 'quran-data.xml');
  const uthmaniPath = path.join(dataDir, 'quran-uthmani.xml');

  if (!fs.existsSync(metadataPath) || !fs.existsSync(uthmaniPath)) {
    throw new Error('Canonical Quran dataset XML files not found.');
  }

  const metadataXml = fs.readFileSync(metadataPath, 'utf8');
  const uthmaniXml = fs.readFileSync(uthmaniPath, 'utf8');

  const metadata = parseTanzilMetadata(metadataXml);
  cachedDataset = parseTanzilUthmani(uthmaniXml, metadata, 'tanzil-uthmani-v1.1');
  return cachedDataset;
}

export function getAllSurahs(): QuranSurah[] {
  const dataset = loadCanonicalDataset();
  return dataset.surahs;
}

export function getSurahById(id: number): QuranSurah | undefined {
  const surahs = getAllSurahs();
  return surahs.find((s) => s.id === id);
}

export function getAyahsBySurahId(surahId: number): QuranAyah[] {
  const dataset = loadCanonicalDataset();
  return dataset.ayahs.filter((a) => a.surahId === surahId);
}

export const AVAILABLE_TRANSLATIONS: {
  id: string;
  name: string;
  language: string;
  direction: 'ltr' | 'rtl';
  translator: string;
  config: typeof SAHEEH_INTERNATIONAL_CONFIG;
}[] = [
  {
    id: 'en.sahih',
    name: 'Saheeh International (English)',
    language: 'English',
    direction: 'ltr',
    translator: 'Saheeh International',
    config: SAHEEH_INTERNATIONAL_CONFIG
  },
  {
    id: 'ur.jalandhry',
    name: 'مولانا فتح محمد جالندھری (Urdu)',
    language: 'Urdu',
    direction: 'rtl',
    translator: 'Fateh Muhammad Jalandhry',
    config: JALANDHARI_CONFIG
  }
];

export function loadTranslationDataset(editionId: string): ParsedTranslationDataset | null {
  if (cachedTranslations.has(editionId)) {
    return cachedTranslations.get(editionId)!;
  }

  const found = AVAILABLE_TRANSLATIONS.find((t) => t.id === editionId);
  if (!found) return null;

  const dataDir = resolveQuranDataDir();
  const filePath = path.join(dataDir, 'translations', found.config.sourceFileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Translation file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = parseTanzilTranslation(content, found.config);
  cachedTranslations.set(editionId, parsed);
  return parsed;
}

export function getTranslationsForSurah(
  editionId: string,
  surahId: number
): Map<number, string> {
  const dataset = loadTranslationDataset(editionId);
  const map = new Map<number, string>();
  if (!dataset) return map;

  for (const a of dataset.ayahs) {
    if (a.surahNumber === surahId) {
      map.set(a.ayahNumber, a.translationText);
    }
  }

  return map;
}
