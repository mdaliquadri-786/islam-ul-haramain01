/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Book Overview & Table of Contents page.
 * Route: /[locale]/books/[bookSlug]
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BooksService } from '@islamic/database';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { BookmarkButton } from '@/components/BookmarkButton';
import type { Metadata } from 'next';
import {
  buildBookDetailMetadata,
  JsonLd,
  createBreadcrumbSchema,
  createBookSchema
} from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string; bookSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, bookSlug } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';

  const booksService = new BooksService();
  const book = await booksService.getBook(bookSlug);
  if (!book || !isSupportedLocale(locale)) return { title: 'Book Not Found | ISLAM UL HARAMAIN' };

  return buildBookDetailMetadata(book, typedLocale);
}

export default async function BookOverviewPage({ params }: PageProps) {
  const { locale, bookSlug } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);
  const isRtl = typedLocale === 'ar' || typedLocale === 'ur';

  const booksService = new BooksService();
  const book = await booksService.getBook(bookSlug);
  if (!book) notFound();

  const editions = await booksService.getEditions(book.id);
  const volumes = await booksService.getVolumes(book.id);
  const sections = await booksService.getSections(book.id, 1);
  const provenance = await booksService.getProvenance(book.id);

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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <JsonLd
        data={createBreadcrumbSchema(
          [
            { name: dict.nav.home, path: '' },
            { name: dict.books.title, path: '/books' },
            { name: title, path: `/books/${book.slug}` }
          ],
          typedLocale
        )}
      />
      <JsonLd
        data={createBookSchema({
          title,
          slug: book.slug,
          locale: typedLocale,
          authorName: author,
          originalLanguage: book.originalLanguage,
          description: desc,
          authorDeathYearCe: book.authorDeathYearCe
        })}
      />
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
          <Link href={`/${typedLocale}`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.nav.home}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <Link href={`/${typedLocale}/books`} style={{ color: '#047857', textDecoration: 'none' }}>
            {dict.books.title}
          </Link>
          <span style={{ color: '#9ca3af' }}>/</span>
          <span style={{ color: '#6b7280' }}>{book.titleEnglish}</span>
        </div>
      </nav>

      {/* Book Hero Card */}
      <header
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.375rem',
                  textTransform: 'capitalize'
                }}
              >
                {book.category.replace('_', ' ')}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.375rem'
                }}
              >
                {dict.books.publicDomain}
              </span>
            </div>

            <h1
              dir={isRtl ? 'rtl' : 'ltr'}
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0.5rem 0',
                fontFamily: isRtl ? "Amiri, 'Traditional Arabic', serif" : 'inherit',
                lineHeight: '1.4'
              }}
            >
              {title}
            </h1>

            <div style={{ fontSize: '1.05rem', color: '#047857', fontWeight: 600, marginBottom: '0.5rem' }}>
              {dict.books.author}: {author}
              {book.authorDeathYearAh && (
                <span style={{ color: '#64748b', fontWeight: 400 }}>
                  {' '}— {dict.books.died} {book.authorDeathYearAh} AH ({book.authorDeathYearCe} CE)
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              <span>{dict.books.volumes}: {volumes.length}</span>
              {editions.length > 0 && <span>• {editions[0].editionTitle}</span>}
            </div>

            {desc && (
              <p
                dir={isRtl ? 'rtl' : 'ltr'}
                style={{
                  fontSize: '0.95rem',
                  color: '#475569',
                  lineHeight: '1.7',
                  margin: '0 0 1.5rem 0'
                }}
              >
                {desc}
              </p>
            )}

            {/* Read & Bookmark Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link
                href={`/${typedLocale}/books/${book.slug}/read`}
                style={{
                  padding: '0.65rem 1.5rem',
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                📖 {dict.books.readBook}
              </Link>

              <BookmarkButton
                contentType="book"
                contentReference={`${book.slug}:1:1`}
                compact={false}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Provenance & Licensing Information */}
      <section
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem'
        }}
      >
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', margin: '0 0 0.75rem 0' }}>
          🛡️ {dict.books.provenance}
        </h2>
        <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>{dict.books.licenseStatus}:</strong> {provenance?.licenseType} (
            {provenance?.licenseStatus === 'verified_permissible' ? 'Cleared' : provenance?.licenseStatus})
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>{dict.books.attribution}:</strong> {book.attributionRequirement}
          </p>
          {book.provenanceNotes && (
            <p style={{ margin: '0 0 0.5rem 0', color: '#64748b' }}>{book.provenanceNotes}</p>
          )}
          {book.sourceUrl && (
            <p style={{ margin: 0 }}>
              <strong>{dict.books.source}:</strong>{' '}
              <a
                href={book.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#047857' }}
              >
                {book.sourceUrl}
              </a>
            </p>
          )}
        </div>
      </section>

      {/* Table of Contents Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          📑 {dict.books.tableOfContents}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sections.map((sec) => (
            <Link
              key={sec.id}
              href={`/${typedLocale}/books/${book.slug}/read`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                  {dict.books.sections} {sec.sectionNumber}
                </div>
                <div
                  dir={isRtl ? 'rtl' : 'ltr'}
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#1e293b',
                    fontFamily: isRtl ? "Amiri, 'Traditional Arabic', serif" : 'inherit'
                  }}
                >
                  {typedLocale === 'ar' ? sec.titleArabic : sec.titleEnglish || sec.titleArabic}
                </div>
              </div>

              {sec.startPage && (
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  p. {sec.startPage}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Methodology Disclaimer */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.5rem',
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
