# MILESTONE M7 PHASE 0 — OPERATIONS & DEPLOYMENT INFRASTRUCTURE RECONNAISSANCE REPORT

Project: **ISLAM UL HARAMAIN / إسلام الحرمين**  
Repository: `D:\ISLAMIC-PLATFORM`  
Date: 2026-09-30  

---

## 1. Executive Summary

Milestone M7 Phase 0 (Operations & Deployment Infrastructure Reconnaissance Audit) has been executed strictly as a read-only investigation. The audit surveyed web hosting architecture, containerization readiness, Supabase operational workflows, native Android/iOS packaging prerequisites, security credential hygiene, and canonical religious data immutability.

### Phase 0 Final Gate Verdict
```text
================================================================================
M7 PHASE 0 RECONNAISSANCE PASSED WITH ENVIRONMENT BLOCKERS DOCUMENTED
SAFE TO PROCEED TO M7 PHASE 1
================================================================================
```

---

## 2. Authoritative M6 Baseline Confirmation

Milestone M6 (Production Build Hardening & Release Packaging Readiness) remains **CLOSED and LOCKED**:
- **Authoritative Report:** `M6_FINAL_COMPLETION_REPORT.md`
- **Web Production Build:** Next.js 15.5.25 passed (600 static pages generated across `/en`, `/ar`, `/ur`).
- **Workspace Packages:** 3/3 passed (`@islamic/islamic-engine`, `@islamic/database`, `@islamic/ui`).
- **Monorepo Typecheck:** 0 errors across 4 workspace packages (`pnpm.cmd typecheck`).
- **Islamic Engine Tests:** 228/228 passed.
- **Flutter Analyzer & Tests:** 0 issues, 165/165 passed.
- **Security Secret Scan:** 0 hardcoded secrets / service-role keys detected.
- **Canonical Protected Hashes:** 10/10 exact bit-for-bit SHA-256 matches.
- **Prayer Engine Baseline:** 437 lines, 16,758 bytes intact.

---

## 3. Web Hosting Architecture Reconnaissance

### 1. Platform Evaluation
- **Vercel Hosting:** The web application (`apps/web`) is structured for zero-config Vercel deployment. Prerendered static pages (`600 static HTML/JSON pages`) map natively to Vercel Edge CDN, while serverless API routes (`/api/admin/*`, `/api/quran`, `/api/tafsir/*`, `/api/prayer-times`, etc.) execute on Vercel Node.js Serverless Functions.
- **Generic Node.js / Container Hosting:** Supported via `pnpm --filter apps/web start` (`next start`).
  - *Finding:* `output: 'standalone'` is currently NOT declared in `next.config.mjs`. Deploying to lightweight Docker containers in future operations will benefit from enabling standalone output to minimize image layers.
- **Containerization Readiness:** No `Dockerfile`, `docker-compose.yml`, or `.dockerignore` files currently exist in root or `apps/web`.
- **CI/CD Automation:** No `.github/workflows` directory exists on disk. Deployment pipelines currently rely on CLI triggers or platform Git webhooks.

---

## 4. Next.js Production Environment Requirements

