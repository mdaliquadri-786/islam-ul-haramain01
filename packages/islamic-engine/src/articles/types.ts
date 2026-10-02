/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Type definitions for Articles CMS, Revisions, Scholar Review Workflow,
 *              Licensing, and Religious Content Provenance.
 */

export type ArticleStatus =
  | 'DRAFT'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ArticleRevisionStatus =
  | 'DRAFT'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUPERSEDED';

export type ScholarReviewStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'REJECTED';

export type ScholarReviewDecision =
  | 'APPROVED'
  | 'CHANGES_REQUESTED'
  | 'REJECTED';

export type ReviewCommentType =
  | 'general'
  | 'correction_requested'
  | 'scholarly_note'
  | 'fiqh_inquiry';

export type CommentResolutionStatus =
  | 'open'
  | 'resolved'
  | 'acknowledged';

export type ArticleLanguage = 'en' | 'ar' | 'ur';

export type PrimaryMadhhab = 'hanafi' | 'hanbali' | 'shafii' | 'maliki' | 'general';

export type UserRole =
  | 'super_admin'
  | 'content_admin'
  | 'scholar_reviewer'
  | 'editor'
  | 'translator'
  | 'user';

/**
 * Article Category
 */
export interface ArticleCategory {
  id: string;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  descriptionEnglish?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Article Tag
 */
export interface ArticleTag {
  id: string;
  slug: string;
  name: string;
  language: ArticleLanguage;
  createdAt: string;
}

/**
 * Structured Source Reference (Quran, Hadith, Duas, Classical Fiqh/Tafsir)
 */
export interface ArticleSourceReference {
  citationType: 'quran' | 'hadith' | 'dua' | 'external';
  reference: string; // e.g. "2:255", "bukhari 1", "hisn 1", "Al-Mughni 1/240"
  textExcerpt?: string;
  attribution?: string;
  url?: string;
}

/**
 * Article Licensing Metadata
 */
export interface ArticleLicensingMetadata {
  license: string; // e.g. "CC-BY-SA-4.0", "CC-BY-4.0", "Public Domain", "Copyright Reserved"
  attribution: string;
  sourceUrl?: string;
  isPublicDomain?: boolean;
}

/**
 * AI Assistance & Provenance Declaration
 */
export interface ArticleAiAssistanceMetadata {
  isAiAssisted: boolean;
  toolUsed?: string;
  promptPurpose?: string; // e.g. "Formatting and spelling check", "Initial outline draft"
  humanVerifiedBy?: string; // Must be verified by human author before scholar review
  verificationDate?: string;
}

/**
 * Article Core Entity
 */
export interface ArticleEntity {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  language: ArticleLanguage;
  categoryId?: string;
  authorId: string;
  status: ArticleStatus;
  currentRevisionId?: string;
  publishedRevisionId?: string;
  primaryMadhhab?: PrimaryMadhhab;
  featuredImageUrl?: string;
  readingTimeMinutes: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Article Revision Snapshot (Immutable when approved/published)
 */
export interface ArticleRevisionEntity {
  id: string;
  articleId: string;
  revisionNumber: number;
  title: string;
  subtitle?: string;
  excerpt?: string;
  bodyMarkdown: string;
  contentHash: string; // SHA-256
  changeSummary?: string;
  sourceReferences: ArticleSourceReference[];
  licensingMetadata: ArticleLicensingMetadata;
  aiAssistanceMetadata: ArticleAiAssistanceMetadata;
  status: ArticleRevisionStatus;
  createdBy: string;
  createdAt: string;
}

/**
 * Scholar Review Assignment & Evaluation
 */
export interface ScholarReviewEntity {
  id: string;
  articleId: string;
  revisionId: string;
  reviewerId: string;
  assignedBy: string;
  status: ScholarReviewStatus;
  decision?: ScholarReviewDecision;
  scholarlyNotes?: string;
  assignedAt: string;
  completedAt?: string;
}

/**
 * Scholar Review Comment
 */
export interface ScholarReviewCommentEntity {
  id: string;
  reviewId: string;
  articleId: string;
  revisionId: string;
  reviewerId: string;
  commentType: ReviewCommentType;
  paragraphReference?: string;
  commentText: string;
  resolutionStatus: CommentResolutionStatus;
  createdAt: string;
}

/**
 * Transition Context for Workflow Validation
 */
export interface WorkflowTransitionContext {
  actorId: string;
  actorRoles: UserRole[];
  articleAuthorId: string;
  currentRevisionId?: string;
  targetRevisionId?: string;
  hasApprovedReview?: boolean;
  approvedReviewerId?: string;
}

/**
 * Result of Workflow Transition Evaluation
 */
export interface ArticleWorkflowTransitionResult {
  success: boolean;
  previousStatus: ArticleStatus;
  newStatus: ArticleStatus;
  errorMessage?: string;
}

/**
 * Result of Publication Gate Verification
 */
export interface ArticlePublicationGateResult {
  canPublish: boolean;
  reason?: string;
  verifiedRevisionId?: string;
  verifiedRevisionNumber?: number;
  approvedByReviewerId?: string;
}
