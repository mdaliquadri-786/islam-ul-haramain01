'use client';

/**
 * @file AdminCommandPalette.tsx
 * @package @islamic/web
 * @description Global Command Palette (Cmd+K) for rapid administrative search and action execution.
 * Milestone: M4.5 / Admin Control Center
 */

import React, { useState, useEffect, useRef } from 'react';

export interface CommandItem {
  id: string;
  category: string;
  title: string;
  description: string;
  shortcut?: string;
  onSelect: () => void;
}

export interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
}

export function AdminCommandPalette({ isOpen, onClose, commands }: AdminCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Listen for keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filteredCommands.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].onSelect();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, commands, query]);

  if (!isOpen) return null;

  const filteredCommands = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin Command Palette"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '5rem 1rem 1rem',
      }}
    >
      <div
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#0f172a',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 20px rgba(16, 185, 129, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: '#0b1120',
          }}
        >
          <span style={{ color: '#10b981', fontSize: '1.1rem' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, section, or action (e.g. 'users', 'maintenance', 'audit')..."
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          />
          <kbd
            style={{
              fontSize: '0.7rem',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              padding: '0.15rem 0.4rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Command Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '0.5rem' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
              No administrative commands match &quot;{query}&quot;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    cmd.onSelect();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '0.5rem',
                    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '0.1rem 0.35rem',
                          borderRadius: '0.25rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#94a3b8',
                        }}
                      >
                        {cmd.category}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: isSelected ? '#34d399' : '#ffffff' }}>
                        {cmd.title}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', paddingLeft: '0.2rem' }}>
                      {cmd.description}
                    </span>
                  </div>

                  {cmd.shortcut && (
                    <kbd
                      style={{
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.25rem',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#94a3b8',
                      }}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div
          style={{
            padding: '0.6rem 1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0b1120',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.725rem',
            color: '#64748b',
          }}
        >
          <div>
            Use <strong style={{ color: '#94a3b8' }}>↑↓</strong> to navigate, <strong style={{ color: '#94a3b8' }}>Enter</strong> to select
          </div>
          <div>ISLAM UL HARAMAIN Operational Shell</div>
        </div>
      </div>
    </div>
  );
}
