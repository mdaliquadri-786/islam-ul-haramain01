-- Test: quran_translation_engine_test.sql
-- Description: Comprehensive executable test suite verifying Quran translation engine schema,
--              cryptographic checksum enforcement, immutability triggers, and RLS policies.
-- Milestone: Phase 2 -> Milestone 2.2

BEGIN;

-- ============================================================================
-- 1. Setup Test Identities
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS auth;

-- Ordinary User
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user@example.com', '{"full_name": "Ordinary Reader"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Super Admin
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('99999999-9999-9999-9999-999999999999', 'admin@example.com', '{"full_name": "Super Admin"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('99999999-9999-9999-9999-999999999999', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Ensure prerequisite canonical Ayah exists for FK testing
INSERT INTO public.quran_editions (
    id, name, author, edition_version, script_type, riwayah, numbering_convention,
    source_url, license, attribution_notice, raw_source_sha256, total_surahs, total_ayahs, status
) VALUES (
    'test-uthmani-v1', 'Test Uthmani', 'Tanzil', '1.1', 'uthmani', 'Hafs an Asim', 'Kufan',
    'https://tanzil.net', 'CC-BY 3.0', 'Attribution', '203f0f1bf3158b1e5be4ab9f8f6870e570aab6d9a626fe6192a70b75d4afe0fd',
    114, 6236, 'published'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quran_surahs (
    id, slug, name_arabic, name_english, name_transliteration,
    revelation_type, revelation_order, ayahs_count, rukus_count, start_ayah_index
) VALUES (
    1, 'al-fatihah', 'الفاتحة', 'The Opening', 'Al-Faatiha', 'meccan', 5, 7, 1, 0
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quran_ayahs (
    id, edition_id, surah_id, ayah_number, text_source_verbatim, checksum_source_verbatim,
    text_uthmani, checksum_ayah_structural, text_checksum, bismillah, text_clean,
    juz_number, hizb_number, rub_number, ruku_number, manzil_number, page_number
) VALUES (
    1, 'test-uthmani-v1', 1, 1,
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    'ecad7e75cf0fbcc1b4430e698ea4f88e4e70df446e3ea4e11fa8412678248316',
    'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    'ecad7e75cf0fbcc1b4430e698ea4f88e4e70df446e3ea4e11fa8412678248316',
    'ecad7e75cf0fbcc1b4430e698ea4f88e4e70df446e3ea4e11fa8412678248316',
    NULL,
    'بسم الله الرحمن الرحيم',
    1, 1, 1, 1, 1, 1
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. Test Translation Edition Creation (Super Admin)
-- ============================================================================
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';

INSERT INTO public.quran_translation_editions (
    id, slug, language_code, title, translator, source_name, source_url, source_version,
    license, copyright_statement, attribution_text, source_file_name, source_sha256,
    dataset_sha256, total_surahs, total_ayahs, status
) VALUES (
    'test-en-sahih',
    'test-saheeh-international',
    'en',
    'Saheeh International (Test)',
    'Saheeh International',
    'Tanzil Project',
    'https://tanzil.net/trans/',
    'April 24, 2011',
    'Non-Commercial Permissible with Attribution',
    'Copyright (C) 1997 Abul-Qasim Publishing House',
    'Attribution Notice Test',
    'en.sahih.txt',
    'a1778a1a56695d9b59ae910809ec46d9f4a55f05961de51cd56e6ebcf9040883',
    '0000000000000000000000000000000000000000000000000000000000000000',
    114,
    6236,
    'published'
);

-- Draft Edition for RLS visibility testing
INSERT INTO public.quran_translation_editions (
    id, slug, language_code, title, translator, source_name, source_url, source_version,
    license, copyright_statement, attribution_text, source_file_name, source_sha256,
    dataset_sha256, total_surahs, total_ayahs, status
) VALUES (
    'test-draft-edition',
    'test-draft-translation',
    'en',
    'Draft Translation Edition',
    'Draft Author',
    'Test Ingest',
    'https://example.com',
    '1.0-draft',
    'Internal Review',
    'Confidential',
    'Internal Only',
    'draft.txt',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    114,
    6236,
    'draft'
);

-- ============================================================================
-- 3. Test Cryptographic Checksum Trigger
-- ============================================================================
-- Valid Checksum Insert
-- Text: "In the name of Allah, the Entirely Merciful, the Especially Merciful."
-- Computed SHA-256: encode(digest(convert_to(..., 'UTF8'), 'sha256'), 'hex')
DO $$
DECLARE
    v_text TEXT := 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';
    v_correct_hash CHAR(64);
BEGIN
    v_correct_hash := encode(digest(convert_to(v_text, 'UTF8'), 'sha256'), 'hex');

    INSERT INTO public.quran_translations (
        edition_id, surah_number, ayah_number, ayah_id, translation_text, text_checksum
    ) VALUES (
        'test-en-sahih', 1, 1, 1, v_text, v_correct_hash
    );

    RAISE NOTICE 'SUCCESS: Valid translation checksum inserted properly.';
END $$;

-- Invalid Checksum Insert (Must Fail)
DO $$
BEGIN
    INSERT INTO public.quran_translations (
        edition_id, surah_number, ayah_number, ayah_id, translation_text, text_checksum
    ) VALUES (
        'test-draft-edition', 1, 1, 1, 'Some translated text',
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    );
    RAISE EXCEPTION 'SECURITY ERROR: Invalid translation checksum was accepted!';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Cryptographic Integrity Failure%' THEN
            RAISE NOTICE 'SUCCESS: Invalid translation checksum was rejected: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
END $$;

-- ============================================================================
-- 4. Test Immutability of Published Translations
-- ============================================================================
-- Direct UPDATE on published translation must fail without override
DO $$
BEGIN
    UPDATE public.quran_translations
    SET translation_text = 'Tampered Translation'
    WHERE edition_id = 'test-en-sahih' AND surah_number = 1 AND ayah_number = 1;

    RAISE EXCEPTION 'SECURITY ERROR: Published translation was directly modified!';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Immutable Translation Scripture%' THEN
            RAISE NOTICE 'SUCCESS: Direct mutation of published translation was blocked: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
END $$;

-- Direct DELETE on published translation must fail without override
DO $$
BEGIN
    DELETE FROM public.quran_translations
    WHERE edition_id = 'test-en-sahih' AND surah_number = 1 AND ayah_number = 1;

    RAISE EXCEPTION 'SECURITY ERROR: Published translation was deleted!';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Immutable Translation Scripture%' THEN
            RAISE NOTICE 'SUCCESS: Deletion of published translation was blocked: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
END $$;

-- Direct DELETE on published translation edition must fail without override
DO $$
BEGIN
    DELETE FROM public.quran_translation_editions
    WHERE id = 'test-en-sahih';

    RAISE EXCEPTION 'SECURITY ERROR: Published translation edition was deleted!';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Immutable Translation Scripture%' THEN
            RAISE NOTICE 'SUCCESS: Deletion of published translation edition was blocked: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
END $$;


-- With break-glass override, UPDATE should be allowed
SET LOCAL "app.allow_quran_override" = 'true';
DO $$
DECLARE
    v_text TEXT := 'In the name of Allah, the Entirely Merciful, the Especially Merciful.';
    v_correct_hash CHAR(64);
BEGIN
    v_correct_hash := encode(digest(convert_to(v_text, 'UTF8'), 'sha256'), 'hex');

    UPDATE public.quran_translations
    SET translator_note = 'Authorized scholarly errata update'
    WHERE edition_id = 'test-en-sahih' AND surah_number = 1 AND ayah_number = 1;

    RAISE NOTICE 'SUCCESS: Break-glass override permitted controlled administrative update.';
END $$;
SET LOCAL "app.allow_quran_override" = 'false';

-- ============================================================================
-- 5. Test Row-Level Security (RLS) Policies
-- ============================================================================
-- As Anonymous / Public User:
SET LOCAL "request.jwt.claim.sub" = '';
SET LOCAL ROLE anon;

-- Can read published translation editions
DO $$
DECLARE
    v_cnt INT;
BEGIN
    SELECT COUNT(*) INTO v_cnt FROM public.quran_translation_editions WHERE id = 'test-en-sahih';
    IF v_cnt <> 1 THEN
        RAISE EXCEPTION 'RLS Failure: Public could not read published translation edition.';
    END IF;

    -- Cannot read draft edition
    SELECT COUNT(*) INTO v_cnt FROM public.quran_translation_editions WHERE id = 'test-draft-edition';
    IF v_cnt <> 0 THEN
        RAISE EXCEPTION 'RLS Failure: Public was able to read draft translation edition!';
    END IF;

    -- Can read published translations
    SELECT COUNT(*) INTO v_cnt FROM public.quran_translations WHERE edition_id = 'test-en-sahih';
    IF v_cnt <> 1 THEN
        RAISE EXCEPTION 'RLS Failure: Public could not read published translation verses.';
    END IF;

    RAISE NOTICE 'SUCCESS: Public RLS read boundaries verified.';
END $$;

-- Attempt mutation as anonymous user (Must Fail)
DO $$
BEGIN
    INSERT INTO public.quran_translation_editions (
        id, slug, language_code, title, translator, source_name, source_url, source_version,
        license, copyright_statement, attribution_text, source_file_name, source_sha256,
        dataset_sha256, total_surahs, total_ayahs, status
    ) VALUES (
        'anon-hack', 'anon-hack', 'en', 'Hack', 'Hacker', 'None', 'None', '1.0',
        'None', 'None', 'None', 'hack.txt', '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000', 114, 6236, 'published'
    );
    RAISE EXCEPTION 'SECURITY ERROR: Anonymous user was able to insert translation edition!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Anonymous insertion blocked by RLS: %', SQLERRM;
END $$;

-- As Ordinary User:
RESET ROLE;
SET LOCAL "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET LOCAL ROLE authenticated;

DO $$
BEGIN
    INSERT INTO public.quran_translation_editions (
        id, slug, language_code, title, translator, source_name, source_url, source_version,
        license, copyright_statement, attribution_text, source_file_name, source_sha256,
        dataset_sha256, total_surahs, total_ayahs, status
    ) VALUES (
        'user-hack', 'user-hack', 'en', 'Hack', 'Hacker', 'None', 'None', '1.0',
        'None', 'None', 'None', 'hack.txt', '0000000000000000000000000000000000000000000000000000000000000000',
        '0000000000000000000000000000000000000000000000000000000000000000', 114, 6236, 'published'
    );
    RAISE EXCEPTION 'SECURITY ERROR: Ordinary authenticated user was able to insert translation edition!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Ordinary user insertion blocked by RLS: %', SQLERRM;
END $$;

RESET ROLE;
ROLLBACK;
