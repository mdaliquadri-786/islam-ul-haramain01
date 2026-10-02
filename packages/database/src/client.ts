/**
 * @file client.ts
 * @package @islamic/database
 * @description Configured Supabase client factories using @supabase/ssr for Next.js App Router.
 * Strictly enforces zero committed secrets and separation of public vs service credentials.
 */

import {
  createBrowserClient as createSupabaseBrowserClient,
  createServerClient as createSupabaseServerClient,
  type CookieMethodsServer,
} from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseClientConfig } from './types';

export interface CookieItem {
  name: string;
  value: string;
  [key: string]: unknown;
}

export interface CookieStoreAdapter {
  getAll(): CookieItem[] | Promise<CookieItem[]>;
  setAll?(cookies: CookieItem[]): void | Promise<void>;
}

/**
 * Resolves public Supabase credentials from runtime environment variables.
 * Compatible with Node.js, browser, and edge runtime environments.
 */
export function resolveSupabaseConfig(explicitConfig?: Partial<DatabaseClientConfig>): DatabaseClientConfig {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

  const supabaseUrl =
    explicitConfig?.supabaseUrl ||
    env?.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    explicitConfig?.supabaseAnonKey ||
    env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[@islamic/database] Missing Supabase configuration. ' +
        'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are set.'
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}

/**
 * Creates a browser-side Supabase client using @supabase/ssr.
 * Automatically synchronizes authentication session state with browser cookies.
 */
export function createBrowserClient(config?: Partial<DatabaseClientConfig>): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig(config);
  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a server-side Supabase client using @supabase/ssr for Next.js 15 App Router.
 * Uses the provided cookie adapter to read/write auth tokens from request/response cookies.
 *
 * @param cookieStore Cookie adapter interface (compatible with Next.js 15 cookies())
 * @param config Optional explicit database client configuration
 */
export function createServerClient(
  cookieStore: CookieStoreAdapter,
  config?: Partial<DatabaseClientConfig>
): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = resolveSupabaseConfig(config);

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      if (cookieStore.setAll) {
        try {
          cookieStore.setAll(cookiesToSet);
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      }
    },
  };

  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });
}
