'use client';

/**
 * @file SeerahInteractiveTimeline.tsx
 * @package @islamic/web
 * @description Seerah & Tarikh: Authoritative Prophetic Biography interactive vertical timeline.
 *              Visually differentiates the Makkan period from the Madinan period with milestone nodes,
 *              expandable event cards, classical source attributions, and direct Quranic/Hadith citations.
 */

import React, { useState } from 'react';

export type SeerahPeriod = 'makkan' | 'madinan';

export interface SeerahMilestone {
  id: string;
  yearCe: number;
  yearAh?: number; // Hijri year (0 for year of Hijrah, 1-11 AH)
  period: SeerahPeriod;
  titleEnglish: string;
  titleArabic: string;
  shortSummary: string;
  detailedMarkdown: string;
  scripturalReferences?: Array<{
    type: 'quran' | 'hadith';
    citation: string;
    textExcerpt?: string;
  }>;
  significanceNotes: string;
}

export interface SeerahInteractiveTimelineProps {
  initialPeriod?: SeerahPeriod | 'all';
  className?: string;
}

export const CANONICAL_SEERAH_EVENTS: SeerahMilestone[] = [
  // Makkan Period
  {
    id: 'birth-prophet',
    yearCe: 570,
    period: 'makkan',
    titleEnglish: 'Birth of the Prophet Muhammad ﷺ & Year of the Elephant',
    titleArabic: 'مولد النبي ﷺ وعام الفيل',
    shortSummary: 'Born in Makkah al-Mukarramah to Aminah bint Wahb and Abdullah ibn Abd al-Muttalib.',
    detailedMarkdown:
      'The Prophet ﷺ was born into the noble Banu Hashim clan of the Quraysh tribe in the Year of the Elephant. His father passed away before his birth, and his mother passed away when he was six years of age.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Al-Fil 105:1-5' },
      { type: 'quran', citation: 'Surah Ad-Duha 93:6', textExcerpt: 'Did He not find you an orphan and give you refuge?' },
    ],
    significanceNotes: 'Fulfillment of the ancient prayer of Ibrahim (AS) for a prophet among his progeny.',
  },
  {
    id: 'first-revelation',
    yearCe: 610,
    period: 'makkan',
    titleEnglish: 'The First Revelation in Cave Hira',
    titleArabic: 'بدء الوحي في غار حراء',
    shortSummary: 'The descent of Jibril (AS) with the first five verses of Surah Al-Alaq during Ramadan.',
    detailedMarkdown:
      'While engaged in secluded contemplation (Tahannuth) in the Cave of Hira atop Jabal al-Nur, the Archangel Jibril appeared commanding him: "Iqra!" (Recite/Read!). The inception of the final Divine revelation to humanity.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Al-Alaq 96:1-5' },
      { type: 'hadith', citation: 'Sahih al-Bukhari #3', textExcerpt: 'Narrated by Aisha (RA): The commencement of the Divine Inspiration to Allah\'s Messenger was in the form of good dreams...' },
    ],
    significanceNotes: 'Marked the beginning of Prophethood (Nubuwwah) at age forty.',
  },
  {
    id: 'public-dawah',
    yearCe: 613,
    period: 'makkan',
    titleEnglish: 'Proclamation of Open Dawah at Mount Safa',
    titleArabic: 'الجهر بالدعوة على جبل الصفا',
    shortSummary: 'Transition from secret calling to open proclamation from the summit of Mount Safa.',
    detailedMarkdown:
      'Following the revelation of "And warn your closest kin" (Ash-Shu\'ara 26:214), the Prophet ﷺ mounted Mount Safa, summoned the Quraysh clans, and proclaimed the oneness of Allah (Tawheed), facing immediate opposition from Abu Lahab.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Ash-Shu\'ara 26:214' },
      { type: 'hadith', citation: 'Sahih al-Bukhari #4770' },
    ],
    significanceNotes: 'Initiation of open Islamic proselytization and subsequent Quraysh persecution.',
  },
  {
    id: 'isra-miraj',
    yearCe: 621,
    period: 'makkan',
    titleEnglish: 'Al-Isra\' wal-Mi\'raj (The Night Journey & Heavenly Ascension)',
    titleArabic: 'الإسراء والمعراج',
    shortSummary: 'Miraculous journey from Makkah to Jerusalem, and ascension to the Divine presence.',
    detailedMarkdown:
      'The miraculous nocturnal journey from the Sacred Mosque (Makkah) to Al-Aqsa Mosque (Jerusalem), followed by the celestial ascension through the seven heavens up to Sidrat al-Muntaha, where the five daily prayers (Salah) were ordained.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Al-Isra 17:1', textExcerpt: 'Glory be to the One Who took His servant by night from the Sacred Mosque to the Farthest Mosque...' },
      { type: 'quran', citation: 'Surah An-Najm 53:1-18' },
      { type: 'hadith', citation: 'Sahih Muslim #162' },
    ],
    significanceNotes: 'Establishment of the second pillar of Islam: the five prescribed daily prayers.',
  },
  {
    id: 'hijrah-madinah',
    yearCe: 622,
    yearAh: 1,
    period: 'makkan',
    titleEnglish: 'The Great Hijrah to Yathrib (Madinah al-Munawwarah)',
    titleArabic: 'الهجرة النبوية المباركة إلى المدينة',
    shortSummary: 'Migration accompanied by Abu Bakr as-Siddiq (RA), marking Year 1 of the Islamic Calendar.',
    detailedMarkdown:
      'In response to divine command and escalating assassination plots in Makkah, the Prophet ﷺ and Abu Bakr migrated across the desert, taking sanctuary in Cave Thawr before entering Quba and Yathrib, which was renamed Al-Madinah al-Munawwarah.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah At-Tawbah 9:40', textExcerpt: 'When the two were in the cave, he said to his companion: "Do not grieve; indeed Allah is with us."' },
    ],
    significanceNotes: 'Founding of the Islamic state and starting point of the Hijri calendar.',
  },

  // Madinan Period
  {
    id: 'charter-madinah',
    yearCe: 622,
    yearAh: 1,
    period: 'madinan',
    titleEnglish: 'The Constitution of Madinah (Dustur al-Madinah)',
    titleArabic: 'وثيقة المدينة المنورة',
    shortSummary: 'The first written constitutional charter establishing brotherhood (Mu\'akhah) and civic rights.',
    detailedMarkdown:
      'A formal constitutional pact uniting the Muhajirun (Emigrants), Ansar (Helpers), and Jewish tribes into a unified civic federation (Ummah), guaranteeing religious freedom and mutual defense.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Al-Hujurat 49:10', textExcerpt: 'The believers are but brothers...' },
    ],
    significanceNotes: 'Pioneering constitutional governance and inter-communal civic protection.',
  },
  {
    id: 'battle-badr',
    yearCe: 624,
    yearAh: 2,
    period: 'madinan',
    titleEnglish: 'The Decisive Battle of Badr (Ghazwat Badr al-Kubra)',
    titleArabic: 'غزوة بدر الكبرى (يوم الفرقان)',
    shortSummary: 'The momentous victory of 313 believers against 1,000 Quraysh warriors on the 17th of Ramadan.',
    detailedMarkdown:
      'Designated in the Quran as Yawm al-Furqan (The Day of Criterion). Despite being vastly outnumbered and lightly armored, the Muslim army triumphed through steadfast prayer and angelic reinforcement.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Ali \'Imran 3:123', textExcerpt: 'And Allah had already given you victory at Badr when you were few in number...' },
      { type: 'quran', citation: 'Surah Al-Anfal 8:9-19' },
    ],
    significanceNotes: 'Established the political and military viability of the fledgling Islamic community.',
  },
  {
    id: 'treaty-hudaybiyyah',
    yearCe: 628,
    yearAh: 6,
    period: 'madinan',
    titleEnglish: 'The Treaty of Hudaybiyyah (Sulh al-Hudaybiyyah)',
    titleArabic: 'صلح الحديبية والفتح المبين',
    shortSummary: 'Ten-year peace treaty described by Allah in the Quran as a manifest victory (Fath Mubin).',
    detailedMarkdown:
      'A diplomatic non-aggression pact between the Muslims and the Quraysh leadership, allowing peaceful intermingling that resulted in unprecedented voluntary conversions across Arabia.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Al-Fath 48:1', textExcerpt: 'Indeed, We have given you a clear conquest.' },
    ],
    significanceNotes: 'Diplomatic breakthrough that paved the way for the peaceful unification of Arabia.',
  },
  {
    id: 'conquest-makkah',
    yearCe: 630,
    yearAh: 8,
    period: 'madinan',
    titleEnglish: 'The Peaceful Opening of Makkah (Fath Makkah)',
    titleArabic: 'فتح مكة وتطهير البيت الحرام',
    shortSummary: 'Bloodless conquest of Makkah, destruction of 360 idols, and universal pardon for the Quraysh.',
    detailedMarkdown:
      'The Prophet ﷺ entered his birthplace in supreme humility with his head bowed. He cleansed the Kaaba of all 360 pagan idols while reciting: "Truth has come and falsehood has vanished." He declared universal amnesty: "Go, for you are free."',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Al-Isra 17:81' },
      { type: 'quran', citation: 'Surah An-Nasr 110:1-3' },
    ],
    significanceNotes: 'Purification of the Kaaba as the monotheistic center of global Islamic worship.',
  },
  {
    id: 'farewell-pilgrimage',
    yearCe: 632,
    yearAh: 10,
    period: 'madinan',
    titleEnglish: 'The Farewell Pilgrimage & Universal Sermon (Hajjat al-Wada\')',
    titleArabic: 'حجة الوداع وخطبة عرفات',
    shortSummary: 'Final sermon atop Mount Arafat enshrining human dignity, abolition of usury, and racial equality.',
    detailedMarkdown:
      'Over 100,000 Muslims gathered at Mount Arafat. The Prophet ﷺ delivered the historic Farewell Sermon: "An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab... except by Taqwa." The final verse of religion completion was revealed.',
    scripturalReferences: [
      { type: 'quran', citation: 'Surah Al-Ma\'idah 5:3', textExcerpt: 'This day I have perfected for you your religion and completed My favor upon you...' },
      { type: 'hadith', citation: 'Sahih Muslim #1218' },
    ],
    significanceNotes: 'The constitutional culmination of Islamic legislation and human rights charter.',
  },
];

