import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/audio/audio_models.dart';
import 'package:islamic_mobile/core/audio/audio_engine.dart';

void main() {
  group('M5.3 Audio Playlist & Queue Navigation Tests', () {
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

    test('nextTrack advances sequentially through Surahs', () async {
      await audioEngine.loadSurah(1);
      expect(audioEngine.state.currentTrack!.surahNumber, 1);

      await audioEngine.nextTrack();
      expect(audioEngine.state.currentTrack!.surahNumber, 2);
      expect(audioEngine.state.currentTrack!.surahNameEnglish, 'Al-Baqarah');

      await audioEngine.nextTrack();
      expect(audioEngine.state.currentTrack!.surahNumber, 3);
      expect(audioEngine.state.currentTrack!.surahNameEnglish, "Ali 'Imran");
    });

    test('nextTrack at Surah 114 with repeatOff stops playback', () async {
      await audioEngine.loadSurah(114);
      audioEngine.setRepeatMode(AudioRepeatMode.off);

      await audioEngine.nextTrack();
      expect(audioEngine.state.isStopped, isTrue);
    });

    test('nextTrack at Surah 114 with repeatAll wraps back to Surah 1', () async {
      await audioEngine.loadSurah(114);
      audioEngine.setRepeatMode(AudioRepeatMode.repeatAll);

      await audioEngine.nextTrack();
      expect(audioEngine.state.currentTrack!.surahNumber, 1);
      expect(audioEngine.state.currentTrack!.surahNameEnglish, 'Al-Fatihah');
    });

    test('previousTrack restarts current track if elapsed position > 3 seconds', () async {
      await audioEngine.loadSurah(2);
      await audioEngine.seek(const Duration(seconds: 15));
      expect(audioEngine.state.position.inSeconds, 15);

      await audioEngine.previousTrack();
      expect(audioEngine.state.currentTrack!.surahNumber, 2);
      expect(audioEngine.state.position, Duration.zero);
    });

    test('previousTrack navigates to previous Surah if position <= 3 seconds', () async {
      await audioEngine.loadSurah(3);
      await audioEngine.seek(const Duration(seconds: 1));

      await audioEngine.previousTrack();
      expect(audioEngine.state.currentTrack!.surahNumber, 2);
      expect(audioEngine.state.currentTrack!.surahNameEnglish, 'Al-Baqarah');
    });

    test('previousTrack at Surah 1 position 0 stays at Surah 1 position 0', () async {
      await audioEngine.loadSurah(1);
      await audioEngine.previousTrack();
      expect(audioEngine.state.currentTrack!.surahNumber, 1);
      expect(audioEngine.state.position, Duration.zero);
    });

    test('nextAyah advances timestamp within Surah and transitions to next Surah at end', () async {
      await audioEngine.loadSurah(112); // Al-Ikhlas (4 ayahs)
      expect(audioEngine.state.currentAyah, 1);

      await audioEngine.nextAyah();
      expect(audioEngine.state.currentAyah, 2);

      await audioEngine.nextAyah();
      expect(audioEngine.state.currentAyah, 3);

      await audioEngine.nextAyah();
      expect(audioEngine.state.currentAyah, 4);

      // At end of Surah 112, nextAyah advances to Surah 113
      await audioEngine.nextAyah();
      expect(audioEngine.state.currentTrack!.surahNumber, 113);
      expect(audioEngine.state.currentTrack!.surahNameEnglish, 'Al-Falaq');
    });

    test('previousAyah moves backwards and navigates to previous Surah at Ayah 1', () async {
      await audioEngine.loadSurah(113); // Al-Falaq
      await audioEngine.seekToAyah(3);
      expect(audioEngine.state.currentAyah, 3);

      await audioEngine.previousAyah();
      expect(audioEngine.state.currentAyah, 2);

      await audioEngine.previousAyah();
      expect(audioEngine.state.currentAyah, 1);

      // At Ayah 1, previousAyah moves to previous Surah (112)
      await audioEngine.previousAyah();
      expect(audioEngine.state.currentTrack!.surahNumber, 112);
    });
  });
}
