import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../core/tasbeeh/tasbeeh_model.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

class TasbeehScreen extends ConsumerWidget {
  const TasbeehScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final tasbeeh = ref.watch(tasbeehProvider);

    final progress = tasbeeh.targetCount > 0
        ? (tasbeeh.currentCount / tasbeeh.targetCount).clamp(0.0, 1.0)
        : 0.0;

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navTasbeeh,
        subtitle: 'المسبحة الإلكترونية والأذكار المأثورة',
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // 1. Preset Dhikr Selector
          SacredCard(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<DhikrItem>(
                  value: tasbeeh.activeDhikr,
                  isExpanded: true,
                  icon: const Icon(Icons.keyboard_arrow_down, color: AppTheme.emeraldPrimary),
                  items: kAuthenticDhikrPresets.map((d) {
                    return DropdownMenuItem<DhikrItem>(
                      value: d,
                      child: Text(
                        '${d.arabicText} (${d.transliteration})',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    );
                  }).toList(),
                  onChanged: (item) {
                    if (item != null) {
                      ref.read(tasbeehProvider.notifier).selectDhikr(item);
                    }
                  },
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 2. Active Dhikr Display Card
          SacredCard(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  Text(
                    tasbeeh.activeDhikr.arabicText,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'Amiri',
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.emeraldPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    tasbeeh.activeDhikr.transliteration,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 15, fontStyle: FontStyle.italic),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    l10n.isRtl
                        ? tasbeeh.activeDhikr.translationUrdu
                        : tasbeeh.activeDhikr.translationEnglish,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 13, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 3. Target Presets (33, 34, 99, 100)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [33, 34, 99, 100].map((target) {
              final isSelected = tasbeeh.targetCount == target;
              return ChoiceChip(
                label: Text('$target'),
                selected: isSelected,
                selectedColor: AppTheme.emeraldPrimary,
                labelStyle: TextStyle(
                  color: isSelected ? Colors.white : null,
                  fontWeight: FontWeight.bold,
                ),
                onSelected: (val) {
                  if (val) {
                    ref.read(tasbeehProvider.notifier).setTarget(target);
                  }
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 24),

          // 4. Interactive Circular Tap Surface
          Center(
            child: GestureDetector(
              onTap: () {
                final reached = ref.read(tasbeehProvider.notifier).increment();
                if (reached) {
                  HapticFeedback.heavyImpact();
                } else {
                  HapticFeedback.lightImpact();
                }
              },
              child: SizedBox(
                width: 220,
                height: 220,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Circular progress ring
                    SizedBox(
                      width: 220,
                      height: 220,
                      child: CircularProgressIndicator(
                        value: progress,
                        strokeWidth: 8,
                        backgroundColor: Colors.grey.withValues(alpha: 0.15),
                        valueColor: AlwaysStoppedAnimation<Color>(
                          tasbeeh.isCompleted ? AppTheme.goldLight : AppTheme.emeraldPrimary,
                        ),
                      ),
                    ),
                    // Tap button body
                    Container(
                      width: 190,
                      height: 190,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Theme.of(context).cardColor,
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.emeraldPrimary.withValues(alpha: 0.2),
                            blurRadius: 16,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${tasbeeh.currentCount}',
                            style: const TextStyle(
                              fontSize: 54,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                          Text(
                            '/ ${tasbeeh.targetCount}',
                            style: const TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'TAP',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.5,
                              color: AppTheme.emeraldPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // 5. Completion Banner
          if (tasbeeh.isCompleted) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppTheme.emeraldPrimary.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.emeraldPrimary),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle, color: AppTheme.emeraldPrimary, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    l10n.tasbeehComplete,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.emeraldPrimary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // 6. Laps / Cycle Count & Reset Controls
          SacredCard(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(l10n.tasbeehCycles, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      const SizedBox(height: 2),
                      Text(
                        '${tasbeeh.totalCyclesCompleted} Completed',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      TextButton.icon(
                        icon: const Icon(Icons.refresh, size: 16, color: Colors.grey),
                        label: Text(l10n.tasbeehReset, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                        onPressed: () {
                          ref.read(tasbeehProvider.notifier).resetCurrentCycle();
                        },
                      ),
                      const SizedBox(width: 8),
                      TextButton.icon(
                        icon: const Icon(Icons.restart_alt, size: 16, color: Colors.redAccent),
                        label: const Text('Reset All', style: TextStyle(color: Colors.redAccent, fontSize: 12)),
                        onPressed: () {
                          ref.read(tasbeehProvider.notifier).resetAll();
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
