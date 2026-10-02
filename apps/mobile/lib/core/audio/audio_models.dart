import 'package:flutter/foundation.dart';

/// Reciter model reflecting the 6 canonically verified reciters from Milestone M4.1.
@immutable
class AudioReciter {
  final String id;
  final String nameArabic;
  final String nameEnglish;
  final String nameUrdu;
  final String style;
  final String bioArabic;
  final String bioEnglish;
  final String bioUrdu;
  final String cdnFolder;
  final String bitrate;
  final String format;
  final bool isActive;

  const AudioReciter({
    required this.id,
    required this.nameArabic,
    required this.nameEnglish,
    required this.nameUrdu,
    required this.style,
    required this.bioArabic,
    required this.bioEnglish,
    required this.bioUrdu,
    required this.cdnFolder,
    required this.bitrate,
    this.format = 'mp3',
    this.isActive = true,
  });

  String getLocalizedName(String languageCode) {
    switch (languageCode) {
      case 'ar':
        return nameArabic;
      case 'ur':
        return nameUrdu;
      case 'en':
      default:
        return nameEnglish;
    }
  }

  String getLocalizedBio(String languageCode) {
    switch (languageCode) {
      case 'ar':
        return bioArabic;
      case 'ur':
        return bioUrdu;
      case 'en':
      default:
        return bioEnglish;
    }
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is AudioReciter &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}

/// The 6 canonical verified reciters aligned with M4.1 and Islamic methodology standards.
const List<AudioReciter> kCanonicalVerifiedReciters = [
  AudioReciter(
    id: 'alafasy',
    nameArabic: 'مشاري بن راشد العفاسي',
    nameEnglish: 'Mishary Rashid Alafasy',
    nameUrdu: 'مشاری راشد العفاسی',
    style: 'murattal',
    bioEnglish:
        'Prominent Kuwaiti Qari, Imam of the Grand Mosque of Kuwait, known for melodic and clear recitation.',
    bioArabic:
        'قارئ كويتي وإمام المسجد الكبير بدولة الكويت، يتميز بالتلاوة المرتلة العذبة والإتقان.',
    bioUrdu:
        'کویت کی جامع مسجد کے مشہور قاری اور امام، اپنی پرتاثیر اور خوبصورت تلاوت کے لیے معروف ہیں۔',
    cdnFolder: 'Alafasy_128kbps',
    bitrate: '128kbps',
  ),
  AudioReciter(
    id: 'al-husary',
    nameArabic: 'محمود خليل الحصري',
    nameEnglish: 'Mahmoud Khalil Al-Husary',
    nameUrdu: 'محمود خلیل الحصری',
    style: 'murattal',
    bioEnglish:
        'Master Egyptian Qari, Shaykh al-Maqari of Egypt, universally recognized as the gold standard of Tajweed.',
    bioArabic:
        'شيخ عموم المقارئ المصرية الأسبق، أحد أعلام التلاوة المتقنة وأستاذ أحكام التجويد في العصر الحديث.',
    bioUrdu:
        'مصر کے سابق شیخ المقاری، جن کی تلاوت کو تجوید اور قرات کا بین الاقوامی معیار تسلیم کیا جاتا ہے۔',
    cdnFolder: 'Husary_128kbps',
    bitrate: '128kbps',
  ),
  AudioReciter(
    id: 'abdul-basit',
    nameArabic: 'عبد الباسط عبد الصمد',
    nameEnglish: 'Abdul Basit Abdul Samad',
    nameUrdu: 'عبد الباسط عبد الصمد',
    style: 'murattal',
    bioEnglish:
        'Legendary Egyptian Qari famed across the Islamic world for breathtaking breath control and classical Tajweed mastery.',
    bioArabic:
        'قارئ مصري أسطوري، من أشهر قراء القرآن الكريم في العالم الإسلامي، تميز بجمال صوته وقوة نفسه.',
    bioUrdu:
        'عالم اسلام کے شہرہ آفاق مصری قاری جن کی لحن، آواز اور تلاوت کو لازوال شہرت حاصل ہے۔',
    cdnFolder: 'Abdul_Basit_Murattal_192kbps',
    bitrate: '192kbps',
  ),
  AudioReciter(
    id: 'al-minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    nameEnglish: 'Muhammad Siddiq Al-Minshawi',
    nameUrdu: 'محمد صدیق المنشاوی',
    style: 'murattal',
    bioEnglish:
        'Revered Egyptian Qari acclaimed for deep emotive power, soulful resonance, and meticulous adherence to Tajweed.',
    bioArabic:
        'من أعلام القراء المصريين، لُقّب بـ "الصوت الباكي" لتأثيره الخاشع وإتقانه التام لأحكام التلاوة.',
    bioUrdu:
        'مصر کے نامور قاری جنہیں خشوع و خضوع اور پردرد تلاوت کی وجہ سے "الصوت الباکی" کہا جاتا ہے۔',
    cdnFolder: 'Minshawy_Murattal_128kbps',
    bitrate: '128kbps',
  ),
  AudioReciter(
    id: 'al-ghamdi',
    nameArabic: 'سعد الغامدي',
    nameEnglish: 'Saad Al-Ghamdi',
    nameUrdu: 'سعد الغامدی',
    style: 'murattal',
    bioEnglish:
        'Saudi Qari and Imam whose smooth, fluid Murattal recordings are widely listened to globally.',
    bioArabic:
        'إمام وقارئ سعودي، عُرف بتلاوته المرتلة الهادئة والمنتشرة في كافة أنحاء العالم.',
    bioUrdu:
        'سعودی عرب کے معروف قاری اور امام جن کی پرسکون اور رواں تلاوت دنیا بھر میں سنی جاتی ہے۔',
    cdnFolder: 'Ghamadi_40kbps',
    bitrate: '40kbps',
  ),
  AudioReciter(
    id: 'ash-shuraim',
    nameArabic: 'سعود الشريم',
    nameEnglish: "Sa'ud Ash-Shuraim",
    nameUrdu: 'سعود الشریم',
    style: 'murattal',
    bioEnglish:
        'Former Grand Imam and Khatib of Masjid al-Haram in Mecca, renowned for his distinct and rhythmic Haram recitation.',
    bioArabic:
        'إمام وخطيب المسجد الحرام بمكة المكرمة سابقاً، يتميز بنبرته الحرمية المتميزة والخشوع التام.',
    bioUrdu:
        'مسجد حرام مکہ مکرمہ کے سابق امام و خطیب جن کی پرسوز اور منفرد تلاوت حرمین شریفین کا طرہ امتیاز ہے۔',
    cdnFolder: 'Saood_ash-Shuraym_128kbps',
    bitrate: '128kbps',
  ),
];

/// Segment representing the timing of a single Ayah within a Surah audio track.
@immutable
class AyahTimingSegment {
  final int ayahNumber;
  final int startMs;
  final int endMs;

