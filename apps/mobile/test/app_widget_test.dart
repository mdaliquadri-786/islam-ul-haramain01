import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/native.dart';
import 'package:islamic_mobile/app/app.dart';
import 'package:islamic_mobile/core/database/app_database.dart';
import 'package:islamic_mobile/core/database/database_providers.dart';

void main() {
  late AppDatabase inMemoryDb;

  setUp(() {
    inMemoryDb = AppDatabase.forTesting(NativeDatabase.memory());
  });

  tearDown(() async {
    await inMemoryDb.close();
  });

  Widget createTestWidget() {
    return ProviderScope(
      overrides: [
        appDatabaseProvider.overrideWithValue(inMemoryDb),
      ],
      child: const IslamicMobileApp(),
    );
  }

  group('IslamicMobileApp Widget Tests', () {
    testWidgets('App renders Home screen with Bismillah and Navigation grid',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Verify sacred title and Bismillah banner
      expect(find.text('ISLAM UL HARAMAIN'), findsOneWidget);
      expect(find.text('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'), findsOneWidget);

      // Verify core navigation grid items
      expect(find.text('Holy Quran'), findsOneWidget);
      expect(find.text('Hadith'), findsOneWidget);
      expect(find.text('Duas & Adhkar'), findsOneWidget);
      expect(find.text('Prayer Times'), findsOneWidget);
      expect(find.text('My Library'), findsOneWidget);
      expect(find.text('Settings'), findsOneWidget);

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });

    testWidgets('Navigating to Library displays Bookmarks, Reading Progress, and Sync Queue tabs',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Tap on 'My Library'
      await tester.tap(find.text('My Library'));
      await tester.pumpAndSettle();

      // Verify Library tabs
      expect(find.text('Bookmarks'), findsOneWidget);
      expect(find.text('Reading Progress'), findsOneWidget);
      expect(find.text('Sync Queue'), findsOneWidget);

      // Verify empty bookmarks state
      expect(find.text('No bookmarks saved yet.'), findsOneWidget);

      // Switch to Sync Queue tab
      await tester.tap(find.text('Sync Queue'));
      await tester.pumpAndSettle();
      expect(find.text('Offline Sync Queue is clean'), findsOneWidget);

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });

    testWidgets('Navigating to Settings displays Theme, Language, and Script preferences',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(createTestWidget());
      await tester.pumpAndSettle();

      // Tap on 'Settings'
      await tester.tap(find.text('Settings'));
      await tester.pumpAndSettle();

      // Verify section titles
      expect(find.text('Theme Mode'), findsOneWidget);
      expect(find.text('Language'), findsOneWidget);
      expect(find.text('Arabic Script'), findsOneWidget);

      // Verify language options
      expect(find.text('English (EN)'), findsOneWidget);
      expect(find.text('العربية (AR)'), findsOneWidget);
      expect(find.text('اردو (UR)'), findsOneWidget);

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });
  });
}
