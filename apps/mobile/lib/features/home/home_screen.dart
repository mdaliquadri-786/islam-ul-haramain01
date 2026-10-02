import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';
import '../../shared/widgets/mini_audio_player.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final navItems = [
      _NavTile(
        title: l10n.navQuran,
        route: '/quran',
        icon: Icons.menu_book,
        subtitle: '114 Surahs • Uthmani',
      ),
      _NavTile(
        title: l10n.navHadith,
        route: '/hadith',
        icon: Icons.library_books,
        subtitle: 'Kutub al-Sittah',
      ),
      _NavTile(
        title: l10n.navDuas,
        route: '/duas',
        icon: Icons.favorite,
        subtitle: 'Hisn al-Muslim',
      ),
      _NavTile(
        title: l10n.navPrayer,
        route: '/prayer',
        icon: Icons.access_time,
        subtitle: '7 Calculation Methods',
      ),
      _NavTile(
        title: l10n.navQibla,
        route: '/qibla',
        icon: Icons.explore,
        subtitle: 'Makkah Direction',
      ),
      _NavTile(
        title: l10n.navTasbeeh,
        route: '/tasbeeh',
        icon: Icons.fingerprint,
        subtitle: 'Hisn al-Muslim Dhikr',
      ),
      _NavTile(
        title: l10n.navAudio,
        route: '/audio',
        icon: Icons.graphic_eq,
        subtitle: '6 Verified Reciters',
      ),
      _NavTile(
        title: l10n.navTafsir,
        route: '/tafsir',
        icon: Icons.chrome_reader_mode,
        subtitle: 'Ibn Kathir & Al-Sa`di',
      ),
      _NavTile(
        title: l10n.navBooks,
        route: '/books',
        icon: Icons.auto_stories,
        subtitle: 'Classical Sunni Works',
      ),
      _NavTile(
        title: l10n.navLibrary,
        route: '/library',
        icon: Icons.bookmark,
        subtitle: 'Encrypted SQLite Storage',
      ),
      _NavTile(
        title: l10n.navSettings,
        route: '/settings',
        icon: Icons.settings,
        subtitle: 'Preferences & Themes',
      ),
    ];

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.appTitle,
        subtitle: 'إسلام الحرمين',
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => context.push('/search'),
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: SacredCard(
                backgroundColor: isDark
                    ? AppTheme.emeraldDark.withAlpha(80)
                    : AppTheme.emeraldPrimary.withAlpha(20),
                borderColor: AppTheme.goldAccent.withAlpha(100),
                child: Column(
                  children: [
                    const Text(
                      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Amiri',
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.goldAccent,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.databaseEncrypted,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark
                            ? AppTheme.textDarkSecondary
                            : AppTheme.textLightSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.45,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final item = navItems[index];
                  return SacredCard(
                    onTap: () => context.push(item.route),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(item.icon, color: AppTheme.goldAccent, size: 28),
                        const SizedBox(height: 8),
                        Text(
                          item.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item.subtitle,
                          style: TextStyle(
                            fontSize: 10,
                            color: isDark
                                ? AppTheme.textDarkSecondary
                                : AppTheme.textLightSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  );
                },
                childCount: navItems.length,
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ],
      ),
      bottomNavigationBar: const MiniAudioPlayer(),
    );
  }
}

class _NavTile {
  final String title;
  final String route;
  final IconData icon;
  final String subtitle;

  const _NavTile({
    required this.title,
    required this.route,
    required this.icon,
    required this.subtitle,
  });
}
