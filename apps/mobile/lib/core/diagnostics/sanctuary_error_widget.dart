import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../theme/app_theme.dart';
import 'diagnostic_service.dart';

/// Peaceful, dignified error fallback widget that replaces default Flutter red/grey crash screens.
/// Guarantees complete confidentiality: no stack traces, tokens, file paths, or devotional queries are ever displayed.
class DignifiedErrorWidget extends StatelessWidget {
  final FlutterErrorDetails? details;
  final VoidCallback? onRetry;
  final VoidCallback? onReturnHome;
  final Locale? locale;

  const DignifiedErrorWidget({
    super.key,
    this.details,
    this.onRetry,
    this.onReturnHome,
    this.locale,
  });

  @override
  Widget build(BuildContext context) {
    Locale effectiveLocale = locale ?? const Locale('en');
    if (locale == null) {
      try {
        effectiveLocale = Localizations.localeOf(context);
      } catch (_) {
        // Fallback if localization is unavailable
        effectiveLocale = const Locale('en');
      }
    }

    final isRtl = effectiveLocale.languageCode == 'ar' || effectiveLocale.languageCode == 'ur';
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final String title = _localizedTitle(effectiveLocale.languageCode);
    final String message = _localizedMessage(effectiveLocale.languageCode);
    final String retryLabel = _localizedRetry(effectiveLocale.languageCode);
    final String homeLabel = _localizedHome(effectiveLocale.languageCode);

    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: isDark ? AppTheme.darkBg : AppTheme.lightBg,
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 480),
                padding: const EdgeInsets.all(28.0),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkSurfaceElevated : AppTheme.lightSurface,
                  borderRadius: BorderRadius.circular(16.0),
                  border: Border.all(
                    color: AppTheme.goldAccent.withAlpha(80),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(20),
                      blurRadius: 16.0,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Serene decorative emblem
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.emeraldPrimary.withAlpha(25),
                        border: Border.all(
                          color: AppTheme.goldAccent,
                          width: 1.5,
                        ),
                      ),
                      child: const Icon(
                        Icons.spa_outlined,
                        size: 38,
                        color: AppTheme.emeraldPrimary,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Dignified Sanctuary Title
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: isDark ? AppTheme.textDarkPrimary : AppTheme.emeraldDark,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Reverent, peaceful guidance message
                    Text(
                      message,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        height: 1.5,
                        color: isDark ? AppTheme.textDarkSecondary : AppTheme.textLightSecondary,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Action buttons: Retry & Return Home
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.emeraldPrimary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 1,
                          ),
                          onPressed: () {
                            if (onRetry != null) {
                              onRetry!();
                            } else {
                              _handleReturnHome(context);
                            }
                          },
                          icon: const Icon(Icons.refresh, size: 18),
                          label: Text(
                            retryLabel,
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                          ),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: isDark ? AppTheme.goldLight : AppTheme.emeraldPrimary,
                            side: BorderSide(
                              color: isDark ? AppTheme.goldAccent : AppTheme.emeraldPrimary,
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          onPressed: () {
                            if (onReturnHome != null) {
                              onReturnHome!();
                            } else {
                              _handleReturnHome(context);
                            }
                          },
                          icon: const Icon(Icons.home_outlined, size: 18),
                          label: Text(
                            homeLabel,
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _handleReturnHome(BuildContext context) {
    try {
      GoRouter.of(context).go('/');
    } catch (_) {
      try {
        Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
      } catch (_) {
        // Safe no-op if context has no active navigator
      }
    }
  }

  static String _localizedTitle(String lang) {
    switch (lang) {
      case 'ar':
        return 'سكينة وطمأنينة';
      case 'ur':
        return 'سکون اور اطمینان';
      case 'en':
      default:
        return 'Peace & Serenity';
    }
  }

  static String _localizedMessage(String lang) {
    switch (lang) {
      case 'ar':
        return 'حدث انقطاع غير متوقع. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.';
      case 'ur':
        return 'ایک غیر متوقع رکاوٹ پیش آگئی ہے۔ براہ کرم دوبارہ کوشش کریں یا مرکزی صفحہ پر واپس جائیں۔';
      case 'en':
      default:
        return 'An unexpected interruption occurred. Please try again or return to the Sanctuary Home.';
    }
  }

  static String _localizedRetry(String lang) {
    switch (lang) {
      case 'ar':
        return 'إعادة المحاولة';
      case 'ur':
        return 'دوبارہ کوشش کریں';
      case 'en':
      default:
        return 'Retry';
    }
  }

  static String _localizedHome(String lang) {
    switch (lang) {
      case 'ar':
        return 'العودة إلى الصفحة الرئيسية';
      case 'ur':
        return 'مرکزی صفحہ پر واپس جائیں';
      case 'en':
      default:
        return 'Return to Sanctuary Home';
    }
  }
}

/// Sets up global Flutter and platform engine error hooks and overrides default red/grey ErrorWidget.
void setupGlobalErrorTraps(DiagnosticService diagnosticService) {
  // 1. Flutter framework widget build and layout errors
  FlutterError.onError = (FlutterErrorDetails details) {
    diagnosticService.recordFlutterError(details);
    if (kDebugMode) {
      // In development mode, present error to standard console without crashing
      FlutterError.presentError(details);
    }
  };

  // 2. Uncaught asynchronous engine errors
  PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    diagnosticService.recordPlatformError(error, stack);
    // Return true to indicate error was observed and handled safely
    return true;
  };

  // 3. Custom dignified UI builder for unhandled widget exceptions
  ErrorWidget.builder = (FlutterErrorDetails details) {
    return DignifiedErrorWidget(details: details);
  };
}
