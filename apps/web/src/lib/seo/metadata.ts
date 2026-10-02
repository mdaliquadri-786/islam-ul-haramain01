/**
 * @file metadata.ts
 * @package @islamic/web
 * @description Centralized metadata builder, canonical URL generator, and alternate language hreflang resolver.
 * Milestone: M4.4 — SEO & OpenGraph Schema
 *
 * CONTENT SAFETY:
 * - Never fabricates book synopses, translations, or scholarly claims.
 * - Always maps titles and descriptions to verified domain data.
 * - Uses exact canonical URLs stripped of transient query parameters (filters, pagination, player state).
 * - Enforces correct RTL/LTR locale attributes in OpenGraph and Twitter cards.
 */

import type { Metadata } from 'next';
import { type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE, getDictionary } from '@islamic/ui';
import { getSiteUrl, SITE_IDENTITY, OG_LOCALE_MAP } from './site.config';
import { normalizePath, isPublicIndexableRoute, getRobotsDirectives } from './route-classification';

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string; // e.g. '/quran' or '/quran/1' (without locale prefix)
  locale: Locale;
  isPublic?: boolean;
  noindex?: boolean;
  nofollow?: boolean;
  ogType?: 'website' | 'article' | 'book';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  image?: string;
}

/**
 * Builds an absolute canonical URL for a given normalized path and locale.
 * Example: buildCanonicalUrl('/quran/1', 'en') -> 'https://islamulharamain.com/en/quran/1'
 */
export function buildCanonicalUrl(path: string, locale: Locale = DEFAULT_LOCALE): string {
  const siteUrl = getSiteUrl();
  const clean = normalizePath(path);
  return `${siteUrl}/${locale}${clean}`;
}

/**
 * Builds the alternate language hreflang mapping for a given path across all supported locales.
 * Also specifies 'x-default' pointing to the canonical English version.
 */
export function buildAlternateLanguageUrls(path: string): Record<string, string> {
  const siteUrl = getSiteUrl();
  const clean = normalizePath(path);

  const alternates: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    alternates[loc] = `${siteUrl}/${loc}${clean}`;
  }
  // Standard x-default fallback points to default locale (English)
  alternates['x-default'] = `${siteUrl}/${DEFAULT_LOCALE}${clean}`;

  return alternates;
}

/**
 * Constructs a fully compliant Next.js Metadata object with canonical URLs,
 * alternate language hreflangs, OpenGraph, Twitter/X cards, and robots directives.
 */
