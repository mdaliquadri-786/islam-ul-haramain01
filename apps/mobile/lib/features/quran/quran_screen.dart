import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../core/database/database_providers.dart';
import '../../core/sync/sync_services.dart';
import '../../core/sync/sync_ui_state.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';

class QuranScreen extends ConsumerWidget {
  const QuranScreen({super.key});

  static const List<Map<String, dynamic>> _surahList = [
    {'number': 1, 'nameArabic': 'الفاتحة', 'nameEnglish': 'Al-Fatihah', 'ayahs': 7},
    {'number': 2, 'nameArabic': 'البقرة', 'nameEnglish': 'Al-Baqarah', 'ayahs': 286},
    {'number': 3, 'nameArabic': 'آل عمران', 'nameEnglish': 'Ali \'Imran', 'ayahs': 200},
    {'number': 4, 'nameArabic': 'النساء', 'nameEnglish': 'An-Nisa', 'ayahs': 176},
    {'number': 36, 'nameArabic': 'يس', 'nameEnglish': 'Ya-Sin', 'ayahs': 83},
    {'number': 67, 'nameArabic': 'الملك', 'nameEnglish': 'Al-Mulk', 'ayahs': 30},
    {'number': 112, 'nameArabic': 'الإخلاص', 'nameEnglish': 'Al-Ikhlas', 'ayahs': 4},
    {'number': 113, 'nameArabic': 'الفلق', 'nameEnglish': 'Al-Falaq', 'ayahs': 5},
    {'number': 114, 'nameArabic': 'الناس', 'nameEnglish': 'An-Nas', 'ayahs': 6},
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final bookmarksDao = ref.watch(bookmarksDaoProvider);
    final syncBookmarkService = ref.watch(syncBookmarkServiceProvider);
    final userId = ref.watch(activeUserIdProvider);

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navQuran,
        subtitle: '114 سورة • الرسم العثماني',
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: _surahList.length,
        itemBuilder: (context, index) {
          final surah = _surahList[index];
          final surahNumber = surah['number'] as int;
          final refString = 'quran:$surahNumber:1';

          return Padding(
            padding: const EdgeInsets.only(bottom: 10.0),
            child: SacredCard(
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.goldAccent, width: 1.5),
                    ),
                    child: Text(
                      '$surahNumber',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          surah['nameEnglish'] as String,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        Text(
                          '${surah['ayahs']} Ayahs',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    surah['nameArabic'] as String,
                    style: const TextStyle(
                      fontFamily: 'Amiri',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.goldAccent,
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Reactive bookmark status from Drift SQLite
                  FutureBuilder<bool>(
                    future: syncBookmarkService.isBookmarked('quran', refString),
                    builder: (context, snapshot) {
                      final isSaved = snapshot.data ?? false;
                      return IconButton(
                        icon: Icon(
                          isSaved ? Icons.bookmark : Icons.bookmark_border,
                          color: isSaved ? AppTheme.goldAccent : Colors.grey,
                        ),
                        onPressed: () async {
                          if (isSaved) {
                            final b = await bookmarksDao.getBookmarkByReference(
                                userId, 'quran', refString);
                            if (b != null) {
                              await syncBookmarkService.deleteBookmark(b.id);
                            }
                          } else {
                            await syncBookmarkService.saveBookmark(
                              id: 'bm-quran-$surahNumber-1',
                              contentType: 'quran',
                              contentReference: refString,
                              surahNumber: surahNumber,
                              ayahNumber: 1,
                              folderName: 'Quran',
                            );
                          }
                          (context as Element).markNeedsBuild();
                        },
                      );
                    },
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
