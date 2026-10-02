/**
 * ISLAM UL HARAMAIN — STAGING LOAD TESTING SUITE (k6)
 * Milestone: M6.2 (Security Penetration & Load Testing)
 * 
 * STRICT TARGET RESTRICTION:
 * STAGING INFRASTRUCTURE ONLY (Never execute against production)
 * 
 * Target Workload Distribution:
 *   - Scripture Reader (Quran, Reciters, Tafsir): 60%
 *   - Prayer & Hijri Engine (/api/prayer-times, /api/qibla): 25%
 *   - Search & Citations (/api/search): 10%
 *   - Authenticated Sync & Mutations (/api/library/bookmarks, progress): 5%
 * 
 * Peak Concurrency Range:
 *   1,000 to 5,000 Virtual Users (Configurable via PEAK_VUS, default: 1,000)
 * 
 * Usage:
 *   k6 run -e STAGING_URL=https://staging.islamic-platform.org scripts/staging-load-test.js
 *   k6 run -e STAGING_URL=https://staging.islamic-platform.org -e PEAK_VUS=2500 scripts/staging-load-test.js
 *   k6 run -e STAGING_URL=https://staging.islamic-platform.org -e STAGING_AUTH_TOKEN=<token> scripts/staging-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// --- Production Target Safeguard ---
const BASE_URL = __ENV.STAGING_URL || 'http://localhost:3000';

if (
  (BASE_URL.includes('islamic-platform.org') && !BASE_URL.includes('staging')) ||
  BASE_URL.includes('api.islamic-platform.org') ||
  BASE_URL.includes('prod')
) {
  throw new Error(`CRITICAL ABORT: Load test target "${BASE_URL}" appears to be a PRODUCTION environment. Testing is strictly prohibited.`);
}

const PEAK_VUS = parseInt(__ENV.PEAK_VUS || '1000', 10);
const AUTH_TOKEN = __ENV.STAGING_AUTH_TOKEN || null;

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: Math.round(PEAK_VUS * 0.1) },  // Stage 1: Warm-up (10% capacity)
    { duration: '3m', target: Math.round(PEAK_VUS * 0.4) },  // Stage 2: Sustained baseline (40% capacity)
    { duration: '1m', target: PEAK_VUS },                    // Stage 3: Peak Adhan spike burst (100% capacity)
    { duration: '1m', target: 0 },                           // Stage 4: Controlled ramp-down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],       // 95% < 500ms, 99% < 1000ms
    'errors': ['rate<0.01'],                                // Error rate < 1% (excluding expected rate limits)
  },
};

export default function () {
  // Generate random distribution value [0, 100)
  const roll = Math.random() * 100;

  if (roll < 60) {
    // ------------------------------------------------------------------------
    // Scenario A: Scripture Reader (60% of total traffic)
    // ------------------------------------------------------------------------
    const readerSubRoll = Math.random();
    if (readerSubRoll < 0.5) {
      // Audio Reciters catalog
      const res = http.get(`${BASE_URL}/api/audio/reciters`, {
        headers: { 'Accept': 'application/json' },
      });
      check(res, { 'reciters status is 200': (r) => r.status === 200 }) || errorRate.add(1);
    } else if (readerSubRoll < 0.8) {
      // Audio Surah Track
      const res = http.get(`${BASE_URL}/api/audio/surah/1`, {
        headers: { 'Accept': 'application/json' },
      });
      check(res, { 'audio track status is 200 or 404': (r) => r.status === 200 || r.status === 404 }) || errorRate.add(1);
    } else {
      // Comparative Tafsir Works Catalog
      const res = http.get(`${BASE_URL}/api/tafsir/works`, {
        headers: { 'Accept': 'application/json' },
      });
      check(res, { 'tafsir works status is 200': (r) => r.status === 200 }) || errorRate.add(1);
    }
    sleep(1.0);

  } else if (roll < 85) {
    // ------------------------------------------------------------------------
    // Scenario B: Prayer Times & Hijri Calendar (25% of total traffic)
    // ------------------------------------------------------------------------
    const prayerSubRoll = Math.random();
    if (prayerSubRoll < 0.8) {
      // Prayer Times calculation
      const res = http.get(`${BASE_URL}/api/prayer-times?latitude=21.4225&longitude=39.8262&method=MWL`, {
        headers: { 'Accept': 'application/json' },
      });
      check(res, { 'prayer times status is 200': (r) => r.status === 200 }) || errorRate.add(1);
    } else {
      // Great-Circle Qibla bearing
      const res = http.get(`${BASE_URL}/api/qibla?latitude=40.7128&longitude=-74.0060`, {
        headers: { 'Accept': 'application/json' },
      });
      check(res, { 'qibla status is 200': (r) => r.status === 200 }) || errorRate.add(1);
    }
    sleep(0.5);

  } else if (roll < 95) {
    // ------------------------------------------------------------------------
    // Scenario C: Search & Citations (10% of total traffic)
    // ------------------------------------------------------------------------
    const searchTerms = ['rahman', 'salat', 'bukhari', 'jannah', 'taqwa'];
    const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const res = http.get(`${BASE_URL}/api/search?q=${term}&type=quran&limit=20`, {
      headers: { 'Accept': 'application/json' },
    });
    check(res, { 'search status is 200': (r) => r.status === 200 }) || errorRate.add(1);
    sleep(0.5);

  } else {
    // ------------------------------------------------------------------------
    // Scenario D: Authenticated Sync & Library Mutations (5% of total traffic)
    // ------------------------------------------------------------------------
    const headers = { 'Accept': 'application/json' };
    if (AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }

    const res = http.get(`${BASE_URL}/api/library/bookmarks`, { headers });
    // In unauthenticated test runs, 401 is an expected, secure behavior; 200 if token supplied
    check(res, {
      'sync/bookmarks handled properly (200 or 401)': (r) => r.status === 200 || r.status === 401,
    }) || errorRate.add(1);
    sleep(1.0);
  }
}
