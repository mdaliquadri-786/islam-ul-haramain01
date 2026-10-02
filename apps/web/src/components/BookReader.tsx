'use client';

/**
 * @file BookReader.tsx
 * @package @islamic/web
 * @description Accessible, responsive Digital Islamic Books e-Reader component.
 * Features 3-panel responsive layout, typography & width controls,
 * Table of Contents, Reading Progress tracking, Bookmark integration,
 * and strict content-safety / provenance display.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import React, { useState, useEffect, useCallback } from 'react';
import type {
  Book,
  BookEdition,
  BookVolume,
  BookSection,
  BookContent,
  UserReadingProgress
} from '@islamic/islamic-engine';
import type { Locale, Dictionary } from '@islamic/ui';
import { BookmarkButton } from './BookmarkButton';

interface BookReaderProps {
  book: Book;
  editions: BookEdition[];
  volumes: BookVolume[];
  initialSections: BookSection[];
  initialContents?: BookContent[];
  initialProgress?: UserReadingProgress | null;
  locale: Locale;
  dict: Dictionary;
}

type FontSize = 'sm' | 'md' | 'lg' | 'xl';
type ReadingWidth = 'narrow' | 'normal' | 'wide';
type PanelTab = 'toc' | 'meta' | 'search';

export function BookReader({
  book,
  editions,
  volumes,
  initialSections,
  initialContents = [],
  initialProgress,
  locale,
  dict
}: BookReaderProps) {
  const [selectedVolume, setSelectedVolume] = useState<number>(1);
  const [sections, setSections] = useState<BookSection[]>(initialSections);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    initialSections.length > 0 ? initialSections[0].id : ''
  );
  const [contents, setContents] = useState<BookContent[]>(initialContents);
  const [loadingContent, setLoadingContent] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(
    initialProgress ? initialProgress.progressPercentage : 0
  );
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [readingWidth, setReadingWidth] = useState<ReadingWidth>('normal');
  const [activeTab, setActiveTab] = useState<PanelTab>('toc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(false);

  const isRtl = locale === 'ar' || locale === 'ur';

  // Load section content whenever activeSectionId changes
  const loadSectionContent = useCallback(
    async (sectionId: string) => {
      if (!sectionId) return;
      setLoadingContent(true);
      try {
        const res = await fetch(`/api/books/${book.slug}/sections/${sectionId}`);
        const data = await res.json();
        if (data.success) {
          setContents(data.contents || []);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoadingContent(false);
      }
    },
    [book.slug]
  );

  useEffect(() => {
    if (activeSectionId && activeSectionId !== initialSections[0]?.id) {
      loadSectionContent(activeSectionId);
    }
  }, [activeSectionId, loadSectionContent, initialSections]);

  // Update sections when volume changes
  const handleVolumeChange = async (vol: number) => {
    setSelectedVolume(vol);
    try {
      const res = await fetch(`/api/books/${book.slug}`);
      const data = await res.json();
      if (data.success) {
        const volSections = (data.sections || []).filter(
          (s: BookSection) => s.volumeNumber === vol
        );
        setSections(volSections);
        if (volSections.length > 0) {
          setActiveSectionId(volSections[0].id);
        }
      }
    } catch {
      // Fallback
    }
  };

  // Save Reading Progress
  const updateProgress = async (newPct: number) => {
    setProgress(newPct);
    try {
      await fetch(`/api/books/${book.slug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volumeNumber: selectedVolume,
          sectionId: activeSectionId,
          progressPercentage: newPct
        })
      });
    } catch {
      // Non-blocking progress save
    }
  };

  // Book-local search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/books/${book.slug}/search?q=${encodeURIComponent(searchQuery)}&volume=${selectedVolume}`
      );
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const activeSection = sections.find((s) => s.id === activeSectionId);
  const activeSectionIndex = sections.findIndex((s) => s.id === activeSectionId);

  const handleNextSection = () => {
    if (activeSectionIndex < sections.length - 1) {
      const nextSec = sections[activeSectionIndex + 1];
      setActiveSectionId(nextSec.id);
      const calculatedPct = Math.round(((activeSectionIndex + 2) / sections.length) * 100);
      updateProgress(calculatedPct);
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      const prevSec = sections[activeSectionIndex - 1];
      setActiveSectionId(prevSec.id);
    }
  };

  // Typography Styles
  const getFontSizeRem = (): string => {
    switch (fontSize) {
      case 'sm':
        return '1rem';
      case 'lg':
        return '1.35rem';
      case 'xl':
        return '1.6rem';
      case 'md':
      default:
        return '1.15rem';
    }
  };

  const getMaxWidth = (): string => {
    switch (readingWidth) {
      case 'narrow':
        return '650px';
      case 'wide':
        return '1000px';
      case 'normal':
      default:
        return '800px';
    }
  };

  const getBookTitle = (): string => {
    if (locale === 'ar') return book.titleArabic;
    if (locale === 'ur') return book.titleUrdu;
    return book.titleEnglish;
  };

  const getAuthorName = (): string => {
    if (locale === 'ar') return book.authorNameArabic;
    if (locale === 'ur') return book.authorNameUrdu;
    return book.authorNameEnglish;
  };

  const getSectionTitle = (sec: BookSection): string => {
    if (locale === 'ar') return sec.titleArabic;
    if (locale === 'ur') return sec.titleUrdu || sec.titleArabic;
    return sec.titleEnglish || sec.titleArabic;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '85vh',
        backgroundColor: '#f8fafc',
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}
    >
      {/* Top Reading Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
            style={{
              padding: '0.4rem 0.65rem',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
            aria-label={dict.books.tableOfContents}
          >
            ☰ {dict.books.tableOfContents}
          </button>

          <div>
            <h1
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0
              }}
            >
              {getBookTitle()}
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {getAuthorName()}
              {book.authorDeathYearAh && ` (${dict.books.died} ${book.authorDeathYearAh} AH)`}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Font Size Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {(['sm', 'md', 'lg', 'xl'] as FontSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                style={{
                  padding: '0.2rem 0.5rem',
                  backgroundColor: fontSize === size ? '#047857' : '#f1f5f9',
                  color: fontSize === size ? '#ffffff' : '#334155',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Reading Width Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            {(['narrow', 'normal', 'wide'] as ReadingWidth[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setReadingWidth(w)}
                style={{
                  padding: '0.2rem 0.5rem',
                  backgroundColor: readingWidth === w ? '#047857' : '#f1f5f9',
                  color: readingWidth === w ? '#ffffff' : '#334155',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {w[0].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Bookmark Button */}
          <BookmarkButton
            contentType="book"
            contentReference={`${book.slug}:${selectedVolume}:${activeSection?.sectionNumber || 1}`}
            compact={true}
          />
        </div>
      </header>

      {/* Main 3-Column / Responsive Body */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Left Column: Collapsible Navigation / TOC */}
        <nav
          aria-label={dict.books.tableOfContents}
          style={{
            width: '280px',
            backgroundColor: '#ffffff',
            borderRight: isRtl ? 'none' : '1px solid #e2e8f0',
            borderLeft: isRtl ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          {/* Tab Selector */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('toc')}
              style={{
                flex: 1,
                padding: '0.6rem 0.4rem',
                border: 'none',
                borderBottom: activeTab === 'toc' ? '2px solid #047857' : 'none',
                backgroundColor: activeTab === 'toc' ? '#ffffff' : 'transparent',
                color: activeTab === 'toc' ? '#047857' : '#64748b',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              📑 {dict.books.sections}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('search')}
              style={{
                flex: 1,
                padding: '0.6rem 0.4rem',
                border: 'none',
                borderBottom: activeTab === 'search' ? '2px solid #047857' : 'none',
                backgroundColor: activeTab === 'search' ? '#ffffff' : 'transparent',
                color: activeTab === 'search' ? '#047857' : '#64748b',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              🔍 {dict.common.search}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('meta')}
              style={{
                flex: 1,
                padding: '0.6rem 0.4rem',
                border: 'none',
                borderBottom: activeTab === 'meta' ? '2px solid #047857' : 'none',
                backgroundColor: activeTab === 'meta' ? '#ffffff' : 'transparent',
                color: activeTab === 'meta' ? '#047857' : '#64748b',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              🛡️ {dict.books.provenance}
            </button>
          </div>

          {/* Volume Selector (if multi-volume) */}
          {book.volumeCount > 1 && (
            <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <label
                style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}
              >
                {dict.books.volume}:
              </label>
              <select
                value={selectedVolume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              >
                {Array.from({ length: book.volumeCount }, (_, i) => i + 1).map((vol) => (
                  <option key={vol} value={vol}>
                    {dict.books.volume} {vol}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {activeTab === 'toc' && (
              <div role="list">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionId(sec.id)}
                    style={{
                      width: '100%',
                      textAlign: isRtl ? 'right' : 'left',
                      padding: '0.6rem 0.75rem',
                      marginBottom: '0.25rem',
                      backgroundColor: activeSectionId === sec.id ? '#ecfdf5' : 'transparent',
                      color: activeSectionId === sec.id ? '#065f46' : '#334155',
                      border: '1px solid',
                      borderColor: activeSectionId === sec.id ? '#a7f3d0' : 'transparent',
                      borderRadius: '0.375rem',
                      fontSize: '0.85rem',
                      fontWeight: activeSectionId === sec.id ? 700 : 400,
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    dir={locale === 'ar' || locale === 'ur' ? 'rtl' : 'ltr'}
                  >
                    <span>{getSectionTitle(sec)}</span>
                    {sec.startPage && (
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        p.{sec.startPage}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'search' && (
              <div>
                <form onSubmit={handleSearch} style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={dict.books.searchPlaceholder}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.6rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '0.375rem',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    style={{
                      width: '100%',
                      padding: '0.4rem',
                      backgroundColor: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {searching ? dict.common.loading : dict.books.searchInBook}
                  </button>
                </form>

                {searchResults.length > 0 ? (
                  <div>
                    {searchResults.map((res, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveSectionId(res.sectionId)}
                        style={{
                          padding: '0.5rem',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#047857' }}>
                          {res.sectionTitle}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                          {res.snippet}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  searchQuery && !searching && (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' }}>
                      {dict.books.noResults}
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'meta' && (
              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{dict.books.licenseStatus}:</strong>{' '}
                  <span
                    style={{
                      backgroundColor: '#ecfdf5',
                      color: '#065f46',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem'
                    }}
                  >
                    {book.licenseType}
                  </span>
                </div>
                {editions && editions.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Edition:</strong> {editions[0].editionTitle}
                  </div>
                )}
                {volumes && volumes.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>{dict.books.volumes}:</strong> {volumes.length}
                  </div>
                )}
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{dict.books.attribution}:</strong> {book.attributionRequirement}
                </div>
                {book.provenanceNotes && (
                  <div style={{ marginBottom: '0.5rem', color: '#64748b' }}>
                    {book.provenanceNotes}
                  </div>
                )}
                {book.sourceUrl && (
                  <div>
                    <strong>{dict.books.source}:</strong>{' '}
                    <a
                      href={book.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#047857', wordBreak: 'break-all' }}
                    >
                      {book.sourceUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reading Progress Indicator */}
          <div
            style={{
              padding: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 600 }}>{dict.books.readingProgress}</span>
              <span>{progress}%</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#e2e8f0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#047857',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </nav>

        {/* Center Reading Pane */}
        <main
          role="main"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: getMaxWidth(),
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            {/* Active Section Header */}
            {activeSection && (
              <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {dict.books.volume} {activeSection.volumeNumber} • {dict.books.sections} {activeSection.sectionNumber}
                </div>
                <h2
                  dir={locale === 'ar' || locale === 'ur' ? 'rtl' : 'ltr'}
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    fontFamily:
                      locale === 'ar'
                        ? "Amiri, 'Traditional Arabic', serif"
                        : locale === 'ur'
                        ? "'Noto Nastaliq Urdu', serif"
                        : 'inherit',
                    margin: '0.25rem 0'
                  }}
                >
                  {getSectionTitle(activeSection)}
                </h2>
              </header>
            )}

            {/* Content Rendering */}
            {loadingContent ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                {dict.common.loading}
              </div>
            ) : contents.length === 0 ||
              contents.every(
                (c) =>
                  c.contentAvailability === 'metadata_only' ||
                  c.contentAvailability === 'unavailable' ||
                  (!c.textAr && !c.textEn)
              ) ? (
              /* Honest Metadata-Only Notice — NO TEXT FABRICATED */
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '0.5rem',
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📚</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: '0 0 0.5rem 0' }}>
                  {dict.books.contentUnavailable}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '500px', margin: '0 auto 1.25rem auto' }}>
                  {dict.books.contentUnavailableReason}
                </p>

                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.375rem',
                    padding: '0.75rem 1rem',
                    maxWidth: '450px',
                    margin: '0 auto',
                    fontSize: '0.8rem',
                    color: '#475569'
                  }}
                >
                  <strong>{dict.books.attribution}:</strong> {book.attributionRequirement}
                </div>
              </div>
            ) : (
              /* Full Text Content (when verified edition is ingested) */
              <div
                style={{
                  fontSize: getFontSizeRem(),
                  lineHeight: '2.2',
                  color: '#1e293b'
                }}
              >
                {contents.map((item) => (
                  <p
                    key={item.id}
                    dir={isRtl ? 'rtl' : 'ltr'}
                    style={{
                      marginBottom: '1.5rem',
                      fontFamily:
                        locale === 'ar'
                          ? "Amiri, 'Traditional Arabic', serif"
                          : locale === 'ur'
                          ? "'Noto Nastaliq Urdu', serif"
                          : 'inherit',
                      textAlign: isRtl ? 'right' : 'left'
                    }}
                  >
                    {locale === 'en' ? item.textEn || item.textAr : item.textAr || item.textEn}
                  </p>
                ))}
              </div>
            )}

            {/* Navigation Controls: Prev / Next Section */}
            <footer
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <button
                type="button"
                onClick={handlePrevSection}
                disabled={activeSectionIndex <= 0}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: activeSectionIndex > 0 ? '#ffffff' : '#f1f5f9',
                  color: activeSectionIndex > 0 ? '#047857' : '#94a3b8',
                  border: '1px solid',
                  borderColor: activeSectionIndex > 0 ? '#a7f3d0' : '#e2e8f0',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: activeSectionIndex > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                ← {dict.books.prevSection}
              </button>

              <button
                type="button"
                onClick={handleNextSection}
                disabled={activeSectionIndex >= sections.length - 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: activeSectionIndex < sections.length - 1 ? '#047857' : '#f1f5f9',
                  color: activeSectionIndex < sections.length - 1 ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: activeSectionIndex < sections.length - 1 ? 'pointer' : 'not-allowed'
                }}
              >
                {dict.books.nextSection} →
              </button>
            </footer>

            {/* Methodology Disclaimer */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                color: '#64748b',
                fontStyle: 'italic',
                lineHeight: '1.5',
                textAlign: 'center'
              }}
              role="note"
            >
              ⚖️ {dict.books.methodologyDisclaimer}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
