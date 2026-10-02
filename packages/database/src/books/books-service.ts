/**
 * @file books-service.ts
 * @package @islamic/database
 * @description Service layer for Digital Islamic Books e-Reader.
 * Provides dual-mode (Supabase + In-Memory) support with structured book hierarchy,
 * strict licensing/provenance governance, reading progress, and publication gating.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 *
 * CONTENT SAFETY:
 * - Canonical works are documented Public Domain classical Islamic heritage.
 * - Content availability defaults to 'metadata_only' pending verified digital edition ingestion.
 * - Text is NEVER fabricated or AI-synthesized.
 * - Work presence does NOT constitute platform endorsement of every scholarly opinion.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  Book,
  BookEdition,
  BookVolume,
  BookSection,
  BookContent,
  UserReadingProgress,
  BookProvenanceResult,
  BookSearchResult,
  CreateBookInput,
  CreateBookEditionInput,
  CreateBookSectionInput,
  CreateBookContentInput,
  SaveReadingProgressInput,
  validateBookInput,
  validateBookEditionInput,
  validateBookSectionInput,
  validateBookContentInput,
  validateReadingProgressInput,
  isBookPublic,
  isEditionPublic,
  isContentPublic,
  buildBookProvenanceResult
} from '@islamic/islamic-engine';
import type { ActorContext } from '../articles/article-service.js';

// ============================================================================
// Canonical Books Catalog — Classical Islamic Heritage (Public Domain)
// ============================================================================

export const CANONICAL_BOOKS: Book[] = [
  {
    id: 'riyad-al-salihin',
    slug: 'riyad-al-salihin',
    titleArabic: 'رياض الصالحين من كلام سيد المرسلين',
    titleEnglish: 'Riyad al-Salihin (The Meadows of the Righteous)',
    titleUrdu: 'ریاض الصالحین',
    authorNameArabic: 'أبو زكريا يحيى بن شرف النووي',
    authorNameEnglish: 'Imam Abu Zakariyya Yahya ibn Sharaf al-Nawawi',
    authorNameUrdu: 'امام ابو زکریا یحییٰ بن شرف النووی',
    authorDeathYearAh: 676,
    authorDeathYearCe: 1277,
    category: 'adab_zuhd',
    originalLanguage: 'ar',
    volumeCount: 1,
    descriptionArabic:
      'كتاب جامع في الأدب والزهد والرقائق والأحكام، ألّفه الإمام النووي ورتّبه على أبواب في السلوك والعبادات استناداً إلى الأحاديث النبوية الصحيحة.',
    descriptionEnglish:
      'A widely referenced classical compilation of authentic Hadith covering ethics, manners, worship, and spiritual cultivation compiled by Imam al-Nawawi (d. 676 AH / 1277 CE). The original Arabic text is in the public domain worldwide.',
    descriptionUrdu:
      'امام نووی (م ۶۷۶ ھ) کا معروف مجموعہ احادیث جو اخلاق و آداب، زہد، اور عبادات پر مشتمل ہے۔ دنیا بھر میں سب سے زیادہ پڑھی جانے والی کتب میں شامل ہے۔',
    licenseType: 'Public Domain (Classical Islamic Heritage, 676 AH / 1277 CE)',
    licenseStatus: 'verified_permissible',
    sourceUrl: 'https://shamela.ws/book/10545',
    provenanceNotes:
      'Classical Arabic text is in the public domain worldwide (author died over 740 years ago). Specific modern annotated or translated editions are tracked separately.',
    attributionRequirement:
      'Riyad al-Salihin by Imam Yahya ibn Sharaf al-Nawawi (d. 676 AH / 1277 CE). Classical Public Domain heritage.',
    isActive: true,
    reviewStatus: 'approved',
    publicationStatus: 'published',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z'
  },
  {
    id: 'al-arba-in-al-nawawiyyah',
    slug: 'al-arba-in-al-nawawiyyah',
    titleArabic: 'الأربعون النووية',
    titleEnglish: "Al-Arba'in al-Nawawiyyah (The Forty Hadith of Al-Nawawi)",
    titleUrdu: 'الاربعین النوویۃ (چالیس احادیث)',
    authorNameArabic: 'أبو زكريا يحيى بن شرف النووي',
    authorNameEnglish: 'Imam Abu Zakariyya Yahya ibn Sharaf al-Nawawi',
    authorNameUrdu: 'امام ابو زکریا یحییٰ بن شرف النووی',
    authorDeathYearAh: 676,
    authorDeathYearCe: 1277,
    category: 'hadith_literature',
    originalLanguage: 'ar',
    volumeCount: 1,
    descriptionArabic:
      'مختصر جليل يضم اثنين وأربعين حديثاً نبوياً تدور عليها أصول وقواعد الدين الإسلامي، ألّفه الإمام النووي رحمه الله.',
    descriptionEnglish:
      'The foundational collection of forty-two essential prophetic narrations encompassing the comprehensive principles of Islam, compiled by Imam al-Nawawi.',
    descriptionUrdu:
      'امام نووی کا منتخب ۴۲ جامع احادیث کا مجموعہ جو اسلامی تعلیمات اور شریعت کے بنیادی اصولوں کا احاطہ کرتا ہے۔',
    licenseType: 'Public Domain (Classical Islamic Heritage, 676 AH / 1277 CE)',
    licenseStatus: 'verified_permissible',
    sourceUrl: 'https://shamela.ws/book/10546',
    provenanceNotes:
      'Classical Arabic original in public domain worldwide. Translations and commentary editions tracked independently.',
    attributionRequirement:
      "Al-Arba'in al-Nawawiyyah by Imam Yahya ibn Sharaf al-Nawawi (d. 676 AH / 1277 CE).",
    isActive: true,
    reviewStatus: 'approved',
    publicationStatus: 'published',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z'
  },
  {
    id: 'al-aqeedah-al-wasitiyyah',
    slug: 'al-aqeedah-al-wasitiyyah',
    titleArabic: 'العقيدة الواسطية',
    titleEnglish: 'Al-Aqeedah Al-Wasitiyyah',
    titleUrdu: 'العقیدہ الواسطیہ',
    authorNameArabic: 'تقي الدين أحمد بن عبد الحليم بن تيمية',
    authorNameEnglish: 'Shaykh al-Islam Ibn Taymiyyah',
    authorNameUrdu: 'شیخ الاسلام ابن تیمیہ',
    authorDeathYearAh: 728,
    authorDeathYearCe: 1328,
    category: 'aqeedah',
    originalLanguage: 'ar',
    volumeCount: 1,
    descriptionArabic:
      'رسالة وجيزة محررة في عقيدة أهل السنة والجماعة، كُتبت جواباً لقاضي واسط، تبرز منهج السلف الصالح في توحيد الأسماء والصفات.',
    descriptionEnglish:
      'A concise classical treatise on orthodox Sunni creed, affirming the divine attributes without distortion, denial, anthropomorphism, or comparison. Classical text in public domain.',
    descriptionUrdu:
      'اہل سنت والجماعت کے عقائد پر شیخ الاسلام ابن تیمیہ (م ۷۲۸ ھ) کا مستند و معروف رسالہ جو اسماء و صفات باری تعالیٰ کے فہم سلف کو واضح کرتا ہے۔',
    licenseType: 'Public Domain (Classical Islamic Heritage, 728 AH / 1328 CE)',
    licenseStatus: 'verified_permissible',
    sourceUrl: 'https://shamela.ws/book/10547',
    provenanceNotes:
      'Public domain worldwide (author died 1328 CE). Translations tracked separately.',
    attributionRequirement:
      'Al-Aqeedah al-Wasitiyyah by Shaykh al-Islam Ibn Taymiyyah (d. 728 AH / 1328 CE).',
    isActive: true,
    reviewStatus: 'approved',
    publicationStatus: 'published',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z'
  },
  {
    id: 'bidayat-al-mujtahid',
    slug: 'bidayat-al-mujtahid',
    titleArabic: 'بداية المجتهد ونهاية المقتصد',
    titleEnglish: "Bidayat al-Mujtahid wa Nihayat al-Muqtasid (The Jurist's Primer)",
    titleUrdu: 'ہدایۃ المجتہد ونہایۃ المقتصد',
    authorNameArabic: 'أبو الوليد محمد بن أحمد بن رشد القرطبي',
    authorNameEnglish: 'Ibn Rushd al-Hafid (Averroes)',
    authorNameUrdu: 'ابن رشد الحفید',
    authorDeathYearAh: 595,
    authorDeathYearCe: 1198,
    category: 'fiqh',
    originalLanguage: 'ar',
    volumeCount: 2,
    descriptionArabic:
      'كتاب في الفقه المقارن يوضح أسباب اختلاف الفقهاء بين المذاهب الإسلامية الأربعة المعتمدة بالأدلة الشرعية المقارنة.',
    descriptionEnglish:
      "A renowned classical compendium of comparative Islamic jurisprudence analyzing the reasons for differences among the classical legal schools (Madhhabs) with evidence.",
    descriptionUrdu:
      'مقارن فقہ (تقابلی فقہی مذاہب) کی عظیم کتاب جس میں فقہاء کے اختلافی دلائل کا معروضی جائزہ پیش کیا گیا ہے۔',
    licenseType: 'Public Domain (Classical Islamic Heritage, 595 AH / 1198 CE)',
    licenseStatus: 'verified_permissible',
    sourceUrl: 'https://shamela.ws/book/10548',
    provenanceNotes:
      'Public domain worldwide (author died 1198 CE). Editions and translations tracked independently.',
    attributionRequirement:
      'Bidayat al-Mujtahid by Ibn Rushd al-Qurtubi (d. 595 AH / 1198 CE).',
    isActive: true,
    reviewStatus: 'approved',
    publicationStatus: 'published',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z'
  }
];

export interface BookAuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  reason?: string;
  createdAt: string;
}

export class BooksService {
  private supabaseClient: SupabaseClient | null = null;
  private booksMap = new Map<string, Book>();
  private editionsMap = new Map<string, BookEdition>();
  private volumesMap = new Map<string, BookVolume>();
  private sectionsMap = new Map<string, BookSection>();
  private contentsMap = new Map<string, BookContent>();
  private progressMap = new Map<string, UserReadingProgress>(); // key: `${userId}:${bookId}`
  private auditLogs: BookAuditLogEntry[] = [];

  constructor(options?: { supabaseClient?: SupabaseClient }) {
    this.supabaseClient = options?.supabaseClient || null;
    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    for (const book of CANONICAL_BOOKS) {
      this.booksMap.set(book.id, { ...book });

      // Seed a canonical public domain Arabic edition for each book
      const edition: BookEdition = {
        id: `ed-${book.id}-ar-classical`,
        bookId: book.id,
        editionIdentifier: `${book.id}-ar-classical`,
        editionTitle: `${book.titleArabic} (النص الأصلي المحقق)`,
        languageCode: 'ar',
        volumeCount: book.volumeCount,
        format: 'structured_text',
        licenseType: book.licenseType,
        licenseStatus: 'verified_permissible',
        attributionRequirement: book.attributionRequirement || '',
        provenanceNotes: book.provenanceNotes,
        sourceArchiveUrl: book.sourceUrl,
        isActive: true,
        reviewStatus: 'approved',
        publicationStatus: 'published',
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z'
      };
      this.editionsMap.set(edition.id, edition);

      // Seed representative volumes
      for (let vol = 1; vol <= book.volumeCount; vol++) {
        const volume: BookVolume = {
          id: `vol-${book.id}-${vol}`,
          bookId: book.id,
          editionId: edition.id,
          volumeNumber: vol,
          titleArabic: `المجلد ${vol}`,
          titleEnglish: `Volume ${vol}`,
          titleUrdu: `جلد ${vol}`,
          createdAt: '2026-09-24T00:00:00.000Z'
        };
        this.volumesMap.set(volume.id, volume);
      }

      // Seed foundational sections (TOC)
      const section1: BookSection = {
        id: `sec-${book.id}-1-1`,
        bookId: book.id,
        editionId: edition.id,
        volumeNumber: 1,
        sectionNumber: 1,
        titleArabic: 'مقدمة المؤلف',
        titleEnglish: "Author's Introduction",
        titleUrdu: 'مقدمۃ المصنف',
        chapterNumber: 1,
        startPage: 1,
        endPage: 10,
        orderIndex: 1,
        createdAt: '2026-09-24T00:00:00.000Z'
      };
      const section2: BookSection = {
        id: `sec-${book.id}-1-2`,
        bookId: book.id,
        editionId: edition.id,
        volumeNumber: 1,
        sectionNumber: 2,
        titleArabic: 'الباب الأول',
        titleEnglish: 'Chapter 1',
        titleUrdu: 'پہلا باب',
        chapterNumber: 2,
        startPage: 11,
        endPage: 25,
        orderIndex: 2,
        createdAt: '2026-09-24T00:00:00.000Z'
      };
      this.sectionsMap.set(section1.id, section1);
      this.sectionsMap.set(section2.id, section2);

      // Content items default to metadata_only (no text fabricated!)
      const content1: BookContent = {
        id: `cnt-${book.id}-1-1`,
        sectionId: section1.id,
        bookId: book.id,
        editionId: edition.id,
        volumeNumber: 1,
        pageNumber: 1,
        paragraphIndex: 1,
        contentType: 'paragraph',
        textAr: null,
        textEn: null,
        textUr: null,
        contentAvailability: 'metadata_only',
        licenseStatus: 'verified_permissible',
        publicationStatus: 'published',
        versionNumber: 1,
        isCurrent: true,
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z'
      };
      this.contentsMap.set(content1.id, content1);
    }
  }

  // ==========================================================================
  // Book Queries
  // ==========================================================================

  public async listBooks(filter?: {
    category?: string;
    language?: string;
    query?: string;
  }): Promise<Book[]> {
    if (this.supabaseClient) {
      let queryBuilder = this.supabaseClient
        .from('books')
        .select('*')
        .eq('is_active', true)
        .eq('license_status', 'verified_permissible')
        .eq('review_status', 'approved')
        .eq('publication_status', 'published');

      if (filter?.category && filter.category !== 'all') {
        queryBuilder = queryBuilder.eq('category', filter.category);
      }
      if (filter?.language) {
        queryBuilder = queryBuilder.eq('original_language', filter.language);
      }

      const { data, error } = await queryBuilder.order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(this.mapBookRow);
      }
    }

    let list = Array.from(this.booksMap.values()).filter(isBookPublic);

    if (filter?.category && filter.category !== 'all') {
      list = list.filter((b) => b.category === filter.category);
    }
    if (filter?.language) {
      list = list.filter((b) => b.originalLanguage === filter.language);
    }
    if (filter?.query && filter.query.trim().length > 0) {
      const q = filter.query.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.titleEnglish.toLowerCase().includes(q) ||
          b.titleArabic.toLowerCase().includes(q) ||
          b.titleUrdu.toLowerCase().includes(q) ||
          b.authorNameEnglish.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public async getBook(idOrSlug: string): Promise<Book | null> {
    if (!idOrSlug) return null;
    const key = idOrSlug.trim().toLowerCase();

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('books')
        .select('*')
        .or(`id.eq.${key},slug.eq.${key}`)
        .eq('is_active', true)
        .eq('license_status', 'verified_permissible')
        .eq('review_status', 'approved')
        .eq('publication_status', 'published')
        .maybeSingle();

      if (!error && data) return this.mapBookRow(data);
    }

    for (const b of this.booksMap.values()) {
      if ((b.id === key || b.slug === key) && isBookPublic(b)) {
        return b;
      }
    }
    return null;
  }

  // ==========================================================================
  // Edition Queries
  // ==========================================================================

  public async getEditions(bookId: string): Promise<BookEdition[]> {
    if (!bookId) return [];

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('book_editions')
        .select('*')
        .eq('book_id', bookId)
        .eq('is_active', true)
        .eq('license_status', 'verified_permissible')
        .eq('review_status', 'approved')
        .eq('publication_status', 'published')
        .order('created_at', { ascending: true });

      if (!error && data) return data.map(this.mapEditionRow);
    }

    return Array.from(this.editionsMap.values()).filter(
      (e) => e.bookId === bookId && isEditionPublic(e)
    );
  }

  public async getEdition(editionId: string): Promise<BookEdition | null> {
    if (!editionId) return null;

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('book_editions')
        .select('*')
        .eq('id', editionId)
        .eq('is_active', true)
        .eq('license_status', 'verified_permissible')
        .eq('review_status', 'approved')
        .eq('publication_status', 'published')
        .maybeSingle();

      if (!error && data) return this.mapEditionRow(data);
    }

    const edition = this.editionsMap.get(editionId);
    return edition && isEditionPublic(edition) ? edition : null;
  }

  // ==========================================================================
  // Volume Queries
  // ==========================================================================

  public async getVolumes(bookId: string, editionId?: string): Promise<BookVolume[]> {
    if (!bookId) return [];

    if (this.supabaseClient) {
      let q = this.supabaseClient
        .from('book_volumes')
        .select('*')
        .eq('book_id', bookId);
      if (editionId) q = q.eq('edition_id', editionId);
      const { data, error } = await q.order('volume_number', { ascending: true });
      if (!error && data) return data.map(this.mapVolumeRow);
    }

    return Array.from(this.volumesMap.values())
      .filter((v) => v.bookId === bookId && (!editionId || v.editionId === editionId))
      .sort((a, b) => a.volumeNumber - b.volumeNumber);
  }

  // ==========================================================================
  // Section / TOC Queries
  // ==========================================================================

  public async getSections(
    bookId: string,
    volumeNumber: number = 1,
    editionId?: string
  ): Promise<BookSection[]> {
    if (!bookId) return [];

    if (this.supabaseClient) {
      let q = this.supabaseClient
        .from('book_sections')
        .select('*')
        .eq('book_id', bookId)
        .eq('volume_number', volumeNumber);
      if (editionId) q = q.eq('edition_id', editionId);
      const { data, error } = await q.order('order_index', { ascending: true });
      if (!error && data) return data.map(this.mapSectionRow);
    }

    return Array.from(this.sectionsMap.values())
      .filter(
        (s) =>
          s.bookId === bookId &&
          s.volumeNumber === volumeNumber &&
          (!editionId || s.editionId === editionId)
      )
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public async getSection(sectionId: string): Promise<BookSection | null> {
    if (!sectionId) return null;

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('book_sections')
        .select('*')
        .eq('id', sectionId)
        .maybeSingle();

      if (!error && data) return this.mapSectionRow(data);
    }

    return this.sectionsMap.get(sectionId) || null;
  }

  // ==========================================================================
  // Content Queries
  // ==========================================================================

  public async getContentForSection(sectionId: string): Promise<BookContent[]> {
    if (!sectionId) return [];

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('book_contents')
        .select('*')
        .eq('section_id', sectionId)
        .eq('is_current', true)
        .eq('publication_status', 'published')
        .eq('license_status', 'verified_permissible')
        .order('paragraph_index', { ascending: true });

      if (!error && data) return data.map(this.mapContentRow);
    }

    return Array.from(this.contentsMap.values())
      .filter((c) => c.sectionId === sectionId && isContentPublic(c))
      .sort((a, b) => a.paragraphIndex - b.paragraphIndex);
  }

  public async getContentAtLocation(
    bookId: string,
    volumeNumber: number,
    sectionNumber: number
  ): Promise<{ section: BookSection | null; contents: BookContent[] }> {
    const sections = await this.getSections(bookId, volumeNumber);
    const section = sections.find((s) => s.sectionNumber === sectionNumber) || null;
    if (!section) return { section: null, contents: [] };

    const contents = await this.getContentForSection(section.id);
    return { section, contents };
  }

  // ==========================================================================
  // Book Search (Book-Local)
  // ==========================================================================

  public async searchBook(
    bookId: string,
    query: string,
    options?: { volume?: number; limit?: number }
  ): Promise<BookSearchResult[]> {
    if (!bookId || !query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();
    const limit = options?.limit || 20;

    const book = await this.getBook(bookId);
    if (!book) return [];

    const results: BookSearchResult[] = [];

    // Search through sections titles and available content
    const sections = await this.getSections(bookId, options?.volume || 1);
    for (const sec of sections) {
      const matchedInAr = sec.titleArabic.toLowerCase().includes(q);
      const matchedInUr = sec.titleUrdu ? sec.titleUrdu.toLowerCase().includes(q) : false;
      const matchedInEn = sec.titleEnglish ? sec.titleEnglish.toLowerCase().includes(q) : false;

      if (matchedInAr || matchedInUr || matchedInEn) {
        const secTitle = matchedInAr
          ? sec.titleArabic
          : matchedInUr
          ? (sec.titleUrdu || sec.titleArabic)
          : (sec.titleEnglish || sec.titleArabic);

        results.push({
          bookId: book.id,
          bookSlug: book.slug,
          bookTitle: book.titleEnglish,
          authorName: book.authorNameEnglish,
          volumeNumber: sec.volumeNumber,
          sectionId: sec.id,
          sectionTitle: secTitle,
          pageNumber: sec.startPage,
          snippet: `Found in section title: ${secTitle}`,
          matchedLanguage: matchedInAr ? 'ar' : matchedInUr ? 'ur' : 'en'
        });
      }

      const defaultSecTitle = sec.titleEnglish || sec.titleArabic;
      const contents = await this.getContentForSection(sec.id);
      for (const cnt of contents) {
        if (cnt.textAr && cnt.textAr.toLowerCase().includes(q)) {
          results.push({
            bookId: book.id,
            bookSlug: book.slug,
            bookTitle: book.titleEnglish,
            authorName: book.authorNameEnglish,
            volumeNumber: cnt.volumeNumber,
            sectionId: sec.id,
            sectionTitle: defaultSecTitle,
            pageNumber: cnt.pageNumber,
            snippet: this.extractSnippet(cnt.textAr, q),
            matchedLanguage: 'ar'
          });
        } else if (cnt.textEn && cnt.textEn.toLowerCase().includes(q)) {
          results.push({
            bookId: book.id,
            bookSlug: book.slug,
            bookTitle: book.titleEnglish,
            authorName: book.authorNameEnglish,
            volumeNumber: cnt.volumeNumber,
            sectionId: sec.id,
            sectionTitle: defaultSecTitle,
            pageNumber: cnt.pageNumber,
            snippet: this.extractSnippet(cnt.textEn, q),
            matchedLanguage: 'en'
          });
        }
        if (results.length >= limit) break;
      }
      if (results.length >= limit) break;
    }

    return results;
  }

  private extractSnippet(text: string, query: string): string {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text.substring(0, 150);
    const start = Math.max(0, idx - 60);
    const end = Math.min(text.length, idx + query.length + 60);
    return `${start > 0 ? '…' : ''}${text.substring(start, end)}${end < text.length ? '…' : ''}`;
  }

  // ==========================================================================
  // Provenance & Availability Verification
  // ==========================================================================

  public async getProvenance(
    bookId: string,
    editionId?: string
  ): Promise<BookProvenanceResult | null> {
    const book = await this.getBook(bookId);
    if (!book) return null;

    let edition: BookEdition | undefined;
    if (editionId) {
      edition = (await this.getEdition(editionId)) || undefined;
    }

    return buildBookProvenanceResult(book, edition);
  }

  public async verifyBookAvailability(bookId: string): Promise<{
    available: boolean;
    contentAvailability: 'full_text' | 'metadata_only' | 'unavailable';
    message: string;
  }> {
    const book = await this.getBook(bookId);
    if (!book) {
      return {
        available: false,
        contentAvailability: 'unavailable',
        message: 'Book not found or restricted.'
      };
    }

    // Check if any section has actual full text content
    const sections = await this.getSections(bookId, 1);
    let hasFullText = false;
    for (const sec of sections) {
      const contents = await this.getContentForSection(sec.id);
      if (contents.some((c) => c.contentAvailability === 'full_text' && (c.textAr || c.textEn))) {
        hasFullText = true;
        break;
      }
    }

    if (hasFullText) {
      return {
        available: true,
        contentAvailability: 'full_text',
        message: 'Full text reading available.'
      };
    }

    return {
      available: true,
      contentAvailability: 'metadata_only',
      message: 'Book catalog metadata verified. Full text is pending verified digital edition ingestion.'
    };
  }

  // ==========================================================================
  // Reading Progress (User-Isolated)
  // ==========================================================================

  public async saveReadingProgress(
    userId: string,
    input: SaveReadingProgressInput
  ): Promise<UserReadingProgress> {
    if (!userId) {
      throw new Error('Authentication Required: Cannot save reading progress without user ID.');
    }

    const validation = validateReadingProgressInput(input);
    if (!validation.valid) {
      throw new Error(`Validation Error: ${validation.errors.join(' ')}`);
    }

    const key = `${userId}:${input.bookId}`;
    const now = new Date().toISOString();

    const progress: UserReadingProgress = {
      id: `prog-${userId}-${input.bookId}`,
      userId,
      bookId: input.bookId,
      editionId: input.editionId,
      volumeNumber: input.volumeNumber || 1,
      sectionId: input.sectionId,
      pageNumber: input.pageNumber,
      progressPercentage: input.progressPercentage,
      lastReadAt: now,
      clientMutationId: input.clientMutationId,
      createdAt: this.progressMap.get(key)?.createdAt || now,
      updatedAt: now
    };

    if (this.supabaseClient) {
      const { error } = await this.supabaseClient
        .from('user_reading_progress')
        .upsert(
          {
            user_id: progress.userId,
            book_id: progress.bookId,
            edition_id: progress.editionId,
            volume_number: progress.volumeNumber,
            section_id: progress.sectionId,
            page_number: progress.pageNumber,
            progress_percentage: progress.progressPercentage,
            last_read_at: progress.lastReadAt,
            client_mutation_id: progress.clientMutationId
          },
          { onConflict: 'user_id,book_id' }
        );

      if (error) {
        throw new Error(`Failed to save reading progress: ${error.message}`);
      }
    }

    this.progressMap.set(key, progress);
    return progress;
  }

  public async getReadingProgress(
    userId: string,
    bookId: string
  ): Promise<UserReadingProgress | null> {
    if (!userId || !bookId) return null;

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('user_reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle();

      if (!error && data) return this.mapProgressRow(data);
    }

    const key = `${userId}:${bookId}`;
    return this.progressMap.get(key) || null;
  }

  public async listUserProgress(userId: string): Promise<UserReadingProgress[]> {
    if (!userId) return [];

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('user_reading_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false });

      if (!error && data) return data.map(this.mapProgressRow);
    }

    return Array.from(this.progressMap.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime());
  }

  // ==========================================================================
  // Administrative Operations (Admin-Gated)
  // ==========================================================================

  public async registerBook(
    input: CreateBookInput,
    actor?: ActorContext
  ): Promise<Book> {
    if (
      actor &&
      !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin')
    ) {
      throw new Error('Authorization Violation: Only platform administrators can register books.');
    }

    const validation = validateBookInput(input);
    if (!validation.valid) {
      throw new Error(`Validation Error: ${validation.errors.join(' ')}`);
    }

    const now = new Date().toISOString();
    const book: Book = {
      id: input.id.trim().toLowerCase(),
      slug: input.slug.trim().toLowerCase(),
      titleArabic: input.titleArabic.trim(),
      titleEnglish: input.titleEnglish.trim(),
      titleUrdu: input.titleUrdu.trim(),
      authorId: input.authorId,
      authorNameArabic: input.authorNameArabic.trim(),
      authorNameEnglish: input.authorNameEnglish.trim(),
      authorNameUrdu: input.authorNameUrdu.trim(),
      authorDeathYearAh: input.authorDeathYearAh,
      authorDeathYearCe: input.authorDeathYearCe,
      descriptionArabic: input.descriptionArabic?.trim(),
      descriptionEnglish: input.descriptionEnglish?.trim(),
      descriptionUrdu: input.descriptionUrdu?.trim(),
      category: input.category || 'general',
      originalLanguage: input.originalLanguage || 'ar',
      volumeCount: input.volumeCount || 1,
      licenseType: input.licenseType || 'Public Domain',
      licenseStatus: input.licenseStatus || 'unverified_pending',
      sourceUrl: input.sourceUrl,
      provenanceNotes: input.provenanceNotes,
      attributionRequirement: input.attributionRequirement,
      isActive: true,
      reviewStatus: input.reviewStatus || 'draft',
      publicationStatus: input.publicationStatus || 'draft',
      createdAt: now,
      updatedAt: now
    };

    this.booksMap.set(book.id, book);
    this.recordAuditLog('book', book.id, 'create', actor?.id || 'system');
    return book;
  }

  public async registerEdition(
    input: CreateBookEditionInput,
    actor?: ActorContext
  ): Promise<BookEdition> {
    if (
      actor &&
      !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin')
    ) {
      throw new Error('Authorization Violation: Only platform administrators can register book editions.');
    }

    const validation = validateBookEditionInput(input);
    if (!validation.valid) {
      throw new Error(`Validation Error: ${validation.errors.join(' ')}`);
    }

    if (!this.booksMap.has(input.bookId)) {
      throw new Error(`Foreign Key Violation: Book '${input.bookId}' does not exist.`);
    }

    const now = new Date().toISOString();
    const edition: BookEdition = {
      id: `ed-${input.bookId}-${input.editionIdentifier}`,
      bookId: input.bookId,
      editionIdentifier: input.editionIdentifier,
      editionTitle: input.editionTitle.trim(),
      languageCode: input.languageCode,
      publisher: input.publisher,
      editor: input.editor,
      translator: input.translator,
      publicationYearCe: input.publicationYearCe,
      isbn: input.isbn,
      volumeCount: input.volumeCount || 1,
      format: input.format || 'structured_text',
      licenseType: input.licenseType || 'Public Domain',
      licenseStatus: input.licenseStatus || 'unverified_pending',
      licenseNotes: input.licenseNotes,
      attributionRequirement: input.attributionRequirement || '',
      provenanceNotes: input.provenanceNotes,
      sourceArchiveUrl: input.sourceArchiveUrl,
      isActive: true,
      reviewStatus: input.reviewStatus || 'draft',
      publicationStatus: input.publicationStatus || 'draft',
      createdAt: now,
      updatedAt: now
    };

    this.editionsMap.set(edition.id, edition);
    this.recordAuditLog('book_editions', edition.id, 'create', actor?.id || 'system');
    return edition;
  }

  public async registerSection(
    input: CreateBookSectionInput,
    actor?: ActorContext
  ): Promise<BookSection> {
    if (
      actor &&
      !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin' || r === 'scholar_reviewer')
    ) {
      throw new Error('Authorization Violation: Only authorized personnel can register sections.');
    }

    const validation = validateBookSectionInput(input);
    if (!validation.valid) {
      throw new Error(`Validation Error: ${validation.errors.join(' ')}`);
    }

    if (!this.booksMap.has(input.bookId)) {
      throw new Error(`Foreign Key Violation: Book '${input.bookId}' does not exist.`);
    }

    const section: BookSection = {
      id: `sec-${input.bookId}-${input.volumeNumber || 1}-${input.sectionNumber}`,
      bookId: input.bookId,
      editionId: input.editionId,
      volumeNumber: input.volumeNumber || 1,
      sectionNumber: input.sectionNumber,
      parentSectionId: input.parentSectionId,
      titleArabic: input.titleArabic.trim(),
      titleEnglish: input.titleEnglish?.trim(),
      titleUrdu: input.titleUrdu?.trim(),
      chapterNumber: input.chapterNumber,
      startPage: input.startPage,
      endPage: input.endPage,
      orderIndex: input.orderIndex || input.sectionNumber,
      createdAt: new Date().toISOString()
    };

    this.sectionsMap.set(section.id, section);
    this.recordAuditLog('book_sections', section.id, 'create', actor?.id || 'system');
    return section;
  }

  public async registerContent(
    input: CreateBookContentInput,
    actor?: ActorContext
  ): Promise<BookContent> {
    if (
      actor &&
      !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin' || r === 'scholar_reviewer')
    ) {
      throw new Error('Authorization Violation: Only authorized personnel can register book content.');
    }

    const validation = validateBookContentInput(input);
    if (!validation.valid) {
      throw new Error(`Validation Error: ${validation.errors.join(' ')}`);
    }

    const now = new Date().toISOString();
    const content: BookContent = {
      id: `cnt-${input.bookId}-${Date.now()}`,
      sectionId: input.sectionId,
      bookId: input.bookId,
      editionId: input.editionId,
      volumeNumber: input.volumeNumber || 1,
      pageNumber: input.pageNumber,
      paragraphIndex: input.paragraphIndex || 1,
      contentType: input.contentType || 'paragraph',
      textAr: input.textAr || null,
      textEn: input.textEn || null,
      textUr: input.textUr || null,
      contentAvailability: input.contentAvailability || 'metadata_only',
      contentSha256: input.contentSha256,
      licenseStatus: input.licenseStatus || 'unverified_pending',
      publicationStatus: input.publicationStatus || 'draft',
      versionNumber: 1,
      isCurrent: true,
      createdAt: now,
      updatedAt: now
    };

    this.contentsMap.set(content.id, content);
    this.recordAuditLog('book_contents', content.id, 'create', actor?.id || 'system');
    return content;
  }

  public async quarantineBook(
    bookId: string,
    reason: string,
    actor?: ActorContext
  ): Promise<Book> {
    if (actor && !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin')) {
      throw new Error('Authorization Violation: Only administrators can quarantine books.');
    }

    const book = this.booksMap.get(bookId);
    if (!book) {
      throw new Error(`Book Not Found: '${bookId}' does not exist.`);
    }

    book.licenseStatus = 'restricted_takedown';
    book.publicationStatus = 'takedown';
    book.isActive = false;

    this.recordAuditLog('books', book.id, 'takedown_quarantine', actor?.id || 'legal_system', reason);
    return book;
  }

  public async quarantineEdition(
    editionId: string,
    reason: string,
    actor?: ActorContext
  ): Promise<BookEdition> {
    if (actor && !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin')) {
      throw new Error('Authorization Violation: Only administrators can quarantine book editions.');
    }

    const edition = this.editionsMap.get(editionId);
    if (!edition) {
      throw new Error(`Edition Not Found: '${editionId}' does not exist.`);
    }

    edition.licenseStatus = 'restricted_takedown';
    edition.publicationStatus = 'takedown';
    edition.isActive = false;

    this.recordAuditLog('book_editions', edition.id, 'takedown_quarantine', actor?.id || 'legal_system', reason);
    return edition;
  }

  private recordAuditLog(
    entityType: string,
    entityId: string,
    action: string,
    performedBy: string,
    reason?: string
  ): void {
    this.auditLogs.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      entityType,
      entityId,
      action,
      performedBy,
      reason,
      createdAt: new Date().toISOString()
    });
  }

  // ==========================================================================
  // Row Mappers (Supabase snake_case -> camelCase)
  // ==========================================================================

  private mapBookRow(row: Record<string, unknown>): Book {
    return {
      id: row.id as string,
      slug: row.slug as string,
      titleArabic: row.title_arabic as string,
      titleEnglish: row.title_english as string,
      titleUrdu: row.title_urdu as string,
      authorId: row.author_id as string | undefined,
      authorNameArabic: row.author_name_arabic as string,
      authorNameEnglish: row.author_name_english as string,
      authorNameUrdu: row.author_name_urdu as string,
      authorDeathYearAh: row.author_death_year_ah as number | undefined,
      authorDeathYearCe: row.author_death_year_ce as number | undefined,
      descriptionArabic: row.description_arabic as string | undefined,
      descriptionEnglish: row.description_english as string | undefined,
      descriptionUrdu: row.description_urdu as string | undefined,
      category: row.category as Book['category'],
      originalLanguage: row.original_language as string,
      volumeCount: row.volume_count as number,
      licenseType: row.license_type as string,
      licenseStatus: row.license_status as Book['licenseStatus'],
      sourceUrl: row.source_url as string | undefined,
      provenanceNotes: row.provenance_notes as string | undefined,
      attributionRequirement: row.attribution_requirement as string | undefined,
      isActive: row.is_active as boolean,
      reviewStatus: row.review_status as Book['reviewStatus'],
      publicationStatus: row.publication_status as Book['publicationStatus'],
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    };
  }

  private mapEditionRow(row: Record<string, unknown>): BookEdition {
    return {
      id: row.id as string,
      bookId: row.book_id as string,
      editionIdentifier: row.edition_identifier as string,
      editionTitle: row.edition_title as string,
      languageCode: row.language_code as 'ar' | 'en' | 'ur',
      publisher: row.publisher as string | undefined,
      editor: row.editor as string | undefined,
      translator: row.translator as string | undefined,
      publicationYearCe: row.publication_year_ce as number | undefined,
      isbn: row.isbn as string | undefined,
      volumeCount: row.volume_count as number,
      format: row.format as BookEdition['format'],
      licenseType: row.license_type as string,
      licenseStatus: row.license_status as BookEdition['licenseStatus'],
      licenseNotes: row.license_notes as string | undefined,
      attributionRequirement: row.attribution_requirement as string,
      provenanceNotes: row.provenance_notes as string | undefined,
      sourceArchiveUrl: row.source_archive_url as string | undefined,
      contentSha256: row.content_sha256 as string | undefined,
      isActive: row.is_active as boolean,
      reviewStatus: row.review_status as BookEdition['reviewStatus'],
      publicationStatus: row.publication_status as BookEdition['publicationStatus'],
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    };
  }

  private mapVolumeRow(row: Record<string, unknown>): BookVolume {
    return {
      id: row.id as string,
      bookId: row.book_id as string,
      editionId: row.edition_id as string | undefined,
      volumeNumber: row.volume_number as number,
      titleArabic: row.title_arabic as string | undefined,
      titleEnglish: row.title_english as string | undefined,
      titleUrdu: row.title_urdu as string | undefined,
      pageCount: row.page_count as number | undefined,
      createdAt: row.created_at as string
    };
  }

  private mapSectionRow(row: Record<string, unknown>): BookSection {
    return {
      id: row.id as string,
      bookId: row.book_id as string,
      editionId: row.edition_id as string | undefined,
      volumeNumber: row.volume_number as number,
      sectionNumber: row.section_number as number,
      parentSectionId: row.parent_section_id as string | undefined,
      titleArabic: row.title_arabic as string,
      titleEnglish: row.title_english as string | undefined,
      titleUrdu: row.title_urdu as string | undefined,
      chapterNumber: row.chapter_number as number | undefined,
      startPage: row.start_page as number | undefined,
      endPage: row.end_page as number | undefined,
      orderIndex: row.order_index as number,
      createdAt: row.created_at as string
    };
  }

  private mapContentRow(row: Record<string, unknown>): BookContent {
    return {
      id: row.id as string,
      sectionId: row.section_id as string,
      bookId: row.book_id as string,
      editionId: row.edition_id as string | undefined,
      volumeNumber: row.volume_number as number,
      pageNumber: row.page_number as number | undefined,
      paragraphIndex: row.paragraph_index as number,
      contentType: row.content_type as BookContent['contentType'],
      textAr: row.text_ar as string | null | undefined,
      textEn: row.text_en as string | null | undefined,
      textUr: row.text_ur as string | null | undefined,
      contentAvailability: row.content_availability as BookContent['contentAvailability'],
      contentSha256: row.content_sha256 as string | undefined,
      licenseStatus: row.license_status as BookContent['licenseStatus'],
      publicationStatus: row.publication_status as BookContent['publicationStatus'],
      versionNumber: row.version_number as number,
      isCurrent: row.is_current as boolean,
      parentVersionId: row.parent_version_id as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    };
  }

  private mapProgressRow(row: Record<string, unknown>): UserReadingProgress {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      bookId: row.book_id as string,
      editionId: row.edition_id as string | undefined,
      volumeNumber: row.volume_number as number,
      sectionId: row.section_id as string | undefined,
      pageNumber: row.page_number as number | undefined,
      progressPercentage: Number(row.progress_percentage),
      lastReadAt: row.last_read_at as string,
      clientMutationId: row.client_mutation_id as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    };
  }
}
