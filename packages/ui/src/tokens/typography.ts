/**
 * @file typography.ts
 * @package @islamic/ui
 * @description Typography tokens for Arabic, Urdu, and Latin scripts.
 */

export const fontFamilies = {
  quranArabic: ['KFGQPC Uthman Taha Naskh', 'Amiri Quran', 'Scheherazade New', 'serif'],
  urdu: ['Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'serif'],
  arabicUI: ['IBM Plex Sans Arabic', 'Noto Naskh Arabic', 'sans-serif'],
  latinUI: ['Inter', 'system-ui', 'sans-serif'],
} as const;

export const fontSizes = {
  ayahSmall: '1.5rem',      // 24px
  ayahMedium: '1.875rem',   // 30px
  ayahLarge: '2.25rem',     // 36px
  ayahXLarge: '3rem',       // 48px
} as const;
