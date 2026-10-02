/**
 * @file search.ts
 * @package @islamic/web
 * @description Server-side accessor for the SearchService and Citation Router.
 * Milestone: Phase 2 -> Milestone 2.5
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { SearchService } from '@islamic/database';
import { SearchQuery, SearchResponse, ResolvedCitation } from '@islamic/islamic-engine';

let searchServiceInstance: SearchService | null = null;

function resolveDataDirectory(): string {
  const candidate1 = path.resolve(process.cwd(), 'packages/database/data');
  const candidate2 = path.resolve(process.cwd(), '../../packages/database/data');
  const candidate3 = path.resolve(process.cwd(), 'data');

  if (fs.existsSync(candidate1)) return candidate1;
  if (fs.existsSync(candidate2)) return candidate2;
  if (fs.existsSync(candidate3)) return candidate3;

  throw new Error('Data directory not found on server.');
}

export function getSearchService(): SearchService {
  if (!searchServiceInstance) {
    const dataDir = resolveDataDirectory();
    searchServiceInstance = new SearchService({
      dataDir,
      eagerLoad: true
    });
  }
  return searchServiceInstance;
}

export async function executeSearch(query: SearchQuery): Promise<SearchResponse> {
  const service = getSearchService();
  return service.search(query);
}

export function resolveSearchCitation(query: string): ResolvedCitation | null {
  const service = getSearchService();
  return service.resolveDirectCitation(query);
}
