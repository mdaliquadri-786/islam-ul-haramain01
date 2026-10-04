/**
 * @file page.tsx
 * @package @islamic/web
 * @description Main Spiritual Purification (Tasawwuf & Tazkiyat an-Nafs) portal (Server Component).
 *              Presents authoritative classical Sunni treatises in an immersive dual-language
 *              reader environment with sticky TOC navigation and progress tracking.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { isSupportedLocale, type Locale } from '@islamic/ui';
import {
  ClassicalTextReader,
  type ClassicalBookMetadata,
  type ClassicalBookSection,
} from '@/components/tasawwuf/ClassicalTextReader';
import type { Metadata } from 'next';
import { constructPageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale: Locale = isSupportedLocale(locale) ? (locale as Locale) : 'en';

  const title =
    typedLocale === 'ar'
      ? 'تزكية النفس والتصوف السني — إحياء علوم الدين والحكم العطائية'
      : typedLocale === 'ur'
      ? 'تزکیہ نفس و تصوف — احیاء علوم الدین اور کتب سلف کا تحقیقی مطالعہ'
      : 'Spiritual Purification (Tazkiyah & Tasawwuf) | ISLAM UL HARAMAIN';

  const description =
    typedLocale === 'ar'
      ? 'مكتبة تفاعلية محققة لكتب التزكية والرقائق على مذهب أهل السنة والجماعة، تتضمن نصوص الإمام الغزالي وابن عطاء الله السكندري.'
      : typedLocale === 'ur'
      ? 'تزکیہ نفس اور تصوف پر اہل سنت والجماعت کے مستند ائمہ کرام کی کتب کا دو لسانی تحقیقی مطالعہ۔'
      : 'Bilingual reader and scholarly catalog of classical Islamic treatises on inner purification, sincerity, and ethical refinement.';

  return constructPageMetadata({
    title,
    description,
    path: '/tasawwuf',
    locale: typedLocale,
  });
}

// ---------------------------------------------------------------------------
// Canonical Classical Works Data
// ---------------------------------------------------------------------------
const PRIMARY_BOOK: ClassicalBookMetadata = {
  id: 'ihya-ulum-al-din',
  slug: 'ihya-ulum-al-din',
  titleEnglish: "Ihya' 'Ulum al-Din (Revival of the Religious Sciences)",
  titleArabic: 'إحياء علوم الدين',
  authorEnglish: 'Hujjat al-Islam Abu Hamid al-Ghazali',
  authorArabic: 'حجة الإسلام أبو حامد الغزالي رحمه الله',
  deathYearAh: 505,
  description:
    'The magnum opus of Islamic spiritual psychology, synthesizing orthodox Sunni jurisprudence (Fiqh) with introspective spiritual ethics (Tasawwuf) to awaken inner sincerity in worship.',
};

const PRIMARY_SECTIONS: ClassicalBookSection[] = [
  {
    id: 'bayan-al-ikhlas',
    chapterNumber: 1,
    titleEnglish: 'On the Reality of Sincerity (Al-Ikhlas) and Pure Intention',
    titleArabic: 'بيان حقيقة الإخلاص وصدق النية',
    paragraphs: [
      {
        id: 'p-1-1',
        textArabic: 'اعْلَمْ أَنَّ الْأَعْمَالَ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، وَأَنَّ الإِخْلَاصَ هُوَ تَجْرِيدُ قَصْدِ التَّقَرُّبِ إِلَى اللَّهِ تَعَالَى عَنْ كُلِّ شَوْبٍ وَعَرَضٍ دُنْيَوِيٍّ.',
        textEnglish: 'Know that deeds are judged exclusively by intentions, and every person shall only receive what they intended. Sincerity (al-Ikhlas) is the absolute purification of the intention to draw near to Allah the Exalted from any admixture of worldly motive or egoistic gain.',
      },
      {
        id: 'p-1-2',
        textArabic: 'وَالشَّوْبُ الَّذِي يُكَدِّرُ صَفَاءَ الْقَلْبِ قَدْ يَكُونُ طَلَبَ مَحْمَدَةٍ بَيْنَ الْخَلْقِ، أَوْ فِرَاراً مِنْ مَذَمَّةٍ، أَوِ الْتِمَاساً لِعِزٍّ وَوَجَاهَةٍ، وَكُلُّ ذَلِكَ يَسْلُبُ الْعَمَلَ بَرَكَتَهُ وَيُفْسِدُ قَبُولَهُ.',
        textEnglish: 'The impurities that cloud the heart’s serenity often stem from craving praise among people, fleeing from criticism, or seeking social prestige. All such motives drain an action of its spiritual blessing and corrupt its acceptance before the Divine.',
      },
      {
        id: 'p-1-3',
        textArabic: 'فَالصِّدْقُ فِي الْقَصْدِ مِعْيَارُ النَّجَاةِ، وَعَلَى قَدْرِ صَفَاءِ النِّيَّةِ تَتَنَزَّلُ الْمَعُونَةُ الرَّبَّانِيَّةُ عَلَى قَلْبِ السَّالِكِ.',
        textEnglish: 'Truthfulness in purpose is the ultimate standard of spiritual salvation; in direct proportion to the purity of one’s inner intention does divine assistance descend upon the heart of the seeker.',
      },
    ],
  },
  {
    id: 'muraqabah-wa-muhasabah',
    chapterNumber: 2,
    titleEnglish: 'On Vigilance (Al-Muraqabah) and Self-Examination (Al-Muhasabah)',
    titleArabic: 'في المراقبة ومحاسبة النفس',
    paragraphs: [
      {
        id: 'p-2-1',
        textArabic: 'حَقِيقَةُ الْمُرَاقَبَةِ هِيَ مُلَاحَظَةُ الرَّقِيبِ سُبْحَانَهُ وَانْصِرَافُ الْهِمَّةِ إِلَيْهِ؛ فَمَنْ عَلِمَ أَنَّ اللَّهَ مُطَّلِعٌ عَلَى سِرِّهِ اسْتَحْيَا أَنْ يَرَاهُ حَيْثُ نَهَاهُ.',
        textEnglish: 'The essence of spiritual vigilance (al-Muraqabah) is mindful awareness of the Divine Watcher, the Glorified, directing the heart’s resolve entirely toward Him. Whoever recognizes that Allah observes their hidden thoughts feels profound reverence, fearing to be seen where prohibited.',
      },
      {
        id: 'p-2-2',
        textArabic: 'وَالْمُحَاسَبَةُ هِيَ أَنْ يُقَاسَ مَا كَانَ مِنْهُ فِي يَوْمِهِ وَلَيْلَتِهِ بِمِيزَانِ الشَّرْعِ الْحَنِيفِ، فَيَسْتَغْفِرَ عَمَّا زَلَّ، وَيَحْمَدَ اللَّهَ عَلَى مَا وُفِّقَ إِلَيْهِ مِنْ طَاعَةٍ.',
        textEnglish: 'Self-examination (al-Muhasabah) consists of weighing one’s thoughts and conduct throughout the day and night against the balance of sacred law (al-Shari’ah), seeking forgiveness for lapses and expressing gratitude to Allah for granted obedience.',
      },
    ],
  },
  {
    id: 'afatal-lisan',
    chapterNumber: 3,
    titleEnglish: 'Disciplining the Tongue and Guarding the Heart',
    titleArabic: 'آفات اللسان وصيانة الجنان',
    paragraphs: [
      {
        id: 'p-3-1',
        textArabic: 'اللِّسَانُ صَغِيرٌ جِرْمُهُ، عَظِيمٌ طَاعَتُهُ وَجُرْمُهُ؛ إِذْ لَا يَسْتَبِينُ الْكُفْرُ وَالإِيمَانُ إِلَّا بِشَهَادَتِهِ، وَهُوَ أَعْصَى الْجَوَارِحِ إِذْ لَا تَعَبَ فِي حَرَكَتِهِ وَلَا مَؤُونَةَ فِي إِطْلَاقِهِ.',
        textEnglish: 'The tongue is small in physical size, yet immense in its obedience or offense. Faith and disbelief are voiced through its testimony, and it is the most difficult limb to restrain because movement requires no physical fatigue nor material cost.',
      },
      {
        id: 'p-3-2',
        textArabic: 'فَمَنْ مَلَكَ لِسَانَهُ مَلَكَ زِمَامَ نَفْسِهِ، وَمَنْ أَرْخَى لَهُ الْعِنَانَ قَادَهُ إِلَى مَهَالِكِ الْغِيبَةِ وَالنَّمِيمَةِ وَالْبُهْتَانِ، نَعُوذُ بِاللَّهِ مِنْ شُرُورِ أَنْفُسِنَا.',
        textEnglish: 'Whoever masters their speech secures dominion over their soul; whoever loosens its rein is driven toward the ruinous pits of backbiting, slander, and falsehood. We seek refuge in Allah from the evils of our lower selves.',
      },
    ],
  },
];

const TREATISE_CATALOG = [
  {
    id: 'ihya',
    title: "Ihya' 'Ulum al-Din",
    arabicTitle: 'إحياء علوم الدين',
    author: 'Imam al-Ghazali (d. 505 AH)',
    category: 'Spiritual Psychology & Ethics',
    badge: 'Core Curriculum',
    accent: '#10b981',
  },
  {
    id: 'hikam',
    title: "Al-Hikam al-'Ata'iyyah",
    arabicTitle: 'الحكم العطائية',
    author: "Ibn 'Ata' Allah al-Iskandari (d. 709 AH)",
    category: 'Aphorisms on Tawhid & Reliance',
    badge: 'Meditative Wisdom',
    accent: '#d97706',
  },
  {
    id: 'tahdhib',
    title: 'Tahdhib al-Nufus',
    arabicTitle: 'تهذيب النفوس',
    author: 'Imam Ibn Qudamah al-Maqdisi (d. 620 AH)',
    category: 'Hanbali Asceticism & Character',
    badge: 'Hanbali Tradition',
    accent: '#3b82f6',
  },
  {
    id: 'tahawiyyah',
    title: "Al-'Aqidah al-Tahawiyyah",
    arabicTitle: 'العقيدة الطحاوية',
    author: 'Imam Abu Ja’far al-Tahawi (d. 321 AH)',
    category: 'Orthodox Sunni Creed',
    badge: 'Foundational Dogma',
    accent: '#8b5cf6',
  },
];

export default async function TasawwufLandingPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      {/* 1. Scholarly Hero Banner */}
      <section
        style={{
          padding: '3rem 2rem',
          backgroundColor: '#0f172a',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          marginBottom: '2.5rem',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'inline-block',
            marginBottom: '1rem',
          }}
        >
          {locale === 'ar' ? 'تزكية النفس والرقائق الإيمانية' : 'ULUM AL-HAQIQAH & TAZKIYAH'}
        </span>

        <h1
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#f8fafc',
            margin: '0 0 1rem 0',
            fontFamily: 'var(--font-heading, inherit)',
          }}
        >
          {locale === 'ar'
            ? 'مكتبة التزكية والسلوك السني'
            : locale === 'ur'
            ? 'تزکیہ نفس اور اخلاقیات کا تحقیقی نصاب'
            : 'Spiritual Purification & Ethical Refinement'}
        </h1>

        <p
          style={{
            maxWidth: '820px',
            margin: '0 auto',
            fontSize: '1.05rem',
            lineHeight: 1.7,
            color: '#94a3b8',
          }}
        >
          {locale === 'ar'
            ? 'منهج أهل السنة والجماعة في إصلاح البواطن ومجاهدة النفس، مبني على توثيق الدليل القرآني والاتباع النبوي الشريف بعيداً عن الغلو والبدع.'
            : locale === 'ur'
            ? 'قرآن و سنت کی روشنی میں قلب و باطن کی صفائی اور معرفتِ الہی کے لیے ائمہ سلف کے معتمد رسائل کا محققانہ مطالعہ۔'
            : 'Explore authoritative classical treatises on Tazkiyat an-Nafs (inward purification) and Ihsan (spiritual excellence), grounded in the Quran and verified Prophetic Sunnah of Ahl al-Sunnah wal-Jama’ah.'}
        </p>

        {/* Scholarly Orthodoxy Notice */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            color: '#6ee7b7',
          }}
        >
          <span style={{ fontSize: '1rem' }}>⚖️</span>
          <span>
            {locale === 'ar'
              ? 'جميع النصوص مضبوطة بقواعد الشريعة المطهرة وكلام أئمة التحقيق المعتمدين.'
              : 'All texts strictly adhered to orthodox Sunni methodology, guided by the Shari’ah.'}
          </span>
        </div>
      </section>

      {/* 2. Classical Library Catalog Cards */}
      <section style={{ marginBottom: '3rem' }}>
        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>📚</span>
          <span>{locale === 'ar' ? 'أمهات كتب التزكية المحققة' : 'Authoritative Treatises & Curricula'}</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {TREATISE_CATALOG.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: item.accent,
                      backgroundColor: `${item.accent}15`,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.25rem',
                    }}
                  >
                    {item.badge}
                  </span>
                  <span
                    dir="rtl"
                    style={{
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-amiri, serif)',
                      color: '#cbd5e1',
                    }}
                  >
                    {item.arabicTitle}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    margin: '0 0 0.35rem 0',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: '#94a3b8',
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  {item.author}
                </p>
                <p
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748b',
                    margin: 0,
                  }}
                >
                  {item.category}
                </p>
              </div>

              <div
                style={{
                  marginTop: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '0.8rem',
                  color: item.accent,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <span>{locale === 'ar' ? 'قيد التصفح أدناه' : 'Interactive Reader Loaded'}</span>
                <span>↓</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Classical Text Reader Embed */}
      <section>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '0 0 0.25rem 0',
            }}
          >
            {locale === 'ar' ? 'النص المحقق — دراسة متأنية' : 'Bilingual Study Reader'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>
            {locale === 'ar'
              ? 'قراءة تفاعلية ثنائية اللغة مع جدول محتويات ذكي ومؤشر تقدم مستمر.'
              : 'Interactive paragraph-by-paragraph presentation with responsive sticky Table of Contents.'}
          </p>
        </div>

        <ClassicalTextReader book={PRIMARY_BOOK} sections={PRIMARY_SECTIONS} />
      </section>
    </div>
  );
}
