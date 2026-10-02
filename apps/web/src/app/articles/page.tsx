/**
 * @file page.tsx
 * @package @islamic/web
 * @description Public Articles & Research index view.
 * Displays published, verified Islamic educational articles with category filtering.
 */

import Link from 'next/link';
import { getArticleService } from '@/lib/articles';

export const metadata = {
  title: 'Articles & Scholarly Research — ISLAM UL HARAMAIN',
  description: 'Verified educational and research articles on Sunni Creed, Fiqh, Quranic Tafsir, and Hadith Sciences.'
};

export default async function ArticlesIndexPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string; language?: string }>;
}) {
  const { category, language } = await searchParams;
  const service = await getArticleService();

  const [articlesData, categories] = await Promise.all([
    service.listPublicArticles({ categorySlug: category, language, limit: 30 }),
    service.listCategories()
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full">
                Verified Research
              </span>
              <span className="text-xs text-slate-400">
                Ahl al-Sunnah wa al-Jama`ah
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-baseline gap-3">
              Articles & Scholarly Research
              <span className="font-serif text-emerald-500 text-2xl font-normal">
                (المقالات والبحوث)
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
              Authentic, sourced educational articles verified by credentialed scholars across the four Sunni madhhabs, theology, and Hadith sciences.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/cms"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <span>Editorial & Scholar Portal</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/articles"
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition ${
              !category
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Categories ({articlesData.total})
          </Link>
          {categories.map(cat => {
            const isSelected = category === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/articles?category=${cat.slug}`}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{cat.nameEnglish}</span>
                <span className="font-serif text-[11px] opacity-75">({cat.nameArabic})</span>
              </Link>
            );
          })}
        </div>

        {/* Articles Grid */}
        {articlesData.articles.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">
              No published articles found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articlesData.articles.map(article => {
              const cat = categories.find(c => c.id === article.categoryId);
              return (
                <article
                  key={article.id}
                  className="flex flex-col bg-slate-900/80 rounded-2xl border border-slate-800/80 hover:border-emerald-600/40 transition group p-6"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-emerald-400 border border-slate-700/60 font-medium">
                      {cat?.nameEnglish || 'Research'}
                    </span>
                    <span>{article.readingTimeMinutes} min read</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition leading-snug">
                    <Link href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>

                  {article.subtitle && (
                    <p className="text-xs text-emerald-500 font-medium mt-1">
                      {article.subtitle}
                    </p>
                  )}

                  <p className="text-xs text-slate-400 mt-3 line-clamp-3 leading-relaxed flex-grow">
                    {article.excerpt || 'Read the full verified research article with authentic source citations...'}
                  </p>

                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Scholar Verified
                    </span>
                    <Link
                      href={`/articles/${article.slug}`}
                      className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                    >
                      Read Article →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
