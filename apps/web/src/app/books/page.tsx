/**
 * @file page.tsx
 * @package @islamic/web
 * @description Digital Islamic Books Index (Unlocalized fallback).
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import Link from 'next/link';
import { BooksService } from '@islamic/database';

export const metadata = {
  title: 'Digital Islamic Books Library | ISLAM UL HARAMAIN (إسلام الحرمين)',
  description: 'Verified classical Islamic books e-Reader with chapters and reading progress.'
};

export default async function BooksRootPage() {
  const booksService = new BooksService();
  const books = await booksService.listBooks();

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <Link href="/" style={{ color: '#047857', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                ← Platform Home
              </Link>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.25rem 0 0.5rem 0', color: '#111827' }}>
              ISLAM UL HARAMAIN
            </h1>
            <p style={{ margin: 0, color: '#374151', fontSize: '1.125rem' }}>
              إسلام الحرمين — Digital Islamic Books Library (المكتبة الإسلامية)
            </p>
          </div>
          <div>
            <span
              style={{
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                border: '1px solid #a7f3d0'
              }}
            >
              ✓ {books.length} Classical Books (Public Domain)
            </span>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {books.map((book) => (
          <div
            key={book.id}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                  {book.category.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                  Public Domain
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                <Link href={`/en/books/${book.slug}`} style={{ color: '#111827', textDecoration: 'none' }}>
                  {book.titleEnglish}
                </Link>
              </h2>
              <div style={{ fontSize: '0.9rem', color: '#047857', marginBottom: '0.5rem' }}>
                {book.authorNameEnglish} ({book.authorDeathYearAh} AH)
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5' }}>
                {book.descriptionEnglish?.substring(0, 150)}...
              </p>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
              <Link
                href={`/en/books/${book.slug}/read`}
                style={{
                  display: 'inline-block',
                  padding: '0.4rem 0.8rem',
                  backgroundColor: '#047857',
                  color: '#ffffff',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Read Book →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
