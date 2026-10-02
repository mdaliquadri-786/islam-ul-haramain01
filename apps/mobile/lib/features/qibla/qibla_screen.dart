import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../core/compass/compass_provider.dart';
import '../../core/prayer/prayer_provider.dart';
import '../../core/prayer/prayer_models.dart';
import '../../core/prayer/astronomy_calculator.dart';
import '../../core/prayer/qibla_calculator.dart';
import '../../core/prayer/city_presets.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

class QiblaScreen extends ConsumerStatefulWidget {
  const QiblaScreen({super.key});

  @override
  ConsumerState<QiblaScreen> createState() => _QiblaScreenState();
}

class _QiblaScreenState extends ConsumerState<QiblaScreen> {
  bool _wasAligned = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final compassState = ref.watch(compassProvider);
    final qiblaResult = ref.watch(qiblaResultProvider);
    final selectedCity = ref.watch(selectedLocationProvider);

    final isAligned = QiblaCalculator.isAligned(
      qiblaResult.directionDegrees,
      compassState.heading,
      3.0,
    );

    // Haptic feedback trigger strictly on state transition (false -> true)
    if (isAligned && !_wasAligned) {
      HapticFeedback.mediumImpact();
      _wasAligned = true;
    } else if (!isAligned && _wasAligned) {
      _wasAligned = false;
    }

