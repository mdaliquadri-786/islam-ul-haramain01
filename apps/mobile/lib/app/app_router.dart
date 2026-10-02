import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/home/home_screen.dart';
import '../features/quran/quran_screen.dart';
import '../features/hadith/hadith_screen.dart';
import '../features/duas/duas_screen.dart';
import '../features/prayer/prayer_screen.dart';
import '../features/qibla/qibla_screen.dart';
import '../features/audio/audio_screen.dart';
import '../features/tafsir/tafsir_screen.dart';
import '../features/books/books_screen.dart';
import '../features/library/library_screen.dart';
import '../features/settings/settings_screen.dart';
import '../features/search/search_screen.dart';
import '../features/admin/admin_screen.dart';
import '../features/tasbeeh/tasbeeh_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: false,
    routes: [
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/quran',
        name: 'quran',
        builder: (context, state) => const QuranScreen(),
      ),
      GoRoute(
        path: '/hadith',
        name: 'hadith',
        builder: (context, state) => const HadithScreen(),
      ),
      GoRoute(
        path: '/duas',
        name: 'duas',
        builder: (context, state) => const DuasScreen(),
      ),
      GoRoute(
        path: '/prayer',
        name: 'prayer',
        builder: (context, state) => const PrayerScreen(),
      ),
      GoRoute(
        path: '/qibla',
        name: 'qibla',
        builder: (context, state) => const QiblaScreen(),
      ),
      GoRoute(
        path: '/audio',
        name: 'audio',
        builder: (context, state) => const AudioScreen(),
      ),
      GoRoute(
        path: '/tafsir',
        name: 'tafsir',
        builder: (context, state) => const TafsirScreen(),
      ),
      GoRoute(
        path: '/books',
        name: 'books',
        builder: (context, state) => const BooksScreen(),
      ),
      GoRoute(
        path: '/library',
        name: 'library',
        builder: (context, state) => const LibraryScreen(),
      ),
      GoRoute(
        path: '/settings',
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/search',
        name: 'search',
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/admin',
        name: 'admin',
        builder: (context, state) => const AdminScreen(),
      ),
      GoRoute(
        path: '/tasbeeh',
        name: 'tasbeeh',
        builder: (context, state) => const TasbeehScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Route not found: ${state.uri.toString()}'),
      ),
    ),
  );
});
