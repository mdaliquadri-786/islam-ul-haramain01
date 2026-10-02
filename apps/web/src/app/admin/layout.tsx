/**
 * @file layout.tsx
 * @package @islamic/web
 * @description Layout providing noindex, nofollow metadata for root Admin Portal route.
 * Milestone: M4.5 — Centralized Administration & Operational Control System
 */

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPrivatePageMetadata('Admin Portal', 'en');

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
