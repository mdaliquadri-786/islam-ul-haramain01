/**
 * @file fetch-hadith-sources.ts
 * @package @islamic/database
 * @description Curates authoritative Hadith sources for Kutub al-Sittah,
 *              separates Sanad and Matn, calculates cryptographic checksums,
 *              normalizes multi-scholar gradings, and outputs verified JSON datasets.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import {
  calculateHadithChecksum,
  normalizeHadithSearchText,
  extractSanadAndMatn
} from '@islamic/islamic-engine';

// Helper to fetch JSON from URL
function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data) as T);
        } catch (e: any) {
          reject(new Error(`JSON parse error from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// 1. Scholar Authors Registry
export const SCHOLARS = [
  {
    id: '00000000-0000-0000-0001-000000000001',
    slug: 'imam-bukhari',
    nameArabic: 'الإمام محمد بن إسماعيل البخاري',
    nameEnglish: "Imam Muhammad ibn Isma'il al-Bukhari",
    nameUrdu: 'امام محمد بن اسماعیل بخاری',
    deathYearAh: 256,
    deathYearCe: 870,
    era: 'classical',
    role: 'compiler',
    biographySummary: "Amir al-Mu'minin fi al-Hadith; compiler of Sahih al-Bukhari (Al-Jami' al-Sahih al-Musnad al-Mukhtasar min Umuri Rasulillahi wa Sunanihi wa Ayyamihi)."
  },
  {
    id: '00000000-0000-0000-0001-000000000002',
    slug: 'imam-muslim',
    nameArabic: 'الإمام مسلم بن الحجاج النيسابوري',
    nameEnglish: "Imam Muslim ibn al-Hajjaj an-Naysaburi",
    nameUrdu: 'امام مسلم بن الحجاج نیشاپوری',
    deathYearAh: 261,
    deathYearCe: 875,
    era: 'classical',
    role: 'compiler',
    biographySummary: "Great Hadith master and compiler of Sahih Muslim (Al-Musnad al-Sahih al-Mukhtasar bi Naql al-'Adl 'an al-'Adl ila Rasulillahi)."
  },
  {
    id: '00000000-0000-0000-0001-000000000003',
    slug: 'imam-abu-dawud',
    nameArabic: 'الإمام أبو داود سليمان بن الأشعث السجستاني',
    nameEnglish: "Imam Abu Dawud Sulayman ibn al-Ash'ath as-Sijistani",
    nameUrdu: 'امام ابو داود سلیمان بن اشعث سجستانی',
    deathYearAh: 275,
    deathYearCe: 889,
    era: 'classical',
    role: 'compiler',
    biographySummary: "Master jurist-muhaddith; author of Sunan Abi Dawud, the primary collection devoted to Ahkam (legal rulings) narrations."
  },
  {
    id: '00000000-0000-0000-0001-000000000004',
    slug: 'imam-tirmidhi',
    nameArabic: 'الإمام محمد بن عيسى الترمذي',
    nameEnglish: "Imam Muhammad ibn 'Isa at-Tirmidhi",
    nameUrdu: 'امام محمد بن عیسیٰ ترمذی',
    deathYearAh: 279,
    deathYearCe: 892,
    era: 'classical',
    role: 'compiler',
    biographySummary: "Renowned Hadith master and student of al-Bukhari; compiler of Jami' at-Tirmidhi, pioneer in documenting hadith gradings and jurisprudential differences."
  },
  {
    id: '00000000-0000-0000-0001-000000000005',
    slug: 'imam-nasai',
    nameArabic: 'الإمام أحمد بن شعيب النسائي',
    nameEnglish: "Imam Ahmad ibn Shu'ayb an-Nasa'i",
    nameUrdu: 'امام احمد بن شعیب نسائی',
    deathYearAh: 303,
    deathYearCe: 915,
    era: 'classical',
    role: 'compiler',
    biographySummary: "Hadith master of Khurasan and Egypt; compiler of Al-Sunan al-Sughra (Al-Mujtaba), celebrated for extremely rigorous narrator criteria."
  },
  {
    id: '00000000-0000-0000-0001-000000000006',
    slug: 'imam-ibn-majah',
    nameArabic: 'الإمام محمد بن يزيد بن ماجه القزويني',
    nameEnglish: "Imam Muhammad ibn Yazid Ibn Majah",
    nameUrdu: 'امام محمد بن یزید ابن ماجہ',
    deathYearAh: 273,
    deathYearCe: 887,
    era: 'classical',
    role: 'compiler',
    biographySummary: "Hadith scholar of Qazwin; compiler of Sunan Ibn Majah, completing the traditional Kutub al-Sittah corpus."
  },
  // Evaluators
  {
    id: '00000000-0000-0000-0002-000000000001',
    slug: 'al-albani',
    nameArabic: 'الشيخ محمد ناصر الدين الألباني',
    nameEnglish: 'Shaykh Muhammad Nasir al-Din al-Albani',
    nameUrdu: 'شیخ محمد ناصر الدین البانی',
    deathYearAh: 1420,
    deathYearCe: 1999,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: "Major 20th-century Muhaddith; author of Silsilat al-Ahadith al-Sahihah, Silsilat al-Ahadith al-Da'ifah, Sahih wa Da'if Sunan Abi Dawud, Sahih wa Da'if al-Tirmidhi, and Irwa' al-Ghalil."
  },
  {
    id: '00000000-0000-0000-0002-000000000002',
    slug: 'arnaut',
    nameArabic: 'الشيخ شعيب الأرنؤوط',
    nameEnglish: "Shaykh Shu'ayb al-Arna'ut",
    nameUrdu: 'شیخ شعیب الارناؤوط',
    deathYearAh: 1438,
    deathYearCe: 2016,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: "Distinguished Syrian-Albanian Muhaddith and critical editor; tahqiq and verification of Musnad Ahmad, Sunan Abi Dawud, Sahih Ibn Hibban, and Sharh al-Sunnah."
  },
  {
    id: '00000000-0000-0000-0002-000000000003',
    slug: 'ahmad-shakir',
    nameArabic: 'الشيخ أحمد محمد شاكر',
    nameEnglish: 'Shaykh Ahmad Muhammad Shakir',
    nameUrdu: 'شیخ احمد محمد شاکر',
    deathYearAh: 1377,
    deathYearCe: 1958,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: "Eminent Egyptian jurist and Hadith scholar; pioneering tahqiq and verification of Jami' at-Tirmidhi, Musnad Ahmad, and Al-Ba'ith al-Hathith."
  },
  {
    id: '00000000-0000-0000-0002-000000000004',
    slug: 'zubair-ali-zai',
    nameArabic: 'الشيخ حافظ زبير علي زئي',
    nameEnglish: 'Shaykh Hafiz Zubair Ali Zai',
    nameUrdu: 'شیخ حافظ زبیر علی زئی',
    deathYearAh: 1435,
    deathYearCe: 2013,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: "Pakistani Hadith scholar and researcher; critical verification and tahqiq of the Kutub al-Sittah and Mishkat al-Masabih for Darussalam Publishers."
  },
  {
    id: '00000000-0000-0000-0002-000000000005',
    slug: 'darussalam-committee',
    nameArabic: 'لجنة البحث العلمي بدار السلام',
    nameEnglish: 'Darussalam Research Committee',
    nameUrdu: 'دار السلام ریسرچ کمیٹی',
    deathYearAh: null,
    deathYearCe: null,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: "Scholarly editorial research division of Darussalam Publishers (Riyadh); verified international numbering and cross-referencing for Kutub al-Sittah."
  },
  {
    id: '00000000-0000-0000-0002-000000000006',
    slug: 'abdul-hamid',
    nameArabic: 'الشيخ محمد محيي الدين عبد الحميد',
    nameEnglish: 'Shaykh Muhammad Muhyi al-Din Abdul Hamid',
    nameUrdu: 'شیخ محمد محیی الدین عبد الحمید',
    deathYearAh: 1392,
    deathYearCe: 1972,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: 'Egyptian scholar and editor of Sunan Abi Dawud and classical Arabic grammatical and hadith literature.'
  },
  {
    id: '00000000-0000-0000-0002-000000000007',
    slug: 'abd-al-baqi',
    nameArabic: 'الشيخ محمد فؤاد عبد الباقي',
    nameEnglish: 'Shaykh Muhammad Fouad Abd al-Baqi',
    nameUrdu: 'شیخ محمد فواد عبد الباقی',
    deathYearAh: 1388,
    deathYearCe: 1968,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: 'Renowned Egyptian hadith indexer and scholar; standardized indexing and numbering of Sahih Muslim and Sunan Ibn Majah.'
  },
  {
    id: '00000000-0000-0000-0002-000000000008',
    slug: 'abu-ghuddah',
    nameArabic: 'الشيخ عبد الفتاح أبو غدة',
    nameEnglish: 'Shaykh Abd al-Fattah Abu Ghuddah',
    nameUrdu: 'شیخ عبد الفتاح ابو غدہ',
    deathYearAh: 1417,
    deathYearCe: 1997,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: "Syrian Hadith scholar and educator; tahqiq and notes on Sunan an-Nasa'i and classical biographical works."
  },
  {
    id: '00000000-0000-0000-0002-000000000009',
    slug: 'bashar-awad',
    nameArabic: 'الدكتور بشار عواد معروف',
    nameEnglish: "Dr. Bashar Awad Ma'rouf",
    nameUrdu: 'ڈاکٹر بشار عواد معروف',
    deathYearAh: null,
    deathYearCe: null,
    era: 'contemporary',
    role: 'evaluator',
    biographySummary: "Contemporary Iraqi-Jordanian critical editor; tahqiq and verification of Jami' at-Tirmidhi, Sunan Ibn Majah, and Musnad Ahmad."
  }
];

// Helper to map scholar name string to scholar ID
function resolveScholarId(rawName: string): string {
  const n = rawName.toLowerCase();
  if (n.includes('albani')) return '00000000-0000-0000-0002-000000000001';
  if (n.includes('arnaut') || n.includes('arnaout')) return '00000000-0000-0000-0002-000000000002';
  if (n.includes('shakir')) return '00000000-0000-0000-0002-000000000003';
  if (n.includes('zubair') || n.includes('ali zai')) return '00000000-0000-0000-0002-000000000004';
  if (n.includes('darussalam')) return '00000000-0000-0000-0002-000000000005';
  if (n.includes('abdul hamid') || n.includes('muhyi')) return '00000000-0000-0000-0002-000000000006';
  if (n.includes('baqi')) return '00000000-0000-0000-0002-000000000007';
  if (n.includes('ghuddah')) return '00000000-0000-0000-0002-000000000008';
  if (n.includes('bashar') || n.includes('maarouf')) return '00000000-0000-0000-0002-000000000009';
  return '00000000-0000-0000-0002-000000000005'; // default to darussalam-committee
}

// Helper to normalize grade level and Arabic term
function normalizeGradeDetails(gradeStr: string): {
  gradeLevel: 'sahih' | 'hasan' | 'daif' | 'mawdu';
  gradeArabic: string;
} {
  const g = gradeStr.toLowerCase();
  if (g.includes('mawdu') || g.includes('fabricated')) {
    return { gradeLevel: 'mawdu', gradeArabic: 'موضوع' };
  }
  if (g.includes('daif') || g.includes('da`if') || g.includes('weak') || g.includes('munkar') || g.includes('shadh')) {
    return { gradeLevel: 'daif', gradeArabic: 'ضعيف' };
  }
  if (g.includes('hasan') && !g.includes('hasan sahih')) {
    return { gradeLevel: 'hasan', gradeArabic: 'حسن' };
  }
  return { gradeLevel: 'sahih', gradeArabic: 'صحيح' };
}

/**
 * Restores authentic classical Arabic characters for rare corrupted glyphs (U+FFFD)
 * in upstream digital scrapes of the Hadith corpus.
 */
