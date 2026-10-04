'use client';

/**
 * @file WordByWordReader.tsx
 * @package @islamic/web
 * @description Interactive Word-by-Word Quran reading and recitation component.
 *              Consumes useWordAudioSync for sub-millisecond audio tracking,
 *              renders Arabic calligraphy with protective Tashkeel line-height (leading-[2.5]),
 *              highlights active words in rich amber (#D97706), and provides morphological tooltips.
 */

import React, { useState, useMemo } from 'react';
import { useWordAudioSync, type WordTimestamp } from '@/hooks/useWordAudioSync';

export interface WordToken {
  id: string; // "surah:ayah:wordIndex" (e.g. "2:255:1")
  position: number;
  textUthmani: string;
  translation: string;
  transliteration?: string;
  root?: string;
  grammar?: string;
  audioStart?: number;
  audioEnd?: number;
}

export interface WordByWordReaderProps {
  surahId: number;
  ayahNumber: number;
  words: WordToken[];
  audioUrl?: string | null;
  fullAyahTranslation?: string;
  reciterName?: string;
  onWordClick?: (word: WordToken) => void;
  showTooltips?: boolean;
}

export function WordByWordReader({
  surahId,
  ayahNumber,
  words,
  audioUrl,
  fullAyahTranslation,
  reciterName = 'Sheikh Mishary Rashid Alafasy',
  onWordClick,
  showTooltips = true,
}: WordByWordReaderProps) {
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);
  const [activeTooltipWord, setActiveTooltipWord] = useState<WordToken | null>(null);

  // Derive sorted word timestamps for useWordAudioSync
  const wordTimestamps = useMemo<WordTimestamp[]>(() => {
    return words
      .filter((w) => typeof w.audioStart === 'number' && typeof w.audioEnd === 'number')
      .map((w) => ({
        id: w.id,
        start: w.audioStart as number,
        end: w.audioEnd as number,
      }))
      .sort((a, b) => a.start - b.start);
  }, [words]);

  const {
    isPlaying,
    currentTime,
    duration,
    activeWordId,
    togglePlay,
    seekToWord,
    seekToTime,
    setRate,
  } = useWordAudioSync(audioUrl, wordTimestamps);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className="quran-word-reader"
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1rem',
        padding: '1.75rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* 1. Header Bar: Ayah Marker & Reciter Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          paddingBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {surahId}:{ayahNumber}
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f8fafc' }}>
              Surah {surahId}, Ayah {ayahNumber}
            </div>
            {reciterName && (
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Reciter: <span style={{ color: '#cbd5e1' }}>{reciterName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Audio Control Bar */}
        {audioUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={togglePlay}
              className="audio-play-button"
              aria-label={isPlaying ? 'Pause Recitation' : 'Play Recitation'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: isPlaying ? '#d97706' : '#059669',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.45rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{isPlaying ? '⏸' : '▶'}</span>
              <span>{isPlaying ? 'Pause' : 'Listen'}</span>
            </button>

            {/* Playback Rate Selector */}
            <select
              defaultValue="1"
              onChange={(e) => setRate(parseFloat(e.target.value))}
              aria-label="Playback Rate"
              style={{
                backgroundColor: '#020617',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '0.375rem',
                padding: '0.4rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <option value="0.75">0.75x</option>
              <option value="1">1.0x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>
        )}
      </div>

      {/* 2. Interactive Arabic Word-by-Word Flow (RTL) */}
      <div
        dir="rtl"
        style={{
          fontSize: 'var(--quran-font-size, 2rem)',
          lineHeight: '2.8', // Massive line-height protecting Tashkeel & pause marks
          textAlign: 'justify',
          fontFamily:
            'var(--quran-font-family, "UthmanicHafs", "Amiri", "Traditional Arabic", serif)',
          padding: '0.5rem 0',
          position: 'relative',
        }}
      >
        {words.map((word) => {
          const isActive = activeWordId === word.id;
          const isHovered = hoveredWordId === word.id;

          return (
            <span
              key={word.id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => {
                setHoveredWordId(word.id);
                if (showTooltips) setActiveTooltipWord(word);
              }}
              onMouseLeave={() => {
                setHoveredWordId(null);
                setActiveTooltipWord(null);
              }}
              onClick={() => {
                if (word.audioStart !== undefined) {
                  seekToWord(word.id);
                }
                if (onWordClick) onWordClick(word);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (word.audioStart !== undefined) seekToWord(word.id);
                  if (onWordClick) onWordClick(word);
                }
              }}
              style={{
                display: 'inline-block',
                position: 'relative',
                padding: '0 0.28rem',
                margin: '0 0.15rem',
                borderRadius: '0.45rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease, transform 0.15s ease',
                backgroundColor: isActive
                  ? '#D97706' // Accent amber active highlight
                  : isHovered
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'transparent',
                color: isActive ? '#ffffff' : '#f8fafc',
                boxShadow: isActive ? '0 0 16px rgba(217, 119, 6, 0.55)' : 'none',
                transform: isActive ? 'scale(1.04)' : 'none',
              }}
            >
              {word.textUthmani}
            </span>
          );
        })}

        {/* Ayah End Seal */}
        <span
          style={{
            display: 'inline-block',
            marginRight: '0.5rem',
            color: '#10b981',
            fontSize: '1.25rem',
            userSelect: 'none',
          }}
        >
          ۝{ayahNumber}
        </span>
      </div>

      {/* 3. Word-by-Word Translation Grid Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.65rem',
          padding: '1rem',
          backgroundColor: '#020617',
          borderRadius: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {words.map((word) => {
          const isActive = activeWordId === word.id;
          return (
            <div
              key={`card-${word.id}`}
              onClick={() => {
                if (word.audioStart !== undefined) seekToWord(word.id);
              }}
              style={{
                padding: '0.65rem 0.5rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
                backgroundColor: isActive ? 'rgba(217, 119, 6, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                border: isActive
                  ? '1px solid #D97706'
                  : '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                dir="rtl"
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 600,
                  color: isActive ? '#fbbf24' : '#f8fafc',
                  marginBottom: '0.25rem',
                }}
              >
                {word.textUthmani}
              </div>
              <div
                style={{
                  fontSize: '0.775rem',
                  color: isActive ? '#fef3c7' : '#94a3b8',
                  fontWeight: 500,
                  lineHeight: 1.3,
                }}
              >
                {word.translation}
              </div>
              {word.grammar && (
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: '#64748b',
                    marginTop: '0.25rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {word.grammar}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Full Ayah English Translation */}
      {fullAyahTranslation && (
        <div
          style={{
            fontSize: 'var(--translation-font-size, 1.05rem)',
            color: '#cbd5e1',
            lineHeight: 1.7,
            fontFamily: 'system-ui, sans-serif',
            padding: '0.5rem 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {fullAyahTranslation}
        </div>
      )}

      {/* 5. Audio Progress Scrubber */}
      {audioUrl && duration > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontFamily: 'monospace' }}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.05"
            value={currentTime}
            onChange={(e) => seekToTime(parseFloat(e.target.value))}
            aria-label="Recitation scrubber"
            style={{
              flex: 1,
              accentColor: '#d97706',
              height: '5px',
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: '0.725rem', color: '#94a3b8', fontFamily: 'monospace' }}>
            {formatTime(duration)}
          </span>
        </div>
      )}

      {/* 6. Active Word Morphological Hover Tooltip */}
      {showTooltips && activeTooltipWord && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1.75rem',
            backgroundColor: '#020617',
            border: '1px solid #d97706',
            borderRadius: '0.5rem',
            padding: '0.55rem 0.85rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            fontSize: '0.75rem',
            color: '#cbd5e1',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            pointerEvents: 'none',
          }}
        >
          <strong style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
            {activeTooltipWord.textUthmani}
          </strong>
          <span>•</span>
          <span>{activeTooltipWord.translation}</span>
          {activeTooltipWord.root && (
            <>
              <span>•</span>
              <span>Root: <code style={{ color: '#38bdf8' }}>{activeTooltipWord.root}</code></span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
