/**
 * @file article-workflow.test.ts
 * @package @islamic/islamic-engine
 * @description Comprehensive unit test suite for Articles CMS, Scholar Review Workflow,
 *              Self-Approval Prevention, Publication Gating, and Citation Verification.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateArticleTransition,
  verifyPublicationGate,
  calculateArticleContentHash,
  verifyArticleContentHash,
  validateAiGovernance,
  validateLicensing,
  validateArticleCitations,
  ArticleEntity,
  ArticleRevisionEntity,
  ScholarReviewEntity,
  WorkflowTransitionContext
} from '../src/articles/index.js';

describe('Articles CMS: Workflow State Machine & Lifecycle Transitions', () => {
  const authorId = '00000000-0000-0000-0000-000000000001';
  const scholarId = '00000000-0000-0000-0000-000000000002';
  const editorId = '00000000-0000-0000-0000-000000000003';
  const adminId = '00000000-0000-0000-0000-000000000004';
  const unauthorizedUserId = '00000000-0000-0000-0000-000000000005';

  it('should allow author to submit DRAFT for review', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: authorId,
      actorRoles: ['user'],
      articleAuthorId: authorId
    };

    const result = validateArticleTransition('DRAFT', 'SUBMITTED_FOR_REVIEW', ctx);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.newStatus, 'SUBMITTED_FOR_REVIEW');
  });

  it('should REJECT unauthorized user submitting someone else draft', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: unauthorizedUserId,
      actorRoles: ['user'],
      articleAuthorId: authorId
    };

    const result = validateArticleTransition('DRAFT', 'SUBMITTED_FOR_REVIEW', ctx);
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage!, /Only the author or an authorized editor/);
  });

  it('should REJECT direct transition from DRAFT to PUBLISHED', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: authorId,
      actorRoles: ['super_admin'], // even an admin cannot bypass scholar review directly from draft
      articleAuthorId: authorId
    };

    const result = validateArticleTransition('DRAFT', 'PUBLISHED', ctx);
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage!, /Direct publication forbidden/);
  });

  it('should REJECT direct transition from SUBMITTED_FOR_REVIEW to PUBLISHED', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: editorId,
      actorRoles: ['editor'],
      articleAuthorId: authorId
    };

    const result = validateArticleTransition('SUBMITTED_FOR_REVIEW', 'PUBLISHED', ctx);
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage!, /Publication gate violation/);
  });

  it('should allow scholar to take article UNDER_REVIEW', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: scholarId,
      actorRoles: ['scholar_reviewer'],
      articleAuthorId: authorId
    };

    const result = validateArticleTransition('SUBMITTED_FOR_REVIEW', 'UNDER_REVIEW', ctx);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.newStatus, 'UNDER_REVIEW');
  });

  it('CRITICAL: must REJECT author self-approval when actor is author', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: authorId,
      actorRoles: ['scholar_reviewer'], // even if author happens to hold scholar role
      articleAuthorId: authorId
    };

    const result = validateArticleTransition('UNDER_REVIEW', 'APPROVED', ctx);
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage!, /Self-approval violation/);
  });

  it('should allow qualified independent scholar to approve article', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: scholarId,
      actorRoles: ['scholar_reviewer'],
      articleAuthorId: authorId
    };

    const result = validateArticleTransition('UNDER_REVIEW', 'APPROVED', ctx);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.newStatus, 'APPROVED');
  });

  it('should allow scholar to request changes and author to resubmit', () => {
    // Scholar requests changes
    const scholarCtx: WorkflowTransitionContext = {
      actorId: scholarId,
      actorRoles: ['scholar_reviewer'],
      articleAuthorId: authorId
    };
    const reqResult = validateArticleTransition('UNDER_REVIEW', 'CHANGES_REQUESTED', scholarCtx);
    assert.strictEqual(reqResult.success, true);

    // Author resubmits
    const authorCtx: WorkflowTransitionContext = {
      actorId: authorId,
      actorRoles: ['user'],
      articleAuthorId: authorId
    };
    const resubResult = validateArticleTransition('CHANGES_REQUESTED', 'RESUBMITTED', authorCtx);
    assert.strictEqual(resubResult.success, true);
  });

  it('should allow editor to publish an APPROVED article with verified review', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: editorId,
      actorRoles: ['editor'],
      articleAuthorId: authorId,
      hasApprovedReview: true,
      approvedReviewerId: scholarId
    };

    const result = validateArticleTransition('APPROVED', 'PUBLISHED', ctx);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.newStatus, 'PUBLISHED');
  });

  it('should REJECT author self-publishing their own article', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: authorId,
      actorRoles: ['editor'],
      articleAuthorId: authorId,
      hasApprovedReview: true,
      approvedReviewerId: scholarId
    };

    const result = validateArticleTransition('APPROVED', 'PUBLISHED', ctx);
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage!, /Separation of duties: An author cannot unilaterally publish/);
  });

  it('should REJECT publishing APPROVED article if approvedReviewer was the author', () => {
    const ctx: WorkflowTransitionContext = {
      actorId: editorId,
      actorRoles: ['editor'],
      articleAuthorId: authorId,
      hasApprovedReview: true,
      approvedReviewerId: authorId // invalid!
    };

    const result = validateArticleTransition('APPROVED', 'PUBLISHED', ctx);
    assert.strictEqual(result.success, false);
    assert.match(result.errorMessage!, /Self-approval violation/);
  });
});

describe('Articles CMS: Publication Safety Gate & Multi-Point Evaluation', () => {
  const authorId = '00000000-0000-0000-0000-000000000001';
  const scholarId = '00000000-0000-0000-0000-000000000002';
  const editorId = '00000000-0000-0000-0000-000000000003';

  const mockArticle: ArticleEntity = {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'the-importance-of-prayer',
    title: 'The Importance of Prayer in Islam',
    language: 'en',
    authorId,
    status: 'APPROVED',
    readingTimeMinutes: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockRevision1: ArticleRevisionEntity = {
    id: '22222222-2222-2222-2222-222222222221',
    articleId: mockArticle.id,
    revisionNumber: 1,
    title: 'The Importance of Prayer in Islam',
    bodyMarkdown: '# The Importance of Prayer\n\nPrayer is the second pillar of Islam...',
    contentHash: 'a'.repeat(64),
    sourceReferences: [{ citationType: 'quran', reference: '2:43' }],
    licensingMetadata: { license: 'CC-BY-SA-4.0', attribution: 'Islam ul Haramain' },
    aiAssistanceMetadata: { isAiAssisted: false },
    status: 'APPROVED',
    createdBy: authorId,
    createdAt: new Date().toISOString()
  };

  const mockReview1: ScholarReviewEntity = {
    id: '33333333-3333-3333-3333-333333333331',
    articleId: mockArticle.id,
    revisionId: mockRevision1.id,
    reviewerId: scholarId,
    assignedBy: editorId,
    status: 'APPROVED',
    decision: 'APPROVED',
    scholarlyNotes: 'Verified against primary fiqh manuals. Citations accurate.',
    assignedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };

  it('should successfully pass publication gate with valid approved revision and review', () => {
    const gate = verifyPublicationGate(mockArticle, mockRevision1, [mockReview1], editorId, ['editor']);
    assert.strictEqual(gate.canPublish, true);
    assert.strictEqual(gate.verifiedRevisionNumber, 1);
    assert.strictEqual(gate.approvedByReviewerId, scholarId);
  });

  it('CRITICAL: new Revision 2 MUST NOT inherit Revision 1 approval', () => {
    // Author edited article after revision 1 was approved -> Revision 2 is created in DRAFT/SUBMITTED
    const mockRevision2: ArticleRevisionEntity = {
      id: '22222222-2222-2222-2222-222222222222',
      articleId: mockArticle.id,
      revisionNumber: 2,
      title: 'The Importance of Prayer in Islam (Updated)',
      bodyMarkdown: '# The Importance of Prayer\n\nPrayer is the second pillar... [UNVERIFIED ADDITIONS]',
      contentHash: 'b'.repeat(64),
      sourceReferences: [{ citationType: 'quran', reference: '2:43' }],
      licensingMetadata: { license: 'CC-BY-SA-4.0', attribution: 'Islam ul Haramain' },
      aiAssistanceMetadata: { isAiAssisted: false },
      status: 'DRAFT', // New revision is unapproved
      createdBy: authorId,
      createdAt: new Date().toISOString()
    };

    // Try to publish Revision 2 using reviews array that only has approval for Revision 1
    const gate = verifyPublicationGate(mockArticle, mockRevision2, [mockReview1], editorId, ['editor']);
    assert.strictEqual(gate.canPublish, false);
    assert.match(gate.reason!, /publication requires an APPROVED revision/i);

    // Even if status field is forged to 'APPROVED' on revision 2, it lacks a review for revision 2!
    const forgedRev2 = { ...mockRevision2, status: 'APPROVED' as const };
    const gateForged = verifyPublicationGate(mockArticle, forgedRev2, [mockReview1], editorId, ['editor']);
    assert.strictEqual(gateForged.canPublish, false);
    assert.match(gateForged.reason!, /No independent scholar approval exists for revision 2/);
  });

  it('should REJECT publication if reviewer is the author', () => {
    const selfReview: ScholarReviewEntity = {
      ...mockReview1,
      reviewerId: authorId // Self-review
    };

    const gate = verifyPublicationGate(mockArticle, mockRevision1, [selfReview], editorId, ['editor']);
    assert.strictEqual(gate.canPublish, false);
    assert.match(gate.reason!, /Author cannot approve their own work/);
  });
});

describe('Articles CMS: Cryptographic Checksum & Immutability', () => {
  it('should calculate deterministic SHA-256 content hash', () => {
    const hash1 = calculateArticleContentHash(
      'Tafsir Surah Al-Fatihah',
      '# Introduction\n\nAl-Fatihah is the greatest Surah in the Quran...',
      [{ citationType: 'quran', reference: '1:1' }]
    );

    const hash2 = calculateArticleContentHash(
      'Tafsir Surah Al-Fatihah',
      '# Introduction\n\nAl-Fatihah is the greatest Surah in the Quran...',
      [{ citationType: 'quran', reference: '1:1' }]
    );

    assert.strictEqual(hash1, hash2);
    assert.strictEqual(hash1.length, 64);
    assert.strictEqual(verifyArticleContentHash(
      hash1,
      'Tafsir Surah Al-Fatihah',
      '# Introduction\n\nAl-Fatihah is the greatest Surah in the Quran...',
      [{ citationType: 'quran', reference: '1:1' }]
    ), true);
  });

  it('should detect when body text or citations are tampered with', () => {
    const originalHash = calculateArticleContentHash(
      'Tafsir Surah Al-Fatihah',
      'Original verified text',
      [{ citationType: 'quran', reference: '1:1' }]
    );

    const tamperedHash = calculateArticleContentHash(
      'Tafsir Surah Al-Fatihah',
      'Original verified text with [TAMPERED INSERTION]',
      [{ citationType: 'quran', reference: '1:1' }]
    );

    assert.notStrictEqual(originalHash, tamperedHash);
  });
});

describe('Articles CMS: AI & Licensing Governance Rules', () => {
  it('should pass valid human-authored article licensing and AI governance', () => {
    const aiResult = validateAiGovernance({ isAiAssisted: false });
    assert.strictEqual(aiResult.valid, true);

    const licResult = validateLicensing({
      license: 'CC-BY-SA-4.0',
      attribution: 'Islam ul Haramain Scholar Board'
    });
    assert.strictEqual(licResult.valid, true);
  });

  it('should REJECT AI-assisted article submitted without human author certification', () => {
    const aiResult = validateAiGovernance({
      isAiAssisted: true,
      toolUsed: 'Anthropic Claude',
      promptPurpose: 'Draft outline assistance'
      // missing humanVerifiedBy!
    }, true);

    assert.strictEqual(aiResult.valid, false);
    assert.match(aiResult.issues[0], /must be 100% reviewed and certified by a human author/);
  });

  it('should pass AI-assisted article once human author certification is documented', () => {
    const aiResult = validateAiGovernance({
      isAiAssisted: true,
      toolUsed: 'Anthropic Claude',
      promptPurpose: 'Spelling and grammar review',
      humanVerifiedBy: 'Ahmad al-Katib'
    }, true);

    assert.strictEqual(aiResult.valid, true);
  });
});

describe('Articles CMS: Citation Validator Integration with M2.5 Router', () => {
  it('should validate canonical Quran and Hadith citations', () => {
    const citationsResult = validateArticleCitations([
      { citationType: 'quran', reference: '2:255' },
      { citationType: 'hadith', reference: 'bukhari 1' },
      { citationType: 'dua', reference: 'hisn 1' },
      { citationType: 'external', reference: 'Ibn Qudamah, Al-Mughni, Vol 1, p. 120' }
    ]);

    assert.strictEqual(citationsResult.valid, true);
    assert.strictEqual(citationsResult.resolvedCitations.length, 4);
    assert.strictEqual(citationsResult.resolvedCitations[0].canonicalRoute, '/quran/2#ayah-255');
    assert.strictEqual(citationsResult.resolvedCitations[1].canonicalRoute, '/hadith/bukhari#hadith-1');
  });

  it('should flag invalid Quran citations that exceed canonical bounds', () => {
    const citationsResult = validateArticleCitations([
      { citationType: 'quran', reference: '115:1' }, // Nonexistent Surah
      { citationType: 'quran', reference: '1:8' }    // Surah 1 only has 7 ayahs
    ]);

    assert.strictEqual(citationsResult.valid, false);
    assert.strictEqual(citationsResult.issues.length, 2);
    assert.match(citationsResult.issues[0].issue, /Unverifiable scripture citation '115:1'/);
    assert.match(citationsResult.issues[1].issue, /Unverifiable scripture citation '1:8'/);
  });
});
