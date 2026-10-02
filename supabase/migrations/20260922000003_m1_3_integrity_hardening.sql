-- Migration: 20260922000003_m1_3_integrity_hardening.sql
-- Description: Hardening content versioning integrity, state lifecycle transitions, and immutable audit logging.
-- Milestone: M1.3 Corrective Hardening (F-01 through F-06)

-- ============================================================================
-- 1. F-01: content_entities.current_version_id Integrity Enforcement
-- ============================================================================

-- Validates that current_version_id references a PUBLISHED version belonging to the same entity.
CREATE OR REPLACE FUNCTION public.validate_content_entity_current_version()
RETURNS TRIGGER AS $$
DECLARE
    v_target_status VARCHAR(30);
    v_target_entity_id UUID;
BEGIN
    IF NEW.current_version_id IS NOT NULL THEN
        SELECT status, entity_id 
        INTO v_target_status, v_target_entity_id
        FROM public.content_versions
        WHERE id = NEW.current_version_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid current_version_id: Referenced version % does not exist.', NEW.current_version_id;
        END IF;

        IF v_target_entity_id <> NEW.id THEN
            RAISE EXCEPTION 'Invalid current_version_id: Referenced version belongs to entity %, not %.', v_target_entity_id, NEW.id;
        END IF;

        IF v_target_status <> 'PUBLISHED' THEN
            RAISE EXCEPTION 'Invalid current_version_id: Referenced version has status %, but current_version_id must point strictly to a PUBLISHED version.', v_target_status;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_content_entity_current_version ON public.content_entities;
CREATE TRIGGER trg_validate_content_entity_current_version
BEFORE INSERT OR UPDATE OF current_version_id ON public.content_entities
FOR EACH ROW EXECUTE FUNCTION public.validate_content_entity_current_version();

-- ============================================================================
-- 2. F-02: PUBLISHED -> ARCHIVED Lifecycle & Immutability Trigger Hardening
-- ============================================================================

-- Replaces the immutability trigger to permit legitimate PUBLISHED -> ARCHIVED transition
-- while strictly freezing all content, attribution, and lineage fields.
CREATE OR REPLACE FUNCTION public.prevent_published_content_mutation()
RETURNS TRIGGER AS $$
BEGIN
    -- If already ARCHIVED, strictly prohibit any update
    IF OLD.status = 'ARCHIVED' THEN
        RAISE EXCEPTION 'Immutable version: Archived content cannot be modified or transitioned to any other status.';
    END IF;

    -- If PUBLISHED, the ONLY permitted update is transitioning to ARCHIVED
    IF OLD.status = 'PUBLISHED' THEN
        IF NEW.status = 'ARCHIVED' THEN
            -- Prevent archiving if this version is still designated as the active current_version_id
            IF EXISTS (
                SELECT 1 FROM public.content_entities 
                WHERE id = OLD.entity_id AND current_version_id = OLD.id
            ) THEN
                RAISE EXCEPTION 'Cannot archive version %: It is currently designated as current_version_id on entity %. Reassign or clear current_version_id before archiving.', OLD.id, OLD.entity_id;
            END IF;

            -- Freeze all content, lineage, metadata, and attribution fields
            IF NEW.entity_id IS DISTINCT FROM OLD.entity_id OR
               NEW.version_number IS DISTINCT FROM OLD.version_number OR
               NEW.parent_version_id IS DISTINCT FROM OLD.parent_version_id OR
               NEW.created_by IS DISTINCT FROM OLD.created_by OR
               NEW.created_at IS DISTINCT FROM OLD.created_at OR
               NEW.title IS DISTINCT FROM OLD.title OR
               NEW.content_payload IS DISTINCT FROM OLD.content_payload OR
               NEW.content_hash IS DISTINCT FROM OLD.content_hash OR
               NEW.source_provenance IS DISTINCT FROM OLD.source_provenance OR
               NEW.change_summary IS DISTINCT FROM OLD.change_summary OR
               NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR
               NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at OR
               NEW.review_notes IS DISTINCT FROM OLD.review_notes OR
               NEW.published_by IS DISTINCT FROM OLD.published_by OR
               NEW.published_at IS DISTINCT FROM OLD.published_at THEN
                RAISE EXCEPTION 'Immutable version: Content, lineage, and attribution fields cannot be modified while transitioning to ARCHIVED.';
            END IF;

            RETURN NEW;
        ELSE
            RAISE EXCEPTION 'Immutable version: Content in PUBLISHED status cannot be modified. Create a new version revision instead.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- ============================================================================
