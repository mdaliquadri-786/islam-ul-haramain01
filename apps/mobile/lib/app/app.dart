import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_router.dart';
import '../core/localization/app_localizations.dart';
import '../core/localization/locale_provider.dart';
import '../core/sync/sync_coordinator.dart';
import '../core/theme/app_theme.dart';
import '../core/theme/theme_provider.dart';

class IslamicMobileApp extends ConsumerWidget {
  const IslamicMobileApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Eagerly activate foreground synchronization coordinator
    ref.watch(syncCoordinatorProvider);

    final router = ref.watch(appRouterProvider);
    final locale = ref.watch(localeNotifierProvider);
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: 'ISLAM UL HARAMAIN',
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
    );
  }
}
