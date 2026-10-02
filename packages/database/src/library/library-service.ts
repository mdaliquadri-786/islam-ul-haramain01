/**
 * @file library-service.ts
 * @package @islamic/database
 * @description Service layer for User Library & Bookmarks.
 * Implements strict user isolation, duplicate prevention, ownership immutability,
 * and article publication safety across dual-mode (Supabase + In-Memory) environments.
 * Milestone: M3.3 — User Library & Bookmarks
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  BookmarkEntity,
  CreateBookmarkInput,
  ResolvedBookmark,
  BookmarkFilterOptions,
  BookmarkContentType,
  validateBookmarkInput,
  CANONICAL_SURAHS
} from '@islamic/islamic-engine';
import { ArticleService, type ActorContext } from '../articles/article-service.js';
import type { AuditLogEntry } from '../types.js';

export class LibraryService {
  private supabaseClient: SupabaseClient | null = null;
  private articleService: ArticleService;
  private bookmarksMap = new Map<string, BookmarkEntity>();
  private auditLogs: AuditLogEntry[] = [];

  constructor(options?: {
    supabaseClient?: SupabaseClient;
    articleService?: ArticleService;
  }) {
    this.supabaseClient = options?.supabaseClient || null;
    this.articleService = options?.articleService || new ArticleService();
  }

  // ==========================================================================
  // Bookmark Creation & Toggling
  // ==========================================================================

  public async createBookmark(
    input: CreateBookmarkInput,
    actor: ActorContext
  ): Promise<BookmarkEntity> {
    // 1. Authentication Required
    if (!actor || !actor.id) {
      throw new Error('Authentication Required: Anonymous users cannot create persistent private bookmarks.');
    }

    // 2. Canonical Reference Validation
    const validation = validateBookmarkInput(input);
    if (!validation.valid || !validation.normalizedReference) {
      throw new Error(`Data Validation Error: ${validation.errors.join(' ')}`);
    }

    const normalizedRef = validation.normalizedReference;
    const parsed = validation.parsedMetadata || {};

    // 3. Article Publication Safety Gate
    // A bookmark must NEVER be allowed on an unpublished or draft article.
    if (input.contentType === 'article') {
      const publicArticle = await this.articleService.getPublicArticleBySlug(normalizedRef);
      if (!publicArticle) {
        throw new Error(
          'Article Publication Violation: Cannot bookmark unpublished or draft article. Only published articles can be saved to library.'
        );
      }
    }

    // 4. Duplicate Check
    const existing = await this.findActiveBookmark(actor.id, input.contentType, normalizedRef);
    if (existing) {
      throw new Error('Duplicate Bookmark Violation: Content item is already saved in your personal library.');
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const bookmark: BookmarkEntity = {
      id,
      userId: actor.id,
      contentType: input.contentType,
      contentReference: normalizedRef,
      surahNumber: parsed.surahNumber,
      ayahNumber: parsed.ayahNumber,
      hadithCollection: parsed.hadithCollection,
      hadithNumber: parsed.hadithNumber,
      duaCategory: parsed.duaCategory,
      articleId: parsed.articleId,
      bookId: parsed.bookId,
      folderName: input.folderName || 'default',
      note: input.note,
      tags: input.tags || [],
      clientMutationId: input.clientMutationId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };

    if (this.supabaseClient) {
      const { error } = await this.supabaseClient
        .from('bookmarks')
        .insert({
          id: bookmark.id,
          user_id: bookmark.userId,
          content_type: bookmark.contentType,
          content_reference: bookmark.contentReference,
          surah_number: bookmark.surahNumber,
          ayah_number: bookmark.ayahNumber,
          hadith_collection: bookmark.hadithCollection,
          hadith_number: bookmark.hadithNumber,
          dua_category: bookmark.duaCategory,
          article_id: bookmark.articleId,
          book_id: bookmark.bookId,
          folder_name: bookmark.folderName,
          note: bookmark.note,
          tags: bookmark.tags,
          client_mutation_id: bookmark.clientMutationId
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Duplicate Bookmark Violation: Content item is already saved in your personal library.');
        }
        throw new Error(`Failed to save bookmark: ${error.message}`);
      }
    } else {
      this.bookmarksMap.set(id, bookmark);
    }

    this.recordAuditLog('BOOKMARK_CREATED', actor.id, 'bookmark', id, {
      contentType: bookmark.contentType,
      contentReference: bookmark.contentReference
    });

    return bookmark;
  }

  // ==========================================================================
  // Bookmark Deletion & Unsaving
  // ==========================================================================

  public async removeBookmark(
    bookmarkId: string,
    actor: ActorContext
  ): Promise<boolean> {
    if (!actor || !actor.id) {
      throw new Error('Authentication Required: Cannot remove bookmark without authentication.');
    }

    const bookmark = await this.getBookmarkRaw(bookmarkId);
    if (!bookmark || bookmark.deletedAt) {
      throw new Error(`Bookmark ${bookmarkId} not found.`);
    }

    // Ownership Enforcement
    if (bookmark.userId !== actor.id) {
      throw new Error('Unauthorized: You cannot delete another user\'s private bookmark.');
    }

    const now = new Date().toISOString();

    if (this.supabaseClient) {
      const { error } = await this.supabaseClient
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', actor.id);

      if (error) throw new Error(`Failed to delete bookmark: ${error.message}`);
    } else {
      bookmark.deletedAt = now;
      bookmark.updatedAt = now;
    }

    this.recordAuditLog('BOOKMARK_REMOVED', actor.id, 'bookmark', bookmarkId, {
      contentType: bookmark.contentType,
      contentReference: bookmark.contentReference
    });

    return true;
  }

  public async removeBookmarkByReference(
    contentType: BookmarkContentType,
    contentReference: string,
    actor: ActorContext
  ): Promise<boolean> {
    if (!actor || !actor.id) {
      throw new Error('Authentication Required: Cannot remove bookmark without authentication.');
    }

    const bookmark = await this.findActiveBookmark(actor.id, contentType, contentReference);
    if (!bookmark) {
      return false;
    }

    return this.removeBookmark(bookmark.id, actor);
  }

  // ==========================================================================
  // Retrieval & Checking
  // ==========================================================================

  public async isBookmarked(
    contentType: BookmarkContentType,
    contentReference: string,
    actor?: ActorContext | null
  ): Promise<boolean> {
    if (!actor || !actor.id) return false;
    const bookmark = await this.findActiveBookmark(actor.id, contentType, contentReference);
    return bookmark !== null;
  }

  public async getBookmark(
    bookmarkId: string,
    actor: ActorContext
  ): Promise<BookmarkEntity | null> {
    if (!actor || !actor.id) return null;
    const bookmark = await this.getBookmarkRaw(bookmarkId);
    if (!bookmark || bookmark.deletedAt) return null;

    // Strict User Isolation
    if (bookmark.userId !== actor.id) {
      return null;
    }

    return bookmark;
  }

  public async listUserBookmarks(
    actor: ActorContext,
    options?: BookmarkFilterOptions
  ): Promise<{ bookmarks: BookmarkEntity[]; total: number }> {
    if (!actor || !actor.id) {
      throw new Error('Authentication Required: Cannot access private user library.');
    }

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    if (this.supabaseClient) {
      let query = this.supabaseClient
        .from('bookmarks')
        .select('*', { count: 'exact' })
        .eq('user_id', actor.id)
        .is('deleted_at', null);

      if (options?.contentType) {
        query = query.eq('content_type', options.contentType);
      }

      if (options?.folderName) {
        query = query.eq('folder_name', options.folderName);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw new Error(`Failed to list bookmarks: ${error.message}`);

      const bookmarks: BookmarkEntity[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        contentType: row.content_type,
        contentReference: row.content_reference,
        surahNumber: row.surah_number,
        ayahNumber: row.ayah_number,
        hadithCollection: row.hadith_collection,
        hadithNumber: row.hadith_number,
        duaCategory: row.dua_category,
        articleId: row.article_id,
        bookId: row.book_id,
        folderName: row.folder_name,
        note: row.note,
        tags: row.tags || [],
        clientMutationId: row.client_mutation_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at
      }));

      return { bookmarks, total: count || 0 };
    }

    // In-Memory Mode
    let list = Array.from(this.bookmarksMap.values()).filter(
      b => b.userId === actor.id && !b.deletedAt
    );

    if (options?.contentType) {
      list = list.filter(b => b.contentType === options.contentType);
    }

    if (options?.folderName) {
      list = list.filter(b => b.folderName === options.folderName);
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const paged = list.slice(offset, offset + limit);

    return { bookmarks: paged, total };
  }

  // ==========================================================================
  // Canonical Content Resolution & Safe Article Boundaries
  // ==========================================================================

  public async resolveBookmarkContent(
    bookmark: BookmarkEntity,
    _actor: ActorContext
  ): Promise<ResolvedBookmark> {
    switch (bookmark.contentType) {
      case 'quran': {
        const surah = bookmark.surahNumber || parseInt(bookmark.contentReference.split(':')[0], 10);
        const ayah = bookmark.ayahNumber || parseInt(bookmark.contentReference.split(':')[1], 10);
        const surahInfo = CANONICAL_SURAHS[surah];

        return {
          bookmark,
          canonicalUrl: `/quran/${surah}#ayah-${ayah}`,
          title: `Surah ${surahInfo ? surahInfo.nameTransliteration : surah} (${surah}:${ayah})`,
          subtitle: surahInfo ? surahInfo.nameEnglish : undefined,
          badgeLabel: 'Holy Quran',
          isAvailable: true
        };
      }

      case 'hadith': {
        const col = bookmark.hadithCollection || bookmark.contentReference.split(':')[0];
        const num = bookmark.hadithNumber || parseInt(bookmark.contentReference.split(':')[1], 10);
        const colTitle = col.charAt(0).toUpperCase() + col.slice(1);

        return {
          bookmark,
          canonicalUrl: `/hadith/${col}?hadith=${num}`,
          title: `${colTitle} — Hadith #${num}`,
          badgeLabel: 'Hadith',
          isAvailable: true
        };
      }

      case 'dua': {
        const cat = bookmark.duaCategory || bookmark.contentReference.split(':')[0];
        const formattedCat = cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        return {
          bookmark,
          canonicalUrl: `/duas/${cat}`,
          title: `Supplication: ${formattedCat}`,
          badgeLabel: 'Duas & Adhkar',
          isAvailable: true
        };
      }

      case 'article': {
        // Safe Article Resolution:
        // Must check if the article is currently PUBLISHED.
        // If it was retracted, changed to draft, or unpublished: DO NOT leak unpublished content!
        const publicArticle = await this.articleService.getPublicArticleBySlug(bookmark.contentReference);

        if (!publicArticle) {
          return {
            bookmark,
            canonicalUrl: '/articles',
            title: '[Article Unavailable]',
            subtitle: 'This research article is currently unpublished or undergoing scholarly revision.',
            badgeLabel: 'Research Article',
            isAvailable: false,
            statusMessage: 'This article is currently unpublished or undergoing scholarly revision.'
          };
        }

        return {
          bookmark,
          canonicalUrl: `/articles/${publicArticle.article.slug}`,
          title: publicArticle.revision.title,
          subtitle: publicArticle.revision.subtitle,
          badgeLabel: 'Research Article',
          isAvailable: true
        };
      }

      case 'book': {
        const bookSlug = bookmark.bookId || bookmark.contentReference.split(':')[0];
        return {
          bookmark,
          canonicalUrl: `/books/${bookSlug}`,
          title: `Islamic Book: ${bookSlug}`,
          badgeLabel: 'Digital Book',
          isAvailable: true
        };
      }

      default:
        return {
          bookmark,
          canonicalUrl: '/',
          title: bookmark.contentReference,
          badgeLabel: 'Unknown',
          isAvailable: false,
          statusMessage: 'Unsupported content type.'
        };
    }
  }

  // ==========================================================================
  // Internal Helpers
  // ==========================================================================

  private async getBookmarkRaw(id: string): Promise<BookmarkEntity | null> {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('bookmarks')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        contentType: data.content_type,
        contentReference: data.content_reference,
        surahNumber: data.surah_number,
        ayahNumber: data.ayah_number,
        hadithCollection: data.hadith_collection,
        hadithNumber: data.hadith_number,
        duaCategory: data.dua_category,
        articleId: data.article_id,
        bookId: data.book_id,
        folderName: data.folder_name,
        note: data.note,
        tags: data.tags || [],
        clientMutationId: data.client_mutation_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deletedAt: data.deleted_at
      };
    }

    return this.bookmarksMap.get(id) || null;
  }

  private async findActiveBookmark(
    userId: string,
    contentType: BookmarkContentType,
    contentReference: string
  ): Promise<BookmarkEntity | null> {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('content_type', contentType)
        .eq('content_reference', contentReference)
        .is('deleted_at', null)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        contentType: data.content_type,
        contentReference: data.content_reference,
        surahNumber: data.surah_number,
        ayahNumber: data.ayah_number,
        hadithCollection: data.hadith_collection,
        hadithNumber: data.hadith_number,
        duaCategory: data.dua_category,
        articleId: data.article_id,
        folderName: data.folder_name,
        note: data.note,
        tags: data.tags || [],
        clientMutationId: data.client_mutation_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deletedAt: data.deleted_at
      };
    }

    for (const b of this.bookmarksMap.values()) {
      if (
        b.userId === userId &&
        b.contentType === contentType &&
        b.contentReference === contentReference &&
        !b.deletedAt
      ) {
        return b;
      }
    }

    return null;
  }

  private recordAuditLog(
    action: string,
    actorId: string,
    targetEntityType: string,
    targetEntityId: string,
    details: Record<string, unknown>
  ): void {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      action,
      actorId,
      targetEntityType,
      targetEntityId,
      details,
      createdAt: new Date().toISOString()
    };
    this.auditLogs.push(entry);
  }
}
