/**
 * @file observability.ts
 * @package @islamic/web
 * @description Web application observability adapter and request correlation wrapper.
 * Provides request tracing, header injection, and structured route logging.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createLogger,
  resolveCorrelationId,
  generateRequestId,
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  type StructuredLogger,
  type HttpMethod,
} from '@islamic/database';
import { handleApiError } from './api-errors';

let webLogger: StructuredLogger | null = null;

export function getWebLogger(): StructuredLogger {
  if (!webLogger) {
    webLogger = createLogger({
      service: 'web-api',
      minLevel: process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG',
    });
  }
  return webLogger;
}

export interface RequestTraceContext {
  correlationId: string;
  requestId: string;
  logger: StructuredLogger;
}

/**
 * Route handler correlation wrapper.
 * Intercepts incoming requests to validate X-Correlation-ID, inject X-Request-ID,
 * record performance metrics, and append tracing headers to responses.
 */
export async function withRequestCorrelation(
  request: NextRequest,
  handler: (context: RequestTraceContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const t0 = performance.now();
  const rawCorrelation = request.headers.get(CORRELATION_ID_HEADER);
  const correlationId = resolveCorrelationId(rawCorrelation);
  const requestId = generateRequestId();
  const logger = getWebLogger();
  const pathname = request.nextUrl.pathname;
  const method = request.method as HttpMethod;

  const context: RequestTraceContext = {
    correlationId,
    requestId,
    logger,
  };

  try {
    const response = await handler(context);

    // Inject trace headers into response
    response.headers.set(CORRELATION_ID_HEADER, correlationId);
    response.headers.set(REQUEST_ID_HEADER, requestId);

    const durationMs = Math.round((performance.now() - t0) * 100) / 100;

    // Log request completion (DEBUG level to avoid log spam, or WARN for 4xx)
    if (response.status >= 400 && response.status < 500) {
      logger.warn({
        message: `HTTP ${response.status} on ${pathname}`,
        correlationId,
        requestId,
        routeClass: pathname,
        httpMethod: method,
        statusCode: response.status,
        durationMs,
      });
    } else {
      logger.debug({
        message: `HTTP ${response.status} on ${pathname}`,
        correlationId,
        requestId,
        routeClass: pathname,
        httpMethod: method,
        statusCode: response.status,
        durationMs,
      });
    }

    return response;
  } catch (error: unknown) {
    return handleApiError(error, {
      routeClass: pathname,
      httpMethod: method,
      correlationId,
      requestId,
    });
  }
}
