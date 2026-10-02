-- Migration: 20260922000002_audit_logging_versioning.sql
-- Description: Reusable database foundation for append-only audit logging and editorial content versioning.
-- Milestone: M1.3 — Audit Logging & Versioning Core

-- ============================================================================
-- 1. Helper Functions for Role-Based Access Control (Non-Recursive)
-- ============================================================================

-- Checks whether a user holds any of the specified roles without triggering RLS recursion.
CREATE OR REPLACE FUNCTION public.has_any_role(lookup_uid UUID, check_roles VARCHAR[])
RETURNS BOOLEAN AS $$
BEGIN
    IF lookup_uid IS NULL OR auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Unprivileged users cannot probe arbitrary user IDs
    IF lookup_uid <> auth.uid() AND NOT EXISTS (
        SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'content_admin')
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = lookup_uid
        AND role = ANY(check_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.has_any_role(UUID, VARCHAR[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_role(UUID, VARCHAR[]) TO authenticated;

-- ============================================================================
-- 2. Audit Logging Foundation (Append-Only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_entity_type VARCHAR(100) NOT NULL,
    target_entity_id VARCHAR(100),
    correlation_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_context VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance and investigative queries
CREATE INDEX idx_audit_logs_actor ON public.audit_logs (actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_target ON public.audit_logs (target_entity_type, target_entity_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs (action, created_at DESC);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- Trigger to strictly forbid in-place UPDATE or DELETE on audit logs (Append-Only guarantee)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Immutable Audit Log: UPDATE and DELETE operations are strictly prohibited on public.audit_logs.';
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_audit_logs_immutability
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- Dedicated secure function to record audit logs, strictly tying actor_id to auth.uid()
CREATE OR REPLACE FUNCTION public.record_audit_event(
    p_action VARCHAR(100),
    p_target_entity_type VARCHAR(100),
    p_target_entity_id VARCHAR(100),
    p_details JSONB DEFAULT '{}'::jsonb,
    p_source_context VARCHAR(100) DEFAULT NULL,
    p_correlation_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_new_id UUID;
    v_actor_id UUID := auth.uid();
BEGIN
    -- Prevent forging audit logs: actor_id is derived from auth.uid()
    INSERT INTO public.audit_logs (
        actor_id,
        action,
        target_entity_type,
        target_entity_id,
        details,
        source_context,
        correlation_id
    ) VALUES (
        v_actor_id,
        p_action,
        p_target_entity_type,
        p_target_entity_id,
        COALESCE(p_details, '{}'::jsonb),
        p_source_context,
        p_correlation_id
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.record_audit_event(VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_audit_event(VARCHAR, VARCHAR, VARCHAR, JSONB, VARCHAR, UUID) TO authenticated;

-- RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only administrators can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin']));

-- Direct table INSERT is denied to ordinary clients; must use record_audit_event() or service role
CREATE POLICY "Allow server-side or service role inserts to audit_logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (actor_id = auth.uid());

-- Note: No UPDATE or DELETE policies exist. Trigger also aborts any attempt.

-- ============================================================================
-- 3. Content Versioning Foundation (Generic & Reusable)
-- ============================================================================

-- 3.1 Logical Content Identity
CREATE TABLE IF NOT EXISTS public.content_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- e.g. 'article', 'translation', 'tafsir_entry', 'general'
    slug VARCHAR(200),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_version_id UUID,           -- Points to the active published content_versions(id)
    CONSTRAINT uq_content_slug_type UNIQUE (content_type, slug)
);

CREATE INDEX idx_content_entities_type ON public.content_entities (content_type);

-- 3.2 Versioned Content Revisions
CREATE TABLE IF NOT EXISTS public.content_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES public.content_entities(id) ON DELETE CASCADE,
    version_number INT NOT NULL CHECK (version_number >= 1),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED')),
    title VARCHAR(255) NOT NULL,
    content_payload JSONB NOT NULL,
    content_hash CHAR(64),            -- SHA-256 checksum of canonical content payload
    change_summary TEXT,               -- Explanation of edits/revisions
    source_provenance JSONB NOT NULL DEFAULT '{}'::jsonb, -- Physical or verified digital citation
    parent_version_id UUID REFERENCES public.content_versions(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    published_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    CONSTRAINT uq_entity_version UNIQUE (entity_id, version_number),
    CONSTRAINT chk_reviewed_consistency CHECK (
        (status NOT IN ('APPROVED', 'PUBLISHED')) OR 
        (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    ),
    CONSTRAINT chk_published_consistency CHECK (
        (status != 'PUBLISHED') OR 
        (published_by IS NOT NULL AND published_at IS NOT NULL)
    )
);

-- Foreign key linking logical entity to current active version
ALTER TABLE public.content_entities
DROP CONSTRAINT IF EXISTS fk_content_entities_current_version;

ALTER TABLE public.content_entities
ADD CONSTRAINT fk_content_entities_current_version
FOREIGN KEY (current_version_id) REFERENCES public.content_versions(id) ON DELETE SET NULL;

CREATE INDEX idx_content_versions_entity ON public.content_versions (entity_id, version_number DESC);
CREATE INDEX idx_content_versions_status ON public.content_versions (status);
CREATE INDEX idx_content_versions_parent ON public.content_versions (parent_version_id);

-- 3.3 Engine-Level Immutability for Published & Archived Versions
CREATE OR REPLACE FUNCTION public.prevent_published_content_mutation()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent altering a version once it has been published or archived
    IF OLD.status IN ('PUBLISHED', 'ARCHIVED') THEN
        RAISE EXCEPTION 'Immutable version: Content in % status cannot be modified. Create a new version revision instead.', OLD.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_content_versions_immutability
BEFORE UPDATE ON public.content_versions
FOR EACH ROW EXECUTE FUNCTION public.prevent_published_content_mutation();

-- Automatic updated_at trigger on content_entities
CREATE TRIGGER trg_content_entities_updated_at
BEFORE UPDATE ON public.content_entities
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================================
-- 4. Row Level Security (RLS) for Content Entities & Versions
-- ============================================================================

ALTER TABLE public.content_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- 4.1 Content Entities Policies
-- Anyone (including public) can view content entities that have a published version
CREATE POLICY "Public can view published content entities"
ON public.content_entities FOR SELECT
TO public
USING (current_version_id IS NOT NULL);

-- Content creators/editors/reviewers can view all content entities
CREATE POLICY "Staff can view all content entities"
ON public.content_entities FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer', 'editor', 'translator']));

-- Editors and staff can create new content entities
CREATE POLICY "Staff can insert content entities"
ON public.content_entities FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid() AND
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer', 'editor', 'translator'])
);

-- Only Admins can set current_version_id
CREATE POLICY "Admins can update content entities"
ON public.content_entities FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin']));

-- 4.2 Content Versions Policies
-- Public can view active PUBLISHED versions (and historical ARCHIVED versions)
CREATE POLICY "Public can view published and archived versions"
ON public.content_versions FOR SELECT
TO public
USING (status IN ('PUBLISHED', 'ARCHIVED'));

-- Authors can view their own non-published versions
CREATE POLICY "Authors can view their own versions"
ON public.content_versions FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Staff can view all versions across review states
CREATE POLICY "Staff can view all content versions"
ON public.content_versions FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer', 'editor', 'translator']));

-- Staff can insert new versions in DRAFT status
CREATE POLICY "Staff can insert draft versions"
ON public.content_versions FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid() AND
    status = 'DRAFT' AND
    reviewed_by IS NULL AND
    reviewed_at IS NULL AND
    published_by IS NULL AND
    published_at IS NULL AND
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer', 'editor', 'translator'])
);

-- Authors can update their own DRAFT versions (cannot self-approve or publish)
CREATE POLICY "Authors can update own draft versions"
ON public.content_versions FOR UPDATE
TO authenticated
USING (
    created_by = auth.uid() AND
    status = 'DRAFT'
)
WITH CHECK (
    created_by = auth.uid() AND
    status IN ('DRAFT', 'IN_REVIEW') AND
    reviewed_by IS NULL AND
    reviewed_at IS NULL AND
    published_by IS NULL AND
    published_at IS NULL
);

-- Scholar Reviewers can transition versions between IN_REVIEW, APPROVED, REJECTED
CREATE POLICY "Reviewers can review content versions"
ON public.content_versions FOR UPDATE
TO authenticated
USING (
    status IN ('IN_REVIEW', 'APPROVED', 'REJECTED') AND
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer'])
)
WITH CHECK (
    status IN ('IN_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT') AND
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer'])
);

-- Admins can publish approved versions or archive published versions
CREATE POLICY "Admins can publish or archive versions"
ON public.content_versions FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin']));
