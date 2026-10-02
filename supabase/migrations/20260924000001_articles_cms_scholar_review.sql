-- Migration: 20260924000001_articles_cms_scholar_review.sql
-- Description: Articles CMS schema, categories, revisions, scholar review assignments, review comments, and strict publication gating.
-- Milestone: M3.2 — Articles CMS & Scholar Review Workflow

-- ============================================================================
-- 1. Article Categories & Taxonomy
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.article_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_arabic VARCHAR(150) NOT NULL,
    name_english VARCHAR(150) NOT NULL,
    name_urdu VARCHAR(150) NOT NULL,
    description_english TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_article_categories_slug ON public.article_categories (slug);
CREATE INDEX idx_article_categories_active ON public.article_categories (is_active, display_order);

CREATE TRIGGER trg_article_categories_updated_at
BEFORE UPDATE ON public.article_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TABLE IF NOT EXISTS public.article_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar', 'ur')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_article_tags_slug ON public.article_tags (slug);

-- ============================================================================
-- 2. Articles Core Table (Logical Identity & Current State)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(300),
    excerpt TEXT,
    language VARCHAR(10) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar', 'ur')),
    category_id UUID REFERENCES public.article_categories(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN (
            'DRAFT',
            'SUBMITTED_FOR_REVIEW',
            'UNDER_REVIEW',
            'CHANGES_REQUESTED',
            'RESUBMITTED',
            'APPROVED',
            'PUBLISHED',
            'REJECTED',
            'WITHDRAWN'
        )),
    current_revision_id UUID, -- Forward reference to active article_revisions
    published_revision_id UUID, -- Forward reference to approved & released article_revisions
    primary_madhhab VARCHAR(30) CHECK (primary_madhhab IN ('hanafi', 'hanbali', 'shafii', 'maliki', 'general')),
    featured_image_url TEXT,
    reading_time_minutes SMALLINT NOT NULL DEFAULT 3 CHECK (reading_time_minutes >= 1),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON public.articles (slug);
CREATE INDEX idx_articles_status ON public.articles (status);
CREATE INDEX idx_articles_author ON public.articles (author_id);
CREATE INDEX idx_articles_category ON public.articles (category_id);
CREATE INDEX idx_articles_published_at ON public.articles (published_at DESC) WHERE status = 'PUBLISHED';

CREATE TRIGGER trg_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- ============================================================================
-- 3. Article Revisions Table (Immutable Historical Content Snapshots)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.article_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    revision_number INT NOT NULL CHECK (revision_number >= 1),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(300),
    excerpt TEXT,
    body_markdown TEXT NOT NULL,
    content_hash CHAR(64) NOT NULL, -- SHA-256 of canonical (title + body_markdown + source_references)
    change_summary TEXT,
    source_references JSONB NOT NULL DEFAULT '[]'::jsonb, -- Verified citations (Quran, Hadith, Duas, Classical manuals)
    licensing_metadata JSONB NOT NULL DEFAULT '{"license": "CC-BY-SA-4.0", "attribution": "Islam ul Haramain"}'::jsonb,
    ai_assistance_metadata JSONB NOT NULL DEFAULT '{"is_ai_assisted": false}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN (
            'DRAFT',
            'SUBMITTED_FOR_REVIEW',
            'UNDER_REVIEW',
            'CHANGES_REQUESTED',
            'RESUBMITTED',
            'APPROVED',
            'REJECTED',
            'SUPERSEDED'
        )),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_article_revision_number UNIQUE (article_id, revision_number)
);

CREATE INDEX idx_article_revisions_article ON public.article_revisions (article_id, revision_number DESC);
CREATE INDEX idx_article_revisions_status ON public.article_revisions (status);
CREATE INDEX idx_article_revisions_hash ON public.article_revisions (content_hash);

-- Link forward foreign keys on articles
ALTER TABLE public.articles
    ADD CONSTRAINT fk_articles_current_revision
    FOREIGN KEY (current_revision_id) REFERENCES public.article_revisions(id) ON DELETE SET NULL;

