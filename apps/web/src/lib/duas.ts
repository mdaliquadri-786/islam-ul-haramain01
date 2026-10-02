/**
 * @file duas.ts
 * @package @islamic/web
 * @description Server-side accessor and in-memory cache for authentic Duas and Adhkar
 *              from Hisn al-Muslim (حصن المسلم).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  loadDuaCorpus,
  ParsedDuaCorpus,
  DuaSourceRow,
  DuaCategoryRow,
  DuaAdhkarRow
} from '@islamic/database';

let cachedCorpus: ParsedDuaCorpus | null = null;

function resolveDuaDataDir(): string {
  const candidate1 = path.resolve(process.cwd(), 'packages/database/data/duas');
  const candidate2 = path.resolve(process.cwd(), '../../packages/database/data/duas');
  const candidate3 = path.resolve(process.cwd(), 'data/duas');

  if (fs.existsSync(candidate1)) return candidate1;
  if (fs.existsSync(candidate2)) return candidate2;
  if (fs.existsSync(candidate3)) return candidate3;

  throw new Error('Duas dataset directory not found on server.');
}

export function getDuaCorpus(): ParsedDuaCorpus {
  if (cachedCorpus) {
    return cachedCorpus;
  }
  const dataDir = resolveDuaDataDir();
  cachedCorpus = loadDuaCorpus(dataDir);
  return cachedCorpus;
}

export function getAllDuaCategories(): DuaCategoryRow[] {
  const corpus = getDuaCorpus();
  return corpus.categories;
}

export function getDuaCategoryBySlug(slug: string): DuaCategoryRow | undefined {
  const categories = getAllDuaCategories();
  return categories.find((c) => c.slug === slug || c.id?.toString() === slug);
}

export function getDuasByCategory(categoryId: number): DuaAdhkarRow[] {
  const corpus = getDuaCorpus();
  return corpus.duas.filter((d) => d.category_id === categoryId);
}

export function getDuaById(duaId: string): DuaAdhkarRow | undefined {
  const corpus = getDuaCorpus();
  return corpus.duas.find((d) => d.dua_id === duaId);
}

export function getDuaSource(): DuaSourceRow | undefined {
  const corpus = getDuaCorpus();
  return corpus.sources[0];
}

export function getDuaCorpusSummary() {
  const corpus = getDuaCorpus();
  return corpus.summary;
}
