/**
 * @file prayer-service.ts
 * @package @islamic/database
 * @description Prayer service providing integration between Supabase user_prayer_settings
 * and the @islamic/islamic-engine calculation layer.
 */

import {
  calculatePrayerTimes,
  calculateQibla,
  PrayerCalculationParams,
  PrayerTimesResult,
  QiblaCalculationResult,
  CalculationMethod,
  AsrMadhhab,
  HighLatitudeRule
} from '@islamic/islamic-engine';
import { UserPrayerSettingsEntity, UserPrayerSettingsRow } from '../types';
import { SupabaseClient } from '@supabase/supabase-js';

export function mapRowToPrayerSettings(row: UserPrayerSettingsRow): UserPrayerSettingsEntity {
  return {
    id: row.id,
    userId: row.user_id,
    calculationMethod: row.calculation_method as CalculationMethod,
    asrMadhhab: row.asr_madhhab as AsrMadhhab,
    highLatitudeRule: row.high_latitude_rule as HighLatitudeRule,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    cityName: row.city_name ?? null,
    timezone: row.timezone,
    fajrOffsetMinutes: row.fajr_offset_minutes,
    dhuhrOffsetMinutes: row.dhuhr_offset_minutes,
    asrOffsetMinutes: row.asr_offset_minutes,
    maghribOffsetMinutes: row.maghrib_offset_minutes,
    ishaOffsetMinutes: row.isha_offset_minutes,
    updatedAt: row.updated_at
  };
}

export function prayerSettingsToParams(
  settings: Partial<UserPrayerSettingsEntity>,
  date: Date = new Date()
): PrayerCalculationParams {
  const latitude = settings.latitude ?? 21.4225; // Default Makkah
  const longitude = settings.longitude ?? 39.8262;

  return {
    coordinates: {
      latitude,
      longitude
    },
    date,
    method: settings.calculationMethod || 'MWL',
    madhhab: settings.asrMadhhab || 'standard',
    highLatitudeRule: settings.highLatitudeRule || 'angle_based',
    timezone: settings.timezone || 'UTC',
    minuteOffsets: {
      fajr: settings.fajrOffsetMinutes ?? 0,
      dhuhr: settings.dhuhrOffsetMinutes ?? 0,
      asr: settings.asrOffsetMinutes ?? 0,
      maghrib: settings.maghribOffsetMinutes ?? 0,
      isha: settings.ishaOffsetMinutes ?? 0
    }
  };
}

export class PrayerService {
  constructor(private readonly supabase?: SupabaseClient) {}

  /**
   * Calculates prayer times directly from explicit parameters.
   */
  public calculateTimes(params: PrayerCalculationParams): PrayerTimesResult {
    return calculatePrayerTimes(params);
  }

  /**
   * Calculates Qibla direction and distance from coordinates.
   */
  public getQibla(latitude: number, longitude: number): QiblaCalculationResult {
    return calculateQibla(latitude, longitude);
  }

  /**
   * Fetches user prayer settings from Supabase if authenticated.
   */
  public async getUserPrayerSettings(userId: string): Promise<UserPrayerSettingsEntity | null> {
    if (!this.supabase) {
      return null;
    }

    const { data, error } = await this.supabase
      .from('user_prayer_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapRowToPrayerSettings(data as UserPrayerSettingsRow);
  }

  /**
   * Upserts user prayer settings in Supabase.
   */
  public async saveUserPrayerSettings(
    settings: Omit<UserPrayerSettingsEntity, 'id' | 'updatedAt'>
  ): Promise<UserPrayerSettingsEntity | null> {
    if (!this.supabase) {
      return null;
    }

    const row: Partial<UserPrayerSettingsRow> = {
      user_id: settings.userId,
      calculation_method: settings.calculationMethod,
      asr_madhhab: settings.asrMadhhab,
      high_latitude_rule: settings.highLatitudeRule,
      latitude: settings.latitude,
      longitude: settings.longitude,
      city_name: settings.cityName,
      timezone: settings.timezone,
      fajr_offset_minutes: settings.fajrOffsetMinutes,
      dhuhr_offset_minutes: settings.dhuhrOffsetMinutes,
      asr_offset_minutes: settings.asrOffsetMinutes,
      maghrib_offset_minutes: settings.maghribOffsetMinutes,
      isha_offset_minutes: settings.ishaOffsetMinutes
    };

    const { data, error } = await this.supabase
      .from('user_prayer_settings')
      .upsert(row, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to save user prayer settings: ${error?.message}`);
    }

    return mapRowToPrayerSettings(data as UserPrayerSettingsRow);
  }
}
