/**
 * @file books-service.test.ts
 * @package @islamic/database
 * @description Integration and unit tests for Milestone M4.3 — Digital Islamic Books database service.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BooksService, CANONICAL_BOOKS } from '../src/books/books-service.js';
import { LibraryService } from '../src/library/library-service.js';
import type { ActorContext } from '../src/articles/article-service.js';

describe('Milestone M4.3 — Digital Islamic Books Database Service', () => {
  const adminActor: ActorContext = {
    id: 'admin-1',
    roles: ['super_admin']
  };

  const userActor: ActorContext = {
    id: 'user-1',
    roles: ['user']
  };

  const service = new BooksService();

  describe('1. Canonical Books Catalog Verification', () => {
    it('should seed exactly 4 canonical classical books', () => {
      assert.strictEqual(CANONICAL_BOOKS.length, 4);
      const ids = CANONICAL_BOOKS.map((b) => b.id);
      assert.ok(ids.includes('riyad-al-salihin'));
      assert.ok(ids.includes('al-arba-in-al-nawawiyyah'));
      assert.ok(ids.includes('al-aqeedah-al-wasitiyyah'));
      assert.ok(ids.includes('bidayat-al-mujtahid'));
    });

    it('all canonical books must have public domain licensing and verified status', () => {
      for (const b of CANONICAL_BOOKS) {
        assert.strictEqual(b.licenseStatus, 'verified_permissible');
        assert.strictEqual(b.reviewStatus, 'approved');
        assert.strictEqual(b.publicationStatus, 'published');
        assert.ok(b.attributionRequirement && b.attributionRequirement.length > 0);
        assert.ok(b.sourceUrl && b.sourceUrl.length > 0);
        assert.ok(b.authorDeathYearAh && b.authorDeathYearAh < 1000);
      }
    });

    it('initial book availability should be metadata_only (no text fabricated)', async () => {
      const avail = await service.verifyBookAvailability('riyad-al-salihin');
      assert.strictEqual(avail.available, true);
      assert.strictEqual(avail.contentAvailability, 'metadata_only');
      assert.ok(avail.message.includes('pending verified digital edition ingestion'));
    });
  });

  describe('2. Book Retrieval & Filtering', () => {
    it('should list all active public books', async () => {
      const books = await service.listBooks();
      assert.ok(books.length >= 4);
    });

    it('should filter books by category', async () => {
      const hadithBooks = await service.listBooks({ category: 'hadith_literature' });
      assert.ok(hadithBooks.some((b) => b.id === 'al-arba-in-al-nawawiyyah'));
      assert.ok(!hadithBooks.some((b) => b.id === 'bidayat-al-mujtahid'));

      const fiqhBooks = await service.listBooks({ category: 'fiqh' });
      assert.ok(fiqhBooks.some((b) => b.id === 'bidayat-al-mujtahid'));
    });

    it('should retrieve book by ID or slug', async () => {
      const byId = await service.getBook('riyad-al-salihin');
      assert.ok(byId);
      assert.strictEqual(byId.id, 'riyad-al-salihin');

      const bySlug = await service.getBook('al-aqeedah-al-wasitiyyah');
      assert.ok(bySlug);
      assert.strictEqual(bySlug.slug, 'al-aqeedah-al-wasitiyyah');
    });

    it('should return null for nonexistent book', async () => {
      const res = await service.getBook('nonexistent-book');
      assert.strictEqual(res, null);
    });
  });

  describe('3. Volumes, Sections & Content', () => {
    it('should retrieve volumes for multi-volume book (Bidayat al-Mujtahid)', async () => {
      const vols = await service.getVolumes('bidayat-al-mujtahid');
      assert.strictEqual(vols.length, 2);
      assert.strictEqual(vols[0].volumeNumber, 1);
      assert.strictEqual(vols[1].volumeNumber, 2);
    });

    it('should retrieve sections (TOC) for a book volume', async () => {
      const sections = await service.getSections('riyad-al-salihin', 1);
      assert.ok(sections.length >= 2);
      assert.strictEqual(sections[0].sectionNumber, 1);
    });

    it('should retrieve content at a specific volume and section location', async () => {
      const loc = await service.getContentAtLocation('riyad-al-salihin', 1, 1);
      assert.ok(loc.section);
      assert.strictEqual(loc.section.sectionNumber, 1);
      assert.ok(loc.contents.length > 0);
      assert.strictEqual(loc.contents[0].contentAvailability, 'metadata_only');
    });
  });

  describe('4. Book-Local Search', () => {
    it('should find matching section titles in search', async () => {
      const res = await service.searchBook('riyad-al-salihin', 'مقدمة');
      assert.ok(res.length > 0);
      assert.strictEqual(res[0].bookId, 'riyad-al-salihin');
      assert.ok(res[0].sectionTitle.includes('مقدمة'));
    });

    it('should return empty array for non-matching query', async () => {
      const res = await service.searchBook('riyad-al-salihin', 'NONEXISTENT_QUERY_XYZ');
      assert.strictEqual(res.length, 0);
    });
  });

  describe('5. User Reading Progress & Ownership Isolation', () => {
    it('should save and retrieve reading progress for a user', async () => {
      const saved = await service.saveReadingProgress('user-100', {
        bookId: 'riyad-al-salihin',
        volumeNumber: 1,
        sectionId: 'sec-riyad-al-salihin-1-1',
        progressPercentage: 25.0
      });
      assert.strictEqual(saved.progressPercentage, 25.0);
      assert.strictEqual(saved.userId, 'user-100');

      const fetched = await service.getReadingProgress('user-100', 'riyad-al-salihin');
      assert.ok(fetched);
      assert.strictEqual(fetched.progressPercentage, 25.0);
    });

    it('should enforce user isolation — user B cannot see user A progress', async () => {
      await service.saveReadingProgress('user-A', {
        bookId: 'riyad-al-salihin',
        progressPercentage: 50.0
      });

      const userBProgress = await service.getReadingProgress('user-B', 'riyad-al-salihin');
      assert.strictEqual(userBProgress, null);
    });

    it('should list all progress records for a user', async () => {
      await service.saveReadingProgress('user-multi', {
        bookId: 'riyad-al-salihin',
        progressPercentage: 10.0
      });
      await service.saveReadingProgress('user-multi', {
        bookId: 'al-arba-in-al-nawawiyyah',
        progressPercentage: 80.0
      });

      const list = await service.listUserProgress('user-multi');
      assert.strictEqual(list.length, 2);
    });
  });

  describe('6. Administrative Operations & Authorization', () => {
    it('should allow platform admin to register a new book', async () => {
      const newBook = await service.registerBook(
        {
          id: 'test-book',
          slug: 'test-book',
          titleArabic: 'كتاب تجريبي',
          titleEnglish: 'Test Book',
          titleUrdu: 'تجرباتی کتاب',
          authorNameArabic: 'مؤلف تجريبي',
          authorNameEnglish: 'Test Author',
          authorNameUrdu: 'تجرباتی مصنف',
          category: 'general',
          licenseType: 'Public Domain',
          licenseStatus: 'verified_permissible',
          reviewStatus: 'approved',
          publicationStatus: 'published'
        },
        adminActor
      );
      assert.strictEqual(newBook.id, 'test-book');

      const retrieved = await service.getBook('test-book');
      assert.ok(retrieved);
    });

    it('should forbid non-admin from registering a book', async () => {
      await assert.rejects(
        async () => {
          await service.registerBook(
            {
              id: 'unauthorized-book',
              slug: 'unauthorized-book',
              titleArabic: 'ت',
              titleEnglish: 'T',
              titleUrdu: 'ٹ',
              authorNameArabic: 'A',
              authorNameEnglish: 'A',
              authorNameUrdu: 'A',
              category: 'general'
            },
            userActor
          );
        },
        (err: Error) => err.message.includes('Authorization Violation')
      );
    });

    it('should allow admin to quarantine a book and hide it from public listing', async () => {
      await service.quarantineBook('test-book', 'Copyright infringement notification', adminActor);

      const retrieved = await service.getBook('test-book');
      assert.strictEqual(retrieved, null); // Public query returns null because it is quarantined
    });
  });

  describe('7. Library Service Integration for Book Bookmarks', () => {
    it('should allow user to save a book bookmark and resolve it', async () => {
      const libService = new LibraryService();
      const bookmark = await libService.createBookmark(
        {
          contentType: 'book',
          contentReference: 'riyad-al-salihin:1:1'
        },
        userActor
      );

      assert.strictEqual(bookmark.contentType, 'book');
      assert.strictEqual(bookmark.bookId, 'riyad-al-salihin');

      const resolved = await libService.resolveBookmarkContent(bookmark, userActor);
      assert.strictEqual(resolved.isAvailable, true);
      assert.strictEqual(resolved.canonicalUrl, '/books/riyad-al-salihin');
      assert.strictEqual(resolved.badgeLabel, 'Digital Book');
    });
  });
});
