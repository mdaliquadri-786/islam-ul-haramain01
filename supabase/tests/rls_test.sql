-- Test: rls_test.sql
-- Description: Executable test suite for Row Level Security (RLS) policies and security helper functions.
-- Note: Designed for execution against a PostgreSQL / Supabase instance with auth schema.
-- Milestone: M1.2 — Database Core, Auth & RLS (Security Hardened)

BEGIN;

-- 1. Setup Mock Schema & Users
CREATE SCHEMA IF NOT EXISTS auth;

-- Create mock user A (Regular User)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'user_a@example.com',
    '{"full_name": "User Alpha", "preferred_locale": "en"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create mock user B (Regular User)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'user_b@example.com',
    '{"full_name": "User Beta", "preferred_locale": "ar"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Create mock user S (Super Admin)
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
    '99999999-9999-9999-9999-999999999999',
    'admin@example.com',
    '{"full_name": "Super Admin", "preferred_locale": "en"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Grant super_admin to user S
INSERT INTO public.user_roles (user_id, role)
VALUES ('99999999-9999-9999-9999-999999999999', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Verify Auto-Provisioning on Signup
DO $$
BEGIN
    ASSERT (SELECT COUNT(*) FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111') = 1,
        'Auto-provisioning: Profile missing for User A';
    ASSERT (SELECT role FROM public.user_roles WHERE user_id = '11111111-1111-1111-1111-111111111111') = 'user',
        'Auto-provisioning: Default role missing for User A';
    ASSERT (SELECT COUNT(*) FROM public.user_prayer_settings WHERE user_id = '11111111-1111-1111-1111-111111111111') = 1,
        'Auto-provisioning: Prayer settings missing for User A';
END $$;

-- 3. Simulate Session as User A
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

-- 3.1 Verify User A cannot read User B's profile
DO $$
DECLARE v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.profiles WHERE id = '22222222-2222-2222-2222-222222222222';
    ASSERT v_count = 0, 'SECURITY VIOLATION: User A read User B profile';
END $$;

-- 3.2 Verify User A cannot update User B's profile
DO $$
DECLARE v_rows INT;
BEGIN
    UPDATE public.profiles SET full_name = 'Hacked' WHERE id = '22222222-2222-2222-2222-222222222222';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    ASSERT v_rows = 0, 'SECURITY VIOLATION: User A updated User B profile';
END $$;

-- 3.3 Verify User A cannot read User B's prayer settings
DO $$
DECLARE v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.user_prayer_settings WHERE user_id = '22222222-2222-2222-2222-222222222222';
    ASSERT v_count = 0, 'SECURITY VIOLATION: User A read User B prayer settings';
END $$;

-- 3.4 Verify User A cannot modify their own role (Privilege Escalation Prevention)
DO $$
DECLARE v_escalated BOOLEAN := FALSE;
BEGIN
    BEGIN
        INSERT INTO public.user_roles (user_id, role)
        VALUES ('11111111-1111-1111-1111-111111111111', 'super_admin');
        v_escalated := TRUE;
    EXCEPTION WHEN insufficient_privilege OR check_violation THEN
        v_escalated := FALSE;
    END;
    -- In PostgreSQL RLS, if with_check fails or no insert policy matches, insert row count is 0 or error
    ASSERT (SELECT COUNT(*) FROM public.user_roles WHERE user_id = '11111111-1111-1111-1111-111111111111' AND role = 'super_admin') = 0,
        'SECURITY VIOLATION: User A escalated to super_admin';
END $$;

-- 3.5 Verify User A cannot modify another user's role
DO $$
DECLARE v_modified BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.user_roles SET role = 'super_admin' WHERE user_id = '22222222-2222-2222-2222-222222222222';
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    ASSERT (SELECT COUNT(*) FROM public.user_roles WHERE user_id = '22222222-2222-2222-2222-222222222222' AND role = 'super_admin') = 0,
        'SECURITY VIOLATION: User A modified User B role';
END $$;

-- 3.6 Verify normal user cannot probe other users' roles via is_super_admin helper
DO $$
BEGIN
    -- User A probing User S (who IS super admin) must return FALSE because User A has no privilege to probe others
    ASSERT (SELECT public.is_super_admin('99999999-9999-9999-9999-999999999999')) = FALSE,
        'SECURITY VIOLATION: Unprivileged user probed another user role status';
    -- User A checking own status returns FALSE
    ASSERT (SELECT public.is_super_admin('11111111-1111-1111-1111-111111111111')) = FALSE,
        'User A should not be super_admin';
END $$;

-- 4. Simulate Session as Super Admin (User S)
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';

-- 4.1 Verify Super Admin can check own status without RLS recursion
DO $$
BEGIN
    ASSERT (SELECT public.is_super_admin('99999999-9999-9999-9999-999999999999')) = TRUE,
        'Super Admin should be recognized as super_admin';
END $$;

-- 4.2 Verify Super Admin can assign role to User B without RLS recursion
DO $$
BEGIN
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES ('22222222-2222-2222-2222-222222222222', 'scholar_reviewer', '99999999-9999-9999-9999-999999999999')
    ON CONFLICT (user_id, role) DO NOTHING;

    ASSERT (SELECT COUNT(*) FROM public.user_roles WHERE user_id = '22222222-2222-2222-2222-222222222222' AND role = 'scholar_reviewer') = 1,
        'Super Admin role assignment failed';
END $$;

-- Rollback mock test transaction so database remains pristine
ROLLBACK;
