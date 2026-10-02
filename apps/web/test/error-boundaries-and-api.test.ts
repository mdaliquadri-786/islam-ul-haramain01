/**
 * @file error-boundaries-and-api.test.ts
 * @package @islamic/web
 * @description Comprehensive automated tests for Milestone M8 Phase 3:
 * Web Application Error Boundaries, Not-Found Pages, and API Error Normalization.
 * Tests error UI safety, 404 behavior, status code mapping, correlation header preservation,
 * and zero-leakage privacy guarantees for religious queries and credentials.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Error Boundary & 404 Components
import GlobalError from '../src/app/global-error';
import RootError from '../src/app/error';
import LocalizedErrorBoundary from '../src/app/[locale]/error';
import RootNotFound from '../src/app/not-found';
import LocalizedNotFound from '../src/app/[locale]/not-found';

// API Error Utilities
import {
  handleApiError,
  createApiErrorResponse,
  mapStatusToErrorCode,
} from '../src/lib/api-errors';

describe('Milestone M8 Phase 3 — Error Boundaries & API Error Hardening', () => {
  // ==========================================================================
  // 1. Error Boundary Safety Tests
  // ==========================================================================
  describe('1. Error Boundary Component Rendering & Security', () => {
    it('GlobalError renders standalone HTML/body with serene recovery UI', () => {
      const mockError = new Error('Catastrophic root layout crash with secret_token_123');
      const html = renderToStaticMarkup(
        React.createElement(GlobalError, {
          error: mockError,
          reset: () => {},
        })
      );

      assert.ok(html.includes('<html'));
      assert.ok(html.includes('<body'));
      assert.ok(html.includes('ISLAM UL HARAMAIN'));
      assert.ok(html.includes('Try Again'));

      // Strictly verify sensitive details are absent
      assert.doesNotMatch(html, /secret_token_123/);
      assert.doesNotMatch(html, /Catastrophic root layout crash/);
      assert.doesNotMatch(html, /stack/i);
    });

    it('RootError renders peaceful card and excludes stack traces', () => {
      const mockError = new Error('Database pool exhaustion at /app/src/db.ts:42');
      const html = renderToStaticMarkup(
        React.createElement(RootError, {
          error: mockError,
          reset: () => {},
        })
      );

      assert.ok(html.includes('Page Encountered an Error'));
      assert.ok(html.includes('Return to Portal'));

      // Ensure zero internal paths or database messages leak
      assert.doesNotMatch(html, /Database pool exhaustion/);
      assert.doesNotMatch(html, /\/app\/src\/db\.ts/);
      assert.doesNotMatch(html, /stack/i);
    });

    it('LocalizedErrorBoundary provides dignified fallback without technical errors', () => {
      const mockError = new Error('Internal query failed: SELECT * FROM users');
      const html = renderToStaticMarkup(
        React.createElement(LocalizedErrorBoundary, {
          error: mockError,
          reset: () => {},
        })
      );

      assert.ok(html.includes('Unable to Display Requested Page'));
      assert.ok(html.includes('Try Again'));

      // Ensure SQL and internal errors are absent
      assert.doesNotMatch(html, /SELECT \* FROM users/);
      assert.doesNotMatch(html, /Internal query failed/);
    });
  });

  // ==========================================================================
  // 2. Not-Found (404) Safety Tests
  // ==========================================================================
  describe('2. Not-Found (404) Handling Safety', () => {
    it('RootNotFound renders language selection links without URL parameter reflection', () => {
      const html = renderToStaticMarkup(React.createElement(RootNotFound));

      assert.ok(html.includes('404'));
      assert.ok(html.includes('Page Not Found'));
      assert.ok(html.includes('/en'));
      assert.ok(html.includes('/ar'));
      assert.ok(html.includes('/ur'));

      // Ensure no query string placeholders
      assert.doesNotMatch(html, /query|search|token/i);
    });

    it('LocalizedNotFound renders canonical navigation links', () => {
      const html = renderToStaticMarkup(React.createElement(LocalizedNotFound));

      assert.ok(html.includes('404'));
      assert.ok(html.includes('Page Not Found'));
      assert.ok(html.includes('Holy Quran'));
      assert.ok(html.includes('Hadith'));
    });
  });

  // ==========================================================================
  // 3. Central API Error Normalization Tests
  // ==========================================================================
  describe('3. Central API Error Normalization & Header Preservation', () => {
    it('maps HTTP status codes to machine-readable operational categories', () => {
      assert.equal(mapStatusToErrorCode(400), 'VALIDATION');
      assert.equal(mapStatusToErrorCode(401), 'AUTHENTICATION');
      assert.equal(mapStatusToErrorCode(403), 'AUTHORIZATION');
      assert.equal(mapStatusToErrorCode(408), 'TIMEOUT');
      assert.equal(mapStatusToErrorCode(504), 'TIMEOUT');
      assert.equal(mapStatusToErrorCode(409), 'SYNC');
      assert.equal(mapStatusToErrorCode(429), 'SECURITY');
      assert.equal(mapStatusToErrorCode(502), 'DEPENDENCY');
      assert.equal(mapStatusToErrorCode(503), 'DEPENDENCY');
      assert.equal(mapStatusToErrorCode(500), 'INTERNAL');
    });

    it('createApiErrorResponse generates standardized JSON and preserves trace headers', async () => {
      const correlationId = 'test-corr-1234567890abcdef';
      const requestId = 'req_abcdef1234567890';

      const res = createApiErrorResponse({
        status: 400,
        message: 'Invalid pagination offset',
        code: 'VALIDATION',
        correlationId,
        requestId,
      });

      assert.equal(res.status, 400);
      assert.equal(res.headers.get('x-correlation-id'), correlationId);
      assert.equal(res.headers.get('x-request-id'), requestId);

      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.error, 'Invalid pagination offset');
      assert.equal(body.code, 'VALIDATION');
    });

    it('handleApiError sanitizes database errors to 503 and hides raw Postgres details', async () => {
      const rawPostgresError = new Error(
        'postgres connection refused at 10.0.0.5:5432 with password=SECRET_DB_PASS'
      );
      const res = handleApiError(rawPostgresError, {
        routeClass: '/api/articles',
        correlationId: 'corr-db-error-test-1234',
        requestId: 'req_db_error_5678',
      });

      assert.equal(res.status, 503);
      assert.equal(res.headers.get('x-correlation-id'), 'corr-db-error-test-1234');
      assert.equal(res.headers.get('x-request-id'), 'req_db_error_5678');

      const body = await res.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'DATABASE');
      // Must NOT leak connection string, IP, or password!
      assert.doesNotMatch(body.error, /postgres/i);
      assert.doesNotMatch(body.error, /10\.0\.0\.5/);
      assert.doesNotMatch(body.error, /SECRET_DB_PASS/);
      assert.equal(body.error, 'Service temporarily degraded. Please try again shortly.');
    });

    it('handleApiError categorizes authentication and authorization errors correctly', async () => {
      const authErr = new Error('Authentication Required: Missing JWT token');
      const resAuth = handleApiError(authErr, { routeClass: '/api/admin/users' });
      assert.equal(resAuth.status, 401);
      const bodyAuth = await resAuth.json();
      assert.equal(bodyAuth.code, 'AUTHENTICATION');

      const authzErr = new Error('Authorization Error: User lacks super_admin role');
      const resAuthz = handleApiError(authzErr, { routeClass: '/api/admin/config' });
      assert.equal(resAuthz.status, 403);
      const bodyAuthz = await resAuthz.json();
      assert.equal(bodyAuthz.code, 'AUTHORIZATION');
    });
  });

  // ==========================================================================
  // 4. Privacy Regression Tests
  // ==========================================================================
  describe('4. Privacy Regression — Zero Leakage of Religious & Personal Data', () => {
    it('ensures sensitive tokens, religious searches, and PII cannot leak in public error bodies', async () => {
      const sensitiveInputs = [
        'user.secret@islamulharamain.org',
        '+966-12-345-6789',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0In0.secret',
        'Bearer secret_admin_token',
        '21.4225, 39.8262',
        'surah 2 ayah 255 search text',
        'bukhari 1 intentions',
        'rabbana atina fid dunya',
        'hanafi madhhab preference',
        'umm_al_qura calculation method',
        'my confidential devotional reflection note',
      ];

      for (const sensitive of sensitiveInputs) {
        const error = new Error(`Failure processing payload containing: ${sensitive}`);
        const res = handleApiError(error, {
          routeClass: '/api/sensitive-test',
          correlationId: 'test-corr-safe-12345678',
          requestId: 'req_safe_12345678',
        });

        const body = await res.json();
        const serialized = JSON.stringify(body);

        // Assert sensitive term is absent from public API error response
        assert.doesNotMatch(
          serialized,
          new RegExp(sensitive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        );
      }
    });
  });
});
