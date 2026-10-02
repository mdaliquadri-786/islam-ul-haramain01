import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'prayer_models.dart';
import 'prayer_calculator.dart';
import 'qibla_calculator.dart';
import 'city_presets.dart';

/// Notifier managing currently selected city or custom coordinates.
class SelectedLocationNotifier extends StateNotifier<PresetCity> {
  SelectedLocationNotifier() : super(kGlobalPresetCities.first); // Default: Makkah

  void selectCity(PresetCity city) {
    state = city;
  }

  void setCustomCoordinates({
    required double latitude,
    required double longitude,
    String? cityName,
    String? timezoneId,
  }) {
    state = PresetCity(
      id: 'custom_${latitude}_$longitude',
      name: cityName ?? 'Custom Location',
      nameArabic: cityName ?? 'موقع مخصص',
      nameUrdu: cityName ?? 'کسٹم مقام',
      country: 'Global',
      coordinates: PrayerCoordinates(
        latitude: latitude,
        longitude: longitude,
        cityName: cityName,
        timezoneId: timezoneId,
      ),
      defaultMethod: state.defaultMethod,
      defaultMadhab: state.defaultMadhab,
    );
  }
}

final selectedLocationProvider =
    StateNotifierProvider<SelectedLocationNotifier, PresetCity>((ref) {
  return SelectedLocationNotifier();
});

/// Notifier managing the active calculation method.
class CalculationMethodNotifier extends StateNotifier<CalculationMethod> {
  CalculationMethodNotifier() : super(CalculationMethod.ummAlQura);

  void setMethod(CalculationMethod method) {
    state = method;
  }
}

final calculationMethodProvider =
    StateNotifierProvider<CalculationMethodNotifier, CalculationMethod>((ref) {
  return CalculationMethodNotifier();
});

/// Notifier managing the active Asr Madhab.
class AsrMadhabNotifier extends StateNotifier<AsrMadhab> {
  AsrMadhabNotifier() : super(AsrMadhab.standard);

  void setMadhab(AsrMadhab madhab) {
    state = madhab;
  }
}

final asrMadhabProvider =
    StateNotifierProvider<AsrMadhabNotifier, AsrMadhab>((ref) {
  return AsrMadhabNotifier();
});

/// Notifier managing manual minute offsets per prayer.
class PrayerOffsetsNotifier extends StateNotifier<MinuteOffsets> {
  PrayerOffsetsNotifier() : super(const MinuteOffsets.zero());

  void setOffsets(MinuteOffsets offsets) {
    state = offsets;
  }

  void setOffsetFor(PrayerName prayer, int minutes) {
    state = MinuteOffsets(
      fajr: prayer == PrayerName.fajr ? minutes : state.fajr,
      sunrise: prayer == PrayerName.sunrise ? minutes : state.sunrise,
      dhuhr: prayer == PrayerName.dhuhr ? minutes : state.dhuhr,
      asr: prayer == PrayerName.asr ? minutes : state.asr,
      maghrib: prayer == PrayerName.maghrib ? minutes : state.maghrib,
      isha: prayer == PrayerName.isha ? minutes : state.isha,
    );
  }
}

final prayerOffsetsProvider =
    StateNotifierProvider<PrayerOffsetsNotifier, MinuteOffsets>((ref) {
  return PrayerOffsetsNotifier();
});

/// Provider computing deterministic prayer times for today.
final prayerTimesProvider = Provider<PrayerTimesResult>((ref) {
  final city = ref.watch(selectedLocationProvider);
  final method = ref.watch(calculationMethodProvider);
  final madhab = ref.watch(asrMadhabProvider);
  final offsets = ref.watch(prayerOffsetsProvider);

  return PrayerCalculator.calculate(
    date: DateTime.now(),
    coordinates: city.coordinates,
    method: method,
    madhab: madhab,
    offsets: offsets,
  );
});

/// Provider computing active and next prayer countdown.
final nextPrayerInfoProvider = Provider<NextPrayerInfo>((ref) {
  final result = ref.watch(prayerTimesProvider);
  return PrayerCalculator.calculateNextPrayer(result);
});

/// Provider computing Great-Circle Qibla result for selected city.
final qiblaResultProvider = Provider<QiblaResult>((ref) {
  final city = ref.watch(selectedLocationProvider);
  return QiblaCalculator.calculate(
    city.coordinates.latitude,
    city.coordinates.longitude,
  );
});
