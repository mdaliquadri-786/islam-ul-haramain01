/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Public Articles & Research index view.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleService } from '@/lib/articles';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { buildArticlesIndexMetadata, JsonLd, createBreadcrumbSchema } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; language?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildArticlesIndexMetadata(typedLocale);
}

export default async function ArticlesIndexPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { category, language } = await searchParams;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const service = await getArticleService();

  const [articlesData, categories] = await Promise.all([
    service.listPublicArticles({ categorySlug: category, language, limit: 30 }),
    service.listCategories()
  ]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.articles.title, path: '/articles' }
          ],
          typedLocale
        )}
      />
      {/* Header */}
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
              ✓ Sunni Peer-Reviewed
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Ahl al-Sunnah wa al-Jama‘ah
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            {dict.articles.title}
          </h1>
          <p style={{ margin: 0, color: '#475569', fontSize: '1.05rem', maxWidth: '700px' }}>
            {dict.articles.subtitle}
          </p>
        </div>

        <Link
          href={`/${typedLocale}/cms`}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '0.5rem',
            color: '#334155',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <span>🛡️ {dict.nav.cms}</span>
          <span>→</span>
        </Link>
      </header>

      {/* Category Filter Pills */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link
            href={`/${typedLocale}/articles`}
            style={{
              padding: '0.4rem 0.9rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '9999px',
              textDecoration: 'none',
              backgroundColor: !category ? '#047857' : '#f1f5f9',
              color: !category ? '#ffffff' : '#475569',
              border: `1px solid ${!category ? '#047857' : '#cbd5e1'}`
            }}
          >
            {dict.common.all}
          </Link>
          {categories.map((c) => {
            const isSelected = category === c.slug;
            return (
              <Link
                key={c.id}
                href={`/${typedLocale}/articles?category=${c.slug}`}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  backgroundColor: isSelected ? '#047857' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: `1px solid ${isSelected ? '#047857' : '#cbd5e1'}`
                }}
              >
                {typedLocale === 'ar' ? c.nameArabic : typedLocale === 'ur' ? c.nameUrdu : c.nameEnglish}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Articles Grid */}
      <section>
        {articlesData.articles.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✍️</div>
            <div style={{ fontWeight: 600, color: '#334155' }}>No published articles found in this category.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {articlesData.articles.map((art) => {
              const matchedCat = categories.find(c => c.id === art.categoryId);
              const catLabel = matchedCat
                ? (typedLocale === 'ar' ? matchedCat.nameArabic : typedLocale === 'ur' ? matchedCat.nameUrdu : matchedCat.nameEnglish)
                : (art.primaryMadhhab ? art.primaryMadhhab.toUpperCase() : 'General');

              return (
                <Link
                  key={art.id}
                  href={`/${typedLocale}/articles/${art.slug}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #a7f3d0' }}>
                        {catLabel}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ⏱️ {art.readingTimeMinutes || 5} min read
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
                      {art.title}
                    </h2>

                    {art.excerpt && (
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>✓ Scholar Verified</span>
                    <span style={{ color: '#047857', fontWeight: 600 }}>{dict.common.readMore} →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