ALTER TABLE public.articles
    ADD CONSTRAINT fk_articles_published_revision
    FOREIGN KEY (published_revision_id) REFERENCES public.article_revisions(id) ON DELETE SET NULL;

-- Article Tag Mappings (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.article_tag_mappings (
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.article_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- ============================================================================
-- 4. Scholar Review Assignments & Decisions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scholar_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    revision_id UUID NOT NULL REFERENCES public.article_revisions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    assigned_by UUID NOT NULL REFERENCES auth.users(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED')),
    decision VARCHAR(30) CHECK (decision IN ('APPROVED', 'CHANGES_REQUESTED', 'REJECTED')),
    scholarly_notes TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT uq_scholar_review_revision_reviewer UNIQUE (revision_id, reviewer_id)
);

CREATE INDEX idx_scholar_reviews_reviewer ON public.scholar_reviews (reviewer_id, status);
CREATE INDEX idx_scholar_reviews_revision ON public.scholar_reviews (revision_id);
CREATE INDEX idx_scholar_reviews_article ON public.scholar_reviews (article_id);

-- ============================================================================
-- 5. Scholar Review Comments & Annotations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scholar_review_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.scholar_reviews(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    revision_id UUID NOT NULL REFERENCES public.article_revisions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id),
    comment_type VARCHAR(30) NOT NULL DEFAULT 'general'
        CHECK (comment_type IN ('general', 'correction_requested', 'scholarly_note', 'fiqh_inquiry')),
    paragraph_reference VARCHAR(100),
    comment_text TEXT NOT NULL,
    resolution_status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (resolution_status IN ('open', 'resolved', 'acknowledged')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scholar_review_comments_review ON public.scholar_review_comments (review_id);
CREATE INDEX idx_scholar_review_comments_revision ON public.scholar_review_comments (revision_id);

-- ============================================================================
-- 6. Integrity Triggers & Governance Enforcement
-- ============================================================================

-- 6.1 Prevent Author Self-Approval
CREATE OR REPLACE FUNCTION public.prevent_author_self_approval()
RETURNS TRIGGER AS $$
DECLARE
    v_author_id UUID;
BEGIN
    SELECT author_id INTO v_author_id
    FROM public.articles
    WHERE id = NEW.article_id;

    IF NEW.reviewer_id = v_author_id AND NEW.decision = 'APPROVED' THEN
        RAISE EXCEPTION 'Self-Approval Violation: An author cannot approve their own religious article. Separation of duties requires an independent scholar review.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_prevent_author_self_approval
BEFORE INSERT OR UPDATE ON public.scholar_reviews
FOR EACH ROW EXECUTE FUNCTION public.prevent_author_self_approval();

-- 6.2 Enforce Strict Publication Gating
CREATE OR REPLACE FUNCTION public.verify_article_publication_gate()
RETURNS TRIGGER AS $$
DECLARE
    v_has_approved_review BOOLEAN := FALSE;
    v_rev_article_id UUID;
    v_rev_status VARCHAR(30);
BEGIN
    -- Only evaluate when transitioning to PUBLISHED
    IF NEW.status = 'PUBLISHED' AND (OLD.status IS NULL OR OLD.status <> 'PUBLISHED') THEN
        -- 1. Must specify published_revision_id
        IF NEW.published_revision_id IS NULL THEN
            RAISE EXCEPTION 'Publication Gate Violation: Cannot publish article without a certified published_revision_id.';
        END IF;

        -- 2. Verify revision exists, belongs to this article, and is in APPROVED status
        SELECT article_id, status INTO v_rev_article_id, v_rev_status
        FROM public.article_revisions
        WHERE id = NEW.published_revision_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Publication Gate Violation: Referenced published_revision_id % does not exist.', NEW.published_revision_id;
        END IF;

        IF v_rev_article_id <> NEW.id THEN
            RAISE EXCEPTION 'Publication Gate Violation: Referenced revision % belongs to article %, not %.', NEW.published_revision_id, v_rev_article_id, NEW.id;
        END IF;

        IF v_rev_status <> 'APPROVED' THEN
            RAISE EXCEPTION 'Publication Gate Violation: Target revision % has status %, but only APPROVED revisions can be published.', NEW.published_revision_id, v_rev_status;
        END IF;

        -- 3. Verify at least one APPROVED review exists for this exact revision by an independent reviewer
        SELECT EXISTS (
            SELECT 1 FROM public.scholar_reviews
            WHERE revision_id = NEW.published_revision_id
              AND decision = 'APPROVED'
              AND reviewer_id <> NEW.author_id
        ) INTO v_has_approved_review;

        IF NOT v_has_approved_review THEN
            RAISE EXCEPTION 'Publication Gate Violation: No verified independent scholar approval exists for revision %.', NEW.published_revision_id;
        END IF;

        -- 4. Set published_at timestamp if not present
        IF NEW.published_at IS NULL THEN
            NEW.published_at = NOW();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_verify_article_publication_gate
BEFORE INSERT OR UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.verify_article_publication_gate();

-- 6.3 Prevent Modification of Approved or Published Revisions (Immutability Guarantee)
CREATE OR REPLACE FUNCTION public.prevent_reviewed_revision_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('APPROVED', 'SUPERSEDED') THEN
        IF (OLD.body_markdown <> NEW.body_markdown OR
            OLD.content_hash <> NEW.content_hash OR
            OLD.title <> NEW.title OR
            OLD.source_references <> NEW.source_references) THEN
            RAISE EXCEPTION 'Immutable Revision: Revision % is % and cannot be altered. Create a new revision instead.', OLD.revision_number, OLD.status;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_prevent_reviewed_revision_mutation
BEFORE UPDATE ON public.article_revisions
FOR EACH ROW EXECUTE FUNCTION public.prevent_reviewed_revision_mutation();

-- ============================================================================
-- 7. Row Level Security (RLS) Configuration
-- ============================================================================

ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tag_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_review_comments ENABLE ROW LEVEL SECURITY;

-- 7.1 Categories & Tags Policies
CREATE POLICY "Public can view active article categories"
ON public.article_categories FOR SELECT
TO public
USING (is_active = TRUE);

CREATE POLICY "Staff can manage article categories"
ON public.article_categories FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']));

CREATE POLICY "Public can view article tags"
ON public.article_tags FOR SELECT
TO public
USING (TRUE);

CREATE POLICY "Staff can manage article tags"
ON public.article_tags FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']));

CREATE POLICY "Public can view article tag mappings"
ON public.article_tag_mappings FOR SELECT
TO public
USING (TRUE);

CREATE POLICY "Staff can manage article tag mappings"
ON public.article_tag_mappings FOR ALL
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']));

-- 7.2 Articles Policies
-- Public can ONLY view published articles
CREATE POLICY "Public can view published articles"
ON public.articles FOR SELECT
TO public
USING (status = 'PUBLISHED');

-- Authors can view their own articles
CREATE POLICY "Authors can view own articles"
ON public.articles FOR SELECT
TO authenticated
USING (author_id = auth.uid());

-- Staff can view all articles
CREATE POLICY "Staff can view all articles"
ON public.articles FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer', 'editor']));

-- Authors can create new draft articles
CREATE POLICY "Authors can insert own draft articles"
ON public.articles FOR INSERT
TO authenticated
WITH CHECK (
    author_id = auth.uid() AND
    status = 'DRAFT' AND
    published_revision_id IS NULL AND
    published_at IS NULL
);

-- Authors can update their own drafts/resubmissions (cannot publish or approve)
CREATE POLICY "Authors can update own non-published articles"
ON public.articles FOR UPDATE
TO authenticated
USING (
    author_id = auth.uid() AND
    status IN ('DRAFT', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'RESUBMITTED', 'WITHDRAWN')
)
WITH CHECK (
    author_id = auth.uid() AND
    status IN ('DRAFT', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED', 'RESUBMITTED', 'WITHDRAWN') AND
    published_revision_id IS NULL
);

-- Editors and Admins can manage articles (review assignment, publication)
CREATE POLICY "Admins and Editors can update all articles"
ON public.articles FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']));

-- 7.3 Article Revisions Policies
-- Public can ONLY view the exact published revision of a published article
CREATE POLICY "Public can view published article revision"
ON public.article_revisions FOR SELECT
TO public
USING (
    id = (
        SELECT published_revision_id 
        FROM public.articles 
        WHERE id = article_revisions.article_id AND status = 'PUBLISHED'
    )
);

-- Authors can view all revisions of their own articles
CREATE POLICY "Authors can view own article revisions"
ON public.article_revisions FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Scholars and staff can view all revisions for evaluation
CREATE POLICY "Staff can view all article revisions"
ON public.article_revisions FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer', 'editor']));

-- Authors can insert new revisions for their own articles in DRAFT status
CREATE POLICY "Authors can insert draft revisions"
ON public.article_revisions FOR INSERT
TO authenticated
WITH CHECK (
    created_by = auth.uid() AND
    status IN ('DRAFT', 'SUBMITTED_FOR_REVIEW') AND
    EXISTS (
        SELECT 1 FROM public.articles
        WHERE id = article_revisions.article_id AND author_id = auth.uid()
    )
);

-- Scholars and admins can update revision status (e.g. APPROVED, REJECTED, SUPERSEDED)
CREATE POLICY "Staff can update revision status"
ON public.article_revisions FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer', 'editor']))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'scholar_reviewer', 'editor']));

-- 7.4 Scholar Reviews Policies
-- Public CANNOT view scholar reviews
-- Reviewers can view their assigned reviews
CREATE POLICY "Reviewers can view assigned reviews"
ON public.scholar_reviews FOR SELECT
TO authenticated
USING (
    reviewer_id = auth.uid() OR
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor'])
);

-- Authors can view review decisions on their own articles (for feedback)
CREATE POLICY "Authors can view review decision on own articles"
ON public.scholar_reviews FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.articles
        WHERE id = scholar_reviews.article_id AND author_id = auth.uid()
    )
);

-- Editors and Admins can assign reviews
CREATE POLICY "Staff can assign reviews"
ON public.scholar_reviews FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']));

-- Reviewers can update their own reviews (submit decision, scholarly notes)
CREATE POLICY "Reviewers can update own reviews"
ON public.scholar_reviews FOR UPDATE
TO authenticated
USING (
    reviewer_id = auth.uid() AND
    public.has_any_role(auth.uid(), ARRAY['scholar_reviewer', 'super_admin', 'content_admin'])
)
WITH CHECK (
    reviewer_id = auth.uid() AND
    public.has_any_role(auth.uid(), ARRAY['scholar_reviewer', 'super_admin', 'content_admin'])
);

-- 7.5 Scholar Review Comments Policies
-- Public CANNOT view review comments
CREATE POLICY "Reviewers and Authors can view review comments"
ON public.scholar_review_comments FOR SELECT
TO authenticated
USING (
    reviewer_id = auth.uid() OR
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin', 'editor']) OR
    EXISTS (
        SELECT 1 FROM public.articles
        WHERE id = scholar_review_comments.article_id AND author_id = auth.uid()
    )
);

CREATE POLICY "Reviewers can insert review comments"
ON public.scholar_review_comments FOR INSERT
TO authenticated
WITH CHECK (
    reviewer_id = auth.uid() AND
    public.has_any_role(auth.uid(), ARRAY['scholar_reviewer', 'super_admin', 'content_admin', 'editor'])
);

CREATE POLICY "Reviewers and Admins can update comment status"
ON public.scholar_review_comments FOR UPDATE
TO authenticated
USING (
    reviewer_id = auth.uid() OR
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin'])
)
WITH CHECK (
    reviewer_id = auth.uid() OR
    public.has_any_role(auth.uid(), ARRAY['super_admin', 'content_admin'])
);
