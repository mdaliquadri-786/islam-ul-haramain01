-- Migration: 20260924000004_tafsir_comparative_viewer.sql
-- Description: Classical Tafsir Comparative Viewer schema — Tafsir Works, Editions,
--              Entries with full provenance/licensing, publication gating, and RLS.
-- Milestone: M4.2 — Classical Tafsir Comparative Viewer
--
-- Licensing note from CONTENT_LICENSE_MATRIX.md (line 55):
--   "Classical Tafsir (Ar): Tafsir Ibn Kathir, Al-Tabari, Al-Qurtubi — Public Domain
--    — verified_permissible — Phase 4+"
-- The classical Arabic tafsir works (Ibn Kathir, Al-Sa'di) are in the public domain.
-- English/Urdu translations are tracked separately with their own licensing fields.

-- ============================================================================
-- 1. Tafsir Works Catalog Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tafsir_works (
    id VARCHAR(50) PRIMARY KEY,                     -- 'ibn-kathir', 'al-sadi', 'al-tabari'
    slug VARCHAR(100) NOT NULL UNIQUE,              -- URL-safe slug
    title_arabic VARCHAR(300) NOT NULL,             -- الفاتحة ...
    title_english VARCHAR(300) NOT NULL,
    title_urdu VARCHAR(300) NOT NULL,
    author_name_arabic VARCHAR(200) NOT NULL,
    author_name_english VARCHAR(200) NOT NULL,
    author_name_urdu VARCHAR(200) NOT NULL,
    author_death_year_hijri SMALLINT,               -- e.g. 774 (Ibn Kathir)
    author_death_year_ce SMALLINT,                  -- e.g. 1373
    description_english TEXT,
    description_arabic TEXT,
    description_urdu TEXT,
    methodology_notes TEXT,                         -- Aqeedah/Fiqh school notes (factual, not endorsement)
    -- Licensing / provenance
    license_type VARCHAR(100) NOT NULL DEFAULT 'Public Domain',
    license_status VARCHAR(50) NOT NULL DEFAULT 'verified_permissible'
        CHECK (license_status IN ('verified_permissible', 'unverified_pending', 'restricted_takedown')),
    source_url TEXT,
    provenance_notes TEXT,
    attribution_requirement TEXT,
    -- Review & publication
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    review_status VARCHAR(30) NOT NULL DEFAULT 'approved'
        CHECK (review_status IN ('draft', 'under_review', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Tafsir Editions Table (tracks specific editions, translations, publishers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tafsir_editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id VARCHAR(50) NOT NULL REFERENCES public.tafsir_works(id) ON DELETE RESTRICT,
    edition_identifier VARCHAR(100) NOT NULL,       -- 'ibn-kathir-ar-darus', 'ibn-kathir-en-safiur'
    language_code VARCHAR(10) NOT NULL DEFAULT 'ar', -- 'ar', 'en', 'ur'
    publisher VARCHAR(300),
    editor VARCHAR(300),
    translator VARCHAR(300),
    edition_year_ce SMALLINT,
    -- Licensing for this specific edition/translation
    license_type VARCHAR(100) NOT NULL DEFAULT 'Public Domain',
    license_status VARCHAR(50) NOT NULL DEFAULT 'verified_permissible'
        CHECK (license_status IN ('verified_permissible', 'unverified_pending', 'restricted_takedown')),
    license_notes TEXT,
    attribution_requirement TEXT NOT NULL DEFAULT '',
    source_archive_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_work_edition_language UNIQUE (work_id, edition_identifier, language_code)
);

-- ============================================================================
-- 3. Tafsir Entries Table (per-ayah commentary)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tafsir_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id VARCHAR(50) NOT NULL REFERENCES public.tafsir_works(id) ON DELETE RESTRICT,
    edition_id UUID REFERENCES public.tafsir_editions(id) ON DELETE SET NULL,
    -- Quran reference — references quran_surahs(id) for FK integrity
    surah_id SMALLINT NOT NULL REFERENCES public.quran_surahs(id) ON DELETE RESTRICT,
    ayah_number SMALLINT NOT NULL CHECK (ayah_number >= 1 AND ayah_number <= 286),
    -- Ayah range support (some tafsir covers multiple ayahs in one entry)
    ayah_number_end SMALLINT,                       -- NULL means single ayah only
    -- Content
    language_code VARCHAR(10) NOT NULL DEFAULT 'ar',
    text_content TEXT,                              -- NULL if content not yet ingested or license pending
    content_availability VARCHAR(30) NOT NULL DEFAULT 'metadata_only'
        CHECK (content_availability IN ('full_text', 'excerpt', 'metadata_only', 'unavailable')),
    source_page_reference VARCHAR(100),             -- e.g. "Vol. 1, p. 142" for print citations
    source_edition_identifier VARCHAR(200),
    -- Provenance & integrity
    license_status VARCHAR(50) NOT NULL DEFAULT 'verified_permissible'
        CHECK (license_status IN ('verified_permissible', 'unverified_pending', 'restricted_takedown')),
    content_sha256 CHAR(64),                        -- SHA-256 of text_content for corruption detection
    import_date DATE,
    import_source TEXT,
    -- Publication workflow
    publication_status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (publication_status IN ('draft', 'under_review', 'approved', 'published', 'restricted', 'unverified', 'takedown')),
    -- Versioning (consistent with project versioning model)
    version_number INT NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    parent_version_id UUID REFERENCES public.tafsir_entries(id),
    change_summary TEXT,
    reviewed_by_id UUID,                            -- References scholars_authors(id) if exists
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tafsir_works_active
    ON public.tafsir_works (id)
    WHERE is_active = TRUE AND license_status = 'verified_permissible';

CREATE INDEX IF NOT EXISTS idx_tafsir_entries_ayah_lookup
    ON public.tafsir_entries (work_id, surah_id, ayah_number)
    WHERE is_current = TRUE AND publication_status = 'published';

CREATE INDEX IF NOT EXISTS idx_tafsir_entries_surah
    ON public.tafsir_entries (surah_id, ayah_number, work_id)
    WHERE is_current = TRUE AND publication_status = 'published';

CREATE INDEX IF NOT EXISTS idx_tafsir_editions_work
    ON public.tafsir_editions (work_id, language_code)
    WHERE is_active = TRUE AND license_status = 'verified_permissible';

-- ============================================================================
-- 5. Triggers for updated_at
-- ============================================================================

CREATE TRIGGER trg_tafsir_works_updated_at
BEFORE UPDATE ON public.tafsir_works
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_tafsir_editions_updated_at
BEFORE UPDATE ON public.tafsir_editions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_tafsir_entries_updated_at
BEFORE UPDATE ON public.tafsir_entries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================================
-- 6. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.tafsir_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tafsir_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tafsir_entries ENABLE ROW LEVEL SECURITY;

-- 6.1 Public read: active, license-cleared tafsir works only
CREATE POLICY "Public can view active permissible tafsir works"
ON public.tafsir_works FOR SELECT
TO public
USING (
    is_active = TRUE
    AND license_status = 'verified_permissible'
    AND review_status = 'approved'
);

-- 6.2 Public read: active, license-cleared editions only
CREATE POLICY "Public can view active permissible tafsir editions"
ON public.tafsir_editions FOR SELECT
TO public
USING (
    is_active = TRUE
    AND license_status = 'verified_permissible'
);

-- 6.3 Public read: published tafsir entries only (gated on publication_status)
CREATE POLICY "Public can view published tafsir entries"
ON public.tafsir_entries FOR SELECT
TO public
USING (
    is_current = TRUE
    AND publication_status = 'published'
    AND license_status = 'verified_permissible'
);

-- 6.4 Scholar reviewers can view entries in under_review state
CREATE POLICY "Scholar reviewers can view entries under review"
ON public.tafsir_entries FOR SELECT
TO authenticated
USING (
    is_current = TRUE
    AND (
        publication_status = 'published'
        OR (
            publication_status IN ('under_review', 'approved', 'draft')
            AND public.is_platform_admin(auth.uid())
        )
    )
);

-- 6.5 Admin mutations only
CREATE POLICY "Admins can manage tafsir works"
ON public.tafsir_works FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins can manage tafsir editions"
ON public.tafsir_editions FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins can manage tafsir entries"
ON public.tafsir_entries FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));
