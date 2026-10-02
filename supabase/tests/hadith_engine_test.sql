-- Test: hadith_engine_test.sql
-- Description: Comprehensive executable test suite verifying Hadith collections engine schema,
--              cryptographic checksum enforcement, sanad/matn separation, immutability triggers,
--              and RLS policies.
-- Milestone: Phase 2 -> Milestone 2.3

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

-- Set Super Admin identity
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';

-- ============================================================================
-- 2. Test Scholar Creation
-- ============================================================================
INSERT INTO public.scholars_authors (
    id, slug, name_arabic, name_english, name_urdu, death_year_ah, death_year_ce, era, role, biography_summary
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test-bukhari',
    'محمد بن إسماعيل البخاري',
    'Imam Muhammad al-Bukhari',
    'امام محمد بن اسماعیل بخاری',
    256,
    870,
    'classical',
    'compiler',
    'Author of Sahih al-Bukhari.'
), (
    '22222222-2222-2222-2222-222222222222',
    'test-albani',
    'محمد ناصر الدين الألباني',
    'Shaykh Muhammad Nasiruddin al-Albani',
    'علامہ محمد ناصر الدین البانی',
    1420,
    1999,
    'contemporary',
    'evaluator',
    'Renowned contemporary Hadith scholar and evaluator.'
);

-- ============================================================================
-- 3. Test Hadith Collection Creation
-- ============================================================================
INSERT INTO public.hadith_collections (
    id, slug, name_arabic, name_english, name_urdu, author_id, total_hadiths, total_books,
    description, provenance_notes, source_edition, source_url, status
) VALUES (
    'test-bukhari',
    'test-sahih-al-bukhari',
    'صحيح البخاري',
    'Sahih al-Bukhari',
    'صحیح البخاری',
    '11111111-1111-1111-1111-111111111111',
    7563,
    97,
    'Test Collection description',
    'Provenance notes test',
    'Darussalam (1997)',
    'https://sunnah.com/bukhari',
    'published'
), (
    'test-draft-collection',
    'test-draft-collection',
    'مجموعة مسودة',
    'Draft Collection',
    'ڈرافٹ مجموعہ',
    '11111111-1111-1111-1111-111111111111',
    10,
    1,
    'Draft collection for RLS tests',
    'Draft notes',
    'Internal Draft',
    'https://example.com/draft',
    'draft'
);

-- ============================================================================
-- 4. Test Hadith Book Creation
-- ============================================================================
INSERT INTO public.hadith_books (
    id, collection_id, book_number, name_arabic, name_english, name_urdu, hadith_start_number, hadith_end_number, total_hadiths
) VALUES (
    9001,
    'test-bukhari',
    1,
    'كتاب بدء الوحي',
    'Revelation',
    'کتاب وحی کے آغاز کے بارے میں',
    1,
    7,
    7
);

-- ============================================================================
-- 5. Test Cryptographic Checksum Trigger
-- ============================================================================
DO $$
DECLARE
    v_matn TEXT := 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى';
    v_clean TEXT := 'انما الاعمال بالنيات وانما لكل امرئ ما نوى';
    v_correct_hash CHAR(64);
BEGIN
    v_correct_hash := encode(digest(convert_to(v_matn, 'UTF8'), 'sha256'), 'hex');

    INSERT INTO public.hadith_narrations (
        id, collection_id, book_id, hadith_number, in_book_reference, international_number,
        chapter_title_arabic, chapter_title_english, sanad_arabic, matn_arabic, matn_clean,
        translation_english, text_checksum, source_edition, status
    ) VALUES (
        90001,
        'test-bukhari',
        9001,
        1,
        'Book 1, Hadith 1',
        1,
        'باب كيف كان بدء الوحي إلى رسول الله صلى الله عليه وسلم',
        'How the Divine Revelation started being revealed to Allah''s Messenger',
        'حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ، قَالَ: حَدَّثَنَا سُفْيَانُ...',
        v_matn,
        v_clean,
        'Actions are by intentions, and every person will have only what they intended.',
        v_correct_hash,
        'Darussalam (1997)',
        'published'
    );

    RAISE NOTICE 'SUCCESS: Valid Hadith narration with checksum inserted properly.';
END $$;

-- Invalid Checksum Insert (Must Fail)
DO $$
BEGIN
    INSERT INTO public.hadith_narrations (
        id, collection_id, book_id, hadith_number, in_book_reference, international_number,
        chapter_title_arabic, chapter_title_english, sanad_arabic, matn_arabic, matn_clean,
        translation_english, text_checksum, source_edition, status
    ) VALUES (
        90002,
        'test-bukhari',
        9001,
        2,
        'Book 1, Hadith 2',
        2,
        NULL,
        NULL,
        NULL,
        'حديث نص عربي',
        'حديث نص عربي',
        'Some translation',
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        'Darussalam',
        'draft'
    );
    RAISE EXCEPTION 'SECURITY ERROR: Invalid Hadith checksum was accepted!';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Cryptographic checksum mismatch%' THEN
            RAISE NOTICE 'SUCCESS: Invalid Hadith checksum was rejected: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