    final relativeAngle = QiblaCalculator.calculateRelativeAngle(
      qiblaResult.directionDegrees,
      compassState.heading,
    );

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navQibla,
        subtitle: 'اتجاه القبلة المشرفة إلى الكعبة',
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // 1. Location Selector Bar
          SacredCard(
            child: ListTile(
              leading: const Icon(Icons.location_on_outlined, color: AppTheme.emeraldPrimary),
              title: Text(
                l10n.isRtl ? selectedCity.nameArabic : selectedCity.name,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                'Lat: ${selectedCity.coordinates.latitude.toStringAsFixed(4)}°, Lng: ${selectedCity.coordinates.longitude.toStringAsFixed(4)}°',
                style: const TextStyle(fontSize: 11, fontFamily: 'monospace'),
              ),
              trailing: PopupMenuButton<PresetCity>(
                icon: const Icon(Icons.arrow_drop_down_circle_outlined, color: AppTheme.emeraldPrimary),
                tooltip: l10n.selectCity,
                onSelected: (city) {
                  ref.read(selectedLocationProvider.notifier).selectCity(city);
                },
                itemBuilder: (ctx) {
                  return kGlobalPresetCities.map((city) {
                    return PopupMenuItem<PresetCity>(
                      value: city,
                      child: Text(l10n.isRtl ? city.nameArabic : city.name),
                    );
                  }).toList();
                },
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 2. Alignment Status Banner
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isAligned
                  ? AppTheme.emeraldPrimary.withValues(alpha: 0.18)
                  : Colors.grey.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isAligned ? AppTheme.emeraldPrimary : Colors.grey.withValues(alpha: 0.3),
                width: isAligned ? 2.0 : 1.0,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  isAligned ? Icons.verified : Icons.explore_outlined,
                  color: isAligned ? AppTheme.emeraldPrimary : Colors.grey,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  isAligned
                      ? l10n.qiblaAligned
                      : '${relativeAngle > 0 ? "Turn Right" : "Turn Left"} ${relativeAngle.abs().toStringAsFixed(1)}°',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: isAligned ? AppTheme.emeraldPrimary : null,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 3. Interactive Sacred 360° Compass Dial
          Center(
            child: SizedBox(
              width: 280,
              height: 280,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  CustomPaint(
                    size: const Size(280, 280),
                    painter: SacredCompassPainter(
                      heading: compassState.heading,
                      qiblaBearing: qiblaResult.directionDegrees,
                      isAligned: isAligned,
                      isDarkMode: Theme.of(context).brightness == Brightness.dark,
                    ),
                  ),
                  // Central Kaaba alignment status icon
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isAligned ? AppTheme.emeraldPrimary : AppTheme.darkSurface,
                      border: Border.all(
                        color: isAligned ? AppTheme.goldLight : AppTheme.emeraldPrimary,
                        width: 2.0,
                      ),
                      boxShadow: [
                        if (isAligned)
                          BoxShadow(
                            color: AppTheme.emeraldPrimary.withValues(alpha: 0.5),
                            blurRadius: 16,
                            spreadRadius: 2,
                          ),
                      ],
                    ),
                    child: Center(
                      child: Icon(
                        Icons.mosque,
                        size: 26,
                        color: isAligned ? Colors.white : AppTheme.goldLight,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // 4. Qibla Details Card
          SacredCard(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMetric(
                    label: l10n.qiblaBearing,
                    value: '${qiblaResult.directionDegrees}° ${qiblaResult.cardinalDirection}',
                    icon: Icons.navigation_outlined,
                  ),
                  const VerticalDivider(width: 20),
                  _buildMetric(
                    label: l10n.distanceToKaaba,
                    value: '${qiblaResult.distanceKm.toStringAsFixed(1)} km',
                    icon: Icons.straighten,
                  ),
                  const VerticalDivider(width: 20),
                  _buildMetric(
                    label: l10n.qiblaHeading,
                    value: '${compassState.heading.toStringAsFixed(1)}°',
                    icon: Icons.compass_calibration_outlined,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 5. Manual Calibration Mode & Heading Slider (Offline/Sensor-less Fallback)
          SacredCard(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        l10n.manualHeadingMode,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      Switch(
                        value: compassState.isManual,
                        activeThumbColor: AppTheme.emeraldPrimary,
                        onChanged: (val) {
                          ref.read(compassProvider.notifier).toggleManualMode(val);
                        },
                      ),
                    ],
                  ),
                  if (compassState.isManual) ...[
                    const SizedBox(height: 6),
                    Slider(
                      value: compassState.heading,
                      min: 0.0,
                      max: 360.0,
                      divisions: 360,
                      activeColor: AppTheme.emeraldPrimary,
                      onChanged: (deg) {
                        ref.read(compassProvider.notifier).setManualHeading(deg);
                      },
                    ),
                    Center(
                      child: Text(
                        'Heading: ${compassState.heading.toInt()}°',
                        style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetric({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppTheme.emeraldPrimary),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }
}

/// Custom painter for the Sacred 360° Compass Dial and Kaaba needle.
class SacredCompassPainter extends CustomPainter {
  final double heading;
  final double qiblaBearing;
  final bool isAligned;
  final bool isDarkMode;

  const SacredCompassPainter({
    required this.heading,
    required this.qiblaBearing,
    required this.isAligned,
    required this.isDarkMode,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    final dialPaint = Paint()
      ..color = isDarkMode ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius - 4, dialPaint);

    final borderPaint = Paint()
      ..color = isAligned ? AppTheme.emeraldPrimary : (isDarkMode ? const Color(0xFF334155) : const Color(0xFFCBD5E1))
      ..style = PaintingStyle.stroke
      ..strokeWidth = isAligned ? 3.0 : 1.5;
    canvas.drawCircle(center, radius - 4, borderPaint);

    // Rotate dial by negative heading
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(-toRad(heading));

    final tickPaint = Paint()
      ..color = isDarkMode ? Colors.white60 : Colors.black45
      ..strokeWidth = 1.0;

    final majorTickPaint = Paint()
      ..color = isDarkMode ? Colors.white : Colors.black87
      ..strokeWidth = 2.0;

    // Draw degree ticks (every 5° minor, every 30° major)
    for (int deg = 0; deg < 360; deg += 5) {
      final isMajor = deg % 30 == 0;
      final tickLength = isMajor ? 12.0 : 6.0;
      final rad = toRad(deg.toDouble());
      final outerX = (radius - 8) * math.sin(rad);
      final outerY = -(radius - 8) * math.cos(rad);
      final innerX = (radius - 8 - tickLength) * math.sin(rad);
      final innerY = -(radius - 8 - tickLength) * math.cos(rad);

      canvas.drawLine(
        Offset(innerX, innerY),
        Offset(outerX, outerY),
        isMajor ? majorTickPaint : tickPaint,
      );
    }

    // Cardinal Text: N, E, S, W
    const cardinals = {'N': 0.0, 'E': 90.0, 'S': 180.0, 'W': 270.0};
    for (final entry in cardinals.entries) {
      final rad = toRad(entry.value);
      final x = (radius - 32) * math.sin(rad);
      final y = -(radius - 32) * math.cos(rad);

      final textPainter = TextPainter(
        text: TextSpan(
          text: entry.key,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: entry.key == 'N' ? Colors.redAccent : AppTheme.goldLight,
          ),
        ),
        textDirection: TextDirection.ltr,
      )..layout();

      textPainter.paint(
        canvas,
        Offset(x - textPainter.width / 2, y - textPainter.height / 2),
      );
    }

    canvas.restore();

    // Draw Qibla Arrow pointing to (qiblaBearing - heading)
    final relativeQiblaRad = toRad(qiblaBearing - heading);
    final qiblaX = center.dx + (radius - 28) * math.sin(relativeQiblaRad);
    final qiblaY = center.dy - (radius - 28) * math.cos(relativeQiblaRad);

    final needlePaint = Paint()
      ..color = isAligned ? AppTheme.emeraldPrimary : AppTheme.goldLight
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(center, Offset(qiblaX, qiblaY), needlePaint);

    final kaabaIconPaint = Paint()
      ..color = isAligned ? AppTheme.emeraldPrimary : AppTheme.goldAccent
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(qiblaX, qiblaY), 8, kaabaIconPaint);
  }

  @override
  bool shouldRepaint(covariant SacredCompassPainter oldDelegate) {
    return oldDelegate.heading != heading ||
        oldDelegate.qiblaBearing != qiblaBearing ||
        oldDelegate.isAligned != isAligned ||
        oldDelegate.isDarkMode != isDarkMode;
  }
}
