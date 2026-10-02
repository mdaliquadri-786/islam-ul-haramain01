/**
 * @file workflow.ts
 * @package @islamic/islamic-engine
 * @description State machine, lifecycle transitions, self-approval prevention,
 *              and publication gating for the Articles CMS & Scholar Review Workflow.
 */

import type {
  ArticleStatus,
  ArticleEntity,
  ArticleRevisionEntity,
  ScholarReviewEntity,
  WorkflowTransitionContext,
  ArticleWorkflowTransitionResult,
  ArticlePublicationGateResult,
  UserRole
} from './types.js';

/**
 * Checks if a user has any of the specified roles.
 */
export function hasRequiredRole(userRoles: UserRole[], allowedRoles: UserRole[]): boolean {
  return allowedRoles.some(role => userRoles.includes(role));
}

/**
 * Validates an article lifecycle transition against the strict governance state machine.
 */
export function validateArticleTransition(
  currentStatus: ArticleStatus,
  targetStatus: ArticleStatus,
  context: WorkflowTransitionContext
): ArticleWorkflowTransitionResult {
  const { actorId, actorRoles, articleAuthorId, hasApprovedReview, approvedReviewerId } = context;
  const isAuthor = actorId === articleAuthorId;
  const isAdmin = hasRequiredRole(actorRoles, ['super_admin', 'content_admin']);
  const isEditor = hasRequiredRole(actorRoles, ['editor', 'super_admin', 'content_admin']);
  const isScholar = hasRequiredRole(actorRoles, ['scholar_reviewer', 'super_admin', 'content_admin']);

  // Same status transition is a no-op
  if (currentStatus === targetStatus) {
    return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
  }

  // 1. DRAFT Transitions
  if (currentStatus === 'DRAFT') {
    if (targetStatus === 'SUBMITTED_FOR_REVIEW') {
      if (!isAuthor && !isEditor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only the author or an authorized editor can submit a draft for review.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'WITHDRAWN') {
      if (!isAuthor && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only the author or administrator can withdraw a draft.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    // Direct DRAFT -> PUBLISHED is strictly forbidden
    if (targetStatus === 'PUBLISHED') {
      return {
        success: false,
        previousStatus: currentStatus,
        newStatus: targetStatus,
        errorMessage: 'Direct publication forbidden: An article cannot transition directly from DRAFT to PUBLISHED without undergoing scholar review and approval.'
      };
    }

    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      errorMessage: `Invalid transition from DRAFT to ${targetStatus}.`
    };
  }

  // 2. SUBMITTED_FOR_REVIEW Transitions
  if (currentStatus === 'SUBMITTED_FOR_REVIEW') {
    if (targetStatus === 'UNDER_REVIEW') {
      if (!isScholar && !isEditor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a scholar reviewer or editor can take an article under review.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'CHANGES_REQUESTED' || targetStatus === 'REJECTED') {
      if (!isScholar && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a scholar reviewer or administrator can request changes or reject an article.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'DRAFT' || targetStatus === 'WITHDRAWN') {
      if (!isAuthor && !isEditor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only the author or editor can recall or withdraw a submitted article.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    // Direct SUBMITTED_FOR_REVIEW -> PUBLISHED is strictly forbidden
    if (targetStatus === 'PUBLISHED') {
      return {
        success: false,
        previousStatus: currentStatus,
        newStatus: targetStatus,
        errorMessage: 'Publication gate violation: Cannot publish directly from SUBMITTED_FOR_REVIEW without formal scholar review and approval.'
      };
    }

    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      errorMessage: `Invalid transition from SUBMITTED_FOR_REVIEW to ${targetStatus}.`
    };
  }

  // 3. UNDER_REVIEW Transitions
  if (currentStatus === 'UNDER_REVIEW') {
    if (targetStatus === 'APPROVED') {
      if (!isScholar) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a qualified scholar reviewer or administrator can approve an article.'
        };
      }
      // CRITICAL: Self-approval check
      if (isAuthor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Self-approval violation: An author cannot approve their own religious article. Independent scholarly verification is required.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'CHANGES_REQUESTED') {
      if (!isScholar) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a scholar reviewer can request revisions.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'REJECTED') {
      if (!isScholar && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a scholar reviewer or administrator can reject an article.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'WITHDRAWN') {
      if (!isAuthor && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only the author or administrator can withdraw an article under review.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      errorMessage: `Invalid transition from UNDER_REVIEW to ${targetStatus}.`
    };
  }

  // 4. CHANGES_REQUESTED Transitions
  if (currentStatus === 'CHANGES_REQUESTED') {
    if (targetStatus === 'RESUBMITTED') {
      if (!isAuthor && !isEditor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only the author or editor can resubmit an article after revisions.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'DRAFT' || targetStatus === 'WITHDRAWN') {
      if (!isAuthor && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only the author or administrator can return to draft or withdraw.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      errorMessage: `Invalid transition from CHANGES_REQUESTED to ${targetStatus}.`
    };
  }

  // 5. RESUBMITTED Transitions
  if (currentStatus === 'RESUBMITTED') {
    if (targetStatus === 'UNDER_REVIEW') {
      if (!isScholar && !isEditor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a scholar reviewer or editor can resume review.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'APPROVED') {
      if (!isScholar) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a scholar reviewer can approve the resubmission.'
        };
      }
      if (isAuthor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Self-approval violation: An author cannot approve their own resubmission.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'CHANGES_REQUESTED' || targetStatus === 'REJECTED') {
      if (!isScholar && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a scholar reviewer or administrator can request further changes or reject.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      errorMessage: `Invalid transition from RESUBMITTED to ${targetStatus}.`
    };
  }

  // 6. APPROVED Transitions
  if (currentStatus === 'APPROVED') {
    if (targetStatus === 'PUBLISHED') {
      if (!isEditor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only an authorized editor or administrator can release an approved article to production.'
        };
      }

      // Check author self-publishing restriction if actor is author
      if (isAuthor && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Separation of duties: An author cannot unilaterally publish their own article. An editorial or administrative release is required.'
        };
      }

      // Check review verification
      if (!hasApprovedReview) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Publication gate violation: No verified scholar approval record was found for this release.'
        };
      }

      // Ensure the approving scholar is distinct from author
      if (approvedReviewerId && approvedReviewerId === articleAuthorId) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Self-approval violation: The approving reviewer cannot be the author of the article.'
        };
      }

      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    if (targetStatus === 'CHANGES_REQUESTED' || targetStatus === 'UNDER_REVIEW') {
      if (!isScholar && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only a scholar or administrator can reopen review of an approved article.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      errorMessage: `Invalid transition from APPROVED to ${targetStatus}.`
    };
  }

  // 7. PUBLISHED Transitions
  if (currentStatus === 'PUBLISHED') {
    if (targetStatus === 'WITHDRAWN') {
      if (!isAdmin && !isEditor) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only an administrator or editor can unpublish or withdraw an active published article.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      errorMessage: `Direct in-place transition of PUBLISHED article to ${targetStatus} is prohibited. To edit, create a new revision (Version N+1).`
    };
  }

  // 8. REJECTED or WITHDRAWN Transitions
  if (currentStatus === 'REJECTED' || currentStatus === 'WITHDRAWN') {
    if (targetStatus === 'DRAFT') {
      if (!isAuthor && !isAdmin) {
        return {
          success: false,
          previousStatus: currentStatus,
          newStatus: targetStatus,
          errorMessage: 'Only the author or administrator can restart editing a rejected or withdrawn article.'
        };
      }
      return { success: true, previousStatus: currentStatus, newStatus: targetStatus };
    }

    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: targetStatus,
      errorMessage: `Cannot transition from ${currentStatus} directly to ${targetStatus}. Reopen as DRAFT first.`
    };
  }

  return {
    success: false,
    previousStatus: currentStatus,
    newStatus: targetStatus,
    errorMessage: `Unsupported lifecycle transition from ${currentStatus} to ${targetStatus}.`
  };
}

/**
 * Evaluates the full publication safety gate before an article is released.
 */
export function verifyPublicationGate(
  article: ArticleEntity,
  revision: ArticleRevisionEntity,
  reviews: ScholarReviewEntity[],
  publisherId: string,
  publisherRoles: UserRole[]
): ArticlePublicationGateResult {
  // 1. Article status must be APPROVED or PUBLISHED
  if (article.status !== 'APPROVED' && article.status !== 'PUBLISHED') {
    return {
      canPublish: false,
      reason: `Article is currently in '${article.status}' status. Only APPROVED articles can be published.`
    };
  }

  // 2. Revision must belong to article
  if (revision.articleId !== article.id) {
    return {
      canPublish: false,
      reason: `Revision ${revision.id} does not belong to article ${article.id}.`
    };
  }

  // 3. Revision status must be APPROVED
  if (revision.status !== 'APPROVED') {
    return {
      canPublish: false,
      reason: `Revision ${revision.revisionNumber} is in '${revision.status}' status, but publication requires an APPROVED revision.`
    };
  }

  // 4. Publisher must hold publishing authority
  const hasPublishingRole = hasRequiredRole(publisherRoles, ['super_admin', 'content_admin', 'editor']);
  if (!hasPublishingRole) {
    return {
      canPublish: false,
      reason: 'Actor lacks publication authority (requires editor, content_admin, or super_admin role).'
    };
  }

  // 5. Author self-publishing restriction (unless authorized admin)
  if (publisherId === article.authorId && !hasRequiredRole(publisherRoles, ['super_admin'])) {
    return {
      canPublish: false,
      reason: 'Separation of duties: An author cannot publish their own article without an independent administrative release.'
    };
  }

  // 6. Find valid independent scholar approval for this exact revision
  const validApproval = reviews.find(
    r => r.revisionId === revision.id &&
         r.status === 'APPROVED' &&
         r.decision === 'APPROVED' &&
         r.reviewerId !== article.authorId
  );

  if (!validApproval) {
    return {
      canPublish: false,
      reason: `No independent scholar approval exists for revision ${revision.revisionNumber}. Author cannot approve their own work.`
    };
  }

  // 7. Verify mandatory content metadata
  if (!article.title || article.title.trim().length === 0) {
    return { canPublish: false, reason: 'Article title cannot be empty.' };
  }
  if (!article.slug || article.slug.trim().length === 0) {
    return { canPublish: false, reason: 'Article slug cannot be empty.' };
  }
  if (!revision.bodyMarkdown || revision.bodyMarkdown.trim().length === 0) {
    return { canPublish: false, reason: 'Article revision body content cannot be empty.' };
  }

  return {
    canPublish: true,
    verifiedRevisionId: revision.id,
    verifiedRevisionNumber: revision.revisionNumber,
    approvedByReviewerId: validApproval.reviewerId
  };
}
