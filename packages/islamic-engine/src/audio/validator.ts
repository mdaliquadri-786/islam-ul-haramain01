/**
 * @file validator.ts
 * @package @islamic/islamic-engine
 * @description Validation, timestamp synchronization, and utility functions for Audio Streaming.
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

import {
  AyahTimingSegment,
  CreateAudioReciterInput,
  CreateAudioTrackInput,
  RecitationStyle,
  AudioRedistributionStatus
} from './types.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const ALLOWED_STYLES: RecitationStyle[] = ['murattal', 'mujawwad', 'muallim'];
const ALLOWED_STATUSES: AudioRedistributionStatus[] = [
  'verified_permissible',
  'unverified_pending',
  'restricted_takedown'
];

/**
 * Validates reciter creation / registration input.
 */
export function validateAudioReciterInput(
  input: CreateAudioReciterInput
): ValidationResult {
  const errors: string[] = [];

  if (!input.id || typeof input.id !== 'string' || input.id.trim().length === 0) {
    errors.push('Reciter ID is required and must be a non-empty string.');
  } else if (!/^[a-z0-9-]+$/.test(input.id.trim())) {
    errors.push('Reciter ID must contain only lowercase alphanumeric characters and hyphens.');
  }

  if (!input.nameArabic || typeof input.nameArabic !== 'string' || input.nameArabic.trim().length === 0) {
    errors.push('Arabic name is required.');
  }

  if (!input.nameEnglish || typeof input.nameEnglish !== 'string' || input.nameEnglish.trim().length === 0) {
    errors.push('English name is required.');
  }

  if (!input.nameUrdu || typeof input.nameUrdu !== 'string' || input.nameUrdu.trim().length === 0) {
    errors.push('Urdu name is required.');
  }

  if (input.style && !ALLOWED_STYLES.includes(input.style)) {
    errors.push(`Invalid recitation style. Allowed values: ${ALLOWED_STYLES.join(', ')}.`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates audio track creation and synchronization segments.
 */
export function validateAudioTrackInput(
  input: CreateAudioTrackInput
): ValidationResult {
  const errors: string[] = [];

  if (!input.reciterId || typeof input.reciterId !== 'string' || input.reciterId.trim().length === 0) {
    errors.push('Reciter ID is required.');
  }

  if (!input.surahId || typeof input.surahId !== 'number' || input.surahId < 1 || input.surahId > 114) {
    errors.push('Surah ID must be an integer between 1 and 114.');
  }

  if (!input.audioUrl || typeof input.audioUrl !== 'string' || input.audioUrl.trim().length === 0) {
    errors.push('Audio URL is required.');
  } else {
    try {
      new URL(input.audioUrl);
    } catch {
      errors.push('Audio URL must be a valid URL.');
    }
  }

  if (typeof input.durationSeconds !== 'number' || input.durationSeconds <= 0) {
    errors.push('Duration seconds must be a positive number.');
  }

  if (typeof input.fileSizeBytes !== 'number' || input.fileSizeBytes <= 0) {
    errors.push('File size bytes must be a positive number.');
  }

  if (!input.sourceArchive || typeof input.sourceArchive !== 'string' || input.sourceArchive.trim().length === 0) {
    errors.push('Source archive information is required.');
  }

  if (!input.attributionRequirement || typeof input.attributionRequirement !== 'string' || input.attributionRequirement.trim().length === 0) {
    errors.push('Attribution requirement is required.');
  }

  if (input.redistributionStatus && !ALLOWED_STATUSES.includes(input.redistributionStatus)) {
    errors.push(`Invalid redistribution status. Allowed values: ${ALLOWED_STATUSES.join(', ')}.`);
  }

  // Validate timing segments if provided
  if (input.timingSegments && Array.isArray(input.timingSegments)) {
    let lastEndMs = 0;
    for (let i = 0; i < input.timingSegments.length; i++) {
      const seg = input.timingSegments[i];
      if (typeof seg.ayahNumber !== 'number' || seg.ayahNumber < 1) {
        errors.push(`Timing segment at index ${i} has invalid ayahNumber: ${seg.ayahNumber}.`);
      }
      if (typeof seg.startMs !== 'number' || seg.startMs < 0) {
        errors.push(`Timing segment at index ${i} has invalid startMs: ${seg.startMs}.`);
      }
      if (typeof seg.endMs !== 'number' || seg.endMs <= seg.startMs) {
        errors.push(`Timing segment at index ${i} endMs must be greater than startMs.`);
      }
      if (seg.startMs < lastEndMs) {
        errors.push(`Timing segment at index ${i} overlaps with preceding segment.`);
      }
      lastEndMs = seg.endMs;
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Finds the currently active Ayah number for a given audio timestamp in milliseconds.
 * Returns null if no segment matches the timestamp.
 */
export function findActiveAyahForTimestamp(
  timingSegments: AyahTimingSegment[],
  currentMs: number
): number | null {
  if (!timingSegments || timingSegments.length === 0 || currentMs < 0) {
    return null;
  }

  for (const segment of timingSegments) {
    if (currentMs >= segment.startMs && currentMs < segment.endMs) {
      return segment.ayahNumber;
    }
  }

  // If past the last segment, return the last ayah
  const lastSegment = timingSegments[timingSegments.length - 1];
  if (currentMs >= lastSegment.endMs) {
    return lastSegment.ayahNumber;
  }

  return null;
}

/**
 * Formats milliseconds into human-readable MM:SS or HH:MM:SS string.
 */
export function formatPlaybackTime(milliseconds: number): string {
  if (isNaN(milliseconds) || milliseconds < 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculates track playback progress percentage (0 to 100).
 */
export function calculateTrackProgress(
  currentMs: number,
  totalDurationMs: number
): number {
  if (!totalDurationMs || totalDurationMs <= 0 || !currentMs || currentMs <= 0) {
    return 0;
  }
  const progress = (currentMs / totalDurationMs) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 100) / 100));
}
