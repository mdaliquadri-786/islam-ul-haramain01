// ignore_for_file: avoid_print

import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqlite3/sqlite3.dart' as sqlite;

void main() {
  test('Forensic check: Is the SQLite3MultipleCiphers engine genuinely encrypted?', () async {
    final tempDir = await Directory.systemTemp.createTemp('db_forensics_');
    final dbFile = File('${tempDir.path}/forensic_test.db');

    print('=== FORENSIC TEST START ===');

    // 1. Direct sqlite3 inspection
    final rawDb = sqlite.sqlite3.open(dbFile.path);

    print('sqlite3.version: ${sqlite.sqlite3.version}');

    final cipherList = rawDb.select('PRAGMA cipher_list;');
    print('PRAGMA cipher_list result: $cipherList');

    // Execute PRAGMA key to encrypt database on creation
    rawDb.execute("PRAGMA key = 'test_passphrase_123';");

    // Create table and insert identifiable text
    rawDb.execute('CREATE TABLE secret_test (id INTEGER PRIMARY KEY, secret TEXT);');
    rawDb.execute("INSERT INTO secret_test (secret) VALUES ('CONFIDENTIAL_ISLAMIC_SECRET_DATA_12345');");

    // Close the database
    rawDb.close();

    // 2. Inspect physical file on disk
    final bytes = await dbFile.readAsBytes();
    final first16Hex = bytes.sublist(0, 16).map((b) => b.toRadixString(16).padLeft(2, '0')).join(' ');
    print('File size: ${bytes.length} bytes');
    print('File header (first 16 bytes in hex): $first16Hex');

    // Plaintext SQLite format 3 starts with 'SQLite format 3\0'
    final sqliteHeader = ascii.encode('SQLite format 3\x00');
    final startsWithPlaintextSqlite = bytes.length >= 16 &&
        bytes.sublist(0, 16).toString() == sqliteHeader.toString();
    print('Does file start with standard "SQLite format 3" header?: $startsWithPlaintextSqlite');
    expect(startsWithPlaintextSqlite, isFalse, reason: 'Encrypted database must NOT have unencrypted SQLite header');

    // Check if plaintext secret appears in raw disk bytes
    final fileContentLatin1 = latin1.decode(bytes);
    final containsPlaintext = fileContentLatin1.contains('CONFIDENTIAL_ISLAMIC_SECRET_DATA_12345');
    print('Does file contain plaintext secret on disk?: $containsPlaintext');
    expect(containsPlaintext, isFalse, reason: 'Ciphertext must encrypt all user data on disk');

    // 3. Attempt to open and read WITHOUT key (MUST FAIL)
    final unkeyedDb = sqlite.sqlite3.open(dbFile.path);
    bool unkeyedReadFailed = false;
    try {
      unkeyedDb.select('SELECT secret FROM secret_test;');
    } catch (e) {
      unkeyedReadFailed = true;
      print('Unkeyed read correctly rejected: $e');
    } finally {
      unkeyedDb.close();
    }
    expect(unkeyedReadFailed, isTrue, reason: 'Opening/reading without key must fail');

    // 4. Attempt to open and read with WRONG key (MUST FAIL)
    final wrongKeyDb = sqlite.sqlite3.open(dbFile.path);
    bool wrongKeyReadFailed = false;
    try {
      wrongKeyDb.execute("PRAGMA key = 'wrong_password_999';");
      wrongKeyDb.select('SELECT secret FROM secret_test;');
    } catch (e) {
      wrongKeyReadFailed = true;
      print('Wrong key read correctly rejected: $e');
    } finally {
      wrongKeyDb.close();
    }
    expect(wrongKeyReadFailed, isTrue, reason: 'Opening/reading with wrong key must fail');

    // 5. Attempt to open and read WITH CORRECT key (MUST SUCCEED)
    final correctDb = sqlite.sqlite3.open(dbFile.path);
    correctDb.execute("PRAGMA key = 'test_passphrase_123';");
    final rows = correctDb.select('SELECT secret FROM secret_test;');
    print('Correct key read succeeded! Rows: $rows');
    expect(rows.length, equals(1));
    expect(rows.first['secret'], equals('CONFIDENTIAL_ISLAMIC_SECRET_DATA_12345'));
    correctDb.close();

    // Clean up
    await tempDir.delete(recursive: true);
    print('=== FORENSIC TEST COMPLETE: ENCRYPTION FUNCTIONALLY VERIFIED ===');
  });
}
