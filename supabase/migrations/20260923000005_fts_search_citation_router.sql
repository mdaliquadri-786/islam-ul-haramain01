-- Migration: 20260923000005_fts_search_citation_router.sql
-- Description: Multi-lingual Full-Text Search (FTS) indexes, Citation routing acceleration,
--              GIN tsvector indexes for Arabic, English, and Urdu corpora, and unified search RPC.
-- Milestone: Phase 2 -> Milestone 2.5 (Full-Text Search & Citation Router)

-- ============================================================================
-- 1. Full-Text Search GIN Indexes for Quran Translations
-- ============================================================================

-- English Quran Translation (Saheeh International) FTS
CREATE INDEX IF NOT EXISTS idx_quran_translations_fts_en 
ON public.quran_translations 
USING GIN (to_tsvector('english', translation_text))
WHERE edition_id = 'en.sahih';

-- Urdu Quran Translation (Jalandhari) FTS (using 'simple' dictionary for non-English stemming)
CREATE INDEX IF NOT EXISTS idx_quran_translations_fts_ur 
ON public.quran_translations 
USING GIN (to_tsvector('simple', translation_text))
WHERE edition_id = 'ur.jalandhry';

-- ============================================================================
-- 2. Full-Text Search GIN Indexes for Hadith Narrations
-- ============================================================================

-- Hadith English Translation FTS
CREATE INDEX IF NOT EXISTS idx_hadith_narrations_fts_en 
ON public.hadith_narrations 
USING GIN (to_tsvector('english', translation_english));

-- Hadith Arabic Clean Matn FTS
CREATE INDEX IF NOT EXISTS idx_hadith_narrations_fts_ar 
ON public.hadith_narrations 
USING GIN (to_tsvector('arabic', matn_clean));

-- Hadith English Trigram Search
CREATE INDEX IF NOT EXISTS idx_hadith_narrations_trans_en_trgm 
ON public.hadith_narrations 
USING GIN (translation_english gin_trgm_ops);

-- ============================================================================
-- 3. Full-Text Search GIN Indexes for Duas & Adhkar
-- ============================================================================

-- Duas English Translation FTS
CREATE INDEX IF NOT EXISTS idx_duas_adhkar_fts_en 
ON public.duas_adhkar 
USING GIN (to_tsvector('english', translation_english));

-- Duas Arabic Clean Text FTS
CREATE INDEX IF NOT EXISTS idx_duas_adhkar_fts_ar 
ON public.duas_adhkar 
USING GIN (to_tsvector('arabic', text_clean));

-- Duas Urdu Translation Trigram (where available)
CREATE INDEX IF NOT EXISTS idx_duas_adhkar_trans_ur_trgm 
ON public.duas_adhkar 
USING GIN (translation_urdu gin_trgm_ops)
WHERE translation_urdu IS NOT NULL;

