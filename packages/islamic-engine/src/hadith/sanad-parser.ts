/**
 * @file sanad-parser.ts
 * @package @islamic/islamic-engine
 * @description Deterministic Sanad (transmission chain) and Matn (substantive narration)
 * boundary separation for classical Hadith traditions.
 */

export interface SanadMatnSplit {
  sanad: string | null;
  matn: string;
}

/**
 * Common classical speech boundary patterns marking the transition from Sanad to Matn.
 * Includes variations of tashkeel and Unicode punctuation used in Shamela / Darussalam compendiums.
 */
const MATN_START_PATTERNS: RegExp[] = [
  // قال رسول الله صلى الله عليه وسلم: "..."
  /(?:قَالَ\s+رَسُولُ\s+اللَّهِ|قَالَ\s+رَسُولُ\s+اللَّه|قال\s+رسول\s+الله)\s+(?:صَلَّى\s+اللَّهُ\s+عَلَيْهِ\s+وَسَلَّمَ|صلى\s+الله\s+عليه\s+وسلم|ﷺ)[،:]?\s*(?:يَقُولُ|قَالَ)?[،:]?\s*(["'«»““”„‏]*)/u,
  // سمعت رسول الله صلى الله عليه وسلم يقول: "..."
  /(?:سَمِعْتُ\s+رَسُولَ\s+اللَّهِ|سمعت\s+رسول\s+الله)\s+(?:صَلَّى\s+اللَّهُ\s+عَلَيْهِ\s+وَسَلَّمَ|صلى\s+الله\s+عليه\s+وسلم|ﷺ)[،:]?\s*(?:يَقُولُ|قَالَ)?[،:]?\s*(["'«»““”„‏]*)/u,
  // عن النبي صلى الله عليه وسلم قال: "..."
  /(?:عَنِ\s+النَّبِيِّ|عن\s+النبي)\s+(?:صَلَّى\s+اللَّهُ\s+عَلَيْهِ\s+وَسَلَّمَ|صلى\s+الله\s+عليه\s+وسلم|ﷺ)[،:]?\s*(?:قَالَ|يَقُولُ)?[،:]?\s*(["'«»““”„‏]*)/u,
  // أن رسول الله صلى الله عليه وسلم قال: "..."
  /(?:أَنَّ\s+رَسُولَ\s+اللَّهِ|أن\s+رسول\s+الله|أَنَّ\s+النَّبِيَّ|أن\s+النبي)\s+(?:صَلَّى\s+اللَّهُ\s+عَلَيْهِ\s+وَسَلَّمَ|صلى\s+الله\s+عليه\s+وسلم|ﷺ)[،:]?\s*(?:قَالَ|قال)?[،:]?\s*(["'«»““”„‏]*)/u,
  // سأل رسول الله صلى الله عليه وسلم فقال: "..."
  /(?:سَأَلَ\s+رَسُولَ\s+اللَّهِ|سأل\s+رسول\s+الله)\s+(?:صَلَّى\s+اللَّهُ\s+عَلَيْهِ\s+وَسَلَّمَ|صلى\s+الله\s+عليه\s+وسلم|ﷺ)[،:]?\s*(?:فَقَالَ|فقال|قَالَ|قال)?[،:]?\s*(["'«»““”„‏]*)/u,
  // عام: صلى الله عليه وسلم قال / فقال / يقول
  /(?:صَلَّى\s+اللَّهُ\s+عَلَيْهِ\s+وَسَلَّمَ|صلى\s+الله\s+عليه\s+وسلم|ﷺ)[،:]?\s*(?:فَقَالَ|فقال|قَالَ|قال|يَقُولُ|يقول)[،:]?\s*(["'«»““”„‏]*)/u,
];

/**
 * Extracts and separates Sanad (transmission chain) and Matn (narration text).
 *
 * If a recognized classical speech boundary pattern is found, the chain of narrators
 * is separated into `sanad` and the prophetic speech/text into `matn`.
 * If no boundary is reliably identified, `sanad` is null and `matn` retains the full text.
 *
 * @param fullArabicText The complete Hadith narration text in Arabic.
 * @returns Object containing optional `sanad` and guaranteed `matn`.
 */
export function extractSanadAndMatn(fullArabicText: string): SanadMatnSplit {
  if (!fullArabicText || typeof fullArabicText !== 'string') {
    return { sanad: null, matn: '' };
  }

  const trimmed = fullArabicText.trim();
  if (trimmed.length === 0) {
    return { sanad: null, matn: '' };
  }

  // Check if text starts directly with transmission verbs (حدثنا, أخبرنا, عن, etc.)
  const hasTransmissionIntro = /^(?:حَدَّثَنَا|حدثنا|أَخْبَرَنَا|أخبرنا|أَنْبَأَنَا|أنبأنا|رَوَى|روى|عَنْ|عن)/u.test(trimmed);

  for (const pattern of MATN_START_PATTERNS) {
    const match = pattern.exec(trimmed);
    if (match && match.index > 0) {
      // Split point right after the prophetic attribution
      const splitIndex = match.index + match[0].length;
      const potentialSanad = trimmed.slice(0, splitIndex).trim();
      const potentialMatn = trimmed.slice(splitIndex).trim();

      if (potentialMatn.length > 0) {
        return {
          sanad: potentialSanad,
          matn: potentialMatn,
        };
      }
    }
  }

  // If text has transmission intro and quote marks (e.g. `‏"‏` or `"`), try splitting on quotation
  if (hasTransmissionIntro) {
    const quoteMatch = /(?:[:،]?\s*[«"“‏]+)([\s\S]+)/u.exec(trimmed);
    if (quoteMatch && quoteMatch.index > 20) {
      const potentialSanad = trimmed.slice(0, quoteMatch.index).trim();
      const potentialMatn = quoteMatch[1].replace(/[»"”‏]+/gu, '').trim();

      if (potentialSanad.length > 0 && potentialMatn.length > 0) {
        return {
          sanad: potentialSanad,
          matn: potentialMatn,
        };
      }
    }
  }

  // Fallback: If no distinct split is identified, preserve entire text in matn
  return {
    sanad: null,
    matn: trimmed,
  };
}
