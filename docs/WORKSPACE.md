# Monorepo Workspace Topology & Package Architecture
**Project:** Production-Grade Sunni Islamic Digital Platform  
**Milestone:** M1.1 — Workspace & Engine Skeleton  
**Package Manager:** pnpm Workspaces  

---

## 1. Directory Structure

```text
islamic-platform/
├── apps/
│   ├── web/                     # Next.js 15 App Router web application
│   └── mobile/                  # Flutter 3.x cross-platform app (Phase 5 boundary)
│
├── packages/
│   ├── islamic-engine/          # Platform-agnostic TypeScript calculations
│   ├── database/                # Supabase client wrapper & typed DTO boundaries
│   └── ui/                      # Islamic design tokens & typography definitions
│
├── supabase/
│   ├── migrations/              # PostgreSQL schema migrations (Milestone 1.2+)
│   └── functions/               # Supabase Edge Functions
│
├── docs/                        # Architectural specifications & governance
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── ROADMAP.md
│   ├── FEATURE_MATRIX.md
│   ├── TECHNICAL_DECISIONS.md
│   ├── SECURITY.md
│   ├── RELIGIOUS_CONTENT_POLICY.md
│   ├── CONTENT_LICENSE_MATRIX.md
│   ├── RISKS.md
│   └── WORKSPACE.md
│
├── pnpm-workspace.yaml          # Monorepo package glob definitions
├── package.json                 # Monorepo root scripts & dev dependencies
└── tsconfig.base.json           # Shared strict TypeScript compiler configuration
```

---

## 2. Package Descriptions & Responsibilities

### `apps/web`
* **Purpose:** Web presentation layer serving end users and administrative scholars.
* **Technology:** Next.js 15 (App Router), React 19, TypeScript.
* **Responsibilities:**
  * Server-side rendered and ISR-cached scripture views (Quran, Hadith, Duas).
  * Internationalized routing (`/en`, `/ar`, `/ur`) with native RTL/LTR bidirectional support.
  * Integration point for client-side prayer calculations, bookmarks, and search.
* **Boundaries:** Does not contain raw database credentials or direct database SQL queries; relies on `@islamic/database` DTOs and client interfaces.

### `apps/mobile`
* **Purpose:** Cross-platform mobile client for iOS and Android.
* **Technology:** Flutter 3.x / Dart 3.x (Scheduled for implementation in Phase 5).
* **Responsibilities:**
  * Offline-first scripture reading via local SQLite database.
  * Native background audio service with lock-screen media notifications.
  * Hardware sensor-fusion Qibla compass.
  * Local scheduled adhan push notifications.
* **Boundaries:** Retains placeholder documentation during Phases 1–4. Backend APIs and schemas are engineered to be fully mobile-aware.

### `packages/islamic-engine`
* **Purpose:** High-precision, platform-agnostic computational engine for devotional calculations.
* **Technology:** Pure TypeScript (zero UI or external network dependencies).
* **Responsibilities:**
  * Deterministic astronomical prayer time calculations across recognized Sunni conventions (MWL, ISNA, Umm al-Qura, Karachi, Egyptian, etc.).
  * Spherical trigonometric Great Circle bearing calculations for Qibla direction.
  * Umm al-Qura Hijri-to-Gregorian date conversion algorithms.
  * Arabic text diacritic stripping, tokenizers, and search query normalizers.
* **Boundaries:** Zero external REST API dependencies; 100% deterministic local computation.

### `packages/database`
* **Purpose:** Typed interface and abstraction layer for the Supabase PostgreSQL backend.
* **Technology:** TypeScript.
* **Responsibilities:**
  * Defines clean domain entity interfaces (`SurahEntity`, `AyahEntity`, `BookmarkEntity`, `UserProfileEntity`).
  * Houses the configured Supabase clients (SSR server client, browser client, admin service-role client).
* **Boundaries:** Encapsulates database tables so that raw database structures are not exposed as an unchecked public API.

### `packages/ui`
* **Purpose:** Shared design tokens, Islamic geometric styles, color palettes, and typographic scales.
* **Technology:** TypeScript / CSS tokens.
* **Responsibilities:**
  * Defines unified color palettes (Emerald, Gold, Parchment, Sepia Mushaf).
  * Defines font family stacks for Arabic Uthmani, Urdu Nastaliq, and Latin UI.
  * Establishes typographic scales for verse and translation rendering.
* **Boundaries:** Focuses on design tokens and primitives; application-specific widgets live in `apps/web`.

### `supabase/`
* **Purpose:** Infrastructure as Code for database migrations, Row Level Security (RLS) policies, and edge serverless routines.
* **Responsibilities:**
  * `migrations/`: Version-controlled SQL scripts for table schemas, indexes, and RLS rules.
  * `functions/`: Edge functions for auxiliary computational tasks.
