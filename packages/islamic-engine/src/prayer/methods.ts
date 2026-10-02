/**
 * @file methods.ts
 * @package @islamic/islamic-engine
 * @description Method configurations and parameters for the 7 supported canonical
 * prayer calculation authorities plus custom parameter overrides.
 */

import { CalculationMethod, CalculationMethodDetails, CustomMethodParameters } from './types';

export const CALCULATION_METHODS: Record<CalculationMethod, CalculationMethodDetails> = {
  MWL: {
    id: 'MWL',
    name: 'Muslim World League',
    nameArabic: 'رابطة العالم الإسلامي',
    organization: 'Muslim World League (Makkah al-Mukarramah)',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    description: 'Widely used in Europe, the Far East, and parts of the Americas.'
  },
  ISNA: {
    id: 'ISNA',
    name: 'Islamic Society of North America',
    nameArabic: 'الجمعية الإسلامية لأمريكا الشمالية',
    organization: 'Islamic Society of North America',
    fajrAngle: 15.0,
    ishaAngle: 15.0,
    description: 'Standard across North America (USA and Canada).'
  },
  UmmAlQura: {
    id: 'UmmAlQura',
    name: 'Umm al-Qura University, Makkah',
    nameArabic: 'جامعة أم القرى - مكة المكرمة',
    organization: 'Institute of Astronomical & Geophysical Research, KSA',
    fajrAngle: 18.5,
    ishaIntervalMinutes: 90.0, // Fixed 90 min interval after Maghrib (120 min during Ramadan)
    description: 'Official calendar of the Kingdom of Saudi Arabia and the Arabian Peninsula.'
  },
  Karachi: {
    id: 'Karachi',
    name: 'University of Islamic Sciences, Karachi',
    nameArabic: 'جامعة العلوم الإسلامية بكراتشي',
    organization: 'Jamia Uloom-ul-Islamia, Banuri Town, Karachi',
    fajrAngle: 18.0,
    ishaAngle: 18.0,
    description: 'Standard across Pakistan, India, Bangladesh, and Afghanistan.'
  },
  Egyptian: {
    id: 'Egyptian',
    name: 'Egyptian General Authority of Survey',
    nameArabic: 'الهيئة المصرية العامة للمساحة',
    organization: 'Egyptian General Authority of Survey',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
    description: 'Standard across Egypt, North Africa, Levant, and parts of the Middle East.'
  },
  Diyanet: {
    id: 'Diyanet',
    name: 'Directorate of Religious Affairs (Diyanet)',
    nameArabic: 'رئاسة الشؤون الدينية التركية',
    organization: 'Diyanet İşleri Başkanlığı, Turkey',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    description: 'Official standard for Turkey and Turkish communities across Europe.'
  },
  MUIS: {
    id: 'MUIS',
    name: 'Majlis Ugama Islam Singapura',
    nameArabic: 'مجلس أوغاما إسلام سينغافورا',
    organization: 'Islamic Religious Council of Singapore (MUIS)',
    fajrAngle: 20.0,
    ishaAngle: 18.0,
    description: 'Standard for Singapore and utilized in Southeast Asia.'
  },
  Custom: {
    id: 'Custom',
    name: 'Custom Configuration',
    nameArabic: 'إعداد مخصص',
    organization: 'User-specified parameters',
    fajrAngle: 18.0,
    ishaAngle: 17.0,
    description: 'User-defined solar angles and calculation parameters.'
  }
};

/**
 * Returns effective calculation method parameters, applying any custom overrides.
 */
export function getMethodParameters(
  method: CalculationMethod = 'MWL',
  customParams?: CustomMethodParameters
): CalculationMethodDetails {
  const base = CALCULATION_METHODS[method] || CALCULATION_METHODS.MWL;

  if (method === 'Custom' && customParams) {
    return {
      ...base,
      fajrAngle: customParams.fajrAngle ?? base.fajrAngle,
      ishaAngle: customParams.ishaAngle,
      ishaIntervalMinutes: customParams.ishaIntervalMinutes,
      maghribAngle: customParams.maghribAngle,
      maghribIntervalMinutes: customParams.maghribIntervalMinutes
    };
  }

  return base;
}
