/// Platform application configuration.
/// Safe public client configuration with zero secrets.
class AppConfig {
  final String supabaseUrl;
  final String supabaseAnonKey;

  const AppConfig({
    required this.supabaseUrl,
    required this.supabaseAnonKey,
  });

  /// Default production / local development configuration.
  /// Overridable at compile time via --dart-define.
  factory AppConfig.fromEnvironment() {
    return const AppConfig(
      supabaseUrl: String.fromEnvironment(
        'SUPABASE_URL',
        defaultValue: 'https://platform.islamulharamain.org',
      ),
      supabaseAnonKey: String.fromEnvironment(
        'SUPABASE_ANON_KEY',
        defaultValue: 'public-anon-key-v1-islamic-platform',
      ),
    );
  }

  /// Factory for testing with deterministic endpoints.
  const AppConfig.forTesting({
    this.supabaseUrl = 'https://mock.supabase.test',
    this.supabaseAnonKey = 'test-anon-key',
  });
}
