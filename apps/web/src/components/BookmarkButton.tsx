'use client';

/**
 * @file BookmarkButton.tsx
 * @package @islamic/web
 * @description Reusable bookmark action button for Quran, Hadith, Duas, and Articles.
 * Provides accessible, optimistic toggling with real-time saved state synchronization.
 * Milestone: M3.3 — User Library & Bookmarks
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { BookmarkContentType } from '@islamic/islamic-engine';
import { useToast } from './Toast';

interface BookmarkButtonProps {
  contentType: BookmarkContentType;
  contentReference: string;
  note?: string;
  className?: string;
  compact?: boolean;
  label?: string;
}

export function BookmarkButton({
  contentType,
  contentReference,
  note,
  className = '',
  compact = false,
  label
}: BookmarkButtonProps) {
  const toast = useToast();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/library/check?type=${encodeURIComponent(contentType)}&ref=${encodeURIComponent(contentReference)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsSaved(Boolean(data.isBookmarked));
        }
      }
    } catch {
      // Fallback gracefully on network / auth errors
    } finally {
      setLoading(false);
    }
  }, [contentType, contentReference]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (toggling) return;

    setToggling(true);
    const targetSaved = !isSaved;

    // Optimistic UI update
    setIsSaved(targetSaved);
    toast?.showToast(
      targetSaved ? 'Saved to Personal Library' : 'Removed from Personal Library',
      'success'
    );

    try {
      if (targetSaved) {
        // Create bookmark
        const res = await fetch('/api/library/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentType,
            contentReference,
            note
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          // If already saved (409), keep as saved
          if (res.status !== 409) {
            setIsSaved(false);
            console.error('Bookmark error:', errData.error);
          }
        }
      } else {
        // Delete bookmark
        const res = await fetch(
          `/api/library/bookmarks?type=${encodeURIComponent(contentType)}&ref=${encodeURIComponent(contentReference)}`,
          { method: 'DELETE' }
        );

        if (!res.ok) {
          // Revert optimistic update
          setIsSaved(true);
        }
      }
    } catch (err) {
      // Revert optimistic update on failure
      setIsSaved(!targetSaved);
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setToggling(false);
    }
  };

  const buttonAriaLabel = isSaved
    ? `Remove ${contentType} ${contentReference} from personal library`
    : `Save ${contentType} ${contentReference} to personal library`;

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || toggling}
      aria-label={buttonAriaLabel}
      aria-pressed={isSaved}
      title={isSaved ? 'Saved in Personal Library (Click to unsave)' : 'Save to Personal Library'}
      className={`inline-flex items-center gap-1.5 transition rounded-lg text-xs font-medium cursor-pointer ${
        compact ? 'p-1.5' : 'px-3 py-1.5'
      } ${
        isSaved
          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900/60'
          : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
      } ${className}`}
    >
      {/* SVG Bookmark Icon */}
      <svg
        className={`w-4 h-4 transition-transform ${isSaved ? 'scale-110' : ''}`}
        fill={isSaved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={isSaved ? '1.5' : '2'}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>

      {!compact && (
        <span>
          {label ? label : isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
}
