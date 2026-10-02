/**
 * @file library-service.test.ts
 * @description Comprehensive unit & integration tests for LibraryService:
 * User Isolation, Duplicate Prevention, Ownership Immutability, and Article Publication Safety.
 * Milestone: M3.3 — User Library & Bookmarks
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { LibraryService } from '../src/library/library-service.js';
import { ArticleService } from '../src/articles/article-service.js';
import type { ActorContext } from '../src/types.js';

describe('LibraryService: User Isolation, Duplicate Prevention & Publication Safety', () => {
  let libraryService: LibraryService;
  let articleService: ArticleService;

  const userA: ActorContext = {
    id: '11111111-1111-1111-1111-111111111111',
    roles: ['user']
  };

  const userB: ActorContext = {
    id: '22222222-2222-2222-2222-222222222222',
    roles: ['user']
  };

  const scholar: ActorContext = {
    id: '33333333-3333-3333-3333-333333333333',
    roles: ['scholar_reviewer']
  };

  const editor: ActorContext = {
    id: '44444444-4444-4444-4444-444444444444',
    roles: ['editor']
  };

  beforeEach(() => {
    articleService = new ArticleService();
    libraryService = new LibraryService({ articleService });
  });

  describe('1. Authentication Requirement', () => {
    it('should REJECT anonymous / unauthenticated users from creating bookmarks', async () => {
      await assert.rejects(
        async () => {
          await libraryService.createBookmark(
            { contentType: 'quran', contentReference: '2:255' },
            null as any
          );
        },
        /Authentication Required/
      );
    });

    it('should REJECT anonymous users from listing bookmarks', async () => {
      await assert.rejects(
        async () => {
          await libraryService.listUserBookmarks(null as any);
        },
        /Authentication Required/
      );
    });
  });

  describe('2. User Isolation & Access Boundaries', () => {
    it('should isolate private bookmarks between User A and User B', async () => {
      // User A saves Quran 2:255
      const bA = await libraryService.createBookmark(
        { contentType: 'quran', contentReference: '2:255', note: 'Ayat al-Kursi reflection' },
        userA
      );

      // User B saves Hadith bukhari:1
      const bB = await libraryService.createBookmark(
        { contentType: 'hadith', contentReference: 'bukhari:1', note: 'Innama al-a`malu bin-niyyat' },
        userB
      );

      // User A's list contains only User A's bookmark
      const listA = await libraryService.listUserBookmarks(userA);
      assert.strictEqual(listA.total, 1);
      assert.strictEqual(listA.bookmarks[0].id, bA.id);
      assert.strictEqual(listA.bookmarks[0].note, 'Ayat al-Kursi reflection');

      // User B's list contains only User B's bookmark
      const listB = await libraryService.listUserBookmarks(userB);
      assert.strictEqual(listB.total, 1);
      assert.strictEqual(listB.bookmarks[0].id, bB.id);

      // User A CANNOT read User B's bookmark directly
      const crossRead = await libraryService.getBookmark(bB.id, userA);
      assert.strictEqual(crossRead, null, 'User A must not read User B bookmark');

      // User A CANNOT delete User B's bookmark
      await assert.rejects(
        async () => {
          await libraryService.removeBookmark(bB.id, userA);
        },
        /Unauthorized.*cannot delete another user's private bookmark/
      );
    });
  });

  describe('3. Duplicate Prevention & User-Scoped Uniqueness', () => {
    it('should REJECT duplicate bookmarks by the same user for the same content', async () => {
      await libraryService.createBookmark(
        { contentType: 'quran', contentReference: '2:255' },
        userA
      );

      // Attempting to bookmark the exact same item again must fail
      await assert.rejects(
        async () => {
          await libraryService.createBookmark(
            { contentType: 'quran', contentReference: '2:255' },
            userA
          );
        },
        /Duplicate Bookmark Violation/
      );
    });

    it('should allow two different users to bookmark the same canonical item independently', async () => {
      const bA = await libraryService.createBookmark(
        { contentType: 'quran', contentReference: '2:255' },
        userA
      );
      const bB = await libraryService.createBookmark(
        { contentType: 'quran', contentReference: '2:255' },
        userB
      );

      assert.strictEqual(bA.contentReference, '2:255');
      assert.strictEqual(bB.contentReference, '2:255');
      assert.notStrictEqual(bA.id, bB.id);
      assert.strictEqual(bA.userId, userA.id);
      assert.strictEqual(bB.userId, userB.id);
    });
  });

  describe('4. Deletion & Unsaving Integrity', () => {
    it('should cleanly remove a bookmark without altering canonical data', async () => {
      const bookmark = await libraryService.createBookmark(
        { contentType: 'hadith', contentReference: 'muslim:93' },
        userA
      );

      assert.strictEqual(await libraryService.isBookmarked('hadith', 'muslim:93', userA), true);

      // Remove bookmark
      const removed = await libraryService.removeBookmark(bookmark.id, userA);
      assert.strictEqual(removed, true);

      // State check
      assert.strictEqual(await libraryService.isBookmarked('hadith', 'muslim:93', userA), false);
      const list = await libraryService.listUserBookmarks(userA);
      assert.strictEqual(list.total, 0);

      // Can be saved again after unsaving
      const reSaved = await libraryService.createBookmark(
        { contentType: 'hadith', contentReference: 'muslim:93' },
        userA
      );
      assert.ok(reSaved.id);
    });
  });

  describe('5. Article Publication Safety Gate', () => {
    it('CRITICAL: should REJECT bookmarking a draft or unpublished article', async () => {
      // Create draft article
      const { article } = await articleService.createArticleDraft(
        {
          slug: 'private-draft-study',
          title: 'Unpublished Draft Article',
          bodyMarkdown: 'Draft content undergoing research...',
          categoryId: '00000000-0000-0000-0001-000000000001'
        },
        userA
      );

      // Attempting to bookmark an unpublished draft must be blocked
      await assert.rejects(
        async () => {
          await libraryService.createBookmark(
            { contentType: 'article', contentReference: article.slug },
            userB
          );
        },
        /Article Publication Violation.*Only published articles can be saved/
      );
    });

    it('should allow bookmarking an APPROVED and PUBLISHED article', async () => {
      // 1. Create draft
      const { article, revision } = await articleService.createArticleDraft(
        {
          slug: 'published-aqeedah-guide',
          title: 'Sunni Creed Essentials',
          bodyMarkdown: 'Classical Ahl al-Sunnah principles...',
          categoryId: '00000000-0000-0000-0001-000000000001'
        },
        userA
      );

      // 2. Submit for review
      await articleService.submitForReview(article.id, revision.id, userA);

      // 3. Assign scholar
      const review = await articleService.assignScholarReviewer(article.id, revision.id, scholar.id, editor);

      // 4. Scholar approves
      await articleService.submitReviewDecision(review.id, 'APPROVED', 'Sound methodology.', scholar);

      // 5. Editor publishes
      await articleService.publishArticle(article.id, revision.id, editor);

      // 6. User B bookmarks the published article
      const bookmark = await libraryService.createBookmark(
        { contentType: 'article', contentReference: article.slug },
        userB
      );

      assert.strictEqual(bookmark.contentReference, 'published-aqeedah-guide');

      // 7. Resolve bookmark content
      const resolved = await libraryService.resolveBookmarkContent(bookmark, userB);
      assert.strictEqual(resolved.isAvailable, true);
      assert.strictEqual(resolved.title, 'Sunni Creed Essentials');
      assert.strictEqual(resolved.canonicalUrl, '/articles/published-aqeedah-guide');
    });

    it('CRITICAL: if a published article is unpublished, bookmark resolution MUST NOT leak content', async () => {
      // 1. Create and publish an article
      const { article, revision } = await articleService.createArticleDraft(
        {
          slug: 'temporarily-published-article',
          title: 'Article to be Retracted',
          bodyMarkdown: 'Confidential scholarly critique body...',
          categoryId: '00000000-0000-0000-0001-000000000001'
        },
        userA
      );
      await articleService.submitForReview(article.id, revision.id, userA);
      const rev = await articleService.assignScholarReviewer(article.id, revision.id, scholar.id, editor);
      await articleService.submitReviewDecision(rev.id, 'APPROVED', 'Approved.', scholar);
      await articleService.publishArticle(article.id, revision.id, editor);

      // 2. User B bookmarks the published article
      const bookmark = await libraryService.createBookmark(
        { contentType: 'article', contentReference: article.slug },
        userB
      );

      // 3. Article is unpublished / retracted (status changed away from PUBLISHED)
      article.status = 'WITHDRAWN';

      // 4. User B attempts to resolve the bookmark
      const resolved = await libraryService.resolveBookmarkContent(bookmark, userB);
      assert.strictEqual(resolved.isAvailable, false);
      assert.strictEqual(resolved.title, '[Article Unavailable]');
      assert.ok(resolved.statusMessage?.includes('unpublished or undergoing scholarly revision'));
      // Confirm no draft body was leaked
      assert.strictEqual((resolved as any).bodyMarkdown, undefined);
    });
  });

  describe('6. Canonical Scripture Resolution', () => {
    it('should resolve Quran bookmark with canonical surah title and deep link', async () => {
      const bookmark = await libraryService.createBookmark(
        { contentType: 'quran', contentReference: '2:255' },
        userA
      );

      const resolved = await libraryService.resolveBookmarkContent(bookmark, userA);
      assert.strictEqual(resolved.isAvailable, true);
      assert.strictEqual(resolved.badgeLabel, 'Holy Quran');
      assert.strictEqual(resolved.canonicalUrl, '/quran/2#ayah-255');
      assert.ok(resolved.title.includes('Al-Baqara'));
    });

    it('should resolve Hadith bookmark with collection title and deep link', async () => {
      const bookmark = await libraryService.createBookmark(
        { contentType: 'hadith', contentReference: 'bukhari:1' },
        userA
      );

      const resolved = await libraryService.resolveBookmarkContent(bookmark, userA);
      assert.strictEqual(resolved.isAvailable, true);
      assert.strictEqual(resolved.badgeLabel, 'Hadith');
      assert.strictEqual(resolved.canonicalUrl, '/hadith/bukhari?hadith=1');
      assert.ok(resolved.title.includes('Bukhari'));
    });

    it('should resolve Dua bookmark with category title and deep link', async () => {
      const bookmark = await libraryService.createBookmark(
        { contentType: 'dua', contentReference: 'when-waking-up:1' },
        userA
      );

      const resolved = await libraryService.resolveBookmarkContent(bookmark, userA);
      assert.strictEqual(resolved.isAvailable, true);
      assert.strictEqual(resolved.badgeLabel, 'Duas & Adhkar');
      assert.strictEqual(resolved.canonicalUrl, '/duas/when-waking-up');
    });
  });
});
