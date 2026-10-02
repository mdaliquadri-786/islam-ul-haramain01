import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:islamic_mobile/core/localization/app_localizations.dart';
import 'package:islamic_mobile/core/audio/audio_models.dart';
import 'package:islamic_mobile/core/audio/audio_engine.dart';
import 'package:islamic_mobile/core/audio/audio_notification_handler.dart';
import 'package:islamic_mobile/core/audio/audio_provider.dart';
import 'package:islamic_mobile/features/audio/audio_screen.dart';
import 'package:islamic_mobile/shared/widgets/mini_audio_player.dart';

void main() {
  Widget buildTestWidget({
    required Widget child,
    List<Override> overrides = const [],
  }) {
    return ProviderScope(
      overrides: overrides,
      child: MaterialApp(
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(body: child),
      ),
    );
  }

  group('M5.3 Audio UI & Screen Widget Tests', () {
    testWidgets('AudioScreen renders reciters, player card, Ayah jump list, and Waqf notice',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1080, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final testEngine = MobileAudioEngine(
        engine: SimulatedAudioPlaybackEngine(),
        initialReciter: kCanonicalVerifiedReciters.first,
      );

      await tester.pumpWidget(
        buildTestWidget(
          child: const AudioScreen(),
          overrides: [
            audioEngineProvider.overrideWith((ref) => testEngine),
          ],
        ),
      );
      await tester.pumpAndSettle();

      // Verified reciters section
      expect(find.text('Verified Reciters'), findsOneWidget);
      expect(find.text('Mishary Rashid Alafasy'), findsWidgets);
      expect(find.text('Mahmoud Khalil Al-Husary'), findsWidgets);

      // Main player card & Surah heading
      expect(find.text('سورة الفاتحة'), findsOneWidget);
      expect(find.text('Surah Al-Fatihah • 1'), findsOneWidget);
      expect(find.text('Ayah 1 of 7'), findsOneWidget);

      // Play / Pause and scrubber
      expect(find.byIcon(Icons.play_circle_filled), findsOneWidget);
      expect(find.byType(Slider), findsOneWidget);

      // Speed & Repeat chips
      expect(find.text('1.0x'), findsOneWidget);
      expect(find.text('Off'), findsOneWidget);

      // Ayah jump list
      expect(find.text('Jump to Ayah'), findsOneWidget);
      expect(find.text('1 - 7'), findsOneWidget);

      // Islamic Waqf banner & architecture notice
      expect(find.text('Islamic Waqf Open Audio (EveryAyah / Archive.org)'), findsOneWidget);
      expect(find.text('Background Audio Architecture Ready'), findsOneWidget);

      // Tap reciter chip to change reciter
      final husaryChip = find.text('Mahmoud Khalil Al-Husary');
      await tester.tap(husaryChip);
      await tester.pumpAndSettle();
      expect(testEngine.state.currentReciter.id, 'al-husary');

      // Tap Play button
      final playButton = find.byIcon(Icons.play_circle_filled);
      await tester.tap(playButton);
      await tester.pump();
      expect(testEngine.state.isPlaying, isTrue);

      // Tap Ayah 3 jump button
      final ayah3 = find.text('3');
      await tester.tap(ayah3);
      await tester.pump();
      expect(testEngine.state.currentAyah, 3);
    });

    testWidgets('MiniAudioPlayer renders correctly when track is active and hidden when null',
        (WidgetTester tester) async {
      final testEngine = MobileAudioEngine(
        engine: SimulatedAudioPlaybackEngine(),
        initialReciter: kCanonicalVerifiedReciters.first,
      );

      await tester.pumpWidget(
        buildTestWidget(
          child: const MiniAudioPlayer(),
          overrides: [
            audioEngineProvider.overrideWith((ref) => testEngine),
          ],
        ),
      );
      await tester.pumpAndSettle();

      // Initially no track loaded -> MiniPlayer is empty/hidden
      expect(find.byType(LinearProgressIndicator), findsNothing);

      // Load a track
      await testEngine.loadSurah(1);
      await tester.pumpAndSettle();

      // Mini player is now visible
      expect(find.text('Al-Fatihah'), findsOneWidget);
      expect(find.text('1'), findsWidgets);
      expect(find.byIcon(Icons.play_circle_filled), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);

      // Tap play in mini player
      await tester.tap(find.byIcon(Icons.play_circle_filled));
      await tester.pump();
      expect(testEngine.state.isPlaying, isTrue);

      // Icon changes to pause
      expect(find.byIcon(Icons.pause_circle_filled), findsOneWidget);
    });

    test('AudioNotificationHandler publishes metadata and dispatches platform actions', () async {
      final testEngine = MobileAudioEngine(
        engine: SimulatedAudioPlaybackEngine(),
        initialReciter: kCanonicalVerifiedReciters.first,
      );

      final handler = AudioNotificationHandler(audioEngine: testEngine);
      expect(handler.lastPublishedMetadata, isNull);

      // Load Surah 112 (Al-Ikhlas)
      await testEngine.loadSurah(112);
      final meta = handler.lastPublishedMetadata;
      expect(meta, isNotNull);
      expect(meta!.title, contains('الإخلاص'));
      expect(meta.artist, 'Mishary Rashid Alafasy');
      expect(meta.album, contains('Holy Quran'));
      expect(meta.displaySubtitle, 'Ayah 1 of 4');
      expect(meta.isPlaying, isFalse);

      // Dispatch platform play
      await handler.handlePlatformAction(NotificationMediaAction.play);
      expect(testEngine.state.isPlaying, isTrue);
      expect(handler.lastPublishedMetadata!.isPlaying, isTrue);

      // Dispatch fast forward 10s
      await handler.handlePlatformAction(NotificationMediaAction.fastForward10);
      expect(testEngine.state.position.inSeconds, 10);

      // Dispatch pause
      await handler.handlePlatformAction(NotificationMediaAction.pause);
      expect(testEngine.state.isPaused, isTrue);

      handler.dispose();
      testEngine.dispose();
    });

    test('Audio focus and interruption lifecycle pauses playback and resumes conditionally', () async {
      final testEngine = MobileAudioEngine(
        engine: SimulatedAudioPlaybackEngine(),
        initialReciter: kCanonicalVerifiedReciters.first,
      );
      final handler = AudioNotificationHandler(audioEngine: testEngine);

      await testEngine.loadSurah(1);
      await testEngine.play();
      expect(testEngine.state.isPlaying, isTrue);

      // 1. Transient interruption (e.g. phone notification or brief call)
      await handler.handlePlatformAction(
        NotificationMediaAction.audioInterruption,
        AudioInterruptionType.transientPause,
      );
      expect(testEngine.state.isPaused, isTrue);
      expect(testEngine.wasPlayingBeforeInterruption, isTrue);

      // 2. Interruption ends -> resumes automatically
      await handler.handlePlatformAction(NotificationMediaAction.audioInterruptionEnd);
      expect(testEngine.state.isPlaying, isTrue);
      expect(testEngine.wasPlayingBeforeInterruption, isFalse);

      // 3. Permanent loss -> does not resume on end
      await handler.handlePlatformAction(
        NotificationMediaAction.audioInterruption,
        AudioInterruptionType.permanentLoss,
      );
      expect(testEngine.state.isPaused, isTrue);
      expect(testEngine.wasPlayingBeforeInterruption, isFalse);

      await handler.handlePlatformAction(NotificationMediaAction.audioInterruptionEnd);
      expect(testEngine.state.isPaused, isTrue);

      handler.dispose();
      testEngine.dispose();
    });

    test('Headset disconnect / becoming noisy immediately pauses playback to protect user privacy', () async {
      final testEngine = MobileAudioEngine(
        engine: SimulatedAudioPlaybackEngine(),
        initialReciter: kCanonicalVerifiedReciters.first,
      );
      final handler = AudioNotificationHandler(audioEngine: testEngine);

      await testEngine.loadSurah(114);
      await testEngine.play();
      expect(testEngine.state.isPlaying, isTrue);

      // Headset unplugged / Bluetooth device disconnected
      await handler.handlePlatformAction(NotificationMediaAction.headsetDisconnected);
      expect(testEngine.state.isPaused, isTrue);
      expect(testEngine.wasPlayingBeforeInterruption, isFalse);

      handler.dispose();
      testEngine.dispose();
    });
  });
}

