# Fiqh Methodology & Multi-Madhhab Architecture
**Platform:** ISLAM UL HARAMAIN (إسلام الحرمين)  
**Document Type:** Jurisprudential Governance & Data Architecture Standard  
**Document Version:** 2.0.0 (Revised Specification)  
**Authority:** Approved by Project Owner  
**Date:** September 2026 / Rabi' al-Awwal 1448 AH  

---

## 1. Tripartite Governance Framework

All jurisprudential documentation, schema designs, and fatwa presentations must distinguish:
* **Category A (Owner Approved):** Core jurisprudential scope and methodological decisions selected by the project owner.
* **Category B (Requires Scholarly Verification):** Specific legal rulings, attributions to Imams, verification of *Mu'tamad* positions, and comparative fatwas that must be sourced from verified primary manuals before publication.
* **Category C (Architectural Governance Rules):** Technical systems, profile routing, schema constraints, and verification protocols.

---

## 2. Jurisprudential Foundations & Multi-Madhhab Scope

### 2.1 Dual Primary Focus: Hanafi & Hanbali [Category A: Owner Approved]
The primary interactive user experience focuses on:
1. **The Hanafi Madhhab (المذهب الحنفي):** The school of Imam Abu Hanifa al-Nu'man (d. 150 AH) and his companions.
2. **The Hanbali Madhhab (المذهب الحنبلي):** The school of Imam Ahmad ibn Hanbal (d. 241 AH) and verifying jurists.

### 2.2 Extensibility to Maliki and Shafi'i [Category C: Architectural Rule]
The database schema and domain architecture must natively support expanding to:
* **The Maliki Madhhab (المذهب المالكي):** The school of Imam Malik ibn Anas (d. 179 AH).
* **The Shafi'i Madhhab (المذهب الشافعي):** The school of Imam Muhammad ibn Idris al-Shafi'i (d. 204 AH).

**Architectural Rule:** No core database entity or generic worship module (e.g., prayer schedule calculation, Qibla compass, zakat calculator) may hardcode rulings specific to one madhhab without routing through the multi-madhhab configuration system.

---

## 3. Principle of Taqlid (Following a Madhhab)

### 3.1 Adopted Methodological Position [Category A: Owner Approved]
The project owner's approved methodology affirms:
> **"Taqlid is necessary for everyone (التقليد واجب على العامة ومن لم يبلغ رتبة الاجتهاد)."**

The platform operates on the recognized Sunni principle that ordinary Muslims and non-Mujtahids are required to adhere to an established, systematic school of jurisprudence rather than attempting independent juristic extraction (*Ijtihad*) directly from primary texts without qualifying scholarship.