export function constructPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    locale,
    isPublic = isPublicIndexableRoute(options.path),
    noindex = false,
    nofollow = false,
    ogType = 'website',
    publishedTime,
    modifiedTime,
    authors,
    tags,
    image
  } = options;

  const siteUrl = getSiteUrl();
  const canonicalUrl = buildCanonicalUrl(path, locale);
  const alternatesLanguages = buildAlternateLanguageUrls(path);
  const ogLocale = OG_LOCALE_MAP[locale] || 'en_US';
  const alternateOgLocales = SUPPORTED_LOCALES
    .filter((loc) => loc !== locale)
    .map((loc) => OG_LOCALE_MAP[loc]);

  const robots = getRobotsDirectives(isPublic, { noindex, nofollow });

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: alternatesLanguages
    },
    robots,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_IDENTITY.nameEnglish,
      locale: ogLocale,
      alternateLocale: alternateOgLocales,
      type: ogType as any
    },
    twitter: {
      card: SITE_IDENTITY.twitter.cardType,
      title,
      description,
      creator: SITE_IDENTITY.twitter.creator
    }
  };

  if (image) {
    const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`;
    if (metadata.openGraph) {
      metadata.openGraph.images = [{ url: fullImageUrl, alt: title }];
    }
    if (metadata.twitter) {
      metadata.twitter.images = [fullImageUrl];
    }
  }

  // Article-specific OpenGraph extensions
  if (ogType === 'article' && metadata.openGraph) {
    (metadata.openGraph as any).publishedTime = publishedTime;
    (metadata.openGraph as any).modifiedTime = modifiedTime;
    (metadata.openGraph as any).authors = authors;
    (metadata.openGraph as any).tags = tags;
  }

  return metadata;
}

// ============================================================================
// Domain-Specific Metadata Builders
// ============================================================================

/**
 * Builds metadata for the Quran index page.
 */
export function buildQuranIndexMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return constructPageMetadata({
    title: `${dict.quran.title} — ${dict.common.platformName}`,
    description: `${dict.quran.subtitle}. 114 Surahs, 6,236 Ayahs verified according to the Medina Mushaf standard with translations and audio recitation.`,
    path: '/quran',
    locale
  });
}

/**
 * Builds metadata for an individual Surah detail page.
 */
export function buildSurahMetadata(
  surah: {
    id: number;
    nameArabic: string;
    nameEnglish: string;
    nameTransliteration: string;
    ayahsCount: number;
    revelationType?: string;
  },
  locale: Locale
): Metadata {
  const title =
    locale === 'ar'
      ? `سورة ${surah.nameArabic} (${surah.id}) | إسلام الحرمين`
      : locale === 'ur'
      ? `سورۃ ${surah.nameArabic} (${surah.nameTransliteration}) | إسلام الحرمين`
      : `Surah ${surah.nameTransliteration} (${surah.nameArabic}) | ISLAM UL HARAMAIN`;

  const description =
    locale === 'ar'
      ? `قراءة وتلاوة سورة ${surah.nameArabic} (${surah.ayahsCount} آية) بالنص العثماني المعتمد مع الترجمات والتفاسير.`
      : locale === 'ur'
      ? `سورۃ ${surah.nameArabic} (${surah.ayahsCount} آیات) کا مصحف مدینہ کے مطابق عثمانی متن، اردو ترجمہ اور تلاوت۔`
      : `Read Surah ${surah.nameTransliteration} (${surah.nameArabic}) — ${surah.ayahsCount} verses in Medina Mushaf Uthmani text with verified English and Urdu translations.`;

  return constructPageMetadata({
    title,
    description,
    path: `/quran/${surah.id}`,
    locale
  });
}

/**
 * Builds metadata for the Hadith collections index page.
 */
export function buildHadithIndexMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return constructPageMetadata({
    title: `${dict.hadith.title} — Kutub al-Sittah | ${dict.common.platformName}`,
    description: `${dict.hadith.subtitle}. Canonical Kutub al-Sittah collections with distinct Sanad, Matn, and authenticated multi-scholar gradings.`,
    path: '/hadith',
    locale
  });
}

/**
 * Builds metadata for an individual Hadith collection page.
 */
export function buildHadithCollectionMetadata(
  collection: {
    id: string;
    name_english: string;
    name_arabic: string;
    total_narrations?: number;
  },
  locale: Locale
): Metadata {
  const title =
    locale === 'ar'
      ? `${collection.name_arabic} | إسلام الحرمين`
      : `${collection.name_english} (${collection.name_arabic}) | ISLAM UL HARAMAIN`;

  const description =
    locale === 'ar'
      ? `أحاديث ${collection.name_arabic} مسندة ومحققة مع فصل السند عن المتن وتخريج الأئمة والعلماء.`
      : `Verified narrations from ${collection.name_english} with Sanad/Matn separation and authenticated multi-scholar gradings (Al-Albani, Shu'ayb al-Arna'ut, Darussalam).`;

  return constructPageMetadata({
    title,
    description,
    path: `/hadith/${collection.id}`,
    locale
  });
}

/**
 * Builds metadata for the Duas & Adhkar index page.
 */
export function buildDuasIndexMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return constructPageMetadata({
    title: `${dict.duas.title} — Hisn al-Muslim | ${dict.common.platformName}`,
    description: `${dict.duas.subtitle}. Authentic supplications and remembrance from Quran and Sunnah based on Hisn al-Muslim by Shaykh Sa'id al-Qahtani.`,
    path: '/duas',
    locale
  });
}

