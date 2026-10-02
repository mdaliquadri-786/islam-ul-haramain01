'use client';

/**
 * @file page.tsx
 * @package @islamic/web
 * @description CMS & Scholar Review Workflow Portal.
 * Interactive dashboard for authoring, scholar peer review, and publication gating.
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type UserRole = 'user' | 'scholar_reviewer' | 'editor';

interface ArticleItem {
  id: string;
  slug: string;
  categoryId: string;
  authorId: string;
  status: string;
  currentRevisionId: string | null;
  readingTimeMinutes: number;
  primaryMadhhab: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  revisions: Array<{
    id: string;
    revisionNumber: number;
    title: string;
    subtitle?: string;
    excerpt?: string;
    bodyMarkdown: string;
    contentHash: string;
    status: string;
    sourceReferences?: Array<{ citationType: string; reference: string; textExcerpt?: string }>;
    licensingMetadata?: { license: string; attribution: string };
    aiAssistanceMetadata?: { isAiAssisted: boolean; humanReviewed?: boolean };
  }>;
}

interface CategoryItem {
  id: string;
  slug: string;
  nameEnglish: string;
  nameArabic: string;
}

const ACTORS = {
  user: {
    id: '00000000-0000-0000-0001-000000000001',
    name: 'Author (Zayd al-Katib)',
    role: 'user' as UserRole,
    description: 'Can create drafts and submit them for scholarly review'
  },
  scholar_reviewer: {
    id: '00000000-0000-0000-0001-000000000002',
    name: 'Shaykh Dr. Ahmad (Peer Reviewer)',
    role: 'scholar_reviewer' as UserRole,
    description: 'Credentialed Sunni scholar responsible for review & approval'
  },
  editor: {
    id: '00000000-0000-0000-0001-000000000003',
    name: 'Chief Editor (Tariq al-Muraqib)',
    role: 'editor' as UserRole,
    description: 'Assigns reviewers and executes publication safety gate'
  }
};

export default function CmsPortalPage() {
  const [activeRoleKey, setActiveRoleKey] = useState<UserRole>('editor');
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Draft Creation Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newReadingTime, setNewReadingTime] = useState(5);
  const [newBodyMarkdown, setNewBodyMarkdown] = useState('');
  const [newCitationType, setNewCitationType] = useState('quran');
  const [newCitationRef, setNewCitationRef] = useState('2:255');
  const [newIsAiAssisted, setNewIsAiAssisted] = useState(false);
  const [newHumanReviewed, setNewHumanReviewed] = useState(true);


  const currentActor = ACTORS[activeRoleKey];

  const fetchCmsData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/cms/articles?role=${currentActor.role}&userId=${currentActor.id}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles || []);
        setCategories(data.categories || []);
        if (data.categories?.length > 0 && !newCategoryId) {
          setNewCategoryId(data.categories[0].id);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch CMS data';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [currentActor.id, currentActor.role, newCategoryId]);

  useEffect(() => {
    fetchCmsData();
  }, [fetchCmsData]);

  // Handle Draft Creation
  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const payload = {
        title: newTitle,
        subtitle: newSubtitle || undefined,
        slug: newSlug || newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        categoryId: newCategoryId || categories[0]?.id,
        language: 'en',
        primaryMadhhab: 'general',
        readingTimeMinutes: Number(newReadingTime),
        bodyMarkdown: newBodyMarkdown,
        sourceReferences: newCitationRef
          ? [{ citationType: newCitationType, reference: newCitationRef }]
          : [],
        licensingMetadata: {
          license: 'CC-BY-SA-4.0',
          attribution: 'Islam ul Haramain Research Guild'
        },
        aiAssistanceMetadata: {
          isAiAssisted: newIsAiAssisted,
          humanReviewed: newIsAiAssisted ? newHumanReviewed : undefined
        }
      };

      const res = await fetch('/api/cms/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_draft',
          actorId: currentActor.id,
          actorRoles: [currentActor.role],
          payload
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setFeedback({ type: 'success', message: `Draft "${newTitle}" created successfully!` });
      setNewTitle('');
      setNewSubtitle('');
      setNewSlug('');
      setNewBodyMarkdown('');
      fetchCmsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating draft';
      setFeedback({ type: 'error', message: msg });
    }
  };

  // Handle Workflow Action
  const handleWorkflowAction = async (action: string, payload: Record<string, unknown>) => {
    setFeedback(null);
    try {
      const res = await fetch('/api/cms/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorId: currentActor.id,
          actorRoles: [currentActor.role],
          ...payload
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setFeedback({ type: 'success', message: `Action "${action}" completed successfully!` });
      fetchCmsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Workflow action failed';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'APPROVED':
        return 'bg-teal-950 text-teal-300 border-teal-800';
      case 'UNDER_REVIEW':
      case 'SUBMITTED_FOR_REVIEW':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'CHANGES_REQUESTED':
        return 'bg-orange-950 text-orange-300 border-orange-800';
      case 'REJECTED':
        return 'bg-red-950 text-red-300 border-red-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                Editorial & Governance
              </span>
              <span className="text-xs text-slate-400">Milestone M3.2</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              Articles CMS & Scholar Review Workflow
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Rigorous multi-stage peer review workflow enforcing complete author self-approval prohibition and publication safety gates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/articles"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
            >
              ← Public Articles Catalog
            </Link>
          </div>
        </div>

        {/* Role Simulator Switcher */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Simulate Role Identity
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch identity to test RBAC, scholar review assignment, self-approval prevention, and publication gates:
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(ACTORS) as UserRole[]).map(roleKey => {
                const act = ACTORS[roleKey];
                const isActive = activeRoleKey === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => setActiveRoleKey(roleKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    {act.name} ({act.role})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Active Actor: <strong className="text-emerald-400">{currentActor.name}</strong> ({currentActor.role})
            </span>
            <span className="hidden sm:inline italic text-slate-500">{currentActor.description}</span>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800'
                : 'bg-red-950/80 text-red-200 border-red-800'
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline ml-4 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: Pipeline & Authoring */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles & Review Queue List (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Article Pipeline & Review Queue</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {articles.length} total
                </span>
              </h2>
              <button
                onClick={fetchCmsData}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                ↻ Refresh List
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm bg-slate-900/40 rounded-xl border border-slate-800">
                Loading editorial pipeline...
              </div>
            ) : articles.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm bg-slate-900/40 rounded-xl border border-slate-800">
                No articles found in repository.
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map(art => {
                  const latestRev = art.revisions && art.revisions.length > 0 ? art.revisions[art.revisions.length - 1] : null;
                  const cat = categories.find(c => c.id === art.categoryId);
                  const isAuthor = art.authorId === currentActor.id;

                  return (
                    <div
                      key={art.id}
                      className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`px-2 py-0.5 text-[11px] font-bold rounded border uppercase tracking-wider ${getStatusBadge(
                                art.status
                              )}`}
                            >
                              {art.status}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              /{art.slug}
                            </span>
                            {cat && (
                              <span className="text-xs text-slate-500">
                                • {cat.nameEnglish}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-white">
                            {latestRev ? latestRev.title : art.slug}
                          </h3>
                          {latestRev?.subtitle && (
                            <p className="text-xs text-emerald-400 mt-0.5">
                              {latestRev.subtitle}
                            </p>
                          )}
                        </div>

                        <div className="text-right text-xs text-slate-500 font-mono">
                          <div>Rev #{latestRev?.revisionNumber || 1}</div>
                          <div>{art.readingTimeMinutes} min read</div>
                        </div>
                      </div>

                      {/* Content Preview & Excerpt */}
                      {latestRev?.excerpt && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {latestRev.excerpt}
                        </p>
                      )}

                      {/* Author & Verification State */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-3">
                          <span>
                            Author: <strong className="text-slate-300 font-mono text-[11px]">{art.authorId.substring(0, 8)}...</strong>
                            {isAuthor && <span className="text-emerald-400 ml-1">(You)</span>}
                          </span>
                          {latestRev?.contentHash && (
                            <span className="font-mono text-[10px] text-slate-500">
                              SHA: {latestRev.contentHash.substring(0, 10)}...
                            </span>
                          )}
                        </div>

                        {/* Contextual Workflow Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* If Author & DRAFT -> Submit for Review */}
                          {art.status === 'DRAFT' && latestRev && (
                            <button
                              onClick={() =>
                                handleWorkflowAction('submit_review', {
                                  articleId: art.id,
                                  revisionId: latestRev.id
                                })
                              }
                              className="px-3 py-1 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-300 border border-amber-700/60 text-xs font-medium transition"
                            >
                              Submit for Scholar Review →
                            </button>
                          )}

                          {/* If Editor & SUBMITTED_FOR_REVIEW -> Assign Scholar */}
                          {art.status === 'SUBMITTED_FOR_REVIEW' && latestRev && (
                            <button
                              onClick={() =>
                                handleWorkflowAction('assign_scholar', {
                                  articleId: art.id,
                                  revisionId: latestRev.id,
                                  reviewerId: ACTORS.scholar_reviewer.id
                                })
                              }
                              className="px-3 py-1 rounded bg-teal-900/60 hover:bg-teal-800 text-teal-300 border border-teal-700/60 text-xs font-medium transition"
                            >
                              Assign Scholar Reviewer (Dr. Ahmad)
                            </button>
                          )}

                          {/* If Scholar & UNDER_REVIEW -> Review Actions */}
                          {art.status === 'UNDER_REVIEW' && latestRev && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  handleWorkflowAction('submit_decision', {
                                    reviewId: 'auto', // Handled by review state in backend
                                    decision: 'APPROVED',
                                    scholarlyNotes: 'Approved upon scholarly review. Citations verified.'
                                  });
                                }}
                                className="px-3 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60 text-xs font-medium transition"
                              >
                                Approve Revision ✓
                              </button>
                              <button
                                onClick={() => {
                                  handleWorkflowAction('submit_decision', {
                                    reviewId: 'auto',
                                    decision: 'CHANGES_REQUESTED',
                                    scholarlyNotes: 'Please verify tafsir attribution for verse 2:285.'
                                  });
                                }}
                                className="px-3 py-1 rounded bg-orange-900/60 hover:bg-orange-800 text-orange-300 border border-orange-700/60 text-xs font-medium transition"
                              >
                                Request Changes
                              </button>
                            </div>
                          )}

                          {/* If Editor & APPROVED -> Publish Gate */}
                          {art.status === 'APPROVED' && latestRev && (
                            <button
                              onClick={() =>
                                handleWorkflowAction('publish', {
                                  articleId: art.id,
                                  revisionId: latestRev.id
                                })
                              }
                              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-950"
                            >
                              Execute Publication Gate → Publish Live
                            </button>
                          )}

                          {/* If PUBLISHED -> View Live */}
                          {art.status === 'PUBLISHED' && (
                            <Link
                              href={`/articles/${art.slug}`}
                              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-medium transition flex items-center gap-1"
                            >
                              <span>View Live Article</span>
                              <span>↗</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Create New Article Draft & Governance Safeguards (1 col) */}
          <div className="space-y-6">
            {/* Create Draft Form */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Create Article Draft</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authored content must cite authentic classical sources.
                </p>
              </div>

              <form onSubmit={handleCreateDraft} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. The Etiquettes of Supplication"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Subtitle / Clarification
                  </label>
                  <input
                    type="text"
                    value={newSubtitle}
                    onChange={e => setNewSubtitle(e.target.value)}
                    placeholder="e.g. Adab al-Du'a in the Sunnah"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Category *
                    </label>
                    <select
                      value={newCategoryId}
                      onChange={e => setNewCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.nameEnglish}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Read Time (min)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={newReadingTime}
                      onChange={e => setNewReadingTime(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Primary Citation Reference
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newCitationType}
                      onChange={e => setNewCitationType(e.target.value)}
                      className="col-span-1 px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="quran">Quran</option>
                      <option value="hadith">Hadith</option>
                      <option value="dua">Dua</option>
                    </select>
                    <input
                      type="text"
                      value={newCitationRef}
                      onChange={e => setNewCitationRef(e.target.value)}
                      placeholder="e.g. 2:255 or bukhari 1"
                      className="col-span-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Article Body (Markdown) *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={newBodyMarkdown}
                    onChange={e => setNewBodyMarkdown(e.target.value)}
                    placeholder="Write article in markdown format... Include quotes with > and headers with ##."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* AI Assistance Declaration */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ai-assisted"
                      checked={newIsAiAssisted}
                      onChange={e => setNewIsAiAssisted(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0"
                    />
                    <label htmlFor="ai-assisted" className="text-slate-300 font-medium">
                      AI Assistance Used in Drafting
                    </label>
                  </div>
                  {newIsAiAssisted && (
                    <div className="flex items-center gap-2 pl-5">
                      <input
                        type="checkbox"
                        id="human-reviewed"
                        checked={newHumanReviewed}
                        onChange={e => setNewHumanReviewed(e.target.checked)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-0"
                      />
                      <label htmlFor="human-reviewed" className="text-slate-400">
                        Human author verified 100% of facts & citations
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition shadow-md shadow-emerald-950"
                >
                  Save New Article Draft
                </button>
              </form>
            </div>

            {/* Governance Checklist Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3 text-xs text-slate-400">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">⚖️</span>
                <span>Editorial Governance Rules</span>
              </h4>
              <ul className="space-y-2 list-disc list-inside text-slate-400">
                <li>
                  <strong className="text-slate-300">Author Self-Approval Prohibited:</strong> An author cannot approve their own drafts or revisions.
                </li>
                <li>
                  <strong className="text-slate-300">Independent Scholar Peer Review:</strong> Only qualified scholars holding the `scholar_reviewer` role can issue approval.
                </li>
                <li>
                  <strong className="text-slate-300">Zero AI Authority:</strong> AI cannot serve as an approving scholar, reviewer, or publishing editor.
                </li>
                <li>
                  <strong className="text-slate-300">Publication Gate:</strong> Unapproved revisions or mutated content hashes cannot be published to the public portal.
                </li>
                <li>
                  <strong className="text-slate-300">Standard License:</strong> All published articles are released under CC-BY-SA-4.0 with full attribution.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
