# Architecture Decision Records (ADRs)
**Project:** Production-Grade Sunni Islamic Digital Platform  
**Status:** Phase 0 Baseline Decisions (Revision 1)  
**Version:** 1.1.0  

---

## Phase 0 Architecture Review — Revision 1

### Technology Classification & Complexity Management

To prevent premature optimization and deliver a resilient, high-velocity Web MVP, every architectural component is categorized into:
* **REQUIRED FOR MVP:** Core functionality needed for the public web release and foundational data integrity.
* **USEFUL LATER:** Valuable features scheduled for Phase 3–5 (mobile app, media streaming, advanced caching).
* **OPTIONAL / FUTURE:** Advanced enterprise enhancements evaluated post-launch.

| Component / Technology | Classification | Rationale & Implementation Strategy |
|---|:---:|---|
| **Next.js 15 + React 19 + Tailwind CSS** | **REQUIRED FOR MVP** | Core web framework delivering SSR, ISR, and accessible RTL/LTR layouts. |
| **Supabase (PostgreSQL 15+ & Auth)** | **REQUIRED FOR MVP** | Provides relational storage, RLS security policies, and standard JWT/PKCE auth. |
| **pnpm Workspaces** | **REQUIRED FOR MVP** | Lightweight package management for sharing TypeScript engines across apps. |
| **Client-Side Prayer Engine** | **REQUIRED FOR MVP** | Deterministic astronomical calculations with configurable methods and offsets. |
| **PostgreSQL FTS (`tsvector` + `pg_trgm`)** | **REQUIRED FOR MVP** | Native, fast, diacritic-tolerant full-text search with zero external search clusters. |
| **Controlled Content Versioning** | **REQUIRED FOR MVP** | Audited version branching and parent lineage replacing brittle immutability. |
| **Append-Only `audit_logs`** | **REQUIRED FOR MVP** | Essential for religious and administrative governance. |
| **Turborepo Task Pipeline** | **USEFUL LATER** | Deferred until multi-package build caching provides measurable developer velocity gains. |
| **Flutter Mobile App (iOS & Android)** | **USEFUL LATER (Phase 5)** | Scheduled after Web MVP is validated. Backend is mobile-aware from Day 1. |
| **Drift SQLite Local Database** | **USEFUL LATER (Phase 5)** | Mobile offline scripture storage. |
| **Audio Streaming & Reciter Catalog** | **USEFUL LATER (Phase 4)** | Requires verified licensing provenance for each reciter before distribution. |
| **Cloudflare Advanced WAF & Rules** | **USEFUL LATER** | Cloudflare basic DNS/proxy is used for MVP; complex edge firewall rules added before peak seasons. |
| **Local Adhan Push Notifications** | **USEFUL LATER (Phase 5)** | Native mobile capability using local OS alarm schedulers. |
| **Encrypted Local DB (SQLCipher)** | **OPTIONAL / FUTURE** | Standard sandboxed SQLite on iOS/Android provides adequate protection for public scripture and user bookmarks. |
| **WebAuthn / FIDO2 Hardware Keys** | **OPTIONAL / FUTURE** | Supabase Auth standard credentials with TOTP MFA is sufficient for MVP administrators. |
| **Custom GPG Cold-Storage Backup Pipeline** | **OPTIONAL / FUTURE** | Supabase automated daily backups and Point-in-Time Recovery (PITR) satisfy MVP disaster recovery. |
| **3D Sensor-Fusion Magnetometer Compass** | **OPTIONAL / FUTURE** | Basic 2D coordinate bearing is sufficient for web and early mobile. 3D gyro is an enhancement. |
| **Brittle In-Database Hashing Triggers** | **OPTIONAL / FUTURE** | In-flight triggers that abort transactions on hash mismatches risk blocking valid errata. Replaced by pipeline verification scripts. |
| **Semantic Vector Search (`pgvector`)** | **OPTIONAL / FUTURE** | Evaluated for Phase 4+ thematic searches; PostgreSQL FTS handles MVP needs cleanly. |
| **Complex Distributed Tracing (APM)** | **OPTIONAL / FUTURE** | Standard error monitoring (Sentry / console logs) is sufficient for MVP. |

---

## ADR-001: Web Framework Selection — Next.js 15 App Router & React 19
* **Status:** Accepted (REQUIRED FOR MVP)
* **Context:** The web application requires high-performance rendering, internationalized SEO for 6,236 verses and thousands of hadiths, and native RTL/LTR layout transitions.
* **Decision:** Next.js 15 with App Router, React 19, and TypeScript 5.x. Scripture pages use Server Components (RSC) and Incremental Static Regeneration (ISR) to render pure HTML with near-zero client bundle overhead.

---

