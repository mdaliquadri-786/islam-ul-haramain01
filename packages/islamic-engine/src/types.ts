/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Boundary interface definitions for the Islamic computational engine.
 */

export * from './prayer/types';

export interface HijriDateResult {
  year: number;
  month: number;
  day: number;
  monthNameArabic: string;
  monthNameEnglish: string;
  isAdjusted: boolean;
}
