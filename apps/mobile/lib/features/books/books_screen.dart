import 'package:flutter/material.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

class BooksScreen extends StatelessWidget {
  const BooksScreen({super.key});

  static const List<Map<String, String>> _classicalBooks = [
    {
      'id': 'riyad-al-salihin',
      'titleEn': 'Riyad al-Salihin (Gardens of the Righteous)',
      'titleAr': 'رياض الصالحين',
      'author': 'Imam Yahya ibn Sharaf al-Nawawi (d. 676 AH)',
    },
    {
      'id': 'al-arba-in-al-nawawiyyah',
      'titleEn': 'Al-Arba`in al-Nawawiyyah (The Forty Hadith)',
      'titleAr': 'الأربعون النووية',
      'author': 'Imam Yahya ibn Sharaf al-Nawawi (d. 676 AH)',
    },
    {
      'id': 'al-aqeedah-al-wasitiyyah',
      'titleEn': 'Al-Aqeedah al-Wasitiyyah (The Wasiti Creed)',
      'titleAr': 'العقيدة الواسطية',
      'author': 'Shaykh al-Islam Ibn Taymiyyah (d. 728 AH)',
    },
    {
      'id': 'bidayat-al-mujtahid',
      'titleEn': 'Bidayat al-Mujtahid wa Nihayat al-Muqtasid',
      'titleAr': 'بداية المجتهد ونهاية المقتصد',
      'author': 'Ibn Rushd al-Hafid (Averroes) (d. 595 AH)',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navBooks,
        subtitle: 'المكتبة الإسلامية الكلاسيكية',
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: _classicalBooks.length,
        itemBuilder: (context, index) {
          final book = _classicalBooks[index];
          return Padding(
            padding: const EdgeInsets.only(bottom: 12.0),
            child: SacredCard(
              child: Row(
                children: [
                  const Icon(Icons.auto_stories, color: AppTheme.goldAccent, size: 28),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          book['titleEn']!,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          book['author']!,
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    book['titleAr']!,
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
