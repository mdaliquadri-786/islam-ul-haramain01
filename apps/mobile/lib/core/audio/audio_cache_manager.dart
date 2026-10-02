import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;

/// Metadata for an entry in the audio disk cache.
@immutable
class CachedAudioEntry {
  final String key;
  final String reciterId;
  final int surahNumber;
  final String filePath;
  final int fileSizeBytes;
  final DateTime cachedAt;
  final DateTime lastAccessedAt;
  final int accessSequence;

  const CachedAudioEntry({
    required this.key,
    required this.reciterId,
    required this.surahNumber,
    required this.filePath,
    required this.fileSizeBytes,
    required this.cachedAt,
    required this.lastAccessedAt,
    this.accessSequence = 0,
  });

  CachedAudioEntry copyWithAccess({
    required DateTime accessTime,
    required int sequence,
  }) {
    return CachedAudioEntry(
      key: key,
      reciterId: reciterId,
      surahNumber: surahNumber,
      filePath: filePath,
      fileSizeBytes: fileSizeBytes,
      cachedAt: cachedAt,
      lastAccessedAt: accessTime,
      accessSequence: sequence,
    );
  }
}

/// Disk cache manager for Quran recitation audio.
/// Adheres strictly to Islamic Waqf non-commercial distribution guidelines:
/// audio tracks are stored in filesystem cache (not SQLite blobs), tracked via LRU,
/// and subject to size thresholds and integrity validation.
class AudioCacheManager {
  static const int kDefaultMaxCacheSizeBytes = 250 * 1024 * 1024; // 250 MB
  static const int kMinValidAudioBytes = 1024; // 1 KB minimal threshold for corrupt files

  final String cacheDirectoryPath;
  final int maxCacheSizeBytes;
  final Map<String, CachedAudioEntry> _index = {};
  int _accessSequenceCounter = 0;

  AudioCacheManager({
    required this.cacheDirectoryPath,
    this.maxCacheSizeBytes = kDefaultMaxCacheSizeBytes,
  });

  /// The Islamic Waqf & open content attribution notice.
  static const String waqfAttributionNotice =
      'Audio recitations provided under Islamic Waqf / Non-Commercial Permissible Open Distribution '
      'via EveryAyah.com & Archive.org. Strictly preserved for personal worship, contemplation, '
      'and educational study. Commercial redistribution is impermissible.';

  static String cacheKey(String reciterId, int surahNumber) =>
      '$reciterId:${surahNumber.toString().padLeft(3, '0')}';

  int get totalCachedBytes =>
      _index.values.fold(0, (sum, entry) => sum + entry.fileSizeBytes);

  int get cachedFilesCount => _index.length;

  /// Check if a Surah audio file is currently cached and valid.
  bool isSurahCached(String reciterId, int surahNumber) {
    final key = cacheKey(reciterId, surahNumber);
    final entry = _index[key];
    if (entry == null) return false;

    // Verify file actually exists on disk and is non-empty
    final file = File(entry.filePath);
    if (!file.existsSync() || file.lengthSync() < kMinValidAudioBytes) {
      _index.remove(key);
      return false;
    }
    return true;
  }

  /// Get the cached file if available, updating access timestamp.
  File? getCachedFile(String reciterId, int surahNumber) {
    final key = cacheKey(reciterId, surahNumber);
    final entry = _index[key];
    if (entry == null) return null;

    final file = File(entry.filePath);
    if (!file.existsSync() || file.lengthSync() < kMinValidAudioBytes) {
      _index.remove(key);
      try {
        if (file.existsSync()) file.deleteSync();
      } catch (_) {}
      return null;
    }

    _index[key] = entry.copyWithAccess(
      accessTime: DateTime.now(),
      sequence: ++_accessSequenceCounter,
    );
    return file;
  }

  /// Register or record a newly downloaded audio file into the cache index.
  Future<CachedAudioEntry?> recordCachedFile({
    required String reciterId,
    required int surahNumber,
    required File file,
  }) async {
    if (!file.existsSync()) return null;

    final length = await file.length();
    // Validate file integrity (minimum byte threshold)
    if (length < kMinValidAudioBytes) {
      try {
        await file.delete();
      } catch (_) {}
      return null;
    }

    final key = cacheKey(reciterId, surahNumber);
    final entry = CachedAudioEntry(
      key: key,
      reciterId: reciterId,
      surahNumber: surahNumber,
      filePath: file.path,
      fileSizeBytes: length,
      cachedAt: DateTime.now(),
      lastAccessedAt: DateTime.now(),
      accessSequence: ++_accessSequenceCounter,
    );

    _index[key] = entry;

    // Perform LRU eviction if cache exceeds capacity
    await _enforceCacheCapacity();

    return entry;
  }

  /// Enforce max cache capacity by evicting Least Recently Used (LRU) audio files.
  Future<void> _enforceCacheCapacity() async {
    if (totalCachedBytes <= maxCacheSizeBytes) return;

    // Sort entries by accessSequence ascending (least recently accessed first)
    final sorted = _index.values.toList()
      ..sort((a, b) => a.accessSequence.compareTo(b.accessSequence));

    for (final entry in sorted) {
      if (totalCachedBytes <= maxCacheSizeBytes) break;

      _index.remove(entry.key);
      try {
        final f = File(entry.filePath);
        if (await f.exists()) {
          await f.delete();
        }
      } catch (e) {
        debugPrint('Failed to delete evicted cache file: ${entry.filePath}: $e');
      }
    }
  }

  /// Remove a specific cached Surah track.
  Future<bool> removeCachedSurah(String reciterId, int surahNumber) async {
    final key = cacheKey(reciterId, surahNumber);
    final entry = _index.remove(key);
    if (entry == null) return false;

    try {
      final f = File(entry.filePath);
      if (await f.exists()) {
        await f.delete();
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Clear the entire audio cache.
  Future<void> clearAll() async {
    for (final entry in _index.values) {
      try {
        final f = File(entry.filePath);
        if (await f.exists()) {
          await f.delete();
        }
      } catch (_) {}
    }
    _index.clear();
  }

  /// Build deterministic local file path for caching.
  String buildCachePath(String reciterId, int surahNumber, String ext) {
    final surahPad = surahNumber.toString().padLeft(3, '0');
    return p.join(
      cacheDirectoryPath,
      reciterId,
      'surah_$surahPad.$ext',
    );
  }
}
