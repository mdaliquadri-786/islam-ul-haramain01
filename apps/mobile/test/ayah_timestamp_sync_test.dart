import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/audio/audio_models.dart';

void main() {
  group('M5.3 Ayah-Level Timestamp Synchronization Tests', () {
    test('All 114 canonical Surahs have valid metadata and generate valid tracks', () {
      expect(kCanonicalSurahsCatalog.length, 114);

      final reciter = kCanonicalVerifiedReciters.first;

      for (int s = 1; s <= 114; s++) {
        final track = buildCanonicalAudioTrack(
          reciter: reciter,
          surahNumber: s,
        );

        expect(track.surahNumber, s);
        expect(track.timingSegments.length, track.totalAyahs);
        expect(track.duration.inMilliseconds, greaterThan(0));

        // Verify timing segments are strictly contiguous and non-overlapping
        for (int i = 0; i < track.timingSegments.length; i++) {
          final seg = track.timingSegments[i];
          expect(seg.ayahNumber, i + 1);
          expect(seg.startMs, lessThan(seg.endMs));

          if (i > 0) {
            final prev = track.timingSegments[i - 1];
            expect(seg.startMs, prev.endMs,
                reason: 'Segment $i startMs must equal previous segment endMs');
          }
        }

        // Verify track ends exactly at track duration
        expect(track.timingSegments.last.endMs, track.duration.inMilliseconds);
      }
    });

    test('getAyahAtTimestamp maps start, midpoint, and end of segments accurately', () {
      final reciter = kCanonicalVerifiedReciters.first;
      final track = buildCanonicalAudioTrack(
        reciter: reciter,
        surahNumber: 1, // Al-Fatihah, 7 ayahs
      );

      for (final segment in track.timingSegments) {
        // Start of segment
        final atStart = track.getAyahAtTimestamp(Duration(milliseconds: segment.startMs));
        expect(atStart, segment.ayahNumber);

        // Middle of segment
        final midMs = (segment.startMs + segment.endMs) ~/ 2;
        final atMid = track.getAyahAtTimestamp(Duration(milliseconds: midMs));
        expect(atMid, segment.ayahNumber);

        // Just before end of segment (endMs - 1)
        final atEndMinusOne =
            track.getAyahAtTimestamp(Duration(milliseconds: segment.endMs - 1));
        expect(atEndMinusOne, segment.ayahNumber);
      }
    });

    test('getAyahAtTimestamp handles boundary conditions gracefully', () {
      final reciter = kCanonicalVerifiedReciters.first;
      final track = buildCanonicalAudioTrack(
        reciter: reciter,
        surahNumber: 1,
      );

      // Negative or zero position returns first ayah
      expect(track.getAyahAtTimestamp(Duration.zero), 1);
      expect(track.getAyahAtTimestamp(const Duration(seconds: -5)), 1);

      // Position exceeding track duration returns last ayah
      final overflow = track.duration + const Duration(hours: 1);
      expect(track.getAyahAtTimestamp(overflow), 7);
    });

    test('getPositionForAyah returns accurate start timestamp for each Ayah', () {
      final reciter = kCanonicalVerifiedReciters.first;
      final track = buildCanonicalAudioTrack(
        reciter: reciter,
        surahNumber: 112, // Al-Ikhlas (4 ayahs)
      );

      expect(track.getPositionForAyah(1), Duration.zero);

      final seg2 = track.timingSegments[1];
      expect(track.getPositionForAyah(2), Duration(milliseconds: seg2.startMs));

      final seg4 = track.timingSegments[3];
      expect(track.getPositionForAyah(4), Duration(milliseconds: seg4.startMs));

      // Non-existent Ayah returns Duration.zero
      expect(track.getPositionForAyah(99), Duration.zero);
    });
  });
}
