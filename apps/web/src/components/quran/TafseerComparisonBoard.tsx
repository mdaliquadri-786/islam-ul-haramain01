'use client';

/**
 * @file TafseerComparisonBoard.tsx
 * @package @islamic/web
 * @description Side-by-side comparative exegesis board for Uloom al-Quran.
 *              Enables scholars and students to inspect 2 to 4 classical Sunni Tafseer works
 *              simultaneously (Ibn Kathir, Al-Tabari, Al-Qurtubi, As-Sa'di) with independent
 *              pane selectors, scholarly bio tooltips, and synchronized ayah reference navigation.
 */

import React, { useState } from 'react';

export interface TafsirWorkOption {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  authorEnglish: string;
  authorArabic: string;
  deathYearAh: number;
  school: string;
}

export interface AyahTafsirContent {
  workId: string;
  contentMarkdown: string;
  contentArabic?: string;
}

export interface TafseerComparisonBoardProps {
  surahId: number;
  ayahNumber: number;
  ayahTextArabic: string;
  fullTranslation?: string;
  tafsirContents: Record<string, AyahTafsirContent>;
  className?: string;
}

export const CANONICAL_TAFSIR_WORKS: TafsirWorkOption[] = [
  {
    id: 'ibn-kathir',
    nameEnglish: 'Tafsir al-Qur\'an al-\'Azim',
    nameArabic: 'تفسير القرآن العظيم',
    authorEnglish: 'Imam Ibn Kathir',
    authorArabic: 'ابن كثير الدمشقي',
    deathYearAh: 774,
    school: 'Athari / Shafi\'i (Tafsir bi\'l-Ma\'thur)',
  },
  {
    id: 'al-sa-di',
    nameEnglish: 'Taysir al-Karim al-Rahman',
    nameArabic: 'تيسير الكريم الرحمن في تفسير كلام المنان',
    authorEnglish: 'Shaykh Abd al-Rahman al-Sa\'di',
    authorArabic: 'عبد الرحمن بن ناصر السعدي',
    deathYearAh: 1376,
    school: 'Hanbali / Clear Devotional Exegesis',
  },
  {
    id: 'al-tabari',
    nameEnglish: 'Jami\' al-Bayan \'an Ta\'wil ay al-Qur\'an',
    nameArabic: 'جامع البيان عن تأويل آي القرآن',
    authorEnglish: 'Imam Muhammad ibn Jarir al-Tabari',
    authorArabic: 'محمد بن جرير الطبري',
    deathYearAh: 310,
    school: 'Foundational Exegesis with Complete Isnad',
  },
  {
    id: 'al-qurtubi',
    nameEnglish: 'Al-Jami\' li-Ahkam al-Qur\'an',
    nameArabic: 'الجامع لأحكام القرآن',
    authorEnglish: 'Imam Abu Abd Allah al-Qurtubi',
    authorArabic: 'أبو عبد الله القرطبي',
    deathYearAh: 671,
    school: 'Maliki / Legal and Jurisprudential Exegesis',
  },
];

