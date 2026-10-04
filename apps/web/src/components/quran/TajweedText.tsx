'use client';

/**
 * @file TajweedText.tsx
 * @package @islamic/web
 * @description Authoritative Tajweed visualization component. Parses Arabic Ayah text with
 *              Tajweed annotation markers or automatic phonetic rules (Qalqalah, Ghunnah,
 *              Idgham, Iqlab, Ikhfa, Madd) and wraps letters in accessible, theme-reactive
 *              spans backed by CSS variables (var(--tajweed-ikhfa), etc.).
 */

import React, { useMemo } from 'react';

export type TajweedRuleType =
  | 'ghunnah'
  | 'idgham'
  | 'iqlab'
  | 'ikhfa'
  | 'qalqalah'
  | 'madd'
  | 'hamzah_wasl'
  | 'silent'
  | 'normal';

export interface TajweedSegment {
  text: string;
  rule: TajweedRuleType;
  ruleNameEnglish: string;
  ruleNameArabic: string;
}

export interface TajweedTextProps {
  text: string;
  fontSize?: string | number;
  className?: string;
  showLegend?: boolean;
  interactiveTooltips?: boolean;
}

export const TAJWEED_RULES_METADATA: Record<
  TajweedRuleType,
  {
    nameEnglish: string;
    nameArabic: string;
    cssVar: string;
    fallbackColor: string;
    description: string;
  }
> = {
  ghunnah: {
    nameEnglish: 'Ghunnah (Nasalization)',
    nameArabic: 'غنة مشددة',
    cssVar: 'var(--tajweed-ghunnah, #16a34a)',
    fallbackColor: '#16a34a',
    description: 'Holding sound in nasal cavity for 2 counts on Noon or Meem Mushaddadah.',
  },
  idgham: {
    nameEnglish: 'Idgham (Assimilation)',
    nameArabic: 'إدغام',
    cssVar: 'var(--tajweed-idgham, #2563eb)',
    fallbackColor: '#2563eb',
    description: 'Merging Noon Saakinah or Tanween into letters of يرملون.',
  },
  iqlab: {
    nameEnglish: 'Iqlab (Conversion)',
    nameArabic: 'إقلاب',
    cssVar: 'var(--tajweed-iqlab, #9333ea)',
    fallbackColor: '#9333ea',
    description: 'Transforming Noon Saakinah into hidden Meem when preceding Ba.',
  },
  ikhfa: {
    nameEnglish: 'Ikhfa (Concealment)',
    nameArabic: 'إخفاء حقيقي',
    cssVar: 'var(--tajweed-ikhfa, #d97706)',
    fallbackColor: '#d97706',
    description: 'Concealing Noon Saakinah or Tanween before the 15 Ikhfa letters with Ghunnah.',
  },
  qalqalah: {
    nameEnglish: 'Qalqalah (Echoing / Bouncing)',
    nameArabic: 'قلقلة',
    cssVar: 'var(--tajweed-qalqalah, #dc2626)',
    fallbackColor: '#dc2626',
    description: 'Bouncing vibration on letters of (ق ط ب ج د) when Saakin.',
  },
  madd: {
    nameEnglish: 'Madd (Elongation)',
    nameArabic: 'مد لازم / متصل / منفصل',
    cssVar: 'var(--tajweed-madd, #ea580c)',
    fallbackColor: '#ea580c',
    description: 'Prolonging vowels for 4, 5, or 6 counts.',
  },
  hamzah_wasl: {
    nameEnglish: 'Hamzat al-Wasl',
    nameArabic: 'همزة وصل',
    cssVar: 'var(--tajweed-wasl, #64748b)',
    fallbackColor: '#64748b',
    description: 'Connecting hamzah dropped during continuous recitation.',
  },
  silent: {
    nameEnglish: 'Silent Letters',
    nameArabic: 'حروف مهملة / لا تلفظ',
    cssVar: 'var(--tajweed-silent, #475569)',
    fallbackColor: '#475569',
    description: 'Written letters not vocalized in recitation.',
  },
  normal: {
    nameEnglish: 'Standard',
    nameArabic: 'نطق أصلي',
    cssVar: 'inherit',
    fallbackColor: 'inherit',
    description: 'Standard natural pronunciation.',
  },
};

/**
 * Parses annotated Tajweed tokens (e.g. [ikhfa]مِن قَبْلِ[/ikhfa] or <tajweed class="qalqalah">... tags)
 * or falls back to standard phonetic Tajweed pattern parsing.
 */
