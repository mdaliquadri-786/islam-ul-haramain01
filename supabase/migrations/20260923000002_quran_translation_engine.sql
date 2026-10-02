-- Migration: 20260923000002_quran_translation_engine.sql
-- Description: Quran Translation Engine, editions registry, Ayah translations, cryptographic checksums, immutability, and full-text search indexing.
-- Milestone: Phase 2 -> Milestone 2.2 (Quran Translation Engine & Verified Bilingual Ingestion)

-- ============================================================================
-- 1. Quran Translation Editions (Source Provenance & Licensing Register)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quran_translation_editions (
    id VARCHAR(50) PRIMARY KEY,                         -- e.g. 'en.sahih', 'ur.jalandhry'
    slug VARCHAR(50) NOT NULL UNIQUE,                   -- e.g. 'saheeh-international', 'fateh-muhammad-jalandhari'
    language_code VARCHAR(10) NOT NULL,                 -- 'en', 'ur'
    title VARCHAR(150) NOT NULL,                        -- 'Saheeh International (English Translation)'
    translator VARCHAR(150) NOT NULL,                   -- 'Saheeh International'
    source_name VARCHAR(150) NOT NULL,                  -- 'Tanzil Project Translations Repository'
    source_url TEXT NOT NULL,                           -- 'https://tanzil.net/trans/'
    source_version VARCHAR(50) NOT NULL,                -- 'April 24, 2011'
    publisher VARCHAR(150),                             -- 'Abul-Qasim Publishing House'
    publication_year SMALLINT,                          -- 1997
    license VARCHAR(100) NOT NULL,                      -- 'Non-Commercial Permissible with Attribution'
    copyright_statement TEXT NOT NULL,
    attribution_text TEXT NOT NULL,
    source_file_name VARCHAR(100) NOT NULL,             -- 'en.sahih.txt'
    source_sha256 CHAR(64) NOT NULL,                    -- SHA-256 of source file
    dataset_sha256 CHAR(64) NOT NULL,                   -- Deterministic dataset checksum across all translated Ayahs
    source_acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_surahs SMALLINT NOT NULL DEFAULT 114,
    total_ayahs INT NOT NULL DEFAULT 6236,
    status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'validated', 'published', 'retired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Quran Translations (Human-Authored Ayah Interpretations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quran_translations (
    id BIGSERIAL PRIMARY KEY,
    edition_id VARCHAR(50) NOT NULL REFERENCES public.quran_translation_editions(id) ON DELETE RESTRICT,
    surah_number SMALLINT NOT NULL REFERENCES public.quran_surahs(id) ON DELETE RESTRICT,
    ayah_number SMALLINT NOT NULL CHECK (ayah_number >= 1),
    ayah_id INT NOT NULL REFERENCES public.quran_ayahs(id) ON DELETE RESTRICT,
    translation_text TEXT NOT NULL,
    translator_note TEXT,
    source_reference TEXT,
    text_checksum CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_quran_translation_ayah UNIQUE (edition_id, surah_number, ayah_number)
);

-- Essential lookup and relational indexes
CREATE INDEX idx_quran_translations_edition_surah ON public.quran_translations (edition_id, surah_number, ayah_number);
CREATE INDEX idx_quran_translations_ayah ON public.quran_translations (ayah_id);
CREATE INDEX idx_quran_translations_surah_ayah ON public.quran_translations (surah_number, ayah_number);

-- Trigram indexing on translation text for flexible search and matching
CREATE INDEX idx_quran_translations_text_trgm ON public.quran_translations USING GIN (translation_text gin_trgm_ops);

-- ============================================================================
-- 3. Cryptographic Integrity Trigger (SHA-256 Checksum Validation)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_quran_translation_checksum()
RETURNS TRIGGER AS $$
DECLARE
    v_calc_checksum CHAR(64);
BEGIN
    -- Calculate SHA-256 digest of translation text UTF-8 bytes
    v_calc_checksum := encode(digest(convert_to(NEW.translation_text, 'UTF8'), 'sha256'), 'hex');
    IF LOWER(NEW.text_checksum) <> LOWER(v_calc_checksum) THEN
        RAISE EXCEPTION 'Cryptographic Integrity Failure: text_checksum (%) does not match computed SHA-256 (%) for Edition % Surah % Ayah %.',
            NEW.text_checksum, v_calc_checksum, NEW.edition_id, NEW.surah_number, NEW.ayah_number;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = extensions, public, pg_temp;

CREATE TRIGGER trg_verify_quran_translation_checksum
BEFORE INSERT OR UPDATE ON public.quran_translations
FOR EACH ROW EXECUTE FUNCTION public.verify_quran_translation_checksum();

-- ============================================================================
-- 4. Immutability Trigger (Protection Against Mutation of Published Translations)
-- NOTE: The 'app.allow_quran_override' session setting is an emergency break-glass
-- mechanism intended strictly for controlled database migrations and schema maintenance.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_published_translation_mutation()
RETURNS TRIGGER AS $$
DECLARE
    v_edition_status VARCHAR(30);
BEGIN
    SELECT status INTO v_edition_status
    FROM public.quran_translation_editions
    WHERE id = OLD.edition_id;

    IF v_edition_status = 'published' AND current_setting('app.allow_quran_override', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'Immutable Translation Scripture: Direct UPDATE or DELETE on published Quran translation text is strictly forbidden (Edition % Surah % Ayah %).',
            OLD.edition_id, OLD.surah_number, OLD.ayah_number;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_prevent_translation_mutation
BEFORE UPDATE OR DELETE ON public.quran_translations
FOR EACH ROW EXECUTE FUNCTION public.prevent_published_translation_mutation();

-- Protection against direct mutation/deletion of published translation editions
CREATE OR REPLACE FUNCTION public.prevent_published_translation_edition_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'published' AND current_setting('app.allow_quran_override', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'Immutable Translation Scripture: Direct UPDATE or DELETE on published Quran translation edition (%) is strictly forbidden.',
            OLD.id;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_prevent_translation_edition_mutation
BEFORE UPDATE OR DELETE ON public.quran_translation_editions
FOR EACH ROW EXECUTE FUNCTION public.prevent_published_translation_edition_mutation();


-- ============================================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE public.quran_translation_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_translations ENABLE ROW LEVEL SECURITY;

-- Public read access: Anyone (anon or authenticated) can read published translation editions
CREATE POLICY "Allow public read access to published quran_translation_editions"
ON public.quran_translation_editions FOR SELECT
TO PUBLIC
USING (
    status = 'published'
    OR (auth.uid() IS NOT NULL AND public.has_any_role(auth.uid(), ARRAY['super_admin']))
);

-- Public read access: Anyone can read translations belonging to published editions
CREATE POLICY "Allow public read access to published quran_translations"
ON public.quran_translations FOR SELECT
TO PUBLIC
USING (
    EXISTS (
        SELECT 1
        FROM public.quran_translation_editions e
        WHERE e.id = quran_translations.edition_id
          AND (e.status = 'published' OR (auth.uid() IS NOT NULL AND public.has_any_role(auth.uid(), ARRAY['super_admin'])))
    )
);

-- Modification access: Strictly restricted to super_admin or service role
CREATE POLICY "Allow super_admin to manage quran_translation_editions"
ON public.quran_translation_editions FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Allow super_admin to manage quran_translations"
ON public.quran_translations FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));
