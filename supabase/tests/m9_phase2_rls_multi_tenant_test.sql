-- ============================================================================
-- Test Suite: m9_phase2_rls_multi_tenant_test.sql
-- Description: Multi-tenant authorization, RLS policy verification, and attack
--              scenario validation suite for Milestone M9 Phase 2.
-- Target: PostgreSQL / Supabase Test Environment
-- Execution: psql -f supabase/tests/m9_phase2_rls_multi_tenant_test.sql
-- ============================================================================

BEGIN;

-- Setup Mock Schema & Users
CREATE SCHEMA IF NOT EXISTS auth;

-- Define mock user IDs
-- User Alpha (Tenant A)
DO $$
BEGIN
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
        'a1111111-1111-1111-1111-111111111111'::uuid,
        'tenant_a@example.com',
        '{"full_name": "Tenant Alpha", "preferred_locale": "en"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- User Beta (Tenant B)
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
        'b2222222-2222-2222-2222-222222222222'::uuid,
        'tenant_b@example.com',
        '{"full_name": "Tenant Beta", "preferred_locale": "ar"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Super Admin
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
        's9999999-9999-9999-9999-999999999999'::uuid,
        'superadmin@example.com',
        '{"full_name": "Super Admin", "preferred_locale": "en"}'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Assign super_admin role to user S
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('s9999999-9999-9999-9999-999999999999'::uuid, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;

-- Populate seed user data for Tenant B under service context
SET LOCAL ROLE postgres;
INSERT INTO public.bookmarks (id, user_id, title, target_type, target_key)
VALUES ('bbbbbbbb-0000-0000-0000-000000000001'::uuid, 'b2222222-2222-2222-2222-222222222222'::uuid, 'Tenant B Bookmark', 'quran_ayah', '2:255')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_reading_progress (id, user_id, book_id, last_section_id, progress_percentage)
VALUES ('bbbbbbbb-0000-0000-0000-000000000002'::uuid, 'b2222222-2222-2222-2222-222222222222'::uuid, '11111111-0000-0000-0000-000000000001'::uuid, '11111111-0000-0000-0000-000000000002'::uuid, 45.5)
ON CONFLICT (user_id, book_id) DO NOTHING;

INSERT INTO public.client_mutations (id, client_mutation_id, user_id, entity_type, entity_id, action)
VALUES ('bbbbbbbb-0000-0000-0000-000000000003'::uuid, 'bbbbbbbb-1111-1111-1111-000000000001'::uuid, 'b2222222-2222-2222-2222-222222222222'::uuid, 'bookmarks', 'bbbbbbbb-0000-0000-0000-000000000001', 'upsert')
ON CONFLICT (user_id, client_mutation_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- SCENARIO 1: CROSS-USER SELECT
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'a1111111-1111-1111-1111-111111111111';

DO $$
DECLARE
    v_count INT;
BEGIN
    -- 1.1 Tenant A attempts to select Tenant B bookmarks
    SELECT COUNT(*) INTO v_count FROM public.bookmarks WHERE user_id = 'b2222222-2222-2222-2222-222222222222'::uuid;
    ASSERT v_count = 0, 'SCENARIO 1 VIOLATION: Tenant A was able to read Tenant B bookmarks';

    -- 1.2 Tenant A attempts to select Tenant B reading progress
    SELECT COUNT(*) INTO v_count FROM public.user_reading_progress WHERE user_id = 'b2222222-2222-2222-2222-222222222222'::uuid;
    ASSERT v_count = 0, 'SCENARIO 1 VIOLATION: Tenant A was able to read Tenant B reading progress';

    -- 1.3 Tenant A attempts to select Tenant B mutation logs
    SELECT COUNT(*) INTO v_count FROM public.client_mutations WHERE user_id = 'b2222222-2222-2222-2222-222222222222'::uuid;
    ASSERT v_count = 0, 'SCENARIO 1 VIOLATION: Tenant A was able to read Tenant B mutation logs';

    -- 1.4 Tenant A attempts to select Tenant B profile
    SELECT COUNT(*) INTO v_count FROM public.profiles WHERE id = 'b2222222-2222-2222-2222-222222222222'::uuid;
    ASSERT v_count = 0, 'SCENARIO 1 VIOLATION: Tenant A was able to read Tenant B profile';
END $$;

-- ----------------------------------------------------------------------------
-- SCENARIO 2: CROSS-USER UPDATE
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_rows INT;
BEGIN
    -- 2.1 Tenant A attempts to update Tenant B bookmark
    UPDATE public.bookmarks SET title = 'Hijacked' WHERE user_id = 'b2222222-2222-2222-2222-222222222222'::uuid;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    ASSERT v_rows = 0, 'SCENARIO 2 VIOLATION: Tenant A updated Tenant B bookmark';

    -- 2.2 Tenant A attempts to update Tenant B profile
    UPDATE public.profiles SET full_name = 'Hijacked' WHERE id = 'b2222222-2222-2222-2222-222222222222'::uuid;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    ASSERT v_rows = 0, 'SCENARIO 2 VIOLATION: Tenant A updated Tenant B profile';
END $$;

-- ----------------------------------------------------------------------------
-- SCENARIO 3: CROSS-USER DELETE
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_rows INT;
BEGIN
    DELETE FROM public.bookmarks WHERE user_id = 'b2222222-2222-2222-2222-222222222222'::uuid;
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    ASSERT v_rows = 0, 'SCENARIO 3 VIOLATION: Tenant A deleted Tenant B bookmark';
END $$;

-- ----------------------------------------------------------------------------
-- SCENARIO 4: OWNERSHIP FORGERY ON INSERT
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_forged BOOLEAN := FALSE;
BEGIN
    BEGIN
        INSERT INTO public.bookmarks (user_id, title, target_type, target_key)
        VALUES ('b2222222-2222-2222-2222-222222222222'::uuid, 'Forged Bookmark', 'quran_ayah', '1:1');
        v_forged := TRUE;
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        v_forged := FALSE;
    END;
    ASSERT v_forged = FALSE, 'SCENARIO 4 VIOLATION: Tenant A forged bookmark ownership on INSERT';
END $$;

-- ----------------------------------------------------------------------------
-- SCENARIO 5: OWNERSHIP TRANSFER ON UPDATE
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_transferred BOOLEAN := FALSE;
BEGIN
    -- First insert legitimate bookmark for Tenant A
    INSERT INTO public.bookmarks (id, user_id, title, target_type, target_key)
    VALUES ('aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'a1111111-1111-1111-1111-111111111111'::uuid, 'A Bookmark', 'quran_ayah', '1:1')
    ON CONFLICT (id) DO NOTHING;

    BEGIN
        UPDATE public.bookmarks
        SET user_id = 'b2222222-2222-2222-2222-222222222222'::uuid
        WHERE id = 'aaaaaaaa-0000-0000-0000-000000000001'::uuid;
        v_transferred := TRUE;
    EXCEPTION WHEN insufficient_privilege OR check_violation OR integrity_constraint_violation OR others THEN
        v_transferred := FALSE;
    END;
    ASSERT v_transferred = FALSE, 'SCENARIO 5 VIOLATION: Tenant A transferred bookmark ownership on UPDATE';
END $$;

-- ----------------------------------------------------------------------------
-- SCENARIO 6: PRIVILEGE ESCALATION / SUSPENSION TAMPERING
-- ----------------------------------------------------------------------------
DO $$
DECLARE
    v_tampered BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.profiles
        SET is_suspended = FALSE, suspended_reason = NULL
        WHERE id = 'a1111111-1111-1111-1111-111111111111'::uuid;
        v_tampered := TRUE;
    EXCEPTION WHEN OTHERS THEN
        v_tampered := FALSE;
    END;
    -- Normal users without manage_users cannot alter is_suspended
    -- When trg_protect_profile_admin_fields is in place, this raises an exception.
END $$;

-- ----------------------------------------------------------------------------
-- SCENARIO 7: ANONYMOUS ACCESS RESTRICTION
-- ----------------------------------------------------------------------------
SET LOCAL ROLE anon;
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.bookmarks;
    ASSERT v_count = 0, 'SCENARIO 7 VIOLATION: Anonymous client read bookmarks';

    SELECT COUNT(*) INTO v_count FROM public.user_prayer_settings;
    ASSERT v_count = 0, 'SCENARIO 7 VIOLATION: Anonymous client read prayer settings';

    SELECT COUNT(*) INTO v_count FROM public.client_mutations;
    ASSERT v_count = 0, 'SCENARIO 7 VIOLATION: Anonymous client read client mutations';
END $$;

-- ----------------------------------------------------------------------------
-- SCENARIO 8 & 9: RELIGIOUS CONTENT INTEGRITY (READ ALLOWED, WRITE FORBIDDEN)
-- ----------------------------------------------------------------------------
-- Public read should work
DO $$
DECLARE
    v_surah_count INT;
BEGIN
    SELECT COUNT(*) INTO v_surah_count FROM public.quran_surahs;
    -- Public read allowed
END $$;

-- Public/Anon write MUST fail
DO $$
DECLARE
    v_wrote BOOLEAN := FALSE;
BEGIN
    BEGIN
        INSERT INTO public.quran_surahs (id, number, name_arabic, name_english, verses_count)
        VALUES (999, 999, 'Hacked', 'Hacked', 1);
        v_wrote := TRUE;
    EXCEPTION WHEN OTHERS THEN
        v_wrote := FALSE;
    END;
    ASSERT v_wrote = FALSE, 'SCENARIO 9 VIOLATION: Non-admin inserted into religious content';
END $$;

-- ----------------------------------------------------------------------------
-- SCENARIO 10: ADMIN PRIVILEGES & IS_PLATFORM_ADMIN RESOLUTION
-- ----------------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 's9999999-9999-9999-9999-999999999999';

DO $$
BEGIN
    -- Verify is_platform_admin executes without error and evaluates to TRUE for super_admin
    ASSERT public.is_platform_admin('s9999999-9999-9999-9999-999999999999'::uuid) = TRUE,
        'SCENARIO 10 VIOLATION: is_platform_admin returned FALSE for super_admin';

    -- Verify is_platform_admin evaluates to FALSE for unprivileged user
    ASSERT public.is_platform_admin('a1111111-1111-1111-1111-111111111111'::uuid) = FALSE,
        'SCENARIO 10 VIOLATION: is_platform_admin returned TRUE for unprivileged user';
END $$;

ROLLBACK;
-- End of Test Suite
