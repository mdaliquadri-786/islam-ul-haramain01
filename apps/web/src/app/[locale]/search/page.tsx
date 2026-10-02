/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Multi-lingual Search & Instant Citation Router interface.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { executeSearch } from '@/lib/search';
import { SearchResultType } from '@islamic/islamic-engine';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import type { Metadata } from 'next';
import { buildSearchPageMetadata } from '@/lib/seo';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    type?: string;
    lang?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildSearchPageMetadata(typedLocale);
}

export default async function LocalizedSearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params;
  const sParams = await searchParams;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  const query = (sParams.q || '').trim();
  const currentType = sParams.type || 'all';
  const currentLang = (sParams.lang === 'arabic' || sParams.lang === 'english' || sParams.lang === 'urdu')
    ? sParams.lang
    : 'all';
  const currentPage = Math.max(1, parseInt(sParams.page || '1', 10));
  const limit = 20;
  const offset = (currentPage - 1) * limit;

  let typeFilter: SearchResultType[] | undefined;
  if (currentType && currentType !== 'all') {
    typeFilter = [currentType as SearchResultType];
  }

  const searchResponse = query
    ? await executeSearch({
        query,
        typeFilter,
        language: currentLang,
        limit,
        offset
      })
    : null;

  const results = searchResponse?.results || [];
  const total = searchResponse?.total || 0;
  const citation = searchResponse?.citation || null;
  const executionTimeMs = searchResponse?.executionTimeMs || 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header & Search Bar */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.5rem' }}>
          {dict.nav.search} — {dict.common.platformName}
        </h1>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Instant primary citation jumping (&lt;10 ms SLA) & full-text search across Quran, Hadith, and Duas.
        </p>

        <form method="GET" action={`/${typedLocale}/search`} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={dict.common.searchPlaceholder}
            aria-label={dict.common.search}
            style={{
              flex: 1,
              padding: '0.85rem 1.25rem',
              fontSize: '1rem',
              border: '2px solid #059669',
              borderRadius: '0.5rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              background: '#059669',
              color: '#ffffff',
              padding: '0.85rem 1.75rem',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}
          >
            {dict.common.search}
          </button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>{dict.common.filter}:</span>
          {[
            { id: 'all', label: dict.common.all },
            { id: 'quran', label: dict.quran.title },
            { id: 'hadith', label: dict.hadith.title },
            { id: 'dua', label: dict.duas.title }
          ].map((tab) => {
            const isSelected = currentType === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/${typedLocale}/search?q=${encodeURIComponent(query)}&type=${tab.id}&lang=${currentLang}`}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  backgroundColor: isSelected ? '#047857' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: `1px solid ${isSelected ? '#047857' : '#cbd5e1'}`
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Instant Citation Match Banner */}
      {citation && (
        <section
          style={{
            backgroundColor: '#ecfdf5',
            border: '2px solid #10b981',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
              ⚡ Instant Primary Citation Match (&lt; 0.1 ms)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#047857' }}>
              Reference: {citation.canonicalUrl}
            </span>
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#064e3b', marginBottom: '0.5rem' }}>
            {citation.displayText}
          </div>
          {citation.previewArabic && (
            <div dir="rtl" className="font-quran" style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              {citation.previewArabic}
            </div>
          )}
          {citation.previewTranslation && (
            <div style={{ fontSize: '0.95rem', color: '#334155' }}>
              {citation.previewTranslation}
            </div>
          )}
        </section>
      )}

      {/* Search Results List */}
      {query && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Found <strong>{total}</strong> results</span>
            <span>Query executed in <strong>{executionTimeMs.toFixed(1)} ms</strong></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((res) => (
              <article
                key={res.id}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', color: '#334155' }}>
                    {res.type.toUpperCase()} • {res.reference}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Score: {res.score}
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
                  {res.title}
                </div>
                {res.arabicText && (
                  <div dir="rtl" className="font-quran" style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.4rem' }}>
                    {res.arabicText}
                  </div>
                )}
                <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                  {res.highlightSnippet || res.translationText}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
