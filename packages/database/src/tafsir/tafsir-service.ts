/**
 * @file tafsir-service.ts
 * @package @islamic/database
 * @description Service layer for Classical Tafsir Comparative Viewer.
 * Provides dual-mode (Supabase + In-Memory) support with full provenance/licensing
 * governance, publication gating, and RLS-consistent access control.
 * Milestone: M4.2 — Classical Tafsir Comparative Viewer
 *
 * CONTENT SAFETY:
 * - Classical Arabic tafsir works seeded here are documented Public Domain
 *   (CONTENT_LICENSE_MATRIX.md, line 55 — verified_permissible).
 * - textContent for each entry is set to null with contentAvailability='metadata_only'
 *   because full classical text ingestion requires a separate verified digital edition.
 *   This is the correct provenance-safe default: NEVER fabricate or synthesize text.
 * - The 'verified' flag on a work means legal license clearance only —
 *   NOT theological endorsement by the platform.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  TafsirWork,
  TafsirEntry,
  TafsirComparison,
  TafsirProvenanceResult,
  CreateTafsirWorkInput,
  CreateTafsirEntryInput,
  validateTafsirWorkInput,
  validateTafsirEntryInput,
  isTafsirEntryPublic,
  isTafsirWorkPublic,
  buildTafsirProvenanceResult
} from '@islamic/islamic-engine';
import type { ActorContext } from '../articles/article-service.js';

// ============================================================================
// Canonical Tafsir Works — Public Domain / verified_permissible
// (Source: CONTENT_LICENSE_MATRIX.md line 55)
// ============================================================================

export const CANONICAL_TAFSIR_WORKS: TafsirWork[] = [
  {
    id: 'ibn-kathir',
    slug: 'ibn-kathir',
    titleArabic: 'تفسير القرآن العظيم',
    titleEnglish: "Tafsir al-Quran al-'Adhim (Tafsir Ibn Kathir)",
    titleUrdu: 'تفسیر ابن کثیر',
    authorNameArabic: 'أبو الفداء إسماعيل بن عمر بن كثير القرشي الدمشقي',
    authorNameEnglish: 'Abu al-Fida Ismail ibn Kathir al-Dimashqi',
    authorNameUrdu: 'ابو الفداء اسماعیل ابن کثیر دمشقی',
    authorDeathYearHijri: 774,
    authorDeathYearCe: 1373,
    descriptionEnglish:
      "One of the most widely referenced classical Sunni tafsir. Authored by Ibn Kathir (d. 774 AH / 1373 CE), this work explains Quran by Quran, then by authenticated Hadith, then by companion narrations, then by scholarly analysis. The Arabic text is in the public domain; specific modern edited editions and translations may have separate rights.",
    descriptionArabic:
      'من أبرز كتب التفسير في التراث الإسلامي السني، ألّفه الإمام ابن كثير (ت 774 هـ). يُفسَّر فيه القرآن بالقرآن ثم بالحديث النبوي الصحيح ثم بأقوال الصحابة، ويعتمد المنهج الأثري في التفسير.',
    descriptionUrdu:
      'امام ابن کثیر (م ۷۷۴ ھ) کی مشہور تفسیر جو قرآن کو قرآن، پھر صحیح حدیث، پھر آثار صحابہ سے سمجھاتی ہے۔ سنی علماء میں سب سے زیادہ مستند تفسیروں میں شمار ہوتی ہے۔',
    methodologyNotes:
      'Athari/Salafi exegetical methodology: Quran by Quran → Sunnah → Companions → Tabi\'un. This factual description does not constitute endorsement of every position by the platform.',
    licenseType: 'Public Domain (Classical Islamic Heritage, 774 AH / 1373 CE)',
    licenseStatus: 'verified_permissible',
    sourceUrl: 'https://islamweb.net/ar/library/index.php?page=bookcontents&ID=60',
    provenanceNotes:
      'Classical Arabic original: Public domain worldwide — author died 1373 CE (over 650+ years ago). ' +
      'Specific modern edited editions (e.g. Dār al-Ṭayyiba, Dār Ibn Ḥazm) may hold editorial copyrights. ' +
      'Translations (English, Urdu) tracked separately per CONTENT_LICENSE_MATRIX.md.',
    attributionRequirement:
      "Tafsir al-Quran al-'Adhim (Tafsir Ibn Kathir) by Imam Ismail ibn Kathir al-Dimashqi (d. 774 AH / 1373 CE). Classical Public Domain text.",
    isActive: true,
    reviewStatus: 'approved',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z'
  },
  {
    id: 'al-sadi',
    slug: 'al-sadi',
    titleArabic: 'تيسير الكريم الرحمن في تفسير كلام المنان',
    titleEnglish: "Taysir al-Karim al-Rahman fi Tafsir Kalam al-Mannan (Tafsir Al-Sa'di)",
    titleUrdu: "تفسیر السعدی — تیسیر الکریم الرحمان",
    authorNameArabic: 'عبد الرحمن بن ناصر السعدي',
    authorNameEnglish: "Abd al-Rahman ibn Nasir al-Sa'di",
    authorNameUrdu: 'عبد الرحمن بن ناصر السعدی',
    authorDeathYearHijri: 1376,
    authorDeathYearCe: 1956,
    descriptionEnglish:
      "A widely-read contemporary classical tafsir by Shaykh Al-Sa'di (d. 1376 AH / 1956 CE), known for its clear, accessible style suitable for all readers. Emphasizes the meanings, wisdom, and benefits (fawa'id) of each Ayah. The original Arabic text is in the public domain; translations require separate licensing verification.",
    descriptionArabic:
      'تفسير معاصر يتميز بأسلوبه الواضح والميسّر، ألّفه الشيخ عبد الرحمن السعدي (ت 1376 هـ). يركز على المعاني والأحكام والفوائد من الآيات القرآنية بأسلوب سهل مناسب للعموم.',
    descriptionUrdu:
      "شیخ عبد الرحمن السعدی (م ۱۳۷۶ھ) کی معروف تفسیر جو اپنے سادہ اور آسان اسلوب کے لیے جانی جاتی ہے۔ ہر آیت کے معانی، احکام اور فوائد کو واضح انداز میں بیان کرتی ہے۔",
    methodologyNotes:
      "Contemporary Hanbali-aligned tafsir emphasizing clear meanings and practical benefits (fawa'id) of Quranic verses. This factual description does not constitute endorsement of every position by the platform.",
    licenseType: 'Public Domain (1956 CE / 1376 AH — public domain in most jurisdictions)',
    licenseStatus: 'verified_permissible',
    sourceUrl: 'https://islamweb.net/ar/library/index.php?page=bookcontents&ID=50',
    provenanceNotes:
      'Original Arabic: Author died 1956 CE (1376 AH). Under Berne Convention (author + 70 years = 2026 CE), ' +
      'the work transitions to public domain in most jurisdictions by 2026. ' +
      'Saudi Arabia applies 50-year term (1956 + 50 = 2006 CE) — public domain there as of 2006. ' +
      'Translations tracked separately per CONTENT_LICENSE_MATRIX.md. Platform uses metadata-only ' +
      'pending formal edition clearance for specific digital edition.',
    attributionRequirement:
      "Taysir al-Karim al-Rahman (Tafsir Al-Sa'di) by Shaykh Abd al-Rahman ibn Nasir al-Sa'di (d. 1376 AH / 1956 CE).",
    isActive: true,
    reviewStatus: 'approved',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z'
  }
];

export interface TafsirAuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  reason?: string;
  createdAt: string;
}

export class TafsirService {
  private supabaseClient: SupabaseClient | null = null;
  private worksMap = new Map<string, TafsirWork>();
  private entriesMap = new Map<string, TafsirEntry>(); // key: `{workId}:{surahId}:{ayahNumber}:{lang}`
  private auditLogs: TafsirAuditLogEntry[] = [];

  constructor(options?: { supabaseClient?: SupabaseClient }) {
    this.supabaseClient = options?.supabaseClient || null;
    this.initializeDefaultData();
  }

  private initializeDefaultData(): void {
    for (const work of CANONICAL_TAFSIR_WORKS) {
      this.worksMap.set(work.id, { ...work });
    }
    // Entries start empty (metadata_only, awaiting verified edition ingestion).
    // This is the correct provenance-safe default — no text is fabricated.
  }

  // ==========================================================================
  // Work Queries
  // ==========================================================================

  public async listWorks(options?: { activeOnly?: boolean }): Promise<TafsirWork[]> {
    const activeOnly = options?.activeOnly !== false;

    if (this.supabaseClient) {
      let query = this.supabaseClient
        .from('tafsir_works')
        .select('*')
        .eq('license_status', 'verified_permissible')
        .eq('review_status', 'approved');
      if (activeOnly) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query.order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(this.mapWorkRow);
      }
    }

    const list = Array.from(this.worksMap.values()).filter(isTafsirWorkPublic);
    return activeOnly ? list.filter((w) => w.isActive) : list;
  }

  public async getWork(workId: string): Promise<TafsirWork | null> {
    if (!workId) return null;

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('tafsir_works')
        .select('*')
        .eq('id', workId)
        .eq('license_status', 'verified_permissible')
        .eq('review_status', 'approved')
        .maybeSingle();
      if (!error && data) return this.mapWorkRow(data);
    }

    const work = this.worksMap.get(workId);
    return work && isTafsirWorkPublic(work) ? work : null;
  }

  // ==========================================================================
  // Entry Queries
  // ==========================================================================

  public async getEntriesForAyah(
    surahId: number,
    ayahNumber: number,
    options?: { languageCode?: 'ar' | 'en' | 'ur'; workIds?: string[] }
  ): Promise<TafsirEntry[]> {
    if (surahId < 1 || surahId > 114 || ayahNumber < 1) return [];
    const lang = options?.languageCode || 'ar';

    if (this.supabaseClient) {
      let query = this.supabaseClient
        .from('tafsir_entries')
        .select('*')
        .eq('surah_id', surahId)
        .eq('ayah_number', ayahNumber)
        .eq('language_code', lang)
        .eq('is_current', true)
        .eq('publication_status', 'published')
        .eq('license_status', 'verified_permissible');
      if (options?.workIds && options.workIds.length > 0) {
        query = query.in('work_id', options.workIds);
      }
      const { data, error } = await query;
      if (!error && data) return data.map(this.mapEntryRow);
    }

    const results: TafsirEntry[] = [];
    const works = options?.workIds || Array.from(this.worksMap.keys());
    for (const workId of works) {
      const key = `${workId}:${surahId}:${ayahNumber}:${lang}`;
      const entry = this.entriesMap.get(key);
      if (entry && isTafsirEntryPublic(entry)) {
        results.push(entry);
      }
    }
    return results;
  }

  public async getEntriesForSurah(
    workId: string,
    surahId: number,
    options?: { languageCode?: 'ar' | 'en' | 'ur' }
  ): Promise<TafsirEntry[]> {
    if (!workId || surahId < 1 || surahId > 114) return [];
    const lang = options?.languageCode || 'ar';

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('tafsir_entries')
        .select('*')
        .eq('work_id', workId)
        .eq('surah_id', surahId)
        .eq('language_code', lang)
        .eq('is_current', true)
        .eq('publication_status', 'published')
        .eq('license_status', 'verified_permissible')
        .order('ayah_number', { ascending: true });
      if (!error && data) return data.map(this.mapEntryRow);
    }

    const results: TafsirEntry[] = [];
    for (const [key, entry] of this.entriesMap.entries()) {
      if (
        key.startsWith(`${workId}:${surahId}:`) &&
        entry.languageCode === lang &&
        isTafsirEntryPublic(entry)
      ) {
        results.push(entry);
      }
    }
    return results.sort((a, b) => a.ayahNumber - b.ayahNumber);
  }

  public async getSingleEntry(
    workId: string,
    surahId: number,
    ayahNumber: number,
    languageCode: 'ar' | 'en' | 'ur' = 'ar'
  ): Promise<TafsirEntry | null> {
    if (!workId || surahId < 1 || surahId > 114 || ayahNumber < 1) return null;

    if (this.supabaseClient) {
      const { data, error } = await this.supabaseClient
        .from('tafsir_entries')
        .select('*')
        .eq('work_id', workId)
        .eq('surah_id', surahId)
        .eq('ayah_number', ayahNumber)
        .eq('language_code', languageCode)
        .eq('is_current', true)
        .eq('publication_status', 'published')
        .eq('license_status', 'verified_permissible')
        .maybeSingle();
      if (!error && data) return this.mapEntryRow(data);
    }

    const key = `${workId}:${surahId}:${ayahNumber}:${languageCode}`;
    const entry = this.entriesMap.get(key);
    return entry && isTafsirEntryPublic(entry) ? entry : null;
  }

  // ==========================================================================
  // Comparative Query
  // ==========================================================================

  public async compareSourcesForAyah(
    surahId: number,
    ayahNumber: number,
    workIds: string[],
    languageCode: 'ar' | 'en' | 'ur' = 'ar'
  ): Promise<TafsirComparison> {
    const works = await this.listWorks();
    const selectedWorks = works.filter((w) => workIds.includes(w.id));
    const entries = await this.getEntriesForAyah(surahId, ayahNumber, {
      languageCode,
      workIds
    });

    const entryMap = new Map(entries.map((e) => [e.workId, e]));

    return {
      surahId,
      ayahNumber,
      comparedWorkIds: workIds,
      entries: selectedWorks.map((work) => ({
        work,
        edition: undefined,
        entry: entryMap.get(work.id) || null
      }))
    };
  }

  // ==========================================================================
  // Provenance Verification
  // ==========================================================================

  public async verifyProvenance(
    workId: string,
    surahId: number,
    ayahNumber: number,
    languageCode: 'ar' | 'en' | 'ur' = 'ar'
  ): Promise<TafsirProvenanceResult | null> {
    const work = await this.getWork(workId);
    if (!work) return null;

    const entry = await this.getSingleEntry(workId, surahId, ayahNumber, languageCode);

    if (!entry) {
      // Return metadata-level provenance even when no entry exists
      return {
        workId: work.id,
        entryId: 'none',
        surahId,
        ayahNumber,
        licenseStatus: work.licenseStatus,
        licenseType: work.licenseType,
        contentAvailability: 'metadata_only',
        publicationStatus: 'draft',
        attributionText:
          work.attributionRequirement ||
          `Classical Tafsir: ${work.titleEnglish} by ${work.authorNameEnglish}.`,
        sourceReference: undefined,
        verifiedPermissible: false
      };
    }

    return buildTafsirProvenanceResult(work, entry);
  }

  // ==========================================================================
  // Administrative Operations
  // ==========================================================================

  public async registerWork(
    input: CreateTafsirWorkInput,
    actor?: ActorContext
  ): Promise<TafsirWork> {
    if (
      actor &&
      !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin')
    ) {
      throw new Error('Authorization Violation: Only platform administrators can register tafsir works.');
    }

    const validation = validateTafsirWorkInput(input);
    if (!validation.valid) {
      throw new Error(`Validation Error: ${validation.errors.join(' ')}`);
    }

    const work: TafsirWork = {
      id: input.id.trim().toLowerCase(),
      slug: input.slug.trim().toLowerCase(),
      titleArabic: input.titleArabic.trim(),
      titleEnglish: input.titleEnglish.trim(),
      titleUrdu: input.titleUrdu.trim(),
      authorNameArabic: input.authorNameArabic.trim(),
      authorNameEnglish: input.authorNameEnglish.trim(),
      authorNameUrdu: input.authorNameUrdu.trim(),
      authorDeathYearHijri: input.authorDeathYearHijri,
      authorDeathYearCe: input.authorDeathYearCe,
      descriptionEnglish: input.descriptionEnglish?.trim(),
      descriptionArabic: input.descriptionArabic?.trim(),
      descriptionUrdu: input.descriptionUrdu?.trim(),
      methodologyNotes: input.methodologyNotes?.trim(),
      licenseType: input.licenseType || 'Public Domain',
      licenseStatus: input.licenseStatus || 'unverified_pending',
      sourceUrl: input.sourceUrl,
      provenanceNotes: input.provenanceNotes,
      attributionRequirement: input.attributionRequirement,
      isActive: true,
      reviewStatus: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.worksMap.set(work.id, work);
    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      entityType: 'tafsir_works',
      entityId: work.id,
      action: 'create',
      performedBy: actor?.id || 'system',
      createdAt: new Date().toISOString()
    });

    return work;
  }

  public async registerEntry(
    input: CreateTafsirEntryInput,
    actor?: ActorContext
  ): Promise<TafsirEntry> {
    if (
      actor &&
      !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin' || r === 'scholar_reviewer')
    ) {
      throw new Error('Authorization Violation: Only authorized personnel can register tafsir entries.');
    }

    const validation = validateTafsirEntryInput(input);
    if (!validation.valid) {
      throw new Error(`Validation Error: ${validation.errors.join(' ')}`);
    }

    if (!this.worksMap.has(input.workId)) {
      throw new Error(`Foreign Key Violation: Tafsir work '${input.workId}' does not exist.`);
    }

    const entryId = `te-${input.workId}-${input.surahId}-${input.ayahNumber}-${Date.now()}`;
    const entry: TafsirEntry = {
      id: entryId,
      workId: input.workId,
      editionId: input.editionId,
      surahId: input.surahId,
      ayahNumber: input.ayahNumber,
      ayahNumberEnd: input.ayahNumberEnd,
      languageCode: input.languageCode,
      textContent: input.textContent || null,
      contentAvailability: input.contentAvailability || 'metadata_only',
      sourcePageReference: input.sourcePageReference,
      sourceEditionIdentifier: input.sourceEditionIdentifier,
      licenseStatus: input.licenseStatus || 'unverified_pending',
      importDate: input.importDate,
      importSource: input.importSource,
      publicationStatus: input.publicationStatus || 'draft',
      versionNumber: 1,
      isCurrent: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const key = `${entry.workId}:${entry.surahId}:${entry.ayahNumber}:${entry.languageCode}`;
    this.entriesMap.set(key, entry);

    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      entityType: 'tafsir_entries',
      entityId: entry.id,
      action: 'create',
      performedBy: actor?.id || 'system',
      createdAt: new Date().toISOString()
    });

    return entry;
  }

  public async quarantineEntry(
    workId: string,
    surahId: number,
    ayahNumber: number,
    languageCode: 'ar' | 'en' | 'ur',
    reason: string,
    actor?: ActorContext
  ): Promise<TafsirEntry> {
    if (actor && !actor.roles.some((r) => r === 'super_admin' || r === 'content_admin')) {
      throw new Error('Authorization Violation: Only administrators can quarantine tafsir entries.');
    }

    const key = `${workId}:${surahId}:${ayahNumber}:${languageCode}`;
    const entry = this.entriesMap.get(key);
    if (!entry) {
      throw new Error(`Entry Not Found: No tafsir entry for ${workId} ${surahId}:${ayahNumber} (${languageCode}).`);
    }

    entry.licenseStatus = 'restricted_takedown';
    entry.publicationStatus = 'takedown';

    this.auditLogs.push({
      id: `audit-${Date.now()}`,
      entityType: 'tafsir_entries',
      entityId: entry.id,
      action: 'takedown_quarantine',
      performedBy: actor?.id || 'legal_system',
      reason,
      createdAt: new Date().toISOString()
    });

    return entry;
  }

  // ==========================================================================
  // Row Mappers (Supabase snake_case → camelCase)
  // ==========================================================================

  private mapWorkRow(row: Record<string, unknown>): TafsirWork {
    return {
      id: row.id as string,
      slug: row.slug as string,
      titleArabic: row.title_arabic as string,
      titleEnglish: row.title_english as string,
      titleUrdu: row.title_urdu as string,
      authorNameArabic: row.author_name_arabic as string,
      authorNameEnglish: row.author_name_english as string,
      authorNameUrdu: row.author_name_urdu as string,
      authorDeathYearHijri: row.author_death_year_hijri as number | undefined,
      authorDeathYearCe: row.author_death_year_ce as number | undefined,
      descriptionEnglish: row.description_english as string | undefined,
      descriptionArabic: row.description_arabic as string | undefined,
      descriptionUrdu: row.description_urdu as string | undefined,
      methodologyNotes: row.methodology_notes as string | undefined,
      licenseType: row.license_type as string,
      licenseStatus: row.license_status as TafsirWork['licenseStatus'],
      sourceUrl: row.source_url as string | undefined,
      provenanceNotes: row.provenance_notes as string | undefined,
      attributionRequirement: row.attribution_requirement as string | undefined,
      isActive: row.is_active as boolean,
      reviewStatus: row.review_status as TafsirWork['reviewStatus'],
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    };
  }

  private mapEntryRow(row: Record<string, unknown>): TafsirEntry {
    return {
      id: row.id as string,
      workId: row.work_id as string,
      editionId: row.edition_id as string | undefined,
      surahId: row.surah_id as number,
      ayahNumber: row.ayah_number as number,
      ayahNumberEnd: row.ayah_number_end as number | undefined,
      languageCode: row.language_code as 'ar' | 'en' | 'ur',
      textContent: row.text_content as string | null | undefined,
      contentAvailability: row.content_availability as TafsirEntry['contentAvailability'],
      sourcePageReference: row.source_page_reference as string | undefined,
      sourceEditionIdentifier: row.source_edition_identifier as string | undefined,
      licenseStatus: row.license_status as TafsirEntry['licenseStatus'],
      contentSha256: row.content_sha256 as string | undefined,
      importDate: row.import_date as string | undefined,
      importSource: row.import_source as string | undefined,
      publicationStatus: row.publication_status as TafsirEntry['publicationStatus'],
      versionNumber: row.version_number as number,
      isCurrent: row.is_current as boolean,
      parentVersionId: row.parent_version_id as string | undefined,
      changeSummary: row.change_summary as string | undefined,
      reviewedById: row.reviewed_by_id as string | undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    };
  }
}
