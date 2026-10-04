/**
 * @file offline-db.ts
 * @package @islamic/web
 * @description Standard browser IndexedDB engine for persistent offline scripture access,
 *              supporting Medina Mushaf Surahs, Kutub al-Sittah Hadiths, and reciter audio chunks.
 *              Strictly typed and guarded against server-side rendering environments.
 */

const DB_NAME = 'islam_ul_haramain_offline_v1';
const DB_VERSION = 1;

export const STORES = {
  MUSHAF_CACHE: 'mushaf_cache',
  HADITH_CACHE: 'hadith_cache',
  AUDIO_CHUNKS: 'audio_chunks',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export interface CachedSurahRecord<T = unknown> {
  surahId: number;
  data: T;
  cachedAt: number;
  version: number;
}

export interface CachedHadithRecord<T = unknown> {
  key: string; // `${collectionId}:${hadithNumber}`
  collectionId: string;
  hadithNumber: number;
  data: T;
  cachedAt: number;
}

export interface CachedAudioChunkRecord {
  audioId: string;
  blob: Blob | ArrayBuffer;
  metadata?: Record<string, unknown>;
  cachedAt: number;
  byteSize: number;
}

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

/**
 * Initializes and upgrades the IndexedDB instance for offline scripture storage.
 */
export async function initOfflineDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is not available in non-browser environments.');
  }

  if (dbInstance) {
    return dbInstance;
  }

  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Mushaf Cache: keyPath is surahId (number)
      if (!db.objectStoreNames.contains(STORES.MUSHAF_CACHE)) {
        const mushafStore = db.createObjectStore(STORES.MUSHAF_CACHE, { keyPath: 'surahId' });
        mushafStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // 2. Hadith Cache: keyPath is key string (collectionId:hadithNumber)
      if (!db.objectStoreNames.contains(STORES.HADITH_CACHE)) {
        const hadithStore = db.createObjectStore(STORES.HADITH_CACHE, { keyPath: 'key' });
        hadithStore.createIndex('collectionId', 'collectionId', { unique: false });
        hadithStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }

      // 3. Audio Chunks Cache: keyPath is audioId (string)
      if (!db.objectStoreNames.contains(STORES.AUDIO_CHUNKS)) {
        const audioStore = db.createObjectStore(STORES.AUDIO_CHUNKS, { keyPath: 'audioId' });
        audioStore.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      dbInitPromise = null;
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbInitPromise;
}

/**
 * Persists a complete Surah (with all ayah records and metadata) to IndexedDB.
 */
export async function cacheSurah<T = unknown>(surahId: number, data: T): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MUSHAF_CACHE, 'readwrite');
    const store = tx.objectStore(STORES.MUSHAF_CACHE);

    const record: CachedSurahRecord<T> = {
      surahId,
      data,
      cachedAt: Date.now(),
      version: 1,
    };

    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves a cached Surah from IndexedDB by its surahId (1 - 114).
 */
export async function getOfflineSurah<T = unknown>(surahId: number): Promise<T | null> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.MUSHAF_CACHE, 'readonly');
    const store = tx.objectStore(STORES.MUSHAF_CACHE);
    const request = store.get(surahId);

    request.onsuccess = () => {
      const record = request.result as CachedSurahRecord<T> | undefined;
      resolve(record ? record.data : null);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Persists a verified Hadith narration to IndexedDB.
 */
export async function cacheHadith<T = unknown>(
  collectionId: string,
  hadithNumber: number,
  data: T
): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HADITH_CACHE, 'readwrite');
    const store = tx.objectStore(STORES.HADITH_CACHE);

    const record: CachedHadithRecord<T> = {
      key: `${collectionId.toLowerCase()}:${hadithNumber}`,
      collectionId: collectionId.toLowerCase(),
      hadithNumber,
      data,
      cachedAt: Date.now(),
    };

    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves a cached Hadith narration by collection and number.
 */
export async function getOfflineHadith<T = unknown>(
  collectionId: string,
  hadithNumber: number
): Promise<T | null> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HADITH_CACHE, 'readonly');
    const store = tx.objectStore(STORES.HADITH_CACHE);
    const key = `${collectionId.toLowerCase()}:${hadithNumber}`;
    const request = store.get(key);

    request.onsuccess = () => {
      const record = request.result as CachedHadithRecord<T> | undefined;
      resolve(record ? record.data : null);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Caches an audio chunk (Blob or ArrayBuffer) for gapless offline recitation playback.
 */
export async function cacheAudioChunk(
  audioId: string,
  blob: Blob | ArrayBuffer,
  metadata?: Record<string, unknown>
): Promise<void> {
  const db = await initOfflineDB();
  const byteSize = blob instanceof Blob ? blob.size : blob.byteLength;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.AUDIO_CHUNKS, 'readwrite');
    const store = tx.objectStore(STORES.AUDIO_CHUNKS);

    const record: CachedAudioChunkRecord = {
      audioId,
      blob,
      metadata,
      cachedAt: Date.now(),
      byteSize,
    };

    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves a cached audio chunk by its unique ID.
 */
export async function getOfflineAudioChunk(
  audioId: string
): Promise<{ blob: Blob | ArrayBuffer; metadata?: Record<string, unknown> } | null> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.AUDIO_CHUNKS, 'readonly');
    const store = tx.objectStore(STORES.AUDIO_CHUNKS);
    const request = store.get(audioId);

    request.onsuccess = () => {
      const record = request.result as CachedAudioChunkRecord | undefined;
      if (!record) {
        resolve(null);
        return;
      }
      resolve({ blob: record.blob, metadata: record.metadata });
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clears an entire store in the offline cache.
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Inspects browser storage quota and usage.
 */
export async function getStorageUsage(): Promise<{ usedBytes: number; quotaBytes: number; percentage: number }> {
  if (typeof navigator !== 'undefined' && 'storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usedBytes = estimate.usage || 0;
    const quotaBytes = estimate.quota || 0;
    const percentage = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;
    return { usedBytes, quotaBytes, percentage };
  }
  return { usedBytes: 0, quotaBytes: 0, percentage: 0 };
}
