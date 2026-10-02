/**
 * @file types.ts
 * @package @islamic/islamic-engine
 * @description Domain types and interfaces for the Audio Streaming & Verified Reciter Catalog.
 * Milestone: M4.1 — Audio Streaming & Verified Reciter Catalog
 */

export type RecitationStyle = 'murattal' | 'mujawwad' | 'muallim';

export type AudioRedistributionStatus =
  | 'verified_permissible'
  | 'unverified_pending'
  | 'restricted_takedown';

/**
 * Ayah-level timestamp segment for synchronized recitation playback.
 */
export interface AyahTimingSegment {
  ayahNumber: number;
  startMs: number;
  endMs: number;
}

/**
 * Metadata representation of a verified Quran reciter.
 */
export interface AudioReciter {
  id: string; // e.g. 'alafasy', 'al-husary', 'abdul-basit'
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  style: RecitationStyle;
  bioEnglish?: string;
  bioArabic?: string;
  bioUrdu?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Metadata and streaming track descriptor for a specific Surah by a reciter.
 */
export interface AudioSurahTrack {
  id: string;
  reciterId: string;
  surahId: number;
  audioUrl: string;
  format: string; // 'mp3' | 'aac' | 'ogg'
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
  timingSegments: AyahTimingSegment[];
  sourceArchive: string;
  copyrightHolder?: string;
  licenseType: string;
  allowedUsage: string;
  attributionRequirement: string;
  redistributionStatus: AudioRedistributionStatus;
  importDate: string;
  takedownContact: string;
  createdAt: string;
}

export interface CreateAudioReciterInput {
  id: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  style?: RecitationStyle;
  bioEnglish?: string;
  bioArabic?: string;
  bioUrdu?: string;
  isActive?: boolean;
}

export interface CreateAudioTrackInput {
  reciterId: string;
  surahId: number;
  audioUrl: string;
  format?: string;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType?: string;
  timingSegments?: AyahTimingSegment[];
  sourceArchive: string;
  copyrightHolder?: string;
  licenseType?: string;
  allowedUsage?: string;
  attributionRequirement: string;
  redistributionStatus?: AudioRedistributionStatus;
  importDate?: string;
  takedownContact?: string;
}

export interface AudioProvenanceVerificationResult {
  verified: boolean;
  trackId: string;
  reciterId: string;
  surahId: number;
  legalStatus: AudioRedistributionStatus;
  attributionText: string;
  licenseType: string;
  takedownContact: string;
}
