'use client';

/**
 * @file HadithDisplayCard.tsx
 * @package @islamic/web
 * @description Production-grade authoritative Hadith display card.
 *              Cleanly separates the Isnad (Narrator Chain - collapsible/dimmed)
 *              from the Matn (Main prophetic speech - prominent, serif/uthmani calligraphy),
 *              equipped with an authoritative Grading Badge (Sahih, Hasan, Da'eef, Mawdu').
 */

import React, { useState } from 'react';

export type HadithGradeLevel = 'sahih' | 'hasan' | 'daif' | 'mawdu';

export interface HadithGradingInfo {
  grade: string;
  gradeArabic: string;
  gradeLevel: HadithGradeLevel;
  scholarName?: string;
  scholarlyCommentary?: string;
}

export interface HadithDisplayCardProps {
  id?: number | string;
  collectionId: string;
  collectionNameEnglish: string;
  collectionNameArabic: string;
  hadithNumber: number;
  inBookReference?: string;
  chapterTitleArabic?: string;
  chapterTitleEnglish?: string;
  sanadArabic?: string | null;
  matnArabic: string;
  translationEnglish?: string;
  translationUrdu?: string;
  gradings?: HadithGradingInfo[];
  onBookmark?: (id: number | string) => void;
  isBookmarked?: boolean;
}

export function HadithGradingBadge({
  grading,
}: {
  grading: HadithGradingInfo;
}) {
  const getBadgeStyles = (level: HadithGradeLevel) => {
    switch (level) {
      case 'sahih':
        return {
          backgroundColor: 'rgba(5, 150, 105, 0.15)',
          borderColor: 'rgba(5, 150, 105, 0.45)',
          color: '#34d399',
          icon: '✓',
        };
      case 'hasan':
        return {
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          borderColor: 'rgba(37, 99, 235, 0.45)',
          color: '#60a5fa',
          icon: '✦',
        };
      case 'daif':
        return {
          backgroundColor: 'rgba(220, 38, 38, 0.15)',
          borderColor: 'rgba(220, 38, 38, 0.45)',
          color: '#f87171',
          icon: '⚠',
        };
      case 'mawdu':
        return {
          backgroundColor: 'rgba(153, 27, 27, 0.25)',
          borderColor: 'rgba(153, 27, 27, 0.6)',
          color: '#fca5a5',
          icon: '✕',
        };
    }
  };

  const style = getBadgeStyles(grading.gradeLevel);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        backgroundColor: style.backgroundColor,
        border: `1px solid ${style.borderColor}`,
        fontSize: '0.75rem',
        fontWeight: 700,
        color: style.color,
      }}
      title={grading.scholarlyCommentary || `${grading.scholarName || 'Muhaddith'}: ${grading.grade}`}
    >
      <span>{style.icon}</span>
      <span>{grading.gradeArabic}</span>
      <span style={{ opacity: 0.85, fontWeight: 500 }}>({grading.grade})</span>
      {grading.scholarName && (
        <span style={{ fontSize: '0.675rem', opacity: 0.75 }}>• {grading.scholarName}</span>
      )}
    </div>
  );
}