### 3.2 Scholarly Integrity & Source Attribution [Category B: Requires Verification & Category C: Rule]
* When explaining the necessity of Taqlid, the platform **must not invent quotations, narratives, or evidences**.
* Every explanation of Taqlid, its conditions, its boundaries, and the prohibition of sectarian partisanship (*Ta'assub*) must cite recognized classical authorities (such as Ibn al-Humam, Ibn Qudamah, Al-Nawawi, Al-Shatibi, and Shah Waliullah).
* Specific classical distinctions (e.g., the duties of laypersons versus the duties of qualified scholars in specific sciences) must be sourced directly from authentic Usul al-Fiqh literature.

---

## 4. Evidence Hierarchy in Jurisprudence (أصول الفقه)

### 4.1 General Evidence Sequence [Category A: Owner Approved]
Legal rulings are grounded in the recognized Sunni hierarchy:
1. The Holy Qur'an (كتاب الله)
2. The Authentic Prophetic Sunnah (السنة النبوية الصحيحة)
3. Practice and Consensual Rulings of the Sahabah (فهم وإجماع الصحابة)
4. Established Principles of Ahl al-Sunnah (أصول وقواعد أهل السنة والجماعة)
5. Genuine Scholarly Consensus (الإجماع المعتبر)
6. Usul al-Fiqh according to the applicable recognized methodology/madhhab
7. Recognized Madhhab Scholarship (فقه المذاهب المعتمدة)
8. Later Attributed Scholarly Commentary

### 4.2 Madhhab-Specific Usul Recognition [Category C: Architectural Rule]
* The platform must **NOT** treat juristic derivation tools (such as Qiyas, Istihsan, Maslahah Mursalah, Sadd al-Dhara'i, 'Urf, and Istishab) as though every madhhab defines and applies them identically.
* Every legal ruling must be documented through the **Usul al-Fiqh of the specific madhhab being presented**, citing that school's verified principles of deduction.

---

## 5. User Preference & Comparative Mode Architecture [Category C: Architectural Rule]

### 5.1 Profile Settings Schema
```typescript
export interface UserFiqhPreferences {
  primaryMadhhab: 'hanafi' | 'hanbali' | 'shafii' | 'maliki';
  displayMode: 'single_madhhab' | 'comparative';
  calculationMethod: {
    asrConvention: 'standard_single_shadow' | 'hanafi_double_shadow';
    fajrTwilightAngle: number;
    ishaTwilightAngle: number;
  };
  showDaleel: boolean;
  showAlternativeMadhhabs: boolean;
}
```

### 5.2 Dynamic Routing Rules
1. **Agreed Obligations (المتفق عليه):** Universally agreed obligations are presented as universal Sunni obligations.
2. **Juristic Divergences (المختلف فيه):**
   * If `displayMode === 'single_madhhab'`, render the authoritative (*Mu'tamad*) position of the selected school with direct citations from its primary reference manuals.
   * If `displayMode === 'comparative'`, render a structured table comparing Hanafi and Hanbali (and optionally Shafi'i/Maliki) positions with respective textual evidences.

---

## 6. Structured Fatwa & Mas'alah Data Schema [Category C: Architectural Rule]

Every legal question, ruling, and fatwa stored or presented on ISLAM UL HARAMAIN must conform to the following schema:

```json
{
  "masalah_id": "mas-8841-e94f",
  "title": "Recitation of Surah al-Fatiha Behind the Imam in Congregational Prayer",
  "category": "Salah / Congregational Prayer",
  "primary_ruling": {
    "madhhab": "Hanafi",
    "position": "Recitation behind the Imam is prohibited / Makruh Tahrimi. The Imam's recitation suffices for the follower.",
    "scholars": ["Imam Abu Hanifa", "Imam Abu Yusuf", "Imam Muhammad al-Shaybani"],
    "primary_reference": {
      "book_title": "Radd al-Muhtar 'ala al-Durr al-Mukhtar",
      "author": "Ibn Abidin",
      "volume": 1,
      "page": 544
    },
    "textual_evidence": [
      {
        "source": "Quran",
        "citation": "Surah al-A'raf 7:204",
        "text": "And when the Quran is recited, then listen to it and pay attention that you may receive mercy."
      },
      {
        "source": "Hadith",
        "citation": "Sunan Ibn Majah 850 (Graded Sahih/Hasan by verifying scholars)",
        "text": "Whoever has an Imam, the recitation of the Imam is recitation for him."
      }
    ]
  },
  "alternative_sunni_rulings": [
    {
      "madhhab": "Hanbali",
      "position": "Recitation of al-Fatiha is recommended in silent prayers and during pauses in audible prayers, but if the Imam recites audibly, the follower listens.",
      "scholars": ["Imam Ahmad ibn Hanbal", "Ibn Qudamah"],
      "reference": "Al-Mughni 2/130"
    }
  ],
  "controversy_level": "YELLOW_SCHOLARLY_DIFFERENCE",
  "controversy_rationale": "Recognized classical juristic disagreement among the four Sunni schools",
  "review_status": "APPROVED",
  "verified_by_scholar_id": "scholar-uuid-9912",
  "published_at": "2026-09-23T14:00:00Z"
}
```

---

## 7. Prohibition on AI-Generated Fatwas [Category C: Architectural Rule]

1. **No Autonomous Religious Pronouncements:** AI models are prohibited from answering user queries with synthesized "Halal" or "Haram" verdicts.
2. **Search and Retrieval Only:** AI is permitted to perform semantic retrieval over human-curated and scholar-verified fatwa records.
3. **Mandatory Disclaimer:** All jurisprudential search results must state clearly:
   > *"This content is indexed from classical verified Sunni jurisprudence manuals and certified contemporary Fatwa councils. It is provided for educational purposes. For personal life decisions, consult a local credentialed Sunni Alim or Mufti."*
