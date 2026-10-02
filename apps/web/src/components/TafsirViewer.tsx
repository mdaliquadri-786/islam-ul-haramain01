'use client';

/**
 * @file TafsirViewer.tsx
 * @package @islamic/web
 * @description Classical Tafsir Comparative Viewer component.
 * Displays tafsir commentary for a Quran ayah from multiple classical sources
 * side-by-side (desktop) or stacked/tabbed (mobile).
 *
 * CONTENT SAFETY:
 * - Never displays fabricated, AI-generated, or synthesized tafsir text.
 * - When text is unavailable, shows explicit "content unavailable" message.
 * - Attribution is always displayed per source.
 * - Methodology disclaimer is always present.
 * - The viewer does NOT declare any tafsir "correct" or "superior".
 *
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 */

import React, { useState, useEffect } from 'react';
import type { TafsirComparison, TafsirWork, TafsirEntry } from '@islamic/islamic-engine';
import type { Locale } from '@islamic/ui';

interface TafsirViewerProps {
  surahId: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;  // canonical Arabic text passed from parent (never duplicated)
  locale: Locale;
  initialComparison?: TafsirComparison | null;
  dict: {
    tafsir: {
      title: string;
      subtitle: string;
      compareMode: string;
      singleMode: string;
      selectSources: string;
      source: string;
      author: string;
      deathYear: string;
      licenseStatus: string;
      provenancePanel: string;
      attributionLabel: string;
      sourceReference: string;
      contentUnavailable: string;
      contentUnavailableReason: string;
      publicDomain: string;
      noSources: string;
      ayahReference: string;
      closeViewer: string;
      expandAll: string;
      collapseAll: string;
      viewerTitle: string;
      methodologyDisclaimer: string;
    };
    common: {
      close: string;
      loading: string;
    };
  };
  onClose?: () => void;
}

type ViewMode = 'compare' | 'single';

