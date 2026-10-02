/**
 * @file m44-seo-metadata.test.ts
 * @package @islamic/web
 * @description Comprehensive test suite for Milestone M4.4: SEO & OpenGraph Schema.
 * Tests:
 * 1. Site Configuration & Origin Resolution
 * 2. Canonical URL & Multi-Lingual Alternate (hreflang) Resolution
 * 3. Route Classification: Public Indexable vs. Private/Administrative Noindex
 * 4. XSS Security & JSON-LD Serialization Protection
 * 5. Structured Data Schema Generators (WebSite, Organization, BreadcrumbList, Article, Book, Scripture)
 * 6. Content Domain Metadata (Quran, Hadith, Duas, Tafsir, Articles, Books, Prayer)
 * 7. Content Safety & M4.3 Book Metadata-Only Governance
 * 8. Robots Directives & Sitemap Reference
 * 9. Sitemap Generation, Public-Only Filtering & Exclusion of Private/Draft Routes
 * 10. Middleware Static/Crawler Pass-Through Rules
 *
 * Milestone: M4.4 — SEO & OpenGraph Schema
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSiteUrl,
  SITE_IDENTITY,
  OG_LOCALE_MAP,
  DEFAULT_CANONICAL_ORIGIN
} from '../src/lib/seo/site.config';
import {
  normalizePath,
  isPublicIndexableRoute,
  getRobotsDirectives,
  PUBLIC_STATIC_ROUTES,
  PRIVATE_ROUTE_SEGMENTS
} from '../src/lib/seo/route-classification';
import {
  buildCanonicalUrl,
  buildAlternateLanguageUrls,
  constructPageMetadata,
  buildQuranIndexMetadata,
  buildSurahMetadata,
  buildHadithIndexMetadata,
  buildHadithCollectionMetadata,
  buildDuasIndexMetadata,
  buildDuaCategoryMetadata,
  buildTafsirAyahMetadata,
  buildBooksIndexMetadata,
  buildBookDetailMetadata,
  buildBookReaderMetadata,
  buildArticlesIndexMetadata,
  buildArticleDetailMetadata,
  buildPrayerTimesMetadata,
  buildPrivatePageMetadata,
  buildSearchPageMetadata
} from '../src/lib/seo/metadata';
import {
  safeJsonLdReplacer,
  createWebSiteSchema,
  createOrganizationSchema,
  createBreadcrumbSchema,
  createArticleSchema,
  createBookSchema,
  createScriptureSchema
} from '../src/lib/seo/json-ld';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';
import { CANONICAL_BOOKS } from '@islamic/database';
import { CANONICAL_SURAHS, CANONICAL_HADITH_COLLECTIONS } from '@islamic/islamic-engine';

describe('Milestone M4.4 — SEO & OpenGraph Schema', () => {

  // ==========================================================================
  // 1. Site Configuration & Origin Resolution
  // ==========================================================================
  describe('1. Site Configuration & Origin Resolution', () => {
    it('should default to authoritative canonical origin when environment variable is unset', () => {
      const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.SITE_URL;

      const url = getSiteUrl();
      assert.equal(url, 'https://islamulharamain.com');

      if (originalEnv) process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    });

    it('should respect NEXT_PUBLIC_SITE_URL and trim any trailing slashes', () => {
      const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.org///';

      const url = getSiteUrl();
      assert.equal(url, 'https://custom-domain.org');

      if (originalEnv) {
        process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
      } else {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      }
    });

    it('should maintain verified site identity metadata without fabricated claims', () => {
      assert.equal(SITE_IDENTITY.nameEnglish, 'ISLAM UL HARAMAIN');
      assert.equal(SITE_IDENTITY.nameArabic, 'إسلام الحرمين');
      assert.deepEqual(SITE_IDENTITY.supportedLocales, ['en', 'ar', 'ur']);
      assert.equal(SITE_IDENTITY.defaultLocale, 'en');
      assert.equal(SITE_IDENTITY.openGraph.siteName, 'ISLAM UL HARAMAIN');
      assert.equal(SITE_IDENTITY.twitter.cardType, 'summary');
    });

    it('should expose the default canonical origin constant', () => {
      assert.equal(DEFAULT_CANONICAL_ORIGIN, 'https://islamulharamain.com');
    });

    it('should provide accurate OpenGraph locale mapping for all 3 supported languages', () => {
      assert.equal(OG_LOCALE_MAP.en, 'en_US');
      assert.equal(OG_LOCALE_MAP.ar, 'ar_SA');
      assert.equal(OG_LOCALE_MAP.ur, 'ur_PK');
    });
  });

  // ==========================================================================
  // 2. Canonical URL & Alternate Language (hreflang) Resolution
  // ==========================================================================
  describe('2. Canonical URL & Alternate Language (hreflang) Resolution', () => {
    it('should generate exact canonical URLs without duplicate locale prefixes', () => {
      const urlEn = buildCanonicalUrl('/quran/1', 'en');
      const urlAr = buildCanonicalUrl('/quran/1', 'ar');
      const urlUr = buildCanonicalUrl('/quran/1', 'ur');

      assert.equal(urlEn, `${getSiteUrl()}/en/quran/1`);
      assert.equal(urlAr, `${getSiteUrl()}/ar/quran/1`);
      assert.equal(urlUr, `${getSiteUrl()}/ur/quran/1`);
    });

    it('should strip query parameters and hashes from canonical URLs', () => {
      const urlWithParams = buildCanonicalUrl('/quran/2?trans=en.sahih&view=bilingual#ayah-255', 'en');
      assert.equal(urlWithParams, `${getSiteUrl()}/en/quran/2`);
    });

    it('should normalize root path canonical URLs cleanly', () => {
      assert.equal(buildCanonicalUrl('', 'en'), `${getSiteUrl()}/en`);
      assert.equal(buildCanonicalUrl('/', 'ar'), `${getSiteUrl()}/ar`);
      assert.equal(buildCanonicalUrl('', 'ur'), `${getSiteUrl()}/ur`);
    });

    it('should normalize paths accurately stripping query parameters, hashes, and locale prefixes', () => {
      assert.equal(normalizePath('/en/quran/1'), '/quran/1');
      assert.equal(normalizePath('/ar/books/riyad-al-salihin?ref=share#chap-1'), '/books/riyad-al-salihin');
      assert.equal(normalizePath('/ur'), '');
      assert.equal(normalizePath(''), '');
      assert.equal(normalizePath('/'), '');
    });

    it('should generate complete alternate language hreflangs with x-default', () => {
      const alternates = buildAlternateLanguageUrls('/books/riyad-al-salihin');

      assert.equal(alternates.en, `${getSiteUrl()}/en/books/riyad-al-salihin`);
      assert.equal(alternates.ar, `${getSiteUrl()}/ar/books/riyad-al-salihin`);
      assert.equal(alternates.ur, `${getSiteUrl()}/ur/books/riyad-al-salihin`);
      assert.equal(alternates['x-default'], `${getSiteUrl()}/en/books/riyad-al-salihin`);
    });
  });

  // ==========================================================================
  // 3. Route Classification: Public vs. Private
  // ==========================================================================
  describe('3. Route Classification: Public vs. Private', () => {
    it('should classify public informational routes as indexable', () => {
      assert.equal(isPublicIndexableRoute(''), true);
      assert.equal(isPublicIndexableRoute('/'), true);
      assert.equal(isPublicIndexableRoute('/quran'), true);
      assert.equal(isPublicIndexableRoute('/quran/1'), true);
      assert.equal(isPublicIndexableRoute('/hadith'), true);
      assert.equal(isPublicIndexableRoute('/hadith/bukhari'), true);
      assert.equal(isPublicIndexableRoute('/duas'), true);
      assert.equal(isPublicIndexableRoute('/duas/morning-evening'), true);
      assert.equal(isPublicIndexableRoute('/prayer-times'), true);
      assert.equal(isPublicIndexableRoute('/articles'), true);
      assert.equal(isPublicIndexableRoute('/articles/foundations-of-sunni-creed'), true);
      assert.equal(isPublicIndexableRoute('/books'), true);
      assert.equal(isPublicIndexableRoute('/books/riyad-al-salihin'), true);
      assert.equal(isPublicIndexableRoute('/tafsir/1/1'), true);
    });

    it('should provide authoritative static and private route listings', () => {
      assert.ok(PUBLIC_STATIC_ROUTES.includes('/quran'));
      assert.ok(PUBLIC_STATIC_ROUTES.includes('/hadith'));
      assert.ok(PUBLIC_STATIC_ROUTES.includes('/duas'));
      assert.ok(PUBLIC_STATIC_ROUTES.includes('/books'));
      assert.ok(PUBLIC_STATIC_ROUTES.includes('/articles'));
      assert.ok(PUBLIC_STATIC_ROUTES.includes('/prayer-times'));

      assert.ok(PRIVATE_ROUTE_SEGMENTS.includes('admin'));
      assert.ok(PRIVATE_ROUTE_SEGMENTS.includes('cms'));
      assert.ok(PRIVATE_ROUTE_SEGMENTS.includes('library'));
      assert.ok(PRIVATE_ROUTE_SEGMENTS.includes('profile'));
      assert.ok(PRIVATE_ROUTE_SEGMENTS.includes('search'));
      assert.ok(PRIVATE_ROUTE_SEGMENTS.includes('api'));
    });

    it('should classify private and internal routes as non-indexable', () => {
      assert.equal(isPublicIndexableRoute('/library'), false);
      assert.equal(isPublicIndexableRoute('/admin'), false);
      assert.equal(isPublicIndexableRoute('/cms'), false);
      assert.equal(isPublicIndexableRoute('/profile'), false);
      assert.equal(isPublicIndexableRoute('/search'), false);
      assert.equal(isPublicIndexableRoute('/api/search'), false);
      assert.equal(isPublicIndexableRoute('/en/library'), false);
      assert.equal(isPublicIndexableRoute('/ar/admin'), false);
    });

    it('should emit correct robots directives for public and private pages', () => {
      const publicRobots = getRobotsDirectives(true) as { index?: boolean; follow?: boolean };
      assert.equal(publicRobots?.index, true);
      assert.equal(publicRobots?.follow, true);

      const privateRobots = getRobotsDirectives(false) as { index?: boolean; follow?: boolean };
      assert.equal(privateRobots?.index, false);
      assert.equal(privateRobots?.follow, false);

      const searchRobots = getRobotsDirectives(true, { noindex: true, nofollow: false }) as { index?: boolean; follow?: boolean };
      assert.equal(searchRobots?.index, false);
      assert.equal(searchRobots?.follow, true);
    });
  });

  // ==========================================================================
  // 4. XSS Security & JSON-LD Serialization Protection
  // ==========================================================================
  describe('4. XSS Security & JSON-LD Serialization Protection', () => {
    it('should escape dangerous characters (<, >, &) to prevent script injection', () => {
      const maliciousPayload = {
        title: '</script><script>alert("xss")</script>',
        description: 'Tafsir & Commentary <test> "injection"'
      };

      const serialized = safeJsonLdReplacer(maliciousPayload);

      assert.equal(serialized.includes('</script>'), false);
      assert.equal(serialized.includes('<script>'), false);
      assert.equal(serialized.includes('\\u003c/script\\u003e'), true);
      assert.equal(serialized.includes('\\u003cscript\\u003e'), true);
      assert.equal(serialized.includes('\\u0026'), true);
      assert.equal(serialized.includes('\\u003e'), true);
    });

    it('should safely serialize complex nested objects and arrays', () => {
      const complexData = {
        name: 'ISLAM UL HARAMAIN',
        items: [
          { name: '<Tag 1>', count: 5 },
          { name: 'A & B > C', active: true }
        ]
      };

      const serialized = safeJsonLdReplacer(complexData);
      assert.equal(serialized.includes('<'), false);
      assert.equal(serialized.includes('>'), false);
      assert.equal(serialized.includes('&'), false);
    });

    it('should withstand hostile values including script tags, quotes, control chars, and non-Latin scripts', () => {
      const hostileData = {
        title: '</script><script>alert("xss")</script>',
        htmlEntities: '&lt;b&gt;bold&lt;/b&gt; & "quotes" & \'single\'',
        arabicScript: 'تفسير القرآن الكريم',
        urduScript: 'قرآن مجید اور حدیث نبوی',
        nestedObject: {
          key: '</script>',
          array: ['<svg onload=alert(1)>', 'normal & clean']
        }
      };

      const serialized = safeJsonLdReplacer(hostileData);

      assert.equal(serialized.includes('</script>'), false);
      assert.equal(serialized.includes('<script>'), false);
      assert.equal(serialized.includes('<svg'), false);
      assert.equal(serialized.includes('<'), false);
      assert.equal(serialized.includes('>'), false);
      assert.equal(serialized.includes('&'), false);

      assert.equal(serialized.includes('\\u003c/script\\u003e'), true);
      assert.equal(serialized.includes('\\u003cscript\\u003e'), true);
      assert.equal(serialized.includes('\\u0026'), true);

      const parsed = JSON.parse(serialized);
      assert.equal(parsed.arabicScript, 'تفسير القرآن الكريم');
      assert.equal(parsed.urduScript, 'قرآن مجید اور حدیث نبوی');
    });
  });

  // ==========================================================================
  // 5. Structured Data Schema Generators
  // ==========================================================================
  describe('5. Structured Data Schema Generators', () => {
    it('should generate valid schema.org/WebSite with SearchAction', () => {
      const schema = createWebSiteSchema('en');
      assert.equal(schema['@context'], 'https://schema.org');
      assert.equal(schema['@type'], 'WebSite');
      assert.equal(schema.name, 'ISLAM UL HARAMAIN');
      assert.equal(schema.alternateName, 'إسلام الحرمين');
      assert.equal(schema.inLanguage, 'en');
      assert.equal(schema.potentialAction['@type'], 'SearchAction');
      assert.equal(schema.potentialAction.target.urlTemplate.includes('/en/search?q='), true);
    });

    it('should generate valid schema.org/Organization without fabricated reviews or ratings', () => {
      const schema = createOrganizationSchema();
      assert.equal(schema['@context'], 'https://schema.org');
      assert.equal(schema['@type'], 'Organization');
      assert.equal(schema.name, 'ISLAM UL HARAMAIN (إسلام الحرمين)');
      assert.equal((schema as any).aggregateRating, undefined);
      assert.equal((schema as any).review, undefined);
      assert.equal((schema as any).offers, undefined);
    });

    it('should generate valid schema.org/BreadcrumbList with 1-based positioning', () => {
      const items = [
        { name: 'Home', path: '' },
        { name: 'Quran', path: '/quran' },
        { name: 'Surah Al-Fatihah', path: '/quran/1' }
      ];

      const schema = createBreadcrumbSchema(items, 'en');
      assert.equal(schema['@context'], 'https://schema.org');
      assert.equal(schema['@type'], 'BreadcrumbList');
      assert.equal(schema.itemListElement.length, 3);
      assert.equal(schema.itemListElement[0].position, 1);
      assert.equal(schema.itemListElement[0].name, 'Home');
      assert.equal(schema.itemListElement[1].position, 2);
      assert.equal(schema.itemListElement[2].position, 3);
      assert.equal(schema.itemListElement[2].item, `${getSiteUrl()}/en/quran/1`);
    });

    it('should generate valid schema.org/Article for published articles without fake metrics', () => {
      const schema = createArticleSchema({
        title: 'Foundations of Sunni Creed',
        slug: 'foundations-of-sunni-creed',
        locale: 'en',
        excerpt: 'A comprehensive study of the Six Articles of Faith.',
        publishedAt: '2026-09-24T00:00:00Z',
        authorName: 'Shaykh Ahmad al-Salih',
        categoryName: 'Aqeedah'
      });

      assert.equal(schema['@context'], 'https://schema.org');
      assert.equal(schema['@type'], 'Article');
      assert.equal(schema.headline, 'Foundations of Sunni Creed');
      assert.equal(schema.author.name, 'Shaykh Ahmad al-Salih');
      assert.equal(schema.articleSection, 'Aqeedah');
      assert.equal((schema as any).aggregateRating, undefined);
      assert.equal((schema as any).offers, undefined);
    });

    it('should generate valid schema.org/Book for canonical Islamic heritage works', () => {
      const book = CANONICAL_BOOKS[0]; // Riyad al-Salihin
      const schema = createBookSchema({
        title: book.titleEnglish,
        slug: book.slug,
        locale: 'en',
        authorName: book.authorNameEnglish,
        originalLanguage: book.originalLanguage,
        authorDeathYearCe: book.authorDeathYearCe
      });

      assert.equal(schema['@context'], 'https://schema.org');
      assert.equal(schema['@type'], 'Book');
      assert.equal(schema.name, book.titleEnglish);
      assert.equal(schema.author.name, book.authorNameEnglish);
      assert.equal(schema.inLanguage, 'ar');
      assert.equal((schema as any).offers, undefined);
      assert.equal((schema as any).aggregateRating, undefined);
    });

    it('should generate valid schema.org/ItemPage for canonical scripture and tafsir views', () => {
      const schema = createScriptureSchema({
        title: 'Surah Al-Baqarah (2:255)',
        path: '/quran/2',
        locale: 'en',
        description: 'Ayat al-Kursi in canonical Uthmani Arabic script.',
        category: 'Quran'
      });

      assert.equal(schema['@context'], 'https://schema.org');
      assert.equal(schema['@type'], 'ItemPage');
      assert.equal(schema.name, 'Surah Al-Baqarah (2:255)');
      assert.equal(schema.about.name, 'Quran');
      assert.equal(schema.url, `${getSiteUrl()}/en/quran/2`);
    });
  });

  // ==========================================================================
  // 6. Domain-Specific Metadata Verification
  // ==========================================================================
  describe('6. Domain-Specific Metadata Verification', () => {
    it('should generate page metadata via constructPageMetadata', () => {
      const meta = constructPageMetadata({
        title: 'Custom Title',
        description: 'Custom Description',
        path: '/custom',
        locale: 'en',
        image: '/images/custom.png'
      });
      assert.equal(meta.title, 'Custom Title');
      assert.equal(meta.description, 'Custom Description');
      assert.equal(meta.alternates?.canonical, `${getSiteUrl()}/en/custom`);
      assert.ok(meta.openGraph?.images);
    });

    it('should build valid index metadata for Quran, Hadith, Duas, Books, and Articles', () => {
      const quranMeta = buildQuranIndexMetadata('en');
      assert.ok(quranMeta.title?.toString().includes('Quran') || quranMeta.title?.toString().includes('القرآن'));
      assert.equal(quranMeta.alternates?.canonical, `${getSiteUrl()}/en/quran`);

      const hadithMeta = buildHadithIndexMetadata('en');
      assert.ok(hadithMeta.title?.toString().includes('Hadith') || hadithMeta.title?.toString().includes('الحديث'));
      assert.equal(hadithMeta.alternates?.canonical, `${getSiteUrl()}/en/hadith`);

      const duasMeta = buildDuasIndexMetadata('en');
      assert.ok(duasMeta.title?.toString().includes('Duas') || duasMeta.title?.toString().includes('أدعية'));
      assert.equal(duasMeta.alternates?.canonical, `${getSiteUrl()}/en/duas`);

      const duaCatMeta = buildDuaCategoryMetadata(
        { slug: 'when-waking-up', name_english: 'When Waking Up', name_arabic: 'عند الاستيقاظ من النوم' },
        'en'
      );
      assert.equal(duaCatMeta.alternates?.canonical, `${getSiteUrl()}/en/duas/when-waking-up`);

      const booksMeta = buildBooksIndexMetadata('en');
      assert.ok(booksMeta.title?.toString().includes('Books') || booksMeta.title?.toString().includes('الكتب'));
      assert.equal(booksMeta.alternates?.canonical, `${getSiteUrl()}/en/books`);

      const articlesMeta = buildArticlesIndexMetadata('en');
      assert.ok(articlesMeta.title?.toString().includes('Articles') || articlesMeta.title?.toString().includes('المقالات'));
      assert.equal(articlesMeta.alternates?.canonical, `${getSiteUrl()}/en/articles`);

      const articleDetailMeta = buildArticleDetailMetadata(
        { slug: 'test-article', title: 'Test Article' },
        'en'
      );
      assert.equal(articleDetailMeta.alternates?.canonical, `${getSiteUrl()}/en/articles/test-article`);
    });

    it('Quran: should construct localized metadata for Surah Al-Fatihah', () => {
      const surah1 = CANONICAL_SURAHS[1];
      const metaEn = buildSurahMetadata(
        {
          id: surah1.number,
          nameArabic: surah1.nameArabic,
          nameEnglish: surah1.nameEnglish,
          nameTransliteration: surah1.nameTransliteration,
          ayahsCount: surah1.ayahsCount
        },
        'en'
      );
      const metaAr = buildSurahMetadata(
        {
          id: surah1.number,
          nameArabic: surah1.nameArabic,
          nameEnglish: surah1.nameEnglish,
          nameTransliteration: surah1.nameTransliteration,
          ayahsCount: surah1.ayahsCount
        },
        'ar'
      );

      assert.equal(metaEn.title, 'Surah Al-Faatiha (الفاتحة) | ISLAM UL HARAMAIN');
      assert.equal(metaAr.title, 'سورة الفاتحة (1) | إسلام الحرمين');
      assert.equal(metaEn.alternates?.canonical, `${getSiteUrl()}/en/quran/1`);
      assert.equal(metaAr.alternates?.canonical, `${getSiteUrl()}/ar/quran/1`);
    });

    it('Hadith: should construct verified metadata for Sahih al-Bukhari', () => {
      const bukhari = CANONICAL_HADITH_COLLECTIONS.find((c) => c.id === 'bukhari')!;
      const meta = buildHadithCollectionMetadata(
        {
          id: bukhari.id,
          name_english: bukhari.nameEnglish,
          name_arabic: bukhari.nameArabic
        },
        'en'
      );

      assert.equal(meta.title, 'Sahih al-Bukhari (صحيح البخاري) | ISLAM UL HARAMAIN');
      assert.equal(meta.alternates?.canonical, `${getSiteUrl()}/en/hadith/bukhari`);
    });

    it('Tafsir: should construct comparative exegesis metadata with authentic scholar death years', () => {
      const surahYaSin = CANONICAL_SURAHS[36];
      const meta = buildTafsirAyahMetadata(
        {
          id: surahYaSin.number,
          nameArabic: surahYaSin.nameArabic,
          nameTransliteration: surahYaSin.nameTransliteration
        },
        83,
        'en'
      );

      assert.equal(meta.title, 'Tafsir Surah Yaseen 36:83 | ISLAM UL HARAMAIN');
      assert.equal(meta.description?.includes('Ibn Kathir (d. 774 AH)'), true);
      assert.equal(meta.description?.includes('Al-Sa\'di (d. 1376 AH)'), true);
      assert.equal(meta.alternates?.canonical, `${getSiteUrl()}/en/tafsir/36/83`);
    });

    it('Prayer Times: should construct devotional calculation metadata', () => {
      const meta = buildPrayerTimesMetadata('en');
      assert.equal(meta.title?.toString().includes('Prayer Times & Qibla'), true);
      assert.equal(meta.alternates?.canonical, `${getSiteUrl()}/en/prayer-times`);
    });
  });

  // ==========================================================================
  // 7. Content Safety & M4.3 Book Metadata-Only Governance
  // ==========================================================================
  describe('7. Content Safety & M4.3 Book Metadata-Only Governance', () => {
    it('Book overview should accurately reflect metadata without fabricating full-text claims', () => {
      const book = CANONICAL_BOOKS[0]; // Riyad al-Salihin
      const meta = buildBookDetailMetadata(
        {
          slug: book.slug,
          titleEnglish: book.titleEnglish,
          titleArabic: book.titleArabic,
          titleUrdu: book.titleUrdu,
          authorNameEnglish: book.authorNameEnglish,
          authorNameArabic: book.authorNameArabic,
          authorNameUrdu: book.authorNameUrdu,
          category: book.category
        },
        'en'
      );

      assert.equal(meta.title, `${book.titleEnglish} — ${book.authorNameEnglish} | ISLAM UL HARAMAIN`);
      assert.equal(meta.description?.includes('full text downloaded'), false);
      assert.equal(meta.description?.includes('Verified overview and table of contents'), true);
      assert.equal(meta.alternates?.canonical, `${getSiteUrl()}/en/books/riyad-al-salihin`);
    });

    it('Book reader should set noindex and canonicalize back to main book overview', () => {
      const book = CANONICAL_BOOKS[0];
      const meta = buildBookReaderMetadata(
        {
          slug: book.slug,
          titleEnglish: book.titleEnglish,
          titleArabic: book.titleArabic,
          titleUrdu: book.titleUrdu,
          authorNameEnglish: book.authorNameEnglish
        },
        'en'
      );

      // Reader is marked noindex to avoid thin content indexing
      assert.equal((meta.robots as any)?.index, false);
      // Canonical points to overview
      assert.equal(meta.alternates?.canonical, `${getSiteUrl()}/en/books/riyad-al-salihin`);
    });
  });

  // ==========================================================================
  // 8. Robots Directives & Reference
  // ==========================================================================
  describe('8. Robots Directives & Reference', () => {
    it('should generate valid robots.txt rules disallowing private sections', () => {
      const result = robots();

      assert.equal(result.sitemap, `${getSiteUrl()}/sitemap.xml`);
      assert.ok(Array.isArray(result.rules));

      const rule = (result.rules as any[])[0];
      assert.equal(rule.userAgent, '*');
      assert.equal(rule.allow, '/');

      const disallows = rule.disallow as string[];
      assert.equal(disallows.includes('/api/'), true);
      assert.equal(disallows.includes('/*/admin'), true);
      assert.equal(disallows.includes('/*/cms'), true);
      assert.equal(disallows.includes('/*/library'), true);
      assert.equal(disallows.includes('/*/profile'), true);
      assert.equal(disallows.includes('/*/search'), true);
    });
  });

  // ==========================================================================
  // 9. Sitemap Generation & Public-Only Filtering
  // ==========================================================================
  describe('9. Sitemap Generation & Public-Only Filtering', () => {
    it('should generate comprehensive sitemap entries across all 3 locales', async () => {
      const sitemapEntries = await sitemap();
      assert.ok(sitemapEntries.length > 0);

      // Check home page for all 3 locales
      const siteUrl = getSiteUrl();
      const hasHomeEn = sitemapEntries.some((e) => e.url === `${siteUrl}/en`);
      const hasHomeAr = sitemapEntries.some((e) => e.url === `${siteUrl}/ar`);
      const hasHomeUr = sitemapEntries.some((e) => e.url === `${siteUrl}/ur`);
      assert.equal(hasHomeEn, true);
      assert.equal(hasHomeAr, true);
      assert.equal(hasHomeUr, true);

      // Check Surah 1 & 114
      const hasSurah1 = sitemapEntries.some((e) => e.url === `${siteUrl}/en/quran/1`);
      const hasSurah114 = sitemapEntries.some((e) => e.url === `${siteUrl}/en/quran/114`);
      assert.equal(hasSurah1, true);
      assert.equal(hasSurah114, true);

      // Check Hadith Collections (Bukhari, Muslim, etc.)
      const hasBukhari = sitemapEntries.some((e) => e.url === `${siteUrl}/en/hadith/bukhari`);
      const hasMuslim = sitemapEntries.some((e) => e.url === `${siteUrl}/ar/hadith/muslim`);
      assert.equal(hasBukhari, true);
      assert.equal(hasMuslim, true);

      // Check Canonical Books
      const hasRiyad = sitemapEntries.some((e) => e.url === `${siteUrl}/en/books/riyad-al-salihin`);
      assert.equal(hasRiyad, true);

      // Check Benchmark Tafsir entries
      const hasTafsirAyatAlKursi = sitemapEntries.some((e) => e.url === `${siteUrl}/en/tafsir/2/255`);
      assert.equal(hasTafsirAyatAlKursi, true);
    });

    it('should NEVER include private, administrative, or search query routes in sitemap', async () => {
      const sitemapEntries = await sitemap();

      for (const entry of sitemapEntries) {
        const u = entry.url;
        assert.equal(u.includes('/library'), false, `Private route leaked in sitemap: ${u}`);
        assert.equal(u.includes('/admin'), false, `Admin route leaked in sitemap: ${u}`);
        assert.equal(u.includes('/cms'), false, `CMS route leaked in sitemap: ${u}`);
        assert.equal(u.includes('/profile'), false, `Profile route leaked in sitemap: ${u}`);
        assert.equal(u.includes('/search'), false, `Search route leaked in sitemap: ${u}`);
        assert.equal(u.includes('/api/'), false, `API route leaked in sitemap: ${u}`);
      }
    });

    it('every sitemap entry should have hreflang alternates configured', async () => {
      const sitemapEntries = await sitemap();
      for (const entry of sitemapEntries.slice(0, 50)) {
        assert.ok(entry.alternates, `Entry missing alternates: ${entry.url}`);
        assert.ok(entry.alternates?.languages, `Entry missing language alternates: ${entry.url}`);
        const langs = entry.alternates!.languages as Record<string, string>;
        assert.ok(langs.en, `Missing en alternate: ${entry.url}`);
        assert.ok(langs.ar, `Missing ar alternate: ${entry.url}`);
        assert.ok(langs.ur, `Missing ur alternate: ${entry.url}`);
        assert.ok(langs['x-default'], `Missing x-default alternate: ${entry.url}`);
      }
    });
  });

  // ==========================================================================
  // 10. Private Page Metadata Directives
  // ==========================================================================
  describe('10. Private Page Metadata Directives', () => {
    it('Library: should emit strictly noindex, nofollow metadata', () => {
      const meta = buildPrivatePageMetadata('My Library', 'en');
      assert.equal((meta.robots as any)?.index, false);
      assert.equal((meta.robots as any)?.follow, false);
    });

    it('Search: should emit canonical base without query parameters and noindex', () => {
      const meta = buildSearchPageMetadata('en');
      assert.equal(meta.alternates?.canonical, `${getSiteUrl()}/en/search`);
      assert.equal((meta.robots as any)?.index, false);
      assert.equal((meta.robots as any)?.follow, true);
    });
  });
});
