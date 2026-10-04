/**
 * @file audio-prefetch.worker.ts
 * @package @islamic/web
 * @description Dedicated Background Web Worker for resilient, non-blocking Quran recitation
 *              audio prefetching. Downloads upcoming Ayah recitation audio chunks, checks
 *              existing IndexedDB cache, and writes binary audio blobs to persistent offline
 *              IndexedDB storage without stalling the main UI rendering thread.
 */

import { cacheAudioChunk, getOfflineAudioChunk } from '../pwa/offline-db';

export interface PrefetchAyahMessage {
  type: 'PREFETCH_AYAH';
  urls: string[];
  surahId?: number;
}

export interface CancelPrefetchMessage {
  type: 'CANCEL';
}

export type IncomingWorkerMessage = PrefetchAyahMessage | CancelPrefetchMessage;

export interface PrefetchProgressResponse {
  type: 'PREFETCH_PROGRESS';
  url: string;
  completed: number;
  total: number;
  success: boolean;
  cachedFromDB?: boolean;
}

export interface PrefetchCompleteResponse {
  type: 'PREFETCH_COMPLETE';
  total: number;
  successful: number;
  failed: number;
}

export interface PrefetchErrorResponse {
  type: 'PREFETCH_ERROR';
  url?: string;
  error: string;
}

export type OutgoingWorkerMessage =
  | PrefetchProgressResponse
  | PrefetchCompleteResponse
  | PrefetchErrorResponse;

export interface WorkerContext {
  postMessage: (message: OutgoingWorkerMessage) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<IncomingWorkerMessage>) => void
  ) => void;
}

// Worker context handle
const ctx = self as unknown as WorkerContext;

let activeAbortController: AbortController | null = null;

/**
 * Derives a deterministic audioId key from a remote recitation audio URL.
 */
function getAudioKeyFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Use pathname or hash
    return parsed.pathname.replace(/^\/+/, '');
  } catch {
    return url;
  }
}

/**
 * Concurrently processes a queue of audio URLs with maximum concurrency limiter.
 */
async function processPrefetchUrls(urls: string[], signal: AbortSignal): Promise<void> {
  const total = urls.length;
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i++) {
    if (signal.aborted) {
      break;
    }

    const url = urls[i];
    const audioKey = getAudioKeyFromUrl(url);

    try {
      // 1. Check if audio chunk is already in IndexedDB
      const existing = await getOfflineAudioChunk(audioKey);
      if (existing) {
        successful++;
        ctx.postMessage({
          type: 'PREFETCH_PROGRESS',
          url,
          completed: i + 1,
          total,
          success: true,
          cachedFromDB: true,
        } satisfies PrefetchProgressResponse);
        continue;
      }

      // 2. Fetch binary audio chunk via network
      const response = await fetch(url, {
        signal,
        cache: 'force-cache',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // 3. Persist to IndexedDB audio chunks store
      await cacheAudioChunk(audioKey, blob, {
        sourceUrl: url,
        contentType: blob.type || 'audio/mpeg',
        prefetchedAt: Date.now(),
      });

      successful++;
      ctx.postMessage({
        type: 'PREFETCH_PROGRESS',
        url,
        completed: i + 1,
        total,
        success: true,
        cachedFromDB: false,
      } satisfies PrefetchProgressResponse);
    } catch (err: unknown) {
      if (signal.aborted) {
        break;
      }

      failed++;
      const errorMessage = err instanceof Error ? err.message : String(err);
      ctx.postMessage({
        type: 'PREFETCH_PROGRESS',
        url,
        completed: i + 1,
        total,
        success: false,
      } satisfies PrefetchProgressResponse);

      ctx.postMessage({
        type: 'PREFETCH_ERROR',
        url,
        error: errorMessage,
      } satisfies PrefetchErrorResponse);
    }
  }

  ctx.postMessage({
    type: 'PREFETCH_COMPLETE',
    total,
    successful,
    failed,
  } satisfies PrefetchCompleteResponse);
}

// Global message event listener for background worker
ctx.addEventListener('message', (event: MessageEvent<IncomingWorkerMessage>) => {
  const data = event.data;

  if (!data || typeof data !== 'object') {
    return;
  }

  if (data.type === 'CANCEL') {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
    return;
  }

  if (data.type === 'PREFETCH_AYAH') {
    // Abort any ongoing batch
    if (activeAbortController) {
      activeAbortController.abort();
    }

    const urls = Array.isArray(data.urls) ? data.urls.filter((u) => typeof u === 'string' && u.length > 0) : [];
    if (urls.length === 0) {
      ctx.postMessage({
        type: 'PREFETCH_COMPLETE',
        total: 0,
        successful: 0,
        failed: 0,
      } satisfies PrefetchCompleteResponse);
      return;
    }

    activeAbortController = new AbortController();
    void processPrefetchUrls(urls, activeAbortController.signal);
  }
});
