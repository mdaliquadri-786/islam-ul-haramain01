import 'package:flutter/widgets.dart';

/// Wraps children with correct text directionality based on locale.
class DirectionalityWrapper extends StatelessWidget {
  final Locale locale;
  final Widget child;

  const DirectionalityWrapper({
    super.key,
    required this.locale,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final isRtl = locale.languageCode == 'ar' || locale.languageCode == 'ur';
    return Directionality(
      textDirection: isRtl ? TextDirection.rtl : TextDirection.ltr,
      child: child,
    );
  }
}
