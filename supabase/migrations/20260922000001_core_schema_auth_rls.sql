-- Migration: 20260922000001_core_schema_auth_rls.sql
-- Description: Core schema extensions, profiles, user_roles, user_prayer_settings, and strict Row Level Security (RLS).
-- Milestone: M1.2 — Database Core, Auth & RLS (Security Hardened)

-- 1. Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100),
    preferred_locale VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (preferred_locale IN ('en', 'ar', 'ur')),
    preferred_mushaf VARCHAR(20) NOT NULL DEFAULT 'uthmani' CHECK (preferred_mushaf IN ('uthmani', 'indopak')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. User Roles (RBAC) Table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(30) NOT NULL CHECK (role IN ('super_admin', 'content_admin', 'scholar_reviewer', 'editor', 'translator', 'user')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role)
);

-- 4. User Prayer Settings Table
CREATE TABLE IF NOT EXISTS public.user_prayer_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calculation_method VARCHAR(50) NOT NULL DEFAULT 'MWL'
        CHECK (calculation_method IN ('MWL', 'ISNA', 'UmmAlQura', 'Karachi', 'Egyptian', 'Diyanet', 'MUIS', 'Custom')),
    asr_madhhab VARCHAR(20) NOT NULL DEFAULT 'standard'
        CHECK (asr_madhhab IN ('standard', 'hanafi')),
    high_latitude_rule VARCHAR(30) NOT NULL DEFAULT 'angle_based'
        CHECK (high_latitude_rule IN ('angle_based', 'midnight', 'one_seventh', 'none')),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    city_name VARCHAR(100),
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    fajr_offset_minutes SMALLINT NOT NULL DEFAULT 0,
    dhuhr_offset_minutes SMALLINT NOT NULL DEFAULT 0,
    asr_offset_minutes SMALLINT NOT NULL DEFAULT 0,
    maghrib_offset_minutes SMALLINT NOT NULL DEFAULT 0,
    isha_offset_minutes SMALLINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_prayer_settings UNIQUE (user_id)
);

-- 5. Helper Functions & Triggers for Automation

-- 5.1 Updated At Timestamp Trigger Function (fixed search_path)
CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_user_prayer_settings_updated_at
BEFORE UPDATE ON public.user_prayer_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- 5.2 Auto-Provisioning Profile & Default Role on Auth Signup (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, preferred_locale)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'preferred_locale', 'en')
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');

    INSERT INTO public.user_prayer_settings (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Trigger binding on Supabase auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.3 Non-Recursive Administrative Check Helper (SECURITY DEFINER with safe search_path)
-- Bypasses RLS internally on public.user_roles to eliminate recursive policy evaluation.
-- Prevents unprivileged callers from probing other users' admin status.
CREATE OR REPLACE FUNCTION public.is_super_admin(lookup_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF lookup_uid IS NULL OR auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Unprivileged users cannot probe arbitrary user IDs
    IF lookup_uid <> auth.uid() AND NOT EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = lookup_uid
        AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5.4 Privilege Hardening: Revoke default public execution rights on functions
REVOKE EXECUTE ON FUNCTION public.set_updated_at_timestamp() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(UUID) FROM PUBLIC;

-- Grant execution of is_super_admin strictly to authenticated users
GRANT EXECUTE ON FUNCTION public.is_super_admin(UUID) TO authenticated;

-- 6. Row Level Security (RLS) Configuration

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prayer_settings ENABLE ROW LEVEL SECURITY;

-- 6.1 Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6.2 User Roles RLS Policies
-- Regular users can ONLY view their own roles. No insert/update/delete policies for regular users.
CREATE POLICY "Users can view their own assigned roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Super Admins can manage all roles without policy recursion
CREATE POLICY "Super Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- 6.3 User Prayer Settings RLS Policies
CREATE POLICY "Users can view their own prayer settings"
ON public.user_prayer_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prayer settings"
ON public.user_prayer_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayer settings"
ON public.user_prayer_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayer settings"
ON public.user_prayer_settings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
