# MILESTONE M7 PHASE 1 — DEPLOYMENT PACKAGING & ENVIRONMENT SPECIFICATION REPORT

Project: **ISLAM UL HARAMAIN / إسلام الحرمين**  
Repository: `D:\ISLAMIC-PLATFORM`  
Date: 2026-09-30  

---

## 1. Executive Summary

Milestone M7 Phase 1 (Deployment Packaging & Environment Specification) has been executed strictly as an engineering specification and preflight analysis phase. In accordance with phase rules, zero live cloud deployments, remote database modifications, or destructive source code changes were performed.

### Phase 1 Final Gate Verdict
```text
================================================================================
M7 PHASE 1 DEPLOYMENT PACKAGING SPECIFICATION PASSED WITH ENVIRONMENT BLOCKERS DOCUMENTED
SAFE TO PROCEED TO M7 PHASE 2
================================================================================
```

---

## 2. Baseline Reconciliation (M7 Phase 0 Verification)

The project state was re-verified against the locked M7 Phase 0 baseline:
- **Canonical Protected Hashes:** Verified **10 / 10 exact SHA-256 matches**.
- **Prayer Engine Baseline:** Verified `packages/islamic-engine/src/prayer/prayer-calculator.ts` is intact at **437 lines, 16,758 bytes**.
- **Monorepo Typecheck:** **0 errors** across all 4 workspace packages (`pnpm.cmd typecheck`).
- **Islamic Engine Tests:** **228 / 228 passed** (`pnpm.cmd --filter ./packages/islamic-engine test`).
- **Flutter Analyzer & Tests:** **0 analyzer issues**, **165 / 165 passed** (`flutter test --no-pub`).
- **Working Tree Integrity:** Zero unauthorized source modifications detected.

---

## 3. Next.js Deployment Packaging Analysis

### 1. Current Architecture Evaluation
- **Prerendered SSG Assets:** The web application (`apps/web`) prerenders 600 static HTML/JSON routes across `/en`, `/ar`, `/ur` (Quran Surahs, Duas categories, Hadith collections, Articles, Books, Prayer hubs).
- **Serverless / Node API Routes:** Dynamic server routes (`/api/admin/*`, `/api/quran`, `/api/search`, `/api/tafsir/*`, `/api/prayer-times`, etc.) require a Node.js server runtime to interact with `@supabase/supabase-js` and perform dynamic server queries.
- **Middleware:** Edge/Server middleware (`middleware.ts`, 34.3 kB) handles trilingual locale negotiation and `@supabase/ssr` authentication cookie validation.

### 2. Standalone Output Compatibility (`output: 'standalone'`)
- **Compatibility:** Fully compatible with Next.js 15.5.25.
- **Monorepo File Tracing Requirement:** In a `pnpm` monorepo with sibling package dependencies (`@islamic/database`, `@islamic/islamic-engine`, `@islamic/ui`), Next.js requires:
  ```javascript
  outputFileTracingRoot: path.join(__dirname, '../../')
  ```
  This ensures that package files outside `apps/web` are traced into `.next/standalone/node_modules` without leaving broken symlinks.
- **Asset Bundling Rule:** In standalone mode, Next.js does not copy `public/` or `.next/static/` into `.next/standalone/apps/web`. These directories must be copied into the container runner layer during Docker assembly.
- **Phase 1 Decision:** Documented as the recommended specification; configuration modifications deferred to Phase 2 implementation.

---

## 4. Multi-Stage Docker Packaging Specification

A multi-stage Dockerfile specification for `apps/web` is designed to produce a lightweight, non-root, reproducible production container:

