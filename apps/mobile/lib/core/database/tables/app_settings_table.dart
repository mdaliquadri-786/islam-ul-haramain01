import 'package:drift/drift.dart';

/// Client-local application settings and preferences.
@DataClassName('AppSetting')
class AppSettingsTable extends Table {
  @override
  String get tableName => 'app_settings';

  /// Primary key (single record singleton id, e.g. 'default').
  TextColumn get id => text().withDefault(const Constant('default'))();

  /// UI theme mode: 'system', 'light', 'dark'.
  TextColumn get themeMode => text().withDefault(const Constant('system'))();

  /// Application locale code: 'en', 'ar', 'ur'.
  TextColumn get locale => text().withDefault(const Constant('en'))();

  /// Arabic script rendering style: 'uthmani' or 'indopak'.
  TextColumn get arabicScript => text().withDefault(const Constant('uthmani'))();

  /// Arabic typography font size in points.
  RealColumn get arabicFontSize => real().withDefault(const Constant(26.0))();

  /// Translation typography font size in points.
  RealColumn get translationFontSize => real().withDefault(const Constant(16.0))();

  /// Prayer calculation method identifier (e.g. 'muslim_world_league', 'umm_al_qura', 'egyptian', 'karachi', 'tehran', 'north_america', 'kuwait').
  TextColumn get prayerCalculationMethod => text().withDefault(const Constant('muslim_world_league'))();

  /// Madhab for Asr calculation: 'shafi' (standard) or 'hanafi'.
  TextColumn get prayerMadhab => text().withDefault(const Constant('shafi'))();

  /// Preferred default reciter ID for audio playback.
  TextColumn get selectedReciterId => text().withDefault(const Constant('mishary-rashid-alafasy'))();

  /// Notifications enabled flag.
  BoolColumn get notificationsEnabled => boolean().withDefault(const Constant(true))();

  /// Offline background synchronization preference.
  BoolColumn get offlineSyncEnabled => boolean().withDefault(const Constant(true))();

  /// Last updated timestamp.
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();

  @override
  Set<Column> get primaryKey => {id};
}
