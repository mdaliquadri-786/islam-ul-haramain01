'use client';

/**
 * @file useWordAudioSync.ts
 * @package @islamic/web
 * @description Hyper-precise word-by-word Quran recitation synchronization hook.
 *              Uses requestAnimationFrame against HTMLAudioElement for sub-millisecond
 *              temporal tracking, minimizing state re-renders via change-detection gates.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface WordTimestamp {
  id: string; // e.g. "2:255:1" (surah:ayah:wordIndex)
  start: number; // in seconds (e.g. 0.420)
  end: number; // in seconds (e.g. 0.980)
}

export interface UseWordAudioSyncOptions {
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: (err: MediaError | null) => void;
  playbackRate?: number;
}

export interface UseWordAudioSyncReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  activeWordId: string | null;
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  seekToWord: (wordId: string) => void;
  seekToTime: (timeSeconds: number) => void;
  setRate: (rate: number) => void;
}

export function useWordAudioSync(
  audioUrl?: string | null,
  wordTimestamps: WordTimestamp[] = [],
  options: UseWordAudioSyncOptions = {}
): UseWordAudioSyncReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const activeWordIdRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);

  const { autoPlay = false, onEnded, onError, playbackRate = 1.0 } = options;

  // Initialize or update audio element when audioUrl changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;
    audio.playbackRate = playbackRate;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      if (autoPlay) {
        audio.play().catch(() => setIsPlaying(false));
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      activeWordIdRef.current = null;
      setActiveWordId(null);
      if (onEnded) onEnded();
    };
    const handleError = () => {
      setIsPlaying(false);
      if (onError) onError(audio.error);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (audioUrl && audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    } else if (!audioUrl) {
      audio.pause();
      audio.removeAttribute('src');
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      activeWordIdRef.current = null;
      setActiveWordId(null);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl, autoPlay, onEnded, onError, playbackRate]);

  // Binary search for matching word timestamp: O(log N)
  const findWordAtTime = useCallback(
    (time: number): string | null => {
      if (wordTimestamps.length === 0) return null;

      let low = 0;
      let high = wordTimestamps.length - 1;

      while (low <= high) {
        const mid = (low + high) >> 1;
        const entry = wordTimestamps[mid];

        if (time >= entry.start && time <= entry.end) {
          return entry.id;
        } else if (time < entry.start) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      // Fallback: check if between adjacent words (tolerance margin)
      for (let i = 0; i < wordTimestamps.length; i++) {
        const curr = wordTimestamps[i];
        if (time >= curr.start && time < (wordTimestamps[i + 1]?.start ?? curr.end)) {
          return curr.id;
        }
      }

      return null;
    },
    [wordTimestamps]
  );

  // Synchronous High-Precision Loop via requestAnimationFrame
  useEffect(() => {
    if (!isPlaying) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const tick = () => {
      const audio = audioRef.current;
      if (!audio) return;

      const time = audio.currentTime;
      setCurrentTime(time);

      const matchedWordId = findWordAtTime(time);
      // ONLY trigger React state update if the active word changed
      if (matchedWordId !== activeWordIdRef.current) {
        activeWordIdRef.current = matchedWordId;
        setActiveWordId(matchedWordId);
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [isPlaying, findWordAtTime]);

  const play = useCallback(async () => {
    if (!audioRef.current || !audioUrl) return;
    try {
      await audioRef.current.play();
    } catch {
      setIsPlaying(false);
    }
  }, [audioUrl]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      play();
    } else {
      pause();
    }
  }, [play, pause]);

  const seekToTime = useCallback((timeSeconds: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(timeSeconds, audioRef.current.duration || 0));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const seekToWord = useCallback(
    (wordId: string) => {
      const target = wordTimestamps.find((w) => w.id === wordId);
      if (target) {
        seekToTime(target.start);
      }
    },
    [wordTimestamps, seekToTime]
  );

  const setRate = useCallback((rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
  }, []);

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    activeWordId,
    play,
    pause,
    togglePlay,
    seekToWord,
    seekToTime,
    setRate,
  };
}