### Architecture Specification
```dockerfile
# -------------------------------------------------------------
# Stage 1: Base Environment
# -------------------------------------------------------------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# -------------------------------------------------------------
# Stage 2: Dependency Fetcher
# -------------------------------------------------------------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/islamic-engine/package.json ./packages/islamic-engine/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# -------------------------------------------------------------
# Stage 3: Builder
# -------------------------------------------------------------
FROM deps AS builder
COPY . .
ENV NODE_ENV=production
RUN pnpm --filter "./packages/*" build
RUN pnpm --filter apps/web build

# -------------------------------------------------------------
# Stage 4: Minimal Runner
# -------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root security user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build and static assets
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/admin/status || exit 1

CMD ["node", "apps/web/server.js"]
```

### Proposed `.dockerignore` Specification
```text
node_modules
.next
.git
.github
apps/mobile
supabase/seed_*.sql
build
.dart_tool
*.log
```

---

## 5. Vercel Deployment Analysis

The web application is fully aligned with Vercel deployment standards:
- **Zero-Config Detection:** Vercel automatically detects Next.js 15 from `apps/web/package.json`.
- **Monorepo Settings:**
  - Root Directory: `apps/web`
  - Build Command: `pnpm --filter apps/web build` (automatically detected)
  - Output Directory: `.next`
- **Routing Behavior:**
  - 600 static prerendered pages deploy to Vercel global Edge Network.
  - API routes deploy as Node.js Serverless Functions with zero configuration.
- **Required Production Environment Variables:**
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SITE_URL`

---

## 6. Supabase Deployment Pipeline Specification

The repository maintains 16 timestamped SQL migration files in `supabase/migrations/` (`20260922000001` through `20260926000001`).

### Future Production Migration Pipeline Flow
```text
1. Developer Validation (Local test replay)
        ↓
2. Automated PR Review (Timestamp ordering, 0 destructive DROPs)
        ↓
3. Ephemeral CI Validation (Replay against fresh PostgreSQL container)
        ↓
4. Authenticated Deployment (`supabase db push` via CI runner)
        ↓