/**
 * Builds metadata for a Dua category page.
 */
export function buildDuaCategoryMetadata(
  category: {
    slug: string;
    name_english: string;
    name_arabic: string;
  },
  locale: Locale
): Metadata {
  const title =
    locale === 'ar'
      ? `${category.name_arabic} | أذكار وأدعية | إسلام الحرمين`
      : `${category.name_english} (${category.name_arabic}) | Duas & Adhkar | ISLAM UL HARAMAIN`;

  const description =
    locale === 'ar'
      ? `الأدعية والأذكار الصحيحة لـ ${category.name_arabic} من حصن المسلم مع التشكيل الكامل والمصادر المعتمدة.`
      : `Authentic supplications for ${category.name_english} from Hisn al-Muslim with full Arabic tashkeel, transliteration, English translation, and verified citations.`;

  return constructPageMetadata({
    title,
    description,
    path: `/duas/${category.slug}`,
    locale
  });
}

/**
 * Builds metadata for Classical Tafsir comparative page.
 */
export function buildTafsirAyahMetadata(
  surah: {
    id: number;
    nameArabic: string;
    nameTransliteration: string;
  },
  ayahNumber: number,
  locale: Locale
): Metadata {
  const title =
    locale === 'ar'
      ? `تفسير سورة ${surah.nameArabic} آية ${ayahNumber} | إسلام الحرمين`
      : `Tafsir Surah ${surah.nameTransliteration} ${surah.id}:${ayahNumber} | ISLAM UL HARAMAIN`;

  const description =
    locale === 'ar'
      ? `المقارنة التفسيرية لآية ${ayahNumber} من سورة ${surah.nameArabic} بين تفسير ابن كثير وتفسير السعدي مع حفظ التراث المنهجي السني.`
      : `Classical comparative tafsir for Surah ${surah.nameTransliteration} Ayah ${ayahNumber} — Tafsir Ibn Kathir (d. 774 AH) and Tafsir Al-Sa'di (d. 1376 AH).`;

  return constructPageMetadata({
    title,
    description,
    path: `/tafsir/${surah.id}/${ayahNumber}`,
    locale
  });
}

/**
 * Builds metadata for the Digital Books catalog index page.
 */
export function buildBooksIndexMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return constructPageMetadata({
    title: `${dict.books.title} — Classical Islamic Library | ${dict.common.platformName}`,
    description: `${dict.books.subtitle}. Classical Sunni heritage texts including Riyad al-Salihin, Al-Arba'in al-Nawawiyyah, and Al-Aqeedah al-Wasitiyyah.`,
    path: '/books',
    locale
  });
}

/**
 * Builds metadata for an individual Book overview page.
 * CONTENT SAFETY: Accurately reflects verified metadata_only availability without claiming full text.
 */
export function buildBookDetailMetadata(
  book: {
    slug: string;
    titleEnglish: string;
    titleArabic: string;
    titleUrdu: string;
    authorNameEnglish: string;
    authorNameArabic: string;
    authorNameUrdu: string;
    category?: string;
  },
  locale: Locale
): Metadata {
  const title =
    locale === 'ar'
      ? `${book.titleArabic} — ${book.authorNameArabic} | إسلام الحرمين`
      : locale === 'ur'
      ? `${book.titleUrdu} — ${book.authorNameUrdu} | إسلام الحرمين`
      : `${book.titleEnglish} — ${book.authorNameEnglish} | ISLAM UL HARAMAIN`;

  const description =
    locale === 'ar'
      ? `بيانات وتوثيق كتاب ${book.titleArabic} للإمام ${book.authorNameArabic}. التراث الإسلامي الكلاسيكي السني.`
      : locale === 'ur'
      ? `کتاب ${book.titleUrdu} از ${book.authorNameUrdu} کی مستند معلومات اور فصول کی فہرست۔`
      : `Verified overview and table of contents for ${book.titleEnglish} by ${book.authorNameEnglish}. Classical Sunni heritage text with verified public domain provenance.`;

  return constructPageMetadata({
    title,
    description,
    path: `/books/${book.slug}`,
    locale,
    ogType: 'book'
  });
}

