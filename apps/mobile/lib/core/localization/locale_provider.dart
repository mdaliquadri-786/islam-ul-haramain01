import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/database_providers.dart';
import '../database/daos/app_settings_dao.dart';

/// Manages active application Locale and syncs with SQLite app_settings table.
class LocaleNotifier extends StateNotifier<Locale> {
  final AppSettingsDao _settingsDao;

  LocaleNotifier(this._settingsDao) : super(const Locale('en')) {
    _initLocale();
  }

  Future<void> _initLocale() async {
    try {
      final settings = await _settingsDao.getSettings();
      state = Locale(settings.locale);
    } catch (_) {
      state = const Locale('en');
    }
  }

  Future<void> setLocale(String languageCode) async {
    if (!['en', 'ar', 'ur'].contains(languageCode)) return;
    state = Locale(languageCode);
    await _settingsDao.setLocale(languageCode);
  }
}

final localeNotifierProvider =
    StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  final settingsDao = ref.watch(appSettingsDaoProvider);
  return LocaleNotifier(settingsDao);
});
