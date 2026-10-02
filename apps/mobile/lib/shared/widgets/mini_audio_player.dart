import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/audio/audio_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';

/// Compact, persistent bottom player widget displayed across the app.
/// Allows instant play/pause control and tapping to expand to full [AudioScreen].
class MiniAudioPlayer extends ConsumerWidget {
  const MiniAudioPlayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(audioPlaybackStateProvider);
    final engine = ref.read(audioEngineProvider.notifier);
    final l10n = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Do not display if no track is loaded
    if (state.currentTrack == null) {
      return const SizedBox.shrink();
    }

    final track = state.currentTrack!;
    final progress = state.duration.inMilliseconds > 0
        ? (state.position.inMilliseconds / state.duration.inMilliseconds).clamp(0.0, 1.0)
        : 0.0;

    return Semantics(
      label: l10n.audioMiniPlayer,
      child: GestureDetector(
        onTap: () => context.push('/audio'),
        child: Container(
          margin: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 6.0),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(14.0),
            border: Border.all(
              color: AppTheme.goldAccent.withAlpha(120),
              width: 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(isDark ? 80 : 30),
                blurRadius: 8.0,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Thin progress bar across top
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(13.0)),
                child: LinearProgressIndicator(
                  value: progress,
                  minHeight: 3.0,
                  backgroundColor: AppTheme.goldAccent.withAlpha(30),
                  valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.goldAccent),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
                child: Row(
                  children: [
                    // Surah badge
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.goldAccent.withAlpha(25),
                        border: Border.all(color: AppTheme.goldAccent, width: 1.2),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${track.surahNumber}',
                        style: const TextStyle(
                          color: AppTheme.goldAccent,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12.0),
                    // Track Title & Reciter
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Row(
                            children: [
                              Flexible(
                                child: Text(
                                  track.surahNameEnglish,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13.5,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                track.surahNameArabic,
                                style: const TextStyle(
                                  fontFamily: 'Amiri',
                                  fontSize: 14,
                                  color: AppTheme.goldAccent,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2.0),
                          Text(
                            '${state.currentReciter.getLocalizedName(l10n.locale.languageCode)} • Ayah ${state.currentAyah}/${track.totalAyahs}',
                            style: TextStyle(
                              fontSize: 11.0,
                              color: isDark
                                  ? AppTheme.textDarkSecondary
                                  : AppTheme.textLightSecondary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    // Controls
                    IconButton(
                      icon: Icon(
                        state.isPlaying ? Icons.pause_circle_filled : Icons.play_circle_filled,
                        color: AppTheme.goldAccent,
                        size: 34,
                      ),
                      tooltip: state.isPlaying ? l10n.audioPause : l10n.audioPlay,
                      onPressed: () => engine.togglePlayPause(),
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.skip_next,
                        size: 24,
                      ),
                      tooltip: l10n.audioNext,
                      onPressed: () => engine.nextTrack(),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