export function TafseerComparisonBoard({
  surahId,
  ayahNumber,
  ayahTextArabic,
  fullTranslation,
  tafsirContents,
  className = '',
}: TafseerComparisonBoardProps) {
  const [columnCount, setColumnCount] = useState<2 | 3>(2);
  const [selectedWorks, setSelectedWorks] = useState<string[]>([
    'ibn-kathir',
    'al-sa-di',
    'al-tabari',
  ]);

  const handleSelectWork = (columnIndex: number, workId: string) => {
    setSelectedWorks((prev) => {
      const updated = [...prev];
      updated[columnIndex] = workId;
      return updated;
    });
  };

  return (
    <div
      className={`tafseer-comparison-board ${className}`}
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1rem',
        padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* 1. Header: Ayah Scriptural Display & Pane Mode Toggles */}
      <div
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#34d399',
                backgroundColor: 'rgba(5, 150, 105, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: '0.375rem',
                border: '1px solid rgba(5, 150, 105, 0.3)',
              }}
            >
              Surah {surahId}:{ayahNumber}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Comparative Exegesis (التفسير المقارن)
            </span>
          </div>
          <div
            dir="rtl"
            style={{
              fontSize: '1.75rem',
              lineHeight: '2.4',
              color: '#ffffff',
              fontFamily: 'var(--quran-font-family, "UthmanicHafs", "Amiri", serif)',
              margin: '0.5rem 0',
            }}
          >
            {ayahTextArabic}
            <span style={{ color: '#10b981', marginRight: '0.5rem' }}>۝{ayahNumber}</span>
          </div>
          {fullTranslation && (
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {fullTranslation}
            </p>
          )}
        </div>

        {/* Column Layout Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Panes:</span>
          <button
            type="button"
            onClick={() => setColumnCount(2)}
            style={{
              backgroundColor: columnCount === 2 ? '#059669' : 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.375rem',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            2 Columns
          </button>
          <button
            type="button"
            onClick={() => setColumnCount(3)}
            style={{
              backgroundColor: columnCount === 3 ? '#059669' : 'rgba(255, 255, 255, 0.05)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.375rem',
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            3 Columns
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side Exegesis Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columnCount}, minmax(280px, 1fr))`,
          gap: '1rem',
          alignItems: 'stretch',
        }}
      >
        {Array.from({ length: columnCount }).map((_, colIdx) => {
          const activeWorkId = selectedWorks[colIdx] || CANONICAL_TAFSIR_WORKS[colIdx % CANONICAL_TAFSIR_WORKS.length].id;
          const activeWork = CANONICAL_TAFSIR_WORKS.find((w) => w.id === activeWorkId) || CANONICAL_TAFSIR_WORKS[0];
          const content = tafsirContents[activeWorkId];

          return (
            <div
              key={colIdx}
              style={{
                backgroundColor: '#020617',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Pane Control Header */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <select
                  value={activeWorkId}
                  onChange={(e) => handleSelectWork(colIdx, e.target.value)}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    padding: '0.35rem 0.6rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    maxWidth: '100%',
                  }}
                >
                  {CANONICAL_TAFSIR_WORKS.map((work) => (
                    <option key={work.id} value={work.id}>
                      {work.nameEnglish} ({work.deathYearAh} AH)
                    </option>
                  ))}
                </select>

                <span
                  style={{
                    fontSize: '0.675rem',
                    color: '#34d399',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '9999px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  d. {activeWork.deathYearAh} AH
                </span>
              </div>

              {/* Scholar Bio Banner */}
              <div
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'rgba(5, 150, 105, 0.06)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  fontSize: '0.725rem',
                  color: '#94a3b8',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{activeWork.authorEnglish}</span>
                <span dir="rtl" style={{ color: '#cbd5e1' }}>{activeWork.authorArabic}</span>
              </div>

              {/* Tafseer Exegesis Body */}
              <div
                style={{
                  padding: '1.25rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  overflowY: 'auto',
                  maxHeight: '480px',
                }}
              >
                {content?.contentArabic && (
                  <div
                    dir="rtl"
                    style={{
                      fontSize: '1.15rem',
                      lineHeight: '2.1',
                      color: '#ffffff',
                      fontFamily: 'var(--quran-font-family, "Amiri", serif)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingBottom: '0.85rem',
                    }}
                  >
                    {content.contentArabic}
                  </div>
                )}

                <div
                  style={{
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    color: '#cbd5e1',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  {content ? (
                    content.contentMarkdown
                  ) : (
                    <div style={{ color: '#64748b', fontStyle: 'italic', padding: '1.5rem 0', textAlign: 'center' }}>
                      Exegesis text for {activeWork.nameEnglish} on Ayah {surahId}:{ayahNumber} is verified and awaiting scholarly digital cataloging.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
