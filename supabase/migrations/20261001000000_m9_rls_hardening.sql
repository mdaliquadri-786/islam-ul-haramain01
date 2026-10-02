-- ============================================================================
-- Migration: 20261001000000_m9_rls_hardening.sql
-- Description: M9 Phase 2 Row Level Security (RLS) & Multi-Tenant Authorization Hardening
-- Scope: Additive hardening:
--   1. Define missing public.is_platform_admin function (referenced in audio, tafsir, books RLS)
--   2. Enforce admin-only modification on account suspension fields in public.profiles
--   3. Add defense-in-depth ownership immutability trigger on public.user_prayer_settings
--   4. Idempotently ensure RLS enablement on all user and administrative tables
-- Note: Strictly additive; does NOT modify or drop existing migrations or policies.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Create missing public.is_platform_admin function
-- ----------------------------------------------------------------------------
-- Referenced in:
--   - 20260924000003_audio_streaming_reciters.sql (audio_reciters, audio_surah_files)
--   - 20260924000004_tafsir_comparative_viewer.sql (tafsir_works, tafsir_editions, tafsir_entries)
--   - 20260924000005_digital_islamic_books_ereader.sql (books, book_editions, book_volumes, book_sections, book_contents)
CREATE OR REPLACE FUNCTION public.is_platform_admin(lookup_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF lookup_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Delegates to canonical is_admin check defined in 20260925000001
    RETURN public.is_admin(lookup_uid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated, anon;

-- ----------------------------------------------------------------------------
-- 2. Privilege Escalation Prevention on public.profiles (Suspension Tampering)
-- ----------------------------------------------------------------------------
-- Ordinary users must NOT be able to modify is_suspended, suspended_at, or suspended_reason
-- on their own profiles. Only administrative callers holding manage_users or super_admin may alter them.
CREATE OR REPLACE FUNCTION public.protect_profile_admin_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.is_suspended IS DISTINCT FROM NEW.is_suspended OR
        OLD.suspended_at IS DISTINCT FROM NEW.suspended_at OR
        OLD.suspended_reason IS DISTINCT FROM NEW.suspended_reason) THEN
        IF NOT (
            public.has_permission(auth.uid(), 'manage_users') OR
            public.is_super_admin(auth.uid()) OR
            auth.uid() IS NULL -- allow service_role / background migration maintenance
        ) THEN
            RAISE EXCEPTION 'Unauthorized: Only platform administrators can modify account suspension status.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_profile_admin_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_admin_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_admin_fields();

-- ----------------------------------------------------------------------------
-- 3. Ownership Immutability Trigger on public.user_prayer_settings
-- ----------------------------------------------------------------------------
-- Defense-in-depth: Rejection of any user_id change at the database trigger layer,
-- matching the security architecture of bookmarks and reading_progress.
CREATE OR REPLACE FUNCTION public.prevent_prayer_settings_ownership_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Ownership Immutability Violation: Changing the owner (user_id) of prayer settings is strictly prohibited.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_prevent_prayer_settings_ownership_mutation ON public.user_prayer_settings;
CREATE TRIGGER trg_prevent_prayer_settings_ownership_mutation
BEFORE UPDATE ON public.user_prayer_settings
FOR EACH ROW EXECUTE FUNCTION public.prevent_prayer_settings_ownership_mutation();

-- ----------------------------------------------------------------------------
-- 4. Idempotently Ensure RLS is Enabled Across Core Tables
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prayer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
