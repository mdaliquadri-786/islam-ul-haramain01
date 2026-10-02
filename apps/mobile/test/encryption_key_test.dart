import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/database/database_key_provider.dart';
import 'package:islamic_mobile/core/errors/app_exception.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('DatabaseKeyProvider Encryption Tests', () {
    test('Generates consistent 256-bit passphrase for testing instance', () async {
      final provider = DatabaseKeyProvider.forTesting();
      final key1 = await provider.getOrCreateKey();
      final key2 = await provider.getOrCreateKey();

      expect(key1, isNotEmpty);
      expect(key1, equals(key2));
    });

    test('Derives valid SHA-256 PRAGMA key for SQLCipher/SQLite3MC', () async {
      final provider = DatabaseKeyProvider.forTesting(initialKey: 'secret_passphrase_123');
      final rawKey = await provider.getOrCreateKey();
      final pragmaKey = provider.derivePragmaKey(rawKey);

      // SHA-256 output is 64 hex characters
      expect(pragmaKey.length, equals(64));
      expect(RegExp(r'^[a-f0-9]{64}$').hasMatch(pragmaKey), isTrue);

      // Deterministic derivation
      expect(provider.derivePragmaKey(rawKey), equals(pragmaKey));
    });

    test('Fail-closed behavior: Throws EncryptionException when secure hardware storage fails', () async {
      final provider = DatabaseKeyProvider();
      // On headless test without mock platform channel, secureStorage read throws EncryptionException
      expect(
        () => provider.getOrCreateKey(),
        throwsA(isA<EncryptionException>()),
      );
    });
  });
}
