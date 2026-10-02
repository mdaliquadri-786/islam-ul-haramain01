/**
 * @file hadith.ts
 * @package @islamic/web
 * @description Server-side accessor and in-memory cache for canonical Hadith collections,
 *              books, narrations, and authenticated multi-scholar gradings.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  loadHadithCorpus,
  ParsedHadithCorpus,
  ScholarAuthorRow,
  HadithCollectionRow,
  HadithBookRow,
  HadithNarrationRow,
  HadithGradingRow
} from '@islamic/database';

let cachedCorpus: ParsedHadithCorpus | null = null;

function resolveHadithDataDir(): string {
  const candidate1 = path.resolve(process.cwd(), 'packages/database/data/hadith');
  const candidate2 = path.resolve(process.cwd(), '../../packages/database/data/hadith');
  const candidate3 = path.resolve(process.cwd(), 'data/hadith');

  if (fs.existsSync(candidate1)) return candidate1;
  if (fs.existsSync(candidate2)) return candidate2;
  if (fs.existsSync(candidate3)) return candidate3;

  throw new Error('Hadith dataset directory not found on server.');
}

export function getHadithCorpus(): ParsedHadithCorpus {
  if (cachedCorpus) {
    return cachedCorpus;
  }
  const dataDir = resolveHadithDataDir();
  cachedCorpus = loadHadithCorpus(dataDir);
  return cachedCorpus;
}

export function getAllHadithCollections(): HadithCollectionRow[] {
  const corpus = getHadithCorpus();
  return corpus.collections;
}

export function getHadithCollectionById(collectionId: string): HadithCollectionRow | undefined {
  const collections = getAllHadithCollections();
  return collections.find((c) => c.id === collectionId);
}

export function getHadithBooks(collectionId: string): HadithBookRow[] {
  const corpus = getHadithCorpus();
  return corpus.books.filter((b) => b.collection_id === collectionId);
}

export function getHadithNarrations(collectionId: string, limit?: number): HadithNarrationRow[] {
  const corpus = getHadithCorpus();
  const narrations = corpus.narrations.filter((n) => n.collection_id === collectionId);
  return limit ? narrations.slice(0, limit) : narrations;
}

export function getHadithGradings(collectionId: string): HadithGradingRow[] {
  const corpus = getHadithCorpus();
  const narrations = getHadithNarrations(collectionId);
  const narrationIds = new Set(narrations.map((n) => n.id));
  return corpus.gradings.filter((g) => narrationIds.has(g.hadith_id));
}

export function getAllScholars(): ScholarAuthorRow[] {
  const corpus = getHadithCorpus();
  return corpus.scholars;
}

export function getScholarsMap(): Map<string, ScholarAuthorRow> {
  const scholars = getAllScholars();
  return new Map(scholars.map((s) => [s.id, s]));
}

export function getCollectionSummary(collectionId: string) {
  const corpus = getHadithCorpus();
  return corpus.summaries[collectionId];
}
