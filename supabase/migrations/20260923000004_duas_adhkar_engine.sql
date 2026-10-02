-- Migration: 20260923000004_duas_adhkar_engine.sql
-- Description: Duas & Adhkar Engine schema, categories, authentic supplications from
--              Hisn al-Muslim, cryptographic checksum verification, repetition counts,
--              structured Quran/Hadith citations, and immutability triggers.
-- Milestone: Phase 2 -> Milestone 2.4 (Duas & Adhkar Engine)

-- ============================================================================
-- 1. Dua Sources Registry (e.g. Hisn al-Muslim, Al-Adab al-Mufrad, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dua_sources (
    id VARCHAR(50) PRIMARY KEY,                         -- 'hisn-al-muslim'
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_arabic VARCHAR(250) NOT NULL,
    name_english VARCHAR(250) NOT NULL,
    name_urdu VARCHAR(250),
    author VARCHAR(200) NOT NULL,
    author_arabic VARCHAR(200) NOT NULL,
    author_death_year_ah SMALLINT,
    author_death_year_ce SMALLINT,
    license VARCHAR(150) NOT NULL DEFAULT 'Islamic Waqf (Dedicated for Free Non-Commercial Propagation)',
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'validated', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Dua Categories (Canonical Chapters / Themes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dua_categories (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    name_arabic VARCHAR(250) NOT NULL,
    name_english VARCHAR(250) NOT NULL,
    name_urdu VARCHAR(250),
    sort_order INT NOT NULL DEFAULT 1,
    total_duas INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dua_categories_sort ON public.dua_categories (sort_order ASC);

-- ============================================================================
-- 3. Duas & Adhkar (Canonical Arabic, Transliteration, Translations & Citations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.duas_adhkar (
    id BIGSERIAL PRIMARY KEY,
    dua_id VARCHAR(50) NOT NULL UNIQUE,                 -- Deterministic identifier e.g. 'hisn-1'
    category_id BIGINT NOT NULL REFERENCES public.dua_categories(id) ON DELETE RESTRICT,
    source_id VARCHAR(50) NOT NULL REFERENCES public.dua_sources(id) ON DELETE RESTRICT,
    item_number INT NOT NULL,                           -- Sequence number within collection
    arabic_text TEXT NOT NULL,                          -- Source verbatim Arabic text with full tashkeel
    transliteration TEXT,                               -- Romanized phonetic transcription
    translation_english TEXT NOT NULL,                  -- Verified English translation
    translation_urdu TEXT,                              -- Verified Urdu translation (NULL where unapproved)
    repeat_count INT NOT NULL DEFAULT 1
        CHECK (repeat_count >= 1),                      -- Repetition count from authentic Sunnah (1, 3, 7, 10, 33, 100)
    occasion_context TEXT,                              -- Prescribed context or occasions for recitation
    quran_surah INT
        CHECK (quran_surah IS NULL OR (quran_surah >= 1 AND quran_surah <= 114)),
    quran_ayah VARCHAR(50),                             -- e.g. '255', '190-200'
    hadith_collection VARCHAR(50),                      -- e.g. 'bukhari', 'muslim', 'tirmidhi', 'abu-dawud', 'nasai', 'ibn-majah'
    hadith_number VARCHAR(50),                          -- Hadith number or reference
    hadith_reference TEXT,                              -- Complete primary source citation
    hadith_grade VARCHAR(100),                          -- Authenticity grade e.g. 'Sahih', 'Hasan'
    text_checksum CHAR(64) NOT NULL,                    -- SHA-256 of arabic_text UTF-8 bytes
    text_clean TEXT NOT NULL,                           -- Stripped diacritics / normalized for search
    version_number INT NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'validated', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_dua_category_item UNIQUE (category_id, item_number, version_number)
);

-- Core lookup indexes
CREATE INDEX idx_duas_lookup ON public.duas_adhkar (category_id, item_number) WHERE is_current = TRUE;
CREATE INDEX idx_duas_dua_id ON public.duas_adhkar (dua_id);
CREATE INDEX idx_duas_quran ON public.duas_adhkar (quran_surah, quran_ayah) WHERE quran_surah IS NOT NULL;
CREATE INDEX idx_duas_hadith ON public.duas_adhkar (hadith_collection, hadith_number) WHERE hadith_collection IS NOT NULL;
CREATE INDEX idx_duas_checksum ON public.duas_adhkar (text_checksum);

-- Trigram search indexes
CREATE INDEX idx_duas_text_clean_trgm ON public.duas_adhkar USING GIN (text_clean gin_trgm_ops);
CREATE INDEX idx_duas_trans_en_trgm ON public.duas_adhkar USING GIN (translation_english gin_trgm_ops);

-- ============================================================================
-- 4. Cryptographic Checksum Verification & Immutability Triggers
-- ============================================================================

-- A. Dua Arabic Text Checksum Verification Trigger
CREATE OR REPLACE FUNCTION public.verify_dua_checksum()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    computed_checksum CHAR(64);
BEGIN
    computed_checksum := encode(digest(convert_to(TRIM(NEW.arabic_text), 'UTF8'), 'sha256'), 'hex');

    IF LOWER(NEW.text_checksum) != LOWER(computed_checksum) THEN
        RAISE EXCEPTION 'Cryptographic checksum mismatch for Dua %! Provided: %, Computed: %',
            NEW.dua_id, NEW.text_checksum, computed_checksum;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_verify_dua_checksum
BEFORE INSERT OR UPDATE ON public.duas_adhkar
FOR EACH ROW
EXECUTE FUNCTION public.verify_dua_checksum();

-- B. Dua Immutability Trigger
CREATE OR REPLACE FUNCTION public.prevent_published_dua_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF current_setting('app.allow_dua_override', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'published' THEN
            RAISE EXCEPTION 'Illegal mutation of published Dua %! Published records are immutable.', OLD.dua_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'published' THEN
            RAISE EXCEPTION 'Illegal deletion of published Dua %! Published records are immutable.', OLD.dua_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_prevent_dua_mutation
BEFORE UPDATE OR DELETE ON public.duas_adhkar
FOR EACH ROW
EXECUTE FUNCTION public.prevent_published_dua_mutation();

-- C. Dua Category Immutability Trigger
CREATE OR REPLACE FUNCTION public.prevent_published_dua_category_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF current_setting('app.allow_dua_override', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Illegal mutation of Dua category %! Dua categories are immutable once established.', OLD.slug;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_prevent_dua_category_mutation
BEFORE UPDATE OR DELETE ON public.dua_categories
FOR EACH ROW
EXECUTE FUNCTION public.prevent_published_dua_category_mutation();

-- D. Dua Source Immutability Trigger
CREATE OR REPLACE FUNCTION public.prevent_published_dua_source_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF current_setting('app.allow_dua_override', true) = 'true' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN
        RAISE EXCEPTION 'Illegal update of published Dua source %! Published sources are immutable.', OLD.id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
        RAISE EXCEPTION 'Illegal deletion of published Dua source %! Published sources are immutable.', OLD.id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_prevent_dua_source_mutation
BEFORE UPDATE OR DELETE ON public.dua_sources
FOR EACH ROW
EXECUTE FUNCTION public.prevent_published_dua_source_mutation();

-- ============================================================================
-- 5. Row-Level Security (RLS)
-- ============================================================================

ALTER TABLE public.dua_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dua_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duas_adhkar ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access to published dua sources"
    ON public.dua_sources FOR SELECT
    USING (status = 'published');

CREATE POLICY "Public read access to dua categories"
    ON public.dua_categories FOR SELECT
    USING (TRUE);

CREATE POLICY "Public read access to published duas"
    ON public.duas_adhkar FOR SELECT
    USING (status = 'published' AND is_current = TRUE);

-- Super admin mutation policies
CREATE POLICY "Super admin mutation for dua_sources"
    ON public.dua_sources FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Super admin mutation for dua_categories"
    ON public.dua_categories FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Super admin mutation for duas_adhkar"
    ON public.duas_adhkar FOR ALL
    TO authenticated
    USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
    WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));