export function TafsirViewer({
  surahId,
  ayahNumber,
  surahName,
  ayahText,
  locale,
  initialComparison,
  dict,
  onClose
}: TafsirViewerProps) {
  const [comparison, setComparison] = useState<TafsirComparison | null>(
    initialComparison || null
  );
  const [viewMode, setViewMode] = useState<ViewMode>('compare');
  const [activeWorkId, setActiveWorkId] = useState<string | null>(null);
  const [showProvenance, setShowProvenance] = useState<string | null>(null); // workId
  const [isLoading, setIsLoading] = useState(!initialComparison);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isRtl = locale === 'ar' || locale === 'ur';

  useEffect(() => {
    if (!initialComparison) {
      fetchComparison();
    }
  }, [surahId, ayahNumber]);

  const fetchComparison = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/tafsir/ayah/${surahId}/${ayahNumber}?lang=ar&works=ibn-kathir,al-sadi`
      );
      const data = await res.json();
      if (data.success && data.comparison) {
        setComparison(data.comparison);
        if (data.comparison.entries.length > 0) {
          setActiveWorkId(data.comparison.entries[0].work.id);
        }
      } else {
        setErrorMsg(data.error || 'Failed to load tafsir.');
      }
    } catch {
      setErrorMsg('Failed to load tafsir.');
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkDisplayName = (work: TafsirWork): string => {
    if (locale === 'ar') return work.titleArabic;
    if (locale === 'ur') return work.titleUrdu;
    return work.titleEnglish;
  };

  const getAuthorDisplayName = (work: TafsirWork): string => {
    if (locale === 'ar') return work.authorNameArabic;
    if (locale === 'ur') return work.authorNameUrdu;
    return work.authorNameEnglish;
  };

  const getWorkDescription = (work: TafsirWork): string => {
    if (locale === 'ar') return work.descriptionArabic || work.descriptionEnglish || '';
    if (locale === 'ur') return work.descriptionUrdu || work.descriptionEnglish || '';
    return work.descriptionEnglish || '';
  };

  const renderEntryContent = (
    work: TafsirWork,
    entry: TafsirEntry | null
  ) => {
    if (!entry || entry.contentAvailability === 'metadata_only' || entry.contentAvailability === 'unavailable') {
      return (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '0.5rem',
            padding: '1.25rem',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚</div>
          <div style={{ fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
            {dict.tafsir.contentUnavailable}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {dict.tafsir.contentUnavailableReason}
          </div>
          {/* Always show attribution even when text is unavailable */}
          <div
            style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.78rem',
              color: '#475569'
            }}
          >
            <strong>{dict.tafsir.attributionLabel}:</strong>{' '}
            {work.attributionRequirement || `${work.titleEnglish} — ${work.authorNameEnglish}`}
          </div>
        </div>
      );
    }

    // Full text available (future: when verified edition is ingested)
    return (
      <div>
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            fontSize: '1.05rem',
            lineHeight: '2',
            color: '#1e293b',
            fontFamily:
              locale === 'ar'
                ? "Amiri, 'Traditional Arabic', serif"
                : locale === 'ur'
                ? "'Noto Nastaliq Urdu', serif"
                : 'inherit',
            textAlign: isRtl ? 'right' : 'left'
          }}
        >
          {entry.textContent}
        </div>
        {entry.sourcePageReference && (
          <div
            style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}
          >
            {dict.tafsir.sourceReference}: {entry.sourcePageReference}
          </div>
        )}
      </div>
    );
  };

  const renderSourceCard = (
    work: TafsirWork,
    entry: TafsirEntry | null,
    isCompareMode: boolean
  ) => {
    const isProvenanceOpen = showProvenance === work.id;

    return (
      <div
        key={work.id}
        style={{
          flex: isCompareMode ? '1 1 calc(50% - 0.5rem)' : '1 1 100%',
          minWidth: isCompareMode ? '280px' : 'auto',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        role="article"
        aria-label={`${dict.tafsir.source}: ${getWorkDisplayName(work)}`}
      >
        {/* Source Header */}
        <div
          style={{
            backgroundColor: '#f0fdf4',
            borderBottom: '1px solid #bbf7d0',
            padding: '0.875rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#065f46',
                marginBottom: '0.25rem',
                fontFamily:
                  locale === 'ar'
                    ? "Amiri, 'Traditional Arabic', serif"
                    : 'inherit'
              }}
            >
              {getWorkDisplayName(work)}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#047857' }}>
              {dict.tafsir.author}:{' '}
              <span
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                style={{
                  fontFamily:
                    locale === 'ar'
                      ? "Amiri, 'Traditional Arabic', serif"
                      : 'inherit'
                }}
              >
                {getAuthorDisplayName(work)}
              </span>
              {work.authorDeathYearHijri && (
                <span style={{ color: '#6b7280' }}>
                  {' '}— {dict.tafsir.deathYear} {work.authorDeathYearHijri} AH
                </span>
              )}
            </div>
          </div>
          {/* License badge */}
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor:
                work.licenseStatus === 'verified_permissible' ? '#d1fae5' : '#fef3c7',
              color:
                work.licenseStatus === 'verified_permissible' ? '#065f46' : '#92400e',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              whiteSpace: 'nowrap'
            }}
          >
            {work.licenseStatus === 'verified_permissible'
              ? dict.tafsir.publicDomain
              : work.licenseStatus}
          </span>
        </div>

        {/* Provenance Panel (expandable) */}
        <div style={{ padding: '0.5rem 1rem 0' }}>
          <button
            type="button"
            onClick={() => setShowProvenance(isProvenanceOpen ? null : work.id)}
            style={{
              fontSize: '0.75rem',
              color: '#059669',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            aria-expanded={isProvenanceOpen}
            aria-controls={`provenance-${work.id}`}
          >
            🛡️ {dict.tafsir.provenancePanel} {isProvenanceOpen ? '▲' : '▼'}
          </button>

          {isProvenanceOpen && (
            <div
              id={`provenance-${work.id}`}
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #a7f3d0',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                marginBottom: '0.5rem',
                fontSize: '0.78rem',
                color: '#374151',
                lineHeight: '1.6'
              }}
            >
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>{dict.tafsir.licenseStatus}:</strong>{' '}
                {work.licenseType}
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>{dict.tafsir.attributionLabel}:</strong>{' '}
                {work.attributionRequirement}
              </div>
              {work.provenanceNotes && (
                <div style={{ color: '#6b7280', marginTop: '0.25rem', fontSize: '0.72rem' }}>
                  {work.provenanceNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tafsir Content */}
        <div style={{ padding: '0.75rem 1rem 1rem', flex: 1 }}>
          {getWorkDescription(work) && (
            <div
              style={{
                fontSize: '0.78rem',
                color: '#64748b',
                marginBottom: '0.75rem',
                fontStyle: 'italic',
                borderLeft: locale !== 'ar' ? '2px solid #e2e8f0' : undefined,
                borderRight: locale === 'ar' ? '2px solid #e2e8f0' : undefined,
                paddingLeft: locale !== 'ar' ? '0.5rem' : undefined,
                paddingRight: locale === 'ar' ? '0.5rem' : undefined
              }}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              {getWorkDescription(work).substring(0, 180)}
              {getWorkDescription(work).length > 180 ? '…' : ''}
            </div>
          )}
          {renderEntryContent(work, entry)}
        </div>
      </div>
    );
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.tafsir.viewerTitle}
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid #1e293b',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid #334155',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399' }}>
            📖 {dict.tafsir.viewerTitle}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {dict.tafsir.ayahReference}: {surahName} ({surahId}:{ayahNumber})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          {comparison && comparison.entries.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setViewMode('compare')}
                style={{
                  backgroundColor: viewMode === 'compare' ? '#047857' : '#1e293b',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: viewMode === 'compare' ? 700 : 400,
                  cursor: 'pointer'
                }}
                aria-pressed={viewMode === 'compare'}
              >
                {dict.tafsir.compareMode}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                style={{
                  backgroundColor: viewMode === 'single' ? '#047857' : '#1e293b',
                  color: '#f8fafc',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  fontWeight: viewMode === 'single' ? 700 : 400,
                  cursor: 'pointer'
                }}
                aria-pressed={viewMode === 'single'}
              >
                {dict.tafsir.singleMode}
              </button>
            </>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={dict.tafsir.closeViewer}
              style={{
                backgroundColor: '#7f1d1d',
                color: '#fecaca',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              ✕ {dict.common.close}
            </button>
          )}
        </div>
      </div>

      {/* Ayah Text Display (canonical — passed from parent, NOT re-fetched) */}
      {ayahText && (
        <div
          dir="rtl"
          style={{
            backgroundColor: '#1e293b',
            borderRadius: '0.5rem',
            padding: '0.875rem 1rem',
            marginBottom: '1rem',
            fontFamily: "Amiri, 'Traditional Arabic', serif",
            fontSize: '1.4rem',
            lineHeight: '2.2',
            color: '#f1f5f9',
            textAlign: 'right'
          }}
        >
          {ayahText}
        </div>
      )}

      {/* Single-mode source tab selector */}
      {viewMode === 'single' && comparison && comparison.entries.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap'
          }}
          role="tablist"
          aria-label={dict.tafsir.selectSources}
        >
          {comparison.entries.map(({ work }) => (
            <button
              key={work.id}
              role="tab"
              aria-selected={activeWorkId === work.id}
              onClick={() => setActiveWorkId(work.id)}
              style={{
                backgroundColor: activeWorkId === work.id ? '#047857' : '#1e293b',
                color: '#f8fafc',
                border: '1px solid',
                borderColor: activeWorkId === work.id ? '#047857' : '#334155',
                borderRadius: '0.375rem',
                padding: '0.3rem 0.6rem',
                fontSize: '0.78rem',
                fontWeight: activeWorkId === work.id ? 700 : 400,
                cursor: 'pointer'
              }}
            >
              {getWorkDisplayName(work)}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      {isLoading && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
          {dict.common.loading}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: '#7f1d1d',
            color: '#fecaca',
            borderRadius: '0.375rem',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem'
          }}
        >
          {errorMsg}
        </div>
      )}

      {!isLoading && !errorMsg && comparison && (
        <>
          {comparison.entries.length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1.5rem' }}>
              {dict.tafsir.noSources}
            </div>
          ) : viewMode === 'compare' ? (
            /* Compare Mode: side-by-side flex wrap */
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
              role="region"
              aria-label={dict.tafsir.compareMode}
            >
              {comparison.entries.map(({ work, entry }) =>
                renderSourceCard(work, entry, true)
              )}
            </div>
          ) : (
            /* Single Mode: show only selected */
            <div role="tabpanel">
              {comparison.entries
                .filter(({ work }) =>
                  activeWorkId ? work.id === activeWorkId : true
                )
                .map(({ work, entry }) => renderSourceCard(work, entry, false))}
            </div>
          )}
        </>
      )}

      {/* Methodology Disclaimer — always visible */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #334155',
          fontSize: '0.72rem',
          color: '#64748b',
          fontStyle: 'italic',
          lineHeight: '1.5'
        }}
        role="note"
      >
        ⚖️ {dict.tafsir.methodologyDisclaimer}
      </div>
    </div>
  );
}
