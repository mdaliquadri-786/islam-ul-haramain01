import 'package:flutter/foundation.dart';
import 'audio_engine.dart';
import 'audio_models.dart';

/// Intent actions supported by system lockscreen, media notifications,
/// wearable remotes, and Bluetooth automotive controls.
enum NotificationMediaAction {
  play,
  pause,
  togglePlayPause,
  skipToNext,
  skipToPrevious,
  seek,
  stop,
  fastForward10,
  rewind10,
  audioInterruption,
  audioInterruptionEnd,
  headsetDisconnected,
}

/// Metadata payload projected to native OS lockscreen and media notification bar.
@immutable
class MediaNotificationMetadata {
  final String title;
  final String artist;
  final String album;
  final String? displaySubtitle;
  final Duration duration;
  final Duration position;
  final double speed;
  final bool isPlaying;
  final String? artworkUrl;

  const MediaNotificationMetadata({
    required this.title,
    required this.artist,
    required this.album,
    this.displaySubtitle,
    required this.duration,
    required this.position,
    this.speed = 1.0,
    required this.isPlaying,
    this.artworkUrl,
  });

  @override
  String toString() =>
      'MediaNotificationMetadata(title: "$title", artist: "$artist", isPlaying: $isPlaying)';
}

/// Abstract contract for platform-level background media service.
/// In production, this bridges to Android MediaSessionCompat / NotificationManager
/// and iOS MPNowPlayingInfoCenter / MPRemoteCommandCenter via native platform channels.
abstract class PlatformBackgroundAudioBridge {
  Future<void> updateNotification(MediaNotificationMetadata metadata);
  Future<void> clearNotification();
  void registerActionHandler(Future<void> Function(NotificationMediaAction action, dynamic payload) handler);
}

/// Default in-app coordinator and dispatcher for lockscreen / notification commands.
/// Coordinates actions between background session intents and [MobileAudioEngine].
class AudioNotificationHandler {
  final MobileAudioEngine audioEngine;
  final PlatformBackgroundAudioBridge? platformBridge;
  MediaNotificationMetadata? _lastPublishedMetadata;

  AudioNotificationHandler({
    required this.audioEngine,
    this.platformBridge,
  }) {
    platformBridge?.registerActionHandler(handlePlatformAction);
    audioEngine.addListener(_onEngineStateChanged);
  }

  MediaNotificationMetadata? get lastPublishedMetadata => _lastPublishedMetadata;

  void _onEngineStateChanged() {
    final state = audioEngine.state;
    final track = state.currentTrack;

    if (track == null || state.isStopped) {
      _lastPublishedMetadata = null;
      platformBridge?.clearNotification();
      return;
    }

    final metadata = MediaNotificationMetadata(
      title: 'سورة ${track.surahNameArabic} (${track.surahNameEnglish})',
      artist: state.currentReciter.nameEnglish,
      album: 'القرآن الكريم — Holy Quran',
      displaySubtitle: 'Ayah ${state.currentAyah} of ${track.totalAyahs}',
      duration: state.duration,
      position: state.position,
      speed: state.speed,
      isPlaying: state.isPlaying,
    );

    _lastPublishedMetadata = metadata;
    platformBridge?.updateNotification(metadata);
  }

  /// Dispatch action received from platform media controls (lockscreen, notification, headset)
  Future<void> handlePlatformAction(
    NotificationMediaAction action, [
    dynamic payload,
  ]) async {
    switch (action) {
      case NotificationMediaAction.play:
        await audioEngine.play();
        break;
      case NotificationMediaAction.pause:
        await audioEngine.pause();
        break;
      case NotificationMediaAction.togglePlayPause:
        await audioEngine.togglePlayPause();
        break;
      case NotificationMediaAction.skipToNext:
        await audioEngine.nextTrack();
        break;
      case NotificationMediaAction.skipToPrevious:
        await audioEngine.previousTrack();
        break;
      case NotificationMediaAction.stop:
        await audioEngine.stop();
        break;
      case NotificationMediaAction.seek:
        if (payload is Duration) {
          await audioEngine.seek(payload);
        } else if (payload is int) {
          await audioEngine.seek(Duration(milliseconds: payload));
        }
        break;
      case NotificationMediaAction.fastForward10:
        final currentPos = audioEngine.state.position;
        final newPos = currentPos + const Duration(seconds: 10);
        await audioEngine.seek(newPos);
        break;
      case NotificationMediaAction.rewind10:
        final currentPos = audioEngine.state.position;
        final newMs = (currentPos.inSeconds - 10).clamp(0, 86400);
        await audioEngine.seek(Duration(seconds: newMs));
        break;
      case NotificationMediaAction.audioInterruption:
        if (payload is AudioInterruptionType) {
          await audioEngine.handleAudioInterruption(payload);
        } else {
          await audioEngine.handleAudioInterruption(AudioInterruptionType.transientPause);
        }
        break;
      case NotificationMediaAction.audioInterruptionEnd:
        await audioEngine.handleAudioInterruptionEnd();
        break;
      case NotificationMediaAction.headsetDisconnected:
        await audioEngine.handleAudioInterruption(AudioInterruptionType.becomingNoisy);
        break;
    }
  }

  void dispose() {
    audioEngine.removeListener(_onEngineStateChanged);
    platformBridge?.clearNotification();
  }
}
