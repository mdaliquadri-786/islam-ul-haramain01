# ISLAM UL HARAMAIN — SOLO PRODUCTION LAUNCH STATUS

**Project:** ISLAM UL HARAMAIN / إسلام الحرمين  
**Repository:** `D:\ISLAMIC-PLATFORM`  
**Execution Date:** October 2, 2026  
**Developer Context:** Solo Student Developer (Zero-Budget Practical Launch)  
**Status:** PHASE 0 AUDIT COMPLETE  

---

## 1. Current Web Framework & Structure
- **Framework:** Next.js 15.2.1 with React 19.0.0 and App Router.
- **Monorepo Layout:**
  - `apps/web`: Next.js web application (3 locales: AR, EN, UR with bidirectional RTL/LTR layout).
  - `packages/islamic-engine`: Shared pure TypeScript calculation and citation engines (Prayer, Qibla, Tanzil Quran, Hadith, Search, Tafsir).
  - `packages/database`: Supabase client factories (`@supabase/ssr`) and TypeScript service repositories.
  - `packages/ui`: Shared design system components.
- **Compilation & Verification:** Next.js static generation verified (603 static pages compiled in 10.2s); strict TypeScript typecheck clean across 4 workspace packages.

---

## 2. Current Flutter Mobile Structure
- **Framework & SDK:** Flutter >= 3.47.0 / Dart ^3.13.4.
- **Package ID:** `com.islamulharamain.islamic_mobile` (version: `0.1.0+1`).
- **State & Storage Architecture:**
  - State Management: `flutter_riverpod` (v2.6.1).
  - Local Storage: `drift` (v2.31.0) SQLite database with `sqlite3mc` (AES-256 encryption at rest).
  - Secure Tokens: `flutter_secure_storage` (v9.2.4).
  - Dynamic Routing: `go_router` (v14.8.1).
- **Environment Configuration:**
  - `AppConfig.fromEnvironment()` in `apps/mobile/lib/core/config/app_config.dart` reads `--dart-define=SUPABASE_URL=...` and `--dart-define=SUPABASE_ANON_KEY=...` at compile time.
  - Zero hardcoded production secrets in client code.
- **Android Gradle Setup:**
  - `apps/mobile/android/app/build.gradle.kts` supports release signing via `key.properties`. Falls back gracefully to debug signing if `key.properties` is omitted.

---

## 3. Current Supabase Architecture
- **Staging Project:** `mlxyegiwdzmcybvhtgwy` (AWS Singapore).
- **Migration Status:** Migrations 01 through 17 applied with zero pending migrations.
- **Schema & RLS Enforcements:**
  - Row Level Security active on all personal tables (`bookmarks`, `user_reading_progress`, `user_prayer_settings`, `client_mutations`).
  - Read-only public access to scripture and reciters (`quran_ayahs`, `quran_translations`, `hadith_narrations`, `duas_adhkar`, `audio_reciters`, `audio_surah_files`, `tafsir_works`, `tafsir_entries`, `books`).
  - Role-based mutation security using PostgreSQL function `is_platform_admin()` and `is_admin()`.
  - Zero phantom `app_role` occurrences.

---

## 4. Current Authentication Architecture
- **Provider:** Supabase Auth with PKCE flow for browser and mobile clients.
- **Session Management:** Cookie persistence via `@supabase/ssr` with Next.js 15 asynchronous cookie adapters (`next/headers`).
- **Authorization Enforcement:** User roles stored securely in `public.user_roles` in PostgreSQL with non-recursive check functions. Client-supplied role claims are never trusted directly.

---

## 5. Current Admin Subsystem Architecture
- **API Boundary Protection:** `apps/web/src/lib/admin-auth.ts` inspects incoming administrative requests.
- **Production Spoofing Defense:** Direct `x-admin-role` headers are strictly rejected in production mode without matching verified `ADMIN_API_SECRET`.
- **Role Permissions:** 43 granular system permissions mapped across 6 administrative roles (`super_admin`, `admin`, `content_admin`, `scholar_reviewer`, `support_admin`, `billing_admin`).
- **Immutability & Safety:** Administrative self-role escalation, self-suspension, and platform Super Admin demotion blocked.

---

## 6. Required Environment Variables

### Client-Side Variables (Public):
- `NEXT_PUBLIC_SUPABASE_URL`: Public Supabase project URL (e.g., `https://<project-ref>.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public publishable / anon API key for client-side queries.

### Server-Side Variables (Strict Secrets):
- `SUPABASE_SERVICE_ROLE_KEY`: Elevated key for backend background jobs and administrative services.
- `ADMIN_API_SECRET`: High-entropy 32-byte secret for internal `/api/admin/*` route validation.

---

## 7. Current Production & Deployment Blockers

| Domain | Blocker Description | Required Action | Status |
|---|---|---|:---:|
| **Supabase Production** | Production project does not yet exist. Staging (`mlxyegiwdzmcybvhtgwy`) must remain separate. | Create new Supabase production project in Supabase Dashboard (Free Tier). | **PENDING USER ACTION** |
| **Production DB Migration** | Migrations M01–M17 have not yet been applied to production. | Link CLI or push migrations to production Supabase project ref once created. | **PENDING PROD REF** |
| **Vercel Deployment** | Web application requires production hosting on Vercel. | Connect repository to Vercel and configure production environment variables. | **PENDING VERCEL SETUP** |
| **Android Release Signing** | Production AAB requires release keystore. | Generate local `release-keystore.jks` and create `apps/mobile/android/key.properties`. | **PENDING KEYSTORE** |

---

## 8. Summary & Next Steps
The codebase is clean, statically robust, and 100% verified locally. The next immediate phases are:
1. Complete the practical critical security review (Phase 1).
2. Generate production environment templates `.env.production.example` (Phase 2).
3. Guide the developer through creating the free Supabase production project and linking it (Phase 3).
