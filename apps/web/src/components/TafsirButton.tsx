'use client';

/**
 * @file TafsirButton.tsx
 * @package @islamic/web
 * @description Per-ayah button that opens the TafsirViewer inline.
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 */

import React, { useState } from 'react';
import { TafsirViewer } from './TafsirViewer';
import type { Locale } from '@islamic/ui';

interface TafsirButtonProps {
  surahId: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;   // canonical Arabic text — passed from parent, NOT duplicated
  locale: Locale;
  label: string;
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
}

export function TafsirButton({
  surahId,
  ayahNumber,
  surahName,
  ayahText,
  locale,
  label,
  dict
}: TafsirButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`${label} — ${surahName} ${surahId}:${ayahNumber}`}
        style={{
          backgroundColor: isOpen ? '#047857' : '#f0fdf4',
          color: isOpen ? '#ffffff' : '#065f46',
          border: '1px solid',
          borderColor: isOpen ? '#047857' : '#86efac',
          borderRadius: '0.375rem',
          padding: '0.25rem 0.55rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.2rem',
          transition: 'background-color 0.15s'
        }}
      >
        <span>📖</span>
        <span>{label}</span>
      </button>

      {isOpen && (
        <div style={{ marginTop: '0.75rem' }}>
          <TafsirViewer
            surahId={surahId}
            ayahNumber={ayahNumber}
            surahName={surahName}
            ayahText={ayahText}
            locale={locale}
            dict={dict}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