-- 3. F-03: parent_version_id Integrity Enforcement (Same Entity, No Self-Parent, Monotonic Order)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_content_version_parent()
RETURNS TRIGGER AS $$
DECLARE
    v_parent_entity_id UUID;
    v_parent_version_number INT;
BEGIN
    IF NEW.parent_version_id IS NOT NULL THEN
        -- Prevent self-parenting
        IF NEW.id IS NOT NULL AND NEW.parent_version_id = NEW.id THEN
            RAISE EXCEPTION 'Invalid parent_version_id: A version cannot reference itself as parent.';
        END IF;

        SELECT entity_id, version_number 
        INTO v_parent_entity_id, v_parent_version_number
        FROM public.content_versions
        WHERE id = NEW.parent_version_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid parent_version_id: Referenced parent version % does not exist.', NEW.parent_version_id;
        END IF;

        IF v_parent_entity_id <> NEW.entity_id THEN
            RAISE EXCEPTION 'Invalid parent_version_id: Parent version belongs to entity %, but child belongs to entity %.', v_parent_entity_id, NEW.entity_id;
        END IF;

        -- Strictly enforce monotonic ordering to prevent cycles (DAG guarantee)
        IF v_parent_version_number >= NEW.version_number THEN
            RAISE EXCEPTION 'Invalid parent_version_id: Parent version_number (%) must be strictly less than child version_number (%).', v_parent_version_number, NEW.version_number;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_content_versions_parent_validate ON public.content_versions;
CREATE TRIGGER trg_content_versions_parent_validate
BEFORE INSERT OR UPDATE OF parent_version_id, entity_id, version_number ON public.content_versions
FOR EACH ROW EXECUTE FUNCTION public.validate_content_version_parent();

-- ============================================================================
-- 4. F-04, F-05, F-06: State Transition Machine & Field Protections
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_content_version_lifecycle()
RETURNS TRIGGER AS $$
DECLARE
    v_caller_uid UUID := auth.uid();
    v_is_admin BOOLEAN := FALSE;
    v_is_reviewer BOOLEAN := FALSE;
