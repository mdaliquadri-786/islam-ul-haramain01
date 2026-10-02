import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app/app.dart';
import 'core/diagnostics/diagnostic_service.dart';
import 'core/diagnostics/sanctuary_error_widget.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize offline diagnostic buffer and global error traps
  final diagnosticService = DiagnosticService();
  setupGlobalErrorTraps(diagnosticService);

  runApp(
    const ProviderScope(
      child: IslamicMobileApp(),
    ),
  );
}
