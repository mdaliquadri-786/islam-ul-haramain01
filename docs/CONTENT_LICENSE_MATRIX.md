# Content Licensing & Intellectual Property Matrix
**Project:** Production-Grade Sunni Islamic Digital Platform  
**Status:** Phase 0 Baseline Specification (Revision 1)  
**Version:** 1.1.0  

---

## Phase 0 Architecture Review — Revision 1

This revision incorporates the following legal and content licensing safeguards:

1. **Strict Audio Asset Verification Mandate:**
   * **Reversal of Presumption:** Public availability of audio files on the internet (e.g., EveryAyah, Quran Central, Internet Archive) **does not** automatically confer redistribution, streaming, or re-hosting rights.
   * **Inclusion Prerequisite:** No audio recording will be integrated, stored, or distributed on the platform unless its redistribution rights have been verified and legally cleared.
   * **Mandatory Audio Provenance Record:** Every audio asset in the system must explicitly document:
     1. Source URL / Archive Identity.
     2. Copyright Holder / Recording Entity (where known).
     3. License / Formal Permission Type.
     4. Allowed Usage Scope (e.g., Non-commercial digital streaming, mobile offline caching).
     5. Attribution Requirement (exact wording required by the reciter/producer).
     6. Redistribution Status (`verified_permissible`, `unverified_pending`, `restricted_takedown`).
     7. Import Date.
     8. Removal / Takedown Contact & Procedure.

2. **Disciplined MVP Dataset Scope:**
   * **MVP Ingestions (Fully Permissible & Cleared):**
     * Quran Arabic Text: King Fahd Complex (KFGQPC) Medina Mushaf & Tanzil Project.
     * English Translation: Saheeh International (Abul-Qasim Publishing House / Verified for non-commercial distribution with attribution; commercial rights reserved).
     * Urdu Translation: Maulana Fateh Muhammad Jalandhari (Verified for non-commercial distribution under Tanzil terms; worldwide public domain unresolved pending author death registry record).
     * Hadith Arabic Text: Kutub al-Sittah classical compilations (Public Domain).
     * Duas: *Hisn al-Muslim* (Dedicated Islamic Waqf for free propagation).
   * **Deferred Ingestions (Requiring Commercial / Institutional Licensing):**
     * Dr. Mustafa Khattab's *The Clear Quran* (Book of Signs Foundation copyright).
     * Darussalam published English translations and commentary volumes.
     * Commercial recitation recordings produced by modern record labels or broadcasting authorities.

---

## 1. Verified Asset Licensing Register

