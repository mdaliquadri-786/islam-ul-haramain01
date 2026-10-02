'use client';

/**
 * @file ConfirmationModal.tsx
 * @package @islamic/web
 * @description Universal high-risk action confirmation modal with typed confirmation guards,
 *              reason input capture, and consequence explanations.
 * Milestone: M4.5 / Admin Control Center
 */

import React, { useState } from 'react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  resourceName?: string;
  severity?: 'warning' | 'danger';
  confirmKeyword?: string;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  resourceName,
  severity = 'warning',
  confirmKeyword,
  requireReason = false,
  reasonPlaceholder = 'Please specify the operational justification for this action...',
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const [typedKeyword, setTypedKeyword] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const isDanger = severity === 'danger';
  const keywordValid = !confirmKeyword || typedKeyword.trim().toUpperCase() === confirmKeyword.toUpperCase();
  const reasonValid = !requireReason || reason.trim().length >= 5;
  const canSubmit = keywordValid && reasonValid && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm(reason.trim());
    setTypedKeyword('');
    setReason('');
  };

  const handleClose = () => {
    if (isLoading) return;
    setTypedKeyword('');
    setReason('');
    onCancel();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
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
          maxWidth: '520px',
          backgroundColor: '#0f172a',
          borderRadius: '1rem',
          border: isDanger ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          color: '#ffffff',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.5rem',
              backgroundColor: isDanger ? '#7f1d1d' : '#78350f',
              border: isDanger ? '1px solid #ef4444' : '1px solid #f59e0b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            {isDanger ? '🚨' : '⚠️'}
          </div>
          <div>
            <h2 id="confirm-modal-title" style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {title}
            </h2>
            <div style={{ fontSize: '0.75rem', color: isDanger ? '#fca5a5' : '#fde68a', fontWeight: 600 }}>
              {isDanger ? 'High-Risk Destructive Operation' : 'Privileged Confirmation Required'}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.55 }}>
            {description}
          </p>

          {resourceName && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.8rem',
                color: '#94a3b8',
              }}
            >
              <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Target Resource:</span>{' '}
              <code style={{ color: '#34d399', fontWeight: 700 }}>{resourceName}</code>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.35rem' }}>
              Operational Justification {requireReason && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={2}
              required={requireReason}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                fontSize: '0.85rem',
                backgroundColor: '#020617',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                color: '#ffffff',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* Keyword Confirmation if required */}
          {confirmKeyword && (
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#fca5a5', marginBottom: '0.35rem' }}>
                Type <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{confirmKeyword}</strong> to confirm:
              </label>
              <input
                type="text"
                value={typedKeyword}
                onChange={(e) => setTypedKeyword(e.target.value)}
                placeholder={confirmKeyword}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#020617',
                  border: keywordValid && typedKeyword.length > 0 ? '1px solid #10b981' : '1px solid #64748b',
                  borderRadius: '0.375rem',
                  color: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#94a3b8',
                backgroundColor: 'transparent',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              {cancelLabel}
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: isDanger ? '#dc2626' : '#d97706',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                opacity: canSubmit ? 1 : 0.45,
                boxShadow: canSubmit ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none',
              }}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
