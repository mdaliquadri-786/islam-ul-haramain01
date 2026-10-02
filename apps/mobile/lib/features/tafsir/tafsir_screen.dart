import 'package:flutter/material.dart';
import '../../core/localization/app_localizations.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

class TafsirScreen extends StatelessWidget {
  const TafsirScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navTafsir,
        subtitle: 'تفسير القرآن العظيم • تيسير الكريم الرحمن',
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: const [
          SacredCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tafsir Ibn Kathir (تفسير ابن كثير)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                SizedBox(height: 4),
                Text(
                  'Imam `Imad al-Din Isma`il ibn Kathir (d. 774 AH)',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                SizedBox(height: 8),
                Text(
                  'Classic Tafsir bi\'l-Ma\'thur (interpretation of Quran by Quran, Sunnah, and statements of the Sahabah).',
                  style: TextStyle(fontSize: 13),
                ),
              ],
            ),
          ),
          SizedBox(height: 12),
          SacredCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tafsir Al-Sa`di (تفسير السعدي)',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                SizedBox(height: 4),
                Text(
                  'Shaykh `Abd al-Rahman ibn Nasir al-Sa`di (d. 1376 AH)',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
                SizedBox(height: 8),
                Text(
                  'Clear, accessible, and spiritually uplifting commentary adhering to the methodology of the Salaf.',
                  style: TextStyle(fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