| Requirement | Specification | Verification / Current Status |
| :--- | :--- | :--- |
| **Node.js Runtime** | Node.js 18.18+ / 20+ / 22+ / 24+ | Local environment runs Node.js `v24.21.0` |
| **Package Manager** | `pnpm` (v9+) | Monorepo structured with `pnpm-workspace.yaml` |
| **Production Build Command** | `pnpm --filter ./apps/web build` | Verified passing in M6 Phase 2 (9.9s build time) |
| **Production Start Command** | `pnpm --filter ./apps/web start` | Invokes `next start` on port 3000 |
| **Client-Safe Environment Variables** | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publicly exposed to browser bundle; safe |
| **Server-Only Environment Variables** | `SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (if administrative edge functions used) | Server-side only; not exposed in client JS |
| **Static + Dynamic Coexistence** | Supported | 600 SSG pages coexist with dynamic serverless API endpoints |

---

## 5. Supabase / Database Operational Requirements

### 1. Repository Migration Architecture
- **Location:** `supabase/migrations/`
- **File Count:** 16 SQL migration files (`20260922000001` through `20260926000001`).
- **Ordering:** Strict chronological timestamp ordering.
- **Destructive SQL:** Zero destructive `DROP TABLE` or `DROP COLUMN` commands.
- **Local Config:** `supabase/config.toml` does not exist on disk.

### 2. Operational Delivery Requirements (Future Staging/Production)
- **Deployment Tooling:** Supabase CLI (`supabase db push`) or direct PostgreSQL client execution (`psql`) against connection pooler.
- **Credential Requirements:** `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_ID`, or `DATABASE_URL` (direct/pooled connection string).
- **CRITICAL SAFEGUARD:** Live database execution was NOT performed during this reconnaissance. The production Supabase database must be explicitly migrated during scheduled maintenance windows, not during automated reconnaissance.

---

## 6. Android Release Environment Audit

Field diagnostics re-verified the local build environment:
- **System Java JRE:** Version `1.8.0_401` (`C:\Program Files (x86)\Common Files\Oracle\Java\javapath\java.exe`).
- **Android Gradle Plugin (AGP):** Version `9.1.0` (in `apps/mobile/android/settings.gradle.kts`).
  - *Hard Prerequisite:* AGP 9.1.0 and Kotlin 2.4.0 require **Java JDK 17+** to assemble release `.apk` or `.aab` bundles.
- **Android SDK Path:** Unset (`ANDROID_HOME` and `ANDROID_SDK_ROOT` are not configured in environment; `Unable to locate Android SDK`).
- **Signing Configuration:** Debug signing configuration placeholder (`signingConfigs.getByName("debug")`).
- **Classification:** **RELEASE ENVIRONMENT BLOCKER**. (JDK 17+ and Android SDK installation required before native Android release builds can be executed).

---

## 7. iOS Release Environment Audit

- **Project Structure:** Flutter iOS Runner (`apps/mobile/ios/Runner.xcodeproj`, `AppDelegate.swift`, `Info.plist`).
- **Deployment Target:** iOS 13.0+.
- **Host Requirement:** macOS workstation with Xcode 15+ and valid Apple Developer Team signing certificates.
- **Classification:** **EXTERNAL ENVIRONMENT PREREQUISITE**. (Cannot be built natively on Windows host).

---

## 8. Security & Credential Readiness Audit

An automated codebase audit was conducted across all tracked source, configuration, and migration files:
- **`service_role` Secrets in Client Bundles:** **0 detected**.
- **Committed Private Keys (`.pem`, `.p12`, `.keystore`):** **0 detected**.
- **Tracked `.env` Secret Files:** **0 committed**.
- **Overall Security Hygiene:** **CLEAN / PASSED**.

---

## 9. Canonical Religious Content Hash Safeguard

All 10 canonical files were verified bit-for-bit against their authoritative SHA-256 digests:

| Relative Path | Authoritative Expected SHA-256 | Verified Actual SHA-256 | Verification Status |
| :--- | :--- | :--- | :---: |
| `supabase/seed_quran.sql` | `0D43F8B0A7929C4E8E358A4F81C67ED2D716E3B10FA881D591A085F55A649AE1` | `0D43F8B0A7929C4E8E358A4F81C67ED2D716E3B10FA881D591A085F55A649AE1` | **MATCH** |
| `supabase/seed_quran_translations.sql` | `450127FC6A15442F782CC8DF9ED80EB8C42448924F5BC48196EEFEC630A09751` | `450127FC6A15442F782CC8DF9ED80EB8C42448924F5BC48196EEFEC630A09751` | **MATCH** |
| `supabase/seed_hadith.sql` | `0B8D170D1620BE22254CAAC0B98F5A45E9127610B896307D6C0EA9455A04EDE2` | `0B8D170D1620BE22254CAAC0B98F5A45E9127610B896307D6C0EA9455A04EDE2` | **MATCH** |
| `supabase/seed_duas.sql` | `9B93D48AFCB1A2D1468C4D78EE39EB5B5EE2FBB1073BA4FED4C5001FA212B89B` | `9B93D48AFCB1A2D1468C4D78EE39EB5B5EE2FBB1073BA4FED4C5001FA212B89B` | **MATCH** |
| `docs/ISLAMIC_METHODOLOGY.md` | `7A58C0FA4E1E413741697C47298DE9D648018C960965A8723339E856F12C1533` | `7A58C0FA4E1E413741697C47298DE9D648018C960965A8723339E856F12C1533` | **MATCH** |
| `docs/AQEEDAH_GOVERNANCE.md` | `7D062A43603818D9C022A652682477D5BA065C32DFEB6BEC741956AD074A6099` | `7D062A43603818D9C022A652682477D5BA065C32DFEB6BEC741956AD074A6099` | **MATCH** |
| `docs/FIQH_METHODOLOGY.md` | `E1170E6969C3290D27FA8B2F46C672F9DCC3BDDE7F3ABBC06E1C15957DB65FF8` | `E1170E6969C3290D27FA8B2F46C672F9DCC3BDDE7F3ABBC06E1C15957DB65FF8` | **MATCH** |
| `docs/RELIGIOUS_CONTENT_POLICY.md` | `4FD117FB64865B02F5667F0F6EC8E1CDA4C5C927797B1EE0330F1DC39DE2934F` | `4FD117FB64865B02F5667F0F6EC8E1CDA4C5C927797B1EE0330F1DC39DE2934F` | **MATCH** |
| `docs/RELIGIOUS_CONTENT_REVIEW.md` | `BEE4BE27E3F528CE5ACD313437E790290EBEB1AF870213265D4503BCA77B98A7` | `BEE4BE27E3F528CE5ACD313437E790290EBEB1AF870213265D4503BCA77B98A7` | **MATCH** |
| `docs/CONTENT_LICENSE_MATRIX.md` | `912C469676CC14C3FE7DDECEB2ADE9B15E8ED5197380359AC68CEF15688FBE73` | `912C469676CC14C3FE7DDECEB2ADE9B15E8ED5197380359AC68CEF15688FBE73` | **MATCH** |

---

## 10. Restored Prayer Engine File Integrity

- **Path:** `packages/islamic-engine/src/prayer/prayer-calculator.ts`
- **Lines:** 437 lines
- **Bytes:** 16,758 bytes
- **Integrity Status:** **100% BIT-FOR-BIT MATCH (PASSED)**

---

## 11. Git Scope Verification

- **Source Code Mutations in Phase 0:** **Zero (0)**.
- **Migration/Schema Mutations in Phase 0:** **Zero (0)**.
- **Dependency/Lockfile Mutations in Phase 0:** **Zero (0)**.
- **Canonical Religious File Mutations in Phase 0:** **Zero (0)**.
- **Artifacts Created:** Only `M7_PHASE0_RECONNAISSANCE_REPORT.md`.

---

## 12. Classification of Blockers & Future Prerequisites

| Issue / Requirement | Classification | Technical Description | Future Action Required |
| :--- | :---: | :--- | :--- |
| **Java JDK Version** | `RELEASE ENVIRONMENT BLOCKER` | System default Java is JRE `1.8.0_401` | Install JDK 17+ for Android Gradle Plugin 9.1.0 native builds |
| **Android SDK Path** | `RELEASE ENVIRONMENT BLOCKER` | `ANDROID_HOME` unset | Install Android SDK command-line tools & platforms |
| **iOS Build Host** | `EXTERNAL ENVIRONMENT PREREQUISITE` | Local host is Windows 10 | Build on macOS build agent / CI with Xcode 15+ |
| **Live Database Execution** | `EXTERNAL ENVIRONMENT PREREQUISITE` | Staging/Prod Supabase project connection unexecuted | Execute `supabase db push` against designated staging environment in M7.1 |

---

## 13. Distinction Between Repository and Live Production Verification

- **Repository Verification:** **VERIFIED & CLEAN** (Source code, schemas, migration sequence, builds, and tests pass 100%).
- **Live Production Database:** **UNVERIFIED / REPOSITORY-ONLY** (No remote Supabase connection or destructive migration push was performed).
- **Production Hosting:** **UNVERIFIED / REPOSITORY-ONLY** (Next.js build artifacts are fully verified locally; live Vercel/Node deployment has not occurred).

---

## 14. Final Phase 0 Gate Verdict

```text
================================================================================
M7 PHASE 0 RECONNAISSANCE PASSED WITH ENVIRONMENT BLOCKERS DOCUMENTED
SAFE TO PROCEED TO M7 PHASE 1
================================================================================
```
