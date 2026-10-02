'use client';

/**
 * @file AudioPlayer.tsx
 * @package @islamic/web
 * @description Accessible, synchronized Quran Audio Streaming Player with verified reciter selection,
 *              Ayah-level timestamp tracking, playback rate control, and legal provenance attribution.
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AudioReciter,
  AudioSurahTrack,
  findActiveAyahForTimestamp,
  formatPlaybackTime,
  calculateTrackProgress
} from '@islamic/islamic-engine';
import type { Locale } from '@islamic/ui';

interface AudioPlayerProps {
  surahId: number;
  surahName: string;
  reciters: AudioReciter[];
  initialTrack?: AudioSurahTrack | null;
  locale: Locale;
  dict: {
    audio: {
      title: string;
      reciter: string;
      selectReciter: string;
      play: string;
      pause: string;
      playing: string;
      paused: string;
      buffering: string;
      speed: string;
      volume: string;
      mute: string;
      unmute: string;
      seekForward: string;
      seekBackward: string;
      surahRecitation: string;
      verifiedLicensing: string;
      attribution: string;
      takedown: string;
      currentAyah: string;
      jumpToAyah: string;
      download: string;
      playbackError: string;
    };
  };
  onActiveAyahChange?: (ayahNumber: number | null) => void;
}

export function AudioPlayer({
  surahId,
  surahName,
  reciters,
  initialTrack,
  locale,
  dict,
  onActiveAyahChange
}: AudioPlayerProps) {
  const [selectedReciterId, setSelectedReciterId] = useState<string>(
    initialTrack?.reciterId || reciters[0]?.id || 'alafasy'
  );
  const [currentTrack, setCurrentTrack] = useState<AudioSurahTrack | null>(
    initialTrack || null
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [durationMs, setDurationMs] = useState<number>(
    (initialTrack?.durationSeconds || 0) * 1000
  );
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [showProvenanceModal, setShowProvenanceModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch track when reciter or surah changes
  const loadTrack = useCallback(
    async (reciterId: string, surah: number) => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/audio/surah/${surah}?reciterId=${reciterId}`);
        const data = await res.json();
        if (data.success && data.track) {
          setCurrentTrack(data.track);
          setDurationMs(data.track.durationSeconds * 1000);
          if (audioRef.current) {
            audioRef.current.src = data.track.audioUrl;
            audioRef.current.load();
            if (isPlaying) {
              audioRef.current.play().catch(() => setIsPlaying(false));
            }
          }
        } else {
          setErrorMsg(data.error || dict.audio.playbackError);
        }
      } catch {
        setErrorMsg(dict.audio.playbackError);
      } finally {
        setIsLoading(false);
      }
    },
    [dict.audio.playbackError, isPlaying]
  );

  useEffect(() => {
    if (!currentTrack || currentTrack.reciterId !== selectedReciterId || currentTrack.surahId !== surahId) {
      loadTrack(selectedReciterId, surahId);
    }
  }, [selectedReciterId, surahId, currentTrack, loadTrack]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setErrorMsg(dict.audio.playbackError);
        });
    }
  };

  // Time update sync
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const ms = Math.floor(audioRef.current.currentTime * 1000);
    setCurrentTimeMs(ms);

    if (currentTrack?.timingSegments && currentTrack.timingSegments.length > 0) {
      const ayah = findActiveAyahForTimestamp(currentTrack.timingSegments, ms);
      if (ayah !== activeAyah) {
        setActiveAyah(ayah);
        if (onActiveAyahChange) {
          onActiveAyahChange(ayah);
        }
      }
    }
  };

  // Seek bar scrub
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetProgress = parseFloat(e.target.value);
    const targetMs = (targetProgress / 100) * durationMs;
    setCurrentTimeMs(targetMs);
    if (audioRef.current) {
      audioRef.current.currentTime = targetMs / 1000;
    }
  };

  // Skip relative seconds
  const skipSeconds = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, durationMs / 1000));
    audioRef.current.currentTime = newTime;
    setCurrentTimeMs(newTime * 1000);
  };

  // Speed change
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Volume & Mute
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = newVol === 0;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  // Jump to specific Ayah timestamp
  const jumpToAyah = (ayahNum: number) => {
    if (!currentTrack?.timingSegments) return;
    const segment = currentTrack.timingSegments.find((s) => s.ayahNumber === ayahNum);
    if (segment && audioRef.current) {
      audioRef.current.currentTime = segment.startMs / 1000;
      setCurrentTimeMs(segment.startMs);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  // Expose jumpToAyah via window custom event so Ayah rows can trigger playback
  useEffect(() => {
    const handleJumpEvent = (e: CustomEvent<{ ayahNumber: number }>) => {
      if (e.detail?.ayahNumber) {
        jumpToAyah(e.detail.ayahNumber);
      }
    };
    window.addEventListener('islamic:playAyah' as any, handleJumpEvent as any);
    return () => {
      window.removeEventListener('islamic:playAyah' as any, handleJumpEvent as any);
    };
  }, [currentTrack, isPlaying]);

  const selectedReciter = reciters.find((r) => r.id === selectedReciterId);
  const reciterDisplayName =
    locale === 'ar'
      ? selectedReciter?.nameArabic
      : locale === 'ur'
      ? selectedReciter?.nameUrdu
      : selectedReciter?.nameEnglish;

  const progressPercent = calculateTrackProgress(currentTimeMs, durationMs);

  return (
    <div
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderRadius: '0.75rem',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #1e293b'
      }}
    >
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setActiveAyah(null);
          if (onActiveAyahChange) onActiveAyahChange(null);
        }}
        onError={() => {
          setIsPlaying(false);
          setErrorMsg(dict.audio.playbackError);
        }}
      />

      {/* Top Row: Track & Reciter Selection + Verified Licensing Badge */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #334155',
          paddingBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              backgroundColor: '#047857',
              color: '#ffffff',
              fontSize: '1rem'
            }}
          >
            🔊
          </span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
              {dict.audio.surahRecitation} — {surahName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {reciterDisplayName || 'Mishary Rashid Alafasy'} • {selectedReciter?.style || 'Murattal'}
            </div>
          </div>
        </div>

        {/* Reciter Selector & Provenance Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select
            value={selectedReciterId}
            onChange={(e) => setSelectedReciterId(e.target.value)}
            aria-label={dict.audio.selectReciter}
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '0.375rem',
              padding: '0.35rem 0.6rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id}>
                {locale === 'ar' ? r.nameArabic : locale === 'ur' ? r.nameUrdu : r.nameEnglish} (
                {r.style})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowProvenanceModal(!showProvenanceModal)}
            title={dict.audio.attribution}
            style={{
              backgroundColor: '#064e3b',
              color: '#6ee7b7',
              border: '1px solid #047857',
              borderRadius: '0.375rem',
              padding: '0.35rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span>🛡️</span>
            <span>{dict.audio.verifiedLicensing}</span>
          </button>
        </div>
      </div>

      {/* Provenance & Licensing Information Card (Expandable) */}
      {showProvenanceModal && currentTrack && (
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #047857',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#cbd5e1',
            lineHeight: '1.5'
          }}
        >
          <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.35rem' }}>
            {dict.audio.attribution}: {currentTrack.attributionRequirement}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>License / Waqf Status:</strong> {currentTrack.licenseType} (
            <span style={{ color: '#6ee7b7' }}>{currentTrack.redistributionStatus}</span>)
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            <strong>Usage Scope:</strong> {currentTrack.allowedUsage}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {dict.audio.takedown}:{' '}
            <a
              href={`mailto:${currentTrack.takedownContact}`}
              style={{ color: '#38bdf8', textDecoration: 'underline' }}
            >
              {currentTrack.takedownContact}
            </a>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: '#7f1d1d',
            color: '#fecaca',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.8rem',
            marginBottom: '0.75rem'
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Progress Bar & Timestamps */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#94a3b8',
            marginBottom: '0.25rem'
          }}
        >
          <span>{formatPlaybackTime(currentTimeMs)}</span>
          {activeAyah && (
            <span style={{ color: '#34d399', fontWeight: 700 }}>
              {dict.audio.currentAyah}: {surahId}:{activeAyah}
            </span>
          )}
          <span>{formatPlaybackTime(durationMs)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progressPercent}
          onChange={handleSeek}
          aria-label="Seek track position"
          style={{
            width: '100%',
            accentColor: '#10b981',
            cursor: 'pointer',
            height: '0.4rem',
            borderRadius: '0.2rem'
          }}
        />
      </div>

      {/* Bottom Controls Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        {/* Playback Transport: Rewind, Play/Pause, Fast-Forward */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => skipSeconds(-5)}
            title={dict.audio.seekBackward}
            style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            ⏮ -5s
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={isLoading}
            style={{
              backgroundColor: isPlaying ? '#047857' : '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
            aria-label={isPlaying ? dict.audio.pause : dict.audio.play}
          >
            {isLoading ? '⏳' : isPlaying ? '⏸' : '▶'}
          </button>

          <button
            type="button"
            onClick={() => skipSeconds(5)}
            title={dict.audio.seekForward}
            style={{
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.4rem 0.6rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            +5s ⏭
          </button>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{dict.audio.speed}:</span>
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              style={{
                backgroundColor: playbackRate === rate ? '#047857' : '#1e293b',
                color: playbackRate === rate ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '0.2rem 0.45rem',
                fontSize: '0.75rem',
                fontWeight: playbackRate === rate ? 700 : 400,
                cursor: 'pointer'
              }}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume & Download */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? dict.audio.unmute : dict.audio.mute}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#e2e8f0',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            aria-label={dict.audio.volume}
            style={{
              width: '4rem',
              accentColor: '#10b981',
              cursor: 'pointer'
            }}
          />

          {currentTrack?.audioUrl && (
            <a
              href={currentTrack.audioUrl}
              download={`Surah-${surahId.toString().padStart(3, '0')}-${selectedReciterId}.mp3`}
              target="_blank"
              rel="noopener noreferrer"
              title={dict.audio.download}
              style={{
                backgroundColor: '#1e293b',
                color: '#34d399',
                textDecoration: 'none',
                padding: '0.3rem 0.5rem',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              ⬇️
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