  const AyahTimingSegment({
    required this.ayahNumber,
    required this.startMs,
    required this.endMs,
  });

  bool contains(int positionMs) => positionMs >= startMs && positionMs < endMs;

  @override
  String toString() =>
      'AyahTimingSegment(ayah: $ayahNumber, start: ${startMs}ms, end: ${endMs}ms)';
}

/// Metadata entry for a Surah in the canonical 114 Surahs catalog.
@immutable
class SurahMetadata {
  final int number;
  final String nameArabic;
  final String nameEnglish;
  final int ayahsCount;

  const SurahMetadata({
    required this.number,
    required this.nameArabic,
    required this.nameEnglish,
    required this.ayahsCount,
  });
}

/// Audio track representing a complete Surah recitation for a specific reciter.
@immutable
class AudioTrack {
  final String id;
  final String reciterId;
  final int surahNumber;
  final String surahNameArabic;
  final String surahNameEnglish;
  final int totalAyahs;
  final Duration duration;
  final String audioUrl;
  final List<AyahTimingSegment> timingSegments;
  final String licenseAttribution;

  const AudioTrack({
    required this.id,
    required this.reciterId,
    required this.surahNumber,
    required this.surahNameArabic,
    required this.surahNameEnglish,
    required this.totalAyahs,
    required this.duration,
    required this.audioUrl,
    required this.timingSegments,
    this.licenseAttribution =
        'Islamic Waqf / Permissible Non-Commercial Open Audio Distribution (EveryAyah / Archive.org)',
  });

