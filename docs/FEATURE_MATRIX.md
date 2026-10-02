# Feature & Capabilities Matrix
**Project:** Production-Grade Sunni Islamic Digital Platform  
**Status:** Phase 0 Baseline Specification  
**Version:** 1.0.0  

---

## 1. Comprehensive Feature Inventory & Platform Parity

| # | Feature Domain | Detailed Capabilities | Web Platform | Flutter Mobile | Offline Capable? |
|---|---|---|:---:|:---:|:---:|
| **1** | **Quran Experience** | Uthmani & Indo-Pak script rendering | ✅ Full | ✅ Full | ✅ Yes (SQLite/Bundled) |
| | | Multiple verified translations (En, Ur) | ✅ Full | ✅ Full | ✅ Yes (Downloaded) |
| | | Word-by-word translation & transliteration | ✅ Full | ✅ Full | ✅ Yes |
| | | Mushaf page mode (Medina 604 pages) | ✅ Full | ✅ Full | ✅ Yes |
| | | Ayah-by-ayah list mode with audio follow | ✅ Full | ✅ Full | ✅ Yes |
| | | Sajdah, Juz, Hizb, Rub, Ruku markers | ✅ Full | ✅ Full | ✅ Yes |
| **2** | **Hadith Library** | Kutub al-Sittah + Muwatta & 40 Hadith | ✅ Full | ✅ Full | ✅ Yes (Cached/Stored) |
| | | Sanad (isnad) and Matn visual separation | ✅ Full | ✅ Full | ✅ Yes |
| | | Authenticity grading badge with scholar attribution | ✅ Full | ✅ Full | ✅ Yes |
| | | In-book & International Darussalam numbering | ✅ Full | ✅ Full | ✅ Yes |
| **3** | **Tafsir Exegesis** | Classical Sunni tafsirs (Ibn Kathir, Sa'di, etc.) | ✅ Full | ✅ Full | ⚠️ On-demand / Cached |
| | | Side-by-side or drawer comparative reading | ✅ Full | ✅ Full | ⚠️ On-demand |
| **4** | **Duas & Adhkar** | Daily Adhkar (Morning, Evening, Sleep, Travel) | ✅ Full | ✅ Full | ✅ Yes (Preloaded) |
| | | Repetition counter with completion tracking | ✅ Full | ✅ Full (Haptic) | ✅ Yes |
| | | Audio pronunciation with transliteration | ✅ Full | ✅ Full | ⚠️ Cached audio |
| **5** | **Islamic Books** | Digitized Islamic books with chapter hierarchy | ✅ Full | ✅ Full | ⚠️ Downloadable EPUB/PDF |
| | | High-fidelity e-Reader with typography controls | ✅ Full | ✅ Full | ✅ Yes (Once loaded) |
| **6** | **Knowledge Articles**| Scholarly vetted articles with tag categorization | ✅ Full | ✅ Full | ⚠️ Online / Cached |
| **7** | **Search Engine** | Exact citation jump (e.g. "2:255", "Bukhari 1") | ✅ Instant | ✅ Instant | ✅ Local indexing |
| | | Arabic diacritic-tolerant full-text search | ✅ Server FTS | ✅ Local FTS5 | ✅ Hybrid |
| | | Cross-collection search (Quran, Hadith, Duas) | ✅ Server FTS | ✅ Server/Local | ⚠️ Partial offline |
| **8** | **Prayer Times** | Offline astronomical calculation engine | ✅ Full | ✅ Full | ✅ 100% Offline |
| | | Multiple conventions (MWL, ISNA, Umm al-Qura, Karachi) | ✅ Full | ✅ Full | ✅ 100% Offline |
| | | Hanafi and Standard (Shafi'i/Maliki/Hanbali) Asr methods | ✅ Full | ✅ Full | ✅ 100% Offline |
| | | High-latitude adjustment options | ✅ Full | ✅ Full | ✅ 100% Offline |
| | | Visual daily countdown & prayer progression bar | ✅ Full | ✅ Full | ✅ 100% Offline |
| **9** | **Qibla Direction** | Mathematical bearing to Kaaba from coordinates | ✅ Full | ✅ Full | ✅ 100% Offline |
| | | Sensor-fusion 3D compass with device magnetometer | ⚠️ Basic (API) | ✅ Full 3D Gyro | ✅ 100% Offline |
| **10**| **Islamic Calendar** | Hijri to Gregorian bidirectional conversion | ✅ Full | ✅ Full | ✅ 100% Offline |
| | | Significant Islamic dates & events display | ✅ Full | ✅ Full | ✅ 100% Offline |
| | | Manual day offset adjustment (-2 to +2 days) | ✅ Full | ✅ Full | ✅ 100% Offline |
| **11**| **Digital Tasbeeh** | Interactive tap counter with target milestones | ✅ Full | ✅ Full | ✅ 100% Offline |
| | | Haptic vibration feedback on mobile | ❌ N/A | ✅ Full Haptics | ✅ 100% Offline |
| | | Preset dhikr phrases & custom user dhikr | ✅ Full | ✅ Full | ✅ 100% Offline |
| **12**| **Audio Suite** | Multiple world-renowned Qaris (Alafasy, Husary, etc.)| ✅ Streaming | ✅ Stream + Download| ⚠️ Downloaded surahs |
| | | Word and ayah highlighting synchronized with voice | ✅ Full | ✅ Full | ✅ Yes (If cached) |
| | | Background audio playback with lock screen controls| ⚠️ MediaSession | ✅ Full Native | ✅ Background Service |
| **13**| **Personal Library**| Bookmarks with custom tags and folders | ✅ Full | ✅ Full | ✅ Local + Cloud Sync |
| | | Reading history & last-read position resume | ✅ Full | ✅ Full | ✅ Local + Cloud Sync |
| | | Private reflection notes on verses & hadiths | ✅ Full | ✅ Full | ✅ Local + Cloud Sync |
| | | Khatmah Quran completion planner | ✅ Full | ✅ Full | ✅ Local + Cloud Sync |
| **14**| **Notifications** | Scheduled prayer/Adhan alerts | ⚠️ Browser Push | ✅ Local OS Alarms | ✅ Mobile 100% Offline |
| | | Daily ayah/dua of the day notifications | ✅ Push/Email | ✅ Local Push | ⚠️ Remote triggers |
| **15**| **Admin & CMS** | Multi-step Scholar Review Workflow portal | ✅ Web Desktop | ❌ N/A (Admin Web) | ❌ Online Only |
| | | Content audit trail and cryptographic sign-off | ✅ Web Desktop | ❌ N/A | ❌ Online Only |

---

## 2. Localization & Internationalization Matrix

| Capability | Arabic (`ar`) | English (`en`) | Urdu (`ur`) | Future Locales (`id`, `tr`, `fr`) |
|---|---|---|---|---|
| **Text Direction** | Right-to-Left (RTL) | Left-to-Right (LTR) | Right-to-Left (RTL) | LTR / RTL depending on locale |
| **Primary UI Font** | IBM Plex Sans Arabic / Noto Naskh | Inter / System UI | Noto Nastaliq Urdu | Inter / Noto Sans |
| **Quran Mushaf Font** | KFGQPC Uthmanic Medina Font | Latin Transliteration | Indo-Pak Nastaliq / Naskh | Latin / Local transliteration |
| **Quran Translation** | Tafsir Muyassar / Jalalayn | Saheeh International | Fateh Muhammad Jalandhari | Indonesian Ministry of Religious Affairs |
| **Hadith Translation** | Original Arabic Matn & Sanad | Darussalam English | Darussalam Urdu | Vetted translations |
| **Prayer Names** | الفجر، الظهر، العصر، المغرب، العشاء | Fajr, Dhuhr, Asr, Maghrib, Isha | فجر، ظہر، عصر، مغرب، عشاء | Localized names |
| **Search Stemming** | Arabic stemmer (`arabic` config) | English Porter stemmer | Trigram / Substring | Localized stemmers |

---

## 3. User Role & Permissions Matrix (RBAC)

| Role | Browse Scripture & Devotional Tools | Save Bookmarks & Notes | Submit Article / Content Draft | Review & Verify Content | Publish Approved Content | Administer Users & Roles |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Guest (Unauthenticated)** | ✅ Read Only | ❌ (Local storage only) | ❌ | ❌ | ❌ | ❌ |
| **Registered User** | ✅ Full | ✅ Cloud Synced | ❌ | ❌ | ❌ | ❌ |
| **Content Contributor** | ✅ Full | ✅ Cloud Synced | ✅ Drafts Only | ❌ | ❌ | ❌ |
| **Translator** | ✅ Full | ✅ Cloud Synced | ✅ Translation Drafts | ❌ | ❌ | ❌ |
| **Scholar Reviewer** | ✅ Full | ✅ Cloud Synced | ✅ Drafts & Notes | ✅ Sign-off / Review | ❌ (Requires Admin/Publish) | ❌ |
| **Content Admin** | ✅ Full | ✅ Cloud Synced | ✅ All Drafts | ✅ Inspect Audits | ✅ Publish Approved | ❌ |
| **Super Admin** | ✅ Full | ✅ Cloud Synced | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full System Control |
