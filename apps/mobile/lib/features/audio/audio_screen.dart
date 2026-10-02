import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/audio/audio_models.dart';
import '../../core/audio/audio_provider.dart';
import '../../core/audio/audio_cache_manager.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

/// Full devotional audio player screen providing reciter selection,
/// Surah selection, Ayah-level timestamp tracking, and Waqf licensing attribution.
class AudioScreen extends ConsumerStatefulWidget {
  const AudioScreen({super.key});

  @override
  ConsumerState<AudioScreen> createState() => _AudioScreenState();
}

class _AudioScreenState extends ConsumerState<AudioScreen> {
  int _selectedSurah = 1;

  @override
  void initState() {
    super.initState();
    // Preload Surah 1 if no track is loaded yet
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final engine = ref.read(audioEngineProvider.notifier);
      if (engine.state.currentTrack == null) {
        engine.loadSurah(_selectedSurah);
      }
    });
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    if (d.inHours > 0) {
      final hours = d.inHours.toString();
      return '$hours:$minutes:$seconds';
    }
    return '$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final state = ref.watch(audioPlaybackStateProvider);
    final engine = ref.read(audioEngineProvider.notifier);

    final track = state.currentTrack;
    final currentAyah = state.currentAyah;
    final totalAyahs = track?.totalAyahs ?? 7;

    final progressRatio = (state.duration.inMilliseconds > 0)
        ? (state.position.inMilliseconds / state.duration.inMilliseconds)
            .clamp(0.0, 1.0)
        : 0.0;

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navAudio,
        subtitle: 'المصحف المرتل لكبار القراء المعتمدين',
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Reciter Selection Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n.audioReciters,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${kCanonicalVerifiedReciters.length} Reciters',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.goldAccent,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 48,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: kCanonicalVerifiedReciters.length,
                separatorBuilder: (_, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final reciter = kCanonicalVerifiedReciters[index];
                  final isSelected = reciter.id == state.currentReciter.id;

                  return ChoiceChip(
                    label: Text(
                      reciter.getLocalizedName(l10n.locale.languageCode),
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight:
                            isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected
                            ? Colors.black
                            : (isDark ? Colors.white : Colors.black87),
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppTheme.goldAccent,
                    backgroundColor: isDark
                        ? AppTheme.emeraldDark.withAlpha(80)
                        : Colors.grey.shade200,
                    onSelected: (selected) {
                      if (selected) {
                        engine.selectReciter(reciter);
                      }
                    },
                  );
                },
              ),
            ),

            const SizedBox(height: 16),

            // 2. Surah Quick Selector Dropdown
            SacredCard(
              padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
              child: Row(
                children: [
                  const Icon(Icons.menu_book, color: AppTheme.goldAccent, size: 20),
                  const SizedBox(width: 10),
                  const Text(
                    'Surah:',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<int>(
                        value: track?.surahNumber ?? _selectedSurah,
                        isExpanded: true,
                        icon: const Icon(Icons.arrow_drop_down, color: AppTheme.goldAccent),
                        items: kCanonicalSurahsCatalog.map((surah) {
                          return DropdownMenuItem<int>(
                            value: surah.number,
                            child: Text(
                              '${surah.number}. ${surah.nameEnglish} (${surah.nameArabic})',
                              style: const TextStyle(fontSize: 13),
                            ),
                          );
                        }).toList(),
                        onChanged: (int? newSurah) {
                          if (newSurah != null) {
                            setState(() {
                              _selectedSurah = newSurah;
                            });
                            engine.loadSurah(newSurah, autoPlay: state.isPlaying);
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 3. Main Player Stage Card
            SacredCard(
              backgroundColor: isDark
                  ? const Color(0xFF1E293B)
                  : Colors.white,
              borderColor: AppTheme.goldAccent.withAlpha(120),
              child: Column(
                children: [
                  // Surah Heading
                  Text(
                    'سورة ${track?.surahNameArabic ?? "الفاتحة"}',
                    style: const TextStyle(
                      fontFamily: 'Amiri',
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.goldAccent,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Surah ${track?.surahNameEnglish ?? "Al-Fatihah"} • ${track?.surahNumber ?? 1}',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    state.currentReciter.getLocalizedName(l10n.locale.languageCode),
                    style: TextStyle(
                      fontSize: 13,
                      color: isDark
                          ? AppTheme.textDarkSecondary
                          : AppTheme.textLightSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Ayah Counter & Indicator
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.goldAccent.withAlpha(25),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppTheme.goldAccent, width: 1),
                    ),
                    child: Text(
                      'Ayah $currentAyah of $totalAyahs',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.goldAccent,
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Position & Duration Scrubber Slider
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: AppTheme.goldAccent,
                      inactiveTrackColor: AppTheme.goldAccent.withAlpha(40),
                      thumbColor: AppTheme.goldAccent,
                      trackHeight: 3.5,
                      thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                    ),
                    child: Slider(
                      value: progressRatio,
                      onChanged: (val) {
                        final targetMs = (val * state.duration.inMilliseconds).round();
                        engine.seek(Duration(milliseconds: targetMs));
                      },
                    ),
                  ),

                  // Duration text labels
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _formatDuration(state.position),
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark
                                ? AppTheme.textDarkSecondary
                                : AppTheme.textLightSecondary,
                          ),
                        ),
                        Text(
                          _formatDuration(state.duration),
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark
                                ? AppTheme.textDarkSecondary
                                : AppTheme.textLightSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Primary Media Controls
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Previous Track
                      IconButton(
                        icon: const Icon(Icons.skip_previous, size: 28),
                        tooltip: l10n.audioPrevious,
                        onPressed: () => engine.previousTrack(),
                      ),
                      const SizedBox(width: 8),
                      // Previous Ayah
                      IconButton(
                        icon: const Icon(Icons.replay_10, size: 26),
                        tooltip: 'Rewind 10s',
                        onPressed: () {
                          final newSec = (state.position.inSeconds - 10).clamp(0, 86400);
                          engine.seek(Duration(seconds: newSec));
                        },
                      ),
                      const SizedBox(width: 12),
                      // Play / Pause Main Button
                      IconButton(
                        icon: Icon(
                          state.isPlaying
                              ? Icons.pause_circle_filled
                              : Icons.play_circle_filled,
                          size: 58,
                          color: AppTheme.goldAccent,
                        ),
                        tooltip: state.isPlaying ? l10n.audioPause : l10n.audioPlay,
                        onPressed: () => engine.togglePlayPause(),
                      ),
                      const SizedBox(width: 12),
                      // Next Ayah / Fast Forward
                      IconButton(
                        icon: const Icon(Icons.forward_10, size: 26),
                        tooltip: 'Forward 10s',
                        onPressed: () {
                          final newSec = state.position.inSeconds + 10;
                          engine.seek(Duration(seconds: newSec));
                        },
                      ),
                      const SizedBox(width: 8),
                      // Next Track
                      IconButton(
                        icon: const Icon(Icons.skip_next, size: 28),
                        tooltip: l10n.audioNext,
                        onPressed: () => engine.nextTrack(),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // Secondary Controls: Speed & Repeat
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 12,
                    children: [
                      ActionChip(
                        avatar: const Icon(Icons.speed, size: 16, color: AppTheme.goldAccent),
                        label: Text('${state.speed}x'),
                        onPressed: () {
                          final nextSpeed = switch (state.speed) {
                            0.75 => 1.0,
                            1.0 => 1.25,
                            1.25 => 1.5,
                            1.5 => 2.0,
                            _ => 0.75,
                          };
                          engine.setSpeed(nextSpeed);
                        },
                      ),
                      ActionChip(
                        avatar: Icon(
                          state.repeatMode == AudioRepeatMode.off
                              ? Icons.repeat
                              : Icons.repeat_on,
                          size: 16,
                          color: AppTheme.goldAccent,
                        ),
                        label: Text(
                          switch (state.repeatMode) {
                            AudioRepeatMode.off => l10n.audioRepeatOff,
                            AudioRepeatMode.repeatAll => l10n.audioRepeatAll,
                            AudioRepeatMode.repeatOne => l10n.audioRepeatOne,
                            AudioRepeatMode.repeatAyah => l10n.audioRepeatAyah,
                          },
                        ),
                        onPressed: () => engine.cycleRepeatMode(),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 4. Ayah Jump Navigator Strip
            SacredCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        l10n.audioAyahJump,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Text(
                        '1 - $totalAyahs',
                        style: const TextStyle(fontSize: 11, color: Colors.grey),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 38,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: totalAyahs,
                      separatorBuilder: (_, index) => const SizedBox(width: 6),
                      itemBuilder: (context, index) {
                        final ayahNum = index + 1;
                        final isCurrent = ayahNum == currentAyah;

                        return InkWell(
                          onTap: () => engine.seekToAyah(ayahNum),
                          borderRadius: BorderRadius.circular(6),
                          child: Container(
                            width: 38,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: isCurrent
                                  ? AppTheme.goldAccent
                                  : (isDark ? Colors.black26 : Colors.grey.shade100),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: isCurrent
                                    ? AppTheme.goldAccent
                                    : Colors.grey.withAlpha(60),
                              ),
                            ),
                            child: Text(
                              '$ayahNum',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight:
                                    isCurrent ? FontWeight.bold : FontWeight.normal,
                                color: isCurrent
                                    ? Colors.black
                                    : (isDark ? Colors.white : Colors.black87),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // 5. Islamic Waqf Attribution & Platform Boundary Transparency Banner
            SacredCard(
              backgroundColor: isDark
                  ? AppTheme.emeraldDark.withAlpha(40)
                  : AppTheme.emeraldPrimary.withAlpha(15),
              borderColor: AppTheme.goldAccent.withAlpha(80),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.verified, size: 18, color: AppTheme.goldAccent),
                      const SizedBox(width: 8),
                      Text(
                        l10n.audioWaqfAttribution,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.goldAccent,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    AudioCacheManager.waqfAttributionNotice,
                    style: TextStyle(fontSize: 11, color: Colors.grey, height: 1.4),
                  ),
                  const Divider(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.info_outline, size: 16, color: Colors.amber),
                      const SizedBox(width: 6),
                      Text(
                        l10n.audioPlatformNotice,
                        style: const TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: Colors.amber,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Full audio architecture, timestamp sync, state machine, and lockscreen contract are active. '
                    'Native background playback service & hardware lockscreen controls are pending native pub package availability.',
                    style: TextStyle(fontSize: 10.5, color: Colors.grey, height: 1.3),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
