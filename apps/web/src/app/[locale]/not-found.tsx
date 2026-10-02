'use client';

import React from 'react';

/**
 * @file not-found.tsx
 * @package @islamic/web
 * @description Localized 404 page for unmatched routes inside /[locale]/* segments.
 * Provides a serene Islamic aesthetic with links to canonical entry points.
 * Guarantees zero reflection of raw URL parameters, queries, or internal paths.
 * Milestone: M8 Phase 3 — Web Application Error Boundaries & API Error Hardening
 */

import { usePathname } from 'next/navigation';

export default function LocalizedNotFound() {
  const pathname = usePathname() || '';
  const isArabic = pathname.startsWith('/ar');
  const isUrdu = pathname.startsWith('/ur');
  const isRtl = isArabic || isUrdu;

  const title = isArabic ? 'الصفحة غير موجودة' : isUrdu ? 'صفحہ دستیاب نہیں ہے' : 'Page Not Found';

  const description = isArabic
    ? 'لم يتم العثور على الصفحة التي تبحث عنها. يرجى التحقق من الرابط أو الانتقال إلى الأقسام الرئيسية في منصة إسلام الحرمين.'
    : isUrdu
    ? 'آپ کا مطلوبہ صفحہ نہیں مل سکا۔ براہ کرم لنک چیک کریں یا اسلام الحرمین کے مرکزی شعبہ جات کی طرف رجوع فرمائیں۔'
    : 'The requested page could not be found. Please check the URL or navigate to the main sections of Islam Ul Haramain.';

  const homeText = isArabic ? 'الصفحة الرئيسية' : isUrdu ? 'مرکزی صفحہ' : 'Home';
  const quranText = isArabic ? 'القرآن الكريم' : isUrdu ? 'قرآن مجید' : 'Holy Quran';
  const hadithText = isArabic ? 'كتب الحديث' : isUrdu ? 'کتب حدیث' : 'Hadith';
  const homeHref = isArabic ? '/ar' : isUrdu ? '/ur' : '/en';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          width: '100%',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#10b981',
            letterSpacing: '2px',
            marginBottom: '12px',
          }}
        >
          404
        </div>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '14px',
          }}
        >
          {title}
        </h2>

        <p
          style={{
            fontSize: '15px',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          {description}
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <a
            href={homeHref}
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {homeText}
          </a>
          <a
            href={`${homeHref}/quran`}
            style={{
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {quranText}
          </a>
          <a
            href={`${homeHref}/hadith`}
            style={{
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {hadithText}
          </a>
        </div>
      </div>
    </div>
  );
}
