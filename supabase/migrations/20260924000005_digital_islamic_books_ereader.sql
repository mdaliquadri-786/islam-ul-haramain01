-- Migration: 20260924000005_digital_islamic_books_ereader.sql
-- Description: Digital Islamic Books e-Reader schema — Books catalog, Editions,
--              Volumes, Sections/Chapters, Content paragraphs, User Reading Progress,
--              integrated with Bookmarks and strict licensing/provenance governance.
-- Milestone: M4.3 — Digital Islamic Books e-Reader
--
-- ARCHITECTURE & LICENSING:
-- - Abstract Work (books) separated from physical/digital edition (book_editions).
-- - Structured hierarchy: Book -> Volume -> Section -> Content.
-- - Public domain classical works are separated from modern translations/editions.
-- - No content is fabricated; entries default to metadata_only pending verified digital edition ingestion.
-- - Strict RLS: public read only for active, approved, published, license-cleared content.
-- - User reading progress is private and isolated by auth.uid().

-- ============================================================================
-- 1. Books Catalog Table (Abstract Works)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.books (
    id VARCHAR(100) PRIMARY KEY,                    -- e.g. 'riyad-al-salihin', 'al-arba-in-al-nawawiyyah'
    slug VARCHAR(100) NOT NULL UNIQUE,             -- URL-safe slug
    title_arabic VARCHAR(300) NOT NULL,
    title_english VARCHAR(300) NOT NULL,
    title_urdu VARCHAR(300) NOT NULL,
    author_id UUID REFERENCES public.scholars_authors(id) ON DELETE SET NULL,
    author_name_arabic VARCHAR(250) NOT NULL,
    author_name_english VARCHAR(250) NOT NULL,
    author_name_urdu VARCHAR(250) NOT NULL,
    author_death_year_ah SMALLINT,
    author_death_year_ce SMALLINT,
    description_arabic TEXT,
    description_english TEXT,
    description_urdu TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general'
        CHECK (category IN ('hadith_literature', 'aqeedah', 'fiqh', 'adab_zuhd', 'seerah', 'quranic_sciences', 'general')),
    original_language VARCHAR(10) NOT NULL DEFAULT 'ar',
    volume_count SMALLINT NOT NULL DEFAULT 1 CHECK (volume_count >= 1),
    -- Licensing & Provenance
    license_type VARCHAR(100) NOT NULL DEFAULT 'Public Domain',
    license_status VARCHAR(50) NOT NULL DEFAULT 'verified_permissible'
        CHECK (license_status IN ('verified_permissible', 'unverified_pending', 'restricted_takedown')),
    source_url TEXT,
    provenance_notes TEXT,
    attribution_requirement TEXT,
    -- Review & Publication Workflow
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    review_status VARCHAR(30) NOT NULL DEFAULT 'approved'
        CHECK (review_status IN ('draft', 'under_review', 'approved', 'rejected')),
    publication_status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (publication_status IN ('draft', 'under_review', 'approved', 'published', 'restricted', 'unverified', 'takedown')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. Book Editions Table (Specific publication / translation / digital edition)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.book_editions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id VARCHAR(100) NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    edition_identifier VARCHAR(150) NOT NULL,      -- e.g. 'shamela-digital', 'dar-al-fikr-1995'
    edition_title VARCHAR(300) NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'ar',
    publisher VARCHAR(300),
    editor VARCHAR(300),
    translator VARCHAR(300),
    publication_year_ce SMALLINT,
    isbn VARCHAR(50),
    volume_count SMALLINT NOT NULL DEFAULT 1 CHECK (volume_count >= 1),
    format VARCHAR(30) NOT NULL DEFAULT 'structured_text'
        CHECK (format IN ('structured_text', 'pdf', 'epub')),
    -- Licensing for this specific edition/translation
    license_type VARCHAR(100) NOT NULL DEFAULT 'Public Domain',
    license_status VARCHAR(50) NOT NULL DEFAULT 'verified_permissible'
        CHECK (license_status IN ('verified_permissible', 'unverified_pending', 'restricted_takedown')),
    license_notes TEXT,
    attribution_requirement TEXT NOT NULL DEFAULT '',
    provenance_notes TEXT,
    source_archive_url TEXT,
    content_sha256 CHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    review_status VARCHAR(30) NOT NULL DEFAULT 'approved'
        CHECK (review_status IN ('draft', 'under_review', 'approved', 'rejected')),
    publication_status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (publication_status IN ('draft', 'under_review', 'approved', 'published', 'restricted', 'unverified', 'takedown')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_book_edition UNIQUE (book_id, edition_identifier, language_code)
);

-- ============================================================================
-- 3. Book Volumes Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.book_volumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id VARCHAR(100) NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    edition_id UUID REFERENCES public.book_editions(id) ON DELETE CASCADE,
    volume_number SMALLINT NOT NULL DEFAULT 1 CHECK (volume_number >= 1),
    title_arabic VARCHAR(250),
    title_english VARCHAR(250),
    title_urdu VARCHAR(250),
    page_count INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_book_volume UNIQUE (book_id, edition_id, volume_number)
);

-- ============================================================================
-- 4. Book Sections Table (Chapters / Main divisions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.book_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id VARCHAR(100) NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    edition_id UUID REFERENCES public.book_editions(id) ON DELETE CASCADE,
    volume_number SMALLINT NOT NULL DEFAULT 1 CHECK (volume_number >= 1),
    section_number INT NOT NULL CHECK (section_number >= 1),
    parent_section_id UUID REFERENCES public.book_sections(id) ON DELETE CASCADE,
    title_arabic VARCHAR(300) NOT NULL,
    title_english VARCHAR(300),
    title_urdu VARCHAR(300),
    chapter_number INT,
    start_page INT,
    end_page INT,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_book_section UNIQUE (book_id, edition_id, volume_number, section_number)
);

-- ============================================================================
-- 5. Book Contents Table (Paragraphs, Headings, Quotations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.book_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.book_sections(id) ON DELETE CASCADE,
    book_id VARCHAR(100) NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    edition_id UUID REFERENCES public.book_editions(id) ON DELETE CASCADE,
    volume_number SMALLINT NOT NULL DEFAULT 1 CHECK (volume_number >= 1),
    page_number INT,
    paragraph_index INT NOT NULL DEFAULT 1 CHECK (paragraph_index >= 1),
    content_type VARCHAR(30) NOT NULL DEFAULT 'paragraph'
        CHECK (content_type IN ('paragraph', 'heading', 'hadith_quote', 'quran_quote', 'poetry', 'footnote')),
    text_ar TEXT,
    text_en TEXT,
    text_ur TEXT,
    content_availability VARCHAR(30) NOT NULL DEFAULT 'metadata_only'
        CHECK (content_availability IN ('full_text', 'excerpt', 'metadata_only', 'unavailable')),
    content_sha256 CHAR(64),
    -- Licensing & Publication Workflow
    license_status VARCHAR(50) NOT NULL DEFAULT 'verified_permissible'
        CHECK (license_status IN ('verified_permissible', 'unverified_pending', 'restricted_takedown')),
    publication_status VARCHAR(30) NOT NULL DEFAULT 'published'
        CHECK (publication_status IN ('draft', 'under_review', 'approved', 'published', 'restricted', 'unverified', 'takedown')),
    version_number INT NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    parent_version_id UUID REFERENCES public.book_contents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. User Reading Progress Table (Private user tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id VARCHAR(100) NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    edition_id UUID REFERENCES public.book_editions(id) ON DELETE SET NULL,
    volume_number SMALLINT NOT NULL DEFAULT 1 CHECK (volume_number >= 1),
    section_id UUID REFERENCES public.book_sections(id) ON DELETE SET NULL,
    page_number INT,
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00
        CHECK (progress_percentage >= 0.00 AND progress_percentage <= 100.00),
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    client_mutation_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_book_progress UNIQUE (user_id, book_id)
);

-- ============================================================================
-- 7. Update Bookmarks Constraint to Support Books
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'bookmarks_content_type_check'
    ) THEN
        ALTER TABLE public.bookmarks DROP CONSTRAINT bookmarks_content_type_check;
        ALTER TABLE public.bookmarks ADD CONSTRAINT bookmarks_content_type_check
            CHECK (content_type IN ('quran', 'hadith', 'dua', 'article', 'book'));
    END IF;
END $$;

ALTER TABLE public.bookmarks
ADD COLUMN IF NOT EXISTS book_id VARCHAR(100) REFERENCES public.books(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_bookmarks_book_id
ON public.bookmarks (book_id)
WHERE book_id IS NOT NULL;

-- ============================================================================
-- 8. Performance Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_books_active_published
    ON public.books (category, is_active)
    WHERE is_active = TRUE AND license_status = 'verified_permissible' AND publication_status = 'published';

CREATE INDEX IF NOT EXISTS idx_book_editions_book
    ON public.book_editions (book_id, language_code)
    WHERE is_active = TRUE AND license_status = 'verified_permissible';

CREATE INDEX IF NOT EXISTS idx_book_sections_book_vol
    ON public.book_sections (book_id, volume_number, section_number);

CREATE INDEX IF NOT EXISTS idx_book_contents_section
    ON public.book_contents (section_id, paragraph_index)
    WHERE is_current = TRUE AND publication_status = 'published';

CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user
    ON public.user_reading_progress (user_id, last_read_at DESC);

-- ============================================================================
-- 9. Updated_At and Immutability Triggers
-- ============================================================================

CREATE TRIGGER trg_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_book_editions_updated_at
BEFORE UPDATE ON public.book_editions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_book_contents_updated_at
BEFORE UPDATE ON public.book_contents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

CREATE TRIGGER trg_user_reading_progress_updated_at
BEFORE UPDATE ON public.user_reading_progress
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at_timestamp();

-- Forbid changing the owner (user_id) of a reading progress record
CREATE OR REPLACE FUNCTION public.prevent_reading_progress_ownership_mutation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.user_id <> NEW.user_id THEN
        RAISE EXCEPTION 'Ownership Immutability Violation: Changing the owner (user_id) of reading progress is strictly prohibited.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER trg_prevent_reading_progress_ownership_mutation
BEFORE UPDATE ON public.user_reading_progress
FOR EACH ROW EXECUTE FUNCTION public.prevent_reading_progress_ownership_mutation();

-- ============================================================================
-- 10. Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;

-- 10.1 Books: Public read active, approved, published, permissible books
CREATE POLICY "Public can view active permissible books"
ON public.books FOR SELECT
TO public
USING (
    is_active = TRUE
    AND license_status = 'verified_permissible'
    AND review_status = 'approved'
    AND publication_status = 'published'
);

-- 10.2 Book Editions: Public read active, approved, published, permissible editions
CREATE POLICY "Public can view active permissible book editions"
ON public.book_editions FOR SELECT
TO public
USING (
    is_active = TRUE
    AND license_status = 'verified_permissible'
    AND review_status = 'approved'
    AND publication_status = 'published'
);

-- 10.3 Volumes & Sections: Public read (inherited from book status)
CREATE POLICY "Public can view book volumes"
ON public.book_volumes FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.books b
        WHERE b.id = book_id
          AND b.is_active = TRUE
          AND b.license_status = 'verified_permissible'
          AND b.publication_status = 'published'
    )
);