-- ============================================================================
-- 4. Unified Search Stored Function (PostgreSQL-Native FTS & Trigram Combined)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.search_islamic_corpus(
    p_query TEXT,
    p_type_filter TEXT DEFAULT 'all',
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    result_id TEXT,
    result_type TEXT,
    title TEXT,
    reference TEXT,
    canonical_url TEXT,
    arabic_text TEXT,
    translation_text TEXT,
    transliteration TEXT,
    score REAL,
    metadata JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    clean_q TEXT := TRIM(p_query);
    en_query tsquery;
    simple_query tsquery;
BEGIN
    IF clean_q = '' THEN
        RETURN;
    END IF;

    -- Safely prepare tsquery representations
    BEGIN
        en_query := plainto_tsquery('english', clean_q);
        simple_query := plainto_tsquery('simple', clean_q);
    EXCEPTION WHEN OTHERS THEN
        en_query := NULL;
        simple_query := NULL;
    END;

    RETURN QUERY
    WITH matches AS (
        -- 1. Quran Ayahs (Arabic Clean)
        SELECT 
            ('quran:' || a.surah_id || ':' || a.ayah_number)::TEXT AS result_id,
            'quran_ayah'::TEXT AS result_type,
            ('Surah ' || a.surah_id || ':' || a.ayah_number)::TEXT AS title,
            (a.surah_id || ':' || a.ayah_number)::TEXT AS reference,
            ('/quran/' || a.surah_id || '#ayah-' || a.ayah_number)::TEXT AS canonical_url,
            a.text_uthmani AS arabic_text,
            NULL::TEXT AS translation_text,
            NULL::TEXT AS transliteration,
            (similarity(a.text_clean, clean_q) * 100)::REAL AS score,
            jsonb_build_object(
                'surah_id', a.surah_id,
                'ayah_number', a.ayah_number,
                'juz_number', a.juz_number,
                'page_number', a.page_number
            ) AS metadata
        FROM public.quran_ayahs a
        WHERE (p_type_filter = 'all' OR p_type_filter = 'quran_ayah')
          AND (a.text_clean % clean_q OR a.text_clean ILIKE ('%' || clean_q || '%'))

        UNION ALL

        -- 2. Quran Translations (English & Urdu)
        SELECT 
            ('quran_trans:' || t.edition_id || ':' || t.surah_number || ':' || t.ayah_number)::TEXT AS result_id,
            'quran_translation'::TEXT AS result_type,
            ('Surah ' || t.surah_number || ':' || t.ayah_number || ' (' || t.edition_id || ')')::TEXT AS title,
            (t.surah_number || ':' || t.ayah_number)::TEXT AS reference,
            ('/quran/' || t.surah_number || '#ayah-' || t.ayah_number)::TEXT AS canonical_url,
            NULL::TEXT AS arabic_text,
            t.translation_text AS translation_text,
            NULL::TEXT AS transliteration,
            CASE 
                WHEN en_query IS NOT NULL AND to_tsvector('english', t.translation_text) @@ en_query 
                    THEN (ts_rank(to_tsvector('english', t.translation_text), en_query) * 100)::REAL
                ELSE (similarity(t.translation_text, clean_q) * 80)::REAL
            END AS score,
            jsonb_build_object(
                'edition_id', t.edition_id,
                'surah_number', t.surah_number,
                'ayah_number', t.ayah_number
            ) AS metadata
        FROM public.quran_translations t
        WHERE (p_type_filter = 'all' OR p_type_filter = 'quran_translation')
          AND (
              (en_query IS NOT NULL AND to_tsvector('english', t.translation_text) @@ en_query)
              OR (t.translation_text % clean_q)
              OR (t.translation_text ILIKE ('%' || clean_q || '%'))
          )

        UNION ALL

        -- 3. Hadith Narrations (Arabic & English)
        SELECT 
            ('hadith:' || h.collection_id || ':' || h.hadith_number)::TEXT AS result_id,
            'hadith'::TEXT AS result_type,
            (c.name_english || ' #' || h.hadith_number)::TEXT AS title,
            (c.name_english || ' ' || h.hadith_number)::TEXT AS reference,
            ('/hadith/' || h.collection_id || '#hadith-' || h.hadith_number)::TEXT AS canonical_url,
            h.matn_arabic AS arabic_text,
            h.translation_english AS translation_text,
            NULL::TEXT AS transliteration,
            CASE 
                WHEN en_query IS NOT NULL AND to_tsvector('english', h.translation_english) @@ en_query
                    THEN (ts_rank(to_tsvector('english', h.translation_english), en_query) * 100)::REAL
                ELSE (GREATEST(similarity(h.matn_clean, clean_q), similarity(h.translation_english, clean_q)) * 90)::REAL
            END AS score,
            jsonb_build_object(
                'collection_id', h.collection_id,
                'hadith_number', h.hadith_number,
                'grade_level', (SELECT g.grade_level FROM public.hadith_gradings g WHERE g.narration_id = h.id LIMIT 1)
            ) AS metadata
        FROM public.hadith_narrations h
        JOIN public.hadith_collections c ON c.id = h.collection_id
        WHERE (p_type_filter = 'all' OR p_type_filter = 'hadith')
          AND (
              (en_query IS NOT NULL AND to_tsvector('english', h.translation_english) @@ en_query)
              OR (h.matn_clean % clean_q)
              OR (h.translation_english % clean_q)
              OR (h.matn_clean ILIKE ('%' || clean_q || '%'))
              OR (h.translation_english ILIKE ('%' || clean_q || '%'))
          )

        UNION ALL

        -- 4. Duas & Adhkar
        SELECT 
            ('dua:' || d.dua_id)::TEXT AS result_id,
            'dua'::TEXT AS result_type,
            (cat.name_english || ' #' || d.item_number)::TEXT AS title,
            ('Hisn al-Muslim #' || d.item_number)::TEXT AS reference,
            ('/duas/' || cat.slug || '#dua-' || d.dua_id)::TEXT AS canonical_url,
            d.arabic_text AS arabic_text,
            d.translation_english AS translation_text,
            d.transliteration AS transliteration,
            CASE 
                WHEN en_query IS NOT NULL AND to_tsvector('english', d.translation_english) @@ en_query
                    THEN (ts_rank(to_tsvector('english', d.translation_english), en_query) * 100)::REAL
                ELSE (GREATEST(similarity(d.text_clean, clean_q), similarity(d.translation_english, clean_q)) * 85)::REAL
            END AS score,
            jsonb_build_object(
                'dua_id', d.dua_id,
                'category_slug', cat.slug,
                'repeat_count', d.repeat_count,
                'occasion_context', d.occasion_context
            ) AS metadata
        FROM public.duas_adhkar d
        JOIN public.dua_categories cat ON cat.id = d.category_id
        WHERE d.is_current = TRUE
          AND (p_type_filter = 'all' OR p_type_filter = 'dua')
          AND (
              (en_query IS NOT NULL AND to_tsvector('english', d.translation_english) @@ en_query)
              OR (d.text_clean % clean_q)
              OR (d.translation_english % clean_q)
              OR (d.text_clean ILIKE ('%' || clean_q || '%'))
              OR (d.translation_english ILIKE ('%' || clean_q || '%'))
          )
    )
    SELECT *
    FROM matches
    ORDER BY score DESC, result_id ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
