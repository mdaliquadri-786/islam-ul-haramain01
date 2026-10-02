import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../database/database_providers.dart';
import '../database/daos/app_settings_dao.dart';

/// Manages application ThemeMode (system, light, dark) and syncs with SQLite app_settings table.
class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  final AppSettingsDao _settingsDao;

  ThemeModeNotifier(this._settingsDao) : super(ThemeMode.system) {
    _initTheme();
  }

  Future<void> _initTheme() async {
    try {
      final settings = await _settingsDao.getSettings();
      state = _parseMode(settings.themeMode);
    } catch (_) {
      state = ThemeMode.system;
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    final modeString = _serializeMode(mode);
    await _settingsDao.setThemeMode(modeString);
  }

  ThemeMode _parseMode(String mode) {
    switch (mode) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }

  String _serializeMode(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }
}

final themeModeProvider =
    StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  final settingsDao = ref.watch(appSettingsDaoProvider);
  return ThemeModeNotifier(settingsDao);
});
