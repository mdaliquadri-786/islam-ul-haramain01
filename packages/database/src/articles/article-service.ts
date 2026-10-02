/**
 * @file article-service.ts
 * @package @islamic/database
 * @description Production-grade Articles CMS and Scholar Review Workflow service.
 * Supports PostgreSQL / Supabase integration with full Row Level Security,
 * plus optimized in-memory store for serverless, edge, and testing environments.
 * Milestone: Phase 3 -> Milestone 3.2
 */

import {
  ArticleStatus,
  ArticleRevisionStatus,
  ScholarReviewStatus,
  ScholarReviewDecision,
  ReviewCommentType,
  ArticleCategory,
  ArticleTag,
  ArticleEntity,
  ArticleRevisionEntity,
  ScholarReviewEntity,
  ScholarReviewCommentEntity,
  ArticleSourceReference,
  ArticleLicensingMetadata,
  ArticleAiAssistanceMetadata,
  UserRole,
  calculateArticleContentHash,
  validateArticleTransition,
  verifyPublicationGate,
  validateAiGovernance,
  validateLicensing,
  validateArticleCitations
} from '@islamic/islamic-engine';
import { SupabaseClient } from '@supabase/supabase-js';

export interface CreateArticleDraftInput {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  language?: 'en' | 'ar' | 'ur';
  categoryId?: string;
  primaryMadhhab?: 'hanafi' | 'hanbali' | 'shafii' | 'maliki' | 'general';
  featuredImageUrl?: string;
  readingTimeMinutes?: number;
  bodyMarkdown: string;
  sourceReferences?: ArticleSourceReference[];
  licensingMetadata?: ArticleLicensingMetadata;
  aiAssistanceMetadata?: ArticleAiAssistanceMetadata;
  changeSummary?: string;
}

export interface ActorContext {
  id: string;
  roles: UserRole[];
}

