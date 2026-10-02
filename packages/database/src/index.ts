/**
 * @file index.ts
 * @package @islamic/database
 * @description Boundary exports for the database package.
 */

export * from './types';
export * from './client';
export * from './quran/tanzil-parser';
export * from './quran/tanzil-translation-parser';
export * from './hadith/hadith-parser';
export * from './duas/duas-parser';
export * from './ingest/import-quran';
export * from './ingest/import-translations';
export * from './ingest/import-hadith';
export * from './ingest/cli-seed-hadith';
export * from './ingest/import-duas';
export * from './ingest/cli-seed-duas';
export * from './search/search-service';
export * from './prayer/prayer-service';
export * from './articles/article-service';
export * from './library/library-service';
export * from './audio/audio-service';
export * from './tafsir/tafsir-service';
export * from './books/books-service';
export * from './admin/admin-service';
export * from './observability';

export const DATABASE_PACKAGE_VERSION = '0.15.0-admin-system';

