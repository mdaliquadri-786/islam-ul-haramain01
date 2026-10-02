import React from 'react';

/**
 * @file not-found.tsx
 * @package @islamic/web
 * @description Root 404 handler for un-prefixed or invalid paths.
 * Directs visitors to localized portal entries without leaking URL parameters.
 * Milestone: M8 Phase 3 — Web Application Error Boundaries & API Error Hardening
 */

export default function RootNotFound() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '32px 16px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
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
            fontSize: '44px',
            fontWeight: 800,
            color: '#10b981',
            letterSpacing: '2px',
            marginBottom: '10px',
          }}
        >
          404
        </div>

        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '12px',
          }}
        >
          Page Not Found
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          The page you requested could not be found. Please select your preferred language to visit Islam Ul Haramain:
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
            href="/en"
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            English
          </a>
          <a
            href="/ar"
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            العربية
          </a>
          <a
            href="/ur"
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            اردو
          </a>
        </div>
      </div>
    </div>
  );
}
