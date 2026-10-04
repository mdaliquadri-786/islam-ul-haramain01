'use client';

/**
 * @file LinguisticRootAnalyzer.tsx
 * @package @islamic/web
 * @description Uloom al-Lughah: Classical Arabic grammar, morphology, and triliteral root analyzer.
 *              Takes a Quranic WordToken and renders a morphological color breakdown:
 *              Prefix (Blue) + Root (Gold) + Suffix (Green) alongside Sarf (morphological patterns),
 *              I'rab (grammatical function), and other occurrences across the Medina Mushaf.
 */

import React from 'react';
import type { WordToken } from './WordByWordReader';

export interface MorphologicalPart {
  type: 'prefix' | 'root' | 'suffix';
  text: string;
  roleEnglish: string;
  roleArabic: string;
}

export interface RootOccurrence {
  surahId: number;
  ayahNumber: number;
  surahName: string;
  contextText: string;
}

export interface LinguisticAnalysisData {
  word: WordToken;
  rootArabic: string;
  rootTransliteration: string;
  verbForm?: string; // e.g. "Form I (فَعَلَ)"
  posCategory: string; // e.g. "Noun", "Verb", "Particle"
  irabArabic: string; // e.g. "اسم مجرور وعلامة جره الكسرة"
  irabEnglish: string; // e.g. "Genitive noun with Kasrah ending"
  parts: MorphologicalPart[];
  occurrencesCount: number;
  sampleOccurrences: RootOccurrence[];
}

export interface LinguisticRootAnalyzerProps {
  analysis: LinguisticAnalysisData | null;
  isOpen: boolean;
  onClose: () => void;
}

const PART_COLORS = {
  prefix: { color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6' },
  root: { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },
  suffix: { color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' },
};

export function LinguisticRootAnalyzer({
  analysis,
  isOpen,
  onClose,
}: LinguisticRootAnalyzerProps) {
  if (!isOpen || !analysis) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Linguistic Root Analyzer"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Slide-over Drawer Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          height: '100%',
          backgroundColor: '#0f172a',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '1.75rem',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
              Uloom al-Lughah • Morphology & I&apos;rab
            </div>
            <h3 style={{ margin: '0.25rem 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Linguistic Root Breakdown
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Panel"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.375rem',
              color: '#cbd5e1',
              padding: '0.35rem 0.65rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* 1. Word Morphological Color Segmentation */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#020617',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
            Segmented Morphological Token
          </div>

          <div
            dir="rtl"
            style={{
              fontSize: '2.5rem',
              lineHeight: 1.8,
              fontFamily: 'var(--quran-font-family, "UthmanicHafs", "Amiri", serif)',
              display: 'inline-flex',
              gap: '0.2rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
            }}
          >
            {analysis.parts.map((part, idx) => {
              const theme = PART_COLORS[part.type];
              return (
                <span
                  key={idx}
                  title={`${part.type.toUpperCase()}: ${part.roleEnglish} (${part.roleArabic})`}
                  style={{
                    color: theme.color,
                    backgroundColor: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '0.375rem',
                    padding: '0 0.4rem',
                  }}
                >
                  {part.text}
                </span>
              );
            })}
          </div>

          {/* Color Key Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem' }}>
            <span style={{ color: PART_COLORS.prefix.color }}>■ Prefix (سابق)</span>
            <span style={{ color: PART_COLORS.root.color }}>■ Root (جذر)</span>
            <span style={{ color: PART_COLORS.suffix.color }}>■ Suffix (لاحق)</span>
          </div>
        </div>

        {/* 2. Triliteral Root & Sarf Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#020617',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Triliteral Root (الجذر)</div>
            <div dir="rtl" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
              {analysis.rootArabic}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {analysis.rootTransliteration}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              backgroundColor: '#020617',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Part of Speech & Form</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.2rem' }}>
              {analysis.posCategory}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {analysis.verbForm || 'Standard Primitive'}
            </div>
          </div>
        </div>

        {/* 3. Classical I'rab (Grammatical Inflection) */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#020617',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            Grammar & Syntactic Analysis (الإعراب)
          </div>
          <div
            dir="rtl"
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: '#34d399',
              fontFamily: 'var(--quran-font-family, "Amiri", serif)',
              marginBottom: '0.5rem',
            }}
          >
            {analysis.irabArabic}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {analysis.irabEnglish}
          </div>
        </div>

        {/* 4. Root Concordance: Other Occurrences in the Quran */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#020617',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              Quranic Root Concordance
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#fbbf24',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
              }}
            >
              {analysis.occurrencesCount} total occurrences
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', flex: 1 }}>
            {analysis.sampleOccurrences.map((occ, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  <strong style={{ color: '#cbd5e1' }}>Surah {occ.surahName}</strong>
                  <span>Ayah {occ.surahId}:{occ.ayahNumber}</span>
                </div>
                <div dir="rtl" style={{ fontSize: '0.95rem', color: '#ffffff', fontFamily: 'var(--quran-font-family, "Amiri", serif)' }}>
                  {occ.contextText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
