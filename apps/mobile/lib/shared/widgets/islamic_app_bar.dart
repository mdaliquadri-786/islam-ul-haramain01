import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// Standardized AppBar adhering to the platform's Sacred Islamic aesthetic.
class IslamicAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final String? subtitle;
  final List<Widget>? actions;
  final Widget? leading;
  final bool showGoldDivider;

  const IslamicAppBar({
    super.key,
    required this.title,
    this.subtitle,
    this.actions,
    this.leading,
    this.showGoldDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppTheme.darkSurface : AppTheme.emeraldPrimary;

    return AppBar(
      title: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          if (subtitle != null)
            Text(
              subtitle!,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w400,
                color: isDark ? AppTheme.goldLight : Colors.white70,
              ),
            ),
        ],
      ),
      centerTitle: true,
      backgroundColor: bgColor,
      foregroundColor: Colors.white,
      actions: actions,
      leading: leading,
      bottom: showGoldDivider
          ? PreferredSize(
              preferredSize: const Size.fromHeight(1.5),
              child: Container(
                height: 1.5,
                color: AppTheme.goldAccent.withAlpha(isDark ? 100 : 180),
              ),
            )
          : null,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 1.5);
}