export interface AuditEventRecord {
  id: string;
  action: string;
  actorId?: string;
  targetEntityType: string;
  targetEntityId?: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export class ArticleService {
  private supabaseClient?: SupabaseClient;

  // In-memory repositories for testing, edge, and offline environments
  private categoriesMap = new Map<string, ArticleCategory>();
  private tagsMap = new Map<string, ArticleTag>();
  private articlesMap = new Map<string, ArticleEntity>();
  private revisionsMap = new Map<string, ArticleRevisionEntity>();
  private reviewsMap = new Map<string, ScholarReviewEntity>();
  private commentsMap = new Map<string, ScholarReviewCommentEntity>();
  private auditLogsList: AuditEventRecord[] = [];

  constructor(options: { supabaseClient?: SupabaseClient } = {}) {
    this.supabaseClient = options.supabaseClient;
    this.seedDefaultCategories();
  }

  private seedDefaultCategories(): void {
    const defaultCats: ArticleCategory[] = [
      {
        id: '00000000-0000-0000-0001-000000000001',
        slug: 'aqeedah',
        nameArabic: 'العقيدة الإسلامية',
        nameEnglish: 'Islamic Creed & Theology',
        nameUrdu: 'اسلامی عقائد',
        descriptionEnglish: 'Foundational creed of Ahl al-Sunnah wa al-Jama`ah.',
        isActive: true,
        displayOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0001-000000000002',
        slug: 'fiqh',
        nameArabic: 'الفقه وأصوله',
        nameEnglish: 'Jurisprudence & Legal Principles',
        nameUrdu: 'فقہ اور اصول فقہ',
        descriptionEnglish: 'Comparative rulings of the four Sunni schools of law.',
        isActive: true,
        displayOrder: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0001-000000000003',
        slug: 'quran-tafsir',
        nameArabic: 'القرآن والتفسير',
        nameEnglish: 'Quran & Exegesis',
        nameUrdu: 'قرآن اور تفسیر',
        descriptionEnglish: 'Classical Quranic commentary and reflection.',
        isActive: true,
        displayOrder: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0001-000000000004',
        slug: 'hadith-sciences',
        nameArabic: 'علوم الحديث',
        nameEnglish: 'Hadith Sciences & Evaluation',
        nameUrdu: 'علوم الحدیث',
        descriptionEnglish: 'Sanad transmission, authentication, and preservation.',
        isActive: true,
        displayOrder: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '00000000-0000-0000-0001-000000000005',
        slug: 'seerah-history',
        nameArabic: 'السيرة النبوية والتاريخ',
        nameEnglish: 'Prophetic Biography & History',
        nameUrdu: 'سیرت النبی اور اسلامی تاریخ',
        descriptionEnglish: 'Verified history of the Prophet and early Islam.',
        isActive: true,
        displayOrder: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const cat of defaultCats) {
      this.categoriesMap.set(cat.id, cat);
    }
  }

  // ==========================================================================
  // Category & Taxonomy Operations
  // ==========================================================================

  public async listCategories(): Promise<ArticleCategory[]> {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('article_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw new Error(`Failed to list categories: ${error.message}`);
      return (data || []).map(row => ({
        id: row.id,
        slug: row.slug,
        nameArabic: row.name_arabic,
        nameEnglish: row.name_english,
        nameUrdu: row.name_urdu,
        descriptionEnglish: row.description_english,
        isActive: row.is_active,
        displayOrder: row.display_order,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    }

    return Array.from(this.categoriesMap.values())
      .filter(c => c.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public async createCategory(category: Omit<ArticleCategory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArticleCategory> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newCategory: ArticleCategory = {
      ...category,
      id,
      createdAt: now,
      updatedAt: now
    };

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('article_categories')
        .insert({
          id,
          slug: category.slug,
          name_arabic: category.nameArabic,
          name_english: category.nameEnglish,
          name_urdu: category.nameUrdu,
          description_english: category.descriptionEnglish,
          is_active: category.isActive,
          display_order: category.displayOrder
        })
        .select()
        .single();

      if (error) throw new Error(`Failed to create category: ${error.message}`);
      return {
        id: data.id,
        slug: data.slug,
        nameArabic: data.name_arabic,
        nameEnglish: data.name_english,
        nameUrdu: data.name_urdu,
        descriptionEnglish: data.description_english,
        isActive: data.is_active,
        displayOrder: data.display_order,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    }

    this.categoriesMap.set(id, newCategory);
    return newCategory;
  }

  // ==========================================================================
  // Article CRUD & Authoring Operations
  // ==========================================================================

  public async createArticleDraft(
    input: CreateArticleDraftInput,
    actor: ActorContext
  ): Promise<{ article: ArticleEntity; revision: ArticleRevisionEntity }> {
    const articleId = crypto.randomUUID();
    const revisionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const licensing: ArticleLicensingMetadata = input.licensingMetadata || {
      license: 'CC-BY-SA-4.0',
      attribution: 'Islam ul Haramain Scholar Board'
    };

    const aiAssistance: ArticleAiAssistanceMetadata = input.aiAssistanceMetadata || {
      isAiAssisted: false
    };

    // Validate licensing rules
    const licCheck = validateLicensing(licensing);
    if (!licCheck.valid) {
      throw new Error(`Licensing validation failed: ${licCheck.issues.join('; ')}`);
    }

    // Validate AI governance rules
    const aiCheck = validateAiGovernance(aiAssistance, false);
    if (!aiCheck.valid) {
      throw new Error(`AI governance validation failed: ${aiCheck.issues.join('; ')}`);
    }

    // Calculate cryptographic revision content hash
    const contentHash = calculateArticleContentHash(
      input.title,
      input.bodyMarkdown,
      input.sourceReferences || [],
      input.subtitle,
      input.excerpt
    );

    const revision: ArticleRevisionEntity = {
      id: revisionId,
      articleId,
      revisionNumber: 1,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      bodyMarkdown: input.bodyMarkdown,
      contentHash,
      changeSummary: input.changeSummary || 'Initial draft creation.',
      sourceReferences: input.sourceReferences || [],
      licensingMetadata: licensing,
      aiAssistanceMetadata: aiAssistance,
      status: 'DRAFT',
      createdBy: actor.id,
      createdAt: now
    };

    const article: ArticleEntity = {
      id: articleId,
      slug: input.slug,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      language: input.language || 'en',
      categoryId: input.categoryId,
      authorId: actor.id,
      status: 'DRAFT',
      currentRevisionId: revisionId,
      primaryMadhhab: input.primaryMadhhab || 'general',
      featuredImageUrl: input.featuredImageUrl,
      readingTimeMinutes: input.readingTimeMinutes || 3,
      createdAt: now,
      updatedAt: now
    };

    if (this.supabaseClient) {
      // Execute transactional insert via Supabase
      const { error: artErr } = await this.supabaseClient.from('articles').insert({
        id: article.id,
        slug: article.slug,
        title: article.title,
        subtitle: article.subtitle,
        excerpt: article.excerpt,
        language: article.language,
        category_id: article.categoryId,
        author_id: article.authorId,
        status: article.status,
        primary_madhhab: article.primaryMadhhab,
        featured_image_url: article.featuredImageUrl,
        reading_time_minutes: article.readingTimeMinutes
      });
      if (artErr) throw new Error(`Failed to create article: ${artErr.message}`);

      const { error: revErr } = await this.supabaseClient.from('article_revisions').insert({
        id: revision.id,
        article_id: revision.articleId,
        revision_number: revision.revisionNumber,
        title: revision.title,
        subtitle: revision.subtitle,
        excerpt: revision.excerpt,
        body_markdown: revision.bodyMarkdown,
        content_hash: revision.contentHash,
        change_summary: revision.changeSummary,
        source_references: revision.sourceReferences,
        licensing_metadata: revision.licensingMetadata,
        ai_assistance_metadata: revision.aiAssistanceMetadata,
        status: revision.status,
        created_by: revision.createdBy
      });
      if (revErr) throw new Error(`Failed to create revision: ${revErr.message}`);

      // Set current_revision_id
      await this.supabaseClient
        .from('articles')
        .update({ current_revision_id: revision.id })
        .eq('id', article.id);
    } else {
      this.articlesMap.set(articleId, article);
      this.revisionsMap.set(revisionId, revision);
    }

    this.recordAuditLog('ARTICLE_DRAFT_CREATED', actor.id, 'article', articleId, {
      title: article.title,
      slug: article.slug,
      revisionId
    });

    return { article, revision };
  }

  public async createArticleRevision(
    articleId: string,
    input: {
      title: string;
      subtitle?: string;
      excerpt?: string;
      bodyMarkdown: string;
      sourceReferences?: ArticleSourceReference[];
      licensingMetadata?: ArticleLicensingMetadata;
      aiAssistanceMetadata?: ArticleAiAssistanceMetadata;
      changeSummary: string;
    },
    actor: ActorContext
  ): Promise<ArticleRevisionEntity> {
    const article = await this.getArticleById(articleId);
    if (!article) throw new Error(`Article ${articleId} not found.`);

    if (article.authorId !== actor.id && !actor.roles.some(r => ['super_admin', 'content_admin', 'editor'].includes(r))) {
      throw new Error('Unauthorized: Only the author or editor can create a new revision.');
    }

    // Determine next sequential revision number
    const existingRevisions = await this.getArticleRevisions(articleId, actor);
    const maxRevNumber = existingRevisions.reduce((max, r) => Math.max(max, r.revisionNumber), 0);
    const nextRevNumber = maxRevNumber + 1;

    const revisionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const licensing = input.licensingMetadata || {
      license: 'CC-BY-SA-4.0',
      attribution: 'Islam ul Haramain Scholar Board'
    };

    const aiAssistance = input.aiAssistanceMetadata || { isAiAssisted: false };

    const contentHash = calculateArticleContentHash(
      input.title,
      input.bodyMarkdown,
      input.sourceReferences || [],
      input.subtitle,
      input.excerpt
    );

    const revision: ArticleRevisionEntity = {
      id: revisionId,
      articleId,
      revisionNumber: nextRevNumber,
      title: input.title,
      subtitle: input.subtitle,
      excerpt: input.excerpt,
      bodyMarkdown: input.bodyMarkdown,
      contentHash,
      changeSummary: input.changeSummary,
      sourceReferences: input.sourceReferences || [],
      licensingMetadata: licensing,
      aiAssistanceMetadata: aiAssistance,
      status: 'DRAFT',
      createdBy: actor.id,
      createdAt: now
    };

    // If previous revision was approved or published, mark previous as SUPERSEDED in revision status
    const prevRevId = article.currentRevisionId;
    if (prevRevId) {
      const prevRev = this.revisionsMap.get(prevRevId);
      if (prevRev && prevRev.status === 'APPROVED') {
        prevRev.status = 'SUPERSEDED';
      }
    }

    // Update article state back to DRAFT or CHANGES_REQUESTED
    article.currentRevisionId = revisionId;
    if (article.status !== 'PUBLISHED') {
      article.status = 'DRAFT';
    }
    article.updatedAt = now;

    if (this.supabaseClient) {
      await this.supabaseClient.from('article_revisions').insert({
        id: revision.id,
        article_id: revision.articleId,
        revision_number: revision.revisionNumber,
        title: revision.title,
        subtitle: revision.subtitle,
        excerpt: revision.excerpt,
        body_markdown: revision.bodyMarkdown,
        content_hash: revision.contentHash,
        change_summary: revision.changeSummary,
        source_references: revision.sourceReferences,
        licensing_metadata: revision.licensingMetadata,
        ai_assistance_metadata: revision.aiAssistanceMetadata,
        status: revision.status,
        created_by: revision.createdBy
      });

      await this.supabaseClient
        .from('articles')
        .update({
          current_revision_id: revision.id,
          status: article.status,
          updated_at: now
        })
        .eq('id', articleId);
    } else {
      this.revisionsMap.set(revisionId, revision);
      this.articlesMap.set(articleId, article);
    }

    this.recordAuditLog('ARTICLE_REVISION_CREATED', actor.id, 'article_revision', revisionId, {
      articleId,
      revisionNumber: nextRevNumber,
      changeSummary: input.changeSummary
    });

    return revision;
  }

  // ==========================================================================
  // Scholar Review Workflow Operations
  // ==========================================================================

  public async submitForReview(
    articleId: string,
    revisionId: string,
    actor: ActorContext
  ): Promise<ArticleEntity> {
    const article = await this.getArticleById(articleId);
    if (!article) throw new Error(`Article ${articleId} not found.`);

    const revision = await this.getRevisionById(revisionId);
    if (!revision) throw new Error(`Revision ${revisionId} not found.`);

    // 1. Validate State Machine Transition
    const transition = validateArticleTransition(article.status, 'SUBMITTED_FOR_REVIEW', {
      actorId: actor.id,
      actorRoles: actor.roles,
      articleAuthorId: article.authorId,
      currentRevisionId: article.currentRevisionId,
      targetRevisionId: revisionId
    });

    if (!transition.success) {
      throw new Error(`Transition rejected: ${transition.errorMessage}`);
    }

    // 2. Validate AI Governance for Submission
    const aiCheck = validateAiGovernance(revision.aiAssistanceMetadata, true);
    if (!aiCheck.valid) {
      throw new Error(`AI Governance validation failed: ${aiCheck.issues.join('; ')}`);
    }

    // 3. Validate Religious Citations
    const citationCheck = validateArticleCitations(revision.sourceReferences);
    if (!citationCheck.valid) {
      const msgs = citationCheck.issues.map(i => `${i.citationType}: ${i.issue}`);
      throw new Error(`Citation verification failed: ${msgs.join('; ')}`);
    }

    article.status = 'SUBMITTED_FOR_REVIEW';
    revision.status = 'SUBMITTED_FOR_REVIEW';
    article.updatedAt = new Date().toISOString();

    if (this.supabaseClient) {
      await this.supabaseClient
        .from('articles')
        .update({ status: article.status, updated_at: article.updatedAt })
        .eq('id', articleId);

      await this.supabaseClient
        .from('article_revisions')
        .update({ status: revision.status })
        .eq('id', revisionId);
    } else {
      this.articlesMap.set(articleId, article);
      this.revisionsMap.set(revisionId, revision);
    }

    this.recordAuditLog('ARTICLE_SUBMITTED_FOR_REVIEW', actor.id, 'article', articleId, {
      revisionId,
      revisionNumber: revision.revisionNumber
    });

    return article;
  }

  public async assignScholarReviewer(
    articleId: string,
    revisionId: string,
    reviewerId: string,
    actor: ActorContext
  ): Promise<ScholarReviewEntity> {
    const article = await this.getArticleById(articleId);
    if (!article) throw new Error(`Article ${articleId} not found.`);

    if (article.authorId === reviewerId) {
      throw new Error('Self-Approval Violation: An author cannot be assigned to review their own religious article.');
    }

    const reviewId = crypto.randomUUID();
    const now = new Date().toISOString();

    const review: ScholarReviewEntity = {
      id: reviewId,
      articleId,
      revisionId,
      reviewerId,
      assignedBy: actor.id,
      status: 'PENDING',
      assignedAt: now
    };

    article.status = 'UNDER_REVIEW';
    article.updatedAt = now;

    const revision = await this.getRevisionById(revisionId);
    if (revision) {
      revision.status = 'UNDER_REVIEW';
    }

    if (this.supabaseClient) {
      await this.supabaseClient.from('scholar_reviews').insert({
        id: review.id,
        article_id: review.articleId,
        revision_id: review.revisionId,
        reviewer_id: review.reviewerId,
        assigned_by: review.assignedBy,
        status: review.status
      });

      await this.supabaseClient
        .from('articles')
        .update({ status: 'UNDER_REVIEW', updated_at: now })
        .eq('id', articleId);

      await this.supabaseClient
        .from('article_revisions')
        .update({ status: 'UNDER_REVIEW' })
        .eq('id', revisionId);
    } else {
      this.reviewsMap.set(reviewId, review);
      this.articlesMap.set(articleId, article);
      if (revision) this.revisionsMap.set(revisionId, revision);
    }

    this.recordAuditLog('SCHOLAR_REVIEWER_ASSIGNED', actor.id, 'scholar_review', reviewId, {
      articleId,
      revisionId,
      reviewerId
    });

    return review;
  }

  public async addReviewComment(
    input: {
      reviewId: string;
      articleId: string;
      revisionId: string;
      commentType: ReviewCommentType;
      paragraphReference?: string;
      commentText: string;
    },
    actor: ActorContext
  ): Promise<ScholarReviewCommentEntity> {
    const commentId = crypto.randomUUID();
    const now = new Date().toISOString();

    const comment: ScholarReviewCommentEntity = {
      id: commentId,
      reviewId: input.reviewId,
      articleId: input.articleId,
      revisionId: input.revisionId,
      reviewerId: actor.id,
      commentType: input.commentType,
      paragraphReference: input.paragraphReference,
      commentText: input.commentText,
      resolutionStatus: 'open',
      createdAt: now
    };

    if (this.supabaseClient) {
      await this.supabaseClient.from('scholar_review_comments').insert({
        id: comment.id,
        review_id: comment.reviewId,
        article_id: comment.articleId,
        revision_id: comment.revisionId,
        reviewer_id: comment.reviewerId,
        comment_type: comment.commentType,
        paragraph_reference: comment.paragraphReference,
        comment_text: comment.commentText,
        resolution_status: comment.resolutionStatus
      });
    } else {
      this.commentsMap.set(commentId, comment);
    }

    this.recordAuditLog('SCHOLAR_REVIEW_COMMENT_ADDED', actor.id, 'scholar_review_comment', commentId, {
      articleId: input.articleId,
      revisionId: input.revisionId,
      commentType: input.commentType
    });

    return comment;
  }

  public async submitReviewDecision(
    reviewId: string,
    decision: ScholarReviewDecision,
    scholarlyNotes: string,
    actor: ActorContext
  ): Promise<{ review: ScholarReviewEntity; article: ArticleEntity }> {
    const review = await this.getReviewById(reviewId);
    if (!review) throw new Error(`Review ${reviewId} not found.`);

    const article = await this.getArticleById(review.articleId);
    if (!article) throw new Error(`Article ${review.articleId} not found.`);

    const revision = await this.getRevisionById(review.revisionId);
    if (!revision) throw new Error(`Revision ${review.revisionId} not found.`);

    // CRITICAL: Self-approval check
    if (article.authorId === actor.id) {
      throw new Error('Self-Approval Violation: An author cannot approve or decide upon their own religious article.');
    }

    const now = new Date().toISOString();
    review.status = decision;
    review.decision = decision;
    review.scholarlyNotes = scholarlyNotes;
    review.completedAt = now;

    if (decision === 'APPROVED') {
      revision.status = 'APPROVED';
      article.status = 'APPROVED';
      article.updatedAt = now;
      this.recordAuditLog('ARTICLE_APPROVED_BY_SCHOLAR', actor.id, 'scholar_review', reviewId, {
        articleId: article.id,
        revisionId: revision.id,
        revisionNumber: revision.revisionNumber,
        reviewerId: actor.id
      });
    } else if (decision === 'CHANGES_REQUESTED') {
      revision.status = 'CHANGES_REQUESTED';
      article.status = 'CHANGES_REQUESTED';
      article.updatedAt = now;
      this.recordAuditLog('ARTICLE_CHANGES_REQUESTED', actor.id, 'scholar_review', reviewId, {
        articleId: article.id,
        revisionId: revision.id,
        scholarlyNotes
      });
    } else if (decision === 'REJECTED') {
      revision.status = 'REJECTED';
      article.status = 'REJECTED';
      article.updatedAt = now;
      this.recordAuditLog('ARTICLE_REJECTED', actor.id, 'scholar_review', reviewId, {
        articleId: article.id,
        revisionId: revision.id,
        scholarlyNotes
      });
    }

    if (this.supabaseClient) {
      await this.supabaseClient
        .from('scholar_reviews')
        .update({
          status: review.status,
          decision: review.decision,
          scholarly_notes: review.scholarlyNotes,
          completed_at: review.completedAt
        })
        .eq('id', reviewId);

      await this.supabaseClient
        .from('article_revisions')
        .update({ status: revision.status })
        .eq('id', revision.id);

      await this.supabaseClient
        .from('articles')
        .update({ status: article.status, updated_at: now })
        .eq('id', article.id);
    } else {
      this.reviewsMap.set(reviewId, review);
      this.revisionsMap.set(revision.id, revision);
      this.articlesMap.set(article.id, article);
    }

    return { review, article };
  }

  // ==========================================================================
  // Publication Gating & Public Release
  // ==========================================================================

  public async publishArticle(
    articleId: string,
    revisionId: string,
    actor: ActorContext
  ): Promise<ArticleEntity> {
    const article = await this.getArticleById(articleId);
    if (!article) throw new Error(`Article ${articleId} not found.`);

    const revision = await this.getRevisionById(revisionId);
    if (!revision) throw new Error(`Revision ${revisionId} not found.`);

    const reviews = await this.getReviewsForRevision(revisionId);

    // 1. Strict Server-Side Publication Gate
    const gate = verifyPublicationGate(article, revision, reviews, actor.id, actor.roles);
    if (!gate.canPublish) {
      throw new Error(`Publication Gate Rejection: ${gate.reason}`);
    }

    const now = new Date().toISOString();
    article.status = 'PUBLISHED';
    article.publishedRevisionId = revisionId;
    article.publishedAt = now;
    article.updatedAt = now;

    if (this.supabaseClient) {
      const { error } = await this.supabaseClient
        .from('articles')
        .update({
          status: 'PUBLISHED',
          published_revision_id: revisionId,
          published_at: now,
          updated_at: now
        })
        .eq('id', articleId);

      if (error) throw new Error(`Failed to publish article: ${error.message}`);
    } else {
      this.articlesMap.set(articleId, article);
    }

    this.recordAuditLog('ARTICLE_PUBLISHED', actor.id, 'article', articleId, {
      publishedRevisionId: revisionId,
      verifiedRevisionNumber: gate.verifiedRevisionNumber,
      approvedByReviewerId: gate.approvedByReviewerId
    });

    return article;
  }

  // ==========================================================================
  // Public Retrieval Operations (Strict Boundary Defense)
  // ==========================================================================

  public async getPublicArticleBySlug(slug: string): Promise<{
    article: ArticleEntity;
    revision: ArticleRevisionEntity;
    category?: ArticleCategory;
  } | null> {
    if (this.supabaseClient) {
      const { data: artRow, error } = await this.supabaseClient
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'PUBLISHED')
        .single();

      if (error || !artRow) return null;

      const { data: revRow } = await this.supabaseClient
        .from('article_revisions')
        .select('*')
        .eq('id', artRow.published_revision_id)
        .single();

      if (!revRow) return null;

      let category: ArticleCategory | undefined;
      if (artRow.category_id) {
        const { data: catRow } = await this.supabaseClient
          .from('article_categories')
          .select('*')
          .eq('id', artRow.category_id)
          .single();
        if (catRow) {
          category = {
            id: catRow.id,
            slug: catRow.slug,
            nameArabic: catRow.name_arabic,
            nameEnglish: catRow.name_english,
            nameUrdu: catRow.name_urdu,
            descriptionEnglish: catRow.description_english,
            isActive: catRow.is_active,
            displayOrder: catRow.display_order,
            createdAt: catRow.created_at,
            updatedAt: catRow.updated_at
          };
        }
      }

      return {
        article: this.mapRowToArticle(artRow),
        revision: this.mapRowToRevision(revRow),
        category
      };
    }

    // In-Memory Lookup
    const article = Array.from(this.articlesMap.values()).find(
      a => a.slug === slug && a.status === 'PUBLISHED'
    );
    if (!article || !article.publishedRevisionId) return null;

    const revision = this.revisionsMap.get(article.publishedRevisionId);
    if (!revision) return null;

    const category = article.categoryId ? this.categoriesMap.get(article.categoryId) : undefined;

    return { article, revision, category };
  }

  public async listPublicArticles(options: {
    categorySlug?: string;
    language?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ articles: ArticleEntity[]; total: number }> {
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    if (this.supabaseClient) {
      let query = this.supabaseClient
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('status', 'PUBLISHED')
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (options.language) {
        query = query.eq('language', options.language);
      }

      const { data, count, error } = await query;
      if (error) throw new Error(`Failed to list public articles: ${error.message}`);

      return {
        articles: (data || []).map(r => this.mapRowToArticle(r)),
        total: count || 0
      };
    }

    let all = Array.from(this.articlesMap.values()).filter(a => a.status === 'PUBLISHED');

    if (options.language) {
      all = all.filter(a => a.language === options.language);
    }
    if (options.categorySlug) {
      const cat = Array.from(this.categoriesMap.values()).find(c => c.slug === options.categorySlug);
      if (cat) {
        all = all.filter(a => a.categoryId === cat.id);
      }
    }

    const total = all.length;
    const paginated = all.slice(offset, offset + limit);

    return { articles: paginated, total };
  }

  // ==========================================================================
  // CMS Dashboard & Scoped Retrieval Operations
  // ==========================================================================

  public async getCmsArticles(
    actor: ActorContext,
    filter: { status?: ArticleStatus } = {}
  ): Promise<ArticleEntity[]> {
    const isStaff = actor.roles.some(r => ['super_admin', 'content_admin', 'editor'].includes(r));
    const isScholar = actor.roles.includes('scholar_reviewer');

    if (this.supabaseClient) {
      let query = this.supabaseClient.from('articles').select('*').order('updated_at', { ascending: false });

      if (!isStaff) {
        if (isScholar) {
          // Scholars see articles assigned to them or their own
          const { data: revData } = await this.supabaseClient
            .from('scholar_reviews')
            .select('article_id')
            .eq('reviewer_id', actor.id);
          const assignedIds = (revData || []).map(r => r.article_id);
          query = query.or(`author_id.eq.${actor.id},id.in.(${assignedIds.join(',') || '00000000-0000-0000-0000-000000000000'})`);
        } else {
          // Regular authors see only their own
          query = query.eq('author_id', actor.id);
        }
      }

      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      const { data, error } = await query;
      if (error) throw new Error(`Failed to get CMS articles: ${error.message}`);
      return (data || []).map(r => this.mapRowToArticle(r));
    }

    let all = Array.from(this.articlesMap.values());

    if (!isStaff) {
      if (isScholar) {
        const assignedArticleIds = new Set(
          Array.from(this.reviewsMap.values())
            .filter(r => r.reviewerId === actor.id)
            .map(r => r.articleId)
        );
        all = all.filter(a => a.authorId === actor.id || assignedArticleIds.has(a.id));
      } else {
        all = all.filter(a => a.authorId === actor.id);
      }
    }

    if (filter.status) {
      all = all.filter(a => a.status === filter.status);
    }

    return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public async listTags(): Promise<ArticleTag[]> {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient.from('article_tags').select('*');
      if (error) throw new Error(`Failed to list tags: ${error.message}`);
      return (data || []).map(r => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        language: r.language,
        createdAt: r.created_at
      }));
    }
    return Array.from(this.tagsMap.values());
  }

  public async createTag(tag: Omit<ArticleTag, 'id' | 'createdAt'>): Promise<ArticleTag> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTag: ArticleTag = { ...tag, id, createdAt: now };

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('article_tags')
        .insert({ id, slug: tag.slug, name: tag.name, language: tag.language })
        .select()
        .single();
      if (error) throw new Error(`Failed to create tag: ${error.message}`);
      return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        language: data.language,
        createdAt: data.created_at
      };
    }

    this.tagsMap.set(id, newTag);
    return newTag;
  }

  public async getArticleRevisions(
    articleId: string,
    _actor?: ActorContext
  ): Promise<ArticleRevisionEntity[]> {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('article_revisions')
        .select('*')
        .eq('article_id', articleId)
        .order('revision_number', { ascending: false });

      if (error) throw new Error(`Failed to get article revisions: ${error.message}`);
      return (data || []).map(r => this.mapRowToRevision(r));
    }

    return Array.from(this.revisionsMap.values())
      .filter(r => r.articleId === articleId)
      .sort((a, b) => b.revisionNumber - a.revisionNumber);
  }

  public async getReviewHistory(
    articleId: string,
    _actor?: ActorContext
  ): Promise<{ reviews: ScholarReviewEntity[]; comments: ScholarReviewCommentEntity[] }> {
    if (this.supabaseClient) {
      const { data: revData } = await this.supabaseClient
        .from('scholar_reviews')
        .select('*')
        .eq('article_id', articleId)
        .order('assigned_at', { ascending: false });

      const { data: comData } = await this.supabaseClient
        .from('scholar_review_comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: true });

      return {
        reviews: (revData || []).map(r => this.mapRowToReview(r)),
        comments: (comData || []).map(c => this.mapRowToComment(c))
      };
    }

    const reviews = Array.from(this.reviewsMap.values())
      .filter(r => r.articleId === articleId)
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

    const comments = Array.from(this.commentsMap.values())
      .filter(c => c.articleId === articleId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return { reviews, comments };
  }

  // ==========================================================================
  // Audit Logs Helper
  // ==========================================================================

  public getAuditLogs(): AuditEventRecord[] {
    return [...this.auditLogsList];
  }

  private recordAuditLog(
    action: string,
    actorId: string | undefined,
    targetEntityType: string,
    targetEntityId: string | undefined,
    details: Record<string, unknown>
  ): void {
    const entry: AuditEventRecord = {
      id: crypto.randomUUID(),
      action,
      actorId,
      targetEntityType,
      targetEntityId,
      details,
      createdAt: new Date().toISOString()
    };
    this.auditLogsList.push(entry);

    if (this.supabaseClient) {
      // Fire-and-forget async audit log RPC to PostgreSQL
      Promise.resolve(
        this.supabaseClient.rpc('record_audit_event', {
          p_action: action,
          p_target_entity_type: targetEntityType,
          p_target_entity_id: targetEntityId,
          p_details: details,
          p_source_context: 'articles-cms'
        })
      ).catch(() => {});
    }
  }

  // ==========================================================================
  // Private Entity Accessors & Mappers
  // ==========================================================================

  public async getArticleById(id: string): Promise<ArticleEntity | null> {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient.from('articles').select('*').eq('id', id).single();
      if (error || !data) return null;
      return this.mapRowToArticle(data);
    }
    return this.articlesMap.get(id) || null;
  }

  public async getRevisionById(id: string): Promise<ArticleRevisionEntity | null> {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient.from('article_revisions').select('*').eq('id', id).single();
      if (error || !data) return null;
      return this.mapRowToRevision(data);
    }
    return this.revisionsMap.get(id) || null;
  }

  public async getReviewById(id: string): Promise<ScholarReviewEntity | null> {
    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient.from('scholar_reviews').select('*').eq('id', id).single();
      if (error || !data) return null;
      return this.mapRowToReview(data);
    }
    return this.reviewsMap.get(id) || null;
  }

