/**
 * @file fetch-duas-sources.ts
 * @package @islamic/database
 * @description Curates authentic Duas & Adhkar from Hisn al-Muslim (حصن المسلم),
 *              performing text reconciliation, cryptographic checksum generation,
 *              diacritic-free search text indexing, and citation structuring.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as https from 'node:https';
import * as crypto from 'node:crypto';

interface DeenHubDua {
  Text: string;
  Count: number;
  Reference: string;
}

interface DeenHubEnDua {
  TextEn: string;
  SideNoteEn: string | null;
}

interface AsellamDua {
  Text: string;
  Count: number;
  Reference: string;
}

function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e: any) {
          reject(new Error(`JSON parse error from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function calculateSha256(text: string): string {
  return crypto.createHash('sha256').update(text.trim(), 'utf8').digest('hex');
}

export function normalizeArabicSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // remove harakat / tashkeel & Quranic marks
    .normalize('NFC')
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627')   // unify alefs (أ إ آ ٱ -> ا)
    .replace(/\u0649/g, '\u064A')                         // alif maqsura (ى -> ي)
    .replace(/\u0629/g, '\u0647')                         // taa marbuta (ة -> ه)
    .replace(/\u0640/g, '')                               // remove tatweel / kashida
    .replace(/[\*\.\,\،\؛\:\؟\?\!\(\)\[\]\{\}\<\>\"\'\`]/g, ' ') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(title: string): string {
  return title
    .replace(/^Chapter:\s*/i, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseTextEn(raw: string): {
  transliteration: string | null;
  translation: string;
  context: string | null;
  reference: string | null;
} {
  if (!raw) {
    return { transliteration: null, translation: '', context: null, reference: null };
  }

  let reference: string | null = null;
  let body = raw;

  const refIdx = raw.indexOf('Reference:');
  if (refIdx !== -1) {
    reference = raw.slice(refIdx + 10).trim();
    body = raw.slice(0, refIdx).trim();
  }

  const parts = body
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  let transliteration: string | null = null;
  let translation = '';
  let context: string | null = null;

  if (parts.length === 1) {
    translation = parts[0];
  } else if (parts.length === 2) {
    transliteration = parts[0];
    translation = parts[1];
  } else {
    // Check if one of the parts is a bracketed note or context instruction
    const nonContextParts: string[] = [];
    for (const p of parts) {
      if (/^\[.*\]$/s.test(p) || /^\(Recite\b/i.test(p) || /^\(to be said\b/i.test(p)) {
        context = context ? `${context}\n${p}` : p;
      } else {
        nonContextParts.push(p);
      }
    }
    if (nonContextParts.length >= 2) {
      transliteration = nonContextParts[0];
      translation = nonContextParts.slice(1).join('\n\n');
    } else if (nonContextParts.length === 1) {
      translation = nonContextParts[0];
    } else {
      translation = parts.join('\n\n');
    }
  }

  return { transliteration, translation, context, reference };
}

function detectRepetitionCount(textEn: string, arabicSnippet: string, asellamMap: Map<string, number>): number {
  // 1. Check textEn regex for explicit mentions
  const m = textEn.match(/\b(three|four|seven|ten|thirty-three|33|100|one hundred)\s*times\b/i);
  if (m) {
    const word = m[1].toLowerCase();
    if (word === 'three') return 3;
    if (word === 'four') return 4;
    if (word === 'seven') return 7;
    if (word === 'ten') return 10;
    if (word === 'thirty-three' || word === '33') return 33;
    if (word === '100' || word === 'one hundred') return 100;
  }

  // 2. Check asellam map
  const cleanSnippet = arabicSnippet.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/\s+/g, ' ').trim().slice(0, 30);
  if (asellamMap.has(cleanSnippet)) {
    return asellamMap.get(cleanSnippet)!;
  }

  return 1;
}

function detectQuranCitation(textEn: string, arabicText: string): { surah: number | null; ayah: string | null } {
  // Ayat al-Kursi
  if (/Ayat al-Kursi/i.test(textEn) || /2:255\b/.test(textEn) || /الله لا إله إلا هو الحي القيوم/i.test(arabicText)) {
    return { surah: 2, ayah: '255' };
  }

  // Al-Baqarah 285-286
  if (/2:285-286\b/.test(textEn) || /آمن الرسول بما أنزل إليه/i.test(arabicText)) {
    return { surah: 2, ayah: '285-286' };
  }

  // Al-Imran 190-200
  if (/3:\s*190-200\b/.test(textEn) || /إن في خلق السماوات والأرض واختلاف الليل والنهار/i.test(arabicText)) {
    return { surah: 3, ayah: '190-200' };
  }

  // Al-Baqarah 201
  if (/2:201\b/.test(textEn) || /ربنا آتنا في الدنيا حسنة/i.test(arabicText)) {
    return { surah: 2, ayah: '201' };
  }

  // Al-Ikhlas (112)
  if (/Al-Ikhlas\b|112:1-4\b/i.test(textEn) || /قل هو الله أحد/i.test(arabicText)) {
    return { surah: 112, ayah: '1-4' };
  }

  // Al-Falaq (113)
  if (/Al-Falaq\b|113:1-5\b/i.test(textEn) || /قل أعوذ برب الفلق/i.test(arabicText)) {
    return { surah: 113, ayah: '1-5' };
  }

  // An-Nas (114)
  if (/An-Nas\b|114:1-6\b/i.test(textEn) || /قل أعوذ برب الناس/i.test(arabicText)) {
    return { surah: 114, ayah: '1-6' };
  }

  // Al-Hadid 57:3
  if (/Huwa ‘l-Awwalu wa ‘l-Ākhir/i.test(textEn) || /هو الأول والآخر والظاهر والباطن/i.test(arabicText)) {
    return { surah: 57, ayah: '3' };
  }

  return { surah: null, ayah: null };
}

function detectHadithCitation(ref: string | null): {
  collection: string | null;
  number: string | null;
  grade: string | null;
} {
  if (!ref) return { collection: null, number: null, grade: null };

  let collection: string | null = null;
  let number: string | null = null;
  let grade: string | null = null;

  if (/bukhari/i.test(ref)) collection = 'bukhari';
  else if (/muslim/i.test(ref)) collection = 'muslim';
  else if (/tirmidhi/i.test(ref)) collection = 'tirmidhi';
  else if (/abu dawud|abu dawood/i.test(ref)) collection = 'abu-dawud';
  else if (/nasa'i|nasai/i.test(ref)) collection = 'nasai';
  else if (/ibn majah/i.test(ref)) collection = 'ibn-majah';
  else if (/ahmad/i.test(ref)) collection = 'ahmad';
  else if (/al-hakim|hakim/i.test(ref)) collection = 'al-hakim';

  // Hadith number
  const numMatch = ref.match(/(?:no\.|number|hadith)\s*([0-9]+)/i);
  if (numMatch) {
    number = numMatch[1];
  }

  // Grade
  if (/sahih|authentic/i.test(ref)) grade = 'Sahih';
  else if (/hasan|good/i.test(ref)) grade = 'Hasan';

  return { collection, number, grade };
}

const URDU_CATEGORY_NAMES: Record<string, string> = {
  'when-waking-up': 'سو کر بیدار ہوتے وقت کے اذکار',
  'when-wearing-a-garment': 'لباس پہنتے وقت کی دعا',
  'when-wearing-a-new-garment': 'نیا لباس پہنتے وقت کی دعا',
  'to-someone-wearing-a-new-garment': 'نئے لباس والے کو دعا',
  'before-undressing': 'لباس اتارتے وقت کا ذکر',
  'before-entering-the-bathroom': 'بیت الخلاء میں داخل ہونے کی دعا',
  'after-leaving-the-bathroom': 'بیت الخلاء سے نکلنے کی دعا',
  'before-ablution': 'وضو شروع کرتے وقت کی دعا',
  'upon-completing-the-ablution': 'وضو مکمل کرنے کے بعد کی دعا',
  'remembrance-when-leaving-the-home': 'گھر سے نکلتے وقت کی دعا',
  'remembrance-upon-entering-the-home': 'گھر میں داخل ہوتے وقت کی دعا',
  'when-going-to-the-mosque': 'مسجد جاتے وقت کی دعا',
  'upon-entering-the-mosque': 'مسجد میں داخل ہوتے وقت کی دعا',
  'upon-leaving-the-mosque': 'مسجد سے نکلتے وقت کی دعا',
  'concerning-the-athan-the-call-to-prayer': 'اذان کے وقت کے اذکار',
  'at-the-start-of-the-prayer-after-takbeer': 'دعائے استفتاح (تکبیر تحریمہ کے بعد)',
  'while-bowing-in-prayer': 'رکوع کی دعائیں',
  'upon-rising-from-the-bowing-position': 'رکوع سے اٹھتے وقت کی دعا',
  'while-prostrating': 'سجدے کی دعائیں',
  'between-the-two-prostrations': 'دونوں سجدوں کے درمیان کی دعا',
  'prostration-due-to-recitation-of-the-quran': 'سجدہ تلاوت کی دعا',
  'the-tashahhud': 'التحیات (تشہد)',
  'prayers-upon-the-prophet-after-the-tashahhud': 'درود شریف (تشہد کے بعد)',
  'said-after-the-last-tashahhud-and-before-salam': 'سلام پھیرنے سے پہلے کی دعائیں',
  'after-salam': 'نماز کے سلام کے بعد کے اذکار',
  'for-seeking-guidance-in-forming-a-decision-or-choosing-the-proper-course': 'دعائے استخارہ',
  'in-the-morning-and-evening': 'صبح اور شام کے مسنون اذکار',
  'before-sleeping': 'سونے سے پہلے کے اذکار',
  'when-tossing-and-turning-during-the-night': 'رات کو بے خوابی یا کروٹ بدلتے وقت',
  'upon-experiencing-unrest-fear-apprehensiveness-during-sleep-or-loneliness': 'نیند میں ڈر یا گھبراہٹ کے وقت کی دعا',
  'upon-seeing-a-good-dream-or-a-bad-dream': 'اچھا یا برا خواب دیکھنے کے بعد',
  'qunoot-al-witr': 'دعائے قنوت وتر',
  'immediately-after-salam-of-the-witr-prayer': 'وتر کے سلام کے فوراً بعد کا ذکر',
  'for-anxiety-and-sorrow': 'فکر، غم اور پریشانی کی دعا',
  'for-one-in-distress': 'سخت مصیبت اور بے چینی کی دعا',
  'upon-encountering-an-enemy-or-those-of-authority': 'دشمن یا ظالم حاکم سے سامنا ہونے پر',
  'for-one-afraid-of-the-rulers-injustice': 'حاکم کے ظلم سے خوفزدہ شخص کی دعا',
  'against-enemies': 'دشمنوں کے خلاف دعا',
  'when-fearing-a-group-of-people': 'کسی قوم یا گروہ سے خوف کے وقت',
  'for-one-afflicted-with-doubt-in-his-faith': 'ایمان میں وسوسہ آنے پر دعا',
  'settling-a-debt': 'قرض کی ادائیگی کی دعا',
  'for-one-afflicted-by-whisperings-in-prayer-or-recitation': 'نماز یا تلاوت میں وسوسے دور کرنے کی دعا',
  'for-one-whose-affairs-have-become-difficult': 'مشکل آسان کرنے کی دعا',
  'upon-committing-a-sin': 'گناہ سرزد ہونے پر توبہ کی دعا',
  'for-expelling-the-devil-and-his-whisperings': 'شیطان اور اس کے وسوسوں کو بھگانے کی دعا',
  'when-stricken-with-a-mishap-or-overtaken-by-an-affair': 'ناگوار بات یا حادثہ پیش آنے پر دعا',
  'congratulations-on-the-occasion-of-a-birth': 'ولادت پر مبارکباد اور دعا',
  'placing-children-under-allahs-protection': 'بچوں کی حفاظت اور دم کرنے کی دعا',
  'when-visiting-the-sick': 'مریض کی عیادت کے وقت کی دعا',
  'excellence-of-visiting-the-sick': 'مریض کی عیادت کی فضیلت',
  'when-the-sick-have-renounced-all-hope-of-life': 'مایوس العلاج مریض کی دعا',
  'instruction-for-the-one-nearing-death': 'قریب المرگ کو تلقین (کلمہ)',
  'for-one-afflicted-by-a-calamity': 'مصیبت کے وقت کی دعا (انا للہ)',
  'when-closing-the-eyes-of-the-deceased': 'میت کی آنکھیں بند کرتے وقت کی دعا',
  'for-the-deceased-at-the-funeral-prayer': 'نماز جنازہ کی دعا',
  'when-the-deceased-is-a-child-during-the-funeral-prayer': 'نابالغ بچے کی نماز جنازہ کی دعا',
  'condolence': 'تعزیت کے کلمات',
  'placing-the-deceased-in-the-grave': 'میت کو قبر میں اتارتے وقت کی دعا',
  'after-burying-the-deceased': 'تدفین کے بعد کی دعا',
  'visiting-the-graves': 'زیارت قبور کی دعا',
  'during-a-wind-storm': 'آندھی اور تیز ہوا کے وقت کی دعا',
  'upon-hearing-thunder': 'بجلی کی گرج سن کر دعا',
  'for-rain': 'طلب باران (استسقاء) کی دعا',
  'when-it-rains': 'بارش برستے وقت کی دعا',
  'after-rainfall': 'بارش کے بعد کا ذکر',
  'asking-for-clear-skies': 'بارش بند ہونے اور بادل چھٹنے کی دعا',
  'upon-sighting-the-crescent-moon': 'نیا چاند دیکھنے کی دعا',
  'upon-breaking-fast': 'افطار کے وقت کی دعا',
  'before-eating': 'کھانا شروع کرنے کی دعا',
  'upon-completing-the-meal': 'کھانے سے فارغ ہونے کی دعا',
  'of-the-guest-for-the-host': 'مہمان کی میزبان کے لیے دعا',
  'to-one-offering-a-drink-or-to-one-who-intended-to-do-so': 'پانی یا کھانا کھلانے والے کے لیے دعا',
  'when-breaking-fast-in-someones-home': 'کسی کے ہاں روزہ افطار کرنے کی دعا',
  'by-one-fasting-when-presented-with-food-and-does-not-break-his-fast': 'روزہ دار کو کھانے کی دعوت پر دعا',
  'when-insulted-while-fasting': 'روزہ کی حالت میں کوئی گالی دے تو کیا کہے',
  'upon-seeing-the-early-or-premature-fruit': 'نیا پھل دیکھنے کی دعا',
  'upon-sneezing': 'چھینک آنے کے آداب و دعائیں',
  'to-the-newlywed': 'شادی کے موقع پر دولہا دلہن کو دعا',
  'the-grooms-supplication-on-the-wedding-night': 'شادی کی پہلی رات کی دعا',
  'before-sexual-intercourse': 'ہمبستری سے پہلے کی دعا',
  'when-angry': 'غصہ آنے کے وقت کی دعا',
  'upon-seeing-someone-in-trial-or-tribulation': 'مصیبت زدہ کو دیکھ کر پڑھنے کی دعا',
  'remembrance-said-at-a-sitting-or-gathering': 'مجلس میں بیٹھنے کا ذکر',
  'for-the-expiation-of-sins-said-at-the-conclusion-of-a-sitting-or-gathering': 'کفارہ مجلس کی دعا',
  'supplication-for-someone-who-says-may-allah-forgive-you': 'غفر اللہ لک کے جواب میں دعا',
  'to-one-who-does-you-a-favour': 'احسان کرنے والے کو جزاک اللہ خیرا کہنا',
  'protection-from-the-dajjal': 'فتنہ دجال سے بچاؤ کی دعا',
  'to-one-who-pronounces-his-love-for-you-for-allahs-sake': 'محبت فی اللہ کا اظہار کرنے والے کو دعا',
  'to-someone-who-has-offered-you-some-of-his-wealth': 'مال پیش کرنے والے کو دعا',
  'to-the-debtor-upon-repayment-of-the-credit': 'قرض ادا کرتے وقت قرض خواہ کی دعا',
  'for-fear-of-shirk': 'شرک کے خوف کے وقت کی دعا',
  'returning-a-supplication-after-having-bestowed-a-gift-or-charity': 'صدقہ یا تحفہ قبول کرتے وقت کی دعا',
  'forbiddance-of-ascribing-things-to-omens': 'بدشگونی کا رد اور دعا',
  'when-riding-a-mount-or-vehicle': 'سواری پر سوار ہوتے وقت کی دعا',
  'for-travel': 'سفر کی مسنون دعا',
  'upon-entering-a-town-or-city': 'کسی بستی یا شہر میں داخل ہوتے وقت کی دعا',
  'when-entering-the-market': 'بازار میں داخل ہوتے وقت کی دعا',
  'for-when-the-mount-or-vehicle-stumbles': 'سواری ٹھوکر کھائے تو کیا کہے',
  'the-supplication-of-the-traveller-for-the-resident': 'مسافر کی مقیم کے لیے دعا',
  'supplication-of-the-resident-for-the-traveller': 'مقیم کی مسافر کے لیے دعا',
  'takbeer-and-tasbeeh-during-travel': 'سفر کے دوران تکبیر و تسبیح',
  'the-travellers-supplication-at-dawn': 'مسافر کی سحری کے وقت کی دعا',
  'when-stopping-or-alighting-at-a-place': 'منزل پر اترتے وقت کی دعا',
  'while-returning-from-travel': 'سفر سے واپسی کی دعا',
  'upon-receiving-pleasing-or-displeasing-news': 'خوش کن یا ناپسندیدہ خبر سننے پر',
  'excellence-of-sending-prayers-upon-the-prophet-saws': 'نبی کریم ﷺ پر درود بھیجنے کی فضیلت',
  'excellence-of-spreading-the-islamic-greeting': 'سلام پھیلانے کی فضیلت',
  'returning-a-greeting-to-a-disbeliever': 'غیر مسلم کے سلام کا جواب',
  'upon-hearing-the-cock-crow-or-the-donkey-bray': 'مرغ کی بانگ یا گدھے کی آواز سن کر',
  'upon-hearing-a-dog-barking-at-night': 'رات کو کتے کے بھونکنے پر دعا',
  'supplication-for-someone-you-have-insulted': 'جس کو غصے میں کچھ کہہ دیا ہو اس کے لیے دعا',
  'the-etiquette-of-praising-a-fellow-muslim': 'کسی مسلمان کی تعریف کرنے کے آداب',
  'what-a-muslim-should-say-when-praised': 'اپنی تعریف سن کر کیا کہے',
  'talbiyah-for-the-one-entering-ihram-for-hajj-or-umrah': 'احرام کی تلبیہ (حج و عمرہ)',
  'the-takbeer-passing-the-black-stone': 'حجر اسود کے سامنے تکبیر',
  'between-the-yemeni-corner-and-the-black-stone': 'رکن یمانی اور حجر اسود کے درمیان کی دعا',
  'when-at-mount-safa-and-mount-marwah': 'صفا اور مروہ پر کھڑے ہو کر دعائیں',
  'the-day-of-arafah': 'یوم عرفہ کی دعا',
  'at-the-sacred-site-al-mashar-al-haram': 'مشعر حرام (مزدلفہ) میں دعا',
  'when-throwing-each-pebble-at-the-jamarat': 'جمرات پر کنکریاں مارتے وقت تکبیر',
  'at-times-of-amazement-and-that-which-delights': 'تعجب اور خوشی کے لمحات میں',
  'upon-receiving-pleasant-news': 'خوشخبری ملنے پر سجدہ شکر',
  'when-feeling-some-pain-in-the-body': 'جسم میں درد محسوس ہونے پر دم',
  'when-fearing-that-an-evil-eye-may-afflict-something': 'نظر بد سے بچاؤ کی دعا (ما شاء اللہ)',
  'when-startled-or-frightened': 'خوفزدہ یا چونک جانے کے وقت',
  'when-slaughtering-or-sacrificing-an-animal': 'ذبح یا قربانی کے وقت کی دعا',
  'to-ward-off-the-plot-of-the-rebellious-devils': 'سرکش شیاطین کی سازش کو دفع کرنے کی دعا',
  'seeking-forgiveness-and-repentance': 'استغفار اور توبہ کی دعائیں',
  'excellence-of-tasbih-tahmid-tahlil-and-takbir': 'تسبیح، تحمید، تہلیل اور تکبیر کی فضیلت',
  'how-the-prophet-made-tasbeeh': 'نبی کریم ﷺ تسبیح کیسے شمار فرماتے تھے',
  'comprehensive-types-of-good-and-manners': 'جامع خیر اور نبوی آداب'
};

export async function runFetchAndCurateDuas(outputDir: string) {
  console.log('Fetching raw Hisn al-Muslim datasets...');
  const arData = await fetchJson<Record<string, { Adhkar: DeenHubDua[] }>>(
    'https://raw.githubusercontent.com/alhaq-initiative/DeenHub/master/assets/hisnulmuslim/hisnulmuslim.json'
  );
  const enData = await fetchJson<Record<string, { TitleEn: string; Adhkar: DeenHubEnDua[] }>>(
    'https://raw.githubusercontent.com/alhaq-initiative/DeenHub/master/assets/hisnulmuslim/hisnulmuslim-en.json'
  );
  const hisnAr = await fetchJson<Record<string, { text: string[]; footnote: string[] }>>(
    'https://raw.githubusercontent.com/abdalrhmanreda/islamic-data-assets/master/hisn_almuslim.json'
  );
  const asellam = await fetchJson<Record<string, { Adhkar: AsellamDua[] }>>(
    'https://raw.githubusercontent.com/asellam/HisnElMuslim/master/hisn.json'
  );

  console.log('Building asellam repeat count lookup map...');
  const asellamMap = new Map<string, number>();
  for (const ch of Object.values(asellam)) {
    for (const adh of ch.Adhkar) {
      if (adh.Count > 1) {
        const key = adh.Text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/\s+/g, ' ').trim().slice(0, 30);
        asellamMap.set(key, adh.Count);
      }
    }
  }

  // Chapter titles in Arabic (skip 2 intro items)
  const arChapterNames = Object.keys(hisnAr).slice(2);
  const enChapterKeys = Object.keys(enData);

  console.log(`Processing ${enChapterKeys.length} categories...`);

  // 1. Sources JSON
  const sourcesData = [
    {
      id: 'hisn-al-muslim',
      slug: 'hisn-al-muslim',
      nameArabic: 'حِصْنُ المُسْلِمِ مِنْ أَذْكَارِ الكِتَابِ وَالسُّنَّةِ',
      nameEnglish: 'Fortress of the Muslim (Hisn al-Muslim)',
      nameUrdu: 'حصن المسلم من أذكار الكتاب والسنة',
      author: "Shaykh Sa'id ibn Ali ibn Wahf al-Qahtani (رحمه الله)",
      authorArabic: 'د. سعيد بن علي بن وهف القحطاني',
      authorDeathYearAh: 1440,
      authorDeathYearCe: 2018,
      license: 'Islamic Waqf (Dedicated for Free Non-Commercial Propagation)',
      description:
        'The globally authoritative compendium of authentic daily supplications and remembrances derived strictly from the Noble Quran and Sahih Sunnah.',
      status: 'published'
    }
  ];

  // 2. Categories JSON
  const categoriesData: any[] = [];
  const duasData: any[] = [];
  let globalItemNumber = 0;

  for (let cIdx = 0; cIdx < enChapterKeys.length; cIdx++) {
    const chKey = enChapterKeys[cIdx];
    const enChapter = enData[chKey];
    const arChapter = arData[chKey];
    const arName = arChapterNames[cIdx] || chKey.replace(/^Chapter:\s*/, '');
    const enName = chKey.replace(/^Chapter:\s*/, '').trim();
    const slug = slugify(chKey);
    const urduName = URDU_CATEGORY_NAMES[slug] || null;

    const totalDuasInChapter = arChapter && arChapter.Adhkar ? arChapter.Adhkar.length : 0;

    categoriesData.push({
      id: cIdx + 1,
      slug,
      nameArabic: arName,
      nameEnglish: enName,
      nameUrdu: urduName,
      sortOrder: cIdx + 1,
      totalDuas: totalDuasInChapter
    });

    if (!arChapter || !arChapter.Adhkar) continue;

    for (let dIdx = 0; dIdx < arChapter.Adhkar.length; dIdx++) {
      globalItemNumber++;
      const arItem = arChapter.Adhkar[dIdx];
      const enItem = enChapter.Adhkar[dIdx];

      // Verbatim Arabic text with full tashkeel
      let arabicText = (arItem.Text || '').trim().normalize('NFC');
      // Normalize single newline formatting
      arabicText = arabicText.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();

      // Upstream encoding fixes for rare U+FFFD artifacts
      arabicText = arabicText
        .replace(/\u0627\u0644\u062C\u064E\u0640\uFFFD\uFFFD\u064E\u0651\u0629\u064E/g, 'الجَنَّةَ')
        .replace(/كِتَا[\uFFFD\uFFFD]+ِكَ/g, 'كِتَابِكَ');

      const parsedEn = parseTextEn(enItem ? enItem.TextEn : '');
      if (parsedEn.transliteration) {
        parsedEn.transliteration = parsedEn.transliteration.replace(/lill[\uFFFD\uFFFD]+h/g, 'lillāh');
      }
      const count = detectRepetitionCount(enItem ? enItem.TextEn : '', arabicText, asellamMap);
      const quranCitation = detectQuranCitation(enItem ? enItem.TextEn : '', arabicText);
      const hadithCitation = detectHadithCitation(parsedEn.reference);

      const checksum = calculateSha256(arabicText);
      const textClean = normalizeArabicSearchText(arabicText);

      duasData.push({
        id: `hisn-${globalItemNumber}`,
        categoryId: cIdx + 1,
        categorySlug: slug,
        sourceId: 'hisn-al-muslim',
        itemNumber: globalItemNumber,
        arabicText,
        transliteration: parsedEn.transliteration,
        translationEnglish: parsedEn.translation,
        translationUrdu: null, // Verbatim Urdu text preserved as null where unapproved
        repeatCount: count,
        occasionContext: parsedEn.context || null,
        quranSurah: quranCitation.surah,
        quranAyah: quranCitation.ayah,
        hadithCollection: hadithCitation.collection,
        hadithNumber: hadithCitation.number,
        hadithReference: parsedEn.reference,
        hadithGrade: hadithCitation.grade,
        textChecksum: checksum,
        textClean
      });
    }
  }

  console.log(`Writing datasets to ${outputDir}...`);
  fs.writeFileSync(path.join(outputDir, 'sources.json'), JSON.stringify(sourcesData, null, 2), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'categories.json'), JSON.stringify(categoriesData, null, 2), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'duas.json'), JSON.stringify(duasData, null, 2), 'utf8');

  console.log(`Successfully curated:`);
  console.log(`  Sources: ${sourcesData.length}`);
  console.log(`  Categories: ${categoriesData.length}`);
  console.log(`  Duas: ${duasData.length}`);

  return {
    sourcesCount: sourcesData.length,
    categoriesCount: categoriesData.length,
    duasCount: duasData.length
  };
}

if (process.argv[1] && process.argv[1].endsWith('fetch-duas-sources.ts')) {
  const targetDir = path.resolve(__dirname, '../../data/duas');
  runFetchAndCurateDuas(targetDir).catch((err) => {
    console.error('Fatal fetch error:', err);
    process.exit(1);
  });
}
