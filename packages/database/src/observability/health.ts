/**
 * @file health.ts
 * @package @islamic/database
 * @description Operational health, liveness, and readiness probe logic.
 * Strictly avoids exposing database credentials, secrets, internal paths, or SQL details.
 * Milestone: M8 Phase 2 — Structured Logging & Standardized Health Probes
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export interface LivenessResult {
  status: 'UP';
  timestamp: string;
}

export interface ReadinessResult {
  ready: boolean;
  timestamp: string;
  checks: {
    database: 'UP' | 'DOWN' | 'UNCONFIGURED';
  };
  reason?: string;
}

export interface DeepHealthResult {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  version: string;
  build: string;
  uptimeSeconds: number;
  timestamp: string;
  checks: {
    database: {
      status: 'UP' | 'DOWN' | 'UNCONFIGURED';
      latencyMs: number;
    };
  };
  reason?: string;
}

/**
 * Performs process liveness check.
 * Strictly in-memory: 0 database queries, 0 external requests, 0 secrets.
 */
export function checkLiveness(): LivenessResult {
  return {
    status: 'UP',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Performs shallow database readiness check.
 * Executes shallow query to verify client responsiveness without querying sensitive tables.
 */
export async function checkReadiness(client?: SupabaseClient | null): Promise<ReadinessResult> {
  const timestamp = new Date().toISOString();

  if (!client) {
    // If running in in-memory / testing mode without live DB
    return {
      ready: true,
      timestamp,
      checks: {
        database: 'UP',
      },
    };
  }

  try {
    // Shallowest possible query: count check with limit 0 on public audit_logs
    const { error } = await client
      .from('audit_logs')
      .select('id', { head: true, count: 'exact' })
      .limit(0);

    if (error) {
      return {
        ready: false,
        timestamp,
        checks: {
          database: 'DOWN',
        },
        reason: 'Database query failed or timed out',
      };
    }

    return {
      ready: true,
      timestamp,
      checks: {
        database: 'UP',
      },
    };
  } catch {
    return {
      ready: false,
      timestamp,
      checks: {
        database: 'DOWN',
      },
      reason: 'Database connection refused',
    };
  }
}

/**
 * Performs deep health check measuring component responsiveness and uptime.
 */
export async function checkDeepHealth(
  client?: SupabaseClient | null,
  version = '0.1.0',
  build = 'production'
): Promise<DeepHealthResult> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = typeof process !== 'undefined' ? Math.round(process.uptime()) : 0;

  if (!client) {
    return {
      status: 'HEALTHY',
      version,
      build,
      uptimeSeconds,
      timestamp,
      checks: {
        database: {
          status: 'UP',
          latencyMs: 0,
        },
      },
    };
  }

  try {
    const t0 = performance.now();
    const { error } = await client
      .from('audit_logs')
      .select('id', { head: true, count: 'exact' })
      .limit(0);

    const latencyMs = Math.round((performance.now() - t0) * 100) / 100;

    if (error) {
      return {
        status: 'UNHEALTHY',
        version,
        build,
        uptimeSeconds,
        timestamp,
        checks: {
          database: {
            status: 'DOWN',
            latencyMs,
          },
        },
        reason: 'Database check failed',
      };
    }

    return {
      status: 'HEALTHY',
      version,
      build,
      uptimeSeconds,
      timestamp,
      checks: {
        database: {
          status: 'UP',
          latencyMs,
        },
      },
    };
  } catch {
    return {
      status: 'UNHEALTHY',
      version,
      build,
      uptimeSeconds,
      timestamp,
      checks: {
        database: {
          status: 'DOWN',
          latencyMs: 0,
        },
      },
      reason: 'Database connection error',
    };
  }
}
