-- Migration: 20260922000004_m1_3_content_hash_integrity.sql
-- Description: Authoritative cryptographic derivation and validation for content_hash.
-- Milestone: M1.3 Integrity Hardening — Content Hash Cryptographic Verification

-- Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Deterministic Canonical Content Hash Calculation Function
-- ============================================================================

-- Computes the deterministic SHA-256 hash across canonical title and JSONB payload.
-- PostgreSQL JSONB normalizes key ordering and whitespace, ensuring a stable byte representation.
CREATE OR REPLACE FUNCTION public.calculate_content_hash(p_title TEXT, p_payload JSONB)
RETURNS CHAR(64) AS $$
DECLARE
    v_canonical_text TEXT;
BEGIN
    -- Canonical representation: title concatenated with normalized JSONB string
    v_canonical_text := COALESCE(p_title, '') || E'\n' || COALESCE(p_payload, '{}'::jsonb)::text;
    
    RETURN encode(digest(convert_to(v_canonical_text, 'UTF8'), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = extensions, public, pg_temp;

-- ============================================================================
-- 2. Trigger: Authoritative Hash Enforcement and Validation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_content_version_hash()
RETURNS TRIGGER AS $$
DECLARE
    v_authoritative_hash CHAR(64);
BEGIN
    -- Always compute the authoritative hash from the canonical title and content payload
    v_authoritative_hash := public.calculate_content_hash(NEW.title, NEW.content_payload);

    -- If a client explicitly provided a content_hash, it MUST match the authoritative calculation.
    -- Arbitrary, forged, or mismatched hashes are strictly rejected with an exception.
    IF NEW.content_hash IS NOT NULL AND LOWER(NEW.content_hash) <> LOWER(v_authoritative_hash) THEN
        RAISE EXCEPTION 'Integrity violation: Client-supplied content_hash (%) does not match authoritative canonical hash (%).',
            NEW.content_hash, v_authoritative_hash;
    END IF;

    -- Guarantee that content_hash is always populated with the authoritative hash
    NEW.content_hash := v_authoritative_hash;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = extensions, public, pg_temp;

DROP TRIGGER IF EXISTS trg_content_versions_hash_enforce ON public.content_versions;
CREATE TRIGGER trg_content_versions_hash_enforce
BEFORE INSERT OR UPDATE OF title, content_payload, content_hash ON public.content_versions
FOR EACH ROW EXECUTE FUNCTION public.enforce_content_version_hash();

-- Privilege hardening
REVOKE EXECUTE ON FUNCTION public.calculate_content_hash(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_content_hash(TEXT, JSONB) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.enforce_content_version_hash() FROM PUBLIC;
