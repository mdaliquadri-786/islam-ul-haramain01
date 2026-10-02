-- Migration: 20260924000003_audio_streaming_reciters.sql
-- Description: Audio Streaming & Verified Reciter Catalog schema with explicit licensing records,
--              Ayah-level timestamp synchronization, and CDN streaming provenance.
-- Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog

-- ============================================================================
-- 1. Audio Reciters Catalog Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audio_reciters (
    id VARCHAR(50) PRIMARY KEY,                         -- 'alafasy', 'al-husary', 'abdul-basit', etc.
    name_arabic VARCHAR(150) NOT NULL,
    name_english VARCHAR(150) NOT NULL,
    name_urdu VARCHAR(150) NOT NULL,
    style VARCHAR(50) NOT NULL DEFAULT 'murattal'
        CHECK (style IN ('murattal', 'mujawwad', 'muallim')),
    bio_english TEXT,
    bio_arabic TEXT,
    bio_urdu TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Audio Surah Files & Provenance Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audio_surah_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reciter_id VARCHAR(50) NOT NULL REFERENCES public.audio_reciters(id) ON DELETE RESTRICT,
    surah_id SMALLINT NOT NULL REFERENCES public.quran_surahs(id) ON DELETE RESTRICT,
    audio_url TEXT NOT NULL,
    format VARCHAR(20) NOT NULL DEFAULT 'mp3',
    duration_seconds INT NOT NULL CHECK (duration_seconds > 0),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    mime_type VARCHAR(100) NOT NULL DEFAULT 'audio/mpeg',
    -- Ayah-level timestamp synchronization: array of { ayahNumber, startMs, endMs }
    timing_segments JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_archive VARCHAR(255) NOT NULL,
    copyright_holder VARCHAR(255),
    license_type VARCHAR(100) NOT NULL DEFAULT 'Islamic Waqf / Permissible Non-commercial Open Audio',
    allowed_usage VARCHAR(150) NOT NULL DEFAULT 'Non-commercial digital streaming and playback',
    attribution_requirement TEXT NOT NULL,
    redistribution_status VARCHAR(50) NOT NULL DEFAULT 'verified_permissible'
        CHECK (redistribution_status IN ('verified_permissible', 'unverified_pending', 'restricted_takedown')),
    import_date DATE NOT NULL DEFAULT CURRENT_DATE,
    takedown_contact VARCHAR(255) NOT NULL DEFAULT 'legal@islamicplatform.org',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_reciter_surah UNIQUE (reciter_id, surah_id)
);

-- ============================================================================
-- 3. Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audio_reciters_active
ON public.audio_reciters (id)
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_audio_surah_lookup
ON public.audio_surah_files (reciter_id, surah_id)
WHERE redistribution_status = 'verified_permissible';

-- ============================================================================
-- 4. Triggers for updated_at
-- ============================================================================

CREATE TRIGGER trg_audio_reciters_updated_at
BEFORE UPDATE ON public.audio_reciters
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_audio_surah_files_updated_at
BEFORE UPDATE ON public.audio_surah_files
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================================
-- 5. Row Level Security (RLS) Configuration
-- ============================================================================

ALTER TABLE public.audio_reciters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_surah_files ENABLE ROW LEVEL SECURITY;

-- 5.1 Public Read Access for Active Reciters
CREATE POLICY "Public can view active reciters"
ON public.audio_reciters FOR SELECT
TO public
USING (is_active = TRUE);

-- 5.2 Public Read Access for Verified Permissible Audio Tracks
CREATE POLICY "Public can view verified audio tracks"
ON public.audio_surah_files FOR SELECT
TO public
USING (redistribution_status = 'verified_permissible');

-- ----------------------------------------------------------------------------
-- Prerequisite Administrative Check Functions (Forward-declared for RLS)
-- Canonical definitions from 20260925000001 (M15) and 20261001000000 (M17)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin(lookup_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF lookup_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = lookup_uid
        AND role IN (
            'super_admin',
            'admin',
            'content_admin',
            'scholar_reviewer',
            'support_admin',
            'billing_admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.is_platform_admin(lookup_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF lookup_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Delegates to canonical is_admin check defined in 20260925000001
    RETURN public.is_admin(lookup_uid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated, anon;

-- 5.3 Administrative Mutations Only
CREATE POLICY "Admins can manage audio reciters"
ON public.audio_reciters FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins can manage audio surah files"
ON public.audio_surah_files FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));
