import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:islamic_mobile/core/localization/app_localizations.dart';
import 'package:islamic_mobile/features/prayer/prayer_screen.dart';
import 'package:islamic_mobile/features/qibla/qibla_screen.dart';
import 'package:islamic_mobile/features/tasbeeh/tasbeeh_screen.dart';

void main() {
  Widget buildTestScreen(Widget screen) {
    return ProviderScope(
      child: MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: AppLocalizations.supportedLocales,
        home: screen,
      ),
    );
  }

  group('Devotional Suite UI & Screen Widget Tests', () {
    testWidgets('PrayerScreen renders prayer times, countdown, and opens settings modal',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(buildTestScreen(const PrayerScreen()));
      await tester.pumpAndSettle();

      // App bar & header
      expect(find.text('Prayer Times'), findsWidgets);
      expect(find.text('Makkah al-Mukarramah'), findsOneWidget);

      // Countdown & next prayer card
      expect(find.text('Time Remaining'), findsOneWidget);

      // 6 prayer tiles
      expect(find.text('Fajr'), findsWidgets);
      expect(find.text('Sunrise'), findsWidgets);
      expect(find.text('Dhuhr'), findsWidgets);
      expect(find.text('Asr'), findsWidgets);
      expect(find.text('Maghrib'), findsWidgets);
      expect(find.text('Isha'), findsWidgets);

      // Devotional milestones
      expect(find.text('Imsak'), findsWidgets);
      expect(find.text('Midnight'), findsWidgets);
      expect(find.text('Last Third (Tahajjud)'), findsWidgets);

      // Tap settings button to open calculation modal
      final settingsButton = find.textContaining('Calculation Settings');
      expect(settingsButton, findsOneWidget);
      await tester.tap(settingsButton);
      await tester.pumpAndSettle();

      // Verify modal content
      expect(find.text('Umm al-Qura University, Makkah'), findsWidgets);
      expect(find.textContaining('Standard (Shafi`i'), findsWidgets);

      // Dismiss modal
      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();
    });

    testWidgets('QiblaScreen renders compass, bearing, and manual calibration mode',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(buildTestScreen(const QiblaScreen()));
      await tester.pumpAndSettle();

      // Header and city
      expect(find.text('Qibla'), findsWidgets);
      expect(find.text('Makkah al-Mukarramah'), findsOneWidget);

      // Metrics cards
      expect(find.text('Heading'), findsOneWidget);
      expect(find.text('Qibla Bearing'), findsOneWidget);
      expect(find.text('Distance to Kaaba'), findsOneWidget);

      // Manual Calibration Mode switch
      expect(find.text('Manual Calibration Dial'), findsOneWidget);
      final switchFinder = find.byType(Switch);
      expect(switchFinder, findsOneWidget);

      // Toggle manual calibration switch to true
      await tester.tap(switchFinder);
      await tester.pumpAndSettle();

      // Slider should now be present
      expect(find.byType(Slider), findsOneWidget);
    });

    testWidgets('TasbeehScreen increments counter, tracks laps, and resets properly',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(buildTestScreen(const TasbeehScreen()));
      await tester.pumpAndSettle();

      // Default Dhikr preset from Hisn al-Muslim
      expect(find.text('Digital Tasbeeh'), findsWidgets);
      expect(find.text('سُبْحَانَ اللَّهِ'), findsOneWidget);
      expect(find.text('SubhanAllah'), findsOneWidget);
      expect(find.text('/ 33'), findsOneWidget);

      // Initial count 0
      expect(find.text('0'), findsWidgets);

      // Tap on the counter button
      await tester.tap(find.text('TAP'));
      await tester.pumpAndSettle();

      // Counter should now show 1
      expect(find.text('1'), findsWidgets);

      // Reset button
      final resetButton = find.text('Reset');
      expect(resetButton, findsOneWidget);
      await tester.tap(resetButton);
      await tester.pumpAndSettle();

      // Count is back to 0
      expect(find.text('0'), findsWidgets);
    });
  });
}
