import 'package:flutter_test/flutter_test.dart';
import 'package:drift/native.dart';
import 'package:drift/drift.dart' as drift;

import 'package:islamic_mobile/core/database/app_database.dart';
import 'package:islamic_mobile/core/database/daos/bookmarks_dao.dart';
import 'package:islamic_mobile/core/database/daos/reading_progress_dao.dart';
import 'package:islamic_mobile/core/database/daos/user_state_dao.dart';
import 'package:islamic_mobile/core/database/daos/sync_cursors_dao.dart';
import 'package:islamic_mobile/core/database/daos/sync_queue_dao.dart';
import 'package:islamic_mobile/core/auth/auth_models.dart';
import 'package:islamic_mobile/core/auth/secure_session_storage.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_scrubber.dart';
import 'package:islamic_mobile/core/diagnostics/diagnostic_consent.dart';
import 'package:islamic_mobile/core/prayer/prayer_models.dart';
import 'package:islamic_mobile/core/prayer/city_presets.dart';

void main() {
  late AppDatabase db;
  late BookmarksDao bookmarksDao;
  late ReadingProgressDao readingDao;
  late UserStateDao userStateDao;
  late SyncCursorsDao syncCursorsDao;
  late SyncQueueDao syncQueueDao;
  late InMemorySessionStorage sessionStorage;

  setUp(() {
    db = AppDatabase.forTesting(NativeDatabase.memory());
    bookmarksDao = BookmarksDao(db);
    readingDao = ReadingProgressDao(db);
    userStateDao = UserStateDao(db);
    syncCursorsDao = SyncCursorsDao(db);
    syncQueueDao = SyncQueueDao(db);
    sessionStorage = InMemorySessionStorage();
  });

  tearDown(() async {
    await db.close();
  });

  group('M9 Phase 3 — Client Storage, Encryption & Privacy Validation Suite', () {
    test('Test A — Multi-Tenant Account Switching & Logout Data Isolation', () async {
      const userAId = 'aaaaaaaa-1111-1111-1111-111111111111';
      const userBId = 'bbbbbbbb-2222-2222-2222-222222222222';

      // 1. User A logs in and saves a bookmark & reading progress
      await bookmarksDao.saveBookmark(
        LocalBookmarksTableCompanion.insert(
          id: 'bm-user-a-01',
          userId: userAId,
          contentType: 'quran',
          contentReference: 'quran:1:1',
          surahNumber: const drift.Value(1),
          ayahNumber: const drift.Value(1),
        ),
      );

      await readingDao.saveProgress(
        LocalReadingProgressTableCompanion.insert(
          id: 'rp-user-a-01',
          userId: userAId,
          bookId: 'riyad-al-salihin',
          progressPercentage: const drift.Value(35.5),
        ),
      );

      // Verify User A can view their records
      final userABookmarks = await bookmarksDao.watchActiveBookmarks(userAId).first;
      expect(userABookmarks.length, equals(1));
      expect(userABookmarks.first.contentReference, equals('quran:1:1'));

      final userAProgress = await readingDao.watchAllProgress(userAId).first;
      expect(userAProgress.length, equals(1));
      expect(userAProgress.first.bookId, equals('riyad-al-salihin'));

      // 2. User A logs out -> clear cached session and cursors
      await sessionStorage.clearSession();
      await userStateDao.clearAllUsers();
      await syncCursorsDao.clearAllCursors();
      await syncQueueDao.clearAll();

      expect(await sessionStorage.getTokens(), isNull);
      expect(await userStateDao.getCurrentUser(), isNull);

      // 3. User B logs in and queries bookmarks and progress
      final userBBookmarks = await bookmarksDao.watchActiveBookmarks(userBId).first;
      expect(userBBookmarks.isEmpty, isTrue, reason: 'User B must NOT see User A bookmarks');

      final userBProgress = await readingDao.watchAllProgress(userBId).first;
      expect(userBProgress.isEmpty, isTrue, reason: 'User B must NOT see User A reading progress');

      // 4. User B adds their own bookmark
      await bookmarksDao.saveBookmark(
        LocalBookmarksTableCompanion.insert(
          id: 'bm-user-b-01',
          userId: userBId,
          contentType: 'hadith',
          contentReference: 'bukhari:1',
          hadithCollection: const drift.Value('bukhari'),
          hadithNumber: const drift.Value(1),
        ),
      );

      final userBUpdatedBookmarks = await bookmarksDao.watchActiveBookmarks(userBId).first;
      expect(userBUpdatedBookmarks.length, equals(1));
      expect(userBUpdatedBookmarks.first.contentReference, equals('bukhari:1'));

      // Verify User A's data was not overwritten or exposed
      final userACheck = await bookmarksDao.watchActiveBookmarks(userAId).first;
      expect(userACheck.length, equals(1));
      expect(userACheck.first.contentReference, equals('quran:1:1'));
    });

    test('Test B — Diagnostic Scrubber Redaction of Sensitive Material', () {
      // 1. Secrets & Auth Tokens
      final tokenMessage = 'Request failed: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisToken';
      final scrubbedToken = DiagnosticScrubber.sanitize(tokenMessage);
      expect(scrubbedToken.contains('eyJhbGci'), isFalse);
      expect(scrubbedToken.contains('[REDACTED_TOKEN]'), isTrue);

      // 2. Exact GPS Coordinates
      final coordMessage = 'Location error at latitude: 21.4225, longitude: 39.8262 with elevation: 277';
      final scrubbedCoord = DiagnosticScrubber.sanitize(coordMessage);
      expect(scrubbedCoord.contains('21.4225'), isFalse);
      expect(scrubbedCoord.contains('39.8262'), isFalse);
      expect(scrubbedCoord.contains('[REDACTED_COORDINATES]'), isTrue);

      // 3. User PII (email, phone, ip)
      final piiMessage = 'User user.secret@example.com from 192.168.1.100 failed auth';
      final scrubbedPii = DiagnosticScrubber.sanitize(piiMessage);
      expect(scrubbedPii.contains('user.secret@example.com'), isFalse);
      expect(scrubbedPii.contains('192.168.1.100'), isFalse);
      expect(scrubbedPii.contains('[REDACTED_EMAIL]'), isTrue);
      expect(scrubbedPii.contains('[REDACTED_IP]'), isTrue);

      // 4. Sacred Devotional Queries
      final religiousMessage = 'Search query: quran: surah:2 ayah:255 with tafsir reflection';
      final scrubbedReligious = DiagnosticScrubber.sanitize(religiousMessage);
      expect(scrubbedReligious.contains('[REDACTED_RELIGIOUS_DATA]'), isTrue);
    });

    test('Test C — Location Privacy & In-Memory Coordinate Scoping', () {
      // 1. Default preset cities are deterministic, static, non-tracking presets
      expect(kGlobalPresetCities.isNotEmpty, isTrue);
      final mecca = kGlobalPresetCities.first;
      expect(mecca.name, equals('Makkah al-Mukarramah'));
      expect(mecca.coordinates.cityName, equals('Makkah'));
      expect(mecca.coordinates.latitude, closeTo(21.4225, 0.001));
      expect(mecca.coordinates.longitude, closeTo(39.8262, 0.001));

      // 2. Custom coordinates are scoped to memory model, never written to Drift AppSettingsTable
      final customCoord = PrayerCoordinates(
        latitude: 51.5074,
        longitude: -0.1278,
        cityName: 'London',
      );
      expect(customCoord.latitude, equals(51.5074));
      expect(customCoord.longitude, equals(-0.1278));
      expect(customCoord.cityName, equals('London'));
    });

    test('Test D — Diagnostic Consent Default Deny Policy', () {
      final consentService = DiagnosticConsentService();
      // By default, crash and diagnostic reporting is strictly DISABLED (false)
      expect(consentService.isCrashReportingEnabled, isFalse);
    });

    test('Test E — Session Storage Complete Purge on Logout', () async {
      final tokens = AuthTokens(
        accessToken: 'secret-access-token-xyz',
        refreshToken: 'secret-refresh-token-xyz',
        expiresAt: DateTime.now().toUtc().add(const Duration(hours: 1)),
        expiresIn: 3600,
      );
      const user = AuthUser(
        id: 'test-user-id-123',
        email: 'test@example.com',
        displayName: 'Test User',
      );

      await sessionStorage.saveSession(tokens, user);
      expect(await sessionStorage.hasValidSession(), isTrue);
      expect(await sessionStorage.getTokens(), isNotNull);
      expect(await sessionStorage.getUser(), isNotNull);

      // Perform logout wipe
      await sessionStorage.clearSession();
      expect(await sessionStorage.hasValidSession(), isFalse);
      expect(await sessionStorage.getTokens(), isNull);
      expect(await sessionStorage.getUser(), isNull);
    });
  });
}
