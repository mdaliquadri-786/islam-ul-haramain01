/**
 * @file server.ts
 * @description Next.js 15 App Router Server Component & Server Action Supabase instance.
 * Reads and writes session cookies asynchronously via 'next/headers'.
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@islamic/database';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient({
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2]);
        });
      } catch {
        // Calling set() inside a Server Component is not allowed in Next.js.
        // Session refreshing is handled by proxy/middleware or Server Actions.
      }
    },
  });
}
