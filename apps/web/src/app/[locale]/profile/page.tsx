/**
 * @file page.tsx
 * @package @islamic/web
 * @description User Profile & Devotional Dashboard with account identity,
 *              reading statistics, devotional preferences, and library shortcuts.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, isSupportedLocale, type Locale } from '@islamic/ui';
import { LibraryService } from '@islamic/database';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import type { Metadata } from 'next';
import { buildPrivatePageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';
  return buildPrivatePageMetadata('User Profile', typedLocale);
}

export default async function UserProfilePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  const dict = getDictionary(typedLocale);

  const libraryService = new LibraryService();
  const testUserId = '00000000-0000-0000-0000-000000000001';
  let totalBookmarks = 0;
  const byType = { quran: 0, hadith: 0, dua: 0, article: 0 };

  try {
    const res = await libraryService.listUserBookmarks(
      { id: testUserId, roles: ['user'] },
      { limit: 1000 }
    );
    totalBookmarks = res.total;
    for (const b of res.bookmarks) {
      if (b.contentType in byType) {
        byType[b.contentType as keyof typeof byType]++;
      }
    }
  } catch {
    // Fallback if local in-memory or db is empty
  }
  const stats = { totalBookmarks, byType };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Profile Header */}
      <header
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: '#047857',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700
            }}
          >
            👤
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
              {dict.profile.title}
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
              {dict.profile.subtitle}
            </p>
          </div>
        </div>

        <Link
          href={`/${typedLocale}/library`}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#047857',
            color: '#ffffff',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>🔖</span>
          <span>{dict.nav.library} ({stats.totalBookmarks})</span>
        </Link>
      </header>

      {/* Devotional Statistics Grid */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
          {dict.profile.devotionalStats}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#166534' }}>{stats.byType.quran}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#15803d' }}>{dict.library.quranBookmarks}</div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.byType.hadith}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{dict.library.hadithBookmarks}</div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#92400e' }}>{stats.byType.dua}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#b45309' }}>{dict.library.duaBookmarks}</div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#5b21b6' }}>{stats.byType.article}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6d28d9' }}>{dict.library.articleBookmarks}</div>
          </div>
        </div>
      </section>

      {/* Account & Preferences Settings */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Account Identity */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            {dict.profile.accountInfo}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>{dict.profile.userId}: </span>
              <code style={{ backgroundColor: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', color: '#0f172a' }}>
                {testUserId}
              </code>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>{dict.profile.role}: </span>
              <span style={{ fontWeight: 600, color: '#047857' }}>Registered Devotional User</span>
            </div>
          </div>
        </div>

        {/* Display & Language Preferences */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
            {dict.profile.languagePreference} & {dict.profile.mushafPreference}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{dict.profile.languagePreference}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Switch application interface language and directionality</div>
              </div>
              <LanguageSwitcher currentLocale={typedLocale} />
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{dict.profile.mushafPreference}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Selected default Quranic script rendering</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ padding: '0.35rem 0.75rem', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.85rem' }}>
                  ✓ {dict.profile.uthmaniScript}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Prayer Settings Card */}
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {dict.profile.prayerSettings}
            </h3>
            <Link
              href={`/${typedLocale}/prayer-times`}
              style={{ fontSize: '0.85rem', color: '#047857', textDecoration: 'none', fontWeight: 600 }}
            >
              {dict.prayer.calculationMethod} →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{dict.prayer.calculationMethod}</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>Muslim World League (MWL)</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{dict.prayer.asrMadhhab}</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>{dict.prayer.standard}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{dict.prayer.highLatitudeRule}</div>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>Angle-Based Rule</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
