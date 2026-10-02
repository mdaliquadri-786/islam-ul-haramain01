/**
 * @file page.tsx
 * @package @islamic/web
 * @description Public Article Reader view for ISLAM UL HARAMAIN.
 * Displays published articles with verified citations, scholar review provenance, and licensing notices.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleService } from '@/lib/articles';
import { BookmarkButton } from '@/components/BookmarkButton';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const service = await getArticleService();
  const data = await service.getPublicArticleBySlug(slug);

  if (!data) {
    return {
      title: 'Article Not Found — ISLAM UL HARAMAIN'
    };
  }

  return {
    title: `${data.revision.title} — ISLAM UL HARAMAIN`,
    description: data.revision.excerpt || data.revision.subtitle || 'Authentic Islamic research article'
  };
}

export default async function SingleArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const service = await getArticleService();
  const data = await service.getPublicArticleBySlug(slug);

  if (!data) {
    notFound();
  }

  const { article, revision, category } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-emerald-400 transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-emerald-400 transition">
            Articles & Research
          </Link>
          {category && (
            <>
              <span>/</span>
              <Link
                href={`/articles?category=${category.slug}`}
                className="hover:text-emerald-400 transition"
              >
                {category.nameEnglish}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-slate-300 truncate max-w-xs">{revision.title}</span>
        </nav>

        {/* Article Header */}
        <header className="border-b border-slate-800 pb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {category && (
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-full flex items-center gap-1.5">
                <span>{category.nameEnglish}</span>
                <span className="font-serif opacity-75">({category.nameArabic})</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-900 text-slate-300 border border-slate-800">
              Revision #{revision.revisionNumber}
            </span>
            <span className="text-xs text-slate-400">
              {article.readingTimeMinutes} min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            {revision.title}
          </h1>

          {revision.subtitle && (
            <p className="text-lg sm:text-xl text-emerald-400 font-medium leading-relaxed">
              {revision.subtitle}
            </p>
          )}

          {/* Metadata Attribution Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 border-t border-slate-900">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500">License: </span>
                <span className="text-slate-300 font-mono font-medium">
                  {revision.licensingMetadata?.license || 'CC-BY-SA-4.0'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Attribution: </span>
                <span className="text-slate-300">
                  {revision.licensingMetadata?.attribution || 'ISLAM UL HARAMAIN'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-lg text-emerald-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Independent Scholar Peer-Reviewed & Approved</span>
              </div>
              <BookmarkButton
                contentType="article"
                contentReference={article.slug}
                label="Bookmark"
              />
            </div>
          </div>
        </header>

        {/* Article Body */}
        <main className="prose prose-invert prose-emerald max-w-none space-y-6 text-slate-300 leading-relaxed text-base sm:text-lg">
          {renderMarkdownBody(revision.bodyMarkdown)}
        </main>

        {/* Verified Source Citations Section */}
        {revision.sourceReferences && revision.sourceReferences.length > 0 && (
          <section className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-lg">📖</span>
                <h2 className="text-lg font-bold text-white">
                  Verified Classical Source Citations
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {revision.sourceReferences.length} verified references
              </span>
            </div>

            <div className="space-y-4">
              {revision.sourceReferences.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-900">
                        {ref.citationType.toUpperCase()}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {ref.reference}
                      </span>
                    </div>
                    {ref.textExcerpt && (
                      <p className="text-xs text-slate-400 italic">
                        &quot;{ref.textExcerpt}&quot;
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/search?q=${encodeURIComponent(ref.reference)}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition flex-shrink-0"
                  >
                    <span>View Primary Source</span>
                    <span>→</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Religious Governance & Provenance Disclosure */}
        <footer className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 space-y-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <span className="text-emerald-500">🛡️</span>
            <h3>Doctrinal & Methodology Safeguards</h3>
          </div>
          <p className="leading-relaxed">
            This article has undergone rigorous peer review by independent, credentialed Sunni scholars in accordance with the ISLAM UL HARAMAIN Religious Review Governance framework. Content is strictly aligned with the classical consensus of Ahl al-Sunnah wa al-Jama`ah. In strict compliance with platform methodology, no automated or artificial intelligence system holds editorial, theological, or approval authority.
          </p>
          <div className="pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
            <span>Canonical SHA-256 Revision Hash: {revision.contentHash.substring(0, 16)}...</span>
            <Link href="/articles" className="text-emerald-400 hover:text-emerald-300">
              ← Return to Articles Catalog
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * Lightweight markdown parser for educational article bodies.
 */
function renderMarkdownBody(markdown: string) {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];
  let keyCounter = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ');
      elements.push(
        <p key={`p-${keyCounter++}`} className="leading-relaxed mb-4 text-slate-300">
          {renderInlineFormatting(text)}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      const text = blockquoteLines.join(' ');
      elements.push(
        <blockquote
          key={`bq-${keyCounter++}`}
          className="border-l-4 border-emerald-500 bg-slate-900/60 py-3 px-5 rounded-r-xl my-4 text-slate-200 italic"
        >
          {renderInlineFormatting(text)}
        </blockquote>
      );
      blockquoteLines = [];
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushBlockquote();
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      flushBlockquote();
      elements.push(
        <h3 key={`h3-${keyCounter++}`} className="text-xl font-bold text-white mt-8 mb-3">
          {renderInlineFormatting(line.replace('### ', ''))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      flushParagraph();
      flushBlockquote();
      elements.push(
        <h2 key={`h2-${keyCounter++}`} className="text-2xl font-bold text-emerald-400 mt-10 mb-4 border-b border-slate-800 pb-2">
          {renderInlineFormatting(line.replace('## ', ''))}
        </h2>
      );
    } else if (line.startsWith('> ')) {
      flushParagraph();
      inBlockquote = true;
      blockquoteLines.push(line.replace(/^>\s*/, ''));
    } else if (line.startsWith('- ') || /^\d+\.\s/.test(line)) {
      flushParagraph();
      flushBlockquote();
      const isOrdered = /^\d+\.\s/.test(line);
      const content = isOrdered ? line.replace(/^\d+\.\s*/, '') : line.replace(/^-\s*/, '');
      elements.push(
        <div key={`li-${keyCounter++}`} className="flex items-start gap-2.5 my-2 ml-4">
          <span className="text-emerald-500 font-bold mt-0.5">•</span>
          <span className="text-slate-300">{renderInlineFormatting(content)}</span>
        </div>
      );
    } else {
      if (inBlockquote) {
        blockquoteLines.push(line);
      } else {
        currentParagraph.push(line);
      }
    }
  }

  flushParagraph();
  flushBlockquote();

  return elements;
}

/**
 * Handles basic markdown bold, italic, and arabic spans.
 */
function renderInlineFormatting(text: string): React.ReactNode {
  // Regex to split by markdown bold **text** or *text*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-emerald-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}
