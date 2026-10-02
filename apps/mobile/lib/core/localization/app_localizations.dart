import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// Trilingual localization system supporting English (en), Arabic (ar), and Urdu (ur).
class AppLocalizations {
  final Locale locale;

  const AppLocalizations(this.locale);

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static const List<Locale> supportedLocales = [
    Locale('en'),
    Locale('ar'),
    Locale('ur'),
  ];

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations) ??
        const AppLocalizations(Locale('en'));
  }

  bool get isRtl => locale.languageCode == 'ar' || locale.languageCode == 'ur';

  // Navigation & Sections
  String get appTitle => _t(
        en: 'ISLAM UL HARAMAIN',
        ar: 'إسلام الحرمين',
        ur: 'اسلام الحرمین',
      );

  String get navHome => _t(en: 'Home', ar: 'الرئيسية', ur: 'مرکزی صفحہ');
  String get navQuran => _t(en: 'Holy Quran', ar: 'القرآن الكريم', ur: 'قرآن مجید');
  String get navHadith => _t(en: 'Hadith', ar: 'الحديث النبوي', ur: 'حدیث نبوی');
  String get navDuas => _t(en: 'Duas & Adhkar', ar: 'الأدعية والأذكار', ur: 'دعائیں اور اذکار');
  String get navPrayer => _t(en: 'Prayer Times', ar: 'مواقيت الصلاة', ur: 'نماز کے اوقات');
  String get navQibla => _t(en: 'Qibla', ar: 'القبلة', ur: 'قبلہ رخ');
  String get navAudio => _t(en: 'Audio Reciters', ar: 'التلاوات الصوتية', ur: 'تلاوت قرآن');
  String get navTafsir => _t(en: 'Classical Tafsir', ar: 'التفسير المقارن', ur: 'تفسیر قرآنی');
  String get navBooks => _t(en: 'Islamic Books', ar: 'المكتبة الإسلامية', ur: 'اسلامی کتب');
  String get navLibrary => _t(en: 'My Library', ar: 'مكتبتي', ur: 'میری لائبریری');
  String get navSettings => _t(en: 'Settings', ar: 'الإعدادات', ur: 'ترتیبات');
  String get navSearch => _t(en: 'Search', ar: 'البحث', ur: 'تلاش');

  // Bookmarks & Library
  String get bookmarksTab => _t(en: 'Bookmarks', ar: 'الإشارات المرجعية', ur: 'بک مارکس');
  String get readingProgressTab => _t(en: 'Reading Progress', ar: 'متابعة القراءة', ur: 'پڑھنے کی پیش رفت');
  String get noBookmarksFound => _t(
        en: 'No bookmarks saved yet.',
        ar: 'لا توجد إشارات مرجعية محفوظة بعد.',
        ur: 'کوئی بک مارک محفوظ نہیں ہے۔',
      );
  String get noProgressFound => _t(
        en: 'No reading progress recorded yet.',
        ar: 'لا يوجد تقدم قراءة مسجل بعد.',
        ur: 'کوئی مطالعہ کی پیش رفت ریکارڈ نہیں کی گئی۔',
      );
  String get addBookmark => _t(en: 'Save Bookmark', ar: 'حفظ إشارة مرجعية', ur: 'بک مارک محفوظ کریں');
  String get removeBookmark => _t(en: 'Remove Bookmark', ar: 'إزالة الإشارة المرجعية', ur: 'بک مارک ہٹائیں');
  String get bookmarkSaved => _t(en: 'Bookmark saved locally', ar: 'تم حفظ الإشارة محلياً', ur: 'بک مارک محفوظ ہو گیا');
  String get bookmarkRemoved => _t(en: 'Bookmark removed', ar: 'تم حذف الإشارة', ur: 'بک مارک ہٹا دیا گیا');
  String get filterAll => _t(en: 'All', ar: 'الكل', ur: 'تمام');

  // Content Discriminators
  String get typeQuran => _t(en: 'Quran', ar: 'القرآن', ur: 'قرآن');
  String get typeHadith => _t(en: 'Hadith', ar: 'الحديث', ur: 'حدیث');
  String get typeDua => _t(en: 'Dua', ar: 'الدعاء', ur: 'دعا');
  String get typeArticle => _t(en: 'Article', ar: 'المقال', ur: 'مضمون');
  String get typeBook => _t(en: 'Book', ar: 'الكتاب', ur: 'کتاب');

  // Settings
  String get settingsTheme => _t(en: 'Theme Mode', ar: 'المظهر', ur: 'تھیم موڈ');
  String get themeSystem => _t(en: 'System Default', ar: 'تلقائي النظام', ur: 'سسٹم ڈیفالٹ');
  String get themeLight => _t(en: 'Light Mode', ar: 'الوضع الفاتح', ur: 'روشن موڈ');
  String get themeDark => _t(en: 'Dark Mode', ar: 'الوضع الداكن', ur: 'تاریک موڈ');
  String get settingsLanguage => _t(en: 'Language', ar: 'اللغة', ur: 'زبان');
  String get settingsScript => _t(en: 'Arabic Script', ar: 'رسم المصحف', ur: 'عربی رسم الخط');
  String get scriptUthmani => _t(en: 'Uthmani (Madinah)', ar: 'الرسم العثماني (المدينة)', ur: 'عثمانی رسم الخط');
  String get scriptIndoPak => _t(en: 'Indo-Pak / Nastaliq', ar: 'الرسم الهندي / الباكستاني', ur: 'ہند و پاک رسم الخط');
  String get settingsArabicFontSize => _t(en: 'Arabic Font Size', ar: 'حجم الخط العربي', ur: 'عربی فونٹ سائز');
  String get settingsTranslationFontSize => _t(en: 'Translation Font Size', ar: 'حجم خط الترجمة', ur: 'ترجمہ فونٹ سائز');
  String get settingsPrayerMethod => _t(en: 'Prayer Calculation Method', ar: 'طريقة حساب الصلاة', ur: 'طریقہ حساب اوقات نماز');
  String get settingsMadhab => _t(en: 'Asr Madhab', ar: 'مذهب صلاة العصر', ur: 'عصر کا فقہی مسلک');
  String get madhabShafi => _t(en: 'Standard (Shafi`i / Maliki / Hanbali)', ar: 'الجمهور (شافعي / مالكي / حنبلي)', ur: 'جمہور (شافعی / مالکی / حنبلی)');
  String get madhabHanafi => _t(en: 'Hanafi', ar: 'الحنفي', ur: 'حنفی');
  String get settingsSync => _t(en: 'Offline Sync Preparation', ar: 'إعداد المزامنة المحلية', ur: 'آف لائن ہم وقتی تیاری');
  String get databaseEncrypted => _t(en: 'Encrypted Drift SQLite Active', ar: 'قاعدة بيانات SQLite مشفرة ونشطة', ur: 'محفوظ اور انکرپٹڈ لوکل ڈیٹا بیس فعال ہے');

  // Devotional Suite (M5.2)
  String get prayerFajr => _t(en: 'Fajr', ar: 'الفجر', ur: 'فجر');
  String get prayerSunrise => _t(en: 'Sunrise', ar: 'الشروق', ur: 'طلوع آفتاب');
  String get prayerDhuhr => _t(en: 'Dhuhr', ar: 'الظهر', ur: 'ظہر');
  String get prayerAsr => _t(en: 'Asr', ar: 'العصر', ur: 'عصر');
  String get prayerMaghrib => _t(en: 'Maghrib', ar: 'المغرب', ur: 'مغرب');
  String get prayerIsha => _t(en: 'Isha', ar: 'العشاء', ur: 'عشاء');
  String get devotionalImsak => _t(en: 'Imsak', ar: 'الإمساك', ur: 'امساک');
  String get devotionalMidnight => _t(en: 'Midnight', ar: 'منتصف الليل', ur: 'نصف شب');
  String get devotionalLastThird => _t(en: 'Last Third (Tahajjud)', ar: 'الثلث الأخير (التهجد)', ur: 'آخری تہائی (تہجد)');
  String get nextPrayer => _t(en: 'Next Prayer', ar: 'الصلاة القادمة', ur: 'اگلی نماز');
  String get timeRemaining => _t(en: 'Time Remaining', ar: 'الوقت المتبقي', ur: 'باقی وقت');
  String get selectCity => _t(en: 'Select City', ar: 'اختر المدينة', ur: 'شہر منتخب کریں');
  String get calculationSettings => _t(en: 'Calculation Settings', ar: 'إعدادات الحساب', ur: 'طریقہ حساب ترتیبات');
  String get qiblaHeading => _t(en: 'Heading', ar: 'الاتجاه', ur: 'زاویہ رخ');
  String get qiblaBearing => _t(en: 'Qibla Bearing', ar: 'اتجاه القبلة', ur: 'قبلہ رخ');
  String get distanceToKaaba => _t(en: 'Distance to Kaaba', ar: 'المسافة إلى الكعبة', ur: 'کعبہ تک فاصلہ');
  String get qiblaAligned => _t(en: 'Aligned with Kaaba', ar: 'محاذاة القبلة المشرفة', ur: 'قبلہ رخ درست ہے');
  String get manualHeadingMode => _t(en: 'Manual Calibration Dial', ar: 'المعايرة اليدوية', ur: 'دستی زاویہ پیمائش');
  String get navTasbeeh => _t(en: 'Digital Tasbeeh', ar: 'المسبحة الإلكترونية', ur: 'ڈیجیٹل تسبیح');
  String get tasbeehTarget => _t(en: 'Target', ar: 'الهدف', ur: 'ہدف');
  String get tasbeehReset => _t(en: 'Reset', ar: 'إعادة ضبط', ur: 'دوبارہ شروع');
  String get tasbeehComplete => _t(en: 'Target Completed! Alhamdulillah', ar: 'اكتمل الهدف! الحمد لله', ur: 'ہدف مکمل ہوا! الحمد لله');
  String get tasbeehCycles => _t(en: 'Laps / Cycles', ar: 'الدورات المكتملة', ur: 'چکر مکمل');

  // Audio & Recitations (M5.3)
  String get audioReciters => _t(en: 'Verified Reciters', ar: 'كبار القراء المعتمدين', ur: 'مستند قراء کرام');
  String get audioPlay => _t(en: 'Play', ar: 'تشغيل', ur: 'چلائیں');
  String get audioPause => _t(en: 'Pause', ar: 'إيقاف مؤقت', ur: 'وقف کریں');
  String get audioNext => _t(en: 'Next Surah', ar: 'السورة التالية', ur: 'اگلی سورت');
  String get audioPrevious => _t(en: 'Previous Surah', ar: 'السورة السابقة', ur: 'پچھلی سورت');
  String get audioNextAyah => _t(en: 'Next Ayah', ar: 'الآية التالية', ur: 'اگلی آیت');
  String get audioPreviousAyah => _t(en: 'Previous Ayah', ar: 'الآية السابقة', ur: 'پچھلی آیت');
  String get audioSpeed => _t(en: 'Playback Speed', ar: 'سرعة التلاوة', ur: 'تلاوت کی رفتار');
  String get audioRepeat => _t(en: 'Repeat Mode', ar: 'نمط التكرار', ur: 'تکرار کا انداز');
  String get audioRepeatOff => _t(en: 'Off', ar: 'إيقاف', ur: 'بند');
  String get audioRepeatAll => _t(en: 'All Surahs', ar: 'جميع السور', ur: 'تمام سورتیں');
  String get audioRepeatOne => _t(en: 'Current Surah', ar: 'السورة الحالية', ur: 'موجودہ سورت');
  String get audioRepeatAyah => _t(en: 'Current Ayah', ar: 'الآية الحالية', ur: 'موجودہ آیت');
  String get audioWaqfAttribution => _t(
        en: 'Islamic Waqf Open Audio (EveryAyah / Archive.org)',
        ar: 'وقف إسلامي لتلاوات القرآن الكريم (EveryAyah / Archive.org)',
        ur: 'اسلامی وقف تلاوت قرآن (EveryAyah / Archive.org)',
      );
  String get audioAyahJump => _t(en: 'Jump to Ayah', ar: 'الانتقال إلى الآية', ur: 'آیت پر جائیں');
  String get audioPlatformNotice => _t(
        en: 'Background Audio Architecture Ready',
        ar: 'بنية تشغيل الصوت بالخلفية جاهزة',
        ur: 'بیک گراؤنڈ آڈیو آرکیٹیکچر تیار ہے',
      );
  String get audioMiniPlayer => _t(en: 'Now Playing', ar: 'قيد التشغيل الآن', ur: 'زیر سماعت');

  // Common
  String get loading => _t(en: 'Loading...', ar: 'جاري التحميل...', ur: 'لوڈ ہو رہا ہے...');
  String get save => _t(en: 'Save', ar: 'حفظ', ur: 'محفوظ کریں');
  String get cancel => _t(en: 'Cancel', ar: 'إلغاء', ur: 'منسوخ');
  String get retry => _t(en: 'Retry', ar: 'إعادة المحاولة', ur: 'دوبارہ کوشش کریں');
  String get delete => _t(en: 'Delete', ar: 'حذف', ur: 'حذف کریں');

  // Error Sanctuary & Diagnostics (M8.4)
  String get errorSanctuaryTitle => _t(
        en: 'Peace & Serenity',
        ar: 'سكينة وطمأنينة',
        ur: 'سکون اور اطمینان',
      );
  String get errorSanctuaryMessage => _t(
        en: 'An unexpected interruption occurred. Please try again or return to the Sanctuary Home.',
        ar: 'حدث انقطاع غير متوقع. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.',
        ur: 'ایک غیر متوقع رکاوٹ پیش آگئی ہے۔ براہ کرم دوبارہ کوشش کریں یا مرکزی صفحہ پر واپس جائیں۔',
      );
  String get returnToSanctuaryHome => _t(
        en: 'Return to Sanctuary Home',
        ar: 'العودة إلى الصفحة الرئيسية',
        ur: 'مرکزی صفحہ پر واپس جائیں',
      );
  String get settingsDiagnosticsTitle => _t(
        en: 'Anonymous Diagnostics',
        ar: 'التشخيص المجهول للسلامة',
        ur: 'گمنام تشخیصی رپورٹنگ',
      );
  String get settingsDiagnosticsSubtitle => _t(
        en: 'Help improve reliability with anonymized crash reports. Worship data, notes, and coordinates are never collected.',
        ar: 'المساعدة في تحسين الموثوقية من خلال تقارير الأعطال المجهولة. لا يتم جمع بيانات العبادة أو الملاحظات أو الإحداثيات أبداً.',
        ur: 'گمنام کریش رپورٹس کے ساتھ ایپ کی پائیداری میں مدد کریں۔ عبادات کا ڈیٹا، نوٹس یا مقامات کبھی جمع نہیں کیے جاتے۔',
      );

  String _t({required String en, required String ar, required String ur}) {
    switch (locale.languageCode) {
      case 'ar':
        return ar;
      case 'ur':
        return ur;
      case 'en':
      default:
        return en;
    }
  }
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'ar', 'ur'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(AppLocalizations(locale));
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
