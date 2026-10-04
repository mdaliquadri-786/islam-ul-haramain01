import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ISLAM UL HARAMAIN | إسلام الحرمين',
    short_name: 'Haramain',
    description:
      'Authoritative Digital Platform for Sunni Islamic Sciences: Medina Mushaf, Kutub al-Sittah Hadith, Comparative Fiqh, and Precise Prayer Times.',
    start_url: '/',
    display: 'standalone',
    background_color: '#022c22',
    theme_color: '#064e3b',
    orientation: 'portrait-primary',
    dir: 'auto',
    lang: 'ar',
    categories: ['education', 'lifestyle', 'books', 'reference'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'The Holy Quran (القرآن الكريم)',
        short_name: 'Quran',
        description: 'Read Medina Mushaf with Word-by-Word translation and Tajweed',
        url: '/quran',
        icons: [{ src: '/icons/quran-shortcut.png', sizes: '96x96' }],
      },
      {
        name: 'Kutub al-Sittah (الحديث النبوي)',
        short_name: 'Hadith',
        description: 'Explore authentic Hadith collections with narrator chains and gradings',
        url: '/hadith',
        icons: [{ src: '/icons/hadith-shortcut.png', sizes: '96x96' }],
      },
      {
        name: 'Prayer Times (مواقيت الصلاة)',
        short_name: 'Prayer',
        description: 'High-precision astronomical prayer calculation and Qibla direction',
        url: '/prayer-times',
        icons: [{ src: '/icons/prayer-shortcut.png', sizes: '96x96' }],
      },
      {
        name: 'Hisn al-Muslim (حصن المسلم)',
        short_name: 'Adhkar',
        description: 'Authentic daily supplications from Fortress of the Muslim',
        url: '/duas',
        icons: [{ src: '/icons/duas-shortcut.png', sizes: '96x96' }],
      },
    ],
  };
}
