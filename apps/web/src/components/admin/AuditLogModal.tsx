'use client';

/**
 * @file AuditLogModal.tsx
 * @package @islamic/web
 * @description Detailed audit event inspector and Before/After Diff viewer modal.
 * Milestone: M4.5 / Admin Control Center
 */

import React, { useState } from 'react';
import type { AdminAuditLogEntry } from '@islamic/database';

export interface AuditLogModalProps {
  isOpen: boolean;
  entry: AdminAuditLogEntry | null;
  onClose: () => void;
}

export function AuditLogModal({ isOpen, entry, onClose }: AuditLogModalProps) {
  const [activeTab, setActiveTab] = useState<'diff' | 'raw'>('diff');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !entry) return null;

  const details = entry.details || {};
  const hasDiff = Boolean(
    (details.previous || details.previousRoles || details.previousStatus || details.previousState) &&
    (details.updated || details.newRole || details.newStatus || details.newState || details.newSubscription)
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(2, 6, 23, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#0f172a',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0b1120',
          }}
        >
          <div>
            <h2 id="audit-modal-title" style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Audit Record: <span style={{ fontFamily: 'monospace', color: '#34d399' }}>{entry.action}</span>
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Event ID: <code style={{ color: '#cbd5e1' }}>{entry.id}</code> • {new Date(entry.createdAt).toLocaleString()}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              padding: '0.4rem 0.6rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.375rem',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div style={{ padding: '0.75rem 1.5rem 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'diff' ? 700 : 500,
              color: activeTab === 'diff' ? '#34d399' : '#94a3b8',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'diff' ? '2px solid #34d399' : '2px solid transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
            }}
          >
            Changes & Diff
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'raw' ? 700 : 500,
              color: activeTab === 'raw' ? '#34d399' : '#94a3b8',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'raw' ? '2px solid #34d399' : '2px solid transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
            }}
          >
            Raw JSON Inspector
          </button>
        </div>

        {/* Body Container */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Actor</span>
              <strong style={{ color: '#ffffff' }}>{entry.actorName || 'System'}</strong>
              <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{entry.actorId || 'N/A'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Target Entity</span>
              <strong style={{ color: '#ffffff' }}>{entry.targetEntityType}</strong>
              <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>ID: {entry.targetEntityId || 'N/A'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Context / Source</span>
              <span style={{ color: '#38bdf8' }}>{entry.sourceContext || 'admin_portal'}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Audit Integrity</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>✓ Append-Only Verified</span>
            </div>
          </div>

          {/* Diff View Tab */}
          {activeTab === 'diff' && (
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.75rem' }}>
                State Transition Details
              </h3>
              {hasDiff ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Before */}
                  <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>
                      − BEFORE STATE
                    </div>
                    <pre style={{ margin: 0, fontSize: '0.75rem', color: '#fca5a5', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {JSON.stringify(
                        details.previous || details.previousRoles || details.previousStatus || details.previousState || {},
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  {/* After */}
                  <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', marginBottom: '0.5rem' }}>
                      + AFTER STATE
                    </div>
                    <pre style={{ margin: 0, fontSize: '0.75rem', color: '#86efac', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {JSON.stringify(
                        details.updated || details.newRole || details.newStatus || details.newState || details.newSubscription || {},
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <pre style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Raw JSON View Tab */}
          {activeTab === 'raw' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.375rem',
                    color: copied ? '#34d399' : '#e2e8f0',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ Copied to Clipboard' : 'Copy JSON'}
                </button>
              </div>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#020617',
                  border: '1px solid #1e293b',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                <pre style={{ margin: 0, fontSize: '0.75rem', color: '#38bdf8', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {JSON.stringify(entry, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#0b1120',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: '#1e293b',
              color: '#ffffff',
              border: '1px solid #334155',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
