-- Test: quran_engine_test.sql
-- Description: Comprehensive executable test suite verifying Quran text engine schema,
--              cryptographic checksum enforcement, immutability triggers, and RLS policies.
-- Milestone: Phase 2 -> Milestone 2.1

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

-- ============================================================================
-- 2. Test Quran Edition Creation
-- ============================================================================
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';

INSERT INTO public.quran_editions (
    id, name, author, edition_version, script_type, riwayah, numbering_convention,
    source_url, license, attribution_notice, raw_source_sha256, total_surahs, total_ayahs, status
) VALUES (
    'test-uthmani-v1',
    'Test Uthmani Edition',
    'Tanzil Project',
    '1.1',
    'uthmani',
    'Hafs an Asim',
    'Kufan',
    'https://tanzil.net',
    'Creative Commons Attribution 3.0',
    'Test Attribution Notice',
    '203f0f1bf3158b1e5be4ab9f8f6870e570aab6d9a626fe6192a70b75d4afe0fd',
    114,
    6236,
    'published'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. Test Quran Surah Creation
-- ============================================================================
INSERT INTO public.quran_surahs (
    id, slug, name_arabic, name_english, name_transliteration,
    revelation_type, revelation_order, ayahs_count, rukus_count, start_ayah_index
) VALUES (
    1, 'test-al-fatihah', 'الفاتحة', 'The Opening', 'Al-Faatiha',
    'meccan', 5, 7, 1, 0
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. Test Cryptographic Checksum Enforcement
-- ============================================================================

-- 4.1 Valid Checksum & Coherence Insert: Should Succeed
DO $$
DECLARE
    v_text TEXT := 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    v_correct_hash CHAR(64);
BEGIN
    v_correct_hash := encode(digest(convert_to(v_text, 'UTF8'), 'sha256'), 'hex');

    INSERT INTO public.quran_ayahs (
        id, edition_id, surah_id, ayah_number,
        text_source_verbatim, checksum_source_verbatim,
        text_uthmani, checksum_ayah_structural, text_checksum,
        bismillah, text_clean,
        juz_number, hizb_number, rub_number, ruku_number, manzil_number, page_number,
        sajdah, sajdah_type
    ) VALUES (
        999001, 'test-uthmani-v1', 1, 1,
        v_text, v_correct_hash,
        v_text, v_correct_hash, v_correct_hash,
        NULL, 'بسم الله الرحمن الرحيم',
        1, 1, 1, 1, 1, 1,
        false, NULL
    );
END $$;

-- 4.2 Tampered / Forged Checksum Insert: Must Abort with Exception
DO $$
DECLARE
    v_text TEXT := 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    v_correct_hash CHAR(64);
    v_forged_hash CHAR(64) := '0000000000000000000000000000000000000000000000000000000000000000';
    v_caught BOOLEAN := FALSE;
BEGIN
    v_correct_hash := encode(digest(convert_to(v_text, 'UTF8'), 'sha256'), 'hex');
    BEGIN
        INSERT INTO public.quran_ayahs (
            id, edition_id, surah_id, ayah_number,
            text_source_verbatim, checksum_source_verbatim,
            text_uthmani, checksum_ayah_structural, text_checksum,
            bismillah, text_clean,
            juz_number, hizb_number, rub_number, ruku_number, manzil_number, page_number,
            sajdah, sajdah_type
        ) VALUES (
            999002, 'test-uthmani-v1', 1, 2,
            v_text, v_forged_hash,
            v_text, v_correct_hash, v_correct_hash,
            NULL, 'بسم الله الرحمن الرحيم',
            1, 1, 1, 1, 1, 1,
            false, NULL
        );
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST FAILED: Inserting forged checksum was unexpectedly allowed!';
    END IF;
END $$;

-- 4.3 Coherence Violation Insert: Must Abort with Exception
DO $$
DECLARE
    v_text TEXT := 'الٓمٓ';
    v_bismillah TEXT := 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
    v_incoherent_verbatim TEXT := 'نص غير مطابق';
    v_caught BOOLEAN := FALSE;
BEGIN
    BEGIN
        INSERT INTO public.quran_ayahs (
            id, edition_id, surah_id, ayah_number,
            text_source_verbatim, checksum_source_verbatim,
            text_uthmani, checksum_ayah_structural, text_checksum,
            bismillah, text_clean,
            juz_number, hizb_number, rub_number, ruku_number, manzil_number, page_number,
            sajdah, sajdah_type
        ) VALUES (
            999003, 'test-uthmani-v1', 2, 1,
            v_incoherent_verbatim, encode(digest(convert_to(v_incoherent_verbatim, 'UTF8'), 'sha256'), 'hex'),
            v_text, encode(digest(convert_to(v_text, 'UTF8'), 'sha256'), 'hex'), encode(digest(convert_to(v_text, 'UTF8'), 'sha256'), 'hex'),
            v_bismillah, 'الم',
            1, 1, 1, 1, 1, 2,
            false, NULL
        );
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST FAILED: Inserting incoherent text_source_verbatim was unexpectedly allowed!';
    END IF;
END $$;

-- ============================================================================
-- 5. Test Immutability of Published Canonical Scripture
-- ============================================================================

-- 5.1 Direct UPDATE on published Ayah: Must Abort with Exception
DO $$
DECLARE
    v_caught BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.quran_ayahs
        SET text_uthmani = 'مُحَرَّف'
        WHERE id = 999001;
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST FAILED: Direct in-place UPDATE on published Quran Ayah was unexpectedly allowed!';
    END IF;
END $$;

-- 5.2 Direct DELETE on published Ayah: Must Abort with Exception
DO $$
DECLARE
    v_caught BOOLEAN := FALSE;
BEGIN
    BEGIN
        DELETE FROM public.quran_ayahs
        WHERE id = 999001;
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST FAILED: Direct in-place DELETE on published Quran Ayah was unexpectedly allowed!';
    END IF;
END $$;

-- ============================================================================
-- 6. Test RLS Authorization Policies
-- ============================================================================

-- 6.1 Unauthenticated / Anon Reader can SELECT
SET LOCAL ROLE anon;
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.quran_ayahs WHERE id = 999001;
    IF v_count <> 1 THEN
        RAISE EXCEPTION 'TEST FAILED: Anonymous user was denied read access to Quran scripture!';
    END IF;
END $$;

-- 6.2 Ordinary User cannot INSERT into quran_ayahs
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
DO $$
DECLARE
    v_caught BOOLEAN := FALSE;
BEGIN
    BEGIN
        INSERT INTO public.quran_ayahs (
            id, edition_id, surah_id, ayah_number,
            text_source_verbatim, checksum_source_verbatim,
            text_uthmani, checksum_ayah_structural, text_checksum,
            bismillah, text_clean,
            juz_number, hizb_number, rub_number, ruku_number, manzil_number, page_number,
            sajdah, sajdah_type
        ) VALUES (
            999004, 'test-uthmani-v1', 1, 3,
            'test', encode(digest(convert_to('test', 'UTF8'), 'sha256'), 'hex'),
            'test', encode(digest(convert_to('test', 'UTF8'), 'sha256'), 'hex'), encode(digest(convert_to('test', 'UTF8'), 'sha256'), 'hex'),
            NULL, 'test', 1, 1, 1, 1, 1, 1, false, NULL
        );
    EXCEPTION WHEN OTHERS THEN
        v_caught := TRUE;
    END;

    IF NOT v_caught THEN
        RAISE EXCEPTION 'TEST FAILED: Ordinary user was unexpectedly allowed to insert into quran_ayahs!';
    END IF;
END $$;

ROLLBACK;
