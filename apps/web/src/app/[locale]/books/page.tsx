/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Digital Islamic Books Catalog.
 * Lists authentic classical and verified Islamic texts categorized by domain.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BooksService } from '@islamic/database';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import type { Metadata } from 'next';
import { buildBooksIndexMetadata, JsonLd, createBreadcrumbSchema } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildBooksIndexMetadata(typedLocale);
}

export default async function BooksCatalogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const search = searchParams ? await searchParams : {};
  const selectedCategory = search.category || 'all';

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const isRtl = typedLocale === 'ar' || typedLocale === 'ur';

  const booksService = new BooksService();
  const books = await booksService.listBooks({
    category: selectedCategory !== 'all' ? selectedCategory : undefined
  });

  const categories = [
    { id: 'all', label: dict.common.all },
    { id: 'hadith_literature', label: dict.books.categoryHadithLiterature },
    { id: 'aqeedah', label: dict.books.categoryAqeedah },
    { id: 'fiqh', label: dict.books.categoryFiqh },
    { id: 'adab_zuhd', label: dict.books.categoryAdabZuhd }
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.books.title, path: '/books' }
          ],
          typedLocale
        )}
      />
      {/* Header */}
      <header
        style={{
          marginBottom: '2rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#065f46',
                margin: '0 0 0.5rem 0',
                fontFamily: isRtl ? "Amiri, 'Traditional Arabic', serif" : 'inherit'
              }}
            >
              📚 {dict.books.catalogTitle}
            </h1>
            <p style={{ margin: 0, color: '#4b5563', fontSize: '1.05rem' }}>
              {dict.books.catalogSubtitle}
            </p>
          </div>

          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              ✓ {books.length} {dict.books.title} ({dict.books.publicDomain})
            </span>
          </div>
        </div>
      </header>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/${typedLocale}/books${cat.id !== 'all' ? `?category=${cat.id}` : ''}`}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '0.375rem',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? '#047857' : '#ffffff',
                color: isActive ? '#ffffff' : '#334155',
                border: '1px solid',
                borderColor: isActive ? '#047857' : '#cbd5e1',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Books Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {books.map((book) => {
          const title =
            typedLocale === 'ar'
              ? book.titleArabic
              : typedLocale === 'ur'
              ? book.titleUrdu
              : book.titleEnglish;

          const author =
            typedLocale === 'ar'
              ? book.authorNameArabic
              : typedLocale === 'ur'
              ? book.authorNameUrdu
              : book.authorNameEnglish;

          const desc =
            typedLocale === 'ar'
              ? book.descriptionArabic
              : typedLocale === 'ur'
              ? book.descriptionUrdu
              : book.descriptionEnglish;

          return (
            <div
              key={book.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Category & License Badge */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    gap: '0.5rem'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                      textTransform: 'capitalize'
                    }}
                  >
                    {book.category.replace('_', ' ')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem'
                    }}
                  >
                    {dict.books.publicDomain}
                  </span>
                </div>

                {/* Title */}
                <h2
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 0.5rem 0',
                    fontFamily: isRtl ? "Amiri, 'Traditional Arabic', serif" : 'inherit',
                    lineHeight: '1.5'
                  }}
                >
                  <Link
                    href={`/${typedLocale}/books/${book.slug}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {title}
                  </Link>
                </h2>

                {/* Author */}
                <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {dict.books.author}: {author}
                  {book.authorDeathYearAh && (
                    <span style={{ color: '#64748b', fontWeight: 400 }}>
                      {' '}— {dict.books.died} {book.authorDeathYearAh} AH ({book.authorDeathYearCe} CE)
                    </span>
                  )}
                </div>

                {/* Description */}
                {desc && (
                  <p
                    dir={isRtl ? 'rtl' : 'ltr'}
                    style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      lineHeight: '1.6',
                      margin: '0 0 1rem 0'
                    }}
                  >
                    {desc.substring(0, 160)}
                    {desc.length > 160 ? '…' : ''}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                  gap: '0.5rem'
                }}
              >
                <Link
                  href={`/${typedLocale}/books/${book.slug}`}
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#047857',
                    textDecoration: 'none'
                  }}
                >
                  {dict.books.tableOfContents} →
                </Link>

                <Link
                  href={`/${typedLocale}/books/${book.slug}/read`}
                  style={{
                    padding: '0.45rem 0.9rem',
                    backgroundColor: '#047857',
                    color: '#ffffff',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  📖 {dict.books.openReader}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology Disclaimer */}
      <footer
        style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#64748b',
          fontStyle: 'italic'
        }}
      >
        ⚖️ {dict.books.methodologyDisclaimer}
      </footer>
    </div>
  );
}
