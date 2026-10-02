import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

/// Reusable card component adhering to the platform's Sacred Islamic aesthetic.
class SacredCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? borderColor;
  final Color? backgroundColor;

  const SacredCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0),
    this.onTap,
    this.borderColor,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final defaultBg = isDark ? AppTheme.darkSurface : AppTheme.lightSurface;
    final defaultBorder = isDark
        ? AppTheme.goldDark.withAlpha(40)
        : AppTheme.emeraldPrimary.withAlpha(30);

    final bg = backgroundColor ?? defaultBg;
    final border = borderColor ?? defaultBorder;

    return Material(
      color: bg,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: border, width: 1),
      ),
      elevation: isDark ? 2 : 1,
      shadowColor: Colors.black.withAlpha(isDark ? 50 : 15),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}