  public async getReviewsForRevision(revisionId: string): Promise<ScholarReviewEntity[]> {
    if (this.supabaseClient) {
      const { data } = await this.supabaseClient.from('scholar_reviews').select('*').eq('revision_id', revisionId);
      return (data || []).map(r => this.mapRowToReview(r));
    }
    return Array.from(this.reviewsMap.values()).filter(r => r.revisionId === revisionId);
  }

  private mapRowToArticle(row: any): ArticleEntity {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      excerpt: row.excerpt,
      language: row.language,
      categoryId: row.category_id,
      authorId: row.author_id,
      status: row.status as ArticleStatus,
      currentRevisionId: row.current_revision_id,
      publishedRevisionId: row.published_revision_id,
      primaryMadhhab: row.primary_madhhab,
      featuredImageUrl: row.featured_image_url,
      readingTimeMinutes: row.reading_time_minutes,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToRevision(row: any): ArticleRevisionEntity {
    return {
      id: row.id,
      articleId: row.article_id,
      revisionNumber: row.revision_number,
      title: row.title,
      subtitle: row.subtitle,
      excerpt: row.excerpt,
      bodyMarkdown: row.body_markdown,
      contentHash: row.content_hash,
      changeSummary: row.change_summary,
      sourceReferences: typeof row.source_references === 'string' ? JSON.parse(row.source_references) : row.source_references,
      licensingMetadata: typeof row.licensing_metadata === 'string' ? JSON.parse(row.licensing_metadata) : row.licensing_metadata,
      aiAssistanceMetadata: typeof row.ai_assistance_metadata === 'string' ? JSON.parse(row.ai_assistance_metadata) : row.ai_assistance_metadata,
      status: row.status as ArticleRevisionStatus,
      createdBy: row.created_by,
      createdAt: row.created_at
    };
  }

  private mapRowToReview(row: any): ScholarReviewEntity {
    return {
      id: row.id,
      articleId: row.article_id,
      revisionId: row.revision_id,
      reviewerId: row.reviewer_id,
      assignedBy: row.assigned_by,
      status: row.status as ScholarReviewStatus,
      decision: row.decision as ScholarReviewDecision,
      scholarlyNotes: row.scholarly_notes,
      assignedAt: row.assigned_at,
      completedAt: row.completed_at
    };
  }

  private mapRowToComment(row: any): ScholarReviewCommentEntity {
    return {
      id: row.id,
      reviewId: row.review_id,
      articleId: row.article_id,
      revisionId: row.revision_id,
      reviewerId: row.reviewer_id,
      commentType: row.comment_type as ReviewCommentType,
      paragraphReference: row.paragraph_reference,
      commentText: row.comment_text,
      resolutionStatus: row.resolution_status,
      createdAt: row.created_at
    };
  }
}
