import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:drift/native.dart';
import 'package:drift/drift.dart' as drift;
import 'package:islamic_mobile/app/app.dart';
import 'package:islamic_mobile/core/database/app_database.dart';
import 'package:islamic_mobile/core/database/database_providers.dart';
import 'package:islamic_mobile/core/operational/operational_status.dart';
import 'package:islamic_mobile/features/admin/admin_screen.dart';

void main() {
  late AppDatabase inMemoryDb;

  setUp(() {
    inMemoryDb = AppDatabase.forTesting(NativeDatabase.memory());
  });

  tearDown(() async {
    await inMemoryDb.close();
  });

  Widget createTestApp({List<Override> extraOverrides = const []}) {
    return ProviderScope(
      overrides: [
        appDatabaseProvider.overrideWithValue(inMemoryDb),
        ...extraOverrides,
      ],
      child: const IslamicMobileApp(),
    );
  }

  group('Mobile Admin Architecture & Access Control Tests', () {
    testWidgets('Guest / non-admin user on SettingsScreen does NOT see Administration tile',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      // Regular authenticated user
      await inMemoryDb.userStateDao.saveUser(
        LocalUserStateTableCompanion.insert(
          id: 'user-regular-123',
          email: const drift.Value('worshipper@example.com'),
          displayName: const drift.Value('Ordinary Believer'),
          role: const drift.Value('authenticated'),
        ),
      );

      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      // Open Settings
      await tester.tap(find.text('Settings'));
      await tester.pumpAndSettle();

      // Verify standard settings are present
      expect(find.text('Theme Mode'), findsOneWidget);
      expect(find.text('Language'), findsOneWidget);

      // Verify Administration section is NOT present
      expect(find.text('ADMINISTRATION'), findsNothing);
      expect(find.text('Operational Administration'), findsNothing);

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });

    testWidgets('Authorized admin on SettingsScreen sees Administration tile and navigates to AdminScreen',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      // Authorized super_admin
      await inMemoryDb.userStateDao.saveUser(
        LocalUserStateTableCompanion.insert(
          id: 'admin-super-999',
          email: const drift.Value('chief.operator@haramain.org'),
          displayName: const drift.Value('Chief Platform Overseer'),
          role: const drift.Value('super_admin'),
        ),
      );

      await tester.pumpWidget(createTestApp());
      await tester.pumpAndSettle();

      // Open Settings
      await tester.tap(find.text('Settings'));
      await tester.pumpAndSettle();

      // Verify Administration tile is conditionally visible
      expect(find.text('ADMINISTRATION'), findsOneWidget);
      expect(find.text('Operational Administration'), findsOneWidget);
      expect(find.text('Authenticated as super_admin'), findsOneWidget);

      // Tap on Administration tile
      await tester.tap(find.text('Operational Administration'));
      await tester.pumpAndSettle();

      // Verify AdminScreen renders authorized view
      expect(find.text('Platform Administration'), findsOneWidget);
      expect(find.text('PLATFORM OPERATIONAL HEALTH'), findsOneWidget);
      expect(find.text('AUTHENTICATED OPERATOR IDENTITY'), findsOneWidget);
      expect(find.text('CANONICAL CORPUS METRICS'), findsOneWidget);
      expect(find.text('Append-Only Cryptographic Governance'), findsOneWidget);

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });

    testWidgets('Unprivileged user on AdminScreen receives 403 Access Denied banner',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      // No user saved => unauthenticated guest
      final testContainer = ProviderContainer(
        overrides: [appDatabaseProvider.overrideWithValue(inMemoryDb)],
      );
      addTearDown(testContainer.dispose);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: testContainer,
          child: const MaterialApp(
            home: AdminScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify 403 Access Denied
      expect(find.text('Access Denied (403)'), findsOneWidget);
      expect(find.byIcon(Icons.gpp_bad_outlined), findsOneWidget);
      expect(find.text('PLATFORM OPERATIONAL HEALTH'), findsNothing);

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });

    testWidgets('Maintenance mode toggle shows confirmation dialog and updates status without altering local data',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      // Insert admin user and some local bookmarks to verify data preservation
      await inMemoryDb.userStateDao.saveUser(
        LocalUserStateTableCompanion.insert(
          id: 'admin-op-001',
          email: const drift.Value('admin@haramain.org'),
          displayName: const drift.Value('Platform Admin'),
          role: const drift.Value('admin'),
        ),
      );

      await inMemoryDb.bookmarksDao.saveBookmark(
        LocalBookmarksTableCompanion.insert(
          id: 'bookmark-1',
          userId: 'admin-op-001',
          contentType: 'quran',
          contentReference: 'quran:1:1',
          surahNumber: const drift.Value(1),
          ayahNumber: const drift.Value(1),
          note: const drift.Value('Important reflection'),
        ),
      );

      final testContainer = ProviderContainer(
        overrides: [appDatabaseProvider.overrideWithValue(inMemoryDb)],
      );
      addTearDown(testContainer.dispose);

      await tester.pumpWidget(
        UncontrolledProviderScope(
          container: testContainer,
          child: const MaterialApp(
            home: AdminScreen(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify initially Operational
      expect(find.text('Operational'), findsOneWidget);
      expect(testContainer.read(operationalStatusProvider).isMaintenanceMode, isFalse);

      // Tap Switch to activate maintenance mode
      await tester.tap(find.byType(Switch));
      await tester.pumpAndSettle();

      // Verify confirmation dialog appeared
      expect(find.text('Activate Maintenance Mode?'), findsOneWidget);
      expect(
        find.textContaining('User-local encrypted SQLite devotional data will remain fully available'),
        findsOneWidget,
      );

      // Confirm dialog
      await tester.tap(find.text('Confirm'));
      await tester.pumpAndSettle();

      // Verify maintenance mode is now active
      expect(testContainer.read(operationalStatusProvider).isMaintenanceMode, isTrue);
      expect(find.text('Maintenance Mode'), findsOneWidget);

      // Verify local devotional data is untouched
      final bookmarks = await inMemoryDb.select(inMemoryDb.localBookmarksTable).get();
      expect(bookmarks.length, equals(1));
      expect(bookmarks.first.contentReference, equals('quran:1:1'));
      expect(bookmarks.first.surahNumber, equals(1));

      await tester.pumpWidget(const SizedBox());
      await tester.pump(const Duration(milliseconds: 100));
    });
  });
}
