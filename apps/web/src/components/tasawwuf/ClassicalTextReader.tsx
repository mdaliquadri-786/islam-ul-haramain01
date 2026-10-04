'use client';

/**
 * @file ClassicalTextReader.tsx
 * @package @islamic/web
 * @description Distraction-free bilingual reader for Classical Islamic treatises in
 *              Tasawwuf (Spiritual Purification) and Aqeedah (e.g. Al-Ghazali, Al-Tahawi).
 *              Renders paragraph-by-paragraph dual-language presentation (Arabic calligraphy
 *              with immediate English translation below), a sticky Table of Contents (TOC)
 *              with IntersectionObserver active-section tracking, and reading progress indicators.
 */

import React, { useState, useEffect, useRef } from 'react';

export interface ClassicalBookSection {
  id: string; // anchor id
  chapterNumber: number;
  titleEnglish: string;
  titleArabic: string;
  paragraphs: Array<{
    id: string;
    textArabic: string;
    textEnglish: string;
  }>;
}

export interface ClassicalBookMetadata {
  id: string;
  slug: string;
  titleEnglish: string;
  titleArabic: string;
  authorEnglish: string;
  authorArabic: string;
  deathYearAh: number;
  description: string;
}

export interface ClassicalTextReaderProps {
  book: ClassicalBookMetadata;
  sections: ClassicalBookSection[];
  className?: string;
}

export function ClassicalTextReader({
  book,
  sections,
  className = '',
}: ClassicalTextReaderProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.id || '');
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const contentRef = useRef<HTMLDivElement | null>(null);

  // 1. IntersectionObserver for tracking active TOC section
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // 2. Window Scroll Listener for Reading Progress Percentage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(Math.round(progress));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={`classical-text-reader ${className}`}
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem',
        display: 'flex',
        gap: '2rem',
        position: 'relative',
      }}
    >
      {/* Reading Progress Top Floating Bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          zIndex: 60,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${readingProgress}%`,
            backgroundColor: '#10b981',
            transition: 'width 0.1s ease',
          }}
        />
      </div>

      {/* 1. Sticky Table of Contents (TOC) Sidebar */}
      <aside
        style={{
          width: isSidebarOpen ? '280px' : '0px',
          flexShrink: 0,
          display: isSidebarOpen ? 'block' : 'none',
          position: 'sticky',
          top: '5rem',
          height: 'calc(100vh - 7rem)',
          overflowY: 'auto',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '0.85rem',
          padding: '1.25rem',
        }}
      >
        <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
            Table of Contents (فهرس الأبواب)
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
            {book.titleEnglish}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {book.authorEnglish} (d. {book.deathYearAh} AH)
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {sections.map((sec) => {
            const isActive = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '0.375rem',
                  backgroundColor: isActive ? 'rgba(5, 150, 105, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid transparent',
                  color: isActive ? '#34d399' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sec.chapterNumber}. {sec.titleEnglish}
                </span>
                {isActive && <span style={{ fontSize: '0.7rem' }}>●</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#64748b' }}>
          Progress: <strong style={{ color: '#cbd5e1' }}>{readingProgress}%</strong> Completed
        </div>
      </aside>

      {/* 2. Main Centered Distraction-Free Reading Pane */}
      <article
        ref={contentRef}
        style={{
          flex: 1,
          maxWidth: '820px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* Book Title Cover Card */}
        <div
          style={{
            padding: '2.5rem 2rem',
            backgroundColor: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '1.25rem',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div dir="rtl" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--quran-font-family, "Amiri", serif)', marginBottom: '0.5rem' }}>
            {book.titleArabic}
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', margin: '0 0 0.5rem 0' }}>
            {book.titleEnglish}
          </h1>
          <div style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600 }}>
            {book.authorEnglish} • {book.authorArabic} (d. {book.deathYearAh} AH)
          </div>
          <p style={{ maxWidth: '640px', margin: '1rem auto 0', fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
            {book.description}
          </p>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              marginTop: '1.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: '#cbd5e1',
              padding: '0.4rem 0.85rem',
              fontSize: '0.775rem',
              cursor: 'pointer',
            }}
          >
            {isSidebarOpen ? 'Hide Table of Contents' : 'Show Table of Contents'}
          </button>
        </div>

        {/* Section by Section Content */}
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            style={{
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Section Chapter Header */}
            <div
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '1rem',
                marginBottom: '1.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                  Chapter {section.chapterNumber}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                  {section.titleEnglish}
                </h2>
              </div>
              <div dir="rtl" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--quran-font-family, "Amiri", serif)' }}>
                {section.titleArabic}
              </div>
            </div>

            {/* Paragraph-by-Paragraph Bilingual Blocks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {section.paragraphs.map((para) => (
                <div
                  key={para.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    padding: '1.25rem',
                    backgroundColor: 'rgba(2, 6, 23, 0.6)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {/* Classical Arabic Original */}
                  <div
                    dir="rtl"
                    style={{
                      fontSize: '1.45rem',
                      lineHeight: '2.4',
                      color: '#ffffff',
                      fontFamily: 'var(--quran-font-family, "Amiri", serif)',
                      textAlign: 'justify',
                    }}
                  >
                    {para.textArabic}
                  </div>

                  {/* Scholarly English Translation */}
                  <div
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      color: '#cbd5e1',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '0.75rem',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                  >
                    {para.textEnglish}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
