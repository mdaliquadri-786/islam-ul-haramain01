/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Domain types and interfaces for the User Library & Bookmarks system.
 * Milestone: M3.3 — User Library & Bookmarks
 */

export type BookmarkContentType = 'quran' | 'hadith' | 'dua' | 'article' | 'book';

export interface BookmarkEntity {
  id: string;
  userId: string;
  contentType: BookmarkContentType;
  contentReference: string;
  surahNumber?: number;
  ayahNumber?: number;
  hadithCollection?: string;
  hadithNumber?: number;
  duaCategory?: string;
  articleId?: string;
  bookId?: string;
  folderName: string;
  note?: string;
  tags: string[];
  clientMutationId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateBookmarkInput {
  contentType: BookmarkContentType;
  contentReference: string;
  surahNumber?: number;
  ayahNumber?: number;
  hadithCollection?: string;
  hadithNumber?: number;
  duaCategory?: string;
  articleId?: string;
  bookId?: string;
  folderName?: string;
  note?: string;
  tags?: string[];
  clientMutationId?: string;
}

export interface UpdateBookmarkInput {
  folderName?: string;
  note?: string;
  tags?: string[];
}

export interface ResolvedBookmark {
  bookmark: BookmarkEntity;
  canonicalUrl: string;
  title: string;
  subtitle?: string;
  arabicText?: string;
  translationText?: string;
  badgeLabel: string;
  isAvailable: boolean;
  statusMessage?: string;
}

export interface BookmarkFilterOptions {
  contentType?: BookmarkContentType;
  folderName?: string;
  limit?: number;
  offset?: number;
}