BEGIN
    -- 4.1 Global Identity & Lineage Immutability (F-04)
    IF NEW.entity_id IS DISTINCT FROM OLD.entity_id THEN
        RAISE EXCEPTION 'Immutable field: entity_id cannot be changed after version creation.';
    END IF;

    IF NEW.version_number IS DISTINCT FROM OLD.version_number THEN
        RAISE EXCEPTION 'Immutable field: version_number cannot be changed after version creation.';
    END IF;

    IF NEW.parent_version_id IS DISTINCT FROM OLD.parent_version_id THEN
        RAISE EXCEPTION 'Immutable field: parent_version_id cannot be changed after version creation.';
    END IF;

    IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
        RAISE EXCEPTION 'Immutable field: created_by author cannot be altered.';
    END IF;

    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION 'Immutable field: created_at cannot be altered.';
    END IF;

    -- Evaluate caller roles if running in authenticated context
    IF v_caller_uid IS NOT NULL THEN
        v_is_admin := public.has_any_role(v_caller_uid, ARRAY['super_admin', 'content_admin']);
        v_is_reviewer := public.has_any_role(v_caller_uid, ARRAY['super_admin', 'content_admin', 'scholar_reviewer']);
    END IF;

    -- 4.2 State Machine Transitions & Role-Gated Field Protections

    -- Case A: Transitions from DRAFT (F-04)
    IF OLD.status = 'DRAFT' THEN
        IF NEW.status NOT IN ('DRAFT', 'IN_REVIEW') THEN
            RAISE EXCEPTION 'Invalid transition: DRAFT version can only be updated in DRAFT or submitted to IN_REVIEW. Direct transition to % is prohibited.', NEW.status;
        END IF;

        -- Prevent setting reviewer or publisher metadata while in DRAFT or submitting to IN_REVIEW
        IF NEW.reviewed_by IS NOT NULL OR NEW.reviewed_at IS NOT NULL OR NEW.review_notes IS NOT NULL THEN
            RAISE EXCEPTION 'Invalid field: Review metadata cannot be set while in DRAFT or submitting to IN_REVIEW.';
        END IF;

        IF NEW.published_by IS NOT NULL OR NEW.published_at IS NOT NULL THEN
            RAISE EXCEPTION 'Invalid field: Publishing metadata cannot be set on DRAFT.';
        END IF;

    -- Case B: Transitions from IN_REVIEW (F-05 & F-06)
    ELSIF OLD.status = 'IN_REVIEW' THEN
        IF NEW.status = 'PUBLISHED' THEN
            RAISE EXCEPTION 'Invalid transition: Direct publication from IN_REVIEW is prohibited. Content must be APPROVED first.';
        END IF;

        IF NEW.status NOT IN ('IN_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT') THEN
            RAISE EXCEPTION 'Invalid transition from IN_REVIEW to %.', NEW.status;
        END IF;

        -- Reviewer decisions: APPROVED or REJECTED
        IF NEW.status IN ('APPROVED', 'REJECTED') THEN
            IF v_caller_uid IS NOT NULL AND NOT v_is_reviewer THEN
                RAISE EXCEPTION 'Unauthorized: Only credentialed scholar reviewers and admins can approve or reject versions.';
            END IF;

            -- Bind reviewer identity strictly to authenticated caller if available
            IF v_caller_uid IS NOT NULL THEN
                NEW.reviewed_by := v_caller_uid;
            ELSIF NEW.reviewed_by IS NULL THEN
                RAISE EXCEPTION 'reviewed_by is required when approving or rejecting a version.';
            END IF;

            NEW.reviewed_at := COALESCE(NEW.reviewed_at, NOW());

            IF NEW.status = 'REJECTED' AND (NEW.review_notes IS NULL OR TRIM(NEW.review_notes) = '') THEN
                RAISE EXCEPTION 'review_notes explaining the reason are mandatory when rejecting a version.';
            END IF;
        END IF;

        -- Content cannot be altered during the approval transition
        IF NEW.status = 'APPROVED' THEN
            IF NEW.content_payload IS DISTINCT FROM OLD.content_payload OR
               NEW.title IS DISTINCT FROM OLD.title OR
               NEW.source_provenance IS DISTINCT FROM OLD.source_provenance THEN
                RAISE EXCEPTION 'Integrity violation: Content payload cannot be altered during the approval transition. Corrections must be reviewed in a new draft revision.';
            END IF;
        END IF;

    -- Case C: Transitions from APPROVED (F-05 & F-06)
    ELSIF OLD.status = 'APPROVED' THEN
        -- F-06: Publishing an approved version
        IF NEW.status = 'PUBLISHED' THEN
            IF v_caller_uid IS NOT NULL AND NOT v_is_admin THEN
                RAISE EXCEPTION 'Unauthorized: Only administrators can publish approved content.';
            END IF;

            -- Bind publisher identity strictly to authenticated admin
            IF v_caller_uid IS NOT NULL THEN
                NEW.published_by := v_caller_uid;
            ELSIF NEW.published_by IS NULL THEN
                RAISE EXCEPTION 'published_by is required when publishing a version.';
            END IF;

            NEW.published_at := COALESCE(NEW.published_at, NOW());

            -- Content must remain exactly as approved
            IF NEW.content_payload IS DISTINCT FROM OLD.content_payload OR
               NEW.title IS DISTINCT FROM OLD.title OR
               NEW.source_provenance IS DISTINCT FROM OLD.source_provenance THEN
                RAISE EXCEPTION 'Integrity violation: Content cannot be modified during publication. Corrections must be branched into a new revision.';
            END IF;

        -- F-05: Modifying an approved version while retaining APPROVED status is strictly prohibited
        ELSIF NEW.status = 'APPROVED' THEN
            IF NEW.content_payload IS DISTINCT FROM OLD.content_payload OR
               NEW.title IS DISTINCT FROM OLD.title OR
               NEW.source_provenance IS DISTINCT FROM OLD.source_provenance OR
               NEW.content_hash IS DISTINCT FROM OLD.content_hash THEN
                RAISE EXCEPTION 'Immutable approved content: Content cannot be modified while retaining APPROVED status. Transition back to DRAFT or branch a new version.';
            END IF;

        -- Allowed re-opening for revisions
        ELSIF NEW.status NOT IN ('IN_REVIEW', 'DRAFT') THEN
            RAISE EXCEPTION 'Invalid transition from APPROVED to %.', NEW.status;
        END IF;

    -- Case D: Transitions from REJECTED
    ELSIF OLD.status = 'REJECTED' THEN
        IF NEW.status = 'PUBLISHED' THEN
            RAISE EXCEPTION 'Invalid transition: Cannot directly publish a REJECTED version.';
        END IF;

        IF NEW.status = 'APPROVED' THEN
            RAISE EXCEPTION 'Invalid transition: Cannot directly approve a REJECTED version without moving to DRAFT/IN_REVIEW first.';
        END IF;

        IF NEW.status NOT IN ('REJECTED', 'DRAFT') THEN
            RAISE EXCEPTION 'Invalid transition from REJECTED to %.', NEW.status;
        END IF;

        -- Clear review metadata if moving back to DRAFT
        IF NEW.status = 'DRAFT' THEN
            NEW.reviewed_by := NULL;
            NEW.reviewed_at := NULL;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_content_versions_lifecycle ON public.content_versions;
