import 'dart:async';
import 'package:flutter/foundation.dart';
import 'audio_models.dart';

/// Abstract engine contract defining low-level audio playback primitives.
/// In production with native dependencies, this connects to `just_audio` or native platform channels.
/// In offline/test environments, this allows deterministic verification and state control.
abstract class AudioPlaybackEngine {
  Future<void> load(
    AudioTrack track, {
    Duration initialPosition = Duration.zero,
    bool autoPlay = false,
  });
  Future<void> play();
  Future<void> pause();
  Future<void> stop();
  Future<void> seek(Duration position);
  Future<void> setSpeed(double speed);
  Future<void> dispose();

  Stream<AudioPlaybackStatus> get statusStream;
  Stream<AudioProcessingState> get processingStateStream;
  Stream<Duration> get positionStream;
  Stream<Duration> get bufferedPositionStream;
  Stream<Duration> get durationStream;
  Stream<String?> get errorStream;

  Duration get currentPosition;
  Duration get currentDuration;
  AudioPlaybackStatus get currentStatus;
  AudioProcessingState get currentProcessingState;
}

/// Simulated / Mock audio engine for deterministic unit testing and offline architecture verification.
/// Generates synthetic clock ticks and state transitions without requiring native platform channels.
class SimulatedAudioPlaybackEngine implements AudioPlaybackEngine {
  final _statusController =
      StreamController<AudioPlaybackStatus>.broadcast(sync: true);
  final _processingStateController =
      StreamController<AudioProcessingState>.broadcast(sync: true);
  final _positionController =
      StreamController<Duration>.broadcast(sync: true);
  final _bufferedPositionController =
      StreamController<Duration>.broadcast(sync: true);
  final _durationController =
      StreamController<Duration>.broadcast(sync: true);
  final _errorController = StreamController<String?>.broadcast(sync: true);

  AudioPlaybackStatus _status = AudioPlaybackStatus.stopped;
  AudioProcessingState _processingState = AudioProcessingState.idle;
  Duration _position = Duration.zero;
  Duration _bufferedPosition = Duration.zero;
  Duration _duration = Duration.zero;
  double _speed = 1.0;
  Timer? _playbackTimer;
  AudioTrack? _currentTrack;

  @override
  Stream<AudioPlaybackStatus> get statusStream => _statusController.stream;
  @override
  Stream<AudioProcessingState> get processingStateStream =>
      _processingStateController.stream;
  @override
  Stream<Duration> get positionStream => _positionController.stream;
  @override
  Stream<Duration> get bufferedPositionStream =>
      _bufferedPositionController.stream;
  @override
  Stream<Duration> get durationStream => _durationController.stream;
  @override
  Stream<String?> get errorStream => _errorController.stream;

  @override
  Duration get currentPosition => _position;
  @override
  Duration get currentDuration => _duration;
  @override
  AudioPlaybackStatus get currentStatus => _status;
  @override
  AudioProcessingState get currentProcessingState => _processingState;

  @override
  Future<void> load(
    AudioTrack track, {
    Duration initialPosition = Duration.zero,
    bool autoPlay = false,
  }) async {
    _currentTrack = track;
    _setProcessingState(AudioProcessingState.loading);
    _duration = track.duration;
    _durationController.add(_duration);
    _position = initialPosition;
    _positionController.add(_position);
    _bufferedPosition = track.duration;
    _bufferedPositionController.add(_bufferedPosition);

    _setProcessingState(AudioProcessingState.ready);
    if (autoPlay) {
      await play();
    } else {
      _setStatus(AudioPlaybackStatus.paused);
    }
  }

  @override
  Future<void> play() async {
    if (_currentTrack == null) return;
    _setStatus(AudioPlaybackStatus.playing);
    _setProcessingState(AudioProcessingState.ready);
    _startTimer();
  }

  @override
  Future<void> pause() async {
    _stopTimer();
    _setStatus(AudioPlaybackStatus.paused);
  }

  @override
  Future<void> stop() async {
    _stopTimer();
    _position = Duration.zero;
    _positionController.add(_position);
    _setStatus(AudioPlaybackStatus.stopped);
    _setProcessingState(AudioProcessingState.idle);
  }

  @override
  Future<void> seek(Duration position) async {
    final clamped = Duration(
      milliseconds: position.inMilliseconds.clamp(0, _duration.inMilliseconds),
    );
    _position = clamped;
    _positionController.add(_position);
  }

  @override
  Future<void> setSpeed(double speed) async {
    _speed = speed.clamp(0.5, 3.0);
    if (_status == AudioPlaybackStatus.playing) {
      _stopTimer();
      _startTimer();
    }
  }

  void _startTimer() {
    _stopTimer();
    // 250ms simulated resolution for tests
    final intervalMs = (250 / _speed).round().clamp(50, 1000);
    _playbackTimer = Timer.periodic(Duration(milliseconds: intervalMs), (timer) {
      final newMs = _position.inMilliseconds + 250;
      if (newMs >= _duration.inMilliseconds) {
        _position = _duration;
        _positionController.add(_position);
        _stopTimer();
        _setStatus(AudioPlaybackStatus.stopped);
        _setProcessingState(AudioProcessingState.completed);
      } else {
        _position = Duration(milliseconds: newMs);
        _positionController.add(_position);
      }
    });
  }

