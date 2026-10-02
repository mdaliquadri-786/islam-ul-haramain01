'use client';

/**
 * @file page.tsx
 * @package @islamic/web
 * @description Interactive Prayer Times and Qibla Direction devotional dashboard.
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  calculatePrayerTimes,
  PRESET_CITIES,
  CALCULATION_METHODS,
  PresetCity
} from '../../lib/prayer';
import type {
  CalculationMethod,
  AsrMadhhab,
  HighLatitudeRule,
  PrayerTimesResult
} from '../../lib/prayer';

export default function PrayerTimesPage() {
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

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: '#1f2937' }}>
      {/* Navigation & Header */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: '#059669', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}>
          ← Back to Platform Overview
        </Link>
      </nav>

      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#065f46' }}>
          مواقيت الصلاة واتجاه القبلة
        </h1>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: '#111827' }}>
          Prayer Times & Qibla Direction
        </h2>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '1rem' }}>
          Deterministic, high-precision astronomical calculations with multiple recognized Islamic authorities and madhhab preferences.
        </p>
        <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.375rem', fontSize: '0.9rem', color: '#065f46', fontWeight: 600 }}>
          📍 {cityName} ({latitude.toFixed(4)}°, {longitude.toFixed(4)}°) — {timezone}
        </div>
      </header>

      {/* Preset Cities Selector */}
      <section style={{ marginBottom: '1.75rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#374151' }}>
          Select Global City Preset:
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
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? 600 : 400,
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
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
              border: '1px solid #c7d2fe',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            📍 Use My Location
          </button>
        </div>
        {geoStatus && (
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.35rem' }}>
            {geoStatus}
          </div>
        )}
      </section>

      {/* Configuration Controls Bar */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: '#4b5563' }}>
            Latitude (-90 to 90):
          </label>
          <input
            type="number"
            step="0.0001"
            value={latitude}
            onChange={(e) => {
              setLatitude(parseFloat(e.target.value));
              setSelectedCityId('custom');
            }}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: '#4b5563' }}>
            Longitude (-180 to 180):
          </label>
          <input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(e) => {
              setLongitude(parseFloat(e.target.value));
              setSelectedCityId('custom');
            }}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: '#4b5563' }}>
            Date:
          </label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: '#4b5563' }}>
            Calculation Method:
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as CalculationMethod)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          >
            {Object.values(CALCULATION_METHODS).filter(m => m.id !== 'Custom').map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.fajrAngle}° / {m.ishaAngle ? `${m.ishaAngle}°` : `${m.ishaIntervalMinutes}m`})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: '#4b5563' }}>
            Asr Madhhab:
          </label>
          <select
            value={madhhab}
            onChange={(e) => setMadhhab(e.target.value as AsrMadhhab)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          >
            <option value="standard">Standard (Shafi'i, Maliki, Hanbali — 1x)</option>
            <option value="hanafi">Hanafi (2x shadow)</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem', color: '#4b5563' }}>
            High Latitude Rule:
          </label>
          <select
            value={highLatRule}
            onChange={(e) => setHighLatRule(e.target.value as HighLatitudeRule)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
          >
            <option value="angle_based">Angle Based (Standard Proportion)</option>
            <option value="midnight">Midnight (Half of Night)</option>
            <option value="one_seventh">One Seventh (1/7 of Night)</option>
            <option value="none">None (Standard Altitude)</option>
          </select>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', border: '1px solid #f87171', borderRadius: '0.5rem', color: '#991b1b', marginBottom: '1.5rem' }}>
          <strong>Calculation Error:</strong> {error}
        </div>
      )}

      {result && (
        <>
          {/* Next Prayer Banner */}
          {result.nextPrayer && (
            <div
              style={{
                padding: '1.25rem 1.5rem',
                backgroundColor: '#065f46',
                color: '#ffffff',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
                  Upcoming Prayer
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                  {result.nextPrayer.nameEnglish} ({result.nextPrayer.nameArabic})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                  {result.nextPrayer.formatted}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  in {result.nextPrayer.timeRemainingFormatted}
                </div>
              </div>
            </div>
          )}

          {/* Daily 6 Prayer Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem'
            }}
          >
            {[
              { id: 'fajr', en: 'Fajr', ar: 'الفجر', ur: 'فجر', time: result.formatted.fajr, time12: result.formatted12.fajr },
              { id: 'sunrise', en: 'Sunrise', ar: 'الشروق', ur: 'طلوع آفتاب', time: result.formatted.sunrise, time12: result.formatted12.sunrise },
              { id: 'dhuhr', en: 'Dhuhr', ar: 'الظهر', ur: 'ظہر', time: result.formatted.dhuhr, time12: result.formatted12.dhuhr },
              { id: 'asr', en: 'Asr', ar: 'العصر', ur: 'عصر', time: result.formatted.asr, time12: result.formatted12.asr },
              { id: 'maghrib', en: 'Maghrib', ar: 'المغرب', ur: 'مغرب', time: result.formatted.maghrib, time12: result.formatted12.maghrib },
              { id: 'isha', en: 'Isha', ar: 'العشاء', ur: 'عشاء', time: result.formatted.isha, time12: result.formatted12.isha }
            ].map((p) => {
              const isNext = result.nextPrayer?.name === p.id;
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '1.25rem 1rem',
                    backgroundColor: isNext ? '#ecfdf5' : '#ffffff',
                    border: isNext ? '2px solid #059669' : '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                    boxShadow: isNext ? '0 4px 6px -1px rgba(5, 150, 105, 0.15)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontFamily: 'Amiri, serif', color: isNext ? '#065f46' : '#111827', marginBottom: '0.2rem' }}>
                    {p.ar}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                    {p.en}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                    {p.ur}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isNext ? '#065f46' : '#1f2937' }}>
                    {p.time}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                    {p.time12}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Qibla Direction & Devotional Times Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Qibla Compass Card */}
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827', fontWeight: 600 }}>
                  اتجاه القبلة — Qibla Direction
                </h3>
                <span style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.25rem', fontWeight: 600 }}>
                  {result.qibla.cardinalDirection}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                {/* Visual Dial */}
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: '3px solid #059669',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0fdf4'
                  }}
                >
                  <span style={{ position: 'absolute', top: '4px', fontSize: '0.7rem', fontWeight: 700, color: '#047857' }}>N</span>
                  <div
                    style={{
                      width: '4px',
                      height: '42px',
                      backgroundColor: '#dc2626',
                      borderRadius: '2px',
                      transform: `rotate(${result.qibla.directionDegrees}deg)`,
                      transformOrigin: 'bottom center',
                      marginBottom: '42px'
                    }}
                  />
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: '#111827',
                      borderRadius: '50%',
                      position: 'absolute'
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
                    {result.qibla.directionDegrees.toFixed(2)}°
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: '#4b5563' }}>
                    Great-circle bearing from North
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    Distance to Kaaba: <strong>{result.qibla.distanceKm.toLocaleString()} km</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Extra Devotional Times Card */}
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: '#111827', fontWeight: 600 }}>
                أوقات تطوعية — Devotional Markers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed #e5e7eb' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#374151' }}>الإمساك (Imsak)</span>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Suhoor precaution (10m prior)</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#065f46' }}>
                    {result.formatted.imsak}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px dashed #e5e7eb' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#374151' }}>نصف الليل (Islamic Midnight)</span>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Midway between Sunset & Fajr</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#065f46' }}>
                    {result.formatted.midnight}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#374151' }}>الثلث الأخير (Last Third)</span>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Optimal Qiyam al-Layl / Tahajjud</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#065f46' }}>
                    {result.formatted.lastThird}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Astronomical & Method Provenance */}
          <footer
            style={{
              padding: '1.25rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              fontSize: '0.85rem',
              color: '#4b5563'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#111827' }}>
              Astronomical Metadata & Calculation Provenance:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>Method: <strong>{result.methodName}</strong></div>
              <div>Solar Transit: <strong>{result.formatted.dhuhr}</strong></div>
              <div>Day Length: <strong>{result.solarData.dayDurationHours} hrs</strong></div>
              <div>Night Length: <strong>{result.solarData.nightDurationHours} hrs</strong></div>
              <div>Solar Declination: <strong>{result.solarData.declinationDegrees}°</strong></div>
              <div>Equation of Time: <strong>{result.solarData.equationOfTimeMinutes} min</strong></div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
