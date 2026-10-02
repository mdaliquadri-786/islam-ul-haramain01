-- Migration: 20260924000002_user_library_bookmarks.sql
-- Description: Private User Library & Bookmarks schema with strict user isolation,
--              duplicate prevention, ownership immutability, and article publication safety.
-- Milestone: M3.3 — User Library & Bookmarks (Mobile-Ready)

-- ============================================================================
-- 1. Bookmarks Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(30) NOT NULL
        CHECK (content_type IN ('quran', 'hadith', 'dua', 'article')),
    content_reference VARCHAR(150) NOT NULL,
    -- Optional typed reference fields for high-performance indexing & filtering
    surah_number INT CHECK (surah_number IS NULL OR (surah_number >= 1 AND surah_number <= 114)),
    ayah_number INT CHECK (ayah_number IS NULL OR (ayah_number >= 1 AND ayah_number <= 286)),
    hadith_collection VARCHAR(50),
    hadith_number INT CHECK (hadith_number IS NULL OR hadith_number >= 1),
    dua_category VARCHAR(100),
    article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
    -- User-managed personalization fields
    folder_name VARCHAR(100) NOT NULL DEFAULT 'default',
    note TEXT,
    tags TEXT[] NOT NULL DEFAULT '{}'::text[],
    -- Mobile-aware synchronization support (Phase 5 Drift SQLite sync)
    client_mutation_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================================================
-- 2. Indexes & Performance Optimization
-- ============================================================================

-- Fast lookup of all active bookmarks for a user, sorted by creation
CREATE INDEX idx_bookmarks_user_active
ON public.bookmarks (user_id, created_at DESC)
WHERE deleted_at IS NULL;

-- Fast filtering by content type within a user's library
CREATE INDEX idx_bookmarks_user_type
ON public.bookmarks (user_id, content_type, created_at DESC)
WHERE deleted_at IS NULL;

-- Fast lookup for checking saved status of a specific item
CREATE INDEX idx_bookmarks_user_item
ON public.bookmarks (user_id, content_type, content_reference)
WHERE deleted_at IS NULL;

-- Direct foreign key index for article deletions/updates
CREATE INDEX idx_bookmarks_article_id
ON public.bookmarks (article_id)
WHERE article_id IS NOT NULL;

-- ============================================================================
-- 3. Duplicate Prevention Constraint
-- ============================================================================

-- Prevents a user from saving the exact same canonical content item multiple times
CREATE UNIQUE INDEX uq_bookmarks_user_content_active
ON public.bookmarks (user_id, content_type, content_reference)
WHERE deleted_at IS NULL;

-- ============================================================================
-- 4. Ownership Immutability & Updated_At Triggers
-- ============================================================================

-- Ensure updated_at timestamp is maintained
CREATE TRIGGER trg_bookmarks_updated_at
BEFORE UPDATE ON public.bookmarks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Forbid changing the owner (user_id) of a bookmark
CREATE OR REPLACE FUNCTION public.prevent_bookmark_ownership_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Ownership Immutability Violation: Changing the owner (user_id) of a bookmark is strictly prohibited.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_prevent_bookmark_ownership_mutation
BEFORE UPDATE ON public.bookmarks
FOR EACH ROW EXECUTE FUNCTION public.prevent_bookmark_ownership_mutation();

-- ============================================================================
-- 5. Row Level Security (RLS) Configuration
-- ============================================================================

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 5.1 Users can only view their own active bookmarks
CREATE POLICY "Users can view own bookmarks"
ON public.bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- 5.2 Users can only insert bookmarks for themselves
CREATE POLICY "Users can insert own bookmarks"
ON public.bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5.3 Users can only update their own bookmarks
CREATE POLICY "Users can update own bookmarks"
ON public.bookmarks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND deleted_at IS NULL)
WITH CHECK (auth.uid() = user_id);

-- 5.4 Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
ON public.bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Explicit Note: NO public/anonymous policy exists. Unauthenticated access is default-denied.
