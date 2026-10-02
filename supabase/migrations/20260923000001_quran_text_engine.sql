-- Migration: 20260923000001_quran_text_engine.sql
-- Description: Canonical Quran Text Engine, editions, Surahs, Ayahs, cryptographic checksums, immutability, and full-text search indexing.
-- Milestone: Phase 2 -> Milestone 2.1 (Quran Text Engine & Validated Import Pipeline)

-- ============================================================================
-- 1. Quran Editions (Source Provenance & Licensing Register)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quran_editions (
    id VARCHAR(50) PRIMARY KEY,                         -- e.g. 'tanzil-uthmani-v1.1'
    name VARCHAR(150) NOT NULL,                         -- 'Tanzil Uthmani (Medina Mushaf)'
    author VARCHAR(150) NOT NULL,                       -- 'Tanzil Project'
    edition_version VARCHAR(30) NOT NULL,               -- '1.1'
    script_type VARCHAR(30) NOT NULL,                   -- 'uthmani', 'indopak', 'clean'
    riwayah VARCHAR(50) NOT NULL DEFAULT 'Hafs an Asim',-- 'Hafs an Asim'
    numbering_convention VARCHAR(50) NOT NULL DEFAULT 'Kufan', -- 'Kufan' (6236 ayahs)
    source_url TEXT NOT NULL,                           -- 'https://tanzil.net'
    download_url TEXT,
    license VARCHAR(100) NOT NULL,                      -- 'Creative Commons Attribution 3.0'
    attribution_notice TEXT NOT NULL,
    raw_source_sha256 CHAR(64) NOT NULL,               -- SHA-256 of source XML/dataset
    total_surahs SMALLINT NOT NULL DEFAULT 114,
    total_ayahs INT NOT NULL DEFAULT 6236,
    status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Quran Surahs (Chapters Metadata)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quran_surahs (
    id SMALLINT PRIMARY KEY CHECK (id >= 1 AND id <= 114), -- 1 to 114
    slug VARCHAR(50) NOT NULL UNIQUE,                      -- 'al-fatihah', 'al-baqarah'
    name_arabic VARCHAR(100) NOT NULL,                     -- الفاتحة
    name_english VARCHAR(100) NOT NULL,                    -- The Opening
    name_transliteration VARCHAR(100) NOT NULL,            -- Al-Faatiha
    revelation_type VARCHAR(10) NOT NULL
        CHECK (revelation_type IN ('meccan', 'medinan')),
    revelation_order SMALLINT NOT NULL CHECK (revelation_order >= 1 AND revelation_order <= 114),
    ayahs_count SMALLINT NOT NULL CHECK (ayahs_count >= 1),
    rukus_count SMALLINT NOT NULL CHECK (rukus_count >= 1),
    start_ayah_index INT NOT NULL CHECK (start_ayah_index >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quran_surahs_order ON public.quran_surahs (revelation_order);

-- ============================================================================
-- 3. Quran Ayahs (Canonical Verses, Checksums & Search Fields)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quran_ayahs (
    id INT PRIMARY KEY,                                    -- Global ayah index (1 to 6236)
    edition_id VARCHAR(50) NOT NULL REFERENCES public.quran_editions(id) ON DELETE RESTRICT,
    surah_id SMALLINT NOT NULL REFERENCES public.quran_surahs(id) ON DELETE RESTRICT,
    ayah_number SMALLINT NOT NULL CHECK (ayah_number >= 1),-- 1 to 286
    text_source_verbatim TEXT NOT NULL,                    -- Canonical source-verbatim representation from verified source
    checksum_source_verbatim CHAR(64) NOT NULL,            -- SHA-256 of verbatim text_source_verbatim (UTF-8 bytes)
    text_uthmani TEXT NOT NULL,                            -- Deterministically parsed structural Ayah text (no Bismillah prefix for Surahs 2-114)
    checksum_ayah_structural CHAR(64) NOT NULL,            -- SHA-256 of structural text_uthmani (UTF-8 bytes)
    text_checksum CHAR(64) NOT NULL,                       -- Compatibility alias identical to checksum_ayah_structural
    bismillah TEXT,                                        -- Opening Bismillah deterministically parsed from source representation
    text_clean TEXT NOT NULL,                              -- Deterministic normalized plain text for search (never used for canonical hashes)
    juz_number SMALLINT NOT NULL CHECK (juz_number >= 1 AND juz_number <= 30),
    hizb_number SMALLINT NOT NULL CHECK (hizb_number >= 1 AND hizb_number <= 60),
    rub_number SMALLINT NOT NULL CHECK (rub_number >= 1 AND rub_number <= 240),
    ruku_number SMALLINT NOT NULL CHECK (ruku_number >= 1),
    manzil_number SMALLINT NOT NULL CHECK (manzil_number >= 1 AND manzil_number <= 7),
    page_number SMALLINT NOT NULL CHECK (page_number >= 1 AND page_number <= 604),
    sajdah BOOLEAN NOT NULL DEFAULT FALSE,
    sajdah_type VARCHAR(20) DEFAULT NULL,                  -- Raw source metadata attribute from Tanzil XML ('recommended' | 'obligatory'); does not represent a universal fiqh ruling
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_edition_surah_ayah UNIQUE (edition_id, surah_id, ayah_number),
    -- Strictly enforce mathematical and deterministic coherence between source-verbatim and structural representation:
    CONSTRAINT check_quran_ayah_source_verbatim_coherence CHECK (
        (bismillah IS NOT NULL AND text_source_verbatim = bismillah || ' ' || text_uthmani)
        OR
        (bismillah IS NULL AND text_source_verbatim = text_uthmani)
    )
);

-- Essential navigation and spatial indexes
CREATE INDEX idx_quran_ayahs_surah_ayah ON public.quran_ayahs (surah_id, ayah_number);
CREATE INDEX idx_quran_ayahs_page ON public.quran_ayahs (page_number);
CREATE INDEX idx_quran_ayahs_juz ON public.quran_ayahs (juz_number);
CREATE INDEX idx_quran_ayahs_hizb ON public.quran_ayahs (hizb_number);

-- Trigram and Full-Text Search indexes on the isolated search representation
CREATE INDEX idx_quran_ayahs_clean_trgm ON public.quran_ayahs USING GIN (text_clean gin_trgm_ops);
CREATE INDEX idx_quran_ayahs_search_vec ON public.quran_ayahs USING GIN (to_tsvector('arabic', text_clean));

-- ============================================================================
-- 4. Cryptographic Integrity Trigger (SHA-256 Checksum Validation)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_quran_ayah_checksum()
RETURNS TRIGGER AS $$
DECLARE
    v_calc_source_verbatim CHAR(64);
    v_calc_ayah_structural CHAR(64);
BEGIN
    -- 1. Calculate SHA-256 digest of source-verbatim text representation
    v_calc_source_verbatim := encode(digest(convert_to(NEW.text_source_verbatim, 'UTF8'), 'sha256'), 'hex');
    IF LOWER(NEW.checksum_source_verbatim) <> LOWER(v_calc_source_verbatim) THEN
        RAISE EXCEPTION 'Cryptographic Integrity Failure: checksum_source_verbatim (%) does not match computed SHA-256 (%) for Surah % Ayah %.',
            NEW.checksum_source_verbatim, v_calc_source_verbatim, NEW.surah_id, NEW.ayah_number;
    END IF;

    -- 2. Calculate SHA-256 digest of structural Ayah text (text_uthmani)
    v_calc_ayah_structural := encode(digest(convert_to(NEW.text_uthmani, 'UTF8'), 'sha256'), 'hex');
    IF LOWER(NEW.checksum_ayah_structural) <> LOWER(v_calc_ayah_structural) THEN
        RAISE EXCEPTION 'Cryptographic Integrity Failure: checksum_ayah_structural (%) does not match computed SHA-256 (%) for Surah % Ayah %.',
            NEW.checksum_ayah_structural, v_calc_ayah_structural, NEW.surah_id, NEW.ayah_number;
    END IF;

    -- 3. Verify compatibility alias text_checksum matches structural checksum
    IF LOWER(NEW.text_checksum) <> LOWER(v_calc_ayah_structural) THEN
        RAISE EXCEPTION 'Cryptographic Integrity Failure: text_checksum (%) must match computed structural SHA-256 (%) for Surah % Ayah %.',
            NEW.text_checksum, v_calc_ayah_structural, NEW.surah_id, NEW.ayah_number;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = extensions, public, pg_temp;

CREATE TRIGGER trg_verify_quran_ayah_checksum
BEFORE INSERT OR UPDATE ON public.quran_ayahs
FOR EACH ROW EXECUTE FUNCTION public.verify_quran_ayah_checksum();

-- ============================================================================
-- 5. Immutability Trigger (Protection Against Modification of Published Scripture)
-- NOTE: The 'app.allow_quran_override' session setting is an emergency break-glass
-- mechanism intended strictly for controlled database migrations and schema maintenance.
-- It is NOT exposed to application users, normal admin interfaces, or client APIs.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_published_quran_mutation()
RETURNS TRIGGER AS $$
DECLARE
    v_edition_status VARCHAR(30);
BEGIN
    SELECT status INTO v_edition_status
    FROM public.quran_editions
    WHERE id = OLD.edition_id;

    IF v_edition_status = 'published' AND current_setting('app.allow_quran_override', true) IS DISTINCT FROM 'true' THEN
        RAISE EXCEPTION 'Immutable Canonical Scripture: Direct UPDATE or DELETE on published Quran Ayahs is strictly forbidden (Surah % Ayah %).',
            OLD.surah_id, OLD.ayah_number;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_prevent_quran_mutation
BEFORE UPDATE OR DELETE ON public.quran_ayahs
FOR EACH ROW EXECUTE FUNCTION public.prevent_published_quran_mutation();

-- ============================================================================
-- 6. Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE public.quran_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_surahs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quran_ayahs ENABLE ROW LEVEL SECURITY;

-- Public read access: Anyone (anon or authenticated) can read Quran scripture
CREATE POLICY "Allow public read access to quran_editions"
ON public.quran_editions FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Allow public read access to quran_surahs"
ON public.quran_surahs FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Allow public read access to quran_ayahs"
ON public.quran_ayahs FOR SELECT
TO PUBLIC
USING (true);

-- Modification access: Strictly restricted to super_admin or service role
CREATE POLICY "Allow super_admin to manage quran_editions"
ON public.quran_editions FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Allow super_admin to manage quran_surahs"
ON public.quran_surahs FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));

CREATE POLICY "Allow super_admin to manage quran_ayahs"
ON public.quran_ayahs FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin']));