5. Post-Migration Smoke Checks (Query schema_migrations, user_roles, quran_surahs)
```

### Secret Mappings for CI/CD Deployment
- `SUPABASE_ACCESS_TOKEN`: Account token for Supabase CLI authorization.
- `SUPABASE_PROJECT_ID`: Cloud project reference ID.
- `SUPABASE_DB_PASSWORD`: Password for direct database connection pooling.
- *Notice:* All tokens must be injected dynamically via CI/CD secret managers and NEVER committed to Git.

---

## 7. Database Safety & Rollback Analysis

### Implemented vs Recommended Safety Strategies
| Safety Dimension | Currently Implemented in Repo | Recommended Future Operational Procedure |
| :--- | :--- | :--- |
| **Transaction Safety** | Individual migrations wrap statements cleanly | Execute with `--include-all` inside transactional wrapper |
| **Destructive SQL** | **0 destructive DROPs** across all 16 files | Automated CI linting to block `DROP TABLE / DROP COLUMN` |
| **Audit Immutability** | Append-only `audit_logs` table with triggers | Retain audit log triggers across all environment updates |
| **Pre-Migration Backups** | N/A (Repository only) | Automated Supabase database snapshot before migration |
| **Disaster Recovery** | Database schemas and seeds versioned in Git | Enable Supabase Point-in-Time Recovery (PITR) on production instance |

---

## 8. Android Environment Remediation Specification

To remediate the Android build blocker on the Windows build host:

### Step-by-Step Procedure (For Future M7 Implementation)
1. **Install Java OpenJDK 17+:**
   ```powershell
   winget install Microsoft.OpenJDK.17
   ```
2. **Configure Environment Variables:**
   - Set `JAVA_HOME = "C:\Program Files\Microsoft\jdk-17..."`
   - Set `ANDROID_HOME = "C:\Users\<user>\AppData\Local\Android\Sdk"`
   - Add to `PATH`: `%JAVA_HOME%\bin`, `%ANDROID_HOME%\cmdline-tools\latest\bin`, `%ANDROID_HOME%\platform-tools`
3. **Install Android SDK Components:**
   ```powershell
   sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```
4. **Accept Android Licenses:**
   ```powershell
   flutter doctor --android-licenses
   ```

---

## 9. Android Release Signing Specification

### Secure Signing Blueprint
- **Keystore Generation (Outside Git):**
  ```powershell
  keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
  ```
- **Configuration Template (`apps/mobile/android/key.properties` — Untracked):**
  ```properties
  storePassword=<SECRET_STORE_PASSWORD>
  keyPassword=<SECRET_KEY_PASSWORD>
  keyAlias=upload
  storeFile=../release.jks
  ```
- **Git Protection:** Ensure `key.properties` and `*.jks` are strictly listed in `apps/mobile/android/.gitignore`.

---

## 10. iOS Packaging Specification

- **Host Workstation:** macOS with Xcode 15+ and CocoaPods.
- **Apple Developer Program:** Active team ID with Distribution Certificate and App Store Provisioning Profile.
- **Build Invocation:**
  ```bash
  flutter build ipa --release --export-options-plist=ExportOptions.plist
  ```
- **Distribution:** Upload `.ipa` to App Store Connect / TestFlight via `xcrun altool` or fastlane.

---

## 11. Environment Variable Inventory

| Variable | Scope | Secret? | Description |
| :--- | :---: | :---: | :--- |
| `NEXT_PUBLIC_SITE_URL` | Public / Client-Safe | No | Authoritative site origin URL for metadata & SEO |
| `NEXT_PUBLIC_SUPABASE_URL` | Public / Client-Safe | No | Supabase API endpoint URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public / Client-Safe | No | Anonymous client API key enforced by RLS |
| `SITE_URL` | Server-Only | No | Server-side origin fallback for SSR |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only Secret | **YES** | Admin bypass key (Strictly server-side; 0 in Git) |
| `SUPABASE_ACCESS_TOKEN` | Deployment Secret | **YES** | Supabase CLI deployment token (CI only) |
| `SUPABASE_DB_PASSWORD` | Deployment Secret | **YES** | Database administrative password (CI only) |

---

## 12. Security Packaging Review

- **Client Code Hygiene:** Verified **0 `service_role` keys** in Flutter and Next.js client bundles.
- **Repository Secrets:** Verified **0 hardcoded credentials**, private keys, or passwords committed to Git.
- **Container Hardening:** Proposed Docker runner specifies non-root user `nextjs:nodejs` (UID 1001).

---

## 13. Canonical Content & Prayer Engine Protection

- **Canonical Religious SHA-256 Hashes:** **10 / 10 exact bit-for-bit matches**.
- **Prayer Engine Baseline:** `packages/islamic-engine/src/prayer/prayer-calculator.ts` verified at **437 lines, 16,758 bytes**.

---

## 14. Git & File-Scope Audit

- **Source Code Mutations in Phase 1:** **Zero (0)**.
- **Configuration Mutations in Phase 1:** **Zero (0)**.
- **Docker/CI Files Created in Phase 1:** **Zero (0)** (Specification only).
- **Artifact Created:** Only `M7_PHASE1_DEPLOYMENT_PACKAGING_REPORT.md`.

---

## 15. Reconciliation of Implemented vs Merely Specified Infrastructure

- **Implemented:**
  - Production web compilation (Next.js 15.5.25, 600 static pages).
  - 16 SQL database migrations ordered and validated statically.
  - Complete regression test suites (228 package tests, 165 mobile tests).
- **Merely Specified (For M7 Phase 2):**
  - Standalone Next.js output configuration (`apps/web/next.config.mjs`).
  - Multi-stage `Dockerfile` and `.dockerignore`.
  - Android JDK 17+ and SDK installation procedure.
  - Supabase CLI deployment workflow and CI secret mappings.

---

## 16. Final Phase 1 Gate Verdict

```text
================================================================================
M7 PHASE 1 DEPLOYMENT PACKAGING SPECIFICATION PASSED WITH ENVIRONMENT BLOCKERS DOCUMENTED
SAFE TO PROCEED TO M7 PHASE 2
================================================================================
```
