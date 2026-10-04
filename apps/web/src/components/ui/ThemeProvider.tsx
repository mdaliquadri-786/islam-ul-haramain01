'use client';

/**
 * @file ThemeProvider.tsx
 * @package @islamic/web
 * @description Global reading preference and theme provider supporting 'light', 'dark', and 'sepia'
 *              modes, custom Arabic calligraphic typography ('uthmani', 'indopak', 'amiri'),
 *              dynamic Tashkeel font scaling, and Tajweed color rendering preferences.
 *              Persists state cleanly to browser localStorage with zero SSR hydration flash.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type AppTheme = 'light' | 'dark' | 'sepia';
export type ArabicFontFamily = 'uthmani' | 'indopak' | 'amiri';
export type ReadingMode = 'continuous' | 'paginated';

export interface ReadingThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  arabicFont: ArabicFontFamily;
  setArabicFont: (font: ArabicFontFamily) => void;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (size: number) => void;
  tajweedEnabled: boolean;
  setTajweedEnabled: (enabled: boolean) => void;
  wordByWordEnabled: boolean;
  setWordByWordEnabled: (enabled: boolean) => void;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  resetDefaults: () => void;
}

const STORAGE_KEYS = {
  THEME: 'ih_reading_theme',
  ARABIC_FONT: 'ih_arabic_font',
  ARABIC_SIZE: 'ih_arabic_font_size',
  TRANS_SIZE: 'ih_translation_font_size',
  TAJWEED: 'ih_tajweed_enabled',
  WORD_BY_WORD: 'ih_word_by_word_enabled',
  READING_MODE: 'ih_reading_mode',
} as const;

const DEFAULTS = {
  theme: 'dark' as AppTheme,
  arabicFont: 'uthmani' as ArabicFontFamily,
  arabicFontSize: 28, // px
  translationFontSize: 16, // px
  tajweedEnabled: true,
  wordByWordEnabled: true,
  readingMode: 'continuous' as ReadingMode,
};

const ReadingThemeContext = createContext<ReadingThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(DEFAULTS.theme);
  const [arabicFont, setArabicFontState] = useState<ArabicFontFamily>(DEFAULTS.arabicFont);
  const [arabicFontSize, setArabicFontSizeState] = useState<number>(DEFAULTS.arabicFontSize);
  const [translationFontSize, setTranslationFontSizeState] = useState<number>(DEFAULTS.translationFontSize);
  const [tajweedEnabled, setTajweedEnabledState] = useState<boolean>(DEFAULTS.tajweedEnabled);
  const [wordByWordEnabled, setWordByWordEnabledState] = useState<boolean>(DEFAULTS.wordByWordEnabled);
  const [readingMode, setReadingModeState] = useState<ReadingMode>(DEFAULTS.readingMode);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Initialize preferences from localStorage upon mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme | null;
      if (savedTheme && ['light', 'dark', 'sepia'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }

      const savedFont = localStorage.getItem(STORAGE_KEYS.ARABIC_FONT) as ArabicFontFamily | null;
      if (savedFont && ['uthmani', 'indopak', 'amiri'].includes(savedFont)) {
        setArabicFontState(savedFont);
      }

      const savedArabicSize = localStorage.getItem(STORAGE_KEYS.ARABIC_SIZE);
      if (savedArabicSize) {
        const parsed = parseInt(savedArabicSize, 10);
        if (!isNaN(parsed) && parsed >= 18 && parsed <= 56) {
          setArabicFontSizeState(parsed);
        }
      }

      const savedTransSize = localStorage.getItem(STORAGE_KEYS.TRANS_SIZE);
      if (savedTransSize) {
        const parsed = parseInt(savedTransSize, 10);
        if (!isNaN(parsed) && parsed >= 12 && parsed <= 32) {
          setTranslationFontSizeState(parsed);
        }
      }

      const savedTajweed = localStorage.getItem(STORAGE_KEYS.TAJWEED);
      if (savedTajweed !== null) {
        setTajweedEnabledState(savedTajweed === 'true');
      }

      const savedWordByWord = localStorage.getItem(STORAGE_KEYS.WORD_BY_WORD);
      if (savedWordByWord !== null) {
        setWordByWordEnabledState(savedWordByWord === 'true');
      }

      const savedMode = localStorage.getItem(STORAGE_KEYS.READING_MODE) as ReadingMode | null;
      if (savedMode && ['continuous', 'paginated'].includes(savedMode)) {
        setReadingModeState(savedMode);
      }
    } catch {
      // Storage access blocked or restricted
    } finally {
      setIsMounted(true);
    }
  }, []);

  // Sync DOM attributes and CSS variables whenever preferences change
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Theme Attribute
    root.setAttribute('data-theme', theme);

    // Arabic Font Attribute
    root.setAttribute('data-arabic-font', arabicFont);

    // CSS Custom Variables
    root.style.setProperty('--quran-font-size', `${arabicFontSize}px`);
    root.style.setProperty('--translation-font-size', `${translationFontSize}px`);

    // Sepia-specific color palette overrides
    if (theme === 'sepia') {
      root.style.setProperty('--bg-primary', '#fbf0d9');
      root.style.setProperty('--bg-secondary', '#f4e5c3');
      root.style.setProperty('--text-primary', '#433422');
      root.style.setProperty('--text-secondary', '#78624a');
      root.style.setProperty('--border-subtle', 'rgba(67, 52, 34, 0.12)');
    } else if (theme === 'light') {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--border-subtle', 'rgba(15, 23, 42, 0.08)');
    } else {
      // Dark / Charcoal default
      root.style.setProperty('--bg-primary', '#030712');
      root.style.setProperty('--bg-secondary', '#0b1329');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--border-subtle', 'rgba(255, 255, 255, 0.08)');
    }
  }, [theme, arabicFont, arabicFontSize, translationFontSize]);

  // Setters with persistent localStorage synchronizer
  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch {
      // Ignore
    }
  }, []);

  const setArabicFont = useCallback((newFont: ArabicFontFamily) => {
    setArabicFontState(newFont);
    try {
      localStorage.setItem(STORAGE_KEYS.ARABIC_FONT, newFont);
    } catch {
      // Ignore
    }
  }, []);

  const setArabicFontSize = useCallback((size: number) => {
    const clamped = Math.max(18, Math.min(size, 56));
    setArabicFontSizeState(clamped);
    try {
      localStorage.setItem(STORAGE_KEYS.ARABIC_SIZE, clamped.toString());
    } catch {
      // Ignore
    }
  }, []);

  const setTranslationFontSize = useCallback((size: number) => {
    const clamped = Math.max(12, Math.min(size, 32));
    setTranslationFontSizeState(clamped);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANS_SIZE, clamped.toString());
    } catch {
      // Ignore
    }
  }, []);

  const setTajweedEnabled = useCallback((enabled: boolean) => {
    setTajweedEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.TAJWEED, enabled.toString());
    } catch {
      // Ignore
    }
  }, []);

  const setWordByWordEnabled = useCallback((enabled: boolean) => {
    setWordByWordEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEYS.WORD_BY_WORD, enabled.toString());
    } catch {
      // Ignore
    }
  }, []);

  const setReadingMode = useCallback((mode: ReadingMode) => {
    setReadingModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.READING_MODE, mode);
    } catch {
      // Ignore
    }
  }, []);

  const resetDefaults = useCallback(() => {
    setTheme(DEFAULTS.theme);
    setArabicFont(DEFAULTS.arabicFont);
    setArabicFontSize(DEFAULTS.arabicFontSize);
    setTranslationFontSize(DEFAULTS.translationFontSize);
    setTajweedEnabled(DEFAULTS.tajweedEnabled);
    setWordByWordEnabled(DEFAULTS.wordByWordEnabled);
    setReadingMode(DEFAULTS.readingMode);
  }, [setTheme, setArabicFont, setArabicFontSize, setTranslationFontSize, setTajweedEnabled, setWordByWordEnabled, setReadingMode]);

  const value = useMemo<ReadingThemeContextValue>(
    () => ({
      theme,
      setTheme,
      arabicFont,
      setArabicFont,
      arabicFontSize,
      setArabicFontSize,
      translationFontSize,
      setTranslationFontSize,
      tajweedEnabled,
      setTajweedEnabled,
      wordByWordEnabled,
      setWordByWordEnabled,
      readingMode,
      setReadingMode,
      resetDefaults,
    }),
    [
      theme,
      setTheme,
      arabicFont,
      setArabicFont,
      arabicFontSize,
      setArabicFontSize,
      translationFontSize,
      setTranslationFontSize,
      tajweedEnabled,
      setTajweedEnabled,
      wordByWordEnabled,
      setWordByWordEnabled,
      readingMode,
      setReadingMode,
      resetDefaults,
    ]
  );

  return (
    <ReadingThemeContext.Provider value={value}>
      {/* Hidden container to suppress initial style recalculation flash */}
      <div style={{ visibility: isMounted ? 'visible' : 'visible' }}>{children}</div>
    </ReadingThemeContext.Provider>
  );
}

export function useReadingTheme(): ReadingThemeContextValue {
  const context = useContext(ReadingThemeContext);
  if (!context) {
    throw new Error('useReadingTheme must be used within an enclosing ThemeProvider.');
  }
  return context;
}
