import 'package:flutter/material.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

class DuasScreen extends StatelessWidget {
  const DuasScreen({super.key});

  static const List<Map<String, String>> _categories = [
    {'id': 'morning-evening', 'titleEn': 'Morning & Evening Adhkar', 'titleAr': 'أذكار الصباح والمساء'},
    {'id': 'sleep', 'titleEn': 'Before Sleeping & Waking Up', 'titleAr': 'أذكار النوم والاستيقاظ'},
    {'id': 'prayer', 'titleEn': 'Duas Related to Prayer (Salah)', 'titleAr': 'أدعية الصلاة'},
    {'id': 'protection', 'titleEn': 'Duas for Protection & Ruqyah', 'titleAr': 'أدعية الحفظ والرقية'},
    {'id': 'travel', 'titleEn': 'Duas for Travel & Journeys', 'titleAr': 'أدعية السفر'},
    {'id': 'distress', 'titleEn': 'Duas in Distress & Hardship', 'titleAr': 'أدعية الكرب والهم'},
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navDuas,
        subtitle: 'حصن المسلم من أذكار الكتاب والسنة',
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final cat = _categories[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: SacredCard(
              child: Row(
                children: [
                  const Icon(Icons.favorite, color: AppTheme.goldAccent, size: 24),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      cat['titleEn']!,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                  Text(
                    cat['titleAr']!,
                    style: const TextStyle(
                      fontFamily: 'Amiri',
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.goldAccent,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
