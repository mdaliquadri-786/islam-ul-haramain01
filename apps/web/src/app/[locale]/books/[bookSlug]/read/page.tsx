/**
 * @file page.tsx
 * @package @islamic/web
 * @description Dedicated Digital Islamic Book e-Reader page.
 * Route: /[locale]/books/[bookSlug]/read
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import { notFound } from 'next/navigation';
import { BooksService } from '@islamic/database';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { BookReader } from '@/components/BookReader';
import type { Metadata } from 'next';
import { buildBookReaderMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string; bookSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, bookSlug } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';

  const booksService = new BooksService();
  const book = await booksService.getBook(bookSlug);
  if (!book || !isSupportedLocale(locale)) return { title: 'Book Not Found | ISLAM UL HARAMAIN' };

  return buildBookReaderMetadata(book, typedLocale);
}

export default async function BookReaderPage({ params }: PageProps) {
  const { locale, bookSlug } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  const booksService = new BooksService();
  const book = await booksService.getBook(bookSlug);
  if (!book) notFound();

  const editions = await booksService.getEditions(book.id);
  const volumes = await booksService.getVolumes(book.id);
  const sections = await booksService.getSections(book.id, 1);
  const initialContents =
    sections.length > 0 ? await booksService.getContentForSection(sections[0].id) : [];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1rem' }}>
      <BookReader
        book={book}
        editions={editions}
        volumes={volumes}
        initialSections={sections}
        initialContents={initialContents}
        locale={typedLocale}
        dict={dict}
      />
    </div>
  );
}
