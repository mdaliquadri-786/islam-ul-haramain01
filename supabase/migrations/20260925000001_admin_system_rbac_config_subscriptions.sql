-- Migration: 20260925000001_admin_system_rbac_config_subscriptions.sql
-- Description: Centralized Administration Architecture, Granular RBAC, System Settings, Feature Flags, and Subscription Foundation.
-- Milestone: M4.5 — Centralized Administration & Operational Control System

-- ============================================================================
-- 1. Role-Based Access Control (RBAC) Expansion & Granular Permissions
-- ============================================================================

-- 1.1 Expand user_roles check constraint to include all platform admin roles
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check
    CHECK (role IN (
        'super_admin',
        'admin',
        'content_admin',
        'scholar_reviewer',
        'support_admin',
        'billing_admin',
        'editor',
        'translator',
        'user'
    ));

-- 1.2 Granular Permissions Matrix Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role VARCHAR(30) NOT NULL,
    permission VARCHAR(50) NOT NULL,
    description TEXT,
    PRIMARY KEY (role, permission)
);

-- Seed granular role permissions
INSERT INTO public.role_permissions (role, permission, description) VALUES
    -- super_admin (Unrestricted Platform Authority)
    ('super_admin', 'read', 'Read platform entities'),
    ('super_admin', 'create', 'Create platform entities'),
    ('super_admin', 'update', 'Update platform entities'),
    ('super_admin', 'delete', 'Delete platform entities'),
    ('super_admin', 'publish', 'Execute publication gates'),
    ('super_admin', 'approve', 'Approve scholarly and editorial submissions'),
    ('super_admin', 'manage_users', 'Manage user accounts, suspension, and profiles'),
    ('super_admin', 'manage_roles', 'Assign and revoke administrative roles'),
    ('super_admin', 'manage_subscriptions', 'Configure plans and manage user subscriptions'),
    ('super_admin', 'manage_settings', 'Modify system settings, maintenance mode, and emergency controls'),
    ('super_admin', 'manage_feature_flags', 'Toggle and configure feature flags'),
    ('super_admin', 'view_audit_logs', 'Inspect append-only system audit logs'),

    -- admin (General Platform Administrator)
    ('admin', 'read', 'Read platform entities'),
    ('admin', 'create', 'Create platform entities'),
    ('admin', 'update', 'Update platform entities'),
    ('admin', 'delete', 'Delete non-canonical platform entities'),
    ('admin', 'publish', 'Execute publication gates'),
    ('admin', 'manage_users', 'Manage user accounts and profiles'),
    ('admin', 'manage_subscriptions', 'Manage subscriptions and plans'),
    ('admin', 'manage_settings', 'Modify system settings and maintenance mode'),
    ('admin', 'manage_feature_flags', 'Toggle feature flags'),
    ('admin', 'view_audit_logs', 'Inspect append-only system audit logs'),

    -- content_admin (Content Management Specialist)
    ('content_admin', 'read', 'Read platform entities'),
    ('content_admin', 'create', 'Create content drafts and metadata'),
    ('content_admin', 'update', 'Update content drafts and metadata'),
    ('content_admin', 'delete', 'Delete draft/unapproved content revisions'),
    ('content_admin', 'publish', 'Publish approved content revisions'),
    ('content_admin', 'view_audit_logs', 'Inspect content audit history'),

    -- scholar_reviewer (Credentialed Islamic Scholar)
    ('scholar_reviewer', 'read', 'Read platform entities'),
    ('scholar_reviewer', 'approve', 'Peer review, approve, or reject theological content'),
    ('scholar_reviewer', 'view_audit_logs', 'Inspect review audit history'),

    -- support_admin (User Operations & Support)
    ('support_admin', 'read', 'Read platform entities'),
    ('support_admin', 'manage_users', 'Inspect user status and manage support inquiries'),
    ('support_admin', 'view_audit_logs', 'Inspect user-related audit logs'),

    -- billing_admin (Financial & Subscription Operations)
    ('billing_admin', 'read', 'Read platform entities'),
    ('billing_admin', 'manage_subscriptions', 'Configure plans and adjust subscriptions'),
    ('billing_admin', 'view_audit_logs', 'Inspect financial and subscription audit logs'),

    -- editor (Content Author)
    ('editor', 'read', 'Read platform entities'),
    ('editor', 'create', 'Create article drafts and submissions'),
    ('editor', 'update', 'Edit assigned drafts'),

    -- translator (Language Specialist)
    ('translator', 'read', 'Read platform entities'),
    ('translator', 'update', 'Submit translations for scholarly review'),

    -- user (General Public)
    ('user', 'read', 'Read published platform content')