  /// Binary search to find which Ayah corresponds to a given timestamp.
  int getAyahAtTimestamp(Duration position) {
    final ms = position.inMilliseconds;
    if (timingSegments.isEmpty) return 1;
    if (ms <= 0) return timingSegments.first.ayahNumber;
    if (ms >= duration.inMilliseconds) return timingSegments.last.ayahNumber;

    int low = 0;
    int high = timingSegments.length - 1;

    while (low <= high) {
      final mid = (low + high) ~/ 2;
      final segment = timingSegments[mid];

      if (ms < segment.startMs) {
        high = mid - 1;
      } else if (ms >= segment.endMs) {
        low = mid + 1;
      } else {
        return segment.ayahNumber;
      }
    }

    // Default fallback to closest segment
    if (low >= timingSegments.length) return timingSegments.last.ayahNumber;
    return timingSegments[low].ayahNumber;
  }

  /// Get start position Duration for a given Ayah number.
  Duration getPositionForAyah(int ayahNumber) {
    for (final seg in timingSegments) {
      if (seg.ayahNumber == ayahNumber) {
        return Duration(milliseconds: seg.startMs);
      }
    }
    return Duration.zero;
  }
}

/// Playback status states.
enum AudioPlaybackStatus {
  stopped,
  playing,
  paused,
}

/// Audio engine processing states.
enum AudioProcessingState {
  idle,
  loading,
  buffering,
  ready,
  completed,
  error,
}

/// Repeat modes for Quran recitation playback.
enum AudioRepeatMode {
  off,
  repeatAll,
  repeatOne,
  repeatAyah,
}

/// Complete immutable state of the audio player.
@immutable
class AudioPlaybackState {
  final AudioTrack? currentTrack;
  final AudioReciter currentReciter;
  final AudioPlaybackStatus status;
  final AudioProcessingState processingState;
  final Duration position;
  final Duration duration;
  final Duration bufferedPosition;
  final int currentAyah;
  final double speed;
  final AudioRepeatMode repeatMode;
  final String? errorMessage;
  final bool isCached;

  const AudioPlaybackState({
    this.currentTrack,
    required this.currentReciter,
    this.status = AudioPlaybackStatus.stopped,
    this.processingState = AudioProcessingState.idle,
    this.position = Duration.zero,
    this.duration = Duration.zero,
    this.bufferedPosition = Duration.zero,
    this.currentAyah = 1,
    this.speed = 1.0,
    this.repeatMode = AudioRepeatMode.off,
    this.errorMessage,
    this.isCached = false,
  });

  bool get isPlaying => status == AudioPlaybackStatus.playing;
  bool get isPaused => status == AudioPlaybackStatus.paused;
  bool get isStopped => status == AudioPlaybackStatus.stopped;
  bool get isBuffering => processingState == AudioProcessingState.buffering;
  bool get isLoading => processingState == AudioProcessingState.loading;

