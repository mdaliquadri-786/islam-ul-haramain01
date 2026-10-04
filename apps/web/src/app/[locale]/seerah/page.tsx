/**
 * @file page.tsx
 * @package @islamic/web
 * @description Main Prophetic Biography (Seerah an-Nabawiyyah) portal (Server Component).
 *              Renders an authoritative scholarly introduction to Prophetic history and embeds
 *              the interactive vertical Seerah timeline covering Makkan and Madinan epochs.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { isSupportedLocale, type Locale } from '@islamic/ui';
import { SeerahInteractiveTimeline } from '@/components/seerah/SeerahInteractiveTimeline';
import type { Metadata } from 'next';
import { constructPageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';

  const title =
    typedLocale === 'ar'
      ? 'السيرة النبوية الشريفة — التاريخ المحقق لرسول الله ﷺ'
      : typedLocale === 'ur'
      ? 'سیرت النبی ﷺ — خاتم النبیین کی مکمل مستند تاریخ'
      : 'Prophetic Biography (Seerah) | ISLAM UL HARAMAIN';

  const description =
    typedLocale === 'ar'
      ? 'استكشف السيرة النبوية الشريفة عبر جدول زمني تفاعلي يوثق أحداث العهدين المكي والمدني بأدلة القرآن وصحيح الحديث.'
      : typedLocale === 'ur'
      ? 'سیرت طیبہ کا مستند مطالعہ: مکی اور مدنی ادوار کے تمام اہم تاریخی و شرعی واقعات کا تحقیقی جائزہ۔'
      : 'Comprehensive, interactive chronological timeline of the life of Prophet Muhammad ﷺ with Quranic and Hadith references.';

  return constructPageMetadata({
    title,
    description,
    path: '/seerah',
    locale: typedLocale,
  });
}

export default async function SeerahLandingPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* 1. Hero Section */}
      <section
        style={{
          padding: '3rem 2rem',
          backgroundColor: '#0f172a',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          marginBottom: '2.5rem',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'inline-block',
            marginBottom: '1rem',
          }}
        >
          {typedLocale === 'ar' ? 'علم السيرة والمغازي' : 'Prophetic History & Tarikh'}
        </span>

        <h1 style={{ fontSize: 'clamp(1.85rem, 4vw, 2.75rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 1rem 0' }}>
          {typedLocale === 'ar'
            ? 'السيرة النبوية العطرة — مسيرة النور والهدى ﷺ'
            : 'The Life of the Final Messenger ﷺ'}
        </h1>

        <p style={{ maxWidth: '750px', margin: '0 auto', fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>
          {typedLocale === 'ar'
            ? 'دراسة تاريخية وشرعية موثقة لحياة النبي محمد ﷺ من المولد النبوي الشريف حتى حجة الوداع، مع ربط الأحداث بآيات القرآن الكريم وروايات كتب السنة الستة.'
            : 'An authoritative chronological journey through the Makkan and Madinan periods, mapping pivotal moments of Divine revelation, constitutional treaties, and universal ethical teachings.'}
        </p>
      </section>

      {/* 2. Interactive Seerah Timeline Component */}
      <SeerahInteractiveTimeline />
    </div>
  );
}
