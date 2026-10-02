/**
 * @file library.ts
 * @package @islamic/web
 * @description Web helper module for User Library & Bookmarks.
 * Coordinates LibraryService with ArticleService and session management.
 * Milestone: M3.3 — User Library & Bookmarks
 */

import { LibraryService } from '@islamic/database';
import { getArticleService } from './articles.js';
import type { ActorContext } from '@islamic/database';
import type {
  BookmarkEntity,
  ResolvedBookmark,
  BookmarkContentType,
  CreateBookmarkInput
} from '@islamic/islamic-engine';

let globalLibraryService: LibraryService | null = null;

export async function getLibraryService(): Promise<LibraryService> {
  if (!globalLibraryService) {
    const articleService = await getArticleService();
    globalLibraryService = new LibraryService({ articleService });
    await seedDemoBookmarks(globalLibraryService);
  }
  return globalLibraryService;
}

/**
 * Resolves current actor from request context or development session.
 */
export function resolveActor(userId?: string | null): ActorContext {
  const resolvedId = userId || '00000000-0000-0000-0001-000000000001';
  return {
    id: resolvedId,
    roles: ['user']
  };
}

/**
 * Seeds initial devotional bookmarks for demonstration and local development.
 */
async function seedDemoBookmarks(service: LibraryService): Promise<void> {
  const actor: ActorContext = {
    id: '00000000-0000-0000-0001-000000000001',
    roles: ['user']
  };

  try {
    // 1. Ayat al-Kursi (Quran 2:255)
    await service.createBookmark(
      {
        contentType: 'quran',
        contentReference: '2:255',
        note: 'Ayat al-Kursi — the greatest verse of the Holy Quran',
        folderName: 'Favorites'
      },
      actor
    );

    // 2. Hadith on Intentions (Bukhari 1)
    await service.createBookmark(
      {
        contentType: 'hadith',
        contentReference: 'bukhari:1',
        note: 'Actions are by intentions (Innama al-a`malu bin-niyyat)',
        folderName: 'Hadith Studies'
      },
      actor
    );

    // 3. Morning Dua (Hisn al-Muslim)
    await service.createBookmark(
      {
        contentType: 'dua',
        contentReference: 'when-waking-up:1',
        note: 'Praise be to Allah Who brought us back to life after He caused us to die',
        folderName: 'Daily Adhkar'
      },
      actor
    );

    // 4. Published Article (Foundations of Sunni Creed)
    await service.createBookmark(
      {
        contentType: 'article',
        contentReference: 'foundations-of-sunni-creed',
        note: 'Comprehensive overview of the Six Articles of Faith',
        folderName: 'Reading List'
      },
      actor
    );
  } catch {
    // Ignore duplicate errors during hot-reloads
  }
}

export type {
  BookmarkEntity,
  ResolvedBookmark,
  BookmarkContentType,
  CreateBookmarkInput
};
