/**
 * @file page.tsx
 * @package @islamic/web
 * @description Unlocalized Book Overview redirect/page.
 * Milestone: M4.3 — Digital Islamic Books e-Reader
 */

import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ bookSlug: string }>;
}

export default async function BookSlugRootPage({ params }: PageProps) {
  const { bookSlug } = await params;
  redirect(`/en/books/${bookSlug}`);
}
