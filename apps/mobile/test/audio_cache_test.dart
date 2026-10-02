import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/audio/audio_cache_manager.dart';

void main() {
  group('M5.3 Audio Cache Manager & Waqf Licensing Compliance Tests', () {
    late Directory tempDir;
    late AudioCacheManager cacheManager;

    setUp(() {
      tempDir = Directory.systemTemp.createTempSync('audio_cache_test_');
      cacheManager = AudioCacheManager(
        cacheDirectoryPath: tempDir.path,
        maxCacheSizeBytes: 10 * 1024, // 10 KB small budget for test
      );
    });

    tearDown(() {
      if (tempDir.existsSync()) {
        tempDir.deleteSync(recursive: true);
      }
    });

    test('Waqf attribution notice explicitly references Islamic Waqf & EveryAyah/Archive.org', () {
      const notice = AudioCacheManager.waqfAttributionNotice;
      expect(notice, contains('Islamic Waqf'));
      expect(notice, contains('EveryAyah.com'));
      expect(notice, contains('Archive.org'));
      expect(notice, contains('Commercial redistribution is impermissible'));
    });

    test('Uncached Surah returns isSurahCached false and getCachedFile null', () {
      expect(cacheManager.isSurahCached('alafasy', 1), isFalse);
      expect(cacheManager.getCachedFile('alafasy', 1), isNull);
    });

    test('Recording valid audio file caches and updates access metrics', () async {
      final dummyAudioFile = File('${tempDir.path}/test_surah_001.mp3');
      // Write 2 KB dummy audio payload (> 1024 byte threshold)
      await dummyAudioFile.writeAsBytes(List.filled(2048, 0x41));

      final entry = await cacheManager.recordCachedFile(
        reciterId: 'alafasy',
        surahNumber: 1,
        file: dummyAudioFile,
      );

      expect(entry, isNotNull);
      expect(cacheManager.isSurahCached('alafasy', 1), isTrue);
      expect(cacheManager.totalCachedBytes, 2048);
      expect(cacheManager.cachedFilesCount, 1);

      final retrieved = cacheManager.getCachedFile('alafasy', 1);
      expect(retrieved, isNotNull);
      expect(retrieved!.existsSync(), isTrue);
    });

    test('Corrupt or truncated file (< 1024 bytes) is rejected and purged', () async {
      final corruptFile = File('${tempDir.path}/corrupt_001.mp3');
      await corruptFile.writeAsBytes([0x01, 0x02, 0x03]); // Only 3 bytes!

      final entry = await cacheManager.recordCachedFile(
        reciterId: 'alafasy',
        surahNumber: 1,
        file: corruptFile,
      );

      expect(entry, isNull);
      expect(cacheManager.isSurahCached('alafasy', 1), isFalse);
      expect(corruptFile.existsSync(), isFalse);
    });

    test('LRU capacity eviction removes oldest accessed track when threshold exceeded', () async {
      // Cache limit is 10 KB (10240 bytes).
      // Write file 1: 4 KB
      final file1 = File('${tempDir.path}/surah_001.mp3');
      await file1.writeAsBytes(List.filled(4096, 0x01));
      await cacheManager.recordCachedFile(reciterId: 'alafasy', surahNumber: 1, file: file1);

      // Write file 2: 4 KB
      final file2 = File('${tempDir.path}/surah_002.mp3');
      await file2.writeAsBytes(List.filled(4096, 0x02));
      await cacheManager.recordCachedFile(reciterId: 'alafasy', surahNumber: 2, file: file2);

      expect(cacheManager.totalCachedBytes, 8192);
      expect(cacheManager.cachedFilesCount, 2);

      // Access file 1 to make it more recently used than file 2
      cacheManager.getCachedFile('alafasy', 1);

      // Write file 3: 4 KB (Total would become 12 KB > 10 KB limit)
      // File 2 (oldest access) should be evicted
      final file3 = File('${tempDir.path}/surah_003.mp3');
      await file3.writeAsBytes(List.filled(4096, 0x03));
      await cacheManager.recordCachedFile(reciterId: 'alafasy', surahNumber: 3, file: file3);

      expect(cacheManager.isSurahCached('alafasy', 2), isFalse);
      expect(cacheManager.isSurahCached('alafasy', 1), isTrue);
      expect(cacheManager.isSurahCached('alafasy', 3), isTrue);
      expect(cacheManager.totalCachedBytes, lessThanOrEqualTo(10240));
    });

    test('clearAll removes all cached entries and deletes disk files', () async {
      final file = File('${tempDir.path}/surah_112.mp3');
      await file.writeAsBytes(List.filled(2048, 0x05));
      await cacheManager.recordCachedFile(reciterId: 'alafasy', surahNumber: 112, file: file);

      expect(cacheManager.cachedFilesCount, 1);
      await cacheManager.clearAll();

      expect(cacheManager.cachedFilesCount, 0);
      expect(cacheManager.totalCachedBytes, 0);
      expect(file.existsSync(), isFalse);
    });
  });
}
