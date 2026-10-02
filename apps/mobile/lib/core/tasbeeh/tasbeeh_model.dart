import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Authentic Dhikr phrase model sourced strictly from canonical Hisn al-Muslim.
class DhikrItem {
  final String id;
  final String arabicText;
  final String transliteration;
  final String translationEnglish;
  final String translationUrdu;
  final int defaultTarget;

  const DhikrItem({
    required this.id,
    required this.arabicText,
    required this.transliteration,
    required this.translationEnglish,
    required this.translationUrdu,
    required this.defaultTarget,
  });
}

/// Authentic preset Dhikr items verified against Hisn al-Muslim canonical seeds.
const kAuthenticDhikrPresets = <DhikrItem>[
  DhikrItem(
    id: 'tasbeeh_subhanallah',
    arabicText: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translationEnglish: 'Glory be to Allah',
    translationUrdu: 'اللہ پاک ہے',
    defaultTarget: 33,
  ),
  DhikrItem(
    id: 'tasbeeh_alhamdulillah',
    arabicText: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translationEnglish: 'All praise is for Allah',
    translationUrdu: 'تمام تعریفیں اللہ کے لیے ہیں',
    defaultTarget: 33,
  ),
  DhikrItem(
    id: 'tasbeeh_allahuakbar',
    arabicText: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translationEnglish: 'Allah is the Greatest',
    translationUrdu: 'اللہ سب سے بڑا ہے',
    defaultTarget: 34,
  ),
  DhikrItem(
    id: 'tasbeeh_istighfar',
    arabicText: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    translationEnglish: 'I seek forgiveness from Allah',
    translationUrdu: 'میں اللہ سے مغفرت طلب کرتا ہوں',
    defaultTarget: 100,
  ),
  DhikrItem(
    id: 'tasbeeh_tahlil',
    arabicText: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illallah',
    translationEnglish: 'There is no deity worthy of worship except Allah',
    translationUrdu: 'اللہ کے سوا کوئی معبود نہیں',
    defaultTarget: 100,
  ),
  DhikrItem(
    id: 'tasbeeh_hawqalah',
    arabicText: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wa la quwwata illa billah',
    translationEnglish: 'There is no power nor might except with Allah',
    translationUrdu: 'اللہ کے سوا کوئی طاقت اور قوت نہیں',
    defaultTarget: 33,
  ),
  DhikrItem(
    id: 'tasbeeh_subhanallahi_wabihamdihi',
    arabicText: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: 'Subhan Allahi wa bihamdihi, Subhan Allahil `Azeem',
    translationEnglish: 'Glory be to Allah and His is the praise, Glory be to Allah the Magnificent',
    translationUrdu: 'پاک ہے اللہ اپنی حمد کے ساتھ، پاک ہے اللہ عظمت والا',
    defaultTarget: 100,
  ),
];

/// State of the active digital tasbeeh session.
class TasbeehState {
  final DhikrItem activeDhikr;
  final int currentCount;
  final int targetCount;
  final int totalCyclesCompleted;
  final bool isCompleted;

  const TasbeehState({
    required this.activeDhikr,
    this.currentCount = 0,
    required this.targetCount,
    this.totalCyclesCompleted = 0,
    this.isCompleted = false,
  });

  TasbeehState copyWith({
    DhikrItem? activeDhikr,
    int? currentCount,
    int? targetCount,
    int? totalCyclesCompleted,
    bool? isCompleted,
  }) {
    return TasbeehState(
      activeDhikr: activeDhikr ?? this.activeDhikr,
      currentCount: currentCount ?? this.currentCount,
      targetCount: targetCount ?? this.targetCount,
      totalCyclesCompleted: totalCyclesCompleted ?? this.totalCyclesCompleted,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}

/// State notifier managing tasbeeh increment, target reaching, reset, and dhikr selection.
class TasbeehNotifier extends StateNotifier<TasbeehState> {
  TasbeehNotifier()
      : super(
          TasbeehState(
            activeDhikr: kAuthenticDhikrPresets.first,
            targetCount: kAuthenticDhikrPresets.first.defaultTarget,
          ),
        );

  /// Increments the counter by 1. Returns true if the target count was just reached.
  bool increment() {
    final nextCount = state.currentCount + 1;
    if (nextCount >= state.targetCount) {
      state = state.copyWith(
        currentCount: state.targetCount,
        totalCyclesCompleted: state.totalCyclesCompleted + 1,
        isCompleted: true,
      );
      return true; // Target reached
    } else {
      state = state.copyWith(
        currentCount: nextCount,
        isCompleted: false,
      );
      return false;
    }
  }

  /// Resets the current count to 0 for a new lap/cycle.
  void resetCurrentCycle() {
    state = state.copyWith(currentCount: 0, isCompleted: false);
  }

  /// Resets both the current count and total cycle count.
  void resetAll() {
    state = state.copyWith(
      currentCount: 0,
      totalCyclesCompleted: 0,
      isCompleted: false,
    );
  }

  /// Sets the active Dhikr preset and updates target count.
  void selectDhikr(DhikrItem dhikr) {
    state = state.copyWith(
      activeDhikr: dhikr,
      targetCount: dhikr.defaultTarget,
      currentCount: 0,
      isCompleted: false,
    );
  }

  /// Sets a custom target milestone (e.g., 33, 34, 99, 100, or user custom).
  void setTarget(int target) {
    if (target <= 0) return;
    state = state.copyWith(
      targetCount: target,
      isCompleted: state.currentCount >= target,
    );
  }
}

/// Global provider for digital tasbeeh state.
final tasbeehProvider = StateNotifierProvider<TasbeehNotifier, TasbeehState>((ref) {
  return TasbeehNotifier();
});
