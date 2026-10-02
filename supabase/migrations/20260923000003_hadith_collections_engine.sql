-- Migration: 20260923000003_hadith_collections_engine.sql
-- Description: Hadith Collections Engine, scholars/authors registry, books/chapters,
--              narrations, cryptographic checksums, sanad/matn separation, and authenticated scholar gradings.
-- Milestone: Phase 2 -> Milestone 2.3 (Hadith Collections Engine & Grading Attribution)

-- ============================================================================
-- 1. Scholars & Authors Registry (Compilers, Hadith Masters & Evaluators)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scholars_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_arabic VARCHAR(200) NOT NULL,
    name_english VARCHAR(200) NOT NULL,
    name_urdu VARCHAR(200),
    death_year_ah SMALLINT,
    death_year_ce SMALLINT,
    era VARCHAR(50) NOT NULL DEFAULT 'classical'
        CHECK (era IN ('prophetic', 'companions', 'tabiun', 'early', 'classical', 'contemporary')),
    role VARCHAR(50) NOT NULL DEFAULT 'author'
        CHECK (role IN ('compiler', 'evaluator', 'commentator', 'scholar', 'translator')),
    biography_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Hadith Collections (Kutub al-Sittah & Primary Sunnah Compendiums)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hadith_collections (
    id VARCHAR(50) PRIMARY KEY,                         -- 'bukhari', 'muslim', 'abu-dawud', 'tirmidhi', 'nasai', 'ibn-majah'
    slug VARCHAR(50) NOT NULL UNIQUE,                   -- 'sahih-al-bukhari', 'sahih-muslim', etc.
    name_arabic VARCHAR(150) NOT NULL,
    name_english VARCHAR(150) NOT NULL,
    name_urdu VARCHAR(150) NOT NULL,
    author_id UUID NOT NULL REFERENCES public.scholars_authors(id) ON DELETE RESTRICT,
    total_hadiths INT NOT NULL DEFAULT 0,
    total_books INT NOT NULL DEFAULT 0,
    description TEXT,
    provenance_notes TEXT,
    source_edition VARCHAR(200) NOT NULL,
    source_url TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'validated', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. Hadith Books / Chapters (Kutub / Abwab)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hadith_books (
    id BIGSERIAL PRIMARY KEY,
    collection_id VARCHAR(50) NOT NULL REFERENCES public.hadith_collections(id) ON DELETE RESTRICT,
    book_number INT NOT NULL,
    name_arabic VARCHAR(250) NOT NULL,
    name_english VARCHAR(250) NOT NULL,
    name_urdu VARCHAR(250),
    hadith_start_number INT NOT NULL DEFAULT 1,
    hadith_end_number INT NOT NULL DEFAULT 1,
    total_hadiths INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_hadith_collection_book UNIQUE (collection_id, book_number)
);

-- ============================================================================
-- 4. Hadith Narrations (Canonical Texts, Sanad, Matn, & Translations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hadith_narrations (
    id BIGSERIAL PRIMARY KEY,
    collection_id VARCHAR(50) NOT NULL REFERENCES public.hadith_collections(id) ON DELETE RESTRICT,
    book_id BIGINT NOT NULL REFERENCES public.hadith_books(id) ON DELETE RESTRICT,
    hadith_number INT NOT NULL,
    in_book_reference VARCHAR(50),                      -- e.g. 'Book 1, Hadith 1'
    international_number INT,                           -- Darussalam universal numbering reference
    chapter_title_arabic TEXT,
    chapter_title_english TEXT,
    sanad_arabic TEXT,                                  -- Chain of transmission (Isnad)
    matn_arabic TEXT NOT NULL,                          -- Substantive narration text
    matn_clean TEXT NOT NULL,                           -- Normalized text for search indexing
    translation_english TEXT,
    translation_urdu TEXT,
    text_checksum CHAR(64) NOT NULL,                    -- SHA-256 of matn_arabic UTF-8 bytes
    source_edition TEXT NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'validated', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_hadith_collection_narration UNIQUE (collection_id, hadith_number, version_number)
);

-- Core lookup indexes
CREATE INDEX idx_hadith_lookup ON public.hadith_narrations (collection_id, hadith_number) WHERE is_current = TRUE;
CREATE INDEX idx_hadith_book_lookup ON public.hadith_narrations (book_id, hadith_number);
CREATE INDEX idx_hadith_intl_num ON public.hadith_narrations (collection_id, international_number) WHERE international_number IS NOT NULL;

-- Trigram search indexes
CREATE INDEX idx_hadith_matn_clean_trgm ON public.hadith_narrations USING GIN (matn_clean gin_trgm_ops);
CREATE INDEX idx_hadith_trans_en_trgm ON public.hadith_narrations USING GIN (translation_english gin_trgm_ops) WHERE translation_english IS NOT NULL;

-- ============================================================================
-- 5. Hadith Gradings (Attributed Authenticity Evaluations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hadith_gradings (
    id BIGSERIAL PRIMARY KEY,
    hadith_id BIGINT NOT NULL REFERENCES public.hadith_narrations(id) ON DELETE RESTRICT,
    scholar_id UUID NOT NULL REFERENCES public.scholars_authors(id) ON DELETE RESTRICT,
    grade VARCHAR(100) NOT NULL,                        -- 'Sahih', 'Hasan', 'Daif', 'Sahih li Ghayrihi'
    grade_arabic VARCHAR(100) NOT NULL,                 -- 'صحيح', 'حسن', 'ضعيف'
    grade_level VARCHAR(20) NOT NULL
        CHECK (grade_level IN ('sahih', 'hasan', 'daif', 'mawdu')),
    scholarly_commentary TEXT,
    reference_source VARCHAR(255) NOT NULL,             -- e.g. 'Sahih al-Jami (1/123)', 'Darussalam (2007)'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_hadith_scholar_grading UNIQUE (hadith_id, scholar_id)
);

CREATE INDEX idx_hadith_gradings_hadith ON public.hadith_gradings (hadith_id);
CREATE INDEX idx_hadith_gradings_scholar ON public.hadith_gradings (scholar_id);

-- ============================================================================
-- 6. Cryptographic Verification & Immutability Triggers
-- ============================================================================

-- A. Hadith Matn Checksum Verification Trigger
CREATE OR REPLACE FUNCTION public.verify_hadith_checksum()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    computed_checksum CHAR(64);
BEGIN
    computed_checksum := encode(digest(convert_to(NEW.matn_arabic, 'UTF8'), 'sha256'), 'hex');

    IF LOWER(NEW.text_checksum) != LOWER(computed_checksum) THEN
        RAISE EXCEPTION 'Cryptographic checksum mismatch for Hadith %:%! Provided: %, Computed: %',
            NEW.collection_id, NEW.hadith_number, NEW.text_checksum, computed_checksum;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_verify_hadith_checksum
BEFORE INSERT OR UPDATE ON public.hadith_narrations
FOR EACH ROW
EXECUTE FUNCTION public.verify_hadith_checksum();

-- B. Hadith Narration Immutability Trigger
CREATE OR REPLACE FUNCTION public.prevent_published_hadith_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF current_setting('app.allow_hadith_override', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'published' THEN
            RAISE EXCEPTION 'Illegal mutation of published Hadith narration %:%! Published Hadith records are immutable.',
                OLD.collection_id, OLD.hadith_number;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'published' THEN
            RAISE EXCEPTION 'Illegal deletion of published Hadith narration %:%! Published Hadith records are immutable.',
                OLD.collection_id, OLD.hadith_number;
        END IF;
        RETURN OLD;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_prevent_hadith_mutation
BEFORE UPDATE OR DELETE ON public.hadith_narrations
FOR EACH ROW
EXECUTE FUNCTION public.prevent_published_hadith_mutation();

-- C. Hadith Grading Immutability Trigger
CREATE OR REPLACE FUNCTION public.prevent_published_hadith_grading_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    parent_status VARCHAR(30);
BEGIN
    IF current_setting('app.allow_hadith_override', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    SELECT status INTO parent_status FROM public.hadith_narrations WHERE id = OLD.hadith_id;

    IF parent_status = 'published' THEN
        RAISE EXCEPTION 'Illegal mutation of Hadith grading (grading_id: %) linked to published Hadith narration!',
            OLD.id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_prevent_hadith_grading_mutation
BEFORE UPDATE OR DELETE ON public.hadith_gradings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_published_hadith_grading_mutation();

-- D. Collection Immutability Trigger
CREATE OR REPLACE FUNCTION public.prevent_published_hadith_collection_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF current_setting('app.allow_hadith_override', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN
        RAISE EXCEPTION 'Illegal update of published Hadith collection %! Published collections are immutable.', OLD.id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
        RAISE EXCEPTION 'Illegal deletion of published Hadith collection %! Published collections are immutable.', OLD.id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_prevent_hadith_collection_mutation
BEFORE UPDATE OR DELETE ON public.hadith_collections
FOR EACH ROW
EXECUTE FUNCTION public.prevent_published_hadith_collection_mutation();

-- ============================================================================
-- 7. Row-Level Security (RLS)
-- ============================================================================

ALTER TABLE public.scholars_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith_narrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hadith_gradings ENABLE ROW LEVEL SECURITY;

-- Public SELECT policies
CREATE POLICY "Public read access to scholars and authors"
    ON public.scholars_authors FOR SELECT
    USING (TRUE);

CREATE POLICY "Public read access to published hadith collections"
    ON public.hadith_collections FOR SELECT
    USING (status = 'published');

CREATE POLICY "Public read access to hadith books"
    ON public.hadith_books FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hadith_collections c
            WHERE c.id = hadith_books.collection_id AND c.status = 'published'
        )
    );

CREATE POLICY "Public read access to published hadith narrations"
    ON public.hadith_narrations FOR SELECT
    USING (status = 'published' AND is_current = TRUE);

CREATE POLICY "Public read access to hadith gradings"
    ON public.hadith_gradings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.hadith_narrations n
            WHERE n.id = hadith_gradings.hadith_id AND n.status = 'published'
        )
    );

-- Super admin mutation policies
CREATE POLICY "Super admin mutation for scholars_authors"
    ON public.scholars_authors FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Super admin mutation for hadith_collections"
    ON public.hadith_collections FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Super admin mutation for hadith_books"
    ON public.hadith_books FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Super admin mutation for hadith_narrations"
    ON public.hadith_narrations FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Super admin mutation for hadith_gradings"
    ON public.hadith_gradings FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));
