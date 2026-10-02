// ignore_for_file: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/localization/locale_provider.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/database/database_providers.dart';
import '../../core/database/app_database.dart';
import '../../core/sync/sync_coordinator.dart';
import '../../core/sync/sync_services.dart';
import '../../core/sync/sync_ui_state.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';
import '../../shared/widgets/sync_status_badge.dart';
import '../admin/admin_screen.dart';
import '../../core/diagnostics/diagnostic_providers.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final themeMode = ref.watch(themeModeProvider);
    final currentLocale = ref.watch(localeNotifierProvider);
    final settingsDao = ref.watch(appSettingsDaoProvider);
    final uiState = ref.watch(syncUIStateProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navSettings,
        subtitle: 'التفضيلات والإعدادات',
      ),
      body: StreamBuilder<AppSetting>(
        stream: settingsDao.watchSettings(),
        builder: (context, snapshot) {
          final settings = snapshot.data;
          final arabicSize = settings?.arabicFontSize ?? 26.0;
          final script = settings?.arabicScript ?? 'uthmani';
          final madhab = settings?.prayerMadhab ?? 'shafi';

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // Theme Section
              _buildSectionHeader(context, l10n.settingsTheme),
              SacredCard(
                child: Column(
                  children: [
                    RadioListTile<ThemeMode>(
                      title: Text(l10n.themeSystem),
                      value: ThemeMode.system,
                      groupValue: themeMode,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (mode) {
                        if (mode != null) {
                          ref.read(themeModeProvider.notifier).setThemeMode(mode);
                        }
                      },
                    ),
                    RadioListTile<ThemeMode>(
                      title: Text(l10n.themeLight),
                      value: ThemeMode.light,
                      groupValue: themeMode,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (mode) {
                        if (mode != null) {
                          ref.read(themeModeProvider.notifier).setThemeMode(mode);
                        }
                      },
                    ),
                    RadioListTile<ThemeMode>(
                      title: Text(l10n.themeDark),
                      value: ThemeMode.dark,
                      groupValue: themeMode,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (mode) {
                        if (mode != null) {
                          ref.read(themeModeProvider.notifier).setThemeMode(mode);
                        }
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Language Section
              _buildSectionHeader(context, l10n.settingsLanguage),
              SacredCard(
                child: Column(
                  children: [
                    RadioListTile<String>(
                      title: const Text('English (EN)'),
                      value: 'en',
                      groupValue: currentLocale.languageCode,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (val) {
                        if (val != null) {
                          ref.read(localeNotifierProvider.notifier).setLocale(val);
                        }
                      },
                    ),
                    RadioListTile<String>(
                      title: const Text('العربية (AR)'),
                      value: 'ar',
                      groupValue: currentLocale.languageCode,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (val) {
                        if (val != null) {
                          ref.read(localeNotifierProvider.notifier).setLocale(val);
                        }
                      },
                    ),
                    RadioListTile<String>(
                      title: const Text('اردو (UR)'),
                      value: 'ur',
                      groupValue: currentLocale.languageCode,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (val) {
                        if (val != null) {
                          ref.read(localeNotifierProvider.notifier).setLocale(val);
                        }
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Typography & Script Section
              _buildSectionHeader(context, l10n.settingsScript),
              SacredCard(
                child: Column(
                  children: [
                    RadioListTile<String>(
                      title: Text(l10n.scriptUthmani),
                      value: 'uthmani',
                      groupValue: script,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (val) {
                        if (val != null) {
                          settingsDao.setArabicScript(val);
                        }
                      },
                    ),
                    RadioListTile<String>(
                      title: Text(l10n.scriptIndoPak),
                      value: 'indopak',
                      groupValue: script,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (val) {
                        if (val != null) {
                          settingsDao.setArabicScript(val);
                        }
                      },
                    ),
                    const Divider(),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(l10n.settingsArabicFontSize),
                              Text('${arabicSize.toInt()} pt',
                                  style: const TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          Slider(
                            value: arabicSize,
                            min: 18.0,
                            max: 42.0,
                            divisions: 12,
                            activeColor: AppTheme.emeraldPrimary,
                            onChanged: (val) {
                              settingsDao.setFontSizes(arabicSize: val);
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Prayer Calculation Section
              _buildSectionHeader(context, l10n.settingsMadhab),
              SacredCard(
                child: Column(
                  children: [
                    RadioListTile<String>(
                      title: Text(l10n.madhabShafi),
                      value: 'shafi',
                      groupValue: madhab,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (val) {
                        if (val != null) {
                          ref.read(syncPrayerSettingsServiceProvider).setPrayerPreferences(madhab: val);
                        }
                      },
                    ),
                    RadioListTile<String>(
                      title: Text(l10n.madhabHanafi),
                      value: 'hanafi',
                      groupValue: madhab,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (val) {
                        if (val != null) {
                          ref.read(syncPrayerSettingsServiceProvider).setPrayerPreferences(madhab: val);
                        }
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Cloud Synchronization Section
              _buildSectionHeader(context, 'CLOUD SYNCHRONIZATION'),
              SacredCard(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Cross-Device Sync',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          SyncStatusBadge(),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        uiState.isAuthenticated && !uiState.isGuest
                            ? 'Bookmarks, reading progress, and prayer calculation settings are automatically synchronized across devices.'
                            : 'Running in local guest mode. Sign in to synchronize your bookmarks and progress across devices.',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? AppTheme.textDarkSecondary : AppTheme.textLightSecondary,
                        ),
                      ),
                      if (uiState.isAuthenticated && !uiState.isGuest) ...[
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              uiState.hasPendingChanges
                                  ? '${uiState.pendingMutationsCount} pending change(s)'
                                  : 'Queue is clean',
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppTheme.emeraldPrimary,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              onPressed: uiState.isSyncing
                                  ? null
                                  : () => ref.read(syncCoordinatorProvider).syncNow(),
                              icon: uiState.isSyncing
                                  ? const SizedBox(
                                      width: 12,
                                      height: 12,
                                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(Icons.sync, size: 16),
                              label: Text(uiState.isSyncing ? 'Syncing...' : 'Sync Now'),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Anonymous Diagnostics Section (M8.4)
              _buildSectionHeader(context, l10n.settingsDiagnosticsTitle.toUpperCase()),
              SacredCard(
                child: SwitchListTile(
                  secondary: const Icon(
                    Icons.security_outlined,
                    color: AppTheme.emeraldPrimary,
                  ),
                  title: Text(
                    l10n.settingsDiagnosticsTitle,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                  subtitle: Text(
                    l10n.settingsDiagnosticsSubtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppTheme.textDarkSecondary : AppTheme.textLightSecondary,
                    ),
                  ),
                  value: ref.watch(diagnosticConsentNotifierProvider),
                  activeColor: AppTheme.emeraldPrimary,
                  onChanged: (enabled) {
                    ref.read(diagnosticConsentNotifierProvider.notifier).setConsent(enabled);
                  },
                ),
              ),
              const SizedBox(height: 16),

              // Administration Section (Strictly conditional for authorized roles)
              StreamBuilder<LocalUserState?>(
                stream: ref.watch(userStateDaoProvider).watchCurrentUser(),
                builder: (context, userSnapshot) {
                  final user = userSnapshot.data;
                  if (user != null && kAdministrativeRoles.contains(user.role)) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildSectionHeader(context, 'ADMINISTRATION'),
                        SacredCard(
                          child: ListTile(
                            leading: const Icon(
                              Icons.admin_panel_settings_outlined,
                              color: AppTheme.emeraldPrimary,
                            ),
                            title: const Text('Operational Administration'),
                            subtitle: Text('Authenticated as ${user.role}'),
                            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                            onTap: () => context.push('/admin'),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
              const SizedBox(height: 8),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0, right: 4.0, bottom: 8.0),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Theme.of(context).brightness == Brightness.dark
              ? AppTheme.goldLight
              : AppTheme.emeraldPrimary,
        ),
      ),
    );
  }
}
