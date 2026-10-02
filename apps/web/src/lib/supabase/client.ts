/**
 * @file client.ts
 * @description Next.js client-side Supabase instance.
 * For use in Client Components ('use client').
 */

import { createBrowserClient } from '@islamic/database';

export function getSupabaseBrowserClient() {
  return createBrowserClient();
}
