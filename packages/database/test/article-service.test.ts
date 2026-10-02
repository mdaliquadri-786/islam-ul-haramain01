/**
 * @file article-service.test.ts
 * @package @islamic/database
 * @description Comprehensive test suite for ArticleService, Scholar Review Workflow,
 *              Self-Approval Prevention, Revision Lifecycle, Public Boundary Defense, and Audit Logging.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ArticleService, ActorContext } from '../src/articles/article-service.js';

describe('ArticleService: End-to-End Workflow & Publication Gating', () => {
  const service = new ArticleService();

  const authorActor: ActorContext = {
    id: '00000000-0000-0000-0001-000000000001',
    roles: ['user']
  };

  const scholarActor: ActorContext = {
    id: '00000000-0000-0000-0001-000000000002',
    roles: ['scholar_reviewer']
  };

  const editorActor: ActorContext = {
    id: '00000000-0000-0000-0001-000000000003',
    roles: ['editor']
  };

  const categories = [
    '00000000-0000-0000-0001-000000000001', // aqeedah
    '00000000-0000-0000-0001-000000000002'  // fiqh
  ];

  let createdArticleId = '';
  let revision1Id = '';
  let revision2Id = '';
  let review1Id = '';

  it('1. should create an article draft with Revision 1 and audit logging', async () => {
    const { article, revision } = await service.createArticleDraft(
      {
        slug: 'the-creed-of-ahl-al-sunnah',
        title: 'The Creed of Ahl al-Sunnah wa al-Jama`ah',
        subtitle: 'An introduction to orthodox Sunni theology',
        excerpt: 'Summary of the essential articles of faith according to classical scholars.',
        language: 'en',
        categoryId: categories[0],
        primaryMadhhab: 'general',
        readingTimeMinutes: 7,
        bodyMarkdown: '# The Creed of Ahl al-Sunnah\n\nBelief in Allah, His Angels, His Books...',
        sourceReferences: [
          { citationType: 'quran', reference: '2:285' },
          { citationType: 'hadith', reference: 'muslim 93' }
        ],
        licensingMetadata: {
          license: 'CC-BY-SA-4.0',
          attribution: 'Islam ul Haramain Editorial Board'
        }
      },
      authorActor
    );

    assert.ok(article.id);
    assert.strictEqual(article.slug, 'the-creed-of-ahl-al-sunnah');
    assert.strictEqual(article.status, 'DRAFT');
    assert.strictEqual(article.authorId, authorActor.id);
    assert.strictEqual(revision.revisionNumber, 1);
    assert.strictEqual(revision.status, 'DRAFT');
    assert.strictEqual(revision.contentHash.length, 64);

    createdArticleId = article.id;
    revision1Id = revision.id;

    // Check audit log
    const logs = service.getAuditLogs();
    const createLog = logs.find(l => l.action === 'ARTICLE_DRAFT_CREATED' && l.targetEntityId === article.id);
    assert.ok(createLog, 'ARTICLE_DRAFT_CREATED audit event must be logged');
  });

  it('2. should submit article for review after validating citations and AI governance', async () => {
    const submitted = await service.submitForReview(createdArticleId, revision1Id, authorActor);
    assert.strictEqual(submitted.status, 'SUBMITTED_FOR_REVIEW');

    const rev = await service.getRevisionById(revision1Id);
    assert.strictEqual(rev?.status, 'SUBMITTED_FOR_REVIEW');

    const logs = service.getAuditLogs();
    assert.ok(logs.some(l => l.action === 'ARTICLE_SUBMITTED_FOR_REVIEW' && l.targetEntityId === createdArticleId));
  });

  it('3. should REJECT assigning the author to review their own article', async () => {
    await assert.rejects(
      async () => {
        await service.assignScholarReviewer(createdArticleId, revision1Id, authorActor.id, editorActor);
      },
      /Self-Approval Violation: An author cannot be assigned to review their own religious article/
    );
  });

  it('4. should assign independent scholar reviewer and transition to UNDER_REVIEW', async () => {
    const review = await service.assignScholarReviewer(createdArticleId, revision1Id, scholarActor.id, editorActor);
    assert.strictEqual(review.status, 'PENDING');
    assert.strictEqual(review.reviewerId, scholarActor.id);
    assert.strictEqual(review.revisionId, revision1Id);

    const art = await service.getArticleById(createdArticleId);
    assert.strictEqual(art?.status, 'UNDER_REVIEW');

    review1Id = review.id;
  });

  it('5. should add scholar review comments and notes', async () => {
    const comment = await service.addReviewComment(
      {
        reviewId: review1Id,
        articleId: createdArticleId,
        revisionId: revision1Id,
        commentType: 'scholarly_note',
        paragraphReference: 'Section 1.2',
        commentText: 'The Hadith of Jibril cited as Muslim 93 has been verified in the canonical text.'
      },
      scholarActor
    );

    assert.ok(comment.id);
    assert.strictEqual(comment.commentType, 'scholarly_note');
    assert.strictEqual(comment.resolutionStatus, 'open');

    const history = await service.getReviewHistory(createdArticleId, scholarActor);
    assert.strictEqual(history.comments.length, 1);
  });

  it('6. CRITICAL: should REJECT author attempting to approve their own article', async () => {
    await assert.rejects(
      async () => {
        await service.submitReviewDecision(review1Id, 'APPROVED', 'Self-certifying my own article.', authorActor);
      },
      /Self-Approval Violation/
    );
  });

  it('7. should allow independent scholar to submit APPROVED decision', async () => {
    const { review, article } = await service.submitReviewDecision(
      review1Id,
      'APPROVED',
      'The article accurately reflects the Sunni consensus. All citations verified.',
      scholarActor
    );

    assert.strictEqual(review.status, 'APPROVED');
    assert.strictEqual(review.decision, 'APPROVED');
    assert.strictEqual(article.status, 'APPROVED');

    const rev = await service.getRevisionById(revision1Id);
    assert.strictEqual(rev?.status, 'APPROVED');
  });

  it('8. should successfully publish approved Revision 1 via publication gate', async () => {
    const published = await service.publishArticle(createdArticleId, revision1Id, editorActor);
    assert.strictEqual(published.status, 'PUBLISHED');
    assert.strictEqual(published.publishedRevisionId, revision1Id);
    assert.ok(published.publishedAt);

    const logs = service.getAuditLogs();
    assert.ok(logs.some(l => l.action === 'ARTICLE_PUBLISHED' && l.targetEntityId === createdArticleId));
  });

  it('9. CRITICAL: author editing published article creates Revision 2 (N+1) and MUST NOT inherit Revision 1 approval', async () => {
    const rev2 = await service.createArticleRevision(
      createdArticleId,
      {
        title: 'The Creed of Ahl al-Sunnah wa al-Jama`ah (Second Edition)',
        bodyMarkdown: '# The Creed\n\n[New unreviewed content added here...]',
        sourceReferences: [{ citationType: 'quran', reference: '2:285' }],
        changeSummary: 'Added new discussion on divine attributes.'
      },
      authorActor
    );

    assert.strictEqual(rev2.revisionNumber, 2);
    assert.strictEqual(rev2.status, 'DRAFT');

    revision2Id = rev2.id;

    // Revision 1 remains the published revision, while Revision 2 is in DRAFT!
    assert.notStrictEqual(revision1Id, revision2Id);

    // Attempting to publish unapproved Revision 2 MUST FAIL!
    await assert.rejects(
      async () => {
        await service.publishArticle(createdArticleId, revision2Id, editorActor);
      },
      /Publication Gate Rejection: Revision 2 is in 'DRAFT' status, but publication requires an APPROVED revision/
    );
  });

  it('10. Public Boundary: getPublicArticleBySlug returns only published article and published revision', async () => {
    const publicArticle = await service.getPublicArticleBySlug('the-creed-of-ahl-al-sunnah');
    assert.ok(publicArticle, 'Published article must be publicly accessible');
    assert.strictEqual(publicArticle.article.status, 'PUBLISHED');
    assert.strictEqual(publicArticle.revision.id, revision1Id);
    assert.strictEqual(publicArticle.revision.revisionNumber, 1);

    // Unapproved drafts must NOT be returned publicly
    const nonExistent = await service.getPublicArticleBySlug('non-existent-or-draft-slug');
    assert.strictEqual(nonExistent, null);
  });

  it('11. Public Boundary: listPublicArticles excludes unpublished drafts', async () => {
    // Create an unapproved draft article
    await service.createArticleDraft(
      {
        slug: 'private-unapproved-draft',
        title: 'Private Unapproved Draft',
        bodyMarkdown: 'Draft text',
        sourceReferences: []
      },
      authorActor
    );

    const { articles, total } = await service.listPublicArticles();
    assert.strictEqual(total, 1, 'Only 1 published article should be in public list');
    assert.strictEqual(articles[0].slug, 'the-creed-of-ahl-al-sunnah');
    assert.ok(!articles.some(a => a.slug === 'private-unapproved-draft'), 'Draft must not appear in public list');
  });

  it('12. CMS Scoping: author sees only own drafts, editor sees all', async () => {
    const authorArticles = await service.getCmsArticles(authorActor);
    assert.strictEqual(authorArticles.length, 2); // 2 articles created by authorActor

    const editorArticles = await service.getCmsArticles(editorActor);
    assert.strictEqual(editorArticles.length, 2); // editor sees all
  });
});
