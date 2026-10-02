/**
 * @file logger.ts
 * @package @islamic/database
 * @description Lightweight, vendor-neutral structured logger emitting single-line NDJSON.
 * Strictly enforces zero PII, zero religious surveillance, and resilience against failures.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

import type {
  LogLevel,
  DeploymentEnvironment,
  LogEntryInput,
  StructuredLogRecord,
  LoggerOptions,
  LogSink,
} from './types';
import { sanitizeString } from './scrubber';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
};

/**
 * Default sink writing NDJSON to stdout/stderr.
 */
const defaultSink: LogSink = (line: string, level: LogLevel) => {
  try {
    const formatted = line.endsWith('\n') ? line : `${line}\n`;
    if (level === 'ERROR' || level === 'FATAL') {
      if (typeof process !== 'undefined' && process.stderr?.write) {
        process.stderr.write(formatted);
      } else {
        // Fallback for non-Node environments
        console.error(line);
      }
    } else {
      if (typeof process !== 'undefined' && process.stdout?.write) {
        process.stdout.write(formatted);
      } else {
        console.log(line);
      }
    }
  } catch {
    // Observability must NEVER crash the calling application
  }
};

export class StructuredLogger {
  private service: string;
  private environment: DeploymentEnvironment;
  private minLevel: LogLevel;
  private sink: LogSink;

  constructor(options: LoggerOptions) {
    this.service = options.service;
    this.environment = options.environment || this.detectEnvironment();
    this.minLevel = options.minLevel || (this.environment === 'production' ? 'WARN' : 'INFO');
    this.sink = options.sink || defaultSink;
  }

  private detectEnvironment(): DeploymentEnvironment {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.NODE_ENV;
    if (env === 'production') return 'production';
    if (env === 'staging') return 'staging';
    if (env === 'test') return 'test';
    return 'development';
  }

  public shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public log(level: LogLevel, input: LogEntryInput): void {
    if (!this.shouldLog(level)) {
      return;
    }

    try {
      const record: StructuredLogRecord = {
        timestamp: new Date().toISOString(),
        level,
        service: this.service,
        environment: this.environment,
        message: sanitizeString(input.message),
      };

      if (input.requestId) record.requestId = sanitizeString(input.requestId);
      if (input.correlationId) record.correlationId = sanitizeString(input.correlationId);
      if (input.errorCode) record.errorCode = input.errorCode;
      if (typeof input.durationMs === 'number') record.durationMs = input.durationMs;
      if (input.routeClass) record.routeClass = sanitizeString(input.routeClass);
      if (input.httpMethod) record.httpMethod = input.httpMethod;
      if (typeof input.statusCode === 'number') record.statusCode = input.statusCode;
      if (input.targetTable) record.targetTable = sanitizeString(input.targetTable);
      if (input.dbOperation) record.dbOperation = input.dbOperation;
      if (typeof input.bytesSent === 'number') record.bytesSent = input.bytesSent;
      if (input.errorName) record.errorName = sanitizeString(input.errorName);
      if (input.errorStack) record.errorStack = sanitizeString(input.errorStack);
      if (typeof input.queueDepth === 'number') record.queueDepth = input.queueDepth;
      if (input.syncOutcome) record.syncOutcome = input.syncOutcome;

      const serialized = JSON.stringify(record);
      this.sink(serialized, level);
    } catch {
      // Safe fallback if JSON serialization or sink encounters an error
      try {
        const fallback = JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'ERROR',
          service: this.service,
          environment: this.environment,
          message: '[OBSERVABILITY_FALLBACK] Failed to serialize log record safely',
        });
        this.sink(fallback, 'ERROR');
      } catch {
        // Complete isolation: do not throw
      }
    }
  }

  public debug(input: LogEntryInput): void {
    this.log('DEBUG', input);
  }

  public info(input: LogEntryInput): void {
    this.log('INFO', input);
  }

  public warn(input: LogEntryInput): void {
    this.log('WARN', input);
  }

  public error(input: LogEntryInput): void {
    this.log('ERROR', input);
  }

  public fatal(input: LogEntryInput): void {
    this.log('FATAL', input);
  }
}

let globalLogger: StructuredLogger | null = null;

/**
 * Creates a new instance of StructuredLogger.
 */
export function createLogger(options: LoggerOptions): StructuredLogger {
  return new StructuredLogger(options);
}

/**
 * Returns the default singleton StructuredLogger.
 */
export function getLogger(options?: Partial<LoggerOptions>): StructuredLogger {
  if (!globalLogger || options) {
    globalLogger = new StructuredLogger({
      service: options?.service || 'web-api',
      environment: options?.environment,
      minLevel: options?.minLevel,
      sink: options?.sink,
    });
  }
  return globalLogger;
}
