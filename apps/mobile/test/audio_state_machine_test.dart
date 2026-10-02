import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/audio/audio_models.dart';
import 'package:islamic_mobile/core/audio/audio_engine.dart';

void main() {
  group('M5.3 Audio State Machine & Engine Tests', () {
    late SimulatedAudioPlaybackEngine simulatedEngine;
    late MobileAudioEngine audioEngine;

    setUp(() {
      simulatedEngine = SimulatedAudioPlaybackEngine();
      audioEngine = MobileAudioEngine(
        engine: simulatedEngine,
        initialReciter: kCanonicalVerifiedReciters.first,
      );
    });

    tearDown(() {
      audioEngine.dispose();
    });

    test('Initial state is idle with canonical reciter Alafasy', () {
      final state = audioEngine.state;
      expect(state.status, AudioPlaybackStatus.stopped);
      expect(state.processingState, AudioProcessingState.idle);
      expect(state.currentReciter.id, 'alafasy');
      expect(state.currentTrack, isNull);
      expect(state.currentAyah, 1);
      expect(state.position, Duration.zero);
      expect(state.speed, 1.0);
      expect(state.repeatMode, AudioRepeatMode.off);
    });

    test('Loading valid Surah transitions from loading to ready', () async {
      await audioEngine.loadSurah(1); // Al-Fatihah
      final state = audioEngine.state;

      expect(state.currentTrack, isNotNull);
      expect(state.currentTrack!.surahNumber, 1);
      expect(state.currentTrack!.surahNameEnglish, 'Al-Fatihah');
      expect(state.currentTrack!.totalAyahs, 7);
      expect(state.processingState, AudioProcessingState.ready);
      expect(state.status, AudioPlaybackStatus.paused);
      expect(state.currentAyah, 1);
      expect(state.errorMessage, isNull);
    });

    test('Loading invalid Surah (e.g. 0 or 115) fails closed into error state', () async {
      await audioEngine.loadSurah(0);
      expect(audioEngine.state.processingState, AudioProcessingState.error);
      expect(audioEngine.state.errorMessage, contains('Invalid Surah number'));

      await audioEngine.loadSurah(115);
      expect(audioEngine.state.processingState, AudioProcessingState.error);
      expect(audioEngine.state.errorMessage, contains('Invalid Surah number'));
    });

    test('Playback state transitions: play -> pause -> togglePlayPause -> stop', () async {
      await audioEngine.loadSurah(1);
      expect(audioEngine.state.isPlaying, isFalse);

      await audioEngine.play();
      expect(audioEngine.state.isPlaying, isTrue);
      expect(audioEngine.state.status, AudioPlaybackStatus.playing);

      await audioEngine.pause();
      expect(audioEngine.state.isPaused, isTrue);
      expect(audioEngine.state.status, AudioPlaybackStatus.paused);

      await audioEngine.togglePlayPause();
      expect(audioEngine.state.isPlaying, isTrue);

      await audioEngine.stop();
      expect(audioEngine.state.isStopped, isTrue);
      expect(audioEngine.state.position, Duration.zero);
    });

    test('Injected engine error transitions state machine to error and stops playback', () async {
      await audioEngine.loadSurah(1, autoPlay: true);
      expect(audioEngine.state.isPlaying, isTrue);

      simulatedEngine.injectError('Network socket timeout on EveryAyah CDN');
      expect(audioEngine.state.processingState, AudioProcessingState.error);
      expect(audioEngine.state.status, AudioPlaybackStatus.stopped);
      expect(audioEngine.state.errorMessage, 'Network socket timeout on EveryAyah CDN');
    });

    test('Setting playback speed enforces valid speed multipliers', () async {
      await audioEngine.setSpeed(1.5);
      expect(audioEngine.state.speed, 1.5);

      await audioEngine.setSpeed(2.0);
      expect(audioEngine.state.speed, 2.0);

      await audioEngine.setSpeed(0.75);
      expect(audioEngine.state.speed, 0.75);

      // Invalid speed defaults to 1.0
      await audioEngine.setSpeed(5.0);
      expect(audioEngine.state.speed, 1.0);
    });

    test('Repeat mode cycling correctly sequences off -> repeatAll -> repeatOne -> repeatAyah -> off', () {
      expect(audioEngine.state.repeatMode, AudioRepeatMode.off);

      audioEngine.cycleRepeatMode();
      expect(audioEngine.state.repeatMode, AudioRepeatMode.repeatAll);

      audioEngine.cycleRepeatMode();
      expect(audioEngine.state.repeatMode, AudioRepeatMode.repeatOne);

      audioEngine.cycleRepeatMode();
      expect(audioEngine.state.repeatMode, AudioRepeatMode.repeatAyah);

      audioEngine.cycleRepeatMode();
      expect(audioEngine.state.repeatMode, AudioRepeatMode.off);
    });

    test('Selecting reciter updates active reciter and preserves current track if loaded', () async {
      await audioEngine.loadSurah(112); // Al-Ikhlas
      expect(audioEngine.state.currentReciter.id, 'alafasy');
      expect(audioEngine.state.currentTrack!.reciterId, 'alafasy');

      final husary = kCanonicalVerifiedReciters.firstWhere((r) => r.id == 'al-husary');
      await audioEngine.selectReciter(husary);

      expect(audioEngine.state.currentReciter.id, 'al-husary');
      expect(audioEngine.state.currentTrack!.reciterId, 'al-husary');
      expect(audioEngine.state.currentTrack!.surahNumber, 112);
    });
  });
}
