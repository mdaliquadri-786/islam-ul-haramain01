/**
 * @file scrubber.ts
 * @package @islamic/database
 * @description Centralized PII, secret, and religious interaction data scrubber.
 * Enforces non-negotiable redaction across all operational logs and diagnostics.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

/**
 * Replacement token for scrubbed sensitive content.
 */
export const REDACTED_VALUE = '[REDACTED]';

/**
 * Sensitive field names that are unconditionally redacted.
 */
export const SENSITIVE_KEY_PATTERN =
  /^(password|passwd|secret|token|jwt|auth|authorization|cookie|session|apikey|api_key|service_role|email|phone|phonenumber|lat|latitude|lng|longitude|coord|coordinates|madhhab|quran_query|hadith_query|dua_query|personal_note|reflection)$/i;

/**
 * Compiled regex patterns for redaction within arbitrary text.
 */
const PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // 1. Authorization header / Bearer token
  {
    pattern: /(Bearer\s+)[A-Za-z0-9\-_=.]+/gi,
    replacement: '$1[REDACTED]',
  },
  // 2. JWT token pattern: eyJ...
  {
    pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
    replacement: '[REDACTED_JWT]',
  },
  // 3. Supabase / Cloud API keys: sbp_..., AIza..., sk_live_..., sk_test_...
  {
    pattern: /\b(sbp_[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_\-]{35}|sk_live_[a-zA-Z0-9]{24,}|sk_test_[a-zA-Z0-9]{24,})\b/g,
    replacement: '[REDACTED_KEY]',
  },
  // 4. Supabase service role indicator
  {
    pattern: /\b(service_role|supabase_admin_key)[:=\s]+[A-Za-z0-9\-_=.]+/gi,
    replacement: '$1=[REDACTED_SECRET]',
  },
  // 5. Cookie values: session=..., sb-...-auth-token=...
  {
    pattern: /(?:session|sb-[a-z0-9]+-auth-token)=([A-Za-z0-9\-_=.]+)/gi,
    replacement: 'cookie=[REDACTED_COOKIE]',
  },
  // 6. Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replacement: '[REDACTED_EMAIL]',
  },
  // 7. Phone numbers (international and local formats)
  {
    pattern: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    replacement: '[REDACTED_PHONE]',
  },
  // 8. IPv4 addresses
  {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: '[REDACTED_IP]',
  },
  // 9. IPv6 addresses
  {
    pattern: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    replacement: '[REDACTED_IPV6]',
  },
  // 10. Geolocation coordinate pairs (lat, lng)
  {
    pattern: /\b[-+]?([1-8]?\d(?:\.\d+)?|90(?:\.0+)?),\s*[-+]?(180(?:\.0+)?|((1[0-7]\d)|([1-9]?\d))(?:\.\d+)?)\b/g,
    replacement: '[REDACTED_COORDINATES]',
  },
  // 11. Madhhab religious preferences
  {
    pattern: /\b(hanafi|shafi'?i|maliki|hanbali)\b/gi,
    replacement: '[REDACTED_MADHHAB]',
  },
  // 12. Prayer calculation method preferences
  {
    pattern: /\b(umm_al_qura|umm al-qura|muslim_world_league|mwl|isna|egyptian|karachi|makkah|tehran|jafari)\b/gi,
    replacement: '[REDACTED_CALC_METHOD]',
  },
  // 13. Religious query / devotional text indicators
  {
    pattern: /(?:quran|hadith|dua|dhikr|adhkar|tafsir)[_\s-]*(?:search|query|text|title)[:=\s]+["']?([^"',\n]+)["']?/gi,
    replacement: 'religious_query=[REDACTED_RELIGIOUS_QUERY]',
  },
  // 14. Personal devotional notes and bookmarks
  {
    pattern: /(?:personal[_\s-]*note|reflection|bookmark[_\s-]*title)[:=\s]+["']?([^"',\n]+)["']?/gi,
    replacement: 'personal_note=[REDACTED_NOTE]',
  },
];

/**
 * Sanitizes a single string value against all prohibited patterns.
 */
export function sanitizeString(text: string): string {
  if (!text || typeof text !== 'string') return text;

  let sanitized = text;
  for (const { pattern, replacement } of PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

/**
 * Recursively sanitizes any value or nested structure.
 * Safeguards against circular references using a WeakSet.
 */
export function sanitizeValue<T>(val: T, seen = new WeakSet<object>()): T {
  if (val === null || val === undefined) {
    return val;
  }

  if (typeof val === 'string') {
    return sanitizeString(val) as unknown as T;
  }

  if (typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }

  if (typeof val === 'object') {
    if (seen.has(val as object)) {
      return '[CIRCULAR]' as unknown as T;
    }
    seen.add(val as object);

    if (Array.isArray(val)) {
      return val.map((item) => sanitizeValue(item, seen)) as unknown as T;
    }

    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(val as Record<string, unknown>)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        cleaned[key] = REDACTED_VALUE;
      } else {
        cleaned[key] = sanitizeValue(value, seen);
      }
    }
    return cleaned as unknown as T;
  }

  return val;
}
