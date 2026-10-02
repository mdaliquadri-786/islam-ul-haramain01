/**
 * @file types.ts
 * @package @islamic/database
 * @description Boundary data transfer objects (DTOs) and database client types.
 * Concrete Supabase generated schemas will be bound in Milestone 1.2.
 */

export interface QuranEditionEntity {
  id: string;
  name: string;
  author: string;
  editionVersion: string;
  scriptType: 'uthmani' | 'indopak' | 'clean';
  riwayah: string;
  numberingConvention: string;
  sourceUrl: string;
  downloadUrl?: string | null;
  license: string;
  attributionNotice: string;
  rawSourceSha256: string;
  totalSurahs: number;
  totalAyahs: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export interface SurahEntity {
  id: number;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameTransliteration: string;
  nameUrdu?: string;
  revelationType: 'meccan' | 'medinan';
  revelationOrder: number;
  ayahsCount: number;
  rukusCount: number;
  startAyahIndex: number;
  createdAt: string;
}
export type QuranSurahEntity = SurahEntity;

export interface AyahEntity {
  id: number;
  editionId: string;
  surahId: number;
  ayahNumber: number;
  textSourceVerbatim: string;
  checksumSourceVerbatim: string;
  textUthmani: string;
  checksumAyahStructural: string;
  textChecksum: string;
  bismillah?: string | null;
  textClean: string;
  juzNumber: number;
  hizbNumber: number;
  rubNumber: number;
  rukuNumber: number;
  manzilNumber: number;
  pageNumber: number;
  sajdah: boolean;
  sajdahType?: string | null;
  createdAt: string;
  updatedAt: string;
}
export type QuranAyahEntity = AyahEntity;

export type BookmarkContentType = 'quran' | 'hadith' | 'dua' | 'article' | 'book';

export interface BookmarkEntity {
  id: string; // UUID
  userId: string;
  contentType: BookmarkContentType;
  contentReference: string;
  surahNumber?: number;
  ayahNumber?: number;
  hadithCollection?: string;
  hadithNumber?: number;
  duaCategory?: string;
  articleId?: string;
  bookId?: string;
  folderName: string;
  note?: string;
  tags: string[];
  clientMutationId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BookmarkRow {
  id: string;
  user_id: string;
  content_type: BookmarkContentType;
  content_reference: string;
  surah_number: number | null;
  ayah_number: number | null;
  hadith_collection: string | null;
  hadith_number: number | null;
  dua_category: string | null;
  article_id: string | null;
  folder_name: string;
  note: string | null;
  tags: string[];
  client_mutation_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserPrayerSettingsEntity {
  id: string;
  userId: string;
  calculationMethod: 'MWL' | 'ISNA' | 'UmmAlQura' | 'Karachi' | 'Egyptian' | 'Diyanet' | 'MUIS' | 'Custom';
  asrMadhhab: 'standard' | 'hanafi';
  highLatitudeRule: 'angle_based' | 'midnight' | 'one_seventh' | 'none';
  latitude?: number | null;
  longitude?: number | null;
  cityName?: string | null;
  timezone: string;
  fajrOffsetMinutes: number;
  dhuhrOffsetMinutes: number;
  asrOffsetMinutes: number;
  maghribOffsetMinutes: number;
  ishaOffsetMinutes: number;
  updatedAt?: string;
}

export type ContentStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export interface ContentEntity {
  id: string;
  contentType: string;
  slug?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  currentVersionId?: string | null;
}

export interface ContentVersionEntity {
  id: string;
  entityId: string;
  versionNumber: number;
  status: ContentStatus;
  title: string;
  contentPayload: Record<string, unknown>;
  contentHash?: string | null;
  changeSummary?: string | null;
  sourceProvenance: Record<string, unknown>;
  parentVersionId?: string | null;
  createdBy: string;
  createdAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  publishedBy?: string | null;
  publishedAt?: string | null;
}

export interface AuditLogEntry {
  id: string;
  actorId?: string | null;
  action: string;
  targetEntityType: string;
  targetEntityId?: string | null;
  correlationId?: string | null;
  details: Record<string, unknown>;
  sourceContext?: string | null;
  createdAt: string;
}

export interface DatabaseClientConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface QuranEditionRow {
  id: string;
  name: string;
  author: string;
  edition_version: string;
  script_type: 'uthmani' | 'indopak' | 'clean';
  riwayah: string;
  numbering_convention: string;
  source_url: string;
  download_url?: string | null;
  license: string;
  attribution_notice: string;
  raw_source_sha256: string;
  total_surahs: number;
  total_ayahs: number;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
}

export interface QuranSurahRow {
  id: number;
  slug: string;
  name_arabic: string;
  name_english: string;
  name_transliteration: string;
  revelation_type: 'meccan' | 'medinan';
  revelation_order: number;
  ayahs_count: number;
  rukus_count: number;
  start_ayah_index: number;
  created_at?: string;
}

export interface QuranAyahRow {
  id: number;
  edition_id: string;
  surah_id: number;
  ayah_number: number;
  text_source_verbatim: string;
  checksum_source_verbatim: string;
  text_uthmani: string;
  checksum_ayah_structural: string;
  text_checksum: string;
  bismillah?: string | null;
  text_clean: string;
  juz_number: number;
  hizb_number: number;
  rub_number: number;
  ruku_number: number;
  manzil_number: number;
  page_number: number;
  sajdah: boolean;
  sajdah_type?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuranTranslationEditionEntity {
  id: string;
  slug: string;
  languageCode: string;
  title: string;
  translator: string;
  sourceName: string;
  sourceUrl: string;
  sourceVersion: string;
  publisher?: string;
  publicationYear?: number;
  license: string;
  copyrightStatement: string;
  attributionText: string;
  sourceFileName: string;
  sourceSha256: string;
  datasetSha256: string;
  sourceAcquiredAt: string;
  totalSurahs: number;
  totalAyahs: number;
  status: 'draft' | 'validated' | 'published' | 'retired';
  createdAt?: string;
  updatedAt?: string;
}

export interface QuranTranslationEntity {
  id: number;
  editionId: string;
  surahNumber: number;
  ayahNumber: number;
  ayahId: number;
  translationText: string;
  translatorNote?: string;
  sourceReference?: string;
  textChecksum: string;
  createdAt?: string;
}

export interface QuranTranslationEditionRow {
  id: string;
  slug: string;
  language_code: string;
  title: string;
  translator: string;
  source_name: string;
  source_url: string;
  source_version: string;
  publisher?: string;
  publication_year?: number;
  license: string;
  copyright_statement: string;
  attribution_text: string;
  source_file_name: string;
  source_sha256: string;
  dataset_sha256: string;
  source_acquired_at: string;
  total_surahs: number;
  total_ayahs: number;
  status: 'draft' | 'validated' | 'published' | 'retired';
  created_at?: string;
  updated_at?: string;
}

export interface QuranTranslationRow {
  id?: number;
  edition_id: string;
  surah_number: number;
  ayah_number: number;
  ayah_id: number;
  translation_text: string;
  translator_note?: string;
  source_reference?: string;
  text_checksum: string;
  created_at?: string;
}

// ============================================================================
// Hadith Collections Engine DTOs & Table Rows (M2.3)
// ============================================================================

export interface ScholarAuthorEntity {
  id: string;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu?: string;
  deathYearAh?: number;
  deathYearCe?: number;
  era: 'prophetic' | 'companions' | 'tabiun' | 'early' | 'classical' | 'contemporary';
  role: 'compiler' | 'evaluator' | 'commentator' | 'scholar' | 'translator';
  biographySummary?: string;
  createdAt?: string;
}

export interface ScholarAuthorRow {
  id: string;
  slug: string;
  name_arabic: string;
  name_english: string;
  name_urdu?: string;
  death_year_ah?: number;
  death_year_ce?: number;
  era: 'prophetic' | 'companions' | 'tabiun' | 'early' | 'classical' | 'contemporary';
  role: 'compiler' | 'evaluator' | 'commentator' | 'scholar' | 'translator';
  biography_summary?: string;
  created_at?: string;
}

export interface HadithCollectionEntity {
  id: string;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu: string;
  authorId: string;
  totalHadiths: number;
  totalBooks: number;
  description?: string;
  provenanceNotes?: string;
  sourceEdition: string;
  sourceUrl: string;
  status: 'draft' | 'validated' | 'published' | 'retired';
  createdAt?: string;
  updatedAt?: string;
}

export interface HadithCollectionRow {
  id: string;
  slug: string;
  name_arabic: string;
  name_english: string;
  name_urdu: string;
  author_id: string;
  total_hadiths: number;
  total_books: number;
  description?: string;
  provenance_notes?: string;
  source_edition: string;
  source_url: string;
  status: 'draft' | 'validated' | 'published' | 'retired';
  created_at?: string;
  updated_at?: string;
}

export interface HadithBookEntity {
  id?: number;
  collectionId: string;
  bookNumber: number;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu?: string;
  hadithStartNumber: number;
  hadithEndNumber: number;
  totalHadiths: number;
  createdAt?: string;
}

export interface HadithBookRow {
  id?: number;
  collection_id: string;
  book_number: number;
  name_arabic: string;
  name_english: string;
  name_urdu?: string;
  hadith_start_number: number;
  hadith_end_number: number;
  total_hadiths: number;
  created_at?: string;
}

export interface HadithNarrationEntity {
  id?: number;
  collectionId: string;
  bookId: number;
  hadithNumber: number;
  inBookReference?: string;
  internationalNumber?: number;
  chapterTitleArabic?: string;
  chapterTitleEnglish?: string;
  sanadArabic?: string | null;
  matnArabic: string;
  matnClean: string;
  translationEnglish?: string;
  translationUrdu?: string;
  textChecksum: string;
  sourceEdition: string;
  versionNumber?: number;
  isCurrent?: boolean;
  status?: 'draft' | 'validated' | 'published' | 'retired';
  createdAt?: string;
  updatedAt?: string;
}

export interface HadithNarrationRow {
  id?: number;
  collection_id: string;
  book_id: number;
  hadith_number: number;
  in_book_reference?: string;
  international_number?: number;
  chapter_title_arabic?: string;
  chapter_title_english?: string;
  sanad_arabic?: string | null;
  matn_arabic: string;
  matn_clean: string;
  translation_english?: string;
  translation_urdu?: string;
  text_checksum: string;
  source_edition: string;
  version_number?: number;
  is_current?: boolean;
  status?: 'draft' | 'validated' | 'published' | 'retired';
  created_at?: string;
  updated_at?: string;
}

export interface HadithGradingEntity {
  id?: number;
  hadithId: number;
  scholarId: string;
  grade: string;
  gradeArabic: string;
  gradeLevel: 'sahih' | 'hasan' | 'daif' | 'mawdu';
  scholarlyCommentary?: string;
  referenceSource: string;
  createdAt?: string;
}

export interface HadithGradingRow {
  id?: number;
  hadith_id: number;
  scholar_id: string;
  grade: string;
  grade_arabic: string;
  grade_level: 'sahih' | 'hasan' | 'daif' | 'mawdu';
  scholarly_commentary?: string;
  reference_source: string;
  created_at?: string;
}

// ============================================================================
// Duas & Adhkar Domain & Database Types (M2.4)
// ============================================================================

export interface DuaSourceEntity {
  id: string;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu?: string | null;
  author: string;
  authorArabic: string;
  authorDeathYearAh?: number | null;
  authorDeathYearCe?: number | null;
  license: string;
  description?: string | null;
  status?: 'draft' | 'validated' | 'published' | 'retired';
  createdAt?: string;
  updatedAt?: string;
}

export interface DuaSourceRow {
  id: string;
  slug: string;
  name_arabic: string;
  name_english: string;
  name_urdu?: string | null;
  author: string;
  author_arabic: string;
  author_death_year_ah?: number | null;
  author_death_year_ce?: number | null;
  license: string;
  description?: string | null;
  status?: 'draft' | 'validated' | 'published' | 'retired';
  created_at?: string;
  updated_at?: string;
}

export interface DuaCategoryEntity {
  id?: number;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  nameUrdu?: string | null;
  sortOrder: number;
  totalDuas: number;
  createdAt?: string;
}

export interface DuaCategoryRow {
  id?: number;
  slug: string;
  name_arabic: string;
  name_english: string;
  name_urdu?: string | null;
  sort_order: number;
  total_duas: number;
  created_at?: string;
}

export interface DuaAdhkarEntity {
  id?: number;
  duaId: string;
  categoryId: number;
  categorySlug?: string;
  sourceId: string;
  itemNumber: number;
  arabicText: string;
  transliteration?: string | null;
  translationEnglish: string;
  translationUrdu?: string | null;
  repeatCount: number;
  occasionContext?: string | null;
  quranSurah?: number | null;
  quranAyah?: string | null;
  hadithCollection?: string | null;
  hadithNumber?: string | null;
  hadithReference?: string | null;
  hadithGrade?: string | null;
  textChecksum: string;
  textClean: string;
  versionNumber?: number;
  isCurrent?: boolean;
  status?: 'draft' | 'validated' | 'published' | 'retired';
  createdAt?: string;
  updatedAt?: string;
}

export interface DuaAdhkarRow {
  id?: number;
  dua_id: string;
  category_id: number;
  category_slug?: string;
  source_id: string;
  item_number: number;
  arabic_text: string;
  transliteration?: string | null;
  translation_english: string;
  translation_urdu?: string | null;
  repeat_count: number;
  occasion_context?: string | null;
  quran_surah?: number | null;
  quran_ayah?: string | null;
  hadith_collection?: string | null;
  hadith_number?: string | null;
  hadith_reference?: string | null;
  hadith_grade?: string | null;
  text_checksum: string;
  text_clean: string;
  version_number?: number;
  is_current?: boolean;
  status?: 'draft' | 'validated' | 'published' | 'retired';
  created_at?: string;
  updated_at?: string;
}

export interface UserPrayerSettingsRow {
  id: string;
  user_id: string;
  calculation_method: string;
  asr_madhhab: string;
  high_latitude_rule: string;
  latitude?: number | null;
  longitude?: number | null;
  city_name?: string | null;
  timezone: string;
  fajr_offset_minutes: number;
  dhuhr_offset_minutes: number;
  asr_offset_minutes: number;
  maghrib_offset_minutes: number;
  isha_offset_minutes: number;
  updated_at: string;
}

export interface ArticleCategoryRow {
  id: string;
  slug: string;
  name_arabic: string;
  name_english: string;
  name_urdu: string;
  description_english?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleTagRow {
  id: string;
  slug: string;
  name: string;
  language: string;
  created_at: string;
}

export interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  language: string;
  category_id?: string | null;
  author_id: string;
  status: string;
  current_revision_id?: string | null;
  published_revision_id?: string | null;
  primary_madhhab?: string | null;
  featured_image_url?: string | null;
  reading_time_minutes: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleRevisionRow {
  id: string;
  article_id: string;
  revision_number: number;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  body_markdown: string;
  content_hash: string;
  change_summary?: string | null;
  source_references: any;
  licensing_metadata: any;
  ai_assistance_metadata: any;
  status: string;
  created_by: string;
  created_at: string;
}

export interface ScholarReviewRow {
  id: string;
  article_id: string;
  revision_id: string;
  reviewer_id: string;
  assigned_by: string;
  status: string;
  decision?: string | null;
  scholarly_notes?: string | null;
  assigned_at: string;
  completed_at?: string | null;
}

export interface ScholarReviewCommentRow {
  id: string;
  review_id: string;
  article_id: string;
  revision_id: string;
  reviewer_id: string;
  comment_type: string;
  paragraph_reference?: string | null;
  comment_text: string;
  resolution_status: string;
  created_at: string;
}

// ============================================================================
// Administrative System & RBAC Types
// ============================================================================

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'content_admin'
  | 'scholar_reviewer'
  | 'support_admin'
  | 'billing_admin'
  | 'editor'
  | 'translator'
  | 'user';

export type AdminPermission =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'publish'
  | 'approve'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_subscriptions'
  | 'manage_settings'
  | 'manage_feature_flags'
  | 'view_audit_logs';

export interface UserRoleEntity {
  userId: string;
  role: UserRole;
  grantedBy?: string | null;
  grantedAt: string;
}

export interface UserRoleRow {
  user_id: string;
  role: UserRole;
  granted_by: string | null;
  granted_at: string;
}

export interface RolePermissionEntity {
  role: UserRole;
  permission: AdminPermission;
  description?: string | null;
}

export interface UserProfileEntity {
  id: string;
  username?: string | null;
  fullName?: string | null;
  preferredLocale: string;
  preferredMushaf: string;
  isSuspended: boolean;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  preferred_locale: string;
  preferred_mushaf: string;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SystemSettingsEntity {
  id: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcementBannerEnabled: boolean;
  announcementBannerText?: string | null;
  registrationEnabled: boolean;
  publishingEnabled: boolean;
  subscriptionsEnabled: boolean;
  minSupportedMobileVersion: string;
  minSupportedWebVersion: string;
  defaultLocale: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface SystemSettingsRow {
  id: number;
  maintenance_mode: boolean;
  maintenance_message: string;
  announcement_banner_enabled: boolean;
  announcement_banner_text: string | null;
  registration_enabled: boolean;
  publishing_enabled: boolean;
  subscriptions_enabled: boolean;
  min_supported_mobile_version: string;
  min_supported_web_version: string;
  default_locale: string;
  updated_at: string;
  updated_by: string | null;
}

export interface FeatureFlagEntity {
  key: string;
  name: string;
  description?: string | null;
  isEnabled: boolean;
  targetAudience: 'all' | 'beta_testers' | 'admin_only';
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface FeatureFlagRow {
  key: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  target_audience: 'all' | 'beta_testers' | 'admin_only';
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export type SubscriptionBillingInterval = 'month' | 'year' | 'lifetime' | 'free';

export interface SubscriptionPlanEntity {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  billingInterval: SubscriptionBillingInterval;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlanRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  billing_interval: SubscriptionBillingInterval;
  features: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'
  | 'free';

export type PaymentProvider =
  | 'manual'
  | 'stripe'
  | 'apple_iap'
  | 'google_play'
  | 'waqf_grant';

export interface UserSubscriptionEntity {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  providerSubscriptionId?: string | null;
  currentPeriodStart: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  plan?: SubscriptionPlanEntity;
}

export interface UserSubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  provider_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLogEntry {
  id: string;
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  targetEntityType: string;
  targetEntityId?: string | null;
  details: Record<string, unknown>;
  sourceContext?: string | null;
  createdAt: string;
}

export interface AdminOverviewStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  contentCounts: {
    quranSurahs: number;
    quranAyahs: number;
    hadithNarrations: number;
    duasCount: number;
    tafsirWorks: number;
    classicalBooks: number;
    articlesTotal: number;
    articlesPublished: number;
    articlesPendingReview: number;
    recitersCount: number;
  };
  systemStatus: {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    publishingEnabled: boolean;
    subscriptionsEnabled: boolean;
  };
  recentAuditLogs: AdminAuditLogEntry[];
}

export interface AdminUserListItem {
  id: string;
  username?: string | null;
  fullName?: string | null;
  preferredLocale: string;
  roles: UserRole[];
  isSuspended: boolean;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
  createdAt: string;
  lastActiveAt?: string | null;
  activeSubscription?: {
    planSlug: string;
    planName: string;
    status: SubscriptionStatus;
  } | null;
}
