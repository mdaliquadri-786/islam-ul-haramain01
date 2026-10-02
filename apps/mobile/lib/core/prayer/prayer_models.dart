import 'package:flutter/foundation.dart';

/// Supported canonical prayer calculation authorities.
enum CalculationMethod {
  mwl('Muslim World League', 'رابطة العالم الإسلامي', 18.0, 17.0, null),
  isna('Islamic Society of North America', 'الجمعية الإسلامية لأمريكا الشمالية', 15.0, 15.0, null),
  ummAlQura('Umm al-Qura University, Makkah', 'جامعة أم القرى - مكة المكرمة', 18.5, null, 90.0),
  karachi('University of Islamic Sciences, Karachi', 'جامعة العلوم الإسلامية بكراتشي', 18.0, 18.0, null),
  egyptian('Egyptian General Authority of Survey', 'الهيئة المصرية العامة للمساحة', 19.5, 17.5, null),
  diyanet('Directorate of Religious Affairs (Diyanet)', 'رئاسة الشؤون الدينية التركية', 18.0, 17.0, null),
  muis('Majlis Ugama Islam Singapura', 'مجلس أوغاما إسلام سينغافورا', 20.0, 18.0, null),
  custom('Custom Configuration', 'إعداد مخصص', 18.0, 17.0, null);

  final String displayName;
  final String arabicName;
  final double fajrAngle;
  final double? ishaAngle;
  final double? ishaIntervalMinutes;

  const CalculationMethod(
    this.displayName,
    this.arabicName,
    this.fajrAngle,
    this.ishaAngle,
    this.ishaIntervalMinutes,
  );

  static CalculationMethod fromString(String? key) {
    if (key == null) return CalculationMethod.mwl;
    switch (key.toLowerCase()) {
      case 'muslim_world_league':
      case 'mwl':
        return CalculationMethod.mwl;
      case 'north_america':
      case 'isna':
        return CalculationMethod.isna;
      case 'umm_al_qura':
      case 'ummalqura':
        return CalculationMethod.ummAlQura;
      case 'karachi':
        return CalculationMethod.karachi;
      case 'egyptian':
        return CalculationMethod.egyptian;
      case 'diyanet':
      case 'turkey':
        return CalculationMethod.diyanet;
      case 'muis':
      case 'singapore':
        return CalculationMethod.muis;
      case 'custom':
        return CalculationMethod.custom;
      default:
        return CalculationMethod.mwl;
    }
  }

  String toDbKey() {
    switch (this) {
      case CalculationMethod.mwl:
        return 'muslim_world_league';
      case CalculationMethod.isna:
        return 'north_america';
      case CalculationMethod.ummAlQura:
        return 'umm_al_qura';
      case CalculationMethod.karachi:
        return 'karachi';
      case CalculationMethod.egyptian:
        return 'egyptian';
      case CalculationMethod.diyanet:
        return 'diyanet';
      case CalculationMethod.muis:
        return 'muis';
      case CalculationMethod.custom:
        return 'custom';
    }
  }
}

/// Madhab for Asr calculation.
enum AsrMadhab {
  standard('Standard (Shafi`i / Maliki / Hanbali) — 1x shadow', 1.0),
  hanafi('Hanafi — 2x shadow', 2.0);

  final String displayName;
  final double shadowFactor;

  const AsrMadhab(this.displayName, this.shadowFactor);

  static AsrMadhab fromString(String? key) {
    if (key == null) return AsrMadhab.standard;
    return key.toLowerCase() == 'hanafi' ? AsrMadhab.hanafi : AsrMadhab.standard;
  }

  String toDbKey() => this == AsrMadhab.hanafi ? 'hanafi' : 'shafi';
}

/// High-latitude calculation adjustment rules.
enum HighLatitudeRule {
  angleBased('Angle-based (Night portion based on twilight angle)'),
  midnight('Midnight (Middle of the night)'),
  oneSeventh('One-Seventh of the night'),
  none('None (Strict astronomical)');

  final String displayName;

  const HighLatitudeRule(this.displayName);
}

/// The individual canonical prayers and devotional milestones.
enum PrayerName {
  fajr('Fajr', 'الفجر', 'فجر'),
  sunrise('Sunrise', 'الشروق', 'طلوع آفتاب'),
  dhuhr('Dhuhr', 'الظهر', 'ظہر'),
  asr('Asr', 'العصر', 'عصر'),
  maghrib('Maghrib', 'المغرب', 'مغرب'),
  isha('Isha', 'العشاء', 'عشاء');

  final String englishName;
  final String arabicName;
  final String urduName;

