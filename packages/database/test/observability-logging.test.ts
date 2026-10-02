/**
 * @file observability-logging.test.ts
 * @package @islamic/database
 * @description Comprehensive unit and security tests for structured logging, PII redaction,
 * correlation ID resolution, and religious interaction privacy guarantees.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLogger,
  StructuredLogger,
  sanitizeString,
  sanitizeValue,
  resolveCorrelationId,
  validateCorrelationId,
  generateRequestId,
  checkLiveness,
  checkReadiness,
  checkDeepHealth,
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  type LogLevel,
  type StructuredLogRecord,
} from '../src/observability/index';

describe('M8 Phase 2 — Structured Logging & Privacy Tests', () => {
  test('1. Structured Logger emits valid NDJSON with strictly typed schema', () => {
    const emittedLines: Array<{ line: string; level: LogLevel }> = [];
    const logger = createLogger({
      service: 'test-service',
      environment: 'test',
      minLevel: 'DEBUG',
      sink: (line, level) => emittedLines.push({ line, level }),
    });

    logger.info({
      message: 'System initialization complete',
      correlationId: 'test-correlation-id-12345',
      requestId: 'req_1234567890abcdef',
      durationMs: 42.5,
      routeClass: '/api/test',
      httpMethod: 'GET',
      statusCode: 200,
    });

    assert.equal(emittedLines.length, 1);
    const parsed: StructuredLogRecord = JSON.parse(emittedLines[0].line);

    assert.equal(parsed.service, 'test-service');
    assert.equal(parsed.environment, 'test');
    assert.equal(parsed.level, 'INFO');
    assert.equal(parsed.message, 'System initialization complete');
    assert.equal(parsed.correlationId, 'test-correlation-id-12345');
    assert.equal(parsed.requestId, 'req_1234567890abcdef');
    assert.equal(parsed.durationMs, 42.5);
    assert.equal(parsed.routeClass, '/api/test');
    assert.equal(parsed.httpMethod, 'GET');
    assert.equal(parsed.statusCode, 200);
    assert.ok(parsed.timestamp);
  });

  test('2. Logger enforces level hierarchy (DEBUG < INFO < WARN < ERROR < FATAL)', () => {
    const emitted: string[] = [];
    const logger = createLogger({
      service: 'test-service',
      environment: 'production',
      minLevel: 'WARN',
      sink: (line) => emitted.push(line),
    });

    logger.debug({ message: 'Debug message should be dropped' });
    logger.info({ message: 'Info message should be dropped' });
    logger.warn({ message: 'Warning message should be captured' });
    logger.error({ message: 'Error message should be captured' });
    logger.fatal({ message: 'Fatal message should be captured' });

    assert.equal(emitted.length, 3);
    const levels = emitted.map((l) => JSON.parse(l).level);
    assert.deepEqual(levels, ['WARN', 'ERROR', 'FATAL']);
  });

  test('3. Scrubber redacts credentials, secrets, tokens, and PII', () => {
    const rawTokens = [
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisSignature',
      ['sbp', 'mocktoken00000000000000000000'].join('_'),
      ['AIza', 'MockKey0000000000000000000000000000'].join(''),
      ['sk', 'live', 'mocktesttoken0000000000000000'].join('_'),
      'service_role: super_secret_role_key_value',
      'session=secret_session_token_12345',
      'user.email@example.com',
      '+1-555-123-4567',
      '192.168.1.100',
      '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      '21.4225, 39.8262',
    ];

    for (const raw of rawTokens) {
      const scrubbed = sanitizeString(raw);
      assert.doesNotMatch(scrubbed, /eyJhbGciOi/);
      assert.doesNotMatch(scrubbed, /sbp_/);
      assert.doesNotMatch(scrubbed, /AIza/);
      assert.doesNotMatch(scrubbed, new RegExp(['sk', 'live'].join('_')));
      assert.doesNotMatch(scrubbed, /super_secret_role_key_value/);
      assert.doesNotMatch(scrubbed, /secret_session_token_12345/);
      assert.doesNotMatch(scrubbed, /user\.email@example\.com/);
      assert.doesNotMatch(scrubbed, /555-123-4567/);
      assert.doesNotMatch(scrubbed, /192\.168\.1\.100/);
      assert.doesNotMatch(scrubbed, /21\.4225,\s*39\.8262/);
      assert.ok(scrubbed.includes('[REDACTED'));
    }
  });

  test('4. Prohibited Telemetry Filtering — Religious data is ABSOLUTELY excluded from serialized logs', () => {
    const emitted: string[] = [];
    const logger = createLogger({
      service: 'web-api',
      minLevel: 'DEBUG',
      sink: (line) => emitted.push(line),
    });

    // Attempting to log prohibited religious interaction content
    logger.info({
      message: 'quran_search: surah 2 ayah 255 search text "Allahu la ilaha illa Huwa"',
    });

    logger.info({
      message: 'hadith_query: "actions are by intentions" bukhari volume 1',
    });

    logger.info({
      message: 'dua_query: "Rabbana atina fid-dunya hasanatan" morning adhkar',
    });

    logger.info({
      message: 'personal_note: "My private spiritual reflection on surah al-fatiha"',
    });

    logger.info({
      message: 'User preference set to hanafi madhhab with umm_al_qura calculation method',
    });

    assert.equal(emitted.length, 5);

    for (const logLine of emitted) {
      // Must not contain raw sacred search phrases or identifiable preferences
      assert.doesNotMatch(logLine, /"Allahu la ilaha illa Huwa"/);
      assert.doesNotMatch(logLine, /"actions are by intentions"/);
      assert.doesNotMatch(logLine, /"Rabbana atina fid-dunya hasanatan"/);
      assert.doesNotMatch(logLine, /"My private spiritual reflection/);
      assert.doesNotMatch(logLine, /\bhanafi\b/i);
      assert.doesNotMatch(logLine, /\bumm_al_qura\b/i);
      assert.ok(logLine.includes('[REDACTED'));
    }
  });

  test('5. Correlation-ID Contract validation & spoofing protection', () => {
    // Valid standard correlation ID (16 to 64 chars)
    const validId = 'corr_abcdef1234567890_valid';
    assert.equal(validateCorrelationId(validId), validId);
    assert.equal(resolveCorrelationId(validId), validId);

    // Malformed / injection / oversized inputs must be rejected and regenerated
    const invalidInputs = [
      '',
      null,
      undefined,
      'short', // < 16 chars
      'a'.repeat(65), // > 64 chars
      'invalid id with spaces',
      "corr_id'; DROP TABLE users;--",
      '<script>alert(1)</script>',
      'corr_id\nnewline_injection',
    ];

    for (const input of invalidInputs) {
      assert.equal(validateCorrelationId(input), null);
      const resolved = resolveCorrelationId(input);
      assert.notEqual(resolved, input);
      assert.ok(validateCorrelationId(resolved) !== null);
      assert.equal(resolved.length, 36); // standard UUID v4 length
    }
  });

  test('6. Request-ID generation produces unique, valid server identifiers', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();

    assert.ok(id1.startsWith('req_'));
    assert.ok(id2.startsWith('req_'));
    assert.notEqual(id1, id2);
    assert.ok(id1.length >= 20);
  });

  test('7. Liveness probe check returns UP immediately without dependencies', () => {
    const res = checkLiveness();
    assert.equal(res.status, 'UP');
    assert.ok(Date.parse(res.timestamp) > 0);
  });

  test('8. Readiness probe check returns ready: true in offline/in-memory mode', async () => {
    const res = await checkReadiness(null);
    assert.equal(res.ready, true);
    assert.equal(res.checks.database, 'UP');
    assert.ok(Date.parse(res.timestamp) > 0);
  });

  test('9. Readiness probe returns 503 unready on simulated database failure without exposing secrets', async () => {
    const mockFailingClient: any = {
      from: () => ({
        select: () => ({
          limit: async () => ({
            error: new Error('Simulated pool exhaustion with password=SECRET_DB_PASS'),
          }),
        }),
      }),
    };

    const res = await checkReadiness(mockFailingClient);
    assert.equal(res.ready, false);
    assert.equal(res.checks.database, 'DOWN');
    // Ensure raw error message with secrets is not exposed in reason
    assert.doesNotMatch(res.reason || '', /SECRET_DB_PASS/);
  });

  test('10. Deep health check returns status, version, uptime, and latency metrics', async () => {
    const res = await checkDeepHealth(null, '0.1.0', 'abc1234');
    assert.equal(res.status, 'HEALTHY');
    assert.equal(res.version, '0.1.0');
    assert.equal(res.build, 'abc1234');
    assert.ok(typeof res.uptimeSeconds === 'number');
    assert.equal(res.checks.database.status, 'UP');
    assert.equal(res.checks.database.latencyMs, 0);
  });

  test('11. Observability resilience — Logger never throws on serialization error', () => {
    const emitted: string[] = [];
    const logger = createLogger({
      service: 'resilience-test',
      minLevel: 'DEBUG',
      sink: (line) => emitted.push(line),
    });

    // Object with throwing property getter
    const problemInput: any = {
      get message() {
        throw new Error('Exploding message getter');
      },
    };

    // Must not throw
    assert.doesNotThrow(() => {
      logger.error(problemInput);
    });

    assert.equal(emitted.length, 1);
    assert.ok(emitted[0].includes('OBSERVABILITY_FALLBACK'));
  });
});
