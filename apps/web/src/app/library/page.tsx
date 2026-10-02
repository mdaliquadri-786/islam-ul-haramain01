'use client';

/**
 * @file page.tsx
 * @package @islamic/web
 * @description Authenticated User Library & Bookmarks dashboard.
 * Displays private saved verses, hadiths, duas, and published research articles with full user isolation.
 * Milestone: M3.3 — User Library & Bookmarks
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { BookmarkContentType, ResolvedBookmark } from '@islamic/islamic-engine';

type FilterType = 'all' | BookmarkContentType;

export default function UserLibraryPage() {
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
          message: `Removed "${title}" from your library.`
        });
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove bookmark.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error removing bookmark.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setRemovingId(null);
    }
  };

  const getBadgeColor = (contentType: BookmarkContentType) => {
    switch (contentType) {
      case 'quran':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'hadith':
        return 'bg-slate-900 text-slate-300 border-slate-700';
      case 'dua':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'article':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Count items by content type
  const counts = {
    all: items.length,
    quran: items.filter(i => i.bookmark.contentType === 'quran').length,
    hadith: items.filter(i => i.bookmark.contentType === 'hadith').length,
    dua: items.filter(i => i.bookmark.contentType === 'dua').length,
    article: items.filter(i => i.bookmark.contentType === 'article').length
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full">
                Personal Devotional Suite
              </span>
              <span className="text-xs text-slate-400">
                Private & Secure
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-baseline gap-3">
              User Library & Bookmarks
              <span className="font-serif text-emerald-500 text-2xl font-normal">
                (المكتبة الخاصة)
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Your saved Quranic verses, prophetic traditions, daily supplications, and verified scholarly research articles. All bookmarks preserve authentic source references.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              Authenticated Session
            </span>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
                : 'bg-red-950/80 text-red-200 border-red-800'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline ml-4 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'All Items' },
              { id: 'quran', label: 'Holy Quran (القرآن)' },
              { id: 'hadith', label: 'Hadith (الحديث)' },
              { id: 'dua', label: 'Duas & Adhkar (الأدعية)' },
              { id: 'article', label: 'Articles (المقالات)' }
            ] as const
          ).map(tab => {
            const isSelected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800'
                }`}
              >
                {tab.label} ({counts[tab.id]})
              </button>
            );
          })}
        </div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800">
            Loading your personal library...
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-4 p-6">
            <div className="text-4xl text-slate-600">🔖</div>
            <h3 className="text-base font-bold text-slate-200">
              No saved items in this category
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Save verses, prophetic traditions, morning/evening adhkar, and research articles using the bookmark button on any page.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/quran"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                Browse Holy Quran →
              </Link>
              <Link
                href="/hadith"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                Browse Hadith →
              </Link>
              <Link
                href="/duas"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                Browse Duas →
              </Link>
              <Link
                href="/articles"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                Browse Articles →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map(resolved => {
              const b = resolved.bookmark;
              const isRemoving = removingId === b.id;

              return (
                <div
                  key={b.id}
                  className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header: Badge & Folder */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getBadgeColor(
                            b.contentType
                          )}`}
                        >
                          {resolved.badgeLabel}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {b.contentReference}
                        </span>
                      </div>

                      {b.folderName && b.folderName !== 'default' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          📁 {b.folderName}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div>
                      {resolved.isAvailable ? (
                        <Link
                          href={resolved.canonicalUrl}
                          className="text-base font-bold text-white hover:text-emerald-400 transition"
                        >
                          {resolved.title}
                        </Link>
                      ) : (
                        <div className="text-base font-bold text-amber-400 flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>{resolved.title}</span>
                        </div>
                      )}

                      {resolved.subtitle && (
                        <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                          {resolved.subtitle}
                        </p>
                      )}

                      {!resolved.isAvailable && resolved.statusMessage && (
                        <p className="text-xs text-slate-400 italic mt-1 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                          {resolved.statusMessage}
                        </p>
                      )}
                    </div>

                    {/* Private User Note */}
                    {b.note && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        &quot;{b.note}&quot;
                      </p>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Saved {new Date(b.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-3">
                      {resolved.isAvailable && (
                        <Link
                          href={resolved.canonicalUrl}
                          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
                        >
                          <span>Open</span>
                          <span>→</span>
                        </Link>
                      )}

                      <button
                        onClick={() => handleRemove(b.id, resolved.title)}
                        disabled={isRemoving}
                        className="text-red-400 hover:text-red-300 font-medium transition cursor-pointer"
                        title="Remove bookmark"
                      >
                        {isRemoving ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