  void _stopTimer() {
    _playbackTimer?.cancel();
    _playbackTimer = null;
  }

  void _setStatus(AudioPlaybackStatus status) {
    _status = status;
    _statusController.add(_status);
  }

  void _setProcessingState(AudioProcessingState state) {
    _processingState = state;
    _processingStateController.add(_processingState);
  }

  /// Inject error for unit testing state transitions
  void injectError(String message) {
    _stopTimer();
    _setStatus(AudioPlaybackStatus.stopped);
    _setProcessingState(AudioProcessingState.error);
    _errorController.add(message);
  }

  @override
  Future<void> dispose() async {
    _stopTimer();
    await _statusController.close();
    await _processingStateController.close();
    await _positionController.close();
    await _bufferedPositionController.close();
    await _durationController.close();
    await _errorController.close();
  }
}

/// Orchestrator and State Machine for Islamic Audio Playback.
/// Enforces valid state transitions, Ayah synchronization, queue navigation, and repeat policies.
class MobileAudioEngine extends ChangeNotifier {
  final AudioPlaybackEngine _engine;
  AudioPlaybackState _state;
  final List<StreamSubscription> _subscriptions = [];

  MobileAudioEngine({
    AudioPlaybackEngine? engine,
    AudioReciter? initialReciter,
  })  : _engine = engine ?? SimulatedAudioPlaybackEngine(),
        _state = AudioPlaybackState(
          currentReciter: initialReciter ?? kCanonicalVerifiedReciters.first,
        ) {
    _initEngineSubscriptions();
  }

  AudioPlaybackState get state => _state;
  AudioPlaybackEngine get engine => _engine;

  void _initEngineSubscriptions() {
    _subscriptions.add(_engine.statusStream.listen((status) {
      _state = _state.copyWith(status: status);
      notifyListeners();
    }));

    _subscriptions.add(_engine.processingStateStream.listen((proc) {
      _state = _state.copyWith(processingState: proc);
      if (proc == AudioProcessingState.completed) {
        _handleTrackCompletion();
      }
      notifyListeners();
    }));

    _subscriptions.add(_engine.positionStream.listen((pos) {
      int currentAyah = _state.currentAyah;
      if (_state.currentTrack != null) {
        currentAyah = _state.currentTrack!.getAyahAtTimestamp(pos);
      }
      _state = _state.copyWith(
        position: pos,
        currentAyah: currentAyah,
      );
      notifyListeners();
    }));

    _subscriptions.add(_engine.bufferedPositionStream.listen((buf) {
      _state = _state.copyWith(bufferedPosition: buf);
      notifyListeners();
    }));

    _subscriptions.add(_engine.durationStream.listen((dur) {
      _state = _state.copyWith(duration: dur);
      notifyListeners();
    }));

    _subscriptions.add(_engine.errorStream.listen((err) {
      if (err != null) {
        _state = _state.copyWith(
          errorMessage: () => err,
          processingState: AudioProcessingState.error,
          status: AudioPlaybackStatus.stopped,
        );
        notifyListeners();
      }
    }));
  }

  /// Change active reciter.
  Future<void> selectReciter(AudioReciter reciter) async {
    if (_state.currentReciter.id == reciter.id) return;

    final currentSurah = _state.currentTrack?.surahNumber;
    _state = _state.copyWith(currentReciter: reciter);

    if (currentSurah != null) {
      await loadSurah(currentSurah, autoPlay: _state.isPlaying);
    } else {
      notifyListeners();
    }
  }

  /// Load a Surah track for the current reciter.
  Future<void> loadSurah(
    int surahNumber, {
    bool autoPlay = false,
    Duration initialPosition = Duration.zero,
  }) async {
    if (surahNumber < 1 || surahNumber > 114) {
      _state = _state.copyWith(
        errorMessage: () => 'Invalid Surah number: $surahNumber (must be 1-114)',
        processingState: AudioProcessingState.error,
      );
      notifyListeners();
      return;
    }

    final track = buildCanonicalAudioTrack(
      reciter: _state.currentReciter,
      surahNumber: surahNumber,
    );

    _state = _state.copyWith(
      currentTrack: track,
      duration: track.duration,
      position: initialPosition,
      currentAyah: 1,
      errorMessage: () => null,
      processingState: AudioProcessingState.loading,
    );
    notifyListeners();

    await _engine.load(track, initialPosition: initialPosition, autoPlay: autoPlay);
  }

  /// Play current loaded track or start first surah if empty.
  Future<void> play() async {
    if (_state.currentTrack == null) {
      await loadSurah(1, autoPlay: true);
      return;
    }

    if (_state.processingState == AudioProcessingState.completed) {
      await _engine.seek(Duration.zero);
    }
    await _engine.play();
  }

  /// Pause playback.
  Future<void> pause() async {
    await _engine.pause();
  }