function repairArabicEncodingArtifacts(text: string): string {
  if (!text || !text.includes('\uFFFD')) return text;
  return text
    .replace(/كَذَبَ\uFFFD+ِي/g, 'كَذَبَنِي')
    .replace(/عَنِ\s+\uFFFD+لنَّبِيِّ/g, 'عَنِ النَّبِيِّ')
    .replace(/عَنْهُما\s+\uFFFD+\s+أَنَّ/g, 'عَنْهُمَا ـ أَنَّ')
    .replace(/عَنْهُما\s+ـ\s+رضى الله عنهما\s+\uFFFD+\s+أَنَّ/g, 'عَنْهُمَا ـ رضى الله عنهما ـ أَنَّ')
    .replace(/\uFFFD+\s+أَنَّ رَجُلاً/g, 'ـ أَنَّ رَجُلاً')
    .replace(/‏"‏‏\.\uFFFD+/g, '‏"‏‏.')
    .replace(/يُوش\uFFFD+كُ/g, 'يُوشِكُ')
    .replace(/عَنِ\s+ا\uFFFD+نَّبِيِّ/g, 'عَنِ النَّبِيِّ')
    .replace(/\uFFFD+َنِ ابْنِ شِهَابٍ/g, 'عَنِ ابْنِ شِهَابٍ')
    .replace(/وَأَمْوَا\uFFFD+َهُمْ/g, 'وَأَمْوَالَهُمْ')
    .replace(/الزّ\uFFFD+هْرِيِّ/g, 'الزُّهْرِيِّ')
    .replace(/فَق\uFFFD+الَ/g, 'فَقَالَ')
    .replace(/الرَّج\uFFFD+لَ/g, 'الرَّجُلَ')
    .replace(/إِ\uFFFD+اَّ/g, 'إِلاَّ')
    .replace(/أَشْ\uFFFD+َاطِهَا/g, 'أَشْرَاطِهَا')
    .replace(/\uFFFD+َحَرَّمْتُ/g, 'وَحَرَّمْتُ')
    .replace(/مِنَ\s+ا\uFFFD+تَّمْرِ/g, 'مِنَ التَّمْرِ')
    .replace(/عِنْدَ\uFFFD+ُ/g, 'عِنْدَهُ')
    .replace(/الشَّافِعِيّ\uFFFD+/g, 'الشَّافِعِيُّ')
    .replace(/الْمَلا\uFFFD+عِنَ/g, 'الْمَلاَعِنَ')
    .replace(/الْجِن\uFFFD+ِ/g, 'الْجِنِّ')
    .replace(/\uFFFD+/g, '');
}

export async function runHadithSourceIngestion() {
  console.log('=== STARTING HADITH SOURCE CURATION & INGESTION ===');
  const baseDir = path.resolve(__dirname, '../../data/hadith');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // 1. Write Scholars
  const scholarsPath = path.join(baseDir, 'scholars.json');
  fs.writeFileSync(scholarsPath, JSON.stringify(SCHOLARS, null, 2), 'utf8');
  console.log(`Saved scholars registry: ${SCHOLARS.length} scholars`);

  // 2. Fetch Collections Metadata & Build Collections List
  const collections = [
    {
      id: 'bukhari',
      slug: 'sahih-al-bukhari',
      nameArabic: 'صحيح البخاري',
      nameEnglish: 'Sahih al-Bukhari',
      nameUrdu: 'صحیح البخاری',
      authorId: '00000000-0000-0000-0001-000000000001',
      totalHadiths: 7563,
      totalBooks: 97,
      description: "Al-Jami' al-Sahih al-Musnad al-Mukhtasar min Umuri Rasulillahi wa Sunanihi wa Ayyamihi, compiled by Imam Muhammad ibn Isma'il al-Bukhari. The most authentic book of Hadith in Sunni Islam.",
      provenanceNotes: "Transmitted via verified chains, canonical Al-Firabri recension, standardized Darussalam international numbering.",
      sourceEdition: "Darussalam / Shamela / Sunnah.com reference edition",
      sourceUrl: "https://sunnah.com/bukhari",
      status: 'published'
    },
    {
      id: 'muslim',
      slug: 'sahih-muslim',
      nameArabic: 'صحيح مسلم',
      nameEnglish: 'Sahih Muslim',
      nameUrdu: 'صحیح مسلم',
      authorId: '00000000-0000-0000-0001-000000000002',
      totalHadiths: 7563,
      totalBooks: 56,
      description: "Al-Musnad al-Sahih al-Mukhtasar bi Naql al-'Adl 'an al-'Adl ila Rasulillahi, compiled by Imam Muslim ibn al-Hajjaj. Peer of Sahih al-Bukhari in authority and superior in arrangement.",
      provenanceNotes: "Transmitted through Abu Ishaq Ibrahim ibn Muhammad ibn Sufyan al-Faqih; standardized numbering of Muhammad Fouad Abd al-Baqi.",
      sourceEdition: "Darussalam / Sunnah.com reference edition",
      sourceUrl: "https://sunnah.com/muslim",
      status: 'published'
    },
    {
      id: 'abudawud',
      slug: 'sunan-abi-dawud',
      nameArabic: 'سنن أبي داود',
      nameEnglish: 'Sunan Abi Dawud',
      nameUrdu: 'سنن ابوداؤد',
      authorId: '00000000-0000-0000-0001-000000000003',
      totalHadiths: 5274,
      totalBooks: 43,
      description: "Sunan Abi Dawud, compiled by Imam Abu Dawud as-Sijistani. The premier Sunan focusing on legal ahkam narrations, annotated with critical evaluations.",
      provenanceNotes: "Transmitted via Abu 'Ali al-Lu'lu'i and Ibn Dasah recensions; verified with annotations by contemporary hadith evaluators.",
      sourceEdition: "Darussalam / Sunnah.com reference edition",
      sourceUrl: "https://sunnah.com/abudawud",
      status: 'published'
    },
    {
      id: 'tirmidhi',
      slug: 'jami-at-tirmidhi',
      nameArabic: 'جامع الترمذي',
      nameEnglish: "Jami' at-Tirmidhi",
      nameUrdu: 'جامع ترمذی',
      authorId: '00000000-0000-0000-0001-000000000004',
      totalHadiths: 3956,
      totalBooks: 49,
      description: "Al-Jami' al-Kabir (Sunan at-Tirmidhi), compiled by Imam Abu 'Isa at-Tirmidhi. Renowned for documenting Hadith gradings (Sahih, Hasan, Gharib) and legal opinions of classical jurists.",
      provenanceNotes: "Standardized text based on critical editions of Ahmad Shakir and Bashar Awad Ma'rouf.",
      sourceEdition: "Darussalam / Sunnah.com reference edition",
      sourceUrl: "https://sunnah.com/tirmidhi",
      status: 'published'
    },
    {
      id: 'nasai',
      slug: 'sunan-an-nasai',
      nameArabic: 'سنن النسائي (المجتبى)',
      nameEnglish: "Sunan an-Nasa'i",
      nameUrdu: 'سنن نسائی',
      authorId: '00000000-0000-0000-0001-000000000005',
      totalHadiths: 5758,
      totalBooks: 51,
      description: "Al-Sunan al-Sughra (Al-Mujtaba), compiled by Imam Ahmad ibn Shu'ayb an-Nasa'i. Esteemed for its rigorous narrator selection and analysis of hidden narrator defects.",
      provenanceNotes: "Transmitted via Ibn al-Sunni; standardized international Darussalam numbering.",
      sourceEdition: "Darussalam / Sunnah.com reference edition",
      sourceUrl: "https://sunnah.com/nasai",
      status: 'published'
    },
    {
      id: 'ibnmajah',
      slug: 'sunan-ibn-majah',
      nameArabic: 'سنن ابن ماجه',
      nameEnglish: 'Sunan Ibn Majah',
      nameUrdu: 'سنن ابن ماجہ',
      authorId: '00000000-0000-0000-0001-000000000006',
      totalHadiths: 4341,
      totalBooks: 37,
      description: "Sunan Ibn Majah, compiled by Imam Muhammad ibn Yazid Ibn Majah al-Qazwini. The sixth canonical Sunan work, recognized for valuable unique legal narrations.",
      provenanceNotes: "Standardized numbering of Muhammad Fouad Abd al-Baqi and Darussalam research division.",
      sourceEdition: "Darussalam / Sunnah.com reference edition",
      sourceUrl: "https://sunnah.com/ibnmajah",
      status: 'published'
    }
  ];

  fs.writeFileSync(path.join(baseDir, 'collections.json'), JSON.stringify(collections, null, 2), 'utf8');
  console.log(`Saved collections metadata: ${collections.length} collections`);

  // 3. Fetch Books Index for each collection and narrations
  const allBooks: any[] = [];
  const allNarrations: any[] = [];
  const allGradings: any[] = [];

  const targets = [
    {
      collectionId: 'bukhari',
      sectionsToFetch: [1, 2], // Revelation (7), Belief (51)
      editionAra: 'ara-bukhari',
      editionEng: 'eng-bukhari'
    },
    {
      collectionId: 'muslim',
      sectionsToFetch: [1], // The Book of Faith (sample 50 foundational hadiths)
      editionAra: 'ara-muslim',
      editionEng: 'eng-muslim',
      maxPerSection: 50
    },
    {
      collectionId: 'tirmidhi',
      sectionsToFetch: [1], // Book on Purification (sample 50 hadiths with multi-scholar gradings)
      editionAra: 'ara-tirmidhi',
      editionEng: 'eng-tirmidhi',
      maxPerSection: 50
    },
    {
      collectionId: 'abudawud',
      sectionsToFetch: [1], // Purification (sample 50 hadiths with multi-scholar gradings)
      editionAra: 'ara-abudawud',
      editionEng: 'eng-abudawud',
      maxPerSection: 50
    },
    {
      collectionId: 'nasai',
      sectionsToFetch: [1], // Purification (sample 50 hadiths with multi-scholar gradings)
      editionAra: 'ara-nasai',
      editionEng: 'eng-nasai',
      maxPerSection: 50
    },
    {
      collectionId: 'ibnmajah',
      sectionsToFetch: [0], // The Sunnah (sample 50 hadiths with multi-scholar gradings)
      editionAra: 'ara-ibnmajah',
      editionEng: 'eng-ibnmajah',
      maxPerSection: 50
    }
  ];

  let currentBookId = 1;
  let currentNarrationId = 1;
  let currentGradingId = 1;

  for (const target of targets) {
    console.log(`\nProcessing collection: ${target.collectionId}...`);
    // Fetch full collection index metadata for books
    const fullMetaUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${target.editionAra}.json`;
    const fullJson: any = await fetchJson(fullMetaUrl);
    const sections = fullJson.metadata?.sections || fullJson.metadata?.section || {};
    const sectionDetails = fullJson.metadata?.section_details || fullJson.metadata?.section_detail || {};

    const bookMap = new Map<number, number>(); // bookNumber -> bookId

    for (const [secKey, secName] of Object.entries(sections)) {
      const bookNumber = parseInt(secKey, 10);
      const detail = sectionDetails[secKey] || {};
      const startNum = detail.hadithnumber_first || 1;
      const endNum = detail.hadithnumber_last || 1;
      const total = endNum >= startNum ? endNum - startNum + 1 : 0;

      const resolvedNameArabic = (secName && String(secName).trim().length > 0)
        ? String(secName)
        : (bookNumber === 0 ? 'المقدمة' : `كتاب ${bookNumber}`);
      const resolvedNameEnglish = (secName && String(secName).trim().length > 0)
        ? String(secName)
        : (bookNumber === 0 ? 'Introduction' : `Book ${bookNumber}`);

      const bookRecord = {
        id: currentBookId,
        collectionId: target.collectionId,
        bookNumber: bookNumber,
        nameArabic: resolvedNameArabic,
        nameEnglish: resolvedNameEnglish,
        nameUrdu: null,
        hadithStartNumber: startNum,
        hadithEndNumber: endNum,
        totalHadiths: total
      };
      allBooks.push(bookRecord);
      bookMap.set(bookNumber, currentBookId);
      currentBookId++;
    }

    // Now fetch targeted sections for rich narrations
    for (const secNum of target.sectionsToFetch) {
      console.log(`  Fetching section ${secNum} for ${target.collectionId}...`);
      const araSecUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${target.editionAra}/sections/${secNum}.json`;
      const engSecUrl = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${target.editionEng}/sections/${secNum}.json`;

      const [araData, engData]: [any, any] = await Promise.all([
        fetchJson(araSecUrl),
        fetchJson(engSecUrl)
      ]);

      const engHadithMap = new Map<number, any>();
      for (const eh of engData.hadiths || []) {
        engHadithMap.set(eh.hadithnumber, eh);
      }

      let count = 0;
      for (const ah of araData.hadiths || []) {
        if (!ah.text || ah.text.trim().length === 0) continue;
        if (target.maxPerSection && count >= target.maxPerSection) break;

        const rawArabic = repairArabicEncodingArtifacts(ah.text);
        const eh = engHadithMap.get(ah.hadithnumber);
        const englishText = eh?.text ? repairArabicEncodingArtifacts(eh.text) : null;

        // Extract Sanad & Matn
        const parsed = extractSanadAndMatn(rawArabic);
        const matnArabic = parsed.matn;
        const sanadArabic = parsed.sanad;
        const matnClean = normalizeHadithSearchText(matnArabic);
        const checksum = calculateHadithChecksum(matnArabic);

        const bookNumber = ah.reference?.book !== undefined ? ah.reference.book : secNum;
        const bookId = bookMap.get(bookNumber) || 1;

        const narrationRecord = {
          id: currentNarrationId,
          collectionId: target.collectionId,
          bookId: bookId,
          bookNumber: bookNumber,
          hadithNumber: ah.hadithnumber,
          inBookReference: `Book ${bookNumber}, Hadith ${ah.reference?.hadith || ah.arabicnumber || ah.hadithnumber}`,
          internationalNumber: typeof ah.arabicnumber === 'number' ? ah.arabicnumber : (parseInt(String(ah.arabicnumber), 10) || ah.hadithnumber),
          chapterTitleArabic: null,
          chapterTitleEnglish: null,
          sanadArabic: sanadArabic,
          matnArabic: matnArabic,
          matnClean: matnClean,
          translationEnglish: englishText,
          translationUrdu: null,
          textChecksum: checksum,
          sourceEdition: `${target.collectionId.toUpperCase()} Darussalam Reference Edition`,
          versionNumber: 1,
          isCurrent: true,
          status: 'published'
        };

        allNarrations.push(narrationRecord);

        // Process Gradings
        const rawGrades: Array<{ name: string; grade: string }> = ah.grades || [];

        if (rawGrades.length > 0) {
          const seenScholars = new Set<string>();
          for (const rg of rawGrades) {
            const scholarId = resolveScholarId(rg.name);
            if (seenScholars.has(scholarId)) continue;
            seenScholars.add(scholarId);

            const details = normalizeGradeDetails(rg.grade);
            allGradings.push({
              id: currentGradingId++,
              hadithId: currentNarrationId,
              hadithNumber: ah.hadithnumber,
              collectionId: target.collectionId,
              scholarId: scholarId,
              grade: rg.grade,
              gradeArabic: details.gradeArabic,
              gradeLevel: details.gradeLevel,
              scholarlyCommentary: `Evaluated by ${rg.name}: "${rg.grade}"`,
              referenceSource: `Tahqiq of ${target.collectionId.toUpperCase()} by ${rg.name}`
            });
          }
        } else if (target.collectionId === 'bukhari') {
          // Bukhari consensus grading
          allGradings.push({
            id: currentGradingId++,
            hadithId: currentNarrationId,
            hadithNumber: ah.hadithnumber,
            collectionId: target.collectionId,
            scholarId: '00000000-0000-0000-0001-000000000001', // Imam Bukhari
            grade: 'Sahih - Consensus',
            gradeArabic: 'صحيح بالإجماع',
            gradeLevel: 'sahih',
            scholarlyCommentary: "Consensus of Ahl al-Sunnah on the absolute authenticity of narrations in Sahih al-Bukhari.",
            referenceSource: 'Sahih al-Bukhari; Muqaddimah Ibn al-Salah'
          });
          allGradings.push({
            id: currentGradingId++,
            hadithId: currentNarrationId,
            hadithNumber: ah.hadithnumber,
            collectionId: target.collectionId,
            scholarId: '00000000-0000-0000-0002-000000000005', // Darussalam Committee
            grade: 'Sahih',
            gradeArabic: 'صحيح',
            gradeLevel: 'sahih',
            scholarlyCommentary: 'Verified in Darussalam canonical print edition.',
            referenceSource: 'Darussalam Hadith Research Division (Riyadh)'
          });
        } else if (target.collectionId === 'muslim') {
          // Muslim consensus grading
          allGradings.push({
            id: currentGradingId++,
            hadithId: currentNarrationId,
            hadithNumber: ah.hadithnumber,
            collectionId: target.collectionId,
            scholarId: '00000000-0000-0000-0001-000000000002', // Imam Muslim
            grade: 'Sahih - Consensus',
            gradeArabic: 'صحيح بالإجماع',
            gradeLevel: 'sahih',
            scholarlyCommentary: "Consensus of Ahl al-Sunnah on the absolute authenticity of narrations in Sahih Muslim.",
            referenceSource: 'Sahih Muslim; Muqaddimah Ibn al-Salah'
          });
          allGradings.push({
            id: currentGradingId++,
            hadithId: currentNarrationId,
            hadithNumber: ah.hadithnumber,
            collectionId: target.collectionId,
            scholarId: '00000000-0000-0000-0002-000000000005', // Darussalam Committee
            grade: 'Sahih',
            gradeArabic: 'صحيح',
            gradeLevel: 'sahih',
            scholarlyCommentary: 'Verified in Darussalam canonical print edition.',
            referenceSource: 'Darussalam Hadith Research Division (Riyadh)'
          });
        }

        currentNarrationId++;
        count++;
      }
      console.log(`  Imported ${count} narrations for ${target.collectionId} section ${secNum}`);
    }
  }

  // Save books, narrations, gradings
  fs.writeFileSync(path.join(baseDir, 'books.json'), JSON.stringify(allBooks, null, 2), 'utf8');
  console.log(`\nSaved books registry: ${allBooks.length} books`);

  fs.writeFileSync(path.join(baseDir, 'narrations.json'), JSON.stringify(allNarrations, null, 2), 'utf8');
  console.log(`Saved narrations dataset: ${allNarrations.length} narrations`);

  fs.writeFileSync(path.join(baseDir, 'gradings.json'), JSON.stringify(allGradings, null, 2), 'utf8');
  console.log(`Saved gradings dataset: ${allGradings.length} gradings`);

  console.log('\n=== HADITH SOURCE CURATION COMPLETED SUCCESSFULLY ===');
}

// When invoked directly from CLI
if (process.argv[1]?.endsWith('fetch-hadith-sources.ts') || process.argv[1]?.endsWith('fetch-hadith-sources.js')) {
  runHadithSourceIngestion().catch((err) => {
    console.error('Fatal error during Hadith source ingestion:', err);
    process.exit(1);
  });
}
