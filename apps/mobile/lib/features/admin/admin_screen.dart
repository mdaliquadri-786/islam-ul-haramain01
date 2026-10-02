// ignore_for_file: deprecated_member_use
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/database/database_providers.dart';
import '../../core/database/app_database.dart';
import '../../core/operational/operational_status.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/widgets/islamic_app_bar.dart';
import '../../shared/widgets/sacred_card.dart';

const kAdministrativeRoles = [
  'super_admin',
  'admin',
  'content_admin',
  'scholar_reviewer',
  'support_admin',
  'billing_admin',
];

class AdminScreen extends ConsumerWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userStateDao = ref.watch(userStateDaoProvider);
    final opStatus = ref.watch(operationalStatusProvider);

    return Scaffold(
      appBar: const IslamicAppBar(
        title: 'Platform Administration',
        subtitle: 'لوحة التحكم والعمليات',
      ),
      body: StreamBuilder<LocalUserState?>(
        stream: userStateDao.watchCurrentUser(),
        builder: (context, snapshot) {
          final user = snapshot.data;
          final role = user?.role ?? '';
          final isAuthorized = kAdministrativeRoles.contains(role);

          if (!isAuthorized) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: SacredCard(
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.gpp_bad_outlined,
                          size: 56,
                          color: Colors.redAccent,
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Access Denied (403)',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Your current role (${role.isEmpty ? 'guest' : role}) is not authorized for administrative access. Please authenticate with credentialed staff or scholar credentials on the web portal.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // 1. Operational Health Status
              _buildSectionHeader(context, 'PLATFORM OPERATIONAL HEALTH'),
              SacredCard(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                opStatus.isMaintenanceMode
                                    ? Icons.warning_amber_rounded
                                    : Icons.check_circle_outline,
                                color: opStatus.isMaintenanceMode
                                    ? Colors.amber
                                    : AppTheme.emeraldPrimary,
                                size: 22,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                opStatus.isMaintenanceMode
                                    ? 'Maintenance Mode'
                                    : 'Operational',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                            ],
                          ),
                          Switch(
                            value: opStatus.isMaintenanceMode,
                            activeColor: AppTheme.emeraldPrimary,
                            onChanged: (val) {
                              _confirmMaintenanceToggle(context, ref, val);
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        opStatus.maintenanceMessage,
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const Divider(height: 24),
                      Text(
                        'Min Supported Mobile: ${opStatus.minSupportedVersion}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // 2. Active Administrative Role Card
              _buildSectionHeader(context, 'AUTHENTICATED OPERATOR IDENTITY'),
              SacredCard(
                child: ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: AppTheme.emeraldPrimary,
                    child: Icon(Icons.security, color: Colors.white, size: 20),
                  ),
                  title: Text(
                    user?.displayName ?? user?.email ?? 'Platform Operator',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    'Role: ${user?.role} • ID: ${user?.id.substring(0, 8)}...',
                    style: const TextStyle(fontSize: 12),
                  ),
                  trailing: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.emeraldPrimary.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: AppTheme.emeraldPrimary.withOpacity(0.4),
                      ),
                    ),
                    child: Text(
                      user?.role.toUpperCase() ?? 'ADMIN',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.emeraldPrimary,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // 3. Platform Content & Governance Statistics
              _buildSectionHeader(context, 'CANONICAL CORPUS METRICS'),
              SacredCard(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      _buildMetricRow(
                          'Holy Quran Ayahs', '6,236 Ayahs (114 Surahs)', true),
                      const Divider(),
                      _buildMetricRow(
                          'Kutub al-Sittah Hadith', '18,972 Narrations', true),
                      const Divider(),
                      _buildMetricRow(
                          'Hisn al-Muslim Duas', '268 Supplications', true),
                      const Divider(),
                      _buildMetricRow(
                          'Comparative Tafsir', 'Ibn Kathir & Al-Sa\'di', true),
                      const Divider(),
                      _buildMetricRow(
                          'Classical Books', '4 Ingested Works', true),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // 4. Audit & Immutability Notice
              SacredCard(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.verified_user_outlined,
                        color: AppTheme.goldLight,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Append-Only Cryptographic Governance',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'All administrative operations, role assignments, and setting adjustments are server-side audited. Protected canonical religious seeds cannot be altered via administrative interfaces.',
                              style: TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4.0, right: 4.0, bottom: 8.0),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.8,
          color: Theme.of(context).brightness == Brightness.dark
              ? AppTheme.goldLight
              : AppTheme.emeraldPrimary,
        ),
      ),
    );
  }

  Widget _buildMetricRow(String label, String value, bool isProtected) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12)),
          Row(
            children: [
              Text(
                value,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (isProtected) ...[
                const SizedBox(width: 6),
                const Icon(
                  Icons.lock_outline,
                  size: 14,
                  color: AppTheme.emeraldPrimary,
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  void _confirmMaintenanceToggle(
    BuildContext context,
    WidgetRef ref,
    bool targetState,
  ) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        title: Text(targetState
            ? 'Activate Maintenance Mode?'
            : 'Deactivate Maintenance Mode?'),
        content: Text(
          targetState
              ? 'Enabling maintenance mode will notify all clients that online services are temporarily paused. User-local encrypted SQLite devotional data will remain fully available.'
              : 'Deactivating maintenance mode will restore normal public operation.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogCtx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: targetState ? Colors.amber[800] : AppTheme.emeraldPrimary,
            ),
            onPressed: () {
              ref
                  .read(operationalStatusProvider.notifier)
                  .setStatus(isMaintenanceMode: targetState);
              Navigator.pop(dialogCtx);
            },
            child: const Text('Confirm', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