| Asset Category | Specific Work / Dataset | Legal Status | Permissible Use Terms | Redistribution Status | MVP Inclusion? |
|---|---|---|---|:---:|:---:|
| **Quran Arabic Text** | King Fahd Complex (KFGQPC) Medina Mushaf | Public Royal Grant | Free non-commercial distribution; zero textual alteration. | `verified_permissible` | **YES (MVP)** |
| **Quran Arabic Text** | Tanzil Project (v1.1, Uthmani Medina Mushaf) | Creative Commons Attribution 3.0 (CC-BY 3.0) | Verbatim non-commercial & commercial digital distribution; textual modification strictly prohibited; mandatory attribution & link to tanzil.net. | `verified_permissible` | **YES (M2.1 Canonical)** |
| **Quran Search Text** | Tanzil Project (v1.1, Simple Clean) | Creative Commons Attribution 3.0 (CC-BY 3.0) | Derived normalized plain text for full-text search indexing; clearly isolated from canonical text. | `verified_permissible` | **YES (M2.1 Search)** |
| **Quran Metadata** | Tanzil Project (v1.0, Structural Metadata) | Creative Commons Attribution 3.0 (CC-BY 3.0) | Canonical 114 Surahs, revelation order, ayahs counts, juz/hizb/manzil/page mapping. | `verified_permissible` | **YES (M2.1 Metadata)** |
| **Quran Translation (En)** | Saheeh International | Copyright © 1997 Abul-Qasim Publishing House; Distributed via Tanzil | Non-commercial digital propagation; zero textual alteration; mandatory attribution; commercial use unpermitted without publisher license. | `verified_for_non_commercial_use` | **YES (M2.2 Ingested)** |
| **Quran Translation (En)** | The Clear Quran (Dr. Mustafa Khattab) | Copyright © Book of Signs Foundation | Commercial rights reserved; requires formal license. | `unverified_pending` | **DEFERRED (Phase 4+)** |
| **Quran Translation (En)** | Marmaduke Pickthall (1930) | Public Domain | Globally public domain. | `verified_permissible` | Optional (MVP) |
| **Quran Translation (Ur)** | Maulana Fateh Muhammad Jalandhari | Classical South Asian publication (c. 1900); Tanzil non-commercial terms | Non-commercial digital propagation; zero textual alteration; mandatory attribution; worldwide public domain unresolved pending author death registry record. | `verified_for_non_commercial_use` | **YES (M2.2 Ingested)** |
| **Hadith Arabic Texts** | Kutub al-Sittah classical compilations | Public Domain | 3rd-century Hijri heritage; public domain. | `verified_permissible` | **YES (MVP)** |
| **Hadith Translations (En)** | Open Academic & Public Domain translations | Public Domain / CC | Verified public domain translations. | `verified_permissible` | **YES (MVP)** |
| **Hadith Gradings** | Ahkam of Al-Albani & Shu'ayb al-Arna'ut | Factual Scholarly Evaluations | Factual historical assessments; cited with provenance. | `verified_permissible` | **YES (MVP)** |
| **Duas & Adhkar** | *Hisn al-Muslim* (Shaykh Sa'id al-Qahtani) | Public Islamic Waqf | Dedicated by author for free non-commercial propagation. | `verified_permissible` | **YES (MVP)** |
| **Classical Tafsir (Ar)** | Tafsir Ibn Kathir, Al-Tabari, Al-Qurtubi | Public Domain | Classical texts; public domain. | `verified_permissible` | Phase 4+ |
| **Audio Recitations** | Sheikh Mishary Alafasy, Sheikh Al-Husary, Sheikh Abdul Basit | Mixed / Public Islamic Distribution | Ingestion subject to reciter-by-reciter rights clearance. | `unverified_pending` (audited per asset) | **DEFERRED to Phase 4** |

### Tanzil Quran Text (Uthmani Script, Version 1.1)
- **Source:** Tanzil Project ([https://tanzil.net](https://tanzil.net))
- **Documentation:** Tanzil Quran Text Documentation ([https://tanzil.net/docs/quran_text](https://tanzil.net/docs/quran_text))
- **File:** `quran-uthmani.xml`
- **Release / Version:** Version 1.1 (February 2021)
- **Copyright:** Copyright (C) 2007-2026 Tanzil Project
- **License:** Creative Commons Attribution 3.0 Unported (CC-BY 3.0)
- **Mandatory Attribution Notice:**
  > "Tanzil Quran Text (Uthmani, Version 1.1) © 2007-2026 Tanzil Project. Licensed under CC-BY 3.0. Source: https://tanzil.net"
- **Terms of Use:**
  1. Permission is granted to copy and distribute verbatim copies of this text, but changing it is strictly prohibited.
  2. This copyright notice shall be included in all verbatim copies of the text, and shall be reproduced appropriately in all files derived from or containing a substantial portion of this text.
  3. Clear attribution to Tanzil Project and a direct link to `tanzil.net` must be maintained.
- **SHA-256 Hash:** `203f0f1bf3158b1e5be4ab9f8f6870e570aab6d9a626fe6192a70b75d4afe0fd`

### Tanzil Quran Structural Metadata (Version 1.0)
- **Source:** Tanzil Project ([https://tanzil.net](https://tanzil.net))
- **File:** `quran-data.xml`
- **Release / Version:** Version 1.0
- **Copyright:** Copyright (C) 2008-2009 Tanzil.info
- **License:** Creative Commons Attribution (CC-BY)
- **Contents:** Canonical 114 Surahs metadata, revelation order, ayahs counts, Juz (1-30), Hizb (1-60), Rub quarters (1-240), Medina Mushaf Pages (1-604), Sajda locations.
- **SHA-256 Hash:** `8867c1d88191472adec9db694b3cd9f135b1a2ef580574d32cf888dcb22c5c7a`

### Tanzil Reference Clean Search Text (Version 1.1)
- **Source:** Tanzil Project ([https://tanzil.net](https://tanzil.net))
- **File:** `quran-simple-clean.xml`
- **Release / Version:** Version 1.1
- **Copyright:** Copyright (C) 2007-2026 Tanzil Project
- **License:** Creative Commons Attribution 3.0 Unported (CC-BY 3.0)
- **SHA-256 Hash:** `140787b7c399b11d54bfa72c237075916084232efa8a4cddf704cc8a2a74b1fe`

### Saheeh International Quran Translation (English, Version April 24, 2011)
- **File Ingested:** `packages/database/data/quran/translations/en.sahih.txt`
- **File Size:** 898,049 bytes
- **Raw Source File SHA-256 Hash:** `a1778a1a56695d9b59ae910809ec46d9f4a55f05961de51cd56e6ebcf9040883`
- **Canonical Dataset SHA-256 Hash:** `5ef2da921391e06628239b768e8389ac8690e2065b8d12f1289cd2ef3a1a261e`

#### A & B. Authoritative Sources & Rights Metadata:
1. **Underlying Publication:**
   - **Title:** *The Qur'ān: Arabic Text with Corresponding English Meanings*
   - **Translators:** Emily Assami (Umm Muhammad), Mary Kennedy, Amatullah Bantley (Saheeh International)
   - **Original Publisher:** Abul-Qasim Publishing House (دار أبو القاسم), Riyadh / Jeddah, Saudi Arabia (First Edition 1997). ISBN: 9960-792-63-3 / 978-9960-792-63-6. (Cataloged by King Fahd National Library).
   - **Copyright Statement:** "Copyright © 1997 Abul-Qasim Publishing House. All rights reserved. No part of this publication may be reproduced, stored in a retrieval system or transmitted in any form or by any means — electronic, mechanical, photocopying, recording or otherwise — without written permission from the publisher."
2. **Digital Distribution Source:**
   - **Source URL:** [https://tanzil.net/trans/](https://tanzil.net/trans/)
   - **Source Title:** Tanzil Quran Translations Repository
   - **Tanzil Edition ID:** `en.sahih`
   - **Tanzil Version Date:** April 24, 2011
   - **Tanzil Resource Documentation:** [https://tanzil.net/docs/translations_resources](https://tanzil.net/docs/translations_resources)
   - **Tanzil Terms of Use Wording:** *"The translations provided at this page are for non-commercial purposes only. If used otherwise, you need to obtain necessary permission from the translator or the publisher. If you are using more than three of the following translations in a website or application, we require you to put a link back to this page to make sure that subsequent users have access to the latest updates."*

#### C. Separation of Rights & Permission Scope:
1. **Tanzil's Hosted Resource Terms:** Non-commercial purposes only ([https://tanzil.net/trans/](https://tanzil.net/trans/)). Tanzil's CC-BY 3.0 license applies *only* to Tanzil Quran Arabic text, *not* to hosted translations.
2. **Underlying Publisher Copyright:** Standard copyright is retained by Abul-Qasim Publishing House ("All rights reserved"). No public domain dedication or general Creative Commons license was ever issued.
3. **Permission to Redistribute Exact Tanzil File:** Permissible for **non-commercial digital distribution and Islamic propagation** under Tanzil's terms and publisher da'wah practice.
4. **Commercial Redistribution Scope:** **NOT ESTABLISHED / UNLICENSED.** Commercial sale, bundling into fee-based software, or commercial exploitation is not permitted without explicit written agreement from Abul-Qasim Publishing House.
5. **Modification Restrictions:** **STRICTLY PROHIBITED.** Text must remain completely unedited, preserving verbatim English meanings and bracketed clarifications.
6. **Mandatory Attribution Notice:**
   > "Translation of the Meanings of the Noble Quran by Saheeh International © 1997 Abul-Qasim Publishing House. Verified text source: Tanzil Project (https://tanzil.net)."

#### D & I. Audit Classification:
- **Redistribution Status:** `verified_for_non_commercial_use`
- **Supported Scope:** Non-commercial web display, educational study, non-commercial digital propagation.
- **Unresolved Scope:** Commercial redistribution (requires separate publisher licensing).

---

### Maulana Fateh Muhammad Jalandhari Quran Translation (Urdu, Version December 24, 2010)
- **File Ingested:** `packages/database/data/quran/translations/ur.jalandhry.txt`
- **File Size:** 1,450,376 bytes
- **Raw Source File SHA-256 Hash:** `c7e982b49b5e6f275559985caaf24f5e0136950f73f50f1a6c6f6a5281617c6a`
- **Canonical Dataset SHA-256 Hash:** `bae6ce425ff4873f756a21e3a3540bf8ed43b5d888f82ab830843e7f57c7628f`

#### A & B. Authoritative Sources & Rights Metadata:
1. **Historical Work & Authorship:**
   - **Title:** *Fateh-ul-Hamid* (فتح الحمید) / *Tarjuma Quran Majeed* (قرآن مجید با محاورہ اردو ترجمہ)
   - **Translator:** Maulana Fateh Muhammad Jalandhari (مولانا فتح محمد جالندھری), born 1864 in Tanda, Hoshiarpur District, Punjab, British India. Scholar, linguist, and author of Punjab curriculum textbooks (*Mabadi al-Qawa'id*, *Afdal al-Qawa'id*).
   - **Original Publication Date:** Circa 1900 (Lahore / Amritsar / South Asia).
   - **Biographical Clarification & Conflation Warning:** Online casual databases (e.g. Urdu Wikipedia) frequently conflate Maulana Fateh Muhammad Jalandhari with poet Abu al-Asar Hafeez Jalandhari (1900–1982, author of the Pakistani national anthem). Maulana Fateh Muhammad Jalandhari is the 19th-century educator born in 1864 who published his translation c. 1900.
   - **Death Record Documentation:** While Maulana Jalandhari lived in the late 19th / early 20th century, a primary certified death certificate or civil registry record proving his exact year of death is unindexed in accessible national archives.
2. **Digital Distribution Source:**
   - **Source URL:** [https://tanzil.net/trans/](https://tanzil.net/trans/)
   - **Source Title:** Tanzil Quran Translations Repository
   - **Tanzil Edition ID:** `ur.jalandhry`
   - **Tanzil Version Date:** December 24, 2010
   - **Tanzil Terms of Use Wording:** *"The translations provided at this page are for non-commercial purposes only. If used otherwise, you need to obtain necessary permission from the translator or the publisher."*

#### C. Separation of Rights & Permission Scope:
1. **Tanzil's Hosted Resource Terms:** Non-commercial purposes only ([https://tanzil.net/trans/](https://tanzil.net/trans/)).
2. **Underlying Copyright / Public Domain Status:** 
   - In the United States, works published foreign-wide prior to 1929 are in the public domain (17 U.S.C. § 104A).
   - However, under Berne Convention jurisdictions (requiring Author's Death + 50 to 70 years, such as Pakistan Copyright Ordinance 1962 s. 18 or Indian Copyright Act 1957 s. 22), worldwide public domain expiry cannot be definitively claimed without an authoritative primary death registry record.
   - Therefore, per strict licensing governance, this work is **not** unconditionally labeled "Public Domain".
3. **Permission to Redistribute Exact Tanzil File:** Permissible for **non-commercial digital distribution** under Tanzil's hosted terms.
4. **Commercial Redistribution Scope:** **NOT ESTABLISHED / UNRESOLVED.** Commercial exploitation cannot be legally cleared on a public domain theory until primary documentary confirmation of the translator's death year is established.
5. **Modification Restrictions:** **STRICTLY PROHIBITED.** Text must remain verbatim to preserve historical and religious fidelity.
6. **Mandatory Attribution Notice:**
   > "Urdu Translation of the Holy Quran by Maulana Fateh Muhammad Jalandhari. Verified text source: Tanzil Project (https://tanzil.net)."

#### D & I. Audit Classification:
- **Redistribution Status:** `verified_for_non_commercial_use`
- **Supported Scope:** Non-commercial web display, devotional reading, educational study.
- **Unresolved Scope:** Worldwide Public Domain confirmation and commercial redistribution (requires official death registry archival proof).

---

### Kutub al-Sittah Hadith Collections Engine (M2.3 Ingested)

#### 1. Canonical Arabic Hadith Compilations
- **Works Included:**
  1. *Sahih al-Bukhari* — Imam Muhammad ibn Isma'il al-Bukhari (d. 256 AH / 870 CE)
  2. *Sahih Muslim* — Imam Muslim ibn al-Hajjaj an-Naysaburi (d. 261 AH / 875 CE)
  3. *Sunan Abi Dawud* — Imam Abu Dawud Sulayman ibn al-Ash'ath as-Sijistani (d. 275 AH / 889 CE)
  4. *Jami' at-Tirmidhi* — Imam Muhammad ibn 'Isa at-Tirmidhi (d. 279 AH / 892 CE)
  5. *Sunan an-Nasa'i (Al-Mujtaba)* — Imam Ahmad ibn Shu'ayb an-Nasa'i (d. 303 AH / 915 CE)
  6. *Sunan Ibn Majah* — Imam Muhammad ibn Yazid Ibn Majah (d. 273 AH / 887 CE)
- **Legal Status:** **Public Domain Worldwide.**
- **Rationale:** Classical 3rd-century Hijri compilations; authorial protection has lapsed centuries ago under every copyright jurisdiction on Earth.
- **Integrity Requirement:** Verbatim preservation; each narration is protected by an immutable SHA-256 cryptographic checksum verified at runtime and database trigger levels.
- **Redistribution Status:** `verified_permissible`

#### 2. English Translations of Kutub al-Sittah
- **Translators / Digitizers:**
  - *Sahih al-Bukhari:* Dr. Muhammad Muhsin Khan (open da'wah distribution).
  - *Sahih Muslim:* Abdul Hamid Siddiqui (open Islamic educational archive).
  - *Sunan Compendiums:* Open digital collections hosted and indexed via Sunnah.com and IIUM archives.
- **Usage Scope:** Non-commercial digital display, devotional reading, educational research. Text is kept unaltered.
- **Redistribution Status:** `verified_for_non_commercial_use`

#### 3. Hadith Authenticity Gradings (Ahkam al-Hadith)
- **Evaluating Scholars / Institutions:**
  - Shaykh Muhammad Nasir al-Din al-Albani (d. 1420 AH / 1999 CE) — *Sahih wa Da'if Sunan Abi Dawud*, *Sahih wa Da'if al-Tirmidhi*, *Sahih wa Da'if Sunan an-Nasa'i*, *Sahih wa Da'if Sunan Ibn Majah*.
  - Shaykh Shu'ayb al-Arna'ut (d. 1438 AH / 2016 CE) — *Tahqiq Sunan Abi Dawud*, *Tahqiq Sunan Ibn Majah*, *Tahqiq Musnad Ahmad*.
  - Shaykh Ahmad Muhammad Shakir (d. 1377 AH / 1958 CE) — *Tahqiq Jami' at-Tirmidhi*, *Tahqiq Musnad Ahmad*.
  - Shaykh Hafiz Zubair Ali Zai (d. 1435 AH / 2013 CE) — Critical verification of Kutub al-Sittah for Darussalam Publishers.
  - Darussalam Research Committee (Riyadh) — Canonical print edition verification.
- **Legal Character:** Factual scholarly determinations and religious evaluations of narrator chains. Not subject to copyright restrictions as creative text, but cited with precise scholarly provenance and attribution as required by academic integrity and religious ethics.
- **Attribution Policy:** Every grading displayed in the platform explicitly attributes the scholar's full name, grade level (`sahih`, `hasan`, `daif`, `mawdu`), Arabic classification, and reference source.
- **Redistribution Status:** `verified_permissible`

### Hisn al-Muslim (حصن المسلم من أذكار الكتاب والسنة) (M2.4 Ingested)
- **Author:** Dr. Sa'id ibn Ali ibn Wahf al-Qahtani (د. سعيد بن علي بن وهف القحطاني) (1371–1440 AH / 1951–2018 CE).
- **Original Arabic Edition:** *Hisn al-Muslim min Adhkar al-Kitab wa al-Sunnah* (Riyadh, Saudi Arabia).
- **Legal Status:** Dedicated Islamic Waqf (وقف لله تعالى). The author explicitly dedicated all rights to the Muslim Ummah for free reproduction, translation, print, and non-commercial digital propagation.
- **English Translation:** Standard open community & Darussalam-aligned *Fortress of the Muslim* translation.
- **Canonical Dataset SHA-256 Hash:** `dd490f5fd26c959fb3487686df152cea22ea6757a38ee407dcdd34bb0b11c357`
- **Dataset Structure:** 132 categories, 268 authentic supplications with full tashkeel, Romanized transliteration, English translation, verified repetition counts, and Quran/Hadith citations.
- **Usage Scope:** Free public devotional reading, offline caching, and non-commercial Islamic education.
- **Redistribution Status:** `verified_permissible`

---

## 2. Audio Redistribution & Licensing Schema

Every audio track stored in Supabase Storage and served via CDN is cataloged in `audio_assets` with full provenance:

```sql
-- Enforced via Database Check Constraint
ALTER TABLE audio_assets ADD CONSTRAINT chk_redistribution_status 
CHECK (redistribution_status IN ('verified_permissible', 'unverified_pending', 'restricted_takedown'));
```

### Verification Criteria Before Activation (`verified_permissible`):
1. Written confirmation of public domain, creative commons, or open waqf dedication from the producer or copyright holder.
2. Verification that the audio file is not watermarked with commercial broadcast station identifiers.
3. Verification that non-commercial streaming does not violate the hosting rights of the original archive.
4. Direct attribution text included in the playback UI (e.g., "Recitation by Sheikh Mahmud Khalil Al-Husary, distributed under Islamic Waqf open audio initiative").

---

## 3. Copyright Compliance & Takedown Protocol

1. **Designated Legal Contact:** A dedicated email channel (`legal@islamicplatform.org`) is published in the footer of the web application and mobile application settings.
2. **Immediate Quarantine Workflow:**
   * Upon receipt of a plausible copyright infringement notice regarding any modern translation, audio recording, or book chapter:
   * The asset's database status is immediately set to `restricted_takedown`.
   * Edge CDN caches for that asset are purged within 1 hour.
   * The legal team reviews the claim; if valid, the asset is permanently purged from storage buckets and removed from the active catalog.
