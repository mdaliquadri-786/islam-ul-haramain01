'use client';

/**
 * @file page.tsx
 * @package @islamic/web
 * @description Localized Prayer Times and Qibla Direction devotional dashboard.
 * Milestone: M3.4 — Web MVP UI Integration & Internationalization
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  calculatePrayerTimes,
  PRESET_CITIES,
  CALCULATION_METHODS,
  PresetCity
} from '@/lib/prayer';
import type {
  CalculationMethod,
  AsrMadhhab,
  HighLatitudeRule,
  PrayerTimesResult
} from '@/lib/prayer';
import { getDictionary, isSupportedLocale, DEFAULT_LOCALE, type Locale } from '@islamic/ui';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function LocalizedPrayerTimesPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const localeStr = resolvedParams?.locale || DEFAULT_LOCALE;
  const typedLocale: Locale = isSupportedLocale(localeStr) ? localeStr : DEFAULT_LOCALE;
  const dict = getDictionary(typedLocale);

  const [selectedCityId, setSelectedCityId] = useState<string>('makkah');
  const [latitude, setLatitude] = useState<number>(21.4225);
  const [longitude, setLongitude] = useState<number>(39.8262);
  const [cityName, setCityName] = useState<string>('Makkah al-Mukarramah');
  const [timezone, setTimezone] = useState<string>('Asia/Riyadh');
  const [dateStr, setDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [method, setMethod] = useState<CalculationMethod>('UmmAlQura');
  const [madhhab, setMadhhab] = useState<AsrMadhhab>('standard');
  const [highLatRule, setHighLatRule] = useState<HighLatitudeRule>('angle_based');
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  // Apply City Preset
  const handleSelectCity = (city: PresetCity) => {
    setSelectedCityId(city.id);
    setLatitude(city.coordinates.latitude);
    setLongitude(city.coordinates.longitude);
    setCityName(city.name);
    setTimezone(city.timezone);
    setMethod(city.defaultMethod);
    setMadhhab(city.defaultMadhhab);
  };

  // Browser Geolocation
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }
    setGeoStatus('Requesting current location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        setLatitude(lat);
        setLongitude(lng);
        setSelectedCityId('custom');
        setCityName(`Location (${lat}, ${lng})`);
        const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        setTimezone(localTz);
        setGeoStatus('Location updated successfully.');
      },
      (err) => {
        setGeoStatus(`Location access denied or unavailable: ${err.message}`);
      }
    );
  };

  // Compute Prayer Times and Qibla deterministically in-memory
  const calculationResult: { result: PrayerTimesResult | null; error: string | null } = useMemo(() => {
    try {
      const parts = dateStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

      const res = calculatePrayerTimes({
        coordinates: { latitude, longitude },
        date: dateObj,
        method,
        madhhab,
        highLatitudeRule: highLatRule,
        timezone
      });

      return { result: res, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Calculation error';
      return { result: null, error: msg };
    }
  }, [latitude, longitude, dateStr, method, madhhab, highLatRule, timezone]);

  const { result, error } = calculationResult;

  const prayerNamesMap = {
    fajr: dict.prayer.fajr,
    sunrise: dict.prayer.sunrise,
    dhuhr: dict.prayer.dhuhr,
    asr: dict.prayer.asr,
    maghrib: dict.prayer.maghrib,
    isha: dict.prayer.isha
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem', color: '#1f2937' }}>
      {/* Navigation Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link href={`/${typedLocale}`} style={{ color: '#059669', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          ← {dict.nav.home}
        </Link>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: '#065f46' }}>
          {dict.nav.prayerTimes}
        </h1>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '1rem' }}>
          Deterministic, sub-millisecond astronomical calculations with multiple recognized Sunni authorities.
        </p>
        <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.375rem', fontSize: '0.9rem', color: '#065f46', fontWeight: 600 }}>
          📍 {cityName} ({latitude.toFixed(4)}°, {longitude.toFixed(4)}°) — {timezone}
        </div>
      </header>

      {/* Preset Cities Selector */}
      <section style={{ marginBottom: '1.75rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#374151', fontSize: '0.9rem' }}>
          {dict.prayer.selectCity}:
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PRESET_CITIES.map((c) => {
            const isSelected = selectedCityId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectCity(c)}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? '#059669' : '#f3f4f6',
                  color: isSelected ? '#ffffff' : '#374151',
                  border: isSelected ? '1px solid #047857' : '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                {c.name}
              </button>
            );
          })}
          <button
            type="button"
            onClick={handleUseLocation}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            🎯 Use My Location
          </button>
        </div>
        {geoStatus && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
            {geoStatus}
          </div>
        )}
      </section>

      {/* Calculation Controls */}
      <section style={{ backgroundColor: '#f9fafb', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>
              Date
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>
              {dict.prayer.calculationMethod}
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as CalculationMethod)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            >
              {Object.values(CALCULATION_METHODS).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>
              {dict.prayer.asrMadhhab}
            </label>
            <select
              value={madhhab}
              onChange={(e) => setMadhhab(e.target.value as AsrMadhhab)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            >
              <option value="standard">{dict.prayer.standard}</option>
              <option value="hanafi">{dict.prayer.hanafi}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.25rem' }}>
              {dict.prayer.highLatitudeRule}
            </label>
            <select
              value={highLatRule}
              onChange={(e) => setHighLatRule(e.target.value as HighLatitudeRule)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            >
              <option value="angle_based">Angle-Based (1/60th per deg)</option>
              <option value="midnight">Midnight (Middle of Night)</option>
              <option value="one_seventh">One-Seventh (1/7th Night)</option>
              <option value="none">None (Strict Solar Horizon)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Prayer Times Dashboard Grid */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', color: '#991b1b', marginBottom: '1.5rem' }}>
          Error calculating times: {error}
        </div>
      )}

      {result && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Daily Timetable Card */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
              Daily Prayers ({result.date})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((key) => {
                const isNext = result.nextPrayer?.name === key;
                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '0.375rem',
                      backgroundColor: isNext ? '#ecfdf5' : '#f9fafb',
                      border: isNext ? '1px solid #a7f3d0' : '1px solid #f3f4f6'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: isNext ? 700 : 500, color: isNext ? '#065f46' : '#374151', textTransform: 'capitalize' }}>
                        {prayerNamesMap[key]}
                      </span>
                      {isNext && (
                        <span style={{ fontSize: '0.7rem', backgroundColor: '#059669', color: '#ffffff', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 600 }}>
                          {dict.prayer.nextPrayer}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace', color: isNext ? '#065f46' : '#111827' }}>
                      {result.formatted[key]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qibla Direction & Devotional Milestones Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Qibla Card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                🧭 {dict.prayer.qiblaBearing}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '3px solid #059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ecfdf5',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      transform: `rotate(${result.qibla.directionDegrees}deg)`,
                      fontSize: '1.75rem',
                      lineHeight: 1,
                      transition: 'transform 0.5s ease-in-out'
                    }}
                  >
                    ⬆️
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#065f46', fontFamily: 'monospace' }}>
                    {result.qibla.directionDegrees.toFixed(1)}°
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                    Direction: <strong>{result.qibla.cardinalDirection}</strong>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Distance to Kaaba: <strong>{Math.round(result.qibla.distanceKm).toLocaleString()} km</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Devotional Milestones */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#111827' }}>
                Devotional Milestones
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ padding: '0.6rem 0.4rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Imsak</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{result.formatted.imsak || '—'}</div>
                </div>
                <div style={{ padding: '0.6rem 0.4rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Midnight</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{result.formatted.midnight || '—'}</div>
                </div>
                <div style={{ padding: '0.6rem 0.4rem', backgroundColor: '#f8fafc', borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Last Third</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{result.formatted.lastThird || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