export function SeerahInteractiveTimeline({
  initialPeriod = 'all',
  className = '',
}: SeerahInteractiveTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<SeerahPeriod | 'all'>(initialPeriod);
  const [expandedEventId, setExpandedEventId] = useState<string | null>('first-revelation');

  const filteredEvents = CANONICAL_SEERAH_EVENTS.filter((e) => {
    if (activeFilter === 'all') return true;
    return e.period === activeFilter;
  });

  return (
    <div
      className={`seerah-timeline-container ${className}`}
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1.25rem',
        padding: '2rem 1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* 1. Header & Period Filter Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Chronological Seerah Timeline (السيرة النبوية)
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.825rem', color: '#94a3b8' }}>
            Interactive historical milestones across the Makkan (610–622 CE) and Madinan (622–632 CE) eras.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#020617', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.775rem',
              fontWeight: 700,
              backgroundColor: activeFilter === 'all' ? '#059669' : 'transparent',
              color: activeFilter === 'all' ? '#ffffff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            All Eras
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('makkan')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.775rem',
              fontWeight: 700,
              backgroundColor: activeFilter === 'makkan' ? '#d97706' : 'transparent',
              color: activeFilter === 'makkan' ? '#ffffff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Makkan Era (العهد المكي)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('madinan')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '0.375rem',
              fontSize: '0.775rem',
              fontWeight: 700,
              backgroundColor: activeFilter === 'madinan' ? '#3b82f6' : 'transparent',
              color: activeFilter === 'madinan' ? '#ffffff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Madinan Era (العهد المدني)
          </button>
        </div>
      </div>

      {/* 2. Vertical Timeline Container */}
      <div style={{ position: 'relative', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Continuous Center Rail Line */}
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            bottom: '0.5rem',
            left: '27px',
            width: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            zIndex: 1,
          }}
        />

        {filteredEvents.map((event) => {
          const isExpanded = expandedEventId === event.id;
          const isMakkan = event.period === 'makkan';
          const badgeColor = isMakkan ? '#fbbf24' : '#60a5fa';
          const badgeBg = isMakkan ? 'rgba(217, 119, 6, 0.15)' : 'rgba(59, 130, 246, 0.15)';
          const nodeColor = isMakkan ? '#d97706' : '#2563eb';

          return (
            <div
              key={event.id}
              style={{
                position: 'relative',
                paddingLeft: '2.5rem',
                zIndex: 2,
              }}
            >
              {/* Timeline Pin Node */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '0.25rem',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#020617',
                  border: `3px solid ${nodeColor}`,
                  boxShadow: `0 0 10px ${nodeColor}`,
                }}
              />

              {/* Event Card */}
              <div
                onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                style={{
                  backgroundColor: '#020617',
                  border: isExpanded ? `1px solid ${nodeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Milestone Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: badgeColor,
                          backgroundColor: badgeBg,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '0.25rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {isMakkan ? 'Makkan' : 'Madinan'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                        {event.yearCe} CE {event.yearAh ? `• ${event.yearAh} AH` : ''}
                      </span>
                    </div>
                    <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                      {event.titleEnglish}
                    </h3>
                    <div dir="rtl" style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 600 }}>
                      {event.titleArabic}
                    </div>
                  </div>

                  <span style={{ fontSize: '0.8rem', color: '#64748b', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s ease' }}>
                    ▶
                  </span>
                </div>

                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  {event.shortSummary}
                </p>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.7 }}>
                      {event.detailedMarkdown}
                    </p>

                    {/* Scriptural References */}
                    {event.scripturalReferences && event.scripturalReferences.length > 0 && (
                      <div
                        style={{
                          padding: '0.85rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
                          Primary Scriptural Evidence (الاستدلال القرآني والحديثي):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {event.scripturalReferences.map((ref, idx) => (
                            <div key={idx} style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                              <strong style={{ color: '#ffffff' }}>{ref.citation}</strong>
                              {ref.textExcerpt && (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', marginTop: '0.15rem' }}>
                                  &quot;{ref.textExcerpt}&quot;
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                      <strong>Theological Significance: </strong>
                      <span style={{ color: '#cbd5e1' }}>{event.significanceNotes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