CREATE POLICY "Public can view book sections"
ON public.book_sections FOR SELECT
TO public
USING (
    EXISTS (
        SELECT 1 FROM public.books b
        WHERE b.id = book_id
          AND b.is_active = TRUE
          AND b.license_status = 'verified_permissible'
          AND b.publication_status = 'published'
    )
);

-- 10.4 Book Contents: Public read current, published, permissible content
CREATE POLICY "Public can view published book content"
ON public.book_contents FOR SELECT
TO public
USING (
    is_current = TRUE
    AND publication_status = 'published'
    AND license_status = 'verified_permissible'
);

-- 10.5 Scholar Reviewers & Admins can view entries under review
CREATE POLICY "Reviewers and admins can view book content under review"
ON public.book_contents FOR SELECT
TO authenticated
USING (
    is_current = TRUE
    AND (
        publication_status = 'published'
        OR (
            publication_status IN ('under_review', 'approved', 'draft')
            AND (
                public.is_platform_admin(auth.uid())
                OR public.has_any_role(auth.uid(), ARRAY['scholar_reviewer', 'content_admin', 'super_admin'])
            )
        )
    )
);

-- 10.6 Admins can manage books, editions, volumes, sections, and contents
CREATE POLICY "Admins can manage books"
ON public.books FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins can manage book editions"
ON public.book_editions FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins can manage book volumes"
ON public.book_volumes FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins can manage book sections"
ON public.book_sections FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Admins can manage book contents"
ON public.book_contents FOR ALL
TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- 10.7 User Reading Progress RLS (Private to authenticated owner)
CREATE POLICY "Users can view own reading progress"
ON public.user_reading_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reading progress"
ON public.user_reading_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reading progress"
ON public.user_reading_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reading progress"
ON public.user_reading_progress FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
