import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../core/prayer/prayer_models.dart';
import '../../core/prayer/prayer_provider.dart';
import '../../core/prayer/city_presets.dart';
import '../../core/calendar/hijri_calendar.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

class PrayerScreen extends ConsumerWidget {
  const PrayerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final selectedCity = ref.watch(selectedLocationProvider);
    final prayerTimes = ref.watch(prayerTimesProvider);
    final nextPrayerInfo = ref.watch(nextPrayerInfoProvider);
    final method = ref.watch(calculationMethodProvider);
    final madhab = ref.watch(asrMadhabProvider);

    final hijriDate = HijriCalendarCalculator.fromGregorian(DateTime.now());

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navPrayer,
        subtitle: 'حساب دقيق لمواقيت الصلاة',
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // 1. Location Bar & City Selector
          SacredCard(
            child: ListTile(
              leading: const Icon(Icons.location_on, color: AppTheme.emeraldPrimary),
              title: Text(
                l10n.isRtl ? selectedCity.nameArabic : selectedCity.name,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: Text(
                '${selectedCity.country} • ${selectedCity.coordinates.latitude.toStringAsFixed(2)}° N, ${selectedCity.coordinates.longitude.toStringAsFixed(2)}° E',
                style: const TextStyle(fontSize: 11, color: Colors.grey),
              ),
              trailing: PopupMenuButton<PresetCity>(
                icon: const Icon(Icons.arrow_drop_down_circle_outlined, color: AppTheme.emeraldPrimary),
                tooltip: l10n.selectCity,
                onSelected: (city) {
                  ref.read(selectedLocationProvider.notifier).selectCity(city);
                },
                itemBuilder: (ctx) {
                  return kGlobalPresetCities.map((c) {
                    return PopupMenuItem<PresetCity>(
                      value: c,
                      child: Text(l10n.isRtl ? c.nameArabic : c.name),
                    );
                  }).toList();
                },
              ),
            ),
          ),
          const SizedBox(height: 12),

          // 2. Hijri Calendar Date & Holiday Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: AppTheme.emeraldPrimary.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.emeraldPrimary.withValues(alpha: 0.3)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.calendar_month_outlined, size: 18, color: AppTheme.emeraldPrimary),
                    const SizedBox(width: 8),
                    Text(
                      l10n.isRtl ? hijriDate.formatArabic() : hijriDate.formatEnglish(),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
                if (hijriDate.holiday != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.goldLight.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: AppTheme.goldLight),
                    ),
                    child: Text(
                      l10n.isRtl ? hijriDate.holiday!.nameArabic : hijriDate.holiday!.nameEnglish,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.goldLight),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 3. Hero Card: Active Prayer & Countdown to Next Prayer
          SacredCard(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.nextPrayer,
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _getPrayerLocalizedName(l10n, nextPrayerInfo.nextPrayer),
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.emeraldPrimary,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            l10n.timeRemaining,
                            style: const TextStyle(fontSize: 12, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _formatDuration(nextPrayerInfo.timeRemaining),
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  LinearProgressIndicator(
                    value: nextPrayerInfo.progressFraction,
                    backgroundColor: Colors.grey.withValues(alpha: 0.2),
                    valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.emeraldPrimary),
                    minHeight: 6,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 4. Daily Prayer Times Grid / List
          _buildPrayerTile(
            context: context,
            l10n: l10n,
            prayer: PrayerName.fajr,
            time: prayerTimes.fajr,
            isNext: nextPrayerInfo.nextPrayer == PrayerName.fajr,
            icon: Icons.brightness_3_outlined,
          ),
          _buildPrayerTile(
            context: context,
            l10n: l10n,
            prayer: PrayerName.sunrise,
            time: prayerTimes.sunrise,
            isNext: nextPrayerInfo.nextPrayer == PrayerName.sunrise,
            icon: Icons.wb_sunny_outlined,
          ),
          _buildPrayerTile(
            context: context,
            l10n: l10n,
            prayer: PrayerName.dhuhr,
            time: prayerTimes.dhuhr,
            isNext: nextPrayerInfo.nextPrayer == PrayerName.dhuhr,
            icon: Icons.wb_sunny,
          ),
          _buildPrayerTile(
            context: context,
            l10n: l10n,
            prayer: PrayerName.asr,
            time: prayerTimes.asr,
            isNext: nextPrayerInfo.nextPrayer == PrayerName.asr,
            icon: Icons.cloud_queue,
          ),
          _buildPrayerTile(
            context: context,
            l10n: l10n,
            prayer: PrayerName.maghrib,
            time: prayerTimes.maghrib,
            isNext: nextPrayerInfo.nextPrayer == PrayerName.maghrib,
            icon: Icons.nights_stay_outlined,
          ),
          _buildPrayerTile(
            context: context,
            l10n: l10n,
            prayer: PrayerName.isha,
            time: prayerTimes.isha,
            isNext: nextPrayerInfo.nextPrayer == PrayerName.isha,
            icon: Icons.nightlight_round,
          ),
          const SizedBox(height: 16),

          // 5. Devotional Milestones Card (Imsak, Midnight, Tahajjud)
          SacredCard(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'DEVOTIONAL MILESTONES',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                      color: AppTheme.goldLight,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildMilestoneRow(l10n.devotionalImsak, _formatTime(prayerTimes.imsak)),
                  const Divider(height: 16),
                  _buildMilestoneRow(l10n.devotionalMidnight, _formatTime(prayerTimes.midnight)),
                  const Divider(height: 16),
                  _buildMilestoneRow(l10n.devotionalLastThird, _formatTime(prayerTimes.lastThirdOfNight)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 6. Calculation Settings Action Button
          OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 12),
              side: const BorderSide(color: AppTheme.emeraldPrimary),
            ),
            icon: const Icon(Icons.tune, color: AppTheme.emeraldPrimary, size: 18),
            label: Text(
              '${l10n.calculationSettings} (${method.name.toUpperCase()} • ${madhab.name.toUpperCase()})',
              style: const TextStyle(color: AppTheme.emeraldPrimary, fontSize: 12, fontWeight: FontWeight.bold),
            ),
            onPressed: () {
              _showCalculationSettingsModal(context, ref, l10n);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPrayerTile({
    required BuildContext context,
    required AppLocalizations l10n,
    required PrayerName prayer,
    required DateTime time,
    required bool isNext,
    required IconData icon,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8.0),
      decoration: BoxDecoration(
        color: isNext
            ? AppTheme.emeraldPrimary.withValues(alpha: 0.15)
            : Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isNext ? AppTheme.emeraldPrimary : Colors.grey.withValues(alpha: 0.2),
          width: isNext ? 2.0 : 1.0,
        ),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isNext ? AppTheme.emeraldPrimary : AppTheme.goldLight,
        ),
        title: Text(
          _getPrayerLocalizedName(l10n, prayer),
          style: TextStyle(
            fontWeight: isNext ? FontWeight.bold : FontWeight.w500,
            fontSize: 15,
          ),
        ),
        trailing: Text(
          _formatTime(time),
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            fontFamily: 'monospace',
            color: isNext ? AppTheme.emeraldPrimary : null,
          ),
        ),
      ),
    );
  }

