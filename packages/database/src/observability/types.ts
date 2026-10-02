/**
 * @file types.ts
 * @package @islamic/database
 * @description Type definitions for structured operational logging and telemetry.
 * Strictly enforces zero PII, zero religious interaction data, and zero arbitrary metadata escape hatches.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

export type LogLevel = 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export type DeploymentEnvironment = 'development' | 'staging' | 'production' | 'test';

export type OperationalErrorCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'VALIDATION'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'DATABASE'
  | 'SYNC'
  | 'CONFIGURATION'
  | 'DEPENDENCY'
  | 'INTERNAL'
  | 'SECURITY'
  | 'RELEASE';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type DatabaseOperation = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'RPC';

export type SyncOutcome = 'SUCCESS' | 'CONFLICT' | 'RATE_LIMITED' | 'OFFLINE' | 'SCHEMA_MISMATCH';

/**
 * Authoritative Structured Log Record Interface.
 * Every field is strictly typed and vetted.
 * Unrestricted escape hatches (e.g. metadata: Record<string, unknown> or context: any)
 * are ARCHITECTURALLY FORBIDDEN to prevent accidental PII or religious data leaks.
 */
export interface StructuredLogRecord {
  /** ISO-8601 UTC timestamp */
  timestamp: string;

  /** Severity level */
  level: LogLevel;

  /** System service identifier (e.g. "web-api", "database", "sync-worker") */
  service: string;

  /** Runtime deployment environment */
  environment: DeploymentEnvironment;

  /** Sanitized message text */
  message: string;

  /** Server-generated request identifier for this single HTTP transaction */
  requestId?: string;

  /** End-to-end distributed trace correlation identifier */
  correlationId?: string;

  /** Categorized machine-readable error category */
  errorCode?: OperationalErrorCategory;

  /** Execution duration in milliseconds */
  durationMs?: number;

  /** Route template pattern (e.g. "/api/prayer-times", "/api/articles/[slug]") */
  routeClass?: string;

  /** HTTP method */
  httpMethod?: HttpMethod;

  /** HTTP response status code */
  statusCode?: number;

  /** Database table target (without data content) */
  targetTable?: string;

  /** Database operation type */
  dbOperation?: DatabaseOperation;

  /** Response size in bytes */
  bytesSent?: number;

  /** Sanitized error name */
  errorName?: string;

  /** Sanitized stack trace (stripped of absolute file paths and PII) */
  errorStack?: string;

  /** Sync engine outbox queue depth */
  queueDepth?: number;

  /** Sync engine batch outcome */
  syncOutcome?: SyncOutcome;
}

/**
 * Input arguments accepted when generating a log entry.
 */
export interface LogEntryInput {
  message: string;
  requestId?: string;
  correlationId?: string;
  errorCode?: OperationalErrorCategory;
  durationMs?: number;
  routeClass?: string;
  httpMethod?: HttpMethod;
  statusCode?: number;
  targetTable?: string;
  dbOperation?: DatabaseOperation;
  bytesSent?: number;
  errorName?: string;
  errorStack?: string;
  queueDepth?: number;
  syncOutcome?: SyncOutcome;
}

/**
 * Output sink for serialized log lines.
 */
export type LogSink = (line: string, level: LogLevel) => void;

/**
 * Configuration options for StructuredLogger.
 */
export interface LoggerOptions {
  service: string;
  environment?: DeploymentEnvironment;
  minLevel?: LogLevel;
  sink?: LogSink;
}
