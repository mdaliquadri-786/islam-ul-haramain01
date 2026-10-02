/**
 * @file api-errors.ts
 * @package @islamic/web
 * @description Centralized, privacy-safe API error normalization utility.
 * Guarantees that internal database errors, SQL queries, stack traces, credentials,
 * and religious queries NEVER leak through public HTTP error responses.
 * Milestone: M8 Phase 3 — Web Application Error Boundaries & API Error Hardening
 */

import { NextResponse } from 'next/server';
import {
  type OperationalErrorCategory,
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from '@islamic/database';
import { getWebLogger } from './observability';

/**
 * Public standardized API error payload.
 */
export interface StandardApiErrorPayload {
  success: false;
  error: string;
  code?: OperationalErrorCategory;
}

/**
 * Maps standard HTTP status codes to machine-readable operational categories.
 */
export function mapStatusToErrorCode(status: number): OperationalErrorCategory {
  switch (status) {
    case 400:
      return 'VALIDATION';
    case 401:
      return 'AUTHENTICATION';
    case 403:
      return 'AUTHORIZATION';
    case 408:
    case 504:
      return 'TIMEOUT';
    case 409:
      return 'SYNC';
    case 429:
      return 'SECURITY';
    case 502:
    case 503:
      return 'DEPENDENCY';
    default:
      return 'INTERNAL';
  }
}

/**
 * Creates a safe, sanitized NextResponse for an error.
 * Preserves X-Correlation-ID and X-Request-ID headers.
 */
export function createApiErrorResponse(options: {
  status: number;
  message: string;
  code?: OperationalErrorCategory;
  correlationId?: string;
  requestId?: string;
}): NextResponse {
  const { status, message, correlationId, requestId } = options;
  const code = options.code || mapStatusToErrorCode(status);

  const payload: StandardApiErrorPayload = {
    success: false,
    error: message,
    code,
  };

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });

  if (correlationId) {
    headers.set(CORRELATION_ID_HEADER, correlationId);
  }
  if (requestId) {
    headers.set(REQUEST_ID_HEADER, requestId);
  }

  return NextResponse.json(payload, { status, headers });
}

/**
 * Normalizes an unknown exception into a safe public API response.
 * Logs internal diagnostics via the structured logger with correlation IDs,
 * while returning only a sanitized, harmless message to the client.
 */
export function handleApiError(
  error: unknown,
  context: {
    routeClass: string;
    httpMethod?: string;
    correlationId?: string;
    requestId?: string;
  }
): NextResponse {
  const logger = getWebLogger();
  const rawMessage = error instanceof Error ? error.message : String(error);
  const rawName = error instanceof Error ? error.name : 'UnknownError';
  const rawStack = error instanceof Error ? error.stack : undefined;

  let status = 500;
  let code: OperationalErrorCategory = 'INTERNAL';
  let publicMessage = 'An unexpected internal error occurred. Please try again later.';

  // Categorize known error classes
  if (
    rawMessage.includes('Authentication Required') ||
    rawMessage.includes('Missing credentials') ||
    rawMessage.includes('JWT') ||
    rawMessage.includes('token expired')
  ) {
    status = 401;
    code = 'AUTHENTICATION';
    publicMessage = 'Authentication required. Please sign in to continue.';
  } else if (
    rawMessage.includes('Authorization Error') ||
    rawMessage.includes('Forbidden') ||
    rawMessage.includes('permission denied') ||
    rawMessage.includes('insufficient privileges')
  ) {
    status = 403;
    code = 'AUTHORIZATION';
    publicMessage = 'Access denied. You do not have permission to perform this action.';
  } else if (
    rawMessage.includes('Validation') ||
    rawMessage.includes('Invalid input') ||
    rawMessage.includes('out-of-bounds')
  ) {
    status = 400;
    code = 'VALIDATION';
    publicMessage = 'Invalid request parameters provided.';
  } else if (
    rawMessage.includes('timed out') ||
    rawMessage.includes('timeout') ||
    rawMessage.includes('ETIMEDOUT')
  ) {
    status = 504;
    code = 'TIMEOUT';
    publicMessage = 'The request timed out. Please try again.';
  } else if (
    rawMessage.includes('database') ||
    rawMessage.includes('postgres') ||
    rawMessage.includes('connection refused') ||
    rawMessage.includes('pool exhaustion')
  ) {
    status = 503;
    code = 'DATABASE';
    publicMessage = 'Service temporarily degraded. Please try again shortly.';
  }

  // Log internal diagnostic event (with sanitized messages and correlation)
  logger.error({
    message: `API Route Error on ${context.routeClass}: ${rawMessage}`,
    correlationId: context.correlationId,
    requestId: context.requestId,
    errorCode: code,
    errorName: rawName,
    errorStack: rawStack,
    routeClass: context.routeClass,
    statusCode: status,
  });

  return createApiErrorResponse({
    status,
    message: publicMessage,
    code,
    correlationId: context.correlationId,
    requestId: context.requestId,
  });
}
