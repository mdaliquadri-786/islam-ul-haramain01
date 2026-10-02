'use client';

/**
 * @file Toast.tsx
 * @package @islamic/web
 * @description Apple-inspired floating micro-interaction toast notification system.
 *              Provides tactile feedback for user actions such as bookmarks, copying, and preferences.
 * Milestone: M3.4 / Web UI Renaissance
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type ToastType = 'success' | 'info' | 'error';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Toast Container */}
      <aside
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          top: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="animate-fade-in"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.55rem 1.15rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(16, 185, 129, 0.25)',
              border: toast.type === 'error'
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : toast.type === 'info'
                ? '1px solid rgba(59, 130, 246, 0.4)'
                : '1px solid rgba(16, 185, 129, 0.4)',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Status Indicator Icon */}
            {toast.type === 'error' ? (
              <span style={{ color: '#f87171' }}>✕</span>
            ) : toast.type === 'info' ? (
              <span style={{ color: '#60a5fa' }}>ℹ</span>
            ) : (
              <span style={{ color: '#34d399' }}>✓</span>
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}
