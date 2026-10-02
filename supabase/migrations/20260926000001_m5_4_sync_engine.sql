-- Migration: 20260926000001_m5_4_sync_engine.sql
-- Description: Cross-Platform Synchronization Engine Foundation.
--              Establishes client mutation idempotency ledger, deterministic entity versioning
--              (client_version & server_revision), soft-delete tombstone lifecycle, high-performance
--              keyset cursor indexes, and tombstone-aware RLS policies.
-- Milestone: M5.4 — Cross-Platform Sync Engine (Database Foundation)

-- ============================================================================
-- 1. Client Mutation Idempotency Ledger
-- ============================================================================
-- Enforces true uniqueness for client_mutation_id and provides atomic deduplication
-- for offline retries and network replay defense.

CREATE TABLE IF NOT EXISTS public.client_mutations (
    client_mutation_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('bookmark', 'reading_progress', 'prayer_settings')),
    entity_id VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_status INT NOT NULL DEFAULT 200,
    response_body JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Fast lookup for user-scoped mutation history and scheduled ledger pruning
CREATE INDEX IF NOT EXISTS idx_client_mutations_user_prune 
ON public.client_mutations (user_id, applied_at DESC);

-- Row Level Security (RLS) for Idempotency Ledger
ALTER TABLE public.client_mutations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mutation log"
ON public.client_mutations FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mutation log"
ON public.client_mutations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Explicit Note: UPDATE and DELETE are prohibited for clients. Ledger entries are append-only.

-- ============================================================================
-- 2. Add Nullable Versioning & Tracking Columns
-- ============================================================================

-- 2.1 Bookmarks Table Enhancements
ALTER TABLE public.bookmarks
    ADD COLUMN IF NOT EXISTS client_version BIGINT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS server_revision BIGINT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS last_client_mutation_id UUID;

-- 2.2 User Reading Progress Table Enhancements
ALTER TABLE public.user_reading_progress
    ADD COLUMN IF NOT EXISTS client_version BIGINT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS server_revision BIGINT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS last_client_mutation_id UUID,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2.3 User Prayer Settings Table Enhancements
ALTER TABLE public.user_prayer_settings
    ADD COLUMN IF NOT EXISTS client_version BIGINT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS server_revision BIGINT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS client_mutation_id UUID,
    ADD COLUMN IF NOT EXISTS last_client_mutation_id UUID;

-- ============================================================================
-- 3. Safe Existing-Row Backfill
-- ============================================================================
-- Assigns deterministic initial values to existing rows before enforcing NOT NULL constraints.

-- 3.1 Backfill Bookmarks
UPDATE public.bookmarks
SET 
    client_version = 1,
    server_revision = 1,
    last_client_mutation_id = COALESCE(client_mutation_id, gen_random_uuid())
WHERE client_version IS NULL OR server_revision IS NULL OR last_client_mutation_id IS NULL;

-- 3.2 Backfill User Reading Progress
UPDATE public.user_reading_progress
SET 
    client_version = 1,
    server_revision = 1,
    last_client_mutation_id = COALESCE(client_mutation_id, gen_random_uuid())
WHERE client_version IS NULL OR server_revision IS NULL OR last_client_mutation_id IS NULL;

-- 3.3 Backfill User Prayer Settings
UPDATE public.user_prayer_settings
SET 
    client_version = 1,
    server_revision = 1,
    client_mutation_id = COALESCE(client_mutation_id, gen_random_uuid()),
    last_client_mutation_id = COALESCE(last_client_mutation_id, client_mutation_id, gen_random_uuid())
WHERE client_version IS NULL OR server_revision IS NULL OR last_client_mutation_id IS NULL;

-- ============================================================================
-- 4. Enforce NOT NULL Constraints and Defaults
-- ============================================================================

-- 4.1 Enforce on Bookmarks
ALTER TABLE public.bookmarks
    ALTER COLUMN client_version SET NOT NULL,
    ALTER COLUMN server_revision SET NOT NULL,
    ALTER COLUMN last_client_mutation_id SET NOT NULL,
    ALTER COLUMN client_version SET DEFAULT 1,
    ALTER COLUMN server_revision SET DEFAULT 1,
    ALTER COLUMN last_client_mutation_id SET DEFAULT gen_random_uuid();

-- 4.2 Enforce on User Reading Progress
ALTER TABLE public.user_reading_progress
    ALTER COLUMN client_version SET NOT NULL,
    ALTER COLUMN server_revision SET NOT NULL,
    ALTER COLUMN last_client_mutation_id SET NOT NULL,
    ALTER COLUMN client_version SET DEFAULT 1,
    ALTER COLUMN server_revision SET DEFAULT 1,
    ALTER COLUMN last_client_mutation_id SET DEFAULT gen_random_uuid();

-- 4.3 Enforce on User Prayer Settings
ALTER TABLE public.user_prayer_settings
    ALTER COLUMN client_version SET NOT NULL,
    ALTER COLUMN server_revision SET NOT NULL,
    ALTER COLUMN last_client_mutation_id SET NOT NULL,
    ALTER COLUMN client_version SET DEFAULT 1,
    ALTER COLUMN server_revision SET DEFAULT 1,
    ALTER COLUMN last_client_mutation_id SET DEFAULT gen_random_uuid();

-- ============================================================================
-- 5. High-Performance Keyset Pagination Indexes
-- ============================================================================
-- Powers deterministic composite keyset cursor pagination:
-- WHERE user_id = :uid AND ((updated_at > :t) OR (updated_at = :t AND id > :id))
-- ORDER BY updated_at ASC, id ASC LIMIT 50

CREATE INDEX IF NOT EXISTS idx_bookmarks_sync_keyset
ON public.bookmarks (user_id, updated_at ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_reading_progress_sync_keyset
ON public.user_reading_progress (user_id, updated_at ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_user_prayer_settings_sync
ON public.user_prayer_settings (user_id, updated_at ASC);

-- ============================================================================
-- 6. Server Revision Monotonic Increment Trigger
-- ============================================================================
-- Strictly increments server_revision on every committed UPDATE across syncable tables.
-- Guarantees server-authoritative revision ordering immune to client tampering.

CREATE OR REPLACE FUNCTION public.increment_server_revision()
RETURNS TRIGGER AS $$
BEGIN
    NEW.server_revision = COALESCE(OLD.server_revision, 0) + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_bookmarks_server_revision ON public.bookmarks;
CREATE TRIGGER trg_bookmarks_server_revision
BEFORE UPDATE ON public.bookmarks
FOR EACH ROW EXECUTE FUNCTION public.increment_server_revision();

DROP TRIGGER IF EXISTS trg_user_reading_progress_server_revision ON public.user_reading_progress;
CREATE TRIGGER trg_user_reading_progress_server_revision
BEFORE UPDATE ON public.user_reading_progress
FOR EACH ROW EXECUTE FUNCTION public.increment_server_revision();

DROP TRIGGER IF EXISTS trg_user_prayer_settings_server_revision ON public.user_prayer_settings;
CREATE TRIGGER trg_user_prayer_settings_server_revision
BEFORE UPDATE ON public.user_prayer_settings
FOR EACH ROW EXECUTE FUNCTION public.increment_server_revision();

-- ============================================================================
-- 7. RLS Policy Correction for Tombstone Synchronization
-- ============================================================================
-- Permits authenticated users to retrieve their own tombstones (deleted_at IS NOT NULL)
-- so that offline client devices can reconcile deletions without resurrection.
-- Strict tenant isolation (auth.uid() = user_id) is rigorously preserved.

DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;

CREATE POLICY "Users can view own bookmarks including tombstones"
ON public.bookmarks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
