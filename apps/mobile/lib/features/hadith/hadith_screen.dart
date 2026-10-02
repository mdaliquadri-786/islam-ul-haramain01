import 'package:flutter/material.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

class HadithScreen extends StatelessWidget {
  const HadithScreen({super.key});

  static const List<Map<String, String>> _collections = [
    {'id': 'bukhari', 'nameArabic': 'صحيح البخاري', 'nameEnglish': 'Sahih al-Bukhari', 'author': 'Imam Muhammad al-Bukhari'},
    {'id': 'muslim', 'nameArabic': 'صحيح مسلم', 'nameEnglish': 'Sahih Muslim', 'author': 'Imam Muslim ibn al-Hajjaj'},
    {'id': 'abu_dawud', 'nameArabic': 'سنن أبي داود', 'nameEnglish': 'Sunan Abi Dawud', 'author': 'Imam Abu Dawud al-Sijistani'},
    {'id': 'tirmidhi', 'nameArabic': 'جامع الترمذي', 'nameEnglish': 'Jami` at-Tirmidhi', 'author': 'Imam Abu `Isa at-Tirmidhi'},
    {'id': 'nasai', 'nameArabic': 'سنن النسائي', 'nameEnglish': 'Sunan an-Nasa\'i', 'author': 'Imam Ahmad an-Nasa\'i'},
    {'id': 'ibn_majah', 'nameArabic': 'سنن ابن ماجه', 'nameEnglish': 'Sunan Ibn Majah', 'author': 'Imam Ibn Majah al-Qazwini'},
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navHadith,
        subtitle: 'كتب السنة الستة المطهرة',
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: _collections.length,
        itemBuilder: (context, index) {
          final c = _collections[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: SacredCard(
              child: Row(
                children: [
                  const Icon(Icons.menu_book, color: AppTheme.goldAccent, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          c['nameEnglish']!,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          c['author']!,
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    c['nameArabic']!,
                    style: const TextStyle(
                      fontFamily: 'Amiri',
                      fontSize: 16,
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
