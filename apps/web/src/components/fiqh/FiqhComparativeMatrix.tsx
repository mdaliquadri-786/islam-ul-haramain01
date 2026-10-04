'use client';

/**
 * @file FiqhComparativeMatrix.tsx
 * @package @islamic/web
 * @description Comparative Sunni Jurisprudence (Fiqh al-Muqarin) interactive matrix.
 *              Maps a specific legal ruling (Hukm) across the four canonical Sunni Madhhabs:
 *              Hanafi, Maliki, Shafi'i, and Hanbali with expandable scriptural evidences (Dalil)
 *              and classical source attributions.
 */

import React, { useState } from 'react';

export type SunniMadhhab = 'hanafi' | 'maliki' | 'shafii' | 'hanbali';
export type HukmCategory = 'fard' | 'wajib' | 'sunnah' | 'mustahabb' | 'mubah' | 'makruh' | 'haram';

export interface MadhhabRuling {
  madhhab: SunniMadhhab;
  madhhabNameArabic: string;
  madhhabNameEnglish: string;
  imamNameArabic: string;
  imamNameEnglish: string;
  verdict: HukmCategory;
  verdictArabic: string;
  verdictEnglish: string;
  summaryExplanation: string;
  dalilType: 'quran' | 'hadith' | 'ijma' | 'qiyas' | 'amal_ahl_madinah' | 'istihsan';
  dalilCitation: string;
  dalilTextArabic?: string;
  dalilTextEnglish?: string;
  classicalSourceBook: string;
}

export interface FiqhIssue {
  id: string;
  topicTitleEnglish: string;
  topicTitleArabic: string;
  category: string; // e.g. "Taharah", "Salah", "Zakah", "Sawm"
  questionSummary: string;
  consensusStatus: 'ijma' | 'jumhur' | 'ikhtilaf';
  rulings: Record<SunniMadhhab, MadhhabRuling>;
}

export interface FiqhComparativeMatrixProps {
  issue: FiqhIssue;
  className?: string;
}

const HUKM_COLORS: Record<HukmCategory, { bg: string; border: string; text: string }> = {
  fard: { bg: 'rgba(5, 150, 105, 0.2)', border: '#059669', text: '#34d399' },
  wajib: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#6ee7b7' },
  sunnah: { bg: 'rgba(37, 99, 235, 0.2)', border: '#2563eb', text: '#60a5fa' },
  mustahabb: { bg: 'rgba(14, 165, 233, 0.2)', border: '#0ea5e9', text: '#38bdf8' },
  mubah: { bg: 'rgba(100, 116, 139, 0.2)', border: '#64748b', text: '#cbd5e1' },
  makruh: { bg: 'rgba(217, 119, 6, 0.2)', border: '#d97706', text: '#fbbf24' },
  haram: { bg: 'rgba(220, 38, 38, 0.2)', border: '#dc2626', text: '#f87171' },
};

const MADHHAB_ORDER: SunniMadhhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

export function FiqhComparativeMatrix({ issue, className = '' }: FiqhComparativeMatrixProps) {
  const [expandedDalil, setExpandedDalil] = useState<Record<SunniMadhhab, boolean>>({
    hanafi: false,
    maliki: false,
    shafii: false,
    hanbali: false,
  });

  const toggleDalil = (madhhab: SunniMadhhab) => {
    setExpandedDalil((prev) => ({ ...prev, [madhhab]: !prev[madhhab] }));
  };

  const getConsensusBadge = (status: FiqhIssue['consensusStatus']) => {
    switch (status) {
      case 'ijma':
        return { label: 'Consensus (إجماع)', color: '#34d399', bg: 'rgba(5, 150, 105, 0.15)' };
      case 'jumhur':
        return { label: 'Majority View (جمهور)', color: '#38bdf8', bg: 'rgba(14, 165, 233, 0.15)' };
      case 'ikhtilaf':
        return { label: 'Scholarly Difference (اختلاف معتبر)', color: '#fbbf24', bg: 'rgba(217, 119, 6, 0.15)' };
    }
  };

  const consensus = getConsensusBadge(issue.consensusStatus);

  return (
    <div
      className={`fiqh-matrix-wrapper ${className}`}
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1rem',
        padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* 1. Header: Topic, Category & Consensus Status */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '0.2rem 0.55rem',
                borderRadius: '0.25rem',
              }}
            >
              Fiqh al-Muqarin • {issue.category}
            </span>
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                color: consensus.color,
                backgroundColor: consensus.bg,
                padding: '0.2rem 0.55rem',
                borderRadius: '0.25rem',
              }}
            >
              {consensus.label}
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem 0' }}>
            {issue.topicTitleEnglish}
          </h3>
          <div dir="rtl" style={{ fontSize: '1.1rem', color: '#cbd5e1', fontWeight: 600 }}>
            {issue.topicTitleArabic}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0.5rem 0 0 0', lineHeight: 1.5 }}>
            {issue.questionSummary}
          </p>
        </div>
      </div>

      {/* 2. Responsive Horizontal Scroll Grid of 4 Sunni Madhhabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
        }}
      >
        {MADHHAB_ORDER.map((madhhabKey) => {
          const ruling = issue.rulings[madhhabKey];
          if (!ruling) return null;

          const colors = HUKM_COLORS[ruling.verdict] || HUKM_COLORS.mubah;
          const isExpanded = expandedDalil[madhhabKey];

          return (
            <div
              key={madhhabKey}
              style={{
                backgroundColor: '#020617',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div>
                {/* Madhhab Title & Imam */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '0.75rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingBottom: '0.5rem',
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                      {ruling.madhhabNameEnglish}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {ruling.imamNameEnglish}
                    </span>
                  </div>
                  <div dir="rtl" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8' }}>
                    {ruling.madhhabNameArabic}
                  </div>
                </div>

                {/* Hukm Verdict Badge */}
                <div style={{ marginBottom: '1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.375rem',
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    <span>{ruling.verdictArabic}</span>
                    <span>•</span>
                    <span>{ruling.verdictEnglish}</span>
                  </span>
                </div>

                {/* Ruling Explanation */}
                <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                  {ruling.summaryExplanation}
                </p>
              </div>

              {/* Dalil (Evidence) Expandable Section */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => toggleDalil(madhhabKey)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    color: '#38bdf8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontWeight: 600,
                  }}
                >
                  <span>{isExpanded ? '▼' : '▶'}</span>
                  <span>{isExpanded ? 'Hide Evidence (الدليل)' : 'Inspect Evidence (الدليل)'}</span>
                </button>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '0.5rem',
                      fontSize: '0.775rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ color: '#94a3b8' }}>
                      <strong style={{ color: '#ffffff' }}>Primary Proof: </strong>
                      <span style={{ textTransform: 'capitalize' }}>{ruling.dalilType.replace('_', ' ')}</span>
                      <span> ({ruling.dalilCitation})</span>
                    </div>

                    {ruling.dalilTextArabic && (
                      <div dir="rtl" style={{ color: '#fbbf24', fontSize: '0.9rem', lineHeight: '1.7' }}>
                        {ruling.dalilTextArabic}
                      </div>
                    )}

                    {ruling.dalilTextEnglish && (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.4' }}>
                        &quot;{ruling.dalilTextEnglish}&quot;
                      </div>
                    )}

                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Classical Reference: <span style={{ color: '#cbd5e1' }}>{ruling.classicalSourceBook}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
