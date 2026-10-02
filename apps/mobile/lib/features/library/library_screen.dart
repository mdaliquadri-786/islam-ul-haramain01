import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/theme/app_theme.dart';
import '../../core/database/database_providers.dart';
import '../../core/database/app_database.dart';
import '../../core/sync/sync_coordinator.dart';
import '../../core/sync/sync_services.dart';
import '../../core/sync/sync_ui_state.dart';
import '../../shared/widgets/sacred_card.dart';
import '../../shared/widgets/islamic_app_bar.dart';
import '../../shared/widgets/sync_status_badge.dart';

class LibraryScreen extends ConsumerStatefulWidget {
  const LibraryScreen({super.key});

  @override
  ConsumerState<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends ConsumerState<LibraryScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: IslamicAppBar(
        title: l10n.navLibrary,
        subtitle: l10n.databaseEncrypted,
        actions: const [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 8.0),
            child: SyncStatusBadge(compact: true),
          ),
        ],
      ),
      body: Column(
        children: [
          TabBar(
            controller: _tabController,
            labelColor: isDark ? AppTheme.goldAccent : AppTheme.emeraldPrimary,
            unselectedLabelColor: isDark
                ? AppTheme.textDarkSecondary
                : AppTheme.textLightSecondary,
            indicatorColor: AppTheme.goldAccent,
            tabs: [
              Tab(text: l10n.bookmarksTab),
              Tab(text: l10n.readingProgressTab),
              const Tab(text: 'Sync Queue'),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildBookmarksTab(l10n, isDark),
                _buildReadingProgressTab(l10n, isDark),
                _buildSyncQueueTab(isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBookmarksTab(AppLocalizations l10n, bool isDark) {
    final bookmarksDao = ref.watch(bookmarksDaoProvider);
    final userId = ref.watch(activeUserIdProvider);
    final stream = _selectedFilter == 'all'
        ? bookmarksDao.watchActiveBookmarks(userId)
        : bookmarksDao.watchBookmarksByType(userId, _selectedFilter);

    return Column(
      children: [
        // Filter Pills
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            children: [
              _buildFilterChip('all', l10n.filterAll),
              const SizedBox(width: 8),
              _buildFilterChip('quran', l10n.typeQuran),
              const SizedBox(width: 8),
              _buildFilterChip('hadith', l10n.typeHadith),
              const SizedBox(width: 8),
              _buildFilterChip('dua', l10n.typeDua),
              const SizedBox(width: 8),
              _buildFilterChip('article', l10n.typeArticle),
              const SizedBox(width: 8),
              _buildFilterChip('book', l10n.typeBook),
            ],
          ),
        ),
        Expanded(
          child: StreamBuilder<List<LocalBookmark>>(
            stream: stream,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting &&
                  !snapshot.hasData) {
                return const Center(child: CircularProgressIndicator());
              }

              final bookmarks = snapshot.data ?? [];
              if (bookmarks.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.bookmark_border,
                        size: 48,
                        color: isDark
                            ? AppTheme.textDarkSecondary
                            : AppTheme.textLightSecondary,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        l10n.noBookmarksFound,
                        style: TextStyle(
                          color: isDark
                              ? AppTheme.textDarkSecondary
                              : AppTheme.textLightSecondary,
                        ),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16.0),
                itemCount: bookmarks.length,
                itemBuilder: (context, index) {
                  final item = bookmarks[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10.0),
                    child: SacredCard(
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.goldAccent.withAlpha(30),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(
                              _getContentIcon(item.contentType),
                              color: AppTheme.goldAccent,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.contentReference,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${item.contentType.toUpperCase()} • ${item.folderName}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isDark
                                        ? AppTheme.textDarkSecondary
                                        : AppTheme.textLightSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, size: 20),
                            onPressed: () async {
                              await ref.read(syncBookmarkServiceProvider).deleteBookmark(item.id);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(l10n.bookmarkRemoved),
                                    duration: const Duration(seconds: 2),
                                  ),
                                );
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String type, String label) {
    final isSelected = _selectedFilter == type;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedFilter = type;
          });
        }
      },
      selectedColor: AppTheme.emeraldPrimary,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : null,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }

  Widget _buildReadingProgressTab(AppLocalizations l10n, bool isDark) {
    final readingDao = ref.watch(readingProgressDaoProvider);
    final userId = ref.watch(activeUserIdProvider);
    final stream = readingDao.watchAllProgress(userId);

    return StreamBuilder<List<LocalReadingProgress>>(
      stream: stream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting &&
            !snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }

        final list = snapshot.data ?? [];
        if (list.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.auto_stories,
                  size: 48,
                  color: isDark
                      ? AppTheme.textDarkSecondary
                      : AppTheme.textLightSecondary,
                ),
                const SizedBox(height: 12),
                Text(
                  l10n.noProgressFound,
                  style: TextStyle(
                    color: isDark
                        ? AppTheme.textDarkSecondary
                        : AppTheme.textLightSecondary,
                  ),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: list.length,
          itemBuilder: (context, index) {
            final progress = list[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12.0),
              child: SacredCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          progress.bookId,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        Text(
                          '${progress.progressPercentage.toStringAsFixed(1)}%',
                          style: const TextStyle(
                            color: AppTheme.goldAccent,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Volume ${progress.volumeNumber}${progress.pageNumber != null ? ' • Page ${progress.pageNumber}' : ''}',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark
                            ? AppTheme.textDarkSecondary
                            : AppTheme.textLightSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: (progress.progressPercentage / 100.0).clamp(0.0, 1.0),
                      backgroundColor: Colors.grey.withAlpha(40),
                      color: AppTheme.emeraldPrimary,
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSyncQueueTab(bool isDark) {
    final syncQueueDao = ref.watch(syncQueueDaoProvider);
    final uiState = ref.watch(syncUIStateProvider);
    final stream = syncQueueDao.watchQueue();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16.0, 16.0, 16.0, 8.0),
          child: SacredCard(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Outbox Status',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      SizedBox(height: 2),
                      SyncStatusBadge(),
                    ],
                  ),
                  if (uiState.isAuthenticated && !uiState.isGuest)
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.emeraldPrimary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: uiState.isSyncing
                          ? null
                          : () => ref.read(syncCoordinatorProvider).syncNow(),
                      icon: uiState.isSyncing
                          ? const SizedBox(
                              width: 12,
                              height: 12,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.sync, size: 16),
                      label: Text(uiState.isSyncing ? 'Syncing...' : 'Sync Now'),
                    ),
                ],
              ),
            ),
          ),
        ),
        Expanded(
          child: StreamBuilder<List<SyncQueueItem>>(
            stream: stream,
            builder: (context, snapshot) {
              final items = snapshot.data ?? [];
              if (items.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.cloud_done,
                        size: 48,
                        color: AppTheme.emeraldPrimary.withAlpha(180),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Offline Sync Queue is clean',
                        style: TextStyle(
                          color: isDark
                              ? AppTheme.textDarkSecondary
                              : AppTheme.textLightSecondary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'All local mutations are synchronized.',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                itemCount: items.length,
                itemBuilder: (context, index) {
            final item = items[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: SacredCard(
                child: Row(
                  children: [
                    Icon(
                      item.operation == 'DELETE'
                          ? Icons.delete
                          : Icons.cloud_upload,
                      size: 20,
                      color: AppTheme.goldAccent,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${item.operation} ${item.entityType.toUpperCase()}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            'Mutation: ${item.clientMutationId.substring(0, 8)}...',
                            style: const TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      'Tries: ${item.attempts}',
                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    ),
  ),
],
);
}

  IconData _getContentIcon(String contentType) {
    switch (contentType) {
      case 'quran':
        return Icons.menu_book;
      case 'hadith':
        return Icons.library_books;
      case 'dua':
        return Icons.favorite;
      case 'article':
        return Icons.article;
      case 'book':
        return Icons.auto_stories;
      default:
        return Icons.bookmark;
    }
  }
}