ON CONFLICT (role, permission) DO NOTHING;

-- 1.3 Non-recursive Administrative Role & Permission Check Functions (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.is_admin(lookup_uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    IF lookup_uid IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = lookup_uid
        AND role IN (
            'super_admin',
            'admin',
            'content_admin',
            'scholar_reviewer',
            'support_admin',
            'billing_admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.has_permission(lookup_uid UUID, required_perm VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    IF lookup_uid IS NULL OR required_perm IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Super admins implicitly hold all permissions
    IF public.is_super_admin(lookup_uid) THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role = rp.role
        WHERE ur.user_id = lookup_uid
        AND rp.permission = required_perm
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated, anon;

REVOKE EXECUTE ON FUNCTION public.has_permission(UUID, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, VARCHAR) TO authenticated;

-- ============================================================================
-- 2. User Account Status & Suspension Columns
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- ============================================================================
-- 3. System Configuration & Operational Controls (Single-Row Pattern)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    maintenance_message TEXT NOT NULL DEFAULT 'Platform undergoing scheduled maintenance. Offline devotional tools remain active.',
    announcement_banner_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    announcement_banner_text TEXT,
    registration_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    publishing_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    subscriptions_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    min_supported_mobile_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    min_supported_web_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    default_locale VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (default_locale IN ('en', 'ar', 'ur')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Seed single row if missing
INSERT INTO public.system_settings (id, maintenance_mode)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Trigger to update timestamp on system_settings
CREATE TRIGGER trg_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================================
-- 4. Dynamic Feature Flags Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
    key VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    target_audience VARCHAR(30) NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'beta_testers', 'admin_only')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Seed core feature flags
INSERT INTO public.feature_flags (key, name, description, is_enabled, target_audience) VALUES
    ('quran_reading', 'Quran Scripture Reader', 'Surah and Ayah reading with Uthmani script and verified translations', TRUE, 'all'),
    ('hadith_browser', 'Hadith Collections Browser', 'Kutub al-Sittah collection browsing and Sanad/Matn viewer', TRUE, 'all'),
    ('duas_adhkar', 'Hisn al-Muslim Duas', 'Supplications and morning/evening daily adhkar counters', TRUE, 'all'),
    ('prayer_times', 'Prayer Times & Qibla Engine', 'Devotional prayer calculation and Great Circle Qibla compass', TRUE, 'all'),
    ('tafsir_comparative', 'Comparative Tafsir Viewer', 'Ibn Kathir and Al-Sa''di comparative exegesis viewer', TRUE, 'all'),
    ('books_ereader', 'Classical Islamic Books e-Reader', 'Digital book reader for classical Sunni treatises', TRUE, 'all'),
    ('audio_streaming', 'Verified Reciter Audio', 'CDN audio recitation streaming with Ayah timestamps', TRUE, 'all'),
    ('scholar_cms', 'Scholar Review Workflow', 'Editorial drafting, peer review, and publication safety gating', TRUE, 'all'),
    ('user_library', 'Personal Library & Bookmarks', 'Cross-content bookmarking and reading progress tracking', TRUE, 'all'),
    ('subscriptions_engine', 'Subscription Management', 'Platform patronage and subscription tiers', FALSE, 'admin_only')
ON CONFLICT (key) DO NOTHING;

-- Trigger to update timestamp on feature_flags
CREATE TRIGGER trg_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================================
-- 5. Subscriptions Management Foundation (Zero Raw Card Storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_cents INT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    billing_interval VARCHAR(20) NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year', 'lifetime', 'free')),
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial subscription tiers
INSERT INTO public.subscription_plans (slug, name, description, price_cents, currency, billing_interval, features, is_active, sort_order) VALUES
    ('free', 'Community Access', 'Full access to Quran, Hadith, Duas, Prayer Times, and core educational articles', 0, 'USD', 'free', '["unlimited_quran", "unlimited_hadith", "offline_prayer_times", "basic_bookmarks"]'::jsonb, TRUE, 0),
    ('supporter_monthly', 'Monthly Platform Supporter', 'Support server costs, CDN streaming, and classical digital preservation', 500, 'USD', 'month', '["all_free_features", "cloud_sync", "unlimited_bookmarks", "priority_audio_cdn", "patron_badge"]'::jsonb, TRUE, 1),
    ('supporter_annual', 'Annual Platform Supporter', 'Annual sponsorship with 2 months free', 5000, 'USD', 'year', '["all_free_features", "cloud_sync", "unlimited_bookmarks", "priority_audio_cdn", "patron_badge"]'::jsonb, TRUE, 2),
    ('waqf_patron', 'Endowment (Waqf) Patron', 'Perpetual digital Islamic endowment patron contributing directly to server infrastructure and research', 25000, 'USD', 'year', '["all_supporter_features", "waqf_patron_badge", "annual_transparency_report"]'::jsonb, TRUE, 3)
ON CONFLICT (slug) DO NOTHING;

CREATE TRIGGER trg_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'free'
        CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'paused', 'free')),
    provider VARCHAR(30) NOT NULL DEFAULT 'manual'
        CHECK (provider IN ('manual', 'stripe', 'apple_iap', 'google_play', 'waqf_grant')),
    provider_subscription_id VARCHAR(100),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions (status);

CREATE TRIGGER trg_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================================
-- 6. Row Level Security (RLS) Configuration
-- ============================================================================

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6.1 role_permissions RLS
CREATE POLICY "Public can view role permissions"
ON public.role_permissions FOR SELECT
TO public
USING (TRUE);

CREATE POLICY "Super Admins can manage role permissions"
ON public.role_permissions FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- 6.2 system_settings RLS
-- Anyone (including unauthenticated/mobile clients) can inspect system settings
CREATE POLICY "Anyone can view system settings"
ON public.system_settings FOR SELECT
TO public
USING (TRUE);

-- Only administrators holding 'manage_settings' can update settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings FOR UPDATE
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_settings'))
WITH CHECK (public.has_permission(auth.uid(), 'manage_settings'));

-- 6.3 feature_flags RLS
-- Anyone can view feature flags
CREATE POLICY "Anyone can view feature flags"
ON public.feature_flags FOR SELECT
TO public
USING (TRUE);

-- Admins holding 'manage_feature_flags' can manage feature flags
CREATE POLICY "Admins can insert feature flags"
ON public.feature_flags FOR INSERT
TO authenticated
WITH CHECK (public.has_permission(auth.uid(), 'manage_feature_flags'));

CREATE POLICY "Admins can update feature flags"
ON public.feature_flags FOR UPDATE
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_feature_flags'))
WITH CHECK (public.has_permission(auth.uid(), 'manage_feature_flags'));

CREATE POLICY "Admins can delete feature flags"
ON public.feature_flags FOR DELETE
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_feature_flags'));

-- 6.4 subscription_plans RLS
-- Anyone can view active subscription plans
CREATE POLICY "Anyone can view active subscription plans"
ON public.subscription_plans FOR SELECT
TO public
USING (is_active = TRUE OR public.has_permission(auth.uid(), 'manage_subscriptions'));

-- Billing and super admins can manage subscription plans
CREATE POLICY "Admins can manage subscription plans"
ON public.subscription_plans FOR ALL
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_subscriptions'))
WITH CHECK (public.has_permission(auth.uid(), 'manage_subscriptions'));

-- 6.5 user_subscriptions RLS
-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins holding 'manage_subscriptions' can view all subscriptions
CREATE POLICY "Admins can view all user subscriptions"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_subscriptions'));

-- Admins can update/manage user subscriptions
CREATE POLICY "Admins can manage user subscriptions"
ON public.user_subscriptions FOR ALL
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_subscriptions'))
WITH CHECK (public.has_permission(auth.uid(), 'manage_subscriptions'));

-- 6.6 Update profiles RLS: Allow Administrators to view and manage user accounts
CREATE POLICY "Admins can view all user profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_users'));

CREATE POLICY "Admins can update user profile status"
ON public.profiles FOR UPDATE
TO authenticated
USING (public.has_permission(auth.uid(), 'manage_users'))
WITH CHECK (public.has_permission(auth.uid(), 'manage_users'));