function parseTajweedText(rawText: string): TajweedSegment[] {
  if (!rawText) return [];

  // 1. Check for XML/Bracket markup: [rule]text[/rule]
  const tagRegex = /\[([a-z_]+)\]([\s\S]*?)\[\/\1\]/gi;
  if (tagRegex.test(rawText)) {
    const segments: TajweedSegment[] = [];
    let lastIndex = 0;
    tagRegex.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(rawText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          text: rawText.slice(lastIndex, match.index),
          rule: 'normal',
          ruleNameEnglish: 'Standard',
          ruleNameArabic: 'نطق أصلي',
        });
      }

      const ruleKey = match[1].toLowerCase() as TajweedRuleType;
      const validRule = TAJWEED_RULES_METADATA[ruleKey] ? ruleKey : 'normal';
      segments.push({
        text: match[2],
        rule: validRule,
        ruleNameEnglish: TAJWEED_RULES_METADATA[validRule].nameEnglish,
        ruleNameArabic: TAJWEED_RULES_METADATA[validRule].nameArabic,
      });

      lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      segments.push({
        text: rawText.slice(lastIndex),
        rule: 'normal',
        ruleNameEnglish: 'Standard',
        ruleNameArabic: 'نطق أصلي',
      });
    }

    return segments;
  }

  // 2. Phonetic Rule-based Tokenizer (Standard Uthmani Text)
  // Detects:
  // - Madd (~ or Maddah: U+0653, U+06E4)
  // - Qalqalah letters: ق, ط, ب, ج, د followed by Sukoon (U+0652) or at word-end
  // - Ghunnah: Noon/Meem with Shaddah (ّ U+0651)
  // - Iqlab marker: Small High Meem (ۢ U+06E2)
  const segments: TajweedSegment[] = [];
  const words = rawText.split(' ');

  words.forEach((word, wordIdx) => {
    let currentSegmentText = '';
    let currentRule: TajweedRuleType = 'normal';

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const nextChar = word[i + 1] || '';
      let detectedRule: TajweedRuleType | null = null;

      // Madd Check (Letter followed by Maddah ~ or U+0653)
      if (char === '\u0653' || nextChar === '\u0653' || char === '~' || char === '\u06E4') {
        detectedRule = 'madd';
      }
      // Iqlab Check (Small High Meem)
      else if (char === '\u06E2' || nextChar === '\u06E2') {
        detectedRule = 'iqlab';
      }
      // Ghunnah Check (Noon or Meem followed by Shaddah)
      else if (
        (char === 'ن' || char === 'م') &&
        (nextChar === '\u0651' || word[i + 2] === '\u0651')
      ) {
        detectedRule = 'ghunnah';
      }
      // Qalqalah Check (قطبجد followed by Sukoon U+0652)
      else if (
        ['ق', 'ط', 'ب', 'ج', 'د'].includes(char) &&
        (nextChar === '\u0652' || i === word.length - 1)
      ) {
        detectedRule = 'qalqalah';
      }

      if (detectedRule && detectedRule !== currentRule) {
        if (currentSegmentText) {
          segments.push({
            text: currentSegmentText,
            rule: currentRule,
            ruleNameEnglish: TAJWEED_RULES_METADATA[currentRule].nameEnglish,
            ruleNameArabic: TAJWEED_RULES_METADATA[currentRule].nameArabic,
          });
        }
        currentSegmentText = char;
        currentRule = detectedRule;
      } else {
        currentSegmentText += char;
      }
    }

    if (currentSegmentText) {
      segments.push({
        text: currentSegmentText,
        rule: currentRule,
        ruleNameEnglish: TAJWEED_RULES_METADATA[currentRule].nameEnglish,
        ruleNameArabic: TAJWEED_RULES_METADATA[currentRule].nameArabic,
      });
    }

    // Add inter-word space
    if (wordIdx < words.length - 1) {
      segments.push({
        text: ' ',
        rule: 'normal',
        ruleNameEnglish: 'Space',
        ruleNameArabic: 'فراغ',
      });
    }
  });

  return segments;
}

export function TajweedText({
  text,
  fontSize = '2rem',
  className = '',
  showLegend = false,
  interactiveTooltips = true,
}: TajweedTextProps) {
  const segments = useMemo(() => parseTajweedText(text), [text]);

  return (
    <div className={`tajweed-container ${className}`} style={{ display: 'inline-block', width: '100%' }}>
      {/* 1. Rendered Tajweed Calligraphy */}
      <span
        dir="rtl"
        style={{
          fontSize,
          lineHeight: '2.8',
          fontFamily:
            'var(--quran-font-family, "UthmanicHafs", "Amiri", "Traditional Arabic", serif)',
          display: 'inline',
          textAlign: 'justify',
        }}
      >
        {segments.map((seg, idx) => {
          if (seg.rule === 'normal' || seg.text === ' ') {
            return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
          }

          const meta = TAJWEED_RULES_METADATA[seg.rule];
          return (
            <span
              key={idx}
              className={`tajweed-mark tajweed-${seg.rule}`}
              title={interactiveTooltips ? `${meta.nameArabic} (${meta.nameEnglish}): ${meta.description}` : undefined}
              style={{
                color: meta.cssVar,
                fontWeight: seg.rule === 'madd' || seg.rule === 'ghunnah' ? 700 : 'inherit',
                textDecoration: 'none',
                position: 'relative',
                display: 'inline',
                transition: 'opacity 0.15s ease',
              }}
            >
              {seg.text}
            </span>
          );
        })}
      </span>

      {/* 2. Optional Tajweed Legend Capsule */}
      {showLegend && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#020617',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '0.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.75rem',
          }}
        >
          {(
            ['ghunnah', 'idgham', 'iqlab', 'ikhfa', 'qalqalah', 'madd'] as TajweedRuleType[]
          ).map((ruleKey) => {
            const meta = TAJWEED_RULES_METADATA[ruleKey];
            return (
              <div key={ruleKey} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: meta.fallbackColor,
                    display: 'inline-block',
                  }}
                />
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{meta.nameArabic}</span>
                <span style={{ color: '#64748b' }}>({meta.nameEnglish.split(' ')[0]})</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
