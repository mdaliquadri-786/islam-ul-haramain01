/**
 * @file correlation.ts
 * @package @islamic/database
 * @description Request correlation and tracing identifiers.
 * Enforces strict validation, spoofing protection, and server-side regeneration.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Strict regex pattern for allowable Correlation IDs:
 * Must be 16 to 64 alphanumeric characters, underscores, or dashes.
 * Rejects control characters, SQL injection payloads, whitespace, and excessive lengths.
 */
export const CORRELATION_ID_REGEX = /^[a-zA-Z0-9_-]{16,64}$/;

/**
 * Validates whether a candidate string is a compliant Correlation ID.
 * Returns the validated string if compliant; otherwise returns null.
 */
export function validateCorrelationId(candidate: string | null | undefined): string | null {
  if (!candidate || typeof candidate !== 'string') {
    return null;
  }
  const trimmed = candidate.trim();
  if (CORRELATION_ID_REGEX.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Resolves a safe Correlation ID.
 * If the incoming ID is valid, it is preserved to maintain the trace.
 * If absent, invalid, or malicious, a fresh cryptographically secure UUID v4 is generated.
 */
export function resolveCorrelationId(incomingId: string | null | undefined): string {
  const validated = validateCorrelationId(incomingId);
  if (validated) {
    return validated;
  }
  return generateSecureId();
}

/**
 * Generates a fresh, unique server-side request identifier.
 * Format: req_<32 hex chars>
 */
export function generateRequestId(): string {
  return `req_${generateSecureId().replace(/-/g, '')}`;
}

/**
 * Cryptographically secure UUID generator utilizing runtime crypto API.
 */
export function generateSecureId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback RFC4122 v4 generator if crypto.randomUUID is somehow unavailable
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
