import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_consent.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_models.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_ring_buffer.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_scrubber.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_service.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_storage.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_transport.dart';
import 'package:islamic_mobile/core/diagnostics/sanctuary_error_widget.dart';

class MockDiagnosticTransport implements DiagnosticTransport {
  final List<List<DiagnosticEvent>> transmittedBatches = [];
  bool shouldSucceed = true;
  int callCount = 0;

  @override
  Future<bool> sendBatch(List<DiagnosticEvent> events) async {
    callCount++;
    transmittedBatches.add(List.from(events));
    return shouldSucceed;
  }
}

void main() {
  group('DiagnosticScrubber Redaction Tests', () {
    test('Redacts Bearer tokens, JWTs, and API keys', () {
      const input =
          'Error connecting with Bearer secret_token_abc and JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisToken and sbp_99482910482910 secret';
      final sanitized = DiagnosticScrubber.sanitize(input);

      expect(sanitized, isNot(contains('secret_token_abc')));
      expect(sanitized, isNot(contains('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')));
      expect(sanitized, isNot(contains('sbp_99482910482910')));
      expect(sanitized, contains('Bearer [REDACTED_TOKEN]'));
      expect(sanitized, contains('[REDACTED_JWT]'));
      expect(sanitized, contains('[REDACTED_KEY]'));
    });

    test('Redacts Service-Role, Passwords, Cookies, and Authorization headers', () {
      const input =
          'Headers: authorization: Bearer superSecretToken\nCookie: session=sess_9941829412\nservice_role: super_secret_service_key\npassword: MySecretPassword123!';
      final sanitized = DiagnosticScrubber.sanitize(input);

      expect(sanitized, isNot(contains('MySecretPassword123!')));
      expect(sanitized, isNot(contains('super_secret_service_key')));
      expect(sanitized, isNot(contains('sess_9941829412')));
      expect(sanitized, contains('authorization: [REDACTED_HEADER]'));
      expect(sanitized, contains('[REDACTED_COOKIE]'));
      expect(sanitized, contains('[REDACTED_SECRET]'));
    });

    test('Redacts PII: emails, phone numbers, and IPv4/IPv6 addresses', () {
      const input =
          'Failed request from user.secret@domain.com or +966501234567 on IP 192.168.1.100 and 2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      final sanitized = DiagnosticScrubber.sanitize(input);

      expect(sanitized, isNot(contains('user.secret@domain.com')));
      expect(sanitized, isNot(contains('+966501234567')));
      expect(sanitized, isNot(contains('192.168.1.100')));
      expect(sanitized, isNot(contains('2001:0db8:85a3:0000:0000:8a2e:0370:7334')));
      expect(sanitized, contains('[REDACTED_EMAIL]'));
      expect(sanitized, contains('[REDACTED_PHONE]'));
      expect(sanitized, contains('[REDACTED_IP]'));
      expect(sanitized, contains('[REDACTED_IPV6]'));
    });

    test('Redacts GPS Coordinates, Bearings, and Headings', () {
      const input =
          'Current user location lat: 21.4225, lon: 39.8262 with compass bearing: 67.89 degrees';
      final sanitized = DiagnosticScrubber.sanitize(input);

      expect(sanitized, isNot(contains('21.4225')));
      expect(sanitized, isNot(contains('39.8262')));
      expect(sanitized, isNot(contains('67.89')));
      expect(sanitized, contains('[REDACTED_COORDINATES]'));
      expect(sanitized, contains('[REDACTED_HEADING]'));
    });

    test('Redacts Sacred Devotional Queries, Reflections, and Madhhab choices', () {
      const input =
          'Query error in surah: al-baqarah ayah 255 with hadith: bukhari 1 and dua: rabbana atina. Madhhab was hanafi using umm_al_qura. Note was personal_note: sacred reflection note';
      final sanitized = DiagnosticScrubber.sanitize(input);

      expect(sanitized, isNot(contains('al-baqarah')));
      expect(sanitized, isNot(contains('bukhari 1')));
      expect(sanitized, isNot(contains('rabbana atina')));
      expect(sanitized, isNot(contains('sacred reflection note')));
      expect(sanitized, isNot(contains('hanafi')));
      expect(sanitized, isNot(contains('umm_al_qura')));
      expect(sanitized, contains('[REDACTED_RELIGIOUS_DATA]'));
      expect(sanitized, contains('[REDACTED_MADHHAB_OR_METHOD]'));
    });
  });

  group('DiagnosticRingBuffer Capacity & Eviction Tests', () {
    late InMemoryDiagnosticStorage storage;
    late DiagnosticRingBuffer ringBuffer;

    setUp(() {
      storage = InMemoryDiagnosticStorage();
      ringBuffer = DiagnosticRingBuffer(storage: storage, maxCapacity: 50);
    });

    test('Buffers up to 50 events in chronological order', () async {
      final now = DateTime.utc(2026, 10, 1, 12, 0, 0);
      for (int i = 1; i <= 30; i++) {
        await ringBuffer.add(
          DiagnosticEvent.create(
            id: 'event-$i',
            errorType: 'TypeError',
            sanitizedStackTrace: 'trace $i',
            appVersion: '0.1.0',
            buildNumber: '1',
            anonymousSessionId: 'sess-test',
            timestamp: now.add(Duration(minutes: i)),
          ),
        );
      }

      final events = await ringBuffer.getEvents();
      expect(events.length, equals(30));
      expect(events.first.id, equals('event-1'));
      expect(events.last.id, equals('event-30'));
    });

    test('Evicts oldest events when capacity exceeds 50', () async {
      final now = DateTime.utc(2026, 10, 1, 12, 0, 0);
      // Insert 55 events
      for (int i = 1; i <= 55; i++) {
        await ringBuffer.add(
          DiagnosticEvent.create(
            id: 'event-$i',
            errorType: 'NetworkException',
            sanitizedStackTrace: 'trace $i',
            appVersion: '0.1.0',
            buildNumber: '1',
            anonymousSessionId: 'sess-test',
            timestamp: now.add(Duration(minutes: i)),
          ),
        );
      }

      final events = await ringBuffer.getEvents();
      expect(events.length, equals(50));
      // First 5 events (event-1 to event-5) must be evicted
      expect(events.any((e) => e.id == 'event-1'), isFalse);
      expect(events.any((e) => e.id == 'event-5'), isFalse);
      // Event-6 must now be the oldest
      expect(events.first.id, equals('event-6'));
      // Event-55 must be the newest
      expect(events.last.id, equals('event-55'));
    });

    test('removeEvents deletes acknowledged events', () async {
      for (int i = 1; i <= 5; i++) {
        await ringBuffer.add(
          DiagnosticEvent.create(
            id: 'event-$i',
            errorType: 'Error',
            sanitizedStackTrace: 'trace $i',
            appVersion: '0.1.0',
            buildNumber: '1',
            anonymousSessionId: 'sess-test',
          ),
        );
      }

      await ringBuffer.removeEvents(['event-1', 'event-2']);
      final events = await ringBuffer.getEvents();
      expect(events.length, equals(3));
      expect(events.map((e) => e.id), equals(['event-3', 'event-4', 'event-5']));
    });
  });

  group('DiagnosticConsent & Gated Transport Tests', () {
    late InMemoryDiagnosticStorage storage;
    late DiagnosticRingBuffer ringBuffer;
    late DiagnosticConsentService consent;
    late MockDiagnosticTransport transport;
    late DiagnosticService service;

    setUp(() {
      storage = InMemoryDiagnosticStorage();
      ringBuffer = DiagnosticRingBuffer(storage: storage);
      consent = DiagnosticConsentService();
      transport = MockDiagnosticTransport();
      service = DiagnosticService(
        buffer: ringBuffer,
        consent: consent,
        transport: transport,
      );
    });

    test('Consent defaults to disabled (false)', () async {
      expect(consent.isCrashReportingEnabled, isFalse);
      final loaded = await consent.loadConsent();
      expect(loaded, isFalse);
    });

    test('No network transmission occurs when consent is false', () async {
      await service.recordError(
        'Database connection timeout',
        stackTrace: StackTrace.current,
        errorType: 'DatabaseTimeout',
      );

      // Give event loop time to process async flushes
      await Future<void>.delayed(const Duration(milliseconds: 50));

      expect(transport.callCount, equals(0));
      expect(transport.transmittedBatches, isEmpty);
      // Local buffer still contains the event for offline safety
      final events = await ringBuffer.getEvents();
      expect(events.length, equals(1));
    });

    test('Transmission occurs when consent is explicitly enabled', () async {
      await consent.setConsent(true);
      expect(consent.isCrashReportingEnabled, isTrue);

      await service.recordError(
        'SocketException: host unreachable',
        stackTrace: StackTrace.current,
        errorType: 'SocketException',
      );

      await Future<void>.delayed(const Duration(milliseconds: 50));

      expect(transport.callCount, equals(1));
      expect(transport.transmittedBatches.length, equals(1));
      expect(transport.transmittedBatches.first.first.errorType, equals('SocketException'));

      // Successfully transmitted events are removed from buffer
      final events = await ringBuffer.getEvents();
      expect(events, isEmpty);
    });

    test('Failed transmission does not crash and retains events in buffer', () async {
      await consent.setConsent(true);
      transport.shouldSucceed = false; // Simulate network 500 or timeout

      await service.recordError(
        'Server internal error',
        stackTrace: StackTrace.current,
        errorType: 'HttpException',
      );

      await Future<void>.delayed(const Duration(milliseconds: 50));

      expect(transport.callCount, equals(1));
      // Event must be retained in buffer for later retry
      final events = await ringBuffer.getEvents();
      expect(events.length, equals(1));
    });
  });

  group('Deduplication & Global Error Traps', () {
    late InMemoryDiagnosticStorage storage;
    late DiagnosticRingBuffer ringBuffer;
    late DiagnosticConsentService consent;
    late DiagnosticService service;

    setUp(() {
      storage = InMemoryDiagnosticStorage();
      ringBuffer = DiagnosticRingBuffer(storage: storage);
      consent = DiagnosticConsentService();
      service = DiagnosticService(
        buffer: ringBuffer,
        consent: consent,
      );
    });

    test('Deduplicates identical errors within 500ms window', () async {
      final stack = StackTrace.current;
      await service.recordError('Widget rendering exception', stackTrace: stack, errorType: 'RenderError');
      await service.recordError('Widget rendering exception', stackTrace: stack, errorType: 'RenderError');
      await service.recordError('Widget rendering exception', stackTrace: stack, errorType: 'RenderError');

      final events = await ringBuffer.getEvents();
      expect(events.length, equals(1));
    });

    test('Interception via recordFlutterError works correctly', () async {
      final details = FlutterErrorDetails(
        exception: StateError('Invalid state during layout'),
        stack: StackTrace.current,
      );

      await service.recordFlutterError(details);

      final events = await ringBuffer.getEvents();
      expect(events.length, equals(1));
      expect(events.first.errorType, equals('StateError'));
      expect(events.first.sanitizedStackTrace, contains('Invalid state during layout'));
    });

    test('Interception via recordPlatformError works correctly', () async {
      await service.recordPlatformError(
        ArgumentError('Null argument in platform dispatcher'),
        StackTrace.current,
      );

      final events = await ringBuffer.getEvents();
      expect(events.length, equals(1));
      expect(events.first.errorType, equals('ArgumentError'));
    });
  });

  group('DignifiedErrorWidget UI & Confidentiality Tests', () {
    testWidgets('Renders peaceful English UI with Retry and Return Home buttons',
        (WidgetTester tester) async {
      bool retried = false;
      bool returnedHome = false;

      await tester.pumpWidget(
        MaterialApp(
          home: DignifiedErrorWidget(
            onRetry: () => retried = true,
            onReturnHome: () => returnedHome = true,
          ),
        ),
      );

      // Verify serene copy and absence of crash dumps
      expect(find.text('Peace & Serenity'), findsOneWidget);
      expect(find.textContaining('An unexpected interruption occurred'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
      expect(find.text('Return to Sanctuary Home'), findsOneWidget);

      // Verify buttons are interactive
      await tester.tap(find.text('Retry'));
      expect(retried, isTrue);

      await tester.tap(find.text('Return to Sanctuary Home'));
      expect(returnedHome, isTrue);
    });

    testWidgets('Renders Arabic copy with RTL directionality',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: DignifiedErrorWidget(locale: Locale('ar')),
        ),
      );

      expect(find.text('سكينة وطمأنينة'), findsOneWidget);
      expect(find.textContaining('حدث انقطاع غير متوقع'), findsOneWidget);
      expect(find.text('إعادة المحاولة'), findsOneWidget);
      expect(find.text('العودة إلى الصفحة الرئيسية'), findsOneWidget);

      // Verify Directionality is RTL
      final directionality = tester.widget<Directionality>(
        find.descendant(
          of: find.byType(DignifiedErrorWidget),
          matching: find.byType(Directionality),
        ).first,
      );
      expect(directionality.textDirection, equals(TextDirection.rtl));
    });

    testWidgets('Renders Urdu copy with RTL directionality',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: DignifiedErrorWidget(locale: Locale('ur')),
        ),
      );

      expect(find.text('سکون اور اطمینان'), findsOneWidget);
      expect(find.textContaining('ایک غیر متوقع رکاوٹ پیش آگئی ہے'), findsOneWidget);
      expect(find.text('دوبارہ کوشش کریں'), findsOneWidget);
      expect(find.text('مرکزی صفحہ پر واپس جائیں'), findsOneWidget);

      final directionality = tester.widget<Directionality>(
        find.descendant(
          of: find.byType(DignifiedErrorWidget),
          matching: find.byType(Directionality),
        ).first,
      );
      expect(directionality.textDirection, equals(TextDirection.rtl));
    });

    testWidgets('UI never displays exception details or stack traces',
        (WidgetTester tester) async {
      final details = FlutterErrorDetails(
        exception: Exception('DATABASE_CORRUPT: table users_pkey at D:/code/app/secret.dart'),
        stack: StackTrace.fromString('secret.dart:45\nsb_key=secret_12345'),
      );

      await tester.pumpWidget(
        MaterialApp(
          home: DignifiedErrorWidget(details: details),
        ),
      );

      // Strict confidentiality assertion
      expect(find.textContaining('DATABASE_CORRUPT'), findsNothing);
      expect(find.textContaining('secret.dart'), findsNothing);
      expect(find.textContaining('secret_12345'), findsNothing);
      expect(find.textContaining('users_pkey'), findsNothing);
    });
  });

  group('Privacy Regression & Prohibited Payload Verification', () {
    test('Persisted JSON payloads never leak prohibited religious or PII fields', () async {
      final storage = InMemoryDiagnosticStorage();
      final ringBuffer = DiagnosticRingBuffer(storage: storage);
      final service = DiagnosticService(buffer: ringBuffer);

      // Attempt to record a message contaminated with sensitive data
      await service.recordError(
        'Crash in search: surah: 2 ayah: 255 for user user.private@domain.com coords lat: 21.4225, lon: 39.8262 with token Bearer secret_token_xyz and prayerMethod: hanafi',
        stackTrace: StackTrace.fromString('file:///Users/john/repo/app.dart:12\napiKey: sbp_live_secret_key_12345678'),
        errorType: 'ComplexFailure',
      );

      final events = await ringBuffer.getEvents();
      expect(events.length, equals(1));

      final json = events.first.toJson();

      // Allowed fields ONLY
      expect(json.keys, containsAll(['id', 'timestamp', 'errorType', 'sanitizedStackTrace', 'appVersion', 'buildNumber', 'anonymousSessionId']));
      expect(json.containsKey('user'), isFalse);
      expect(json.containsKey('email'), isFalse);
      expect(json.containsKey('coordinates'), isFalse);
      expect(json.containsKey('metadata'), isFalse);
      expect(json.containsKey('payload'), isFalse);

      final jsonString = json.toString();
      expect(jsonString, isNot(contains('user.private@domain.com')));
      expect(jsonString, isNot(contains('21.4225')));
      expect(jsonString, isNot(contains('39.8262')));
      expect(jsonString, isNot(contains('secret_token_xyz')));
      expect(jsonString, isNot(contains('sbp_live_secret_key_12345678')));
      expect(jsonString, isNot(contains('ayah: 255')));
      expect(jsonString, isNot(contains('hanafi')));
      expect(jsonString, isNot(contains('Users/john')));
    });
  });
}