  /// Toggle play / pause.
  Future<void> togglePlayPause() async {
    if (_state.isPlaying) {
      await pause();
    } else {
      await play();
    }
  }

  /// Stop playback and reset to start.
  Future<void> stop() async {
    await _engine.stop();
  }

  /// Seek to specific position.
  Future<void> seek(Duration position) async {
    await _engine.seek(position);
  }

  /// Seek to specific Ayah within current track.
  Future<void> seekToAyah(int ayahNumber) async {
    final track = _state.currentTrack;
    if (track == null) return;

    final targetPos = track.getPositionForAyah(ayahNumber);
    await seek(targetPos);
  }

  /// Skip to next Ayah or advance to next Surah if at end.
  Future<void> nextAyah() async {
    final track = _state.currentTrack;
    if (track == null) return;

    if (_state.currentAyah < track.totalAyahs) {
      await seekToAyah(_state.currentAyah + 1);
    } else {
      await nextTrack();
    }
  }

  /// Skip to previous Ayah or go to previous Surah.
  Future<void> previousAyah() async {
    final track = _state.currentTrack;
    if (track == null) return;

    if (_state.currentAyah > 1) {
      await seekToAyah(_state.currentAyah - 1);
    } else {
      await previousTrack();
    }
  }

  /// Next track in catalog (1-114).
  Future<void> nextTrack() async {
    final track = _state.currentTrack;
    if (track == null) {
      await loadSurah(1, autoPlay: true);
      return;
    }

    final nextSurah = track.surahNumber + 1;
    if (nextSurah <= 114) {
      await loadSurah(nextSurah, autoPlay: true);
    } else if (_state.repeatMode == AudioRepeatMode.repeatAll) {
      await loadSurah(1, autoPlay: true);
    } else {
      await stop();
    }
  }

  /// Previous track in catalog.
  Future<void> previousTrack() async {
    final track = _state.currentTrack;
    if (track == null) {
      await loadSurah(1, autoPlay: true);
      return;
    }

    // If more than 3 seconds in, restart current track
    if (_state.position.inSeconds > 3) {
      await seek(Duration.zero);
      return;
    }

    final prevSurah = track.surahNumber - 1;
    if (prevSurah >= 1) {
      await loadSurah(prevSurah, autoPlay: true);
    } else {
      await seek(Duration.zero);
    }
  }

  /// Set playback speed (e.g. 0.75, 1.0, 1.25, 1.5, 2.0).
  Future<void> setSpeed(double speed) async {
    const validSpeeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    final selectedSpeed = validSpeeds.contains(speed) ? speed : 1.0;
    _state = _state.copyWith(speed: selectedSpeed);
    notifyListeners();
    await _engine.setSpeed(selectedSpeed);
  }

  /// Cycle or set repeat mode.
  void setRepeatMode(AudioRepeatMode mode) {
    _state = _state.copyWith(repeatMode: mode);
    notifyListeners();
  }

  void cycleRepeatMode() {
    final nextMode = switch (_state.repeatMode) {
      AudioRepeatMode.off => AudioRepeatMode.repeatAll,
      AudioRepeatMode.repeatAll => AudioRepeatMode.repeatOne,
      AudioRepeatMode.repeatOne => AudioRepeatMode.repeatAyah,
      AudioRepeatMode.repeatAyah => AudioRepeatMode.off,
    };
    setRepeatMode(nextMode);
  }

  /// Handle track completion according to repeat policy.
  void _handleTrackCompletion() {
    switch (_state.repeatMode) {
      case AudioRepeatMode.repeatOne:
        seek(Duration.zero).then((_) => play());
        break;
      case AudioRepeatMode.repeatAyah:
        seekToAyah(_state.currentAyah).then((_) => play());
        break;
      case AudioRepeatMode.repeatAll:
        nextTrack();
        break;
      case AudioRepeatMode.off:
        if (_state.currentTrack != null &&
            _state.currentTrack!.surahNumber < 114) {
          nextTrack();
        } else {
          stop();
        }
        break;
    }
  }

  bool _wasPlayingBeforeInterruption = false;
  bool get wasPlayingBeforeInterruption => _wasPlayingBeforeInterruption;

  /// Handles OS audio focus interruptions (incoming phone call, alarms, headset unplugged).
  Future<void> handleAudioInterruption(AudioInterruptionType type) async {
    switch (type) {
      case AudioInterruptionType.transientPause:
        if (_state.isPlaying) {
          _wasPlayingBeforeInterruption = true;
          await pause();
        }
        break;
      case AudioInterruptionType.permanentLoss:
      case AudioInterruptionType.becomingNoisy:
        _wasPlayingBeforeInterruption = false;
        if (_state.isPlaying) {
          await pause();
        }
        break;
    }
  }

  /// Resumes playback when a transient interruption ends, if playback was active before the interruption.
  Future<void> handleAudioInterruptionEnd() async {
    if (_wasPlayingBeforeInterruption && _state.isPaused) {
      _wasPlayingBeforeInterruption = false;
      await play();
    }
  }

  @override
  void dispose() {
    for (final sub in _subscriptions) {
      sub.cancel();
    }
    _engine.dispose();
    super.dispose();
  }
}