## ADR-002: Mobile Framework Selection — Flutter 3.x (Web-First, Mobile-Aware)
* **Status:** Accepted (USEFUL LATER — Phase 5)
* **Context:** A future cross-platform mobile app must run identically on iOS and Android with smooth Arabic rendering and offline support.
* **Decision:** Build the Web MVP first, while engineering the Supabase database schema, primary keys, RLS rules, and auth tokens to be consumed directly by Flutter in Phase 5 without backend refactoring.

---

## ADR-003: Backend & Database — Supabase (PostgreSQL 15+)
* **Status:** Accepted (REQUIRED FOR MVP)
* **Context:** Relational integrity, granular access control, user authentication, and audit trails are paramount.
* **Decision:** Supabase on PostgreSQL 15+. All access is controlled by Row Level Security (RLS). Canonical scripture is public read-only; user data is isolated strictly by `auth.uid() = user_id`.

---

## ADR-004: Workspace Management — Lightweight pnpm Workspaces
* **Status:** Accepted (Revision 1)
* **Context:** We need clean package separation between the web app and shared logic (`@islamic/islamic-engine`, `@islamic/database`).
* **Decision:** Use **pnpm workspaces** as the sole package orchestrator for MVP. Turborepo pipeline caching is deferred until package count and build complexity justify it.

---

## ADR-005: Quranic Text Representations & Verified Import Pipeline
* **Status:** Accepted (Revision 1)
* **Context:** Different use cases require different digital representations (Medina Mushaf Uthmani with full diacritics, Indo-Pak subcontinent script, and clean search text). No single digital encoding is universal.
* **Decision:** Implement a multi-stage import pipeline:
  1. Ingest verified upstream sources (Tanzil / KFGQPC) and record raw source file SHA-256 for provenance.
  2. Parse and normalize into explicit representations: `text_uthmani`, `text_indopak`, and `text_clean`.
  3. Validate structural integrity: exactly 114 Surahs and 6,236 Ayahs.
  4. Perform human verification by credentialed scholars before marking edition as `published`.
  5. Store deterministic text checksums for detecting data corruption at rest.

---

## ADR-006: Configurable, Pluggable Prayer Calculation Architecture
* **Status:** Accepted (Revision 1)
* **Context:** Relying on a single calculation convention alienates global Muslim populations who adhere to distinct regional standards.
* **Decision:** Decouple the calculation engine into a configurable TypeScript library (`@islamic/islamic-engine`):
  * Supports MWL, ISNA, Umm al-Qura, Karachi, Egyptian Authority, Diyanet, and MUIS.
  * Configurable Asr shadow ratios: Standard (1x) vs Hanafi (2x).
  * High-latitude adjustment options: Angle-based, Midnight, One-Seventh.
  * Manual minute adjustments per prayer.
  * Operates 100% offline with a clean interface allowing future external API timetable integrations.

---

## ADR-007: Search Architecture — Multi-Tiered Native Strategy
* **Status:** Accepted (REQUIRED FOR MVP)
* **Context:** Users search by exact citation ("2:255", "Bukhari 1"), keywords in English/Urdu, or unvocalized Arabic.
* **Decision:** Three-tier pipeline:
  1. Instant Regex Citation Router (<10ms).
  2. PostgreSQL FTS with Arabic dictionary stemmer on `text_clean`.
  3. `pg_trgm` trigram similarity for spelling mistake tolerance.
  Semantic vector search is deferred to Phase 4+.

---

## ADR-008: Controlled Religious Content Versioning & Auditability
* **Status:** Accepted (Revision 1)
* **Context:** Errata, footnote adjustments, and translations require revision over time. Silently mutating published records or treating content as rigidly unchangeable are both problematic.
* **Decision:** Implement an explicit versioning state machine:
  $$\text{PUBLISHED v1} \longrightarrow \text{Correction Request} \longrightarrow \text{New Draft} \longrightarrow \text{Scholar Review} \longrightarrow \text{PUBLISHED v2}$$
  * All previous versions are preserved with parent pointers.
  * Append-only `audit_logs` records every status change, timestamp, and reviewer ID.

---

## ADR-009: Verified Audio Asset Licensing Framework
* **Status:** Accepted (Revision 1 — Deferred to Phase 4)
* **Context:** Public availability of audio recitations on the internet does not confer redistribution or streaming rights.
* **Decision:** No audio asset is included or streamed unless explicit redistribution rights are verified. The database maintains an `audio_assets` table recording source, copyright holder, license type, allowed usage, attribution, redistribution status, and takedown procedures.

---

## ADR-010: Mobile-Aware Data Synchronization Contract
* **Status:** Accepted (Revision 1)
* **Context:** The web platform is developed first, but user bookmarks, notes, and reading history must synchronize seamlessly with the future Flutter app.
* **Decision:** All user-generated entities utilize UUID primary keys, `client_mutation_id`, `updated_at`, and soft-delete flags (`deleted_at`). Synchronization uses Last-Write-Wins (LWW) with ISO-8601 UTC timestamps.
