'use client';

/**
 * @file AyahPlayButton.tsx
 * @package @islamic/web
 * @description Client button for starting recitation directly from a specific Ayah timestamp.
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

import React from 'react';

interface AyahPlayButtonProps {
  ayahNumber: number;
  label?: string;
}

export function AyahPlayButton({ ayahNumber, label = 'Play Ayah' }: AyahPlayButtonProps) {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('islamic:playAyah', {
          detail: { ayahNumber }
        })
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`${label} ${ayahNumber}`}
      aria-label={`${label} ${ayahNumber}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ecfdf5',
        color: '#047857',
        border: '1px solid #a7f3d0',
        borderRadius: '0.375rem',
        padding: '0.2rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        gap: '0.2rem',
        transition: 'all 0.15s ease'
      }}
    >
      <span>▶</span>
      <span>{ayahNumber}</span>
    </button>
  );
}
