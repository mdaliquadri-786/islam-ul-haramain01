/// Multilingual Islamic month names.
class HijriMonth {
  final int number;
  final String englishName;
  final String arabicName;
  final String urduName;

  const HijriMonth({
    required this.number,
    required this.englishName,
    required this.arabicName,
    required this.urduName,
  });
}

const kHijriMonths = <HijriMonth>[
  HijriMonth(number: 1, englishName: 'Muharram', arabicName: 'محرم', urduName: 'محرم'),
  HijriMonth(number: 2, englishName: 'Safar', arabicName: 'صفر', urduName: 'صفر'),
  HijriMonth(number: 3, englishName: 'Rabi` al-Awwal', arabicName: 'ربيع الأول', urduName: 'ربیع الاول'),
  HijriMonth(number: 4, englishName: 'Rabi` al-Thani', arabicName: 'ربيع الثاني', urduName: 'ربیع الثانی'),
  HijriMonth(number: 5, englishName: 'Jumada al-Ula', arabicName: 'جمادى الأولى', urduName: 'جمادی الاولی'),
  HijriMonth(number: 6, englishName: 'Jumada al-Akhirah', arabicName: 'جمادى الآخرة', urduName: 'جمادی الآخرہ'),
  HijriMonth(number: 7, englishName: 'Rajab', arabicName: 'رجب', urduName: 'رجب'),
  HijriMonth(number: 8, englishName: 'Sha`ban', arabicName: 'شعبان', urduName: 'شعبان'),
  HijriMonth(number: 9, englishName: 'Ramadan', arabicName: 'رمضان', urduName: 'رمضان'),
  HijriMonth(number: 10, englishName: 'Shawwal', arabicName: 'شوال', urduName: 'شوال'),
  HijriMonth(number: 11, englishName: 'Dhu al-Qi`dah', arabicName: 'ذو القعدة', urduName: 'ذوالقعدہ'),
  HijriMonth(number: 12, englishName: 'Dhu al-Hijjah', arabicName: 'ذو الحجة', urduName: 'ذوالحجہ'),
];

/// A significant religious milestone in the Islamic calendar.
class IslamicHoliday {
  final int month;
  final int day;
  final String nameEnglish;
  final String nameArabic;
  final String nameUrdu;

  const IslamicHoliday({
    required this.month,
    required this.day,
    required this.nameEnglish,
    required this.nameArabic,
    required this.nameUrdu,
  });
}

const kIslamicHolidays = <IslamicHoliday>[
  IslamicHoliday(month: 1, day: 1, nameEnglish: 'Islamic New Year', nameArabic: 'رأس السنة الهجرية', nameUrdu: 'نیا اسلامی سال'),
  IslamicHoliday(month: 1, day: 10, nameEnglish: 'Day of Ashura', nameArabic: 'يوم عاشوراء', nameUrdu: 'یوم عاشوراء'),
  IslamicHoliday(month: 3, day: 12, nameEnglish: 'Mawlid an-Nabi', nameArabic: 'المولد النبوي الشريف', nameUrdu: 'میلاد النبی'),
  IslamicHoliday(month: 7, day: 27, nameEnglish: 'Al-Isra` wal-Mi`raj', nameArabic: 'الإسراء والمعراج', nameUrdu: 'شب معراج'),
  IslamicHoliday(month: 8, day: 15, nameEnglish: 'Nisf Sha`ban', nameArabic: 'ليلة النصف من شعبان', nameUrdu: 'شب برات'),
  IslamicHoliday(month: 9, day: 1, nameEnglish: 'First Day of Ramadan', nameArabic: 'أول أيام شهر رمضان', nameUrdu: 'پہلا روزہ'),
  IslamicHoliday(month: 9, day: 27, nameEnglish: 'Laylat al-Qadr', nameArabic: 'ليلة القدر المباركة', nameUrdu: 'شب قدر'),
  IslamicHoliday(month: 10, day: 1, nameEnglish: 'Eid al-Fitr', nameArabic: 'عيد الفطر المبارك', nameUrdu: 'عید الفطر'),
  IslamicHoliday(month: 12, day: 9, nameEnglish: 'Day of Arafah', nameArabic: 'يوم عرفة', nameUrdu: 'یوم عرفہ'),
  IslamicHoliday(month: 12, day: 10, nameEnglish: 'Eid al-Adha', nameArabic: 'عيد الأضحى المبارك', nameUrdu: 'عید الاضحی'),
];

