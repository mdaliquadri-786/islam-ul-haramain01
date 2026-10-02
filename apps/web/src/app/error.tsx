'use client';

import React, { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Error caught at root level; internal logging handled server-side
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '32px 16px',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '36px',
          textAlign: 'center',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
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
            fontSize: '20px',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '12px',
          }}
        >
          Page Encountered an Error
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          We apologize for the inconvenience. A technical error prevented this page from displaying correctly.
          No personal information or devotional records were compromised.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={() => reset()}
            type="button"
            style={{
              backgroundColor: '#047857',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
          <a
            href="/"
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
            Return to Portal
          </a>
        </div>
      </div>
    </div>
  );
}
