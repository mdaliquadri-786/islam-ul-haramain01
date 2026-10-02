# Islamic Methodology & Religious Content Governance
**Platform Name:** ISLAM UL HARAMAIN (إسلام الحرمين)  
**Document Type:** Master Religious Governance Charter & Methodological Standard  
**Document Version:** 2.0.0 (Revised Specification)  
**Authority:** Approved by Project Owner  
**Date:** September 2026 / Rabi' al-Awwal 1448 AH  

---

## 1. Foundational Tripartite Separation Framework

To ensure absolute theological fidelity and architectural clarity, all specifications, documentation, database entities, and editorial workflows must rigorously distinguish between three separate categories:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CATEGORY A: PROJECT OWNER-APPROVED METHODOLOGICAL POSITIONS                 │
│ The explicit theological, legal, and operational positions formally        │
│ selected by the project owner for the platform's core identity.             │
├─────────────────────────────────────────────────────────────────────────────┤
│ CATEGORY B: RELIGIOUS CLAIMS REQUIRING SCHOLARLY / SOURCE VERIFICATION      │
│ Classical assertions, historical narrations, juristic details, and debates  │
│ that must NOT be converted into database facts without explicit, verified   │
│ primary source documentation and credentialed human scholar review.        │
├─────────────────────────────────────────────────────────────────────────────┤
│ CATEGORY C: ARCHITECTURAL GOVERNANCE RULES                                  │
│ Technical, schema, editorial, and system rules governing how the software   │
│ stores, indexes, routes, verifies, and displays religious content.          │
└─────────────────────────────────────────────────────────────────────────────┘
```

The platform must never treat AI-generated interpretations or unverified assertions as Islamic authority.

---

## 2. Platform Identity & Foundational Purpose

### 2.1 Official Identity [Category A: Owner Approved]
The platform is officially designated:
* **English:** **ISLAM UL HARAMAIN**
* **Arabic:** **إسلام الحرمين**

### 2.2 Core Foundational Principle [Category A: Owner Approved]
> **"The platform does not manufacture a new Islamic position. It documents the Qur'an, the authentic Sunnah, and recognized Sunni scholarship, identifies genuine scholarly disagreement, attributes positions to their scholars, and clearly distinguishes established matters from disputed matters."**

### 2.3 Non-Partisan Sunni Framework [Category A: Owner Approved]
The platform **must not silently adopt the methodology of any single contemporary movement or sub-sect**:
* It is **not** a Deobandi platform by default.
* It is **not** a Barelwi platform by default.
* It is **not** a Salafi platform by default.
* It is **not** an Ash'ari platform by default.
* It is **not** a Maturidi platform by default.

Instead, ISLAM UL HARAMAIN represents the broad, authentic heritage of **Ahl al-Sunnah wa al-Jama'ah (أهل السنة والجماعة)**, acknowledging its classical schools of law and recognized traditions of scholarship.

Where genuine Sunni scholarly disagreement exists [Category C: Architectural Rule]:
1. Identify the disagreement with clarity and academic honesty.
2. Identify the scholars, jurists, and schools holding each respective position.
3. Provide the primary textual evidences and bibliographic references without selectivity.
4. Never manufacture artificial consensus (*Ijma'*) where valid differences of opinion exist.
5. Never turn a disputed (*khilafi*) issue into an undisputed dogma.
6. Never erase legitimate Sunni differences to enforce a single modern narrative.

---

## 3. Evidence Hierarchy & Discipline-Specific Usul

### 3.1 General Evidence Hierarchy [Category A: Owner Approved]
All religious claims and positions on the platform are structured according to the general authoritative hierarchy approved by the project owner:
1. **The Holy Qur'an** (كتاب الله) — Decisive divine revelation.
2. **The Authentic Sunnah** (السنة النبوية الصحيحة) — Mutawatir and authentic Ahad traditions.
3. **Understanding and Practice of the Sahabah** (فهم وعمل الصحابة رضي الله عنهم).
4. **Established Principles of Ahl al-Sunnah** (أصول وقواعد أهل السنة والجماعة).
5. **Genuine Consensus** (الإجماع المعتبر) — Where historically verified and documented among recognized Sunni authorities.
6. **Usul al-Fiqh** according to the applicable recognized methodology/madhhab.
7. **Recognized Madhhab Scholarship** (فقه المذاهب المعتمدة).
8. **Later Attributed Scholarly Interpretation & Commentary** (تحقيقات وشروح المتأخرين).

### 3.2 Non-Algorithmic & Discipline-Specific Methodologies [Category C: Architectural Rule]
The hierarchy of evidence is **not a mechanical universal algorithm**. Different Islamic disciplines apply evidence according to their established scholarly methodologies:
* **Aqeedah (Creed):** Prioritizes decisive, definitive texts (*Qat'i al-Thubut wa al-Dalalah*). Speculative or singular (*Ahad*) reports are processed through classical theological epistemologies.
* **Hadith:** Governed by the specialized standards of Hadith masters (*Muhaddithin*) concerning transmission chains (*Isnad*), narrator integrity (*'Adalah*), accuracy (*Dabt*), hidden defects (*'Ilal*), and text evaluation (*Matn*).
* **Tafsir:** Prioritizes Qur'an by Qur'an, Qur'an by Sunnah, narrations of the Sahabah and Tabi'in (*Tafsir bi al-Ma'thur*), classical Arabic linguistics, and classical exegetical scholarship.
* **Fiqh (Jurisprudence):** Rulings are processed through the systematic legal frameworks of recognized madhhabs. Legal instruments (such as Qiyas, Istihsan, Maslahah Mursalah, Sadd al-Dhara'i, 'Urf, and Istishab) are **not identical across madhhabs** and must be applied strictly according to the specific madhhab's recognized Usul al-Fiqh.
* **Islamic History (Tarikh):** Historical reports are examined with source criticism, distinguishing verified historical traditions from weak, polemical, or unverified chronicler accounts.

---

## 4. Primary Fiqh Architecture & Multi-Madhhab System

### 4.1 Primary Madhhab Experience: Hanafi & Hanbali [Category A: Owner Approved]
The two primary madhhabs driving the interactive user experience on ISLAM UL HARAMAIN are:
1. **The Hanafi Madhhab (المذهب الحنفي)**
2. **The Hanbali Madhhab (المذهب الحنبلي)**

### 4.2 Multi-Madhhab Governance & Extensibility [Category C: Architectural Rule]
* **User Profile Preference Setting:** Users can select:
  * `Hanafi` (Default for regions adhering to Hanafi jurisprudence)
  * `Hanbali` (Default for regions adhering to Hanbali jurisprudence)
  * `Comparative Mode` (Side-by-side display of rulings across madhhabs with respective evidences)
* **Extensibility:** The schema and domain logic must support incorporating the **Maliki (المالكي)** and **Shafi'i (الشافعي)** madhhabs without database restructuring.
* **No Hardcoded Jurisprudence:** Developers are strictly prohibited from hardcoding Hanafi or Hanbali rulings into generic Islamic features (e.g., prayer time algorithms, general worship guides, fasting rules, zakat calculation).
* **Universally Agreed vs. Madhhab-Specific Rulings:**
  * Fundamental obligations agreed upon by all recognized schools are presented as universal Sunni obligations.
  * Secondary branches (*furu'*), procedural conditions, and invalidators are rendered dynamically according to the user's active madhhab selection.

---

## 5. Taqlid (Adherence to a Madhhab)

### 5.1 Adopted Methodological Position [Category A: Owner Approved]
The project owner's approved methodology affirms:
> **"Taqlid is necessary for everyone (التقليد واجب على العامة ومن لم يبلغ رتبة الاجتهاد)."**

The platform operates on the recognized Sunni principle that ordinary Muslims and non-Mujtahids are required to adhere to an established, systematic school of jurisprudence rather than attempting independent juristic extraction (*Ijtihad*) directly from primary texts without qualifying scholarship.

### 5.2 Scholarly Integrity & Source Attribution [Category B: Requires Verification & Category C: Rule]
* The platform **must never invent quotations, narratives, or evidences** regarding Taqlid.
* Every explanation of Taqlid, its history, conditions, and boundaries must be explicitly attributed to recognized classical and contemporary authorities (e.g., Imam Ibn al-Humam, Imam Ibn Qudamah, Imam al-Nawawi, Imam al-Shatibi, Shah Waliullah Dehlawi).
* Specific juristic distinctions regarding the scope of Taqlid (e.g., laypersons vs. qualified scholars in specific sciences) must be sourced from authentic Usul al-Fiqh literature rather than asserted as unverified generalizations.

---

## 6. Aqeedah Governance & Theological Plurality

### 6.1 Recognition of Classical Sunni Theological Traditions [Category A: Owner Approved]
The platform recognizes that classical Sunni theological articulation developed primarily across three recognized traditions:
1. **The Athari Tradition (المدرسة الأثرية / أهل الحديث)**
2. **The Ash'ari Tradition (المدرسة الأشعرية)**
3. **The Maturidi Tradition (المدرسة الماتريدية)**

### 6.2 Theological Safety & Anti-Sectarian Guardrails [Category C: Architectural Rule]
* The software must not arbitrarily impose one school's specific dialectical terminology as universal dogma while dismissing others.
* **Prohibition of Sectarian Takfir:** No content on the platform may declare an established Sunni theological tradition as outside the fold of Ahl al-Sunnah wa al-Jama'ah merely due to differences in technical terminology, *Ta'weel Tanzīhī*, or *Tafweed*.
* Agreed fundamentals of Islamic creed (Tawheed, Prophethood, the Unseen, the Last Day, divine predestination) must be distinguished from secondary semantic or technical formulations.

---

## 7. Specific Theological & Jurisprudential Matters

### 7.1 Tawassul (التوسل)
* **Approved Position [Category A: Owner Approved]:** Tawassul through Allah's muqarrab/righteous servants (*Awliya*) and through recognized means is established and permissible according to the adopted methodology and must be separately documented.
* **Separation of Disputed Forms & Scholarly Positions [Category C: Architectural Rule]:** The architecture must distinguish different forms of Tawassul (e.g., Tawassul through Allah's Names and Attributes, through righteous deeds, through living pious persons, through the person or rank of the Prophet ﷺ and Awliya, and contested phrasings).
* **Removal of Unverified Generalizations [Category B: Requires Verification]:** The platform must **NOT** automatically assert that any specific form of Tawassul represents the "majority Sunni position across all four madhhabs" unless established through properly verified, cited scholarly sources.
* **Mandatory Attribution Schema [Category C: Architectural Rule]:** Every documented position on Tawassul must record:
  * Scholar name and era
  * Madhhab / theological affiliation
  * Original source book with exact volume and page
  * Specific textual evidence (*daleel*) cited by the author
  * Technical terminology used by the author
  * Documented scholarly disagreement where applicable

### 7.2 Istighatha, Awliya & Independent Divine Power (القدرة الذاتية المستقلة)
* **Foundational Theological Framework [Category A: Owner Approved]:**
  * **Allah alone possesses independent divine power (*al-qudrah al-dhatiyyah al-mustaqillah*).**
  * Created beings, including Prophets and Awliya, **do not possess independent / zati divine power**.
  * Allah may grant His servants abilities, means, miracles (*Karamat*), assistance, or other effects strictly by His sovereign power and permission (*bi-idhn Allah wa qadratih*).
* **Calling Upon Prophets and Awliya [Category A: Owner Approved]:**
  * Expressions such as *"Ya Rasul Allah"* (يا رسول الله), *"Ya Ali"* (يا علي), *"Ya Ghawth"* (يا غوث), or *"Ya Shaykh"* (يا شيخ) are not to be automatically condemned merely because of their wording.
  * The project owner's approved position is that these expressions are permitted within the adopted theological framework.
* **Removal of Unapproved Universal Linguistic Presumptions [Category B & Category C]:**
  * The platform **must NOT impose "Nida' Majazi" (metaphorical address) as a universal condition** unless a particular cited scholar or source explicitly establishes that condition.
  * The platform **must NOT claim that all permissibility is based exclusively on metaphorical address**.
  * Future scholarly content must investigate the actual meanings, theological assumptions, linguistic context, and scholarly positions surrounding such expressions, supported by verified literature.

### 7.3 Mawlid al-Nabi ﷺ (المولد النبوي الشريف)
* **Approved Position [Category A: Owner Approved]:** Mawlid is permissible and is a good deed, provided it is free from unlawful activities.
* **Correction of Classification [Category B: Requires Verification & Category C: Rule]:**
  * The platform must **NOT** independently convert this position into a specific formal legal classification such as *"Mustahabb"* unless that exact classification is supported by the selected scholarly sources.
  * Future content may document:
    * Permissibility
    * Virtue / good deed status
    * Necessary conditions and etiquette
    * Scholarly evidences supporting commemoration
    * Opposing scholarly arguments and cautions
  * All documentation must feature exact attribution without manufacturing artificial consensus (*Ijma'*).

### 7.4 Bid'ah (Religious Innovation - البدعة)
* **Approved Framework [Category A: Owner Approved]:** The platform recognizes the classical two-fold classification:
  1. **Bid'ah Hasanah / Mahmudah (بدعة حسنة):** Newly originated matters conforming to the general principles, objectives, and spirit of the Shari'ah.
  2. **Bid'ah Sayyi'ah / Dalalah (بدعة سيئة):** Newly originated matters contradicting, altering, or opposing the established Qur'an, Sunnah, and consensus.
* **Data Model & Terminology Governance [Category C: Architectural Rule]:**
  * The database schema must **never** reduce Bid'ah to a simple boolean field (`bidah: true/false`).
  * The architecture must support detailed classification, legal rationale, and scholar attribution.
  * Where classical scholars use different terminology or classification systems (e.g., Imam al-Shafi'i's two-fold division, Imam al-Izz ibn Abd al-Salam's five-fold legal categorization, or Imam al-Shatibi's specific definitions in *Al-I'tisam*), preserve their specific attribution and analysis.

### 7.5 Tabarruk (Seeking Blessings - التبرك)
* **Approved Position [Category A: Owner Approved]:** Tabarruk through sacred and virtuous means is permissible and is not inherently haram.
* **Removal of Unverified Relic Claims [Category B: Requires Verification]:**
  * Claims regarding the authenticity of specific historical relics (such as items in museums or private collections) **must NOT be asserted as factual methodology claims**.
  * **Future Verification Rule:** Every claim regarding the authenticity or provenance of a physical relic must be independently sourced, historically investigated, and reviewed before publication.
* **Structured Documentation [Category C: Architectural Rule]:** The platform will document classical discussions regarding Tabarruk through the Prophet's ﷺ relics, righteous individuals, sacred times, and sacred places, while clearly delineating prohibited practices (such as worshiping objects or attributing independent power to relics).

### 7.6 Shafa'ah (Intercession - الشفاعة)
* **Approved Requirement [Category A: Owner Approved & Category C: Rule]:** The architecture must maintain a detailed distinction between:
  1. Shafa'ah established in the Qur'an and Sunnah.
  2. Shafa'ah on the Day of Judgment (including Al-Maqam al-Mahmud).
  3. Allah alone granting and permitting Shafa'ah (*Lillahi al-shafa'atu jami'a*).
  4. Seeking and interpreting Shafa'ah.
  5. Disputed forms and formulations.
* **Source Requirement [Category B: Requires Verification]:** All substantive conclusions regarding specific modalities of seeking intercession must be sourced directly from classical theological works with verified citations.

### 7.7 Ziyarat al-Qubur (Visiting Graves - زيارة القبور)
* **Approved Detailed Approach [Category A: Owner Approved & Category C: Rule]:**
  The platform will not collapse grave visitation into a single binary ruling. The architecture must support distinct, nuanced treatments for:
  1. General grave visitation (remembrance of the Hereafter, greeting the deceased).
  2. Visiting the Rawdah and grave of the Prophet Muhammad ﷺ in Madinah.
  3. Grave etiquette and Sunnah supplications.
  4. Supplication (*Dua*) for the deceased.
  5. Seeking Allah's grace and answering of supplication near the graves of the righteous.
  6. Disputed practices and historical differences among jurists.
  7. Prohibited practices and innovated excesses.
  8. Directing worship (*'Ibadah*), vows, sacrifices, or prostration of worship to other than Allah (strictly prohibited).

### 7.8 Ahl al-Bayt, Sahabah & Sayyiduna Mu'awiyah (رضي الله عنهم)
* **Central Revered Categories [Category A: Owner Approved]:**
  1. **Ahl al-Bayt (آل بيت النبي ﷺ):** The noble prophetic household.
  2. **Al-Khulafa al-Rashidun (الخلفاء الراشدون):** Abu Bakr, Umar, Uthman, Ali, and Hasan (رضي الله عنهم).
  3. **The Entire Companionship of the Sahabah (الصحابة أجمعين رضي الله عنهم).**
  Careless, disrespectful, or slanderous accusations against the Companions are prohibited.
* **Sayyiduna Mu'awiyah ibn Abi Sufyan (رضي الله عنه) [Category A: Owner Approved & Category B/C]:**
  * The project owner specifically mandates that the platform must **investigate historical reports rather than blindly suppressing them or blindly repeating them**.
  * The system must distinguish between:
    * Established historical reports (*Thabit*)
    * Weak historical reports (*Da'if*)
    * Disputed or polemical reports
    * Later historical interpretations
    * Classical historical critique
    * Sunni scholarly treatment and consensus on Companionship
  * **Architectural Rule:** Do not automatically convert either excessive praise or unverified accusations into database facts. Do not suppress historically documented material merely because it is uncomfortable. Do not manufacture accusations.

### 7.9 Yazid ibn Mu'awiyah
* **Owner Methodological Preference / View [Category A: Owner Preference]:**
  * The project owner personally holds the position that Yazid was an illegitimate tyrant and kafir.
* **INVIOLABLE ARCHITECTURAL RULE [Category C: Architectural Rule]:**
  > **The platform MUST NOT encode `Yazid = kafir` as an objective universal database fact.**
* **Documenting Scholarly Spectrum [Category B: Requires Verification & Category C: Rule]:**
  * Future content must document the actual Sunni scholarly positions with exact source attribution rather than assuming a fixed, unverified number of positions.
  * At minimum, the architecture must support distinguishing:
    1. Takfir
    2. Fisq / condemnation without takfir
    3. Cursing (*La'nah*)
    4. Restraint / silence (*Tawwaquf*)
    5. Other documented scholarly positions
  * Only include a position when a reliable, verified source supports it. Mandatory multi-scholar review required for any content mentioning Yazid.

---

## 8. Sunni / Shia Comparative Boundaries

### 8.1 Required Comparative Scope [Category A: Owner Approved]
The comparative presentation must address specific core points:
1. Status and treatment of the Sahabah.
2. Religious exaggeration (*Mubalaghah* / *Ghuluw*).
3. The doctrine of the Imamate (divine appointment, infallibility, cosmic authority).
4. **The Twelve Imams of Ahl al-Bayt [Category A: Owner Approved]:** The project owner's approved methodological understanding is that the Twelve Imams of Ahl al-Bayt are recognized as Imams of their respective times and were Imams for the people, while the platform must distinguish this Sunni understanding from the specific doctrinal claims made by Twelver Shi'ism regarding Imamate, infallibility, and authority.
5. Sources of religious authority.
6. Foundational doctrinal differences.

### 8.2 Objective Scholarly Standards [Category B: Requires Verification & Category C: Rule]
* **Scholarly & Historical Verification [Category B: Requires Verification]:**
  * Do not invent historical evidence or manufacture artificial Sunni consensus.
  * Do not automatically equate the Sunni concept of Imam with the Twelver theological doctrine of Imamate.
  * The exact historical and theological details, narrations, and scholarly evaluations must be documented later with reliable Sunni sources and, where appropriate, primary Twelver sources.
* Do **NOT** independently insert sweeping theological conclusions (such as "Sunni Islam does not accept X") unless the statement is part of a properly sourced comparative study.
* Content must clearly distinguish:
  * **SUNNI POSITION** (with primary Sunni citations)
  * **TWELVER SHIA POSITION** (with primary Shia citations)
* Content must remain free from abusive, insulting, or inflammatory language toward individuals or communities.

---

## 9. Controversy Classification System

### 9.1 The Four-Level Indicator Schema [Category A & Category C]
All content addressing contested religious issues displays a standardized indicator:

| Indicator | Designation | Operational Meaning |
| :---: | :--- | :--- |
| 🟢 | **Established / Broadly Agreed** | Matters of universal consensus (*Ijma'*) or fundamental creed/worship agreed upon across recognized Sunni traditions. |
| 🟡 | **Recognized Scholarly Disagreement** | Matters where legitimate differences exist among recognized Sunni schools (e.g., Asr prayer calculation, details of specific legal rulings). |
| 🟠 | **Strongly Disputed / Requires Attribution** | Matters of intense historical or theological debate. Explicit attribution of each position is mandatory. |
| 🔴 | **Prohibited According to Adopted Methodology** | Practices or doctrines violating the core creed of Ahl al-Sunnah according to the explicitly identified adopted methodology/source. |

### 9.2 Crucial Architectural Governance Rules [Category C: Architectural Rule]
1. **The indicator is NOT itself the religious ruling.**
2. A 🔴 classification means: *"Prohibited according to the explicitly identified adopted methodology/source."* It must **never** mean *"Antigravity or software developers have independently decided this is prohibited."*
3. A 🟢 classification must **never** be used to manufacture artificial consensus (*Ijma'*).
4. Every classified item must contain:
   * Topic and subtopic
   * Exact proposition
   * Specific methodology / school
   * Scholar / scholars holding the position
   * Primary bibliographic source
   * Textual evidence cited
   * Review status signed off by a credentialed human scholar

---

## 10. Scholarly Attribution & Verification Paths

### 10.1 Structured Attribution Requirement [Category C: Architectural Rule]
Not every general Quranic verse or universally established metadata record requires a dedicated scholar ID. However, every substantive religious conclusion must have an appropriate source and review path:

| Content Type | Verification & Attribution Requirement |
| :--- | :--- |
| **Primary Revelation (Quran)** | Canonical Hafs 'an 'Asim text verified against KFGQPC standard (6,236 Ayahs). Dedicated scholar ID not required per Ayah; corpus certified at import. |
| **Hadith Narration** | Canonical collection reference, Sanad, Matn, and attributed grading from a verified Hadith scholar or academic committee. |
| **Classical Scholarly Quotation** | Book Title, Author, Volume, Page, Edition, and original Arabic text verified against physical publication. |
| **Fiqh Ruling / Mas'alah** | School of law, Mu'tamad position, classical reference manual, volume/page, and human reviewer ID. |
| **Contemporary Fatwa** | Sponsoring Fatwa council or certified Mufti, date, original text, and context. |
| **Historical Report** | Source chronicler, transmission chain evaluation, and alternative historical accounts. |
| **Editorial Explanation** | Sourced educational synthesis signed off by editorial reviewer. |
| **AI-Assisted Draft** | Explicitly flagged in metadata; must undergo 100% human scholarly verification before advancing to review queue. |

---

## 11. Inviolable AI Governance

The platform strictly enforces the following boundaries regarding Artificial Intelligence:

### 11.1 Permissible AI Capabilities
* Search and semantic indexing over verified content.
* Organizing and formatting human-reviewed data.
* Summarizing verified classical content without adding novel interpretations.
* Assisting human contributors with drafting and transcription proofreading.
* Identifying potential citations in library catalogs for human scholarly review.

### 11.2 Inviolable AI Restrictions
* **AI may NOT independently issue a fatwa.**
* **AI may NOT create an Islamic ruling and present it as authoritative.**
* **AI may NOT manufacture citations or bibliographic metadata.**
* **AI may NOT declare Ijma' (consensus) or lack thereof.**
* **AI may NOT declare takfir on any individual or group.**
* **AI may NOT silently classify a disputed matter into a controversy color.**
* **AI may NOT publish religious content without human scholar approval.**

---

## 12. Authority & Governance Sign-Off

This document constitutes the binding theological and methodological specification for **ISLAM UL HARAMAIN (إسلام الحرمين)**. All subsequent code, schemas, import scripts, and editorial tools developed within the repository must strictly conform to these rules.
