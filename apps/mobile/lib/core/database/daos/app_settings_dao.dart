import 'package:drift/drift.dart';
import '../app_database.dart';
import '../tables/app_settings_table.dart';

part 'app_settings_dao.g.dart';

@DriftAccessor(tables: [AppSettingsTable])
class AppSettingsDao extends DatabaseAccessor<AppDatabase>
    with _$AppSettingsDaoMixin {
  AppSettingsDao(super.db);

  static const String _defaultId = 'default';

  /// Watches application settings reactively.
  Stream<AppSetting> watchSettings() {
    return (select(appSettingsTable)..where((tbl) => tbl.id.equals(_defaultId)))
        .watchSingle();
  }

  /// Gets current application settings.
  Future<AppSetting> getSettings() async {
    final existing = await (select(appSettingsTable)
          ..where((tbl) => tbl.id.equals(_defaultId)))
        .getSingleOrNull();

    if (existing != null) {
      return existing;
    }

    // Insert fallback default if missing
    await into(appSettingsTable).insert(
      AppSettingsTableCompanion.insert(
        id: const Value(_defaultId),
        themeMode: const Value('system'),
        locale: const Value('en'),
        arabicScript: const Value('uthmani'),
        arabicFontSize: const Value(26.0),
        translationFontSize: const Value(16.0),
      ),
      mode: InsertMode.insertOrIgnore,
    );

    return (select(appSettingsTable)..where((tbl) => tbl.id.equals(_defaultId)))
        .getSingle();
  }

  /// Updates arbitrary settings companion.
  Future<void> updateSettings(AppSettingsTableCompanion settings) {
    return (update(appSettingsTable)..where((tbl) => tbl.id.equals(_defaultId)))
        .write(settings.copyWith(
      updatedAt: Value(DateTime.now()),
    ));
  }

  /// Sets theme mode ('system', 'light', 'dark').
  Future<void> setThemeMode(String themeMode) {
    return updateSettings(AppSettingsTableCompanion(
      themeMode: Value(themeMode),
    ));
  }

  /// Sets locale ('en', 'ar', 'ur').
  Future<void> setLocale(String locale) {
    return updateSettings(AppSettingsTableCompanion(
      locale: Value(locale),
    ));
  }

  /// Sets script style ('uthmani', 'indopak').
  Future<void> setArabicScript(String script) {
    return updateSettings(AppSettingsTableCompanion(
      arabicScript: Value(script),
    ));
  }

  /// Sets font sizes.
  Future<void> setFontSizes({double? arabicSize, double? translationSize}) {
    return updateSettings(AppSettingsTableCompanion(
      arabicFontSize: arabicSize != null ? Value(arabicSize) : const Value.absent(),
      translationFontSize:
          translationSize != null ? Value(translationSize) : const Value.absent(),
    ));
  }

  /// Sets prayer calculation preferences.
  Future<void> setPrayerPreferences({String? method, String? madhab}) {
    return updateSettings(AppSettingsTableCompanion(
      prayerCalculationMethod:
          method != null ? Value(method) : const Value.absent(),
      prayerMadhab: madhab != null ? Value(madhab) : const Value.absent(),
    ));
  }
}
