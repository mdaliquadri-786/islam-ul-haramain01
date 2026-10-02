'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function LocalizedErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname() || '';
  const isArabic = pathname.startsWith('/ar');
  const isUrdu = pathname.startsWith('/ur');
  const isRtl = isArabic || isUrdu;

  useEffect(() => {
    // Error caught at locale segment boundary; detailed diagnostics logged server-side
  }, [error]);

  const title = isArabic
    ? 'تعذر عرض الصفحة المطلوبة'
    : isUrdu
    ? 'مطلوبہ صفحہ ظاہر نہیں ہو سکا'
    : 'Unable to Display Requested Page';

  const description = isArabic
    ? 'حدث خطأ تقني غير متوقع. لم تتأثر أي من بياناتكم أو سجلات تلاوتكم المحفوظة. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.'
    : isUrdu
    ? 'ایک غیر متوقع تکنیکی خرابی پیش آگئی ہے۔ آپ کے ذاتی کوائف یا تلاوت کے محفوظ نشانات بالکل محفوظ ہیں۔ براہ کرم دوبارہ کوشش کریں یا مرکزی صفحہ پر جائیں۔'
    : 'An unexpected technical issue occurred. None of your bookmarks or devotional progress were affected. Please try reloading or return home.';

  const retryText = isArabic ? 'إعادة المحاولة' : isUrdu ? 'دوبارہ کوشش کریں' : 'Try Again';
  const homeText = isArabic ? 'العودة للرئيسية' : isUrdu ? 'مرکزی صفحہ' : 'Return Home';
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
          padding: '36px',
          textAlign: 'center',
          boxShadow: '0 10px 20px -3px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 20px auto',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            fontSize: '24px',
          }}
        >
          ✦
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
            lineHeight: 1.7,
            marginBottom: '28px',
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
          <button
            onClick={() => reset()}
            type="button"
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {retryText}
          </button>
          <a
            href={homeHref}
            style={{
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              padding: '10px 22px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {homeText}
          </a>
        </div>
      </div>
    </div>
  );
}