export function HadithDisplayCard({
  id,
  collectionId,
  collectionNameEnglish,
  collectionNameArabic,
  hadithNumber,
  inBookReference,
  chapterTitleArabic,
  chapterTitleEnglish,
  sanadArabic,
  matnArabic,
  translationEnglish,
  translationUrdu,
  gradings = [],
  onBookmark,
  isBookmarked = false,
}: HadithDisplayCardProps) {
  const [isSanadExpanded, setIsSanadExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCitation = () => {
    const text = `${collectionNameEnglish} #${hadithNumber}\n\n${matnArabic}\n\n${translationEnglish || ''}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Primary grading (default to Sahih if none provided)
  const primaryGrading: HadithGradingInfo = gradings[0] || {
    grade: 'Sahih',
    gradeArabic: 'صحيح',
    gradeLevel: 'sahih',
  };

  return (
    <article
      className="hadith-display-card"
      data-collection-id={collectionId}
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1rem',
        padding: '1.75rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
      }}
    >
      {/* 1. Card Header: Collection Metadata & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              padding: '0.25rem 0.65rem',
              borderRadius: '0.375rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#f8fafc',
            }}
          >
            {collectionNameEnglish} #{hadithNumber}
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {collectionNameArabic}
          </span>
          {inBookReference && (
            <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
              (Ref: {inBookReference})
            </span>
          )}
        </div>

        {/* Right side: Grading Badge & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <HadithGradingBadge grading={primaryGrading} />

          <button
            type="button"
            onClick={handleCopyCitation}
            title="Copy Hadith Citation"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '0.375rem',
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
              color: copied ? '#34d399' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>

          {onBookmark && (
            <button
              type="button"
              onClick={() => onBookmark(id || hadithNumber)}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Hadith'}
              style={{
                backgroundColor: isBookmarked ? 'rgba(5, 150, 105, 0.2)' : 'transparent',
                border: isBookmarked ? '1px solid #059669' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '0.375rem',
                padding: '0.3rem 0.6rem',
                fontSize: '0.75rem',
                color: isBookmarked ? '#34d399' : '#cbd5e1',
                cursor: 'pointer',
              }}
            >
              {isBookmarked ? '★ Saved' : '☆ Save'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Chapter Title (Bab / Kitab) */}
      {(chapterTitleArabic || chapterTitleEnglish) && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '0.5rem',
            borderLeft: '3px solid #10b981',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
          }}
        >
          {chapterTitleArabic && (
            <div dir="rtl" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              {chapterTitleArabic}
            </div>
          )}
          {chapterTitleEnglish && (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Chapter: {chapterTitleEnglish}
            </div>
          )}
        </div>
      )}

      {/* 3. Isnad (Narrator Chain - Collapsible & Dimmed) */}
      {sanadArabic && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => setIsSanadExpanded(!isSanadExpanded)}
            style={{
              alignSelf: 'flex-start',
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '0.75rem',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 600,
            }}
          >
            <span>{isSanadExpanded ? '▼' : '▶'}</span>
            <span>{isSanadExpanded ? 'Hide Narrator Chain (السند)' : 'Inspect Narrator Chain (السند)'}</span>
          </button>

          {isSanadExpanded && (
            <div
              dir="rtl"
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                fontSize: '1rem',
                lineHeight: '2',
                fontFamily: 'var(--quran-font-family, "Amiri", "Traditional Arabic", serif)',
              }}
            >
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '0.35rem' }}>
                السند المتصل:
              </span>
              {sanadArabic}
            </div>
          )}
        </div>
      )}

      {/* 4. Matn (Main Prophetic Text - Prominent) */}
      <div
        dir="rtl"
        style={{
          fontSize: '1.65rem',
          lineHeight: '2.5',
          fontFamily:
            'var(--quran-font-family, "UthmanicHafs", "Amiri", "Traditional Arabic", serif)',
          color: '#ffffff',
          textAlign: 'justify',
          padding: '0.5rem 0',
        }}
      >
        {matnArabic}
      </div>

      {/* 5. English Translation */}
      {translationEnglish && (
        <div
          style={{
            fontSize: '0.975rem',
            color: '#cbd5e1',
            lineHeight: 1.7,
            fontFamily: 'system-ui, sans-serif',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '0.85rem',
          }}
        >
          {translationEnglish}
        </div>
      )}

      {/* 6. Urdu Translation */}
      {translationUrdu && (
        <div
          dir="rtl"
          style={{
            fontSize: '1.05rem',
            color: '#94a3b8',
            lineHeight: 1.8,
            fontFamily: '"Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", serif',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
            paddingTop: '0.5rem',
          }}
        >
          {translationUrdu}
        </div>
      )}
    </article>
  );
}