CREATE TRIGGER trg_content_versions_lifecycle
BEFORE UPDATE ON public.content_versions
FOR EACH ROW EXECUTE FUNCTION public.enforce_content_version_lifecycle();

-- ============================================================================
-- 5. Automated Append-Only Audit Logging for Lifecycle Events
-- ============================================================================

-- Automatically records lifecycle state changes in public.audit_logs
CREATE OR REPLACE FUNCTION public.audit_content_version_lifecycle()
RETURNS TRIGGER AS $$
BEGIN
    -- Record version creation
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (
            actor_id,
            action,
            target_entity_type,
            target_entity_id,
            details,
            source_context
        ) VALUES (
            auth.uid(),
            'CONTENT_VERSION_CREATED',
            'content_versions',
            NEW.id::text,
            jsonb_build_object(
                'entity_id', NEW.entity_id,
                'version_number', NEW.version_number,
                'status', NEW.status,
                'parent_version_id', NEW.parent_version_id,
                'title', NEW.title
            ),
            'lifecycle_trigger'
        );
        RETURN NEW;
    END IF;

    -- Record status transition on update
    IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO public.audit_logs (
            actor_id,
            action,
            target_entity_type,
            target_entity_id,
            details,
            source_context
        ) VALUES (
            auth.uid(),
            'CONTENT_VERSION_' || NEW.status,
            'content_versions',
            NEW.id::text,
            jsonb_build_object(
                'entity_id', NEW.entity_id,
                'version_number', NEW.version_number,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'change_summary', NEW.change_summary,
                'reviewed_by', NEW.reviewed_by,
                'published_by', NEW.published_by
            ),
            'lifecycle_trigger'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_audit_content_version_lifecycle ON public.content_versions;
CREATE TRIGGER trg_audit_content_version_lifecycle
AFTER INSERT OR UPDATE ON public.content_versions
FOR EACH ROW EXECUTE FUNCTION public.audit_content_version_lifecycle();

-- Automatically records pointer updates on content_entities
CREATE OR REPLACE FUNCTION public.audit_content_entity_current_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_version_id IS DISTINCT FROM OLD.current_version_id THEN
        INSERT INTO public.audit_logs (
            actor_id,
            action,
            target_entity_type,
            target_entity_id,
            details,
            source_context
        ) VALUES (
            auth.uid(),
            'CONTENT_ENTITY_CURRENT_VERSION_UPDATED',
            'content_entities',
            NEW.id::text,
            jsonb_build_object(
                'content_type', NEW.content_type,
                'slug', NEW.slug,
                'old_current_version_id', OLD.current_version_id,
                'new_current_version_id', NEW.current_version_id
            ),
            'lifecycle_trigger'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_audit_content_entity_current_version ON public.content_entities;
CREATE TRIGGER trg_audit_content_entity_current_version
AFTER UPDATE OF current_version_id ON public.content_entities
FOR EACH ROW EXECUTE FUNCTION public.audit_content_entity_current_version();

-- Privilege hardening
REVOKE EXECUTE ON FUNCTION public.validate_content_entity_current_version() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_published_content_mutation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_content_version_parent() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_content_version_lifecycle() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_content_version_lifecycle() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.audit_content_entity_current_version() FROM PUBLIC;
