-- Test: rls_versioning_audit_test.sql
-- Description: Comprehensive executable test suite verifying audit-log immutability, role gates,
--              DAG lineage, and hardened state lifecycle transitions (F-01 through F-06).
-- Note: Requires a PostgreSQL/Supabase environment with auth schema and M1.2/M1.3 migrations applied.
-- Milestone: M1.3 Corrective Hardening

BEGIN;

-- ============================================================================
-- 1. Setup Mock Authentication Identities
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS auth;

-- User O: Ordinary User (role: 'user')
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ordinary@example.com', '{"full_name": "Ordinary User"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- User E: Editor (role: 'editor')
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'editor@example.com', '{"full_name": "Editor Staff"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'editor')
ON CONFLICT (user_id, role) DO NOTHING;

-- User R: Scholar Reviewer (role: 'scholar_reviewer')
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'scholar@example.com', '{"full_name": "Dr. Scholar"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'scholar_reviewer')
ON CONFLICT (user_id, role) DO NOTHING;

-- User A: Super Admin (role: 'super_admin')
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES ('99999999-9999-9999-9999-999999999999', 'admin@example.com', '{"full_name": "Super Admin"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('99999999-9999-9999-9999-999999999999', 'super_admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 2. Audit Logging Security & Immutability Tests
-- ============================================================================

-- Create mock audit log entry as admin
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';
SELECT public.record_audit_event('TEST_INIT', 'system', '0', '{"msg": "init"}'::jsonb);

-- 2.1 Verify Ordinary User cannot read audit records
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

DO $$
DECLARE v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM public.audit_logs;
    ASSERT v_count = 0, 'SECURITY VIOLATION: Ordinary user read audit_logs';
END $$;

-- 2.2 Verify Ordinary User cannot modify or delete audit records
DO $$
DECLARE v_modified INT;
BEGIN
    UPDATE public.audit_logs SET action = 'FORGED' WHERE action = 'TEST_INIT';
    GET DIAGNOSTICS v_modified = ROW_COUNT;
    ASSERT v_modified = 0, 'SECURITY VIOLATION: Ordinary user updated audit_logs';

    DELETE FROM public.audit_logs WHERE action = 'TEST_INIT';
    GET DIAGNOSTICS v_modified = ROW_COUNT;
    ASSERT v_modified = 0, 'SECURITY VIOLATION: Ordinary user deleted audit_logs';
END $$;

-- 2.3 Verify Even Admin cannot UPDATE or DELETE audit records (Database Trigger Immutability)
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';

DO $$
DECLARE v_failed BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.audit_logs SET action = 'ALTERED';
    EXCEPTION WHEN OTHERS THEN
        v_failed := TRUE;
    END;
    ASSERT v_failed = TRUE, 'IMMUTABILITY VIOLATION: Admin was able to update audit_logs';
END $$;

-- ============================================================================
-- 3. Base Entities Setup for Versioning Tests
-- ============================================================================

SET LOCAL "request.jwt.claim.sub" = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

-- Entity 1: Main Article Entity
INSERT INTO public.content_entities (id, content_type, slug, created_by)
VALUES ('00000000-0000-0000-0000-000000000001', 'article', 'principles-of-hadith', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- Entity 2: Unrelated Tafsir Entity (for cross-entity validation tests)
INSERT INTO public.content_entities (id, content_type, slug, created_by)
VALUES ('00000000-0000-0000-0000-000000000002', 'tafsir', 'surah-al-fatihah-tafsir', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- ============================================================================
-- 4. F-03: parent_version_id Lineage & DAG Tests
-- ============================================================================

-- Create initial version 1 for Entity 1 in DRAFT
INSERT INTO public.content_versions (
    id, entity_id, version_number, status, title, content_payload, created_by
) VALUES (
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000001',
    1,
    'DRAFT',
    'Principles v1',
    '{"body": "Initial text"}'::jsonb,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);

-- Create initial version 1 for Entity 2
INSERT INTO public.content_versions (
    id, entity_id, version_number, status, title, content_payload, created_by
) VALUES (
    '00000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000002',
    1,
    'DRAFT',
    'Tafsir v1',
    '{"body": "Tafsir text"}'::jsonb,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);

-- 4.1 Cross-entity parent must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        -- Attempt to create Entity 1 Version 2 with parent from Entity 2
        INSERT INTO public.content_versions (
            id, entity_id, version_number, status, title, content_payload, parent_version_id, created_by
        ) VALUES (
            '00000000-0000-0000-0000-000000000012',
            '00000000-0000-0000-0000-000000000001',
            2,
            'DRAFT',
            'Principles v2 Cross Parent',
            '{}'::jsonb,
            '00000000-0000-0000-0000-000000000021', -- Belongs to Entity 2!
            'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
        );
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-03 VIOLATION: Cross-entity parent was permitted!';
END $$;

-- 4.2 Self-parent must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET parent_version_id = '00000000-0000-0000-0000-000000000011'
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-03 VIOLATION: Self-parenting was permitted!';
END $$;

-- 4.3 Inverted/Cyclic parent (parent.version_number >= child.version_number) must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        -- Version 1 attempting to point to Version 1 as parent
        INSERT INTO public.content_versions (
            id, entity_id, version_number, status, title, content_payload, parent_version_id, created_by
        ) VALUES (
            '00000000-0000-0000-0000-000000000019',
            '00000000-0000-0000-0000-000000000001',
            1,
            'DRAFT',
            'Cycle version',
            '{}'::jsonb,
            '00000000-0000-0000-0000-000000000011', -- parent version is 1 >= 1
            'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
        );
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-03 VIOLATION: Non-monotonic parent version number permitted!';
END $$;

-- ============================================================================
-- 5. F-04: Draft Author Field Protection Tests
-- ============================================================================

-- 5.1 Author cannot change entity_id on existing draft
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET entity_id = '00000000-0000-0000-0000-000000000002'
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-04 VIOLATION: Author modified entity_id on draft!';
END $$;

-- 5.2 Author cannot change version_number on existing draft
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET version_number = 99
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-04 VIOLATION: Author modified version_number on draft!';
END $$;

-- 5.3 Author cannot change created_by author
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET created_by = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-04 VIOLATION: Author modified created_by on draft!';
END $$;

-- 5.4 Author cannot assign reviewer or review metadata
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET reviewed_by = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
            reviewed_at = NOW()
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-04 VIOLATION: Author set reviewed_by on draft!';
END $$;

-- 5.5 Author cannot assign publisher
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET published_by = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
            published_at = NOW()
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-04 VIOLATION: Author set published_by on draft!';
END $$;

-- 5.6 Author CAN modify content fields: title, content_payload, change_summary
UPDATE public.content_versions
SET title = 'Principles of Hadith v1 (Polished)',
    content_payload = '{"body": "Polished text with verified citations"}'::jsonb,
    change_summary = 'Draft edits applied.'
WHERE id = '00000000-0000-0000-0000-000000000011';

DO $$
BEGIN
    ASSERT (SELECT title FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000011') = 'Principles of Hadith v1 (Polished)',
        'Author valid content update failed!';
END $$;

-- 5.7 Cryptographic Content Hash Integrity Tests
-- 5.7.1 Arbitrary/mismatched client-supplied content_hash must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        INSERT INTO public.content_versions (
            id, entity_id, version_number, status, title, content_payload, content_hash, created_by
        ) VALUES (
            '00000000-0000-0000-0000-000000000013',
            '00000000-0000-0000-0000-000000000001',
            3,
            'DRAFT',
            'Principles v3 Forged Hash',
            '{"body": "Valid body"}'::jsonb,
            'bad0000000000000000000000000000000000000000000000000000000000bad', -- Forged hash!
            'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
        );
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'HASH INTEGRITY VIOLATION: Mismatched client-supplied content_hash was accepted!';
END $$;

-- 5.7.2 Inserting with NULL content_hash derives authoritative hash automatically
DO $$
DECLARE 
    v_hash CHAR(64);
    v_expected CHAR(64);
BEGIN
    INSERT INTO public.content_versions (
        id, entity_id, version_number, status, title, content_payload, content_hash, created_by
    ) VALUES (
        '00000000-0000-0000-0000-000000000013',
        '00000000-0000-0000-0000-000000000001',
        3,
        'DRAFT',
        'Principles v3 Valid',
        '{"body": "Valid body text"}'::jsonb,
        NULL,
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
    );

    SELECT content_hash INTO v_hash FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000013';
    v_expected := public.calculate_content_hash('Principles v3 Valid', '{"body": "Valid body text"}'::jsonb);

    ASSERT v_hash IS NOT NULL AND v_hash = v_expected, 'HASH INTEGRITY VIOLATION: Authoritative hash was not derived!';

    -- Clean up test version 3
    DELETE FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000013';
END $$;

-- 5.7.3 Updating content_hash to arbitrary forged value on existing draft must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET content_hash = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'HASH INTEGRITY VIOLATION: In-place update to forged content_hash was accepted!';
END $$;

-- ============================================================================
-- 6. F-06: Prevent Direct Unapproved Publishing & Review Workflow
-- ============================================================================

-- 6.1 Admin cannot publish DRAFT directly
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';

DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET status = 'PUBLISHED',
            published_by = '99999999-9999-9999-9999-999999999999',
            published_at = NOW()
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-06 VIOLATION: Admin published a DRAFT directly without approval!';
END $$;

-- 6.2 Submit DRAFT to IN_REVIEW by Editor
SET LOCAL "request.jwt.claim.sub" = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

UPDATE public.content_versions
SET status = 'IN_REVIEW'
WHERE id = '00000000-0000-0000-0000-000000000011';

-- 6.3 Admin cannot publish IN_REVIEW directly
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';

DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET status = 'PUBLISHED',
            published_by = '99999999-9999-9999-9999-999999999999',
            published_at = NOW()
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-06 VIOLATION: Admin published an IN_REVIEW version without approval!';
END $$;

-- ============================================================================
-- 7. F-05: Scholar Reviewer Controls & Approved Immutability
-- ============================================================================

-- 7.1 Scholar Reviewer reviews and APPROVES version
SET LOCAL "request.jwt.claim.sub" = 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr';

UPDATE public.content_versions
SET status = 'APPROVED',
    review_notes = 'Theologically verified against primary texts.'
WHERE id = '00000000-0000-0000-0000-000000000011';

DO $$
DECLARE v_rev UUID;
BEGIN
    SELECT reviewed_by INTO v_rev FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000011';
    ASSERT v_rev = 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'F-05 VIOLATION: reviewed_by was not bound to authenticated reviewer!';
END $$;

-- 7.2 Reviewer CANNOT directly publish
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET status = 'PUBLISHED'
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-05 VIOLATION: Scholar reviewer published version directly!';
END $$;

-- 7.3 Content of APPROVED version CANNOT be modified while retaining APPROVED status
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET content_payload = '{"tampered": true}'::jsonb
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-05 VIOLATION: Modified content of version while in APPROVED status!';
END $$;

-- ============================================================================
-- 8. F-01: current_version_id Integrity Tests
-- ============================================================================

SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';

-- 8.1 current_version_id -> APPROVED must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_entities
        SET current_version_id = '00000000-0000-0000-0000-000000000011'
        WHERE id = '00000000-0000-0000-0000-000000000001';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-01 VIOLATION: current_version_id pointed to APPROVED version!';
END $$;

-- 8.2 current_version_id -> DRAFT must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_entities
        SET current_version_id = '00000000-0000-0000-0000-000000000021'
        WHERE id = '00000000-0000-0000-0000-000000000002';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-01 VIOLATION: current_version_id pointed to DRAFT version!';
END $$;

-- 8.3 Publish approved version 1 by Admin
UPDATE public.content_versions
SET status = 'PUBLISHED'
WHERE id = '00000000-0000-0000-0000-000000000011';

DO $$
DECLARE v_pub UUID;
BEGIN
    SELECT published_by INTO v_pub FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000011';
    ASSERT v_pub = '99999999-9999-9999-9999-999999999999', 'F-06 VIOLATION: published_by was not bound to authenticated admin!';
END $$;

-- 8.4 current_version_id -> another entity's version must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_entities
        SET current_version_id = '00000000-0000-0000-0000-000000000011' -- Belongs to Entity 1!
        WHERE id = '00000000-0000-0000-0000-000000000002';              -- Attempting on Entity 2!
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-01 VIOLATION: current_version_id pointed to another entity version!';
END $$;

-- 8.5 current_version_id -> correct PUBLISHED version must succeed
UPDATE public.content_entities
SET current_version_id = '00000000-0000-0000-0000-000000000011'
WHERE id = '00000000-0000-0000-0000-000000000001';

DO $$
BEGIN
    ASSERT (SELECT current_version_id FROM public.content_entities WHERE id = '00000000-0000-0000-0000-000000000001') = '00000000-0000-0000-0000-000000000011',
        'F-01: Valid current_version_id update failed!';
END $$;

-- ============================================================================
-- 9. F-02: PUBLISHED -> ARCHIVED Lifecycle & Immutability Tests
-- ============================================================================

-- 9.1 Attempting to archive version 1 while it is still active current_version_id must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET status = 'ARCHIVED'
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-01/F-02 VIOLATION: Active current_version was archived!';
END $$;

-- Create, Review, and Publish Version 2
SET LOCAL "request.jwt.claim.sub" = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

INSERT INTO public.content_versions (
    id, entity_id, version_number, status, title, content_payload, change_summary, parent_version_id, created_by
) VALUES (
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000001',
    2,
    'DRAFT',
    'Principles v2',
    '{"body": "Version 2 corrected text"}'::jsonb,
    'Expanded footnotes per scholar feedback.',
    '00000000-0000-0000-0000-000000000011',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
);

-- Submit to review
UPDATE public.content_versions SET status = 'IN_REVIEW' WHERE id = '00000000-0000-0000-0000-000000000012';

-- Scholar approves v2
SET LOCAL "request.jwt.claim.sub" = 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr';
UPDATE public.content_versions
SET status = 'APPROVED', review_notes = 'v2 verified.'
WHERE id = '00000000-0000-0000-0000-000000000012';

-- Admin publishes v2
SET LOCAL "request.jwt.claim.sub" = '99999999-9999-9999-9999-999999999999';
UPDATE public.content_versions SET status = 'PUBLISHED' WHERE id = '00000000-0000-0000-0000-000000000012';

-- Reassign entity current_version_id to v2
UPDATE public.content_entities
SET current_version_id = '00000000-0000-0000-0000-000000000012'
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 9.2 Changing content while archiving must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET status = 'ARCHIVED',
            content_payload = '{"altered": true}'::jsonb
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-02 VIOLATION: Content payload modified during archival!';
END $$;

-- 9.3 Changing attribution while archiving must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET status = 'ARCHIVED',
            created_by = '99999999-9999-9999-9999-999999999999'
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-02 VIOLATION: Attribution modified during archival!';
END $$;

-- 9.4 Legitimate PUBLISHED -> ARCHIVED transition should succeed
UPDATE public.content_versions
SET status = 'ARCHIVED'
WHERE id = '00000000-0000-0000-0000-000000000011';

DO $$
BEGIN
    ASSERT (SELECT status FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000011') = 'ARCHIVED',
        'F-02: Archival transition failed!';
END $$;

-- 9.5 ARCHIVED -> anything else must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_versions
        SET status = 'PUBLISHED'
        WHERE id = '00000000-0000-0000-0000-000000000011';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-02 VIOLATION: ARCHIVED version transitioned to another status!';
END $$;

-- 9.6 current_version_id -> ARCHIVED must fail
DO $$
DECLARE v_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        UPDATE public.content_entities
        SET current_version_id = '00000000-0000-0000-0000-000000000011'
        WHERE id = '00000000-0000-0000-0000-000000000001';
    EXCEPTION WHEN OTHERS THEN
        v_blocked := TRUE;
    END;
    ASSERT v_blocked = TRUE, 'F-01 VIOLATION: current_version_id set to ARCHIVED version!';
END $$;

-- ============================================================================
-- 10. Automated Audit Trail Verification
-- ============================================================================

DO $$
DECLARE 
    v_create_logs INT;
    v_approved_logs INT;
    v_published_logs INT;
    v_archived_logs INT;
BEGIN
    SELECT COUNT(*) INTO v_create_logs FROM public.audit_logs WHERE action = 'CONTENT_VERSION_CREATED';
    SELECT COUNT(*) INTO v_approved_logs FROM public.audit_logs WHERE action = 'CONTENT_VERSION_APPROVED';
    SELECT COUNT(*) INTO v_published_logs FROM public.audit_logs WHERE action = 'CONTENT_VERSION_PUBLISHED';
    SELECT COUNT(*) INTO v_archived_logs FROM public.audit_logs WHERE action = 'CONTENT_VERSION_ARCHIVED';

    ASSERT v_create_logs >= 3, 'Audit log missing for version creation';
    ASSERT v_approved_logs >= 2, 'Audit log missing for version approval';
    ASSERT v_published_logs >= 2, 'Audit log missing for version publication';
    ASSERT v_archived_logs >= 1, 'Audit log missing for version archival';
END $$;

-- ============================================================================
-- 11. Anonymous Public Read Boundary Tests
-- ============================================================================

SET LOCAL ROLE anon;

DO $$
BEGIN
    -- Public can view active published version 2
    ASSERT (SELECT COUNT(*) FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000012') = 1,
        'Public cannot view published v2';

    -- Public can view archived version 1 (for historical provenance)
    ASSERT (SELECT COUNT(*) FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000011') = 1,
        'Public cannot view archived v1';

    -- Public CANNOT view Tafsir v1 which is still in DRAFT
    ASSERT (SELECT COUNT(*) FROM public.content_versions WHERE id = '00000000-0000-0000-0000-000000000021') = 0,
        'SECURITY VIOLATION: Public viewed draft version!';
END $$;

-- Rollback mock test transaction
ROLLBACK;