  Widget _buildMilestoneRow(String title, String time) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontSize: 13)),
        Text(time, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, fontFamily: 'monospace')),
      ],
    );
  }

  String _getPrayerLocalizedName(AppLocalizations l10n, PrayerName prayer) {
    switch (prayer) {
      case PrayerName.fajr:
        return l10n.prayerFajr;
      case PrayerName.sunrise:
        return l10n.prayerSunrise;
      case PrayerName.dhuhr:
        return l10n.prayerDhuhr;
      case PrayerName.asr:
        return l10n.prayerAsr;
      case PrayerName.maghrib:
        return l10n.prayerMaghrib;
      case PrayerName.isha:
        return l10n.prayerIsha;
    }
  }

  String _formatTime(DateTime dt) {
    final period = dt.hour >= 12 ? 'PM' : 'AM';
    final h = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
    return '$h:${dt.minute.toString().padLeft(2, '0')} $period';
  }

  String _formatDuration(Duration d) {
    final hours = d.inHours;
    final mins = d.inMinutes % 60;
    final secs = d.inSeconds % 60;
    return '${hours.toString().padLeft(2, '0')}:${mins.toString().padLeft(2, '0')}:${secs.toString().padLeft(2, '0')}';
  }

  void _showCalculationSettingsModal(
    BuildContext context,
    WidgetRef ref,
    AppLocalizations l10n,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Consumer(
          builder: (modalCtx, modalRef, child) {
            final activeMethod = modalRef.watch(calculationMethodProvider);
            final activeMadhab = modalRef.watch(asrMadhabProvider);

            return Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.calculationSettings,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  const Text('Calculation Method', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  DropdownButton<CalculationMethod>(
                    value: activeMethod,
                    isExpanded: true,
                    items: CalculationMethod.values.map((m) {
                      return DropdownMenuItem(value: m, child: Text(m.displayName, style: const TextStyle(fontSize: 13)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        modalRef.read(calculationMethodProvider.notifier).setMethod(val);
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  const Text('Asr Madhab', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  DropdownButton<AsrMadhab>(
                    value: activeMadhab,
                    isExpanded: true,
                    items: AsrMadhab.values.map((m) {
                      return DropdownMenuItem(value: m, child: Text(m.displayName, style: const TextStyle(fontSize: 13)));
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        modalRef.read(asrMadhabProvider.notifier).setMadhab(val);
                      }
                    },
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.emeraldPrimary,
                      minimumSize: const Size.fromHeight(44),
                    ),
                    onPressed: () => Navigator.pop(modalCtx),
                    child: Text(l10n.save, style: const TextStyle(color: Colors.white)),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }
}
