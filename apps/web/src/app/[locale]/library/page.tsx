'use client';

/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Authenticated User Library & Bookmarks dashboard.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { BookmarkContentType, ResolvedBookmark } from '@islamic/islamic-engine';
import { getDictionary, isSupportedLocale, DEFAULT_LOCALE, type Locale } from '@islamic/ui';

type FilterType = 'all' | BookmarkContentType;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function LocalizedUserLibraryPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const localeStr = resolvedParams?.locale || DEFAULT_LOCALE;
  const typedLocale: Locale = isSupportedLocale(localeStr) ? localeStr : DEFAULT_LOCALE;
  const dict = getDictionary(typedLocale);

  const [items, setItems] = useState<ResolvedBookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const url = activeFilter === 'all'
        ? '/api/library/bookmarks'
        : `/api/library/bookmarks?type=${encodeURIComponent(activeFilter)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setItems(data.items || []);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load personal library.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemove = async (bookmarkId: string, title: string) => {
    try {
      setRemovingId(bookmarkId);
      const res = await fetch(`/api/library/bookmarks?id=${encodeURIComponent(bookmarkId)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item.bookmark.id !== bookmarkId));
        setFeedback({
          type: 'success',
          message: `Successfully removed "${title}" from personal library.`
        });
      } else {
        setFeedback({ type: 'error', message: 'Failed to remove bookmark from library.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setRemovingId(null);
    }
  };

  const getTargetUrl = (item: ResolvedBookmark): string => {
    const { bookmark } = item;
    switch (bookmark.contentType) {
      case 'quran':
        return `/${typedLocale}/quran/${bookmark.surahNumber || '1'}#ayah-${bookmark.ayahNumber || '1'}`;
      case 'hadith':
        return `/${typedLocale}/hadith/${bookmark.hadithCollection || 'bukhari'}#hadith-${bookmark.hadithNumber || '1'}`;
      case 'dua':
        return `/${typedLocale}/duas/${bookmark.duaCategory || 'when-waking-up'}#${bookmark.contentReference}`;
      case 'article':
        return `/${typedLocale}/articles/${bookmark.contentReference}`;
      default:
        return `/${typedLocale}`;
    }
  };

  const counts = {
    all: items.length,
    quran: items.filter(i => i.bookmark.contentType === 'quran').length,
    hadith: items.filter(i => i.bookmark.contentType === 'hadith').length,
    dua: items.filter(i => i.bookmark.contentType === 'dua').length,
    article: items.filter(i => i.bookmark.contentType === 'article').length
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
              Authenticated Personal Library
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Private & Secure RLS
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            {dict.library.title}
          </h1>
          <p style={{ margin: 0, color: '#475569', fontSize: '1.05rem' }}>
            {dict.library.subtitle}
          </p>
        </div>

        <Link
          href={`/${typedLocale}/profile`}
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
          <span>⚙️ {dict.nav.profile}</span>
          <span>→</span>
        </Link>
      </header>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: feedback.type === 'success' ? '#065f46' : '#991b1b',
            border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
          >
            {dict.common.close}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            { id: 'all', label: dict.library.allBookmarks },
            { id: 'quran', label: dict.library.quranBookmarks },
            { id: 'hadith', label: dict.library.hadithBookmarks },
            { id: 'dua', label: dict.library.duaBookmarks },
            { id: 'article', label: dict.library.articleBookmarks }
          ].map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as FilterType)}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid #047857' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#047857' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#475569',
                  cursor: 'pointer'
                }}
              >
                {tab.label} ({counts[tab.id as keyof typeof counts]})
              </button>
            );
          })}
        </div>
      </section>

      {/* Bookmarks List */}
      <section>
        {loading ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', color: '#64748b' }}>
            {dict.common.loading}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔖</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem 0' }}>
              {dict.library.emptyTitle}
            </h2>
            <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
              {dict.library.emptyDescription}
            </p>
            <Link
              href={`/${typedLocale}/quran`}
              style={{ padding: '0.6rem 1.25rem', backgroundColor: '#047857', color: '#ffffff', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Browse Quran →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {items.map((item) => {
              const { bookmark, isAvailable, title, arabicText, translationText } = item;
              return (
                <article
                  key={bookmark.id}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', color: '#334155' }}>
                      {bookmark.contentType.toUpperCase()} • {bookmark.contentReference}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(bookmark.id, title || bookmark.contentReference)}
                      disabled={removingId === bookmark.id}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {removingId === bookmark.id ? 'Removing...' : `✕ ${dict.common.remove}`}
                    </button>
                  </div>

                  {!isAvailable ? (
                    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.375rem', fontSize: '0.85rem', color: '#92400e' }}>
                      ⚠️ {dict.library.unavailableWarning}
                    </div>
                  ) : (
                    <>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                        {title}
                      </h3>

                      {arabicText && (
                        <div dir="rtl" className="font-quran" style={{ fontSize: '1.4rem', color: '#1e293b', marginBottom: '0.75rem', lineHeight: '2.2' }}>
                          {arabicText}
                        </div>
                      )}

                      {translationText && (
                        <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', marginBottom: '0.75rem' }}>
                          {translationText}
                        </div>
                      )}

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Saved: {new Date(bookmark.createdAt).toLocaleDateString()}
                        </span>
                        <Link
                          href={getTargetUrl(item)}
                          style={{ fontSize: '0.85rem', fontWeight: 600, color: '#047857', textDecoration: 'none' }}
                        >
                          {dict.common.readMore} →
                        </Link>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
