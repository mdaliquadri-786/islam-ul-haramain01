/**
 * @file rate-limit.ts
 * @package @islamic/web
 * @description In-memory sliding-window rate limiting engine & abuse prevention utility.
 * Enforces Tier 1 (Auth/Privileged), Tier 2 (Mutations/Search), and Tier 3 (Public Reads) limits.
 * Milestone: M9 Phase 4 — Vulnerability Mitigation, Rate Limiting & Penetration Hardening
 */

import { NextRequest, NextResponse } from 'next/server';

export type RateLimitTier = 'tier1_auth' | 'tier2_mutation' | 'tier3_public';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_TIERS: Record<RateLimitTier, RateLimitConfig> = {
  tier1_auth: {
    maxRequests: 10,
    windowSeconds: 60,
  },
  tier2_mutation: {
    maxRequests: 60,
    windowSeconds: 60,
  },
  tier3_public: {
    maxRequests: 300,
    windowSeconds: 60,
  },
};

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired records every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 60000) return; // Only cleanup at most once per minute
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    const valid = record.timestamps.filter((ts) => now - ts < windowMs);
    if (valid.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = valid;
    }
  }
}

/**
 * Extracts a client identifier from NextRequest headers safely.
 * Prioritizes CF-Connecting-IP, X-Real-IP, and standard X-Forwarded-For before fallback.
 */
export function getClientIdentifier(request: NextRequest, customId?: string): string {
  if (customId) return customId;

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return '127.0.0.1';
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in seconds
  retryAfter: number; // Seconds until reset
}

/**
 * Checks and records a request against the rate limiter.
 */
export function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = 'tier2_mutation'
): RateLimitResult {
  const config = RATE_LIMIT_TIERS[tier];
  const windowMs = config.windowSeconds * 1000;
  const now = Date.now();

  cleanupStaleEntries(windowMs);

  const key = `${tier}:${identifier}`;
  let record = rateLimitStore.get(key);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const currentCount = record.timestamps.length;
  const resetTime = Math.ceil((now + windowMs) / 1000);
  const oldestTimestamp = record.timestamps[0] || now;
  const retryAfter = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

  if (currentCount >= config.maxRequests) {
    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime,
      retryAfter,
    };
  }

  // Record this request
  record.timestamps.push(now);

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.timestamps.length,
    resetTime,
    retryAfter: 0,
  };
}

/**
 * Generates standard rate limiting headers.
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetTime),
  };

  if (!result.allowed) {
    headers['Retry-After'] = String(result.retryAfter);
  }

  return headers;
}

/**
 * Helper to enforce rate limiting on a Next.js API route handler.
 * Returns null if allowed, or an HTTP 429 Too Many Requests response if exceeded.
 */
export function enforceRateLimit(
  request: NextRequest,
  tier: RateLimitTier,
  customIdentifier?: string
): { allowed: boolean; errorResponse?: NextResponse; headers: Record<string, string> } {
  const clientId = getClientIdentifier(request, customIdentifier);
  const result = checkRateLimit(clientId, tier);
  const headers = createRateLimitHeaders(result);

  if (!result.allowed) {
    return {
      allowed: false,
      headers,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Too Many Requests: Rate limit exceeded. Please retry later.',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers,
        }
      ),
    };
  }

  return { allowed: true, headers };
}

/**
 * Reset store (primarily for unit test isolation)
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