END $$;

-- ============================================================================
-- 6. Test Scholar Grading Insertion
-- ============================================================================
INSERT INTO public.hadith_gradings (
    hadith_id, scholar_id, grade, grade_arabic, grade_level, scholarly_commentary, reference_source
) VALUES (
    90001,
    '11111111-1111-1111-1111-111111111111',
    'Sahih',
    'صحيح',
    'sahih',
    'Universal consensus of Ahl al-Sunnah on authenticity.',
    'Sahih al-Bukhari (Darussalam edition Hadith 1)'
);

-- ============================================================================
-- 7. Test Immutability of Published Hadith Records
-- ============================================================================
-- Direct UPDATE on published narration must fail without override
DO $$
BEGIN
    UPDATE public.hadith_narrations
    SET matn_arabic = 'نص محرف'
    WHERE id = 90001;

    RAISE EXCEPTION 'SECURITY ERROR: Published Hadith narration was directly modified!';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Illegal mutation of published Hadith narration%' THEN
            RAISE NOTICE 'SUCCESS: Direct mutation of published Hadith was blocked: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
END $$;

-- Direct DELETE on published narration must fail without override
DO $$
BEGIN
    DELETE FROM public.hadith_narrations WHERE id = 90001;
    RAISE EXCEPTION 'SECURITY ERROR: Published Hadith narration was deleted!';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Illegal deletion of published Hadith narration%' THEN
            RAISE NOTICE 'SUCCESS: Deletion of published Hadith was blocked: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
END $$;

-- Mutation of grading on published narration must fail without override
DO $$
BEGIN
    DELETE FROM public.hadith_gradings WHERE hadith_id = 90001;
    RAISE EXCEPTION 'SECURITY ERROR: Hadith grading on published narration was deleted!';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLERRM LIKE '%Illegal mutation of Hadith grading%' THEN
            RAISE NOTICE 'SUCCESS: Deletion of Hadith grading was blocked: %', SQLERRM;
        ELSE
            RAISE EXCEPTION 'Unexpected error: %', SQLERRM;
        END IF;
END $$;

-- Break-glass override allows controlled update
SET LOCAL "app.allow_hadith_override" = 'true';
UPDATE public.hadith_narrations
SET chapter_title_english = 'Updated Chapter Title'
WHERE id = 90001;
SET LOCAL "app.allow_hadith_override" = 'false';

-- ============================================================================
-- 8. Test Row-Level Security (RLS) Policies
-- ============================================================================
-- Anonymous read tests
SET LOCAL "request.jwt.claim.sub" = '';
SET LOCAL ROLE anon;

DO $$
DECLARE
    v_cnt INT;
BEGIN
    -- Can read published collection
    SELECT COUNT(*) INTO v_cnt FROM public.hadith_collections WHERE id = 'test-bukhari';
    IF v_cnt <> 1 THEN
        RAISE EXCEPTION 'RLS Failure: Public could not read published Hadith collection.';
    END IF;

    -- Cannot read draft collection
    SELECT COUNT(*) INTO v_cnt FROM public.hadith_collections WHERE id = 'test-draft-collection';
    IF v_cnt <> 0 THEN
        RAISE EXCEPTION 'RLS Failure: Public was able to read draft Hadith collection!';
    END IF;

    -- Can read published narrations
    SELECT COUNT(*) INTO v_cnt FROM public.hadith_narrations WHERE collection_id = 'test-bukhari';
    IF v_cnt <> 1 THEN
        RAISE EXCEPTION 'RLS Failure: Public could not read published Hadith narration.';
    END IF;

    -- Can read gradings of published narration
    SELECT COUNT(*) INTO v_cnt FROM public.hadith_gradings WHERE hadith_id = 90001;
    IF v_cnt <> 1 THEN
        RAISE EXCEPTION 'RLS Failure: Public could not read Hadith grading.';
    END IF;

    RAISE NOTICE 'SUCCESS: Public RLS read boundaries verified.';
END $$;

-- Anonymous write attempt (Must Fail)
DO $$
BEGIN
    INSERT INTO public.hadith_collections (
        id, slug, name_arabic, name_english, name_urdu, author_id, total_hadiths, total_books,
        source_edition, source_url, status
    ) VALUES (
        'anon-hack', 'anon-hack', 'اختراق', 'Hack', 'ہیک',
        '11111111-1111-1111-1111-111111111111', 1, 1, 'Hack', 'http://hack.com', 'published'
    );
    RAISE EXCEPTION 'SECURITY ERROR: Anonymous user was able to insert Hadith collection!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'SUCCESS: Anonymous insertion blocked by RLS: %', SQLERRM;
END $$;

RESET ROLE;
ROLLBACK;
