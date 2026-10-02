import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/sync/sync_coordinator.dart';
import '../../core/sync/sync_ui_state.dart';
import '../../core/theme/app_theme.dart';

/// Lightweight synchronization status badge and manual refresh action.
class SyncStatusBadge extends ConsumerWidget {
  final bool compact;

  const SyncStatusBadge({
    super.key,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final uiState = ref.watch(syncUIStateProvider);
    final coordinator = ref.watch(syncCoordinatorProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    Widget iconWidget;
    Color statusColor;

    switch (uiState.status) {
      case SyncUIStatus.syncing:
        statusColor = AppTheme.goldAccent;
        iconWidget = const SizedBox(
          width: 14,
          height: 14,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.goldAccent),
          ),
        );
        break;
      case SyncUIStatus.offline:
        statusColor = Colors.orange;
        iconWidget = const Icon(Icons.wifi_off, size: 16, color: Colors.orange);
        break;
      case SyncUIStatus.error:
        statusColor = Colors.redAccent;
        iconWidget = const Icon(Icons.sync_problem, size: 16, color: Colors.redAccent);
        break;
      case SyncUIStatus.pending:
        statusColor = AppTheme.goldAccent;
        iconWidget = const Icon(Icons.cloud_upload_outlined, size: 16, color: AppTheme.goldAccent);
        break;
      case SyncUIStatus.synced:
        statusColor = AppTheme.emeraldPrimary;
        iconWidget = const Icon(Icons.cloud_done, size: 16, color: AppTheme.emeraldPrimary);
        break;
      case SyncUIStatus.unauthenticated:
        statusColor = isDark ? Colors.white60 : Colors.black45;
        iconWidget = Icon(Icons.cloud_off, size: 16, color: statusColor);
        break;
    }

    if (compact) {
      return IconButton(
        icon: iconWidget,
        tooltip: uiState.statusMessage,
        onPressed: uiState.isAuthenticated && !uiState.isGuest && !uiState.isSyncing
            ? () => coordinator.syncNow()
            : null,
      );
    }

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: uiState.isAuthenticated && !uiState.isGuest && !uiState.isSyncing
          ? () => coordinator.syncNow()
          : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: statusColor.withAlpha(isDark ? 30 : 20),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: statusColor.withAlpha(isDark ? 80 : 100),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            iconWidget,
            const SizedBox(width: 6),
            Text(
              uiState.statusMessage,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: statusColor,
              ),
            ),
            if (uiState.isAuthenticated && !uiState.isGuest && !uiState.isSyncing) ...[
              const SizedBox(width: 4),
              Icon(Icons.refresh, size: 12, color: statusColor.withAlpha(180)),
            ],
          ],
        ),
      ),
    );
  }
}