/// Immutable representation of a Hijri date.
class HijriDate {
  final int year;
  final int month;
  final int day;
  final int dayOffset; // -2 to +2

  const HijriDate({
    required this.year,
    required this.month,
    required this.day,
    this.dayOffset = 0,
  });

  HijriMonth get monthInfo => kHijriMonths[month - 1];

  /// Returns the holiday if this date matches an Islamic milestone.
  IslamicHoliday? get holiday {
    for (final h in kIslamicHolidays) {
      if (h.month == month && h.day == day) return h;
    }
    return null;
  }

  /// Formatted English string (e.g. "15 Ramadan 1448 AH").
  String formatEnglish() => '$day ${monthInfo.englishName} $year AH';

  /// Formatted Arabic string (e.g. "١٥ رمضان ١٤٤٨ هـ").
  String formatArabic() => '$day ${monthInfo.arabicName} $year هـ';

  /// Formatted Urdu string (e.g. "15 رمضان 1448ھ").
  String formatUrdu() => '$day ${monthInfo.urduName} $yearھ';

  @override
  String toString() => formatEnglish();

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HijriDate &&
          runtimeType == other.runtimeType &&
          year == other.year &&
          month == other.month &&
          day == other.day;

  @override
  int get hashCode => year.hashCode ^ month.hashCode ^ day.hashCode;
}

/// Deterministic astronomical algorithm for Umm al-Qura calendar conversion.
class HijriCalendarCalculator {
  const HijriCalendarCalculator._();

  /// Converts a Gregorian DateTime to HijriDate with an optional manual day offset (-2 to +2).
  static HijriDate fromGregorian(DateTime gregorianDate, [int dayOffset = 0]) {
    // Clamp manual offset to [-2, +2]
    final offset = dayOffset.clamp(-2, 2);
    final adjustedDate = gregorianDate.add(Duration(days: offset));

    final y = adjustedDate.year;
    final m = adjustedDate.month;
    final d = adjustedDate.day;

    // Convert Gregorian to Julian Day Number
    var a = (14 - m) ~/ 12;
    var yJulian = y + 4800 - a;
    var mJulian = m + 12 * a - 3;
    var jdn = d +
        ((153 * mJulian + 2) ~/ 5) +
        365 * yJulian +
        (yJulian ~/ 4) -
        (yJulian ~/ 100) +
        (yJulian ~/ 400) -
        32045;

    // Epoch of Hijri calendar: Friday July 16, 622 CE (Julian Day 1948439)
    final l = jdn - 1948440 + 10632;
    final n = (l - 1) ~/ 10631;
    final lRemainder = l - 10631 * n + 354;
    final j = ((10985 - lRemainder) ~/ 5316) * ((50 * lRemainder) ~/ 17719) +
        (lRemainder ~/ 5670) * ((43 * lRemainder) ~/ 15238);
    final lCalculated = lRemainder -
        ((30 - j) ~/ 15) * ((17719 * j) ~/ 50) -
        (j ~/ 16) * ((15238 * j) ~/ 43) +
        29;

    var hijriMonth = (24 * lCalculated) ~/ 709;
    var hijriDay = lCalculated - (709 * hijriMonth) ~/ 24;
    var hijriYear = 30 * n + j - 30;

    // Edge cases
    if (hijriDay <= 0) {
      hijriDay = 1;
    }
    if (hijriMonth <= 0) {
      hijriMonth = 1;
    } else if (hijriMonth > 12) {
      hijriMonth = 12;
    }

    return HijriDate(
      year: hijriYear,
      month: hijriMonth,
      day: hijriDay,
      dayOffset: offset,
    );
  }
}
