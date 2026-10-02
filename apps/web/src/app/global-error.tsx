'use client';

import React from 'react';

/**
 * @file global-error.tsx
 * @package @islamic/web
 * @description Root fallback error boundary replacing the root layout upon catastrophic crashes.
 * Provides a serene, self-contained recovery UI without fragile application dependencies.
 * Strictly avoids rendering error messages, stack traces, database details, or user data.
 * Milestone: M8 Phase 3 — Web Application Error Boundaries & API Error Hardening
 */

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" dir="ltr">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            margin: '24px',
            padding: '40px',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Peaceful Icon / Emblem */}
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px auto',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              fontSize: '28px',
            }}
          >
            ✦
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              marginBottom: '12px',
              color: '#f8fafc',
            }}
          >
            ISLAM UL HARAMAIN
          </h1>

          <p
            style={{
              fontSize: '15px',
              color: '#94a3b8',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            An unexpected error occurred while loading the application.
            <br />
            حدث خطأ غير متوقع أثناء تحميل المنصة.
            <br />
            پلیٹ فارم لوڈ کرتے وقت ایک غیر متوقع خرابی پیش آگئی ہے۔
          </p>

          <p
            style={{
              fontSize: '13px',
              color: '#64748b',
              marginBottom: '32px',
            }}
          >
            No user data or devotional content was affected. Please try refreshing or return to the main portal.
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
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              Try Again / إعادة المحاولة / دوبارہ کوشش
            </button>
            <a
              href="/"
              style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #475569',
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Home / الرئيسية / مرکزی صفحہ
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
