/**
 * @file sitemap.ts
 * @package @islamic/web
 * @description Dynamic XML sitemap generator for Next.js App Router.
 * Milestone: M4.4 & Production Launch Optimization
 *
 * CRITICAL SAFETY & INDEXING RULES:
 * - Includes ONLY public, published, verified content across the 3 supported locales (en, ar, ur).
 * - Excludes private/authenticated routes (/library, /profile, /admin, /cms, /search, /api).
 * - Excludes unpublished/draft/rejected articles.
 * - Excludes thin reader shell pages for metadata_only books.
 * - Attaches multi-lingual alternates (hreflang) to every entry.
 */

import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@islamic/ui';
import { CANONICAL_HADITH_COLLECTIONS } from '@islamic/islamic-engine';
import { CANONICAL_BOOKS } from '@islamic/database';
import { getAllDuaCategories } from '@/lib/duas';
import { getArticleService } from '@/lib/articles';
import { buildAlternateLanguageUrls, buildCanonicalUrl } from '@/lib/seo';

// Key canonical benchmark Ayahs for Tafsir entry indexing
const CANONICAL_TAFSIR_AYAH_BENCHMARKS = [
  // Al-Fatihah 1:1 - 1:7
  { surahId: 1, ayahId: 1 },
  { surahId: 1, ayahId: 2 },
  { surahId: 1, ayahId: 3 },
  { surahId: 1, ayahId: 4 },
  { surahId: 1, ayahId: 5 },
  { surahId: 1, ayahId: 6 },
  { surahId: 1, ayahId: 7 },
  // Ayat al-Kursi 2:255
  { surahId: 2, ayahId: 255 },
  // Ya-Sin 36:83
  { surahId: 36, ayahId: 83 },
  // Al-Ikhlas 112:1 - 112:4
  { surahId: 112, ayahId: 1 },
  { surahId: 112, ayahId: 2 },
  { surahId: 112, ayahId: 3 },
  { surahId: 112, ayahId: 4 },
  // Al-Falaq 113:1
  { surahId: 113, ayahId: 1 },
  // An-Nas 114:1
  { surahId: 114, ayahId: 1 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const currentDate = new Date();

  // Helper to add a route for all supported locales with alternates
  const addLocalizedRoutes = (
    path: string,
    options: {
      priority: number;
      changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
      lastModified?: Date;
    }
  ) => {
    const alternatesLanguages = buildAlternateLanguageUrls(path);
    for (const locale of SUPPORTED_LOCALES) {
      entries.push({
        url: buildCanonicalUrl(path, locale),
        lastModified: options.lastModified || currentDate,
        changeFrequency: options.changeFrequency,
        priority: options.priority,
        alternates: {
          languages: alternatesLanguages,
        },
      });
    }
  };

  // 1. Home Pages (Priority: 1.0)
  addLocalizedRoutes('', {
    priority: 1.0,
    changeFrequency: 'daily',
  });

  // 2. Quran Section
  // 2a. Quran Landing (Priority: 0.9)
  addLocalizedRoutes('/quran', {
    priority: 0.9,
    changeFrequency: 'weekly',
  });

  // 2b. All 114 Surahs (Priority: 0.85)
  for (let s = 1; s <= 114; s++) {
    addLocalizedRoutes(`/quran/${s}`, {
      priority: 0.85,
      changeFrequency: 'monthly',
    });
  }

  // 3. Hadith Section
  // 3a. Hadith Landing (Priority: 0.9)
  addLocalizedRoutes('/hadith', {
    priority: 0.9,
    changeFrequency: 'weekly',
  });

  // 3b. Kutub al-Sittah Collections (Priority: 0.85)
  for (const col of CANONICAL_HADITH_COLLECTIONS) {
    addLocalizedRoutes(`/hadith/${col.id}`, {
      priority: 0.85,
      changeFrequency: 'monthly',
    });
  }

  // 4. Seerah Section (Priority: 0.9)
  addLocalizedRoutes('/seerah', {
    priority: 0.9,
    changeFrequency: 'weekly',
  });

  // 5. Tasawwuf & Tazkiyah Section (Priority: 0.9)
  addLocalizedRoutes('/tasawwuf', {
    priority: 0.9,
    changeFrequency: 'weekly',
  });

  // 6. Duas & Adhkar Section
  // 6a. Duas Landing (Priority: 0.9)
  addLocalizedRoutes('/duas', {
    priority: 0.9,
    changeFrequency: 'weekly',
  });

  // 6b. All Hisn al-Muslim Categories (Priority: 0.8)
  try {
    const duaCategories = getAllDuaCategories();
    for (const cat of duaCategories) {
      if (cat.slug) {
        addLocalizedRoutes(`/duas/${cat.slug}`, {
          priority: 0.8,
          changeFrequency: 'monthly',
        });
      }
    }
  } catch {
    // Non-blocking fallback if corpus not yet loaded
  }

  // 7. Prayer Times & Qibla (Priority: 0.85)
  addLocalizedRoutes('/prayer-times', {
    priority: 0.85,
    changeFrequency: 'daily',
  });

  // 8. Articles Section
  // 8a. Articles Index (Priority: 0.85)
  addLocalizedRoutes('/articles', {
    priority: 0.85,
    changeFrequency: 'daily',
  });

  // 8b. Published Articles Only (Priority: 0.8)
  try {
    const articleService = await getArticleService();
    const result = await articleService.listPublicArticles({ limit: 100 });
    for (const item of result.articles) {
      if (item.status === 'PUBLISHED') {
        const lastMod = item.updatedAt
          ? new Date(item.updatedAt)
          : item.publishedAt
          ? new Date(item.publishedAt)
          : item.createdAt
          ? new Date(item.createdAt)
          : currentDate;

        addLocalizedRoutes(`/articles/${item.slug}`, {
          priority: 0.8,
          changeFrequency: 'weekly',
          lastModified: lastMod,
        });
      }
    }
  } catch {
    // Non-blocking fallback
  }

  // 9. Books Section
  // 9a. Books Catalog Index (Priority: 0.85)
  addLocalizedRoutes('/books', {
    priority: 0.85,
    changeFrequency: 'weekly',
  });

  // 9b. Canonical Classical Books Overviews (Priority: 0.8)
  for (const book of CANONICAL_BOOKS) {
    addLocalizedRoutes(`/books/${book.slug}`, {
      priority: 0.8,
      changeFrequency: 'monthly',
    });
  }

  // 10. Classical Tafsir Benchmark Entries (Priority: 0.75)
  for (const benchmark of CANONICAL_TAFSIR_AYAH_BENCHMARKS) {
    addLocalizedRoutes(`/tafsir/${benchmark.surahId}/${benchmark.ayahId}`, {
      priority: 0.75,
      changeFrequency: 'monthly',
    });
  }

  return entries;
}
