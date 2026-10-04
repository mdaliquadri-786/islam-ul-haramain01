/**
 * @file production-env.ts
 * @package @islamic/database
 * @description Production Environment Variable Validator.
 *              Validates critical production secrets, Supabase endpoints, and Vercel
 *              deployment settings at runtime and build-time. Throws a fatal, descriptive
 *              error if any required configuration is missing or malformed.
 */

export interface ProductionEnv {
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ADMIN_SECRET_TOKEN: string;
  VERCEL_URL: string;
  NODE_ENV?: string;
  SUPABASE_ANON_KEY?: string;
}

export interface ValidationErrorDetail {
  variable: string;
  issue: string;
  receivedValue?: string;
}

export class FatalConfigurationError extends Error {
  public readonly missingVariables: ValidationErrorDetail[];

  constructor(errors: ValidationErrorDetail[]) {
    const formatted = errors
      .map((e) => `  ✖ [${e.variable}]: ${e.issue}`)
      .join('\n');

    super(
      `\n============================================================\n` +
      `FATAL PRODUCTION CONFIGURATION ERROR\n` +
      `The ISLAM UL HARAMAIN platform cannot start with invalid environment configuration:\n` +
      `------------------------------------------------------------\n` +
      `${formatted}\n` +
      `============================================================\n`
    );

    this.name = 'FatalConfigurationError';
    this.missingVariables = errors;
  }
}

/**
 * Validates a URL string for structural correctness.
 */
function isValidUrl(val: string): boolean {
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Schema definition for production environment variables.
 */
export const productionEnvSchema = {
  safeParse(env: Record<string, string | undefined>): {
    success: boolean;
    data?: ProductionEnv;
    errors?: ValidationErrorDetail[];
  } {
    const errors: ValidationErrorDetail[] = [];

    // 1. NEXT_PUBLIC_SUPABASE_URL
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (!supabaseUrl) {
      errors.push({
        variable: 'NEXT_PUBLIC_SUPABASE_URL',
        issue: 'Required environment variable is missing or empty.',
      });
    } else if (!isValidUrl(supabaseUrl)) {
      errors.push({
        variable: 'NEXT_PUBLIC_SUPABASE_URL',
        issue: 'Must be a valid HTTP/HTTPS URL (e.g. https://xyz.supabase.co).',
        receivedValue: supabaseUrl,
      });
    }

    // 2. SUPABASE_SERVICE_ROLE_KEY
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!serviceRoleKey) {
      errors.push({
        variable: 'SUPABASE_SERVICE_ROLE_KEY',
        issue: 'Required server-side service role key is missing or empty.',
      });
    } else if (serviceRoleKey.length < 20) {
      errors.push({
        variable: 'SUPABASE_SERVICE_ROLE_KEY',
        issue: 'Service role key appears invalid (less than 20 characters).',
      });
    }

    // 3. ADMIN_SECRET_TOKEN
    const adminSecret = (env.ADMIN_SECRET_TOKEN || env.ADMIN_API_SECRET)?.trim();
    if (!adminSecret) {
      errors.push({
        variable: 'ADMIN_SECRET_TOKEN',
        issue: 'Required administrative authorization token is missing or empty.',
      });
    } else if (adminSecret.length < 16) {
      errors.push({
        variable: 'ADMIN_SECRET_TOKEN',
        issue: 'Admin secret token must be at least 16 characters for cryptographic entropy.',
      });
    }

    // 4. VERCEL_URL
    const vercelUrl = (env.VERCEL_URL || env.NEXT_PUBLIC_SITE_URL || env.SITE_URL)?.trim();
    if (!vercelUrl) {
      errors.push({
        variable: 'VERCEL_URL',
        issue: 'Deployment host URL (VERCEL_URL or SITE_URL) is missing or empty.',
      });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl!,
        SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey!,
        ADMIN_SECRET_TOKEN: adminSecret!,
        VERCEL_URL: vercelUrl!,
        NODE_ENV: env.NODE_ENV,
        SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    };
  },

  parse(env: Record<string, string | undefined>): ProductionEnv {
    const result = this.safeParse(env);
    if (!result.success && result.errors) {
      throw new FatalConfigurationError(result.errors);
    }
    return result.data!;
  },
};

/**
 * Validates the current runtime process environment.
 * Throws FatalConfigurationError if any critical variable is missing.
 */
export function validateProductionEnv(
  sourceEnv: Record<string, string | undefined> = process.env
): ProductionEnv {
  return productionEnvSchema.parse(sourceEnv);
}