  const PrayerName(this.englishName, this.arabicName, this.urduName);
}

/// Geolocation coordinates and elevation.
@immutable
class PrayerCoordinates {
  final double latitude;
  final double longitude;
  final double elevation;
  final String? cityName;
  final String? timezoneId;

  const PrayerCoordinates({
    required this.latitude,
    required this.longitude,
    this.elevation = 0.0,
    this.cityName,
    this.timezoneId,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PrayerCoordinates &&
          runtimeType == other.runtimeType &&
          latitude == other.latitude &&
          longitude == other.longitude &&
          elevation == other.elevation;

  @override
  int get hashCode => latitude.hashCode ^ longitude.hashCode ^ elevation.hashCode;
}

/// Manual minute adjustments applied to calculated prayer times.
@immutable
class MinuteOffsets {
  final int fajr;
  final int sunrise;
  final int dhuhr;
  final int asr;
  final int maghrib;
  final int isha;

  const MinuteOffsets({
    this.fajr = 0,
    this.sunrise = 0,
    this.dhuhr = 0,
    this.asr = 0,
    this.maghrib = 0,
    this.isha = 0,
  });

  const MinuteOffsets.zero()
      : fajr = 0,
        sunrise = 0,
        dhuhr = 0,
        asr = 0,
        maghrib = 0,
        isha = 0;

  int forPrayer(PrayerName name) {
    switch (name) {
      case PrayerName.fajr:
        return fajr;
      case PrayerName.sunrise:
        return sunrise;
      case PrayerName.dhuhr:
        return dhuhr;
      case PrayerName.asr:
        return asr;
      case PrayerName.maghrib:
        return maghrib;
      case PrayerName.isha:
        return isha;
    }
  }
}

/// Complete prayer calculation output for a single day.
@immutable
class PrayerTimesResult {
  final DateTime date;
  final PrayerCoordinates coordinates;
  final CalculationMethod method;
  final AsrMadhab madhab;
  final HighLatitudeRule highLatitudeRule;
  final bool isPolarAdjusted;

  final DateTime fajr;
  final DateTime sunrise;
  final DateTime dhuhr;
  final DateTime asr;
  final DateTime maghrib;
  final DateTime isha;

  // Devotional milestones
  final DateTime imsak;
  final DateTime midnight;
  final DateTime lastThirdOfNight;

  const PrayerTimesResult({
    required this.date,
    required this.coordinates,
    required this.method,
    required this.madhab,
    required this.highLatitudeRule,
    required this.isPolarAdjusted,
    required this.fajr,
    required this.sunrise,
    required this.dhuhr,
    required this.asr,
    required this.maghrib,
    required this.isha,
    required this.imsak,
    required this.midnight,
    required this.lastThirdOfNight,
  });

  DateTime getTime(PrayerName name) {
    switch (name) {
      case PrayerName.fajr:
        return fajr;
      case PrayerName.sunrise:
        return sunrise;
      case PrayerName.dhuhr:
        return dhuhr;
      case PrayerName.asr:
        return asr;
      case PrayerName.maghrib:
        return maghrib;
      case PrayerName.isha:
        return isha;
    }
  }

  String formatTime24(PrayerName name) {
    final t = getTime(name);
    return '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
  }

  String formatTime12(PrayerName name) {
    final t = getTime(name);
    final period = t.hour >= 12 ? 'PM' : 'AM';
    final h = t.hour % 12 == 0 ? 12 : t.hour % 12;
    return '$h:${t.minute.toString().padLeft(2, '0')} $period';
  }
}

/// Represents the active countdown to the next prayer.
@immutable
class NextPrayerInfo {
  final PrayerName? currentPrayer;
  final PrayerName nextPrayer;
  final DateTime nextPrayerTime;
  final Duration timeRemaining;
  final double progressFraction; // 0.0 to 1.0

  const NextPrayerInfo({
    required this.currentPrayer,
    required this.nextPrayer,
    required this.nextPrayerTime,
    required this.timeRemaining,
    required this.progressFraction,
  });
}

/// Global preset cities.
@immutable
class PresetCity {
  final String id;
  final String name;
  final String nameArabic;
  final String nameUrdu;
  final String country;
  final PrayerCoordinates coordinates;
  final CalculationMethod defaultMethod;
  final AsrMadhab defaultMadhab;

  const PresetCity({
    required this.id,
    required this.name,
    required this.nameArabic,
    required this.nameUrdu,
    required this.country,
    required this.coordinates,
    required this.defaultMethod,
    required this.defaultMadhab,
  });
}
