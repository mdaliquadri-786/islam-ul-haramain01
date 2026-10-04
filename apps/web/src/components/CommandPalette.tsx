'use client';

/**
 * @file CommandPalette.tsx
 * @package @islamic/web
 * @description Public-facing global deep-link Command Palette (Cmd+K / Ctrl+K).
 *              Performs instant fuzzy search and smart citation routing across:
 *              - Holy Quran (114 Surahs, Direct Ayah syntax e.g. "2:255")
 *              - Kutub al-Sittah Hadiths (e.g. "Bukhari 1", "Muslim 42")
 *              - Classical Tafsir (Ibn Kathir, As-Sa'di)
 *              - Hisn al-Muslim Adhkar categories
 *              - Comparative Fiqh topics
 *              - Astronomical Prayer Times & Qibla
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Quran' | 'Hadith' | 'Tafsir' | 'Adhkar' | 'Fiqh' | 'Prayer' | 'Navigation';
  href: string;
  badge?: string;
  icon: string;
  keywords?: string[];
}

// Canonical 114 Surah Quick Jump Directory
const SURAH_DIRECTORY: Array<{ id: number; nameEnglish: string; nameArabic: string }> = [
  { id: 1, nameEnglish: 'Al-Fatihah', nameArabic: 'الفاتحة' },
  { id: 2, nameEnglish: 'Al-Baqarah', nameArabic: 'البقرة' },
  { id: 3, nameEnglish: 'Ali \'Imran', nameArabic: 'آل عمران' },
  { id: 4, nameEnglish: 'An-Nisa', nameArabic: 'النساء' },
  { id: 5, nameEnglish: 'Al-Ma\'idah', nameArabic: 'المائدة' },
  { id: 6, nameEnglish: 'Al-An\'am', nameArabic: 'الأنعام' },
  { id: 7, nameEnglish: 'Al-A\'raf', nameArabic: 'الأعراف' },
  { id: 8, nameEnglish: 'Al-Anfal', nameArabic: 'الأنفال' },
  { id: 9, nameEnglish: 'At-Tawbah', nameArabic: 'التوبة' },
  { id: 10, nameEnglish: 'Yunus', nameArabic: 'يونس' },
  { id: 11, nameEnglish: 'Hud', nameArabic: 'هود' },
  { id: 12, nameEnglish: 'Yusuf', nameArabic: 'يوسف' },
  { id: 13, nameEnglish: 'Ar-Ra\'d', nameArabic: 'الرعد' },
  { id: 14, nameEnglish: 'Ibrahim', nameArabic: 'إبراهيم' },
  { id: 15, nameEnglish: 'Al-Hijr', nameArabic: 'الحجر' },
  { id: 16, nameEnglish: 'An-Nahl', nameArabic: 'النحل' },
  { id: 17, nameEnglish: 'Al-Isra', nameArabic: 'الإسراء' },
  { id: 18, nameEnglish: 'Al-Kahf', nameArabic: 'الكهف' },
  { id: 19, nameEnglish: 'Maryam', nameArabic: 'مريم' },
  { id: 20, nameEnglish: 'Ta-Ha', nameArabic: 'طه' },
  { id: 21, nameEnglish: 'Al-Anbiya', nameArabic: 'الأنبياء' },
  { id: 22, nameEnglish: 'Al-Hajj', nameArabic: 'الحج' },
  { id: 23, nameEnglish: 'Al-Mu\'minun', nameArabic: 'المؤمنون' },
  { id: 24, nameEnglish: 'An-Nur', nameArabic: 'النور' },
  { id: 25, nameEnglish: 'Al-Furqan', nameArabic: 'الفرقان' },
  { id: 26, nameEnglish: 'Ash-Shu\'ara', nameArabic: 'الشعراء' },
  { id: 27, nameEnglish: 'An-Naml', nameArabic: 'النمل' },
  { id: 28, nameEnglish: 'Al-Qasas', nameArabic: 'القصص' },
  { id: 29, nameEnglish: 'Al-\'Ankabut', nameArabic: 'العنكبوت' },
  { id: 30, nameEnglish: 'Ar-Rum', nameArabic: 'الروم' },
  { id: 31, nameEnglish: 'Luqman', nameArabic: 'لقمان' },
  { id: 32, nameEnglish: 'As-Sajdah', nameArabic: 'السجدة' },
  { id: 33, nameEnglish: 'Al-Ahzab', nameArabic: 'الأحزاب' },
  { id: 34, nameEnglish: 'Saba', nameArabic: 'سبأ' },
  { id: 35, nameEnglish: 'Fatir', nameArabic: 'فاطر' },
  { id: 36, nameEnglish: 'Ya-Sin', nameArabic: 'يس' },
  { id: 37, nameEnglish: 'As-Saffat', nameArabic: 'الصافات' },
  { id: 38, nameEnglish: 'Sad', nameArabic: 'ص' },
  { id: 39, nameEnglish: 'Az-Zumar', nameArabic: 'الزمر' },
  { id: 40, nameEnglish: 'Ghafir', nameArabic: 'غافر' },
  { id: 41, nameEnglish: 'Fussilat', nameArabic: 'فصلت' },
  { id: 42, nameEnglish: 'Ash-Shura', nameArabic: 'الشورى' },
  { id: 43, nameEnglish: 'Az-Zukhruf', nameArabic: 'الزخرف' },
  { id: 44, nameEnglish: 'Ad-Dukhan', nameArabic: 'الدخان' },
  { id: 45, nameEnglish: 'Al-Jathiyah', nameArabic: 'الجاثية' },
  { id: 46, nameEnglish: 'Al-Ahqaf', nameArabic: 'الأحقاف' },
  { id: 47, nameEnglish: 'Muhammad', nameArabic: 'محمد' },
  { id: 48, nameEnglish: 'Al-Fath', nameArabic: 'الفتح' },
  { id: 49, nameEnglish: 'Al-Hujurat', nameArabic: 'الحجرات' },
  { id: 50, nameEnglish: 'Qaf', nameArabic: 'ق' },
  { id: 51, nameEnglish: 'Adh-Dhariyat', nameArabic: 'الذاريات' },
  { id: 52, nameEnglish: 'At-Tur', nameArabic: 'الطور' },
  { id: 53, nameEnglish: 'An-Najm', nameArabic: 'النجم' },
  { id: 54, nameEnglish: 'Al-Qamar', nameArabic: 'القمر' },
  { id: 55, nameEnglish: 'Ar-Rahman', nameArabic: 'الرحمن' },
  { id: 56, nameEnglish: 'Al-Waqi\'ah', nameArabic: 'الواقعة' },
  { id: 57, nameEnglish: 'Al-Hadid', nameArabic: 'الحديد' },
  { id: 58, nameEnglish: 'Al-Mujadila', nameArabic: 'المجادلة' },
  { id: 59, nameEnglish: 'Al-Hashr', nameArabic: 'الحشر' },
  { id: 60, nameEnglish: 'Al-Mumtahanah', nameArabic: 'الممتحنة' },
  { id: 61, nameEnglish: 'As-Saff', nameArabic: 'الصف' },
  { id: 62, nameEnglish: 'Al-Jumu\'ah', nameArabic: 'الجمعة' },
  { id: 63, nameEnglish: 'Al-Munafiqun', nameArabic: 'المنافقون' },
  { id: 64, nameEnglish: 'At-Taghabun', nameArabic: 'التغابن' },
  { id: 65, nameEnglish: 'At-Talaq', nameArabic: 'الطلاق' },
  { id: 66, nameEnglish: 'At-Tahrim', nameArabic: 'التحريم' },
  { id: 67, nameEnglish: 'Al-Mulk', nameArabic: 'الملك' },
  { id: 68, nameEnglish: 'Al-Qalam', nameArabic: 'القلم' },
  { id: 69, nameEnglish: 'Al-Haqqah', nameArabic: 'الحاقة' },
  { id: 70, nameEnglish: 'Al-Ma\'arij', nameArabic: 'المعارج' },
  { id: 71, nameEnglish: 'Nuh', nameArabic: 'نوح' },
  { id: 72, nameEnglish: 'Al-Jinn', nameArabic: 'الجن' },
  { id: 73, nameEnglish: 'Al-Muzzammil', nameArabic: 'المزمل' },
  { id: 74, nameEnglish: 'Al-Muddaththir', nameArabic: 'المدثر' },
  { id: 75, nameEnglish: 'Al-Qiyamah', nameArabic: 'القيامة' },
  { id: 76, nameEnglish: 'Al-Insan', nameArabic: 'الإنسان' },
  { id: 77, nameEnglish: 'Al-Mursalat', nameArabic: 'المرسلات' },
  { id: 78, nameEnglish: 'An-Naba', nameArabic: 'النبأ' },
  { id: 79, nameEnglish: 'An-Nazi\'at', nameArabic: 'النازعات' },
  { id: 80, nameEnglish: '\'Abasa', nameArabic: 'عبس' },
  { id: 81, nameEnglish: 'At-Takwir', nameArabic: 'التكوير' },
  { id: 82, nameEnglish: 'Al-Infitar', nameArabic: 'الانفطار' },
  { id: 83, nameEnglish: 'Al-Mutaffifin', nameArabic: 'المطففين' },
  { id: 84, nameEnglish: 'Al-Inshiqaq', nameArabic: 'الانشقاق' },
  { id: 85, nameEnglish: 'Al-Buruj', nameArabic: 'البروج' },
  { id: 86, nameEnglish: 'At-Tariq', nameArabic: 'الطارق' },
  { id: 87, nameEnglish: 'Al-A\'la', nameArabic: 'الأعلى' },
  { id: 88, nameEnglish: 'Al-Ghashiyah', nameArabic: 'الغاشية' },
  { id: 89, nameEnglish: 'Al-Fajr', nameArabic: 'الفجر' },
  { id: 90, nameEnglish: 'Al-Balad', nameArabic: 'البلد' },
  { id: 91, nameEnglish: 'Ash-Shams', nameArabic: 'الشمس' },
  { id: 92, nameEnglish: 'Al-Layl', nameArabic: 'الليل' },
  { id: 93, nameEnglish: 'Ad-Duhaa', nameArabic: 'الضحى' },
  { id: 94, nameEnglish: 'Ash-Sharh', nameArabic: 'الشرح' },
  { id: 95, nameEnglish: 'At-Tin', nameArabic: 'التين' },
  { id: 96, nameEnglish: 'Al-\'Alaq', nameArabic: 'العلق' },
  { id: 97, nameEnglish: 'Al-Qadr', nameArabic: 'القدر' },
  { id: 98, nameEnglish: 'Al-Bayyinah', nameArabic: 'البينة' },
  { id: 99, nameEnglish: 'Az-Zalzalah', nameArabic: 'الزلزلة' },
  { id: 100, nameEnglish: 'Al-\'Adiyat', nameArabic: 'العاديات' },
  { id: 101, nameEnglish: 'Al-Qari\'ah', nameArabic: 'القارعة' },
  { id: 102, nameEnglish: 'At-Takathur', nameArabic: 'التكاثر' },
  { id: 103, nameEnglish: 'Al-\'Asr', nameArabic: 'العصر' },
  { id: 104, nameEnglish: 'Al-Humazah', nameArabic: 'الهمزة' },
  { id: 105, nameEnglish: 'Al-Fil', nameArabic: 'الفيل' },
  { id: 106, nameEnglish: 'Quraysh', nameArabic: 'قريش' },
  { id: 107, nameEnglish: 'Al-Ma\'un', nameArabic: 'الماعون' },
  { id: 108, nameEnglish: 'Al-Kawthar', nameArabic: 'الكوثر' },
  { id: 109, nameEnglish: 'Al-Kafirun', nameArabic: 'الكافرون' },
  { id: 110, nameEnglish: 'An-Nasr', nameArabic: 'النصر' },
  { id: 111, nameEnglish: 'Al-Masad', nameArabic: 'المسد' },
  { id: 112, nameEnglish: 'Al-Ikhlas', nameArabic: 'الإخلاص' },
  { id: 113, nameEnglish: 'Al-Falaq', nameArabic: 'الفلق' },
  { id: 114, nameEnglish: 'An-Nas', nameArabic: 'الناس' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Extract current locale from pathname (default 'en')
  const locale = useMemo(() => {
    if (!pathname) return 'en';
    const match = pathname.match(/^\/(en|ar|ur)(\/|$)/);
    return match ? match[1] : 'en';
  }, [pathname]);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Direct Citation Syntax Parser
  const parseCitationQuery = useCallback(
    (raw: string): CommandItem[] => {
      const q = raw.trim().toLowerCase();
      const results: CommandItem[] = [];

      // 1. Ayah Syntax: e.g. "2:255" or "18:10"
      const ayahMatch = q.match(/^(\d{1,3}):(\d{1,3})$/);
      if (ayahMatch) {
        const surahNum = parseInt(ayahMatch[1], 10);
        const ayahNum = parseInt(ayahMatch[2], 10);
        if (surahNum >= 1 && surahNum <= 114) {
          const s = SURAH_DIRECTORY[surahNum - 1];
          results.push({
            id: `direct-ayah-${surahNum}-${ayahNum}`,
            title: `Surah ${s.nameEnglish} (${s.nameArabic}) — Ayah ${ayahNum}`,
            subtitle: `Jump directly to Ayah ${surahNum}:${ayahNum}`,
            category: 'Quran',
            href: `/${locale}/quran/${surahNum}#${ayahNum}`,
            badge: `${surahNum}:${ayahNum}`,
            icon: '📖',
          });
          results.push({
            id: `direct-tafsir-${surahNum}-${ayahNum}`,
            title: `Tafsir: ${s.nameEnglish} (${surahNum}:${ayahNum})`,
            subtitle: 'Comparative Exegesis (Ibn Kathir & As-Sa\'di)',
            category: 'Tafsir',
            href: `/${locale}/tafsir/${surahNum}/${ayahNum}`,
            badge: 'Tafsir',
            icon: '📜',
          });
        }
      }

      // 2. Hadith Syntax: e.g. "bukhari 1" or "muslim 42"
      const hadithMatch = q.match(/^(bukhari|muslim|abu-dawud|tirmidhi|nasai|ibn-majah)\s+(\d+)$/);
      if (hadithMatch) {
        const col = hadithMatch[1];
        const num = parseInt(hadithMatch[2], 10);
        results.push({
          id: `direct-hadith-${col}-${num}`,
          title: `${col.toUpperCase()} #${num}`,
          subtitle: `Open narration #${num} in ${col}`,
          category: 'Hadith',
          href: `/${locale}/hadith/${col}#${num}`,
          badge: col,
          icon: '📚',
        });
      }

      return results;
    },
    [locale]
  );

  // Standard Static Navigation & Feature Directory
  const baseItems = useMemo<CommandItem[]>(
    () => [
      {
        id: 'nav-quran',
        title: 'The Holy Quran (القرآن الكريم)',
        subtitle: 'Medina Mushaf with Word-by-Word & Tajweed',
        category: 'Quran',
        href: `/${locale}/quran`,
        icon: '📖',
        keywords: ['mushaf', 'quran', 'ayah', 'surah', 'tilawah'],
      },
      {
        id: 'nav-hadith',
        title: 'Kutub al-Sittah (كتب السنة الستة)',
        subtitle: 'Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa\'i, Ibn Majah',
        category: 'Hadith',
        href: `/${locale}/hadith`,
        icon: '📚',
        keywords: ['sunnah', 'hadith', 'bukhari', 'muslim', 'sanad', 'matn'],
      },
      {
        id: 'nav-prayer',
        title: 'Prayer Times & Qibla (مواقيت الصلاة)',
        subtitle: 'Astronomical calculations & Mecca compass direction',
        category: 'Prayer',
        href: `/${locale}/prayer-times`,
        icon: '🕌',
        keywords: ['salah', 'namaz', 'fajr', 'qibla', 'adhan', 'time'],
      },
      {
        id: 'nav-duas',
        title: 'Hisn al-Muslim (حصن المسلم)',
        subtitle: '268 Authentic daily supplications & morning/evening adhkar',
        category: 'Adhkar',
        href: `/${locale}/duas`,
        icon: '🤲',
        keywords: ['dua', 'adhkar', 'hisn', 'supplication', 'morning', 'evening'],
      },
      {
        id: 'nav-books',
        title: 'Digital Islamic Library (المكتبة الإسلامية)',
        subtitle: 'Classical treatises and verified manuscript metadata',
        category: 'Navigation',
        href: `/${locale}/books`,
        icon: '🏛️',
        keywords: ['books', 'library', 'kutub', 'manuscripts'],
      },
      {
        id: 'nav-articles',
        title: 'Articles & Scholarly Research',
        subtitle: 'Peer-reviewed Sunni Islamic research papers',
        category: 'Navigation',
        href: `/${locale}/articles`,
        icon: '✍️',
        keywords: ['articles', 'research', 'fatwa', 'scholarship'],
      },
    ],
    [locale]
  );

  // Filtered Results Calculation
  const filteredItems = useMemo<CommandItem[]>(() => {
    if (!query.trim()) {
      return baseItems;
    }

    const citationResults = parseCitationQuery(query);
    if (citationResults.length > 0) {
      return citationResults;
    }

    const q = query.toLowerCase().trim();

    // Search in Surah Directory
    const surahMatches: CommandItem[] = SURAH_DIRECTORY.filter(
      (s) =>
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        s.id.toString() === q
    )
      .slice(0, 8)
      .map((s) => ({
        id: `surah-${s.id}`,
        title: `Surah ${s.nameEnglish} (${s.nameArabic})`,
        subtitle: `Surah #${s.id} in Medina Mushaf`,
        category: 'Quran',
        href: `/${locale}/quran/${s.id}`,
        badge: `#${s.id}`,
        icon: '📖',
      }));

    // Search in Base Items
    const baseMatches = baseItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.some((k) => k.includes(q)))
      );
    });

    return [...surahMatches, ...baseMatches];
  }, [query, baseItems, parseCitationQuery, locale]);

  // Keyboard Navigation Handling (Arrow Up/Down, Enter)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          setIsOpen(false);
          router.push(selected.href);
        }
      }
    },
    [filteredItems, selectedIndex, router]
  );

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search Palette"
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '10vh 1rem 1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '1rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.25rem', opacity: 0.7 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search Quran (e.g. '2:255'), Hadith ('Bukhari 1'), or Surah name..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '1rem',
            }}
          />
          <kbd
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '0.5rem',
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              No matching scriptures or features found for &quot;{query}&quot;.
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#475569' }}>
                Tip: Try direct syntax like <code>2:255</code> or <code>Bukhari 1</code>.
              </div>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(5, 150, 105, 0.18)' : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(5, 150, 105, 0.4)'
                      : '1px solid transparent',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: isSelected ? '#34d399' : '#ffffff',
                        }}
                      >
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#cbd5e1',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '0.25rem',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>↵</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: '#020617',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.725rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div>ISLAM UL HARAMAIN</div>
        </div>
      </div>
    </div>
  );
}
