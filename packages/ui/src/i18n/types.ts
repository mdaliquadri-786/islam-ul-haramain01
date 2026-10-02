/**
 * @file types.ts
 * @package @islamic/ui
 * @description Type definitions for the Internationalization (i18n) dictionary system.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

export type Locale = 'en' | 'ar' | 'ur';
export type Direction = 'ltr' | 'rtl';

export interface LocaleInfo {
  code: Locale;
  name: string;
  nativeName: string;
  dir: Direction;
  fontFamily: string;
}

export interface Dictionary {
  nav: {
    home: string;
    quran: string;
    hadith: string;
    duas: string;
    prayerTimes: string;
    articles: string;
    search: string;
    library: string;
    books: string;
    profile: string;
    cms: string;
  };
  common: {
    platformName: string;
    platformNameArabic: string;
    tagline: string;
    search: string;
    searchPlaceholder: string;
    all: string;
    loading: string;
    error: string;
    success: string;
    bookmark: string;
    bookmarked: string;
    remove: string;
    close: string;
    back: string;
    filter: string;
    share: string;
    copy: string;
    copied: string;
    readMore: string;
  };
  prayer: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    qiyam: string;
    nextPrayer: string;
    timeRemaining: string;
    qiblaBearing: string;
    calculationMethod: string;
    asrMadhhab: string;
    standard: string;
    hanafi: string;
    highLatitudeRule: string;
    selectCity: string;
  };
  quran: {
    title: string;
    subtitle: string;
    surah: string;
    ayah: string;
    juz: string;
    page: string;
    revelationMakkah: string;
    revelationMadinah: string;
    translation: string;
    saheehEn: string;
    jalandhariUr: string;
    none: string;
    verificationBadge: string;
  };
  hadith: {
    title: string;
    subtitle: string;
    bukhari: string;
    muslim: string;
    abudawud: string;
    tirmidhi: string;
    nasai: string;
    ibnmajah: string;
    isnad: string;
    matn: string;
    grade: string;
    reference: string;
  };
  duas: {
    title: string;
    subtitle: string;
    chapter: string;
    repeatCount: string;
    transliteration: string;
    englishTranslation: string;
    occasion: string;
  };
  articles: {
    title: string;
    subtitle: string;
    author: string;
    scholarReviewer: string;
    category: string;
    publishedAt: string;
    readingTime: string;
    citations: string;
    revisionHash: string;
  };
  library: {
    title: string;
    subtitle: string;
    allBookmarks: string;
    quranBookmarks: string;
    hadithBookmarks: string;
    duaBookmarks: string;
    articleBookmarks: string;
    emptyTitle: string;
    emptyDescription: string;
    unavailableWarning: string;
  };
  profile: {
    title: string;
    subtitle: string;
    accountInfo: string;
    userId: string;
    role: string;
    devotionalStats: string;
    totalBookmarks: string;
    languagePreference: string;
    mushafPreference: string;
    uthmaniScript: string;
    indopakScript: string;
    prayerSettings: string;
  };
  audio: {
    title: string;
    reciter: string;
    selectReciter: string;
    play: string;
    pause: string;
    playing: string;
    paused: string;
    buffering: string;
    speed: string;
    volume: string;
    mute: string;
    unmute: string;
    seekForward: string;
    seekBackward: string;
    surahRecitation: string;
    verifiedLicensing: string;
    attribution: string;
    takedown: string;
    currentAyah: string;
    jumpToAyah: string;
    download: string;
    playbackError: string;
  };
  tafsir: {
    title: string;
    subtitle: string;
    openTafsir: string;
    compareMode: string;
    singleMode: string;
    selectSources: string;
    source: string;
    author: string;
    deathYear: string;
    edition: string;
    language: string;
    licenseStatus: string;
    provenancePanel: string;
    attributionLabel: string;
    sourceReference: string;
    contentUnavailable: string;
    contentUnavailableReason: string;
    publicDomain: string;
    noSources: string;
    ayahReference: string;
    closeViewer: string;
    expandAll: string;
    collapseAll: string;
    viewerTitle: string;
    methodologyDisclaimer: string;
  };
  books: {
    title: string;
    subtitle: string;
    catalogTitle: string;
    catalogSubtitle: string;
    author: string;
    died: string;
    volumes: string;
    volume: string;
    sections: string;
    chapters: string;
    readBook: string;
    openReader: string;
    tableOfContents: string;
    readingProgress: string;
    markCompleted: string;
    resumeReading: string;
    lastRead: string;
    provenance: string;
    licenseStatus: string;
    publicDomain: string;
    attribution: string;
    source: string;
    contentUnavailable: string;
    contentUnavailableReason: string;
    metadataOnlyNotice: string;
    searchPlaceholder: string;
    searchInBook: string;
    searchResults: string;
    noResults: string;
    fontSize: string;
    readingWidth: string;
    readingTheme: string;
    prevSection: string;
    nextSection: string;
    closeReader: string;
    methodologyDisclaimer: string;
    categoryHadithLiterature: string;
    categoryAqeedah: string;
    categoryFiqh: string;
    categoryAdabZuhd: string;
    categoryGeneral: string;
  };
  footer: {
    creedStatement: string;
    allRightsReserved: string;
    status: string;
  };
}
