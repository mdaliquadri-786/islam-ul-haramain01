import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'audio_models.dart';
import 'audio_engine.dart';
import 'audio_cache_manager.dart';
import 'audio_notification_handler.dart';

/// Provider for the Audio Cache Manager with default in-memory/temp cache path.
final audioCacheManagerProvider = Provider<AudioCacheManager>((ref) {
  // Use a sensible default cache path; in tests and offline mode it maintains an in-memory index
  return AudioCacheManager(
    cacheDirectoryPath: 'cache/audio',
    maxCacheSizeBytes: AudioCacheManager.kDefaultMaxCacheSizeBytes,
  );
});

/// Core audio engine ChangeNotifierProvider managing state and playback operations.
final audioEngineProvider =
    ChangeNotifierProvider<MobileAudioEngine>((ref) {
  return MobileAudioEngine(
    initialReciter: kCanonicalVerifiedReciters.first,
  );
});

/// Exposes the current immutable audio playback state.
final audioPlaybackStateProvider = Provider<AudioPlaybackState>((ref) {
  final engine = ref.watch(audioEngineProvider);
  return engine.state;
});

/// Currently selected reciter.
final selectedReciterProvider = Provider<AudioReciter>((ref) {
  final state = ref.watch(audioPlaybackStateProvider);
  return state.currentReciter;
});

/// Currently highlighted Ayah number (for synchronized Quran reading).
final activeAyahHighlightProvider = Provider<int>((ref) {
  final state = ref.watch(audioPlaybackStateProvider);
  return state.currentAyah;
});

/// Provider for notification and lockscreen command handler.
final audioNotificationHandlerProvider =
    Provider<AudioNotificationHandler>((ref) {
  final engine = ref.watch(audioEngineProvider);
  final handler = AudioNotificationHandler(audioEngine: engine);

  ref.onDispose(() {
    handler.dispose();
  });

  return handler;
});
