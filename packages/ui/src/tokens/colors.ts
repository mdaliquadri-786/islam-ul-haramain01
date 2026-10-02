/**
 * @file colors.ts
 * @package @islamic/ui
 * @description Core color tokens for Islamic platform themes.
 */

export const colors = {
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    700: '#047857',
    900: '#064e3b',
    950: '#022c22',
  },
  gold: {
    50: '#fffbeb',
    100: '#fef3c7',
    400: '#fbbf24',
    600: '#d97706',
    800: '#92400e',
  },
  parchment: {
    light: '#faf8f5',
    sepia: '#f4ecd8',
    dark: '#1c1b18',
  },
} as const;

export type ColorTokens = typeof colors;
