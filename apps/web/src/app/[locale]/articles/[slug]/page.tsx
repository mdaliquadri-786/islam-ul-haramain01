/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Public Article Reader view for ISLAM UL HARAMAIN.
 *              Displays published articles with verified citations, scholar review provenance,
 *              licensing notices, and personal library bookmarking.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleService } from '@/lib/articles';
import { BookmarkButton } from '@/components/BookmarkButton';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import type { Metadata } from 'next';
import {
  buildArticleDetailMetadata,
  JsonLd,
  createBreadcrumbSchema,
  createArticleSchema
} from '@/lib/seo';

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  const service = await getArticleService();
  const data = await service.getPublicArticleBySlug(slug);

  if (!data || !isSupportedLocale(locale)) {
    return {
      title: 'Article Not Found — ISLAM UL HARAMAIN',
      robots: {
        index: false,
        follow: false
      }
    };
  }

  return buildArticleDetailMetadata(
    {
      slug: data.article.slug,
      title: data.revision.title,
      excerpt: data.revision.excerpt || undefined,
      subtitle: data.revision.subtitle || undefined,
      publishedAt: data.article.publishedAt || data.article.createdAt,
      updatedAt: data.article.updatedAt,
      categoryName: data.category?.nameEnglish
    },
    typedLocale
  );
}

export default async function LocalizedSingleArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const service = await getArticleService();
  const data = await service.getPublicArticleBySlug(slug);

  if (!data) {
    notFound();
  }

  const { article, revision, category } = data;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.nav.articles, path: '/articles' },
            { name: revision.title, path: `/articles/${article.slug}` }
          ],
          typedLocale
        )}
      />
      <JsonLd
        data={createArticleSchema({
          title: revision.title,
          slug: article.slug,
          locale: typedLocale,
          excerpt: revision.excerpt || undefined,
          publishedAt: article.publishedAt || article.createdAt,
          updatedAt: article.updatedAt,
          categoryName: category?.nameEnglish
        })}
      />
      {/* Navigation Breadcrumbs */}
      <nav style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <Link href={`/${typedLocale}`} style={{ color: '#047857', textDecoration: 'none' }}>
          {dict.nav.home}
        </Link>
        <span style={{ color: '#9ca3af' }}>/</span>
        <Link href={`/${typedLocale}/articles`} style={{ color: '#047857', textDecoration: 'none' }}>
          {dict.nav.articles}
        </Link>
        {category && (
          <>
            <span style={{ color: '#9ca3af' }}>/</span>
            <Link
              href={`/${typedLocale}/articles?category=${category.slug}`}
              style={{ color: '#64748b', textDecoration: 'none' }}
            >
              {typedLocale === 'ar' ? category.nameArabic : typedLocale === 'ur' ? category.nameUrdu : category.nameEnglish}
            </Link>
          </>
        )}
      </nav>

      {/* Article Header Card */}
      <header
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {category && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#047857', padding: '0.2rem 0.6rem', borderRadius: '0.375rem', border: '1px solid #a7f3d0' }}>
                {typedLocale === 'ar' ? category.nameArabic : typedLocale === 'ur' ? category.nameUrdu : category.nameEnglish}
              </span>
            )}
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              ⏱️ {article.readingTimeMinutes || 5} min read
            </span>
          </div>

          <BookmarkButton
            contentType="article"
            contentReference={article.slug}
          />
        </div>

        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>
          {revision.title}
        </h1>

        {revision.subtitle && (
          <p style={{ margin: '0 0 1.25rem 0', fontSize: '1.15rem', color: '#475569', lineHeight: '1.5' }}>
            {revision.subtitle}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
          <div>{dict.articles.author}: <strong style={{ color: '#1e293b' }}>{article.authorId || 'Editorial Scholar'}</strong></div>
          <div>✓ {dict.articles.scholarReviewer}: <strong style={{ color: '#047857' }}>Scholar Verified</strong></div>
          {article.publishedAt && (
            <div>{dict.articles.publishedAt}: {new Date(article.publishedAt).toLocaleDateString()}</div>
          )}
        </div>
      </header>

      {/* Article Body */}
      <article
        style={{
          fontSize: '1.05rem',
          lineHeight: '1.8',
          color: '#1e293b',
          whiteSpace: 'pre-line',
          marginBottom: '3rem'
        }}
      >
        {revision.bodyMarkdown}
      </article>

      {/* Citations & References Section */}
      {revision.sourceReferences && revision.sourceReferences.length > 0 && (
        <section
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            📚 {dict.articles.citations}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {revision.sourceReferences.map((ref, idx) => (
              <li
                key={idx}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  color: '#334155'
                }}
              >
                {ref.citationType === 'quran' && '📖 '}
                {ref.citationType === 'hadith' && '📜 '}
                <strong>{ref.reference}</strong>
                {ref.textExcerpt && <span style={{ color: '#64748b' }}> — {ref.textExcerpt}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Cryptographic Revision Provenance Footer */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f1f5f9',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div>Revision #{revision.revisionNumber} • Authenticated Scholarly Publication</div>
        <div>
          <span>{dict.articles.revisionHash}: </span>
          <code style={{ fontFamily: 'monospace', color: '#0f172a' }}>{revision.contentHash.slice(0, 20)}...</code>
        </div>
      </div>
    </div>
  );
}