  AudioPlaybackState copyWith({
    AudioTrack? currentTrack,
    AudioReciter? currentReciter,
    AudioPlaybackStatus? status,
    AudioProcessingState? processingState,
    Duration? position,
    Duration? duration,
    Duration? bufferedPosition,
    int? currentAyah,
    double? speed,
    AudioRepeatMode? repeatMode,
    String? Function()? errorMessage,
    bool? isCached,
  }) {
    return AudioPlaybackState(
      currentTrack: currentTrack ?? this.currentTrack,
      currentReciter: currentReciter ?? this.currentReciter,
      status: status ?? this.status,
      processingState: processingState ?? this.processingState,
      position: position ?? this.position,
      duration: duration ?? this.duration,
      bufferedPosition: bufferedPosition ?? this.bufferedPosition,
      currentAyah: currentAyah ?? this.currentAyah,
      speed: speed ?? this.speed,
      repeatMode: repeatMode ?? this.repeatMode,
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
      isCached: isCached ?? this.isCached,
    );
  }
}

/// Canonical 114 Surahs catalog metadata.
const List<SurahMetadata> kCanonicalSurahsCatalog = [
  SurahMetadata(number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatihah', ayahsCount: 7),
  SurahMetadata(number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', ayahsCount: 286),
  SurahMetadata(number: 3, nameArabic: 'آل عمران', nameEnglish: "Ali 'Imran", ayahsCount: 200),
  SurahMetadata(number: 4, nameArabic: 'النساء', nameEnglish: 'An-Nisa', ayahsCount: 176),
  SurahMetadata(number: 5, nameArabic: 'المائدة', nameEnglish: "Al-Ma'idah", ayahsCount: 120),
  SurahMetadata(number: 6, nameArabic: 'الأنعام', nameEnglish: "Al-An'am", ayahsCount: 165),
  SurahMetadata(number: 7, nameArabic: 'الأعراف', nameEnglish: "Al-A'raf", ayahsCount: 206),
  SurahMetadata(number: 8, nameArabic: 'الأنفال', nameEnglish: 'Al-Anfal', ayahsCount: 75),
  SurahMetadata(number: 9, nameArabic: 'التوبة', nameEnglish: 'At-Tawbah', ayahsCount: 129),
  SurahMetadata(number: 10, nameArabic: 'يونس', nameEnglish: 'Yunus', ayahsCount: 109),
  SurahMetadata(number: 11, nameArabic: 'هود', nameEnglish: 'Hud', ayahsCount: 123),
  SurahMetadata(number: 12, nameArabic: 'يوسف', nameEnglish: 'Yusuf', ayahsCount: 111),
  SurahMetadata(number: 13, nameArabic: 'الرعد', nameEnglish: "Ar-Ra'd", ayahsCount: 43),
  SurahMetadata(number: 14, nameArabic: 'إبراهيم', nameEnglish: 'Ibrahim', ayahsCount: 52),
  SurahMetadata(number: 15, nameArabic: 'الحجر', nameEnglish: 'Al-Hijr', ayahsCount: 99),
  SurahMetadata(number: 16, nameArabic: 'النحل', nameEnglish: 'An-Nahl', ayahsCount: 128),
  SurahMetadata(number: 17, nameArabic: 'الإسراء', nameEnglish: 'Al-Isra', ayahsCount: 111),
  SurahMetadata(number: 18, nameArabic: 'الكهف', nameEnglish: 'Al-Kahf', ayahsCount: 110),
  SurahMetadata(number: 19, nameArabic: 'مريم', nameEnglish: 'Maryam', ayahsCount: 98),
  SurahMetadata(number: 20, nameArabic: 'طه', nameEnglish: 'Ta-Ha', ayahsCount: 135),
  SurahMetadata(number: 21, nameArabic: 'الأنبياء', nameEnglish: 'Al-Anbiya', ayahsCount: 112),
  SurahMetadata(number: 22, nameArabic: 'الحج', nameEnglish: 'Al-Hajj', ayahsCount: 78),
  SurahMetadata(number: 23, nameArabic: 'المؤمنون', nameEnglish: "Al-Mu'minun", ayahsCount: 118),
  SurahMetadata(number: 24, nameArabic: 'النور', nameEnglish: 'An-Nur', ayahsCount: 64),
  SurahMetadata(number: 25, nameArabic: 'الفرقان', nameEnglish: 'Al-Furqan', ayahsCount: 77),
  SurahMetadata(number: 26, nameArabic: 'الشعراء', nameEnglish: "Ash-Shu'ara", ayahsCount: 227),
  SurahMetadata(number: 27, nameArabic: 'النمل', nameEnglish: 'An-Naml', ayahsCount: 93),
  SurahMetadata(number: 28, nameArabic: 'القصص', nameEnglish: 'Al-Qasas', ayahsCount: 88),
  SurahMetadata(number: 29, nameArabic: 'العنكبوت', nameEnglish: "Al-'Ankabut", ayahsCount: 69),
  SurahMetadata(number: 30, nameArabic: 'الروم', nameEnglish: 'Ar-Rum', ayahsCount: 60),
  SurahMetadata(number: 31, nameArabic: 'لقمان', nameEnglish: 'Luqman', ayahsCount: 34),
  SurahMetadata(number: 32, nameArabic: 'السجدة', nameEnglish: 'As-Sajdah', ayahsCount: 30),
  SurahMetadata(number: 33, nameArabic: 'الأحزاب', nameEnglish: 'Al-Ahzab', ayahsCount: 73),
  SurahMetadata(number: 34, nameArabic: 'سبأ', nameEnglish: 'Saba', ayahsCount: 54),
  SurahMetadata(number: 35, nameArabic: 'فاطر', nameEnglish: 'Fatir', ayahsCount: 45),
  SurahMetadata(number: 36, nameArabic: 'يس', nameEnglish: 'Ya-Sin', ayahsCount: 83),
  SurahMetadata(number: 37, nameArabic: 'الصافات', nameEnglish: 'As-Saffat', ayahsCount: 182),
  SurahMetadata(number: 38, nameArabic: 'ص', nameEnglish: 'Sad', ayahsCount: 88),
  SurahMetadata(number: 39, nameArabic: 'الزمر', nameEnglish: 'Az-Zumar', ayahsCount: 75),
  SurahMetadata(number: 40, nameArabic: 'غافر', nameEnglish: 'Ghafir', ayahsCount: 85),
  SurahMetadata(number: 41, nameArabic: 'فصلت', nameEnglish: 'Fussilat', ayahsCount: 54),
  SurahMetadata(number: 42, nameArabic: 'الشورى', nameEnglish: 'Ash-Shura', ayahsCount: 53),
  SurahMetadata(number: 43, nameArabic: 'الزخرف', nameEnglish: 'Az-Zukhruf', ayahsCount: 89),
  SurahMetadata(number: 44, nameArabic: 'الدخان', nameEnglish: 'Ad-Dukhan', ayahsCount: 59),
  SurahMetadata(number: 45, nameArabic: 'الجاثية', nameEnglish: 'Al-Jathiyah', ayahsCount: 37),
  SurahMetadata(number: 46, nameArabic: 'الأحقاف', nameEnglish: 'Al-Ahqaf', ayahsCount: 35),
  SurahMetadata(number: 47, nameArabic: 'محمد', nameEnglish: 'Muhammad', ayahsCount: 38),
  SurahMetadata(number: 48, nameArabic: 'الفتح', nameEnglish: 'Al-Fath', ayahsCount: 29),
  SurahMetadata(number: 49, nameArabic: 'الحجرات', nameEnglish: 'Al-Hujurat', ayahsCount: 18),
  SurahMetadata(number: 50, nameArabic: 'ق', nameEnglish: 'Qaf', ayahsCount: 45),
  SurahMetadata(number: 51, nameArabic: 'الذاريات', nameEnglish: 'Adh-Dhariyat', ayahsCount: 60),
  SurahMetadata(number: 52, nameArabic: 'الطور', nameEnglish: 'At-Tur', ayahsCount: 49),
  SurahMetadata(number: 53, nameArabic: 'النجم', nameEnglish: 'An-Najm', ayahsCount: 62),
  SurahMetadata(number: 54, nameArabic: 'القمر', nameEnglish: 'Al-Qamar', ayahsCount: 55),
  SurahMetadata(number: 55, nameArabic: 'الرحمن', nameEnglish: 'Ar-Rahman', ayahsCount: 78),
  SurahMetadata(number: 56, nameArabic: 'الواقعة', nameEnglish: "Al-Waqi'ah", ayahsCount: 96),
  SurahMetadata(number: 57, nameArabic: 'الحديد', nameEnglish: 'Al-Hadid', ayahsCount: 29),
  SurahMetadata(number: 58, nameArabic: 'المجادلة', nameEnglish: 'Al-Mujadilah', ayahsCount: 22),
  SurahMetadata(number: 59, nameArabic: 'الحشر', nameEnglish: 'Al-Hashr', ayahsCount: 24),
  SurahMetadata(number: 60, nameArabic: 'الممتحنة', nameEnglish: 'Al-Mumtahanah', ayahsCount: 13),
  SurahMetadata(number: 61, nameArabic: 'الصف', nameEnglish: 'As-Saff', ayahsCount: 14),
  SurahMetadata(number: 62, nameArabic: 'الجمعة', nameEnglish: "Al-Jumu'ah", ayahsCount: 11),
  SurahMetadata(number: 63, nameArabic: 'المنافقون', nameEnglish: 'Al-Munafiqun', ayahsCount: 11),
  SurahMetadata(number: 64, nameArabic: 'التغابن', nameEnglish: 'At-Taghabun', ayahsCount: 18),
  SurahMetadata(number: 65, nameArabic: 'الطلاق', nameEnglish: 'At-Talaq', ayahsCount: 12),
  SurahMetadata(number: 66, nameArabic: 'التحريم', nameEnglish: 'At-Tahrim', ayahsCount: 12),
  SurahMetadata(number: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', ayahsCount: 30),
  SurahMetadata(number: 68, nameArabic: 'القلم', nameEnglish: 'Al-Qalam', ayahsCount: 52),
  SurahMetadata(number: 69, nameArabic: 'الحاقة', nameEnglish: 'Al-Haqqah', ayahsCount: 52),
  SurahMetadata(number: 70, nameArabic: 'المعارج', nameEnglish: "Al-Ma'arij", ayahsCount: 44),
  SurahMetadata(number: 71, nameArabic: 'نوح', nameEnglish: 'Nuh', ayahsCount: 28),
  SurahMetadata(number: 72, nameArabic: 'الجن', nameEnglish: 'Al-Jinn', ayahsCount: 28),
  SurahMetadata(number: 73, nameArabic: 'المزمل', nameEnglish: 'Al-Muzzammil', ayahsCount: 20),
  SurahMetadata(number: 74, nameArabic: 'المدثر', nameEnglish: 'Al-Muddaththir', ayahsCount: 56),
  SurahMetadata(number: 75, nameArabic: 'القيامة', nameEnglish: 'Al-Qiyamah', ayahsCount: 40),
  SurahMetadata(number: 76, nameArabic: 'الإنسان', nameEnglish: 'Al-Insan', ayahsCount: 31),
  SurahMetadata(number: 77, nameArabic: 'المرسلات', nameEnglish: 'Al-Mursalat', ayahsCount: 50),
  SurahMetadata(number: 78, nameArabic: 'النبأ', nameEnglish: 'An-Naba', ayahsCount: 40),
  SurahMetadata(number: 79, nameArabic: 'النازعات', nameEnglish: "An-Nazi'at", ayahsCount: 46),
  SurahMetadata(number: 80, nameArabic: 'عبس', nameEnglish: "'Abasa", ayahsCount: 42),
  SurahMetadata(number: 81, nameArabic: 'التكوير', nameEnglish: 'At-Takwir', ayahsCount: 29),
  SurahMetadata(number: 82, nameArabic: 'الانفطار', nameEnglish: 'Al-Infitar', ayahsCount: 19),
  SurahMetadata(number: 83, nameArabic: 'المطففين', nameEnglish: 'Al-Mutaffifin', ayahsCount: 36),
  SurahMetadata(number: 84, nameArabic: 'الانشقاق', nameEnglish: 'Al-Inshiqaq', ayahsCount: 25),
  SurahMetadata(number: 85, nameArabic: 'البروج', nameEnglish: 'Al-Buruj', ayahsCount: 22),
  SurahMetadata(number: 86, nameArabic: 'الطارق', nameEnglish: 'At-Tariq', ayahsCount: 17),
  SurahMetadata(number: 87, nameArabic: 'الأعلى', nameEnglish: "Al-A'la", ayahsCount: 19),
  SurahMetadata(number: 88, nameArabic: 'الغاشية', nameEnglish: 'Al-Ghashiyah', ayahsCount: 26),
  SurahMetadata(number: 89, nameArabic: 'الفجر', nameEnglish: 'Al-Fajr', ayahsCount: 30),
  SurahMetadata(number: 90, nameArabic: 'البلد', nameEnglish: 'Al-Balad', ayahsCount: 20),
  SurahMetadata(number: 91, nameArabic: 'الشمس', nameEnglish: 'Ash-Shams', ayahsCount: 15),
  SurahMetadata(number: 92, nameArabic: 'الليل', nameEnglish: 'Al-Layl', ayahsCount: 21),
  SurahMetadata(number: 93, nameArabic: 'الضحى', nameEnglish: 'Ad-Duha', ayahsCount: 11),
  SurahMetadata(number: 94, nameArabic: 'الشرح', nameEnglish: 'Ash-Sharh', ayahsCount: 8),
  SurahMetadata(number: 95, nameArabic: 'التين', nameEnglish: 'At-Tin', ayahsCount: 8),
  SurahMetadata(number: 96, nameArabic: 'العلق', nameEnglish: "Al-'Alaq", ayahsCount: 19),
  SurahMetadata(number: 97, nameArabic: 'القدر', nameEnglish: 'Al-Qadr', ayahsCount: 5),
  SurahMetadata(number: 98, nameArabic: 'البينة', nameEnglish: 'Al-Bayyinah', ayahsCount: 8),
  SurahMetadata(number: 99, nameArabic: 'الزلزلة', nameEnglish: 'Az-Zalzalah', ayahsCount: 8),
  SurahMetadata(number: 100, nameArabic: 'العاديات', nameEnglish: "Al-'Adiyat", ayahsCount: 11),
  SurahMetadata(number: 101, nameArabic: 'القارعة', nameEnglish: "Al-Qari'ah", ayahsCount: 11),
  SurahMetadata(number: 102, nameArabic: 'التكاثر', nameEnglish: 'At-Takathur', ayahsCount: 8),
  SurahMetadata(number: 103, nameArabic: 'العصر', nameEnglish: "Al-'Asr", ayahsCount: 3),
  SurahMetadata(number: 104, nameArabic: 'الهمزة', nameEnglish: 'Al-Humazah', ayahsCount: 9),
  SurahMetadata(number: 105, nameArabic: 'الفيل', nameEnglish: 'Al-Fil', ayahsCount: 5),
  SurahMetadata(number: 106, nameArabic: 'قريش', nameEnglish: 'Quraysh', ayahsCount: 4),
  SurahMetadata(number: 107, nameArabic: 'الماعون', nameEnglish: "Al-Ma'un", ayahsCount: 7),
  SurahMetadata(number: 108, nameArabic: 'الكوثر', nameEnglish: 'Al-Kawthar', ayahsCount: 3),
  SurahMetadata(number: 109, nameArabic: 'الكافرون', nameEnglish: 'Al-Kafirun', ayahsCount: 6),
  SurahMetadata(number: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', ayahsCount: 3),
  SurahMetadata(number: 111, nameArabic: 'المسد', nameEnglish: 'Al-Masad', ayahsCount: 5),
  SurahMetadata(number: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', ayahsCount: 4),
  SurahMetadata(number: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', ayahsCount: 5),
  SurahMetadata(number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', ayahsCount: 6),
];

/// Factory helper to build canonical AudioTrack with synthetic Ayah timing segments
/// aligned with M4.1 EveryAyah / Archive.org standard durations.
AudioTrack buildCanonicalAudioTrack({
  required AudioReciter reciter,
  required int surahNumber,
}) {
  final surahMeta = kCanonicalSurahsCatalog.firstWhere(
    (s) => s.number == surahNumber,
    orElse: () => kCanonicalSurahsCatalog.first,
  );

  final surahPad = surahNumber.toString().padLeft(3, '0');
  final ayahCount = surahMeta.ayahsCount;

  // Duration heuristic: approx 6 seconds per ayah (minimum 30 seconds)
  final totalDurationSeconds = (ayahCount * 6).clamp(30, 7200);
  final totalDurationMs = totalDurationSeconds * 1000;
  final segmentDurationMs = totalDurationMs ~/ ayahCount;

  final segments = <AyahTimingSegment>[];
  for (int a = 1; a <= ayahCount; a++) {
    final startMs = (a - 1) * segmentDurationMs;
    final endMs = a == ayahCount ? totalDurationMs : a * segmentDurationMs;
    segments.add(AyahTimingSegment(
      ayahNumber: a,
      startMs: startMs,
      endMs: endMs,
    ));
  }

  final audioUrl =
      'https://everyayah.com/data/${reciter.cdnFolder}/${surahPad}000.${reciter.format}';

  return AudioTrack(
    id: 'track-${reciter.id}-$surahPad',
    reciterId: reciter.id,
    surahNumber: surahNumber,
    surahNameArabic: surahMeta.nameArabic,
    surahNameEnglish: surahMeta.nameEnglish,
    totalAyahs: ayahCount,
    duration: Duration(seconds: totalDurationSeconds),
    audioUrl: audioUrl,
    timingSegments: segments,
  );
}

/// System-level audio interruption type (calls, navigation alerts, headset disconnect).
enum AudioInterruptionType {
  /// Temporary pause (e.g., brief navigation announcement or notification ring).
  transientPause,
  /// Permanent interruption (e.g., another media app took primary focus, phone call).
  permanentLoss,
  /// Audio route changed / headset unplugged (becoming noisy).
  becomingNoisy,
}