/**
 * Builds metadata for the Book Reader route.
 * Canonicalizes to the book overview and marks noindex to prevent indexing thin reader shell.
 */
export function buildBookReaderMetadata(
  book: {
    slug: string;
    titleEnglish: string;
    titleArabic: string;
    titleUrdu: string;
    authorNameEnglish: string;
  },
  locale: Locale
): Metadata {
  const title =
    locale === 'ar'
      ? `قارئ كتاب ${book.titleArabic} | إسلام الحرمين`
      : `e-Reader — ${book.titleEnglish} | ISLAM UL HARAMAIN`;

  return constructPageMetadata({
    title,
    description: `Digital reading view for ${book.titleEnglish} by ${book.authorNameEnglish}.`,
    path: `/books/${book.slug}`, // Canonicalizes back to the main book overview
    locale,
    noindex: true // Reader shell without standalone content is not indexed
  });
}

/**
 * Builds metadata for the Articles index page.
 */
export function buildArticlesIndexMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return constructPageMetadata({
    title: `${dict.articles.title} — Scholarly Research | ${dict.common.platformName}`,
    description: `${dict.articles.subtitle}. Peer-reviewed Islamic research and analysis adhering to classical Sunni scholarship and authenticated evidence.`,
    path: '/articles',
    locale
  });
}

/**
 * Builds metadata for a single published Article page.
 */
export function buildArticleDetailMetadata(
  article: {
    slug: string;
    title: string;
    excerpt?: string;
    subtitle?: string;
    publishedAt?: string;
    updatedAt?: string;
    authorName?: string;
    categoryName?: string;
  },
  locale: Locale
): Metadata {
  const title = `${article.title} | ISLAM UL HARAMAIN`;
  const description =
    article.excerpt ||
    article.subtitle ||
    'Authentic Islamic research article reviewed and published under Sunni scholarship governance.';

  return constructPageMetadata({
    title,
    description,
    path: `/articles/${article.slug}`,
    locale,
    ogType: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    authors: article.authorName ? [article.authorName] : undefined,
    tags: article.categoryName ? [article.categoryName] : undefined
  });
}

/**
 * Builds metadata for the Prayer Times and Qibla page.
 */
export function buildPrayerTimesMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return constructPageMetadata({
    title: `${dict.nav.prayerTimes} & Qibla Direction | ${dict.common.platformName}`,
    description:
      'Deterministic Islamic prayer times and Great-Circle Kaaba Qibla bearing calculation supporting 7 international authorities and high-latitude rules.',
    path: '/prayer-times',
    locale
  });
}

/**
 * Builds metadata for private, authenticated, or search pages (strictly noindex).
 */
export function buildPrivatePageMetadata(title: string, locale: Locale): Metadata {
  return constructPageMetadata({
    title: `${title} | ISLAM UL HARAMAIN`,
    description: 'ISLAM UL HARAMAIN Platform User Portal.',
    path: '',
    locale,
    isPublic: false,
    noindex: true,
    nofollow: true
  });
}

/**
 * Builds metadata for search page (canonical base without query params, noindex).
 */
export function buildSearchPageMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return constructPageMetadata({
    title: `${dict.nav.search} & Citation Router | ${dict.common.platformName}`,
    description:
      'Instant citation router and multi-lingual full-text search across Holy Quran, Kutub al-Sittah Hadith, and Hisn al-Muslim Duas.',
    path: '/search',
    locale,
    noindex: true, // Prevent indexing search query permutations
    nofollow: false
  });
}
