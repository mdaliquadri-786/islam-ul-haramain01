'use client';

/**
 * @file useAudioPrefetcher.ts
 * @package @islamic/web
 * @description React hook managing the dedicated audio-prefetch background Web Worker.
 *              Enables proactive downloading and IndexedDB persistence of upcoming Ayah
 *              recitations (gapless buffer ahead of current playback position) while
 *              safeguarding main-thread performance and providing SSR safety.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  IncomingWorkerMessage,
  OutgoingWorkerMessage,
} from '../lib/workers/audio-prefetch.worker';

export interface UseAudioPrefetcherOptions {
  lookaheadCount?: number;
  onProgress?: (completed: number, total: number, url: string) => void;
  onComplete?: (successful: number, failed: number) => void;
  onError?: (error: string) => void;
}

export interface PrefetchProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface UseAudioPrefetcherReturn {
  isPrefetching: boolean;
  progress: PrefetchProgress;
  prefetchUrls: (urls: string[]) => void;
  prefetchNextAyahs: (
    surahNumber: number,
    currentAyahNumber: number,
    totalAyahsInSurah: number,
    urlBuilder?: (surah: number, ayah: number) => string
  ) => void;
  cancel: () => void;
}

/**
 * Default CDN audio URL builder for canonical recitation (Mishary Rashid al-Afasy).
 */
export function defaultAyahAudioUrl(surahNumber: number, ayahNumber: number): string {
  const paddedSurah = String(surahNumber).padStart(3, '0');
  const paddedAyah = String(ayahNumber).padStart(3, '0');
  return `https://everyayah.com/data/Alafasy_128kbps/${paddedSurah}${paddedAyah}.mp3`;
}

export function useAudioPrefetcher(
  options: UseAudioPrefetcherOptions = {}
): UseAudioPrefetcherReturn {
  const { lookaheadCount = 3, onProgress, onComplete, onError } = options;

  const workerRef = useRef<Worker | null>(null);
  const [isPrefetching, setIsPrefetching] = useState<boolean>(false);
  const [progress, setProgress] = useState<PrefetchProgress>({
    completed: 0,
    total: 0,
    percentage: 0,
  });

  // Keep callback refs fresh
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Initialize Web Worker with SSR and test-environment safety guards
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.Worker === 'undefined') {
      return;
    }

    let worker: Worker | null = null;
    try {
      worker = new Worker(
        new URL('../lib/workers/audio-prefetch.worker.ts', import.meta.url)
      );

      worker.onmessage = (event: MessageEvent<OutgoingWorkerMessage>) => {
        const msg = event.data;
        if (!msg) return;

        if (msg.type === 'PREFETCH_PROGRESS') {
          const pct = msg.total > 0 ? Math.round((msg.completed / msg.total) * 100) : 0;
          setProgress({
            completed: msg.completed,
            total: msg.total,
            percentage: pct,
          });
          onProgressRef.current?.(msg.completed, msg.total, msg.url);
        } else if (msg.type === 'PREFETCH_COMPLETE') {
          setIsPrefetching(false);
          setProgress({
            completed: msg.total,
            total: msg.total,
            percentage: 100,
          });
          onCompleteRef.current?.(msg.successful, msg.failed);
        } else if (msg.type === 'PREFETCH_ERROR') {
          onErrorRef.current?.(msg.error);
        }
      };

      workerRef.current = worker;
    } catch {
      // Worker construction failed or not supported in this runtime
      workerRef.current = null;
    }

    return () => {
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const cancel = useCallback(() => {
    if (workerRef.current) {
      const msg: IncomingWorkerMessage = { type: 'CANCEL' };
      workerRef.current.postMessage(msg);
    }
    setIsPrefetching(false);
  }, []);

  const prefetchUrls = useCallback((urls: string[]) => {
    if (urls.length === 0) return;

    if (workerRef.current) {
      setIsPrefetching(true);
      setProgress({ completed: 0, total: urls.length, percentage: 0 });
      const msg: IncomingWorkerMessage = {
        type: 'PREFETCH_AYAH',
        urls,
      };
      workerRef.current.postMessage(msg);
    }
  }, []);

  const prefetchNextAyahs = useCallback(
    (
      surahNumber: number,
      currentAyahNumber: number,
      totalAyahsInSurah: number,
      urlBuilder = defaultAyahAudioUrl
    ) => {
      const upcomingUrls: string[] = [];
      const endAyah = Math.min(currentAyahNumber + lookaheadCount, totalAyahsInSurah);

      for (let ayah = currentAyahNumber + 1; ayah <= endAyah; ayah++) {
        upcomingUrls.push(urlBuilder(surahNumber, ayah));
      }

      if (upcomingUrls.length > 0) {
        prefetchUrls(upcomingUrls);
      }
    },
    [lookaheadCount, prefetchUrls]
  );

  return {
    isPrefetching,
    progress,
    prefetchUrls,
    prefetchNextAyahs,
    cancel,
  };
}
