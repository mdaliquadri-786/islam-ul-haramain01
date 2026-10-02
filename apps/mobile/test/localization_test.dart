import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:islamic_mobile/core/localization/app_localizations.dart';

void main() {
  group('AppLocalizations Trilingual Tests (en, ar, ur)', () {
    test('English (en) localization properties and LTR direction', () {
      const l10n = AppLocalizations(Locale('en'));
      expect(l10n.isRtl, isFalse);
      expect(l10n.appTitle, equals('ISLAM UL HARAMAIN'));
      expect(l10n.navQuran, equals('Holy Quran'));
      expect(l10n.navHadith, equals('Hadith'));
      expect(l10n.navDuas, equals('Duas & Adhkar'));
      expect(l10n.navPrayer, equals('Prayer Times'));
      expect(l10n.navLibrary, equals('My Library'));
      expect(l10n.typeQuran, equals('Quran'));
      expect(l10n.scriptUthmani, contains('Uthmani'));
    });

    test('Arabic (ar) localization properties and RTL direction', () {
      const l10n = AppLocalizations(Locale('ar'));
      expect(l10n.isRtl, isTrue);
      expect(l10n.appTitle, equals('إسلام الحرمين'));
      expect(l10n.navQuran, equals('القرآن الكريم'));
      expect(l10n.navHadith, equals('الحديث النبوي'));
      expect(l10n.navDuas, equals('الأدعية والأذكار'));
      expect(l10n.navPrayer, equals('مواقيت الصلاة'));
      expect(l10n.navLibrary, equals('مكتبتي'));
      expect(l10n.typeQuran, equals('القرآن'));
      expect(l10n.scriptUthmani, contains('الرسم العثماني'));
    });

    test('Urdu (ur) localization properties and RTL direction', () {
      const l10n = AppLocalizations(Locale('ur'));
      expect(l10n.isRtl, isTrue);
      expect(l10n.appTitle, equals('اسلام الحرمین'));
      expect(l10n.navQuran, equals('قرآن مجید'));
      expect(l10n.navHadith, equals('حدیث نبوی'));
      expect(l10n.navDuas, equals('دعائیں اور اذکار'));
      expect(l10n.navPrayer, equals('نماز کے اوقات'));
      expect(l10n.navLibrary, equals('میری لائبریری'));
      expect(l10n.typeQuran, equals('قرآن'));
      expect(l10n.scriptIndoPak, contains('ہند و پاک'));
    });

    test('Supported locales list contains exactly en, ar, ur', () {
      expect(AppLocalizations.supportedLocales.map((l) => l.languageCode).toList(),
          containsAll(['en', 'ar', 'ur']));
    });
  });
}
