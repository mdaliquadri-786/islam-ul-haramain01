/**
 * @file health-endpoints.test.ts
 * @package @islamic/web
 * @description Comprehensive automated test suite for M8 Phase 2 Health Endpoints
 * and Request Correlation Middleware wrapper.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';

// Health Route Handlers
import { GET as getLiveness } from '../src/app/api/health/liveness/route';
import { GET as getReadiness } from '../src/app/api/health/readiness/route';
import { GET as getDeepHealth } from '../src/app/api/health/route';

describe('Milestone M8 Phase 2 — Web Health Endpoints & Tracing Tests', () => {
  function createMockRequest(
    path: string,
    headers?: Record<string, string>
  ): NextRequest {
    return new NextRequest(new URL(path, 'http://localhost:3000'), {
      method: 'GET',
      headers: headers || {},
    });
  }

  // ==========================================================================
  // 1. Liveness Probe (/api/health/liveness)
  // ==========================================================================
  describe('1. Liveness Probe Endpoint (/api/health/liveness)', () => {
    it('returns HTTP 200 with status UP immediately', async () => {
      const req = createMockRequest('/api/health/liveness');
      const res = await getLiveness(req);

      assert.equal(res.status, 200);
      assert.ok(res.headers.get('x-correlation-id'));
      assert.ok(res.headers.get('x-request-id'));

      const data = await res.json();
      assert.equal(data.status, 'UP');
      assert.ok(data.timestamp);

      // Verify zero sensitive leakages
      const rawJson = JSON.stringify(data);
      assert.doesNotMatch(rawJson, /password|secret|key|token|connection/i);
    });
  });

  // ==========================================================================
  // 2. Readiness Probe (/api/health/readiness)
  // ==========================================================================
  describe('2. Readiness Probe Endpoint (/api/health/readiness)', () => {
    it('returns HTTP 200 with status READY when database is operational', async () => {
      const req = createMockRequest('/api/health/readiness');
      const res = await getReadiness(req);

      assert.equal(res.status, 200);
      assert.ok(res.headers.get('x-correlation-id'));
      assert.ok(res.headers.get('x-request-id'));

      const data = await res.json();
      assert.equal(data.status, 'READY');
      assert.equal(data.checks?.database, 'UP');
      assert.ok(data.timestamp);

      // Verify zero sensitive leakages
      const rawJson = JSON.stringify(data);
      assert.doesNotMatch(rawJson, /password|secret|key|token|supabase_url/i);
    });
  });

  // ==========================================================================
  // 3. Deep Health Endpoint (/api/health)
  // ==========================================================================
  describe('3. Deep System Health Endpoint (/api/health)', () => {
    it('returns HTTP 200 with system metrics and zero credential leaks', async () => {
      const req = createMockRequest('/api/health');
      const res = await getDeepHealth(req);

      assert.equal(res.status, 200);
      assert.ok(res.headers.get('x-correlation-id'));
      assert.ok(res.headers.get('x-request-id'));

      const data = await res.json();
      assert.equal(data.status, 'HEALTHY');
      assert.ok(data.version);
      assert.ok(data.build);
      assert.ok(typeof data.uptimeSeconds === 'number');
      assert.equal(data.checks?.database?.status, 'UP');
      assert.ok(typeof data.checks?.database?.latencyMs === 'number');

      // Verify zero sensitive leakages
      const rawJson = JSON.stringify(data);
      assert.doesNotMatch(rawJson, /password|secret|key|token|postgres/i);
    });
  });

  // ==========================================================================
  // 4. Request Correlation & Tracing
  // ==========================================================================
  describe('4. Request Correlation & Header Propagation', () => {
    it('preserves valid client-supplied X-Correlation-ID', async () => {
      const validCorrelationId = 'client-session-1234567890abcdef';
      const req = createMockRequest('/api/health/liveness', {
        'x-correlation-id': validCorrelationId,
      });

      const res = await getLiveness(req);
      assert.equal(res.headers.get('x-correlation-id'), validCorrelationId);
      assert.ok(res.headers.get('x-request-id'));
    });

    it('replaces invalid or malicious X-Correlation-ID with safe fresh UUID', async () => {
      const maliciousId = "invalid'; DROP TABLE users;--";
      const req = createMockRequest('/api/health/liveness', {
        'x-correlation-id': maliciousId,
      });

      const res = await getLiveness(req);
      const returnedId = res.headers.get('x-correlation-id');

      assert.notEqual(returnedId, maliciousId);
      assert.ok(returnedId);
      assert.equal(returnedId.length, 36); // UUID v4 format
    });
  });
});
