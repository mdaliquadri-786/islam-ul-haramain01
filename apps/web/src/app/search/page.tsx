import Link from 'next/link';
import { executeSearch } from '../../lib/search';
import { SearchResultType } from '@islamic/islamic-engine';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    lang?: string;
    page?: string;
  }>;
}

function renderSafeHighlight(snippet: string) {
  const parts = snippet.split(/(<mark>.*?<\/mark>)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('<mark>') && part.endsWith('</mark>')) {
          const content = part.slice(6, -7);
          return (
            <mark
              key={idx}
              style={{
                backgroundColor: '#fef08a',
                color: '#854d0e',
                padding: '0 2px',
                borderRadius: '2px',
              }}
            >
              {content}
            </mark>
          );
        }
        return part;
      })}
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params.q || '').trim();
  const currentType = params.type || 'all';
  const currentLang = (params.lang === 'arabic' || params.lang === 'english' || params.lang === 'urdu')
    ? params.lang
    : 'all';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
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
  const totalPages = Math.ceil(total / limit);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header & Search Bar */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Link href="/" style={{ color: '#047857', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Home
          </Link>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            ISLAM UL HARAMAIN Search & Citation Router
          </span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
          Islamic Knowledge Search
        </h1>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
          Direct citation router (<code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>2:255</code>, <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>Bukhari 1</code>, <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>Muslim 93</code>) & multi-lingual search across Quran, Hadith, and Adhkar.
        </p>

        {/* Search Input Form */}
        <form action="/search" method="GET" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search citation (e.g. 2:255, Bukhari 1) or text (e.g. Merciful, intention, دعا)..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              border: '2px solid #059669',
              borderRadius: '8px',
              outline: 'none'
            }}
          />
          {currentType !== 'all' && <input type="hidden" name="type" value={currentType} />}
          {currentLang !== 'all' && <input type="hidden" name="lang" value={currentLang} />}
          <button
            type="submit"
            style={{
              background: '#059669',
              color: '#ffffff',
              padding: '0.75rem 1.75rem',
              fontSize: '1rem',
              fontWeight: 600,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
          {[
            { id: 'all', label: 'All Results' },
            { id: 'quran_ayah', label: 'Quran (Arabic)' },
            { id: 'quran_translation', label: 'Translations (EN/UR)' },
            { id: 'hadith', label: 'Hadith (Kutub al-Sittah)' },
            { id: 'dua', label: 'Duas & Adhkar' }
          ].map((tab) => {
            const isActive = currentType === tab.id;
            const paramsObj = new URLSearchParams();
            if (query) paramsObj.set('q', query);
            if (tab.id !== 'all') paramsObj.set('type', tab.id);
            if (currentLang !== 'all') paramsObj.set('lang', currentLang);

            return (
              <Link
                key={tab.id}
                href={`/search?${paramsObj.toString()}`}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#ffffff' : '#374151',
                  background: isActive ? '#059669' : '#f3f4f6',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {/* Direct Citation Recognition Banner */}
        {citation && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #10b981',
              borderRadius: '8px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: '#059669', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  CITATION DETECTED
                </span>
                <strong style={{ color: '#065f46', fontSize: '1.1rem' }}>
                  {citation.displayText}
                </strong>
              </div>
              <Link
                href={citation.canonicalUrl}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                Jump to Source →
              </Link>
            </div>

            {citation.previewArabic && (
              <p
                dir="rtl"
                style={{
                  fontFamily: "'Amiri', 'Traditional Arabic', serif",
                  fontSize: '1.4rem',
                  color: '#064e3b',
                  lineHeight: '2rem',
                  margin: '0.5rem 0'
                }}
              >
                {citation.previewArabic}
              </p>
            )}

            {citation.previewTranslation && (
              <p style={{ color: '#065f46', fontSize: '0.95rem', margin: 0 }}>
                {citation.previewTranslation}
              </p>
            )}
          </div>
        )}

        {/* Execution Metrics Bar */}
        {query && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>
              Found <strong>{total}</strong> result{total === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
            </span>
            <span>
              Resolved in <strong>{executionTimeMs} ms</strong> (Citation SLA: &lt;10 ms)
            </span>
          </div>
        )}

        {/* Search Results List */}
        {results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {results.map((res) => (
              <div
                key={res.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {/* Result Header Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        background:
                          res.type === 'quran_ayah'
                            ? '#dbeafe'
                            : res.type === 'quran_translation'
                            ? '#e0e7ff'
                            : res.type === 'hadith'
                            ? '#fef3c7'
                            : '#dcfce7',
                        color:
                          res.type === 'quran_ayah'
                            ? '#1e40af'
                            : res.type === 'quran_translation'
                            ? '#3730a3'
                            : res.type === 'hadith'
                            ? '#92400e'
                            : '#166534'
                      }}
                    >
                      {res.type.replace('_', ' ')}
                    </span>
                    <strong style={{ color: '#111827', fontSize: '1rem' }}>
                      {res.title}
                    </strong>
                  </div>

                  <Link
                    href={res.canonicalUrl}
                    style={{ color: '#059669', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}
                  >
                    View Record →
                  </Link>
                </div>

                {/* Arabic Text (if present) */}
                {res.arabicText && (
                  <p
                    dir="rtl"
                    style={{
                      fontFamily: "'Amiri', 'Traditional Arabic', serif",
                      fontSize: '1.35rem',
                      lineHeight: '2.1rem',
                      color: '#111827',
                      margin: '0.75rem 0'
                    }}
                  >
                    {res.arabicText}
                  </p>
                )}

                {/* Translation / Highlight Snippet */}
                {res.highlightSnippet ? (
                  <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: '1.5rem', margin: '0.5rem 0' }}>
                    {renderSafeHighlight(res.highlightSnippet)}
                  </p>
                ) : res.translationText ? (
                  <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: '1.5rem', margin: '0.5rem 0' }}>
                    {res.translationText}
                  </p>
                ) : null}

                {/* Metadata details */}
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.75rem' }}>
                  <span>Reference: <code>{res.reference}</code></span>
                  {Boolean(res.metadata?.gradeLevel) && (
                    <span style={{ color: '#059669', fontWeight: 600 }}>Grade: {String(res.metadata?.gradeLevel)}</span>
                  )}
                  {Boolean(res.metadata?.repeatCount) && (
                    <span>Repeat: {String(res.metadata?.repeatCount)}x</span>
                  )}
                  <span>Score: {Math.round(res.score)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px dashed #d1d5db'
            }}
          >
            <h3 style={{ fontSize: '1.2rem', color: '#374151', marginBottom: '0.5rem' }}>
              No matching records found for &ldquo;{query}&rdquo;
            </h3>
            <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto' }}>
              Try searching by Quran citation like <code>2:255</code>, Hadith citation like <code>Bukhari 1</code>, or search keywords in English, Arabic, or Urdu.
            </p>
          </div>
        ) : (
          /* Empty Initial State: Example queries guide */
          <div
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '0.75rem' }}>
              Instant Primary Citation Resolution
            </h3>
            <p style={{ color: '#4b5563', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
              Enter any canonical reference to jump directly to authentic source texts with sub-millisecond routing:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
              {[
                { label: 'Quran 2:255 (Ayat al-Kursi)', query: '2:255' },
                { label: 'Quran 1:1 (Al-Fatihah)', query: '1:1' },
                { label: 'Bukhari 1 (Intentions)', query: 'Bukhari 1' },
                { label: 'Muslim 93 (Hadith Jibril)', query: 'Muslim 93' },
                { label: 'Abu Dawud 1 (Purification)', query: 'Abu Dawud 1' },
                { label: 'Tirmidhi 1', query: 'Tirmidhi 1' },
                { label: 'Morning Adhkar', query: 'morning' },
                { label: 'Arabic: الحمد لله', query: 'الحمد لله' },
                { label: 'Urdu: رحمان', query: 'رحمان' }
              ].map((ex) => (
                <Link
                  key={ex.query}
                  href={`/search?q=${encodeURIComponent(ex.query)}`}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '20px',
                    padding: '0.4rem 0.9rem',
                    color: '#059669',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  {ex.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            {currentPage > 1 && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&type=${currentType}&lang=${currentLang}&page=${currentPage - 1}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#374151'
                }}
              >
                ← Previous
              </Link>
            )}
            <span style={{ padding: '0.5rem 1rem', color: '#6b7280' }}>
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&type=${currentType}&lang=${currentLang}&page=${currentPage + 1}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: '#374151'
                }}
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
