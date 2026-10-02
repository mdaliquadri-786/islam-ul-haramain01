# MILESTONE M8 PHASE 3 — WEB APPLICATION ERROR BOUNDARIES & API ERROR HARDENING REPORT

**Project:** ISLAM UL HARAMAIN / إسلام الحرمين  
**Repository:** `D:\ISLAMIC-PLATFORM`  
**Phase:** Milestone M8 Phase 3 — Web Application Error Boundaries & API Error Hardening  
**Status:** **PASSED WITH ENVIRONMENT LIMITATIONS DOCUMENTED**  
**Date:** October 1, 2026  

---

## 1. Executive Summary & Verification Verdict

Milestone M8 Phase 3 has successfully established client-side and server-side fault tolerance across the Next.js 15.5.25 web platform. Route-segment error boundaries, root global fallback boundaries, multilingual 404 pages, and privacy-preserving API error normalization have been implemented without mutating package dependencies, breaking canonical religious integrity, or exposing devotional or personal user data.

```text
================================================================================
FINAL VERDICT:
M8 PHASE 3 WEB ERROR BOUNDARIES & API ERROR HARDENING PASSED WITH ENVIRONMENT LIMITATIONS DOCUMENTED
SAFE TO PROCEED TO M8 PHASE 4
================================================================================
```

### Key Verification Metrics
* **Next.js Production Build:** `PASS` (603 static pages prerendered across `/en`, `/ar`, `/ur`)
* **Monorepo Typecheck:** `PASS` (0 errors across `@islamic/ui`, `@islamic/islamic-engine`, `@islamic/database`, `@islamic/web`)
* **Web Error Boundary & API Tests:** `PASS` (10 / 10 passed in `apps/web/test/error-boundaries-and-api.test.ts`)
* **Web Health Endpoint Tests:** `PASS` (5 / 5 passed in `apps/web/test/health-endpoints.test.ts`)
* **Islamic Engine Unit Tests:** `PASS` (228 / 228 passed across 55 test suites)
* **Flutter Analyzer:** `PASS` (0 issues found via `flutter analyze --no-pub`)
* **Flutter Unit Tests:** `PASS` (165 / 165 passed via `flutter test --no-pub`)
* **Canonical SHA-256 Hashes:** `PASS` (10 / 10 exact bit-level matches)
* **Prayer Calculator Integrity:** `PASS` (437 lines, 16,758 bytes exact match)
* **Security & Secret Leak Scan:** `PASS` (0 secrets, service-role keys, tokens, or PII exposed)

---

## 2. Architecture & Design Principles

In alignment with Milestone M8 Phase 1 Telemetry Contracts and Phase 2 Structured Logging specifications, Phase 3 implements resilient error handling based on four non-negotiable architectural tenets:

1. **Sacred Data Protection:** Error messages, stack traces, and client-facing responses must never leak religious search terms (Quran verses, Hadith queries, Duas, personal devotional reflections), user location coordinates, or authentication tokens.
2. **Dignified Trilingual UX:** Error boundaries and 404 pages present calm, reverent, and actionable recovery paths across English, Arabic (`ar`), and Urdu (`ur`), respecting bidirectional typography (`dir="rtl"`).
3. **Trace Propagation:** Outgoing error responses retain the request transaction identifiers (`X-Correlation-ID` and `X-Request-ID`), allowing developers and operations engineers to correlate client-observed errors with server-side audit logs.
4. **No Commercial SDKs:** Retained complete autonomy and privacy compliance without external telemetry vendors or commercial trackers.

---

## 3. Implementation Details

### 3.1 Route-Segment Error Boundaries (`error.tsx`)
- **Localized Segment Boundary:** [`apps/web/src/app/[locale]/error.tsx`](file:///D:/ISLAMIC-PLATFORM/apps/web/src/app/[locale]/error.tsx)
  - Intercepts rendering and runtime errors occurring within localized route hierarchies (`/[locale]/*`).
  - Supports RTL layout rendering for Arabic and Urdu.
  - Formats errors using calm, peaceful vernacular:
    - English: *"An unexpected error occurred. Please try again or return to the home sanctuary."*
    - Arabic: *"حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية."*
    - Urdu: *"ایک غیر متوقع خرابی پیش آگئی ہے۔ براہ کرم دوبارہ کوشش کریں یا مرکزی صفحہ پر واپس جائیں۔"*
  - Supplies an interactive `reset()` button and a direct link to the locale sanctuary home.
  - Automatically captures unhandled client exceptions into structured logging with correlation context.
- **Unlocalized Segment Boundary:** [`apps/web/src/app/error.tsx`](file:///D:/ISLAMIC-PLATFORM/apps/web/src/app/error.tsx)
  - Fallback error boundary for top-level non-localized paths (`/admin`, `/books`, `/prayer-times`, etc.).

### 3.2 Root Global Error Boundary (`global-error.tsx`)
- **Path:** [`apps/web/src/app/global-error.tsx`](file:///D:/ISLAMIC-PLATFORM/apps/web/src/app/global-error.tsx)
- Replaces the entire root layout (`<html>` and `<body>`) when a catastrophic error prevents the root layout from rendering.
- Zero-dependency styling using CSS inline styles to ensure graceful rendering even if CSS bundles fail to load.
- Provides trilingual guidance and recovery actions (`reset()` and `/`).

### 3.3 Multilingual Not-Found Handlers (`not-found.tsx`)
- **Localized Not-Found Page:** [`apps/web/src/app/[locale]/not-found.tsx`](file:///D:/ISLAMIC-PLATFORM/apps/web/src/app/[locale]/not-found.tsx)
  - Renders when `notFound()` is invoked inside any localized route segment or for non-existent localized paths.
  - Preserves locale navigation and provides direct navigation shortcuts to Holy Quran (`/[locale]/quran`), Hadith collections (`/[locale]/hadith`), and the Sanctuary Home (`/[locale]`).
  - Native RTL bidirectional layout support.
- **Root Not-Found Page:** [`apps/web/src/app/not-found.tsx`](file:///D:/ISLAMIC-PLATFORM/apps/web/src/app/not-found.tsx)
  - Renders when an unlocalized or invalid URL is accessed.
  - Serves a trilingual portal linking directly to English, Arabic, and Urdu entrypoints.

### 3.4 Standardized API Error Normalization
- **Path:** [`apps/web/src/lib/api-errors.ts`](file:///D:/ISLAMIC-PLATFORM/apps/web/src/lib/api-errors.ts)
- Transforms arbitrary exceptions into consistent, privacy-safe JSON responses adhering to the format:
  ```json
  {
    "error": {
      "code": "INTERNAL_SERVER_ERROR",
      "message": "An unexpected error occurred while processing your request.",
      "correlationId": "corr_c86bf4148b1d9bf5b27ac6a4611481b3",
      "requestId": "req_8e22851fe69be0152431fae8006cb8c3",
      "timestamp": "2026-10-01T11:45:00.000Z"
    }
  }
  ```
- **Error Mapping & Status Normalization:**
  - `ApiError`: Typed error class with custom status codes and machine-readable error codes.
  - `400 BAD_REQUEST`: Invalid input formats, payload validation errors.
  - `401 UNAUTHORIZED`: Authentication required.
  - `403 FORBIDDEN`: Insufficient role or access permissions.
  - `404 NOT_FOUND`: Resource does not exist.
  - `408 REQUEST_TIMEOUT`: Gateway or upstream timeout.
  - `409 CONFLICT`: Resource duplicate or version conflict.
  - `429 TOO_MANY_REQUESTS`: Rate limit exceeded.
  - `500 INTERNAL_SERVER_ERROR`: Generic server exceptions; internal stack traces redacted.
  - `503 SERVICE_UNAVAILABLE`: Maintenance or database offline.
  - `504 GATEWAY_TIMEOUT`: Upstream provider unreachable.
- **Database Error Sanitization:**
  - Raw PostgreSQL/Supabase errors (e.g., `duplicate key value violates unique constraint "users_pkey"`) are intercepted and translated to generic, safe descriptions. Table names, schema details, and database constraint names are completely masked from external consumers.
- **Header Preservation:**
  - Injects `X-Correlation-ID` and `X-Request-ID` into the `NextResponse` headers.

### 3.5 Observability Integration
- **Path:** [`apps/web/src/lib/observability.ts`](file:///D:/ISLAMIC-PLATFORM/apps/web/src/lib/observability.ts)
- `withRequestCorrelation` now wraps route handler execution in `handleApiError`, ensuring any unhandled error inside an API route produces a normalized, sanitized JSON response with correlation context and structured logging.

---

## 4. Test Suite Execution & Privacy Proof

A dedicated test suite was created in [`apps/web/test/error-boundaries-and-api.test.ts`](file:///D:/ISLAMIC-PLATFORM/apps/web/test/error-boundaries-and-api.test.ts):

```text
✔ GlobalError component renders valid fallback markup without crashing (7.7ms)
✔ Unlocalized Error component renders fallback markup and action button (2.6ms)
✔ Localized Error component renders localized copy for en, ar, and ur with RTL support (4.2ms)
✔ Root NotFound component renders trilingual navigation portal (2.6ms)
✔ Localized NotFound component renders localized copy and Islamic navigation links (2.9ms)
✔ handleApiError formats standard ApiError with correct status code and correlation headers (3.8ms)
✔ handleApiError masks internal error details and stack traces from 500 response (1.7ms)
✔ handleApiError sanitizes database constraint errors without leaking schema names (1.5ms)
✔ handleApiError maps known status codes accurately (400, 401, 403, 404, 409, 429, 503) (3.5ms)
✔ Privacy proof: handleApiError and scrubber never leak religious queries, auth tokens, coordinates, or PII (3.5ms)

ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5122.9
```

### Privacy Redaction Test Assertions
The test suite explicitly validated that:
1. Coordinates (`21.4225, 39.8262`) are scrubbed before logging and absent from responses.
2. Religious search inputs (`surah 2 ayah 255 search text`, `bukhari 1 intentions`, `rabbana atina...`) are replaced with `[REDACTED_RELIGIOUS_QUERY]`.
3. Devotional notes (`my confidential devotional reflection note`) are sanitized to `[REDACTED_NOTE]`.
4. Auth tokens (`Bearer eyJ...`) and email addresses are scrubbed from all logging pipelines.

---

## 5. Comprehensive System Verification Matrix

| Validation Layer | Command / File | Result | Details |
| :--- | :--- | :---: | :--- |
| **Next.js Production Build** | `pnpm --filter ./apps/web build` | **PASS** | 603 static pages generated across `/en`, `/ar`, `/ur` |
| **Monorepo Typecheck** | `pnpm typecheck` | **PASS** | 0 type errors across all 4 monorepo packages |
| **Web Error Boundary Tests** | `tsx --test test/error-boundaries-and-api.test.ts` | **PASS** | 10 / 10 unit & integration tests passed |
| **Web Health Endpoint Tests** | `tsx --test test/health-endpoints.test.ts` | **PASS** | 5 / 5 health tests passed |
| **Islamic Engine Tests** | `pnpm --filter ./packages/islamic-engine test` | **PASS** | 228 / 228 unit tests passed |
| **Flutter Analyzer** | `flutter analyze --no-pub` | **PASS** | 0 issues found |
| **Flutter Unit Tests** | `flutter test --no-pub` | **PASS** | 165 / 165 tests passed |
| **Security & Leak Audit** | Automated string scan | **PASS** | 0 exposed secrets or sensitive patterns |
| **Canonical Hashes** | SHA-256 verification script | **PASS** | 10 / 10 exact matches |
| **Prayer Calculator** | `prayer-calculator.ts` byte & line audit | **PASS** | 437 lines, 16,758 bytes exact match |

---

## 6. Canonical Religious Content SHA-256 Verification

| Canonical Relative Path | Authoritative SHA-256 Hash | Status |
| :--- | :--- | :---: |
| `supabase/seed_quran.sql` | `0D43F8B0A7929C4E8E358A4F81C67ED2D716E3B10FA881D591A085F55A649AE1` | **MATCH** |
| `supabase/seed_quran_translations.sql` | `450127FC6A15442F782CC8DF9ED80EB8C42448924F5BC48196EEFEC630A09751` | **MATCH** |
| `supabase/seed_hadith.sql` | `0B8D170D1620BE22254CAAC0B98F5A45E9127610B896307D6C0EA9455A04EDE2` | **MATCH** |
| `supabase/seed_duas.sql` | `9B93D48AFCB1A2D1468C4D78EE39EB5B5EE2FBB1073BA4FED4C5001FA212B89B` | **MATCH** |
| `docs/ISLAMIC_METHODOLOGY.md` | `7A58C0FA4E1E413741697C47298DE9D648018C960965A8723339E856F12C1533` | **MATCH** |
| `docs/AQEEDAH_GOVERNANCE.md` | `7D062A43603818D9C022A652682477D5BA065C32DFEB6BEC741956AD074A6099` | **MATCH** |
| `docs/FIQH_METHODOLOGY.md` | `E1170E6969C3290D27FA8B2F46C672F9DCC3BDDE7F3ABBC06E1C15957DB65FF8` | **MATCH** |
| `docs/RELIGIOUS_CONTENT_POLICY.md` | `4FD117FB64865B02F5667F0F6EC8E1CDA4C5C927797B1EE0330F1DC39DE2934F` | **MATCH** |
| `docs/RELIGIOUS_CONTENT_REVIEW.md` | `BEE4BE27E3F528CE5ACD313437E790290EBEB1AF870213265D4503BCA77B98A7` | **MATCH** |
| `docs/CONTENT_LICENSE_MATRIX.md` | `912C469676CC14C3FE7DDECEB2ADE9B15E8ED5197380359AC68CEF15688FBE73` | **MATCH** |

---

## 7. Protected Files & Manifest Integrity

All core manifests and configuration files remain pristine:
- `package.json`: Untouched
- `pnpm-lock.yaml`: Untouched
- `apps/mobile/pubspec.yaml`: Untouched
- `apps/mobile/pubspec.lock`: Untouched
- `supabase/migrations/`: Exactly 16 sequential migrations present and unmodified
- `packages/islamic-engine/src/prayer/prayer-calculator.ts`: Exactly 437 lines, 16,758 bytes

---

## 8. Documented Environment Limitations

The following prerequisites remain documented and preserved across all operational runs:
1. **Android SDK / JDK 17+:** Required for generating release `.aab` / `.apk` bundles.
2. **macOS / Xcode:** Required for compiling iOS IPA release binaries.
3. **Docker Daemon:** Local daemon unavailable on Windows dev host; containerized probes run via CI or remote staging.
4. **Live Supabase Instance:** Live database credentials not committed; health endpoints and API error boundaries operate in offline/mock fallback mode during test suites.

---

## 9. Conclusion & Milestone Gate Status

Milestone M8 Phase 3 has fulfilled all objectives. The Next.js web application is now protected by structured error boundaries and normalized, privacy-preserving API error handling. 

**Milestone M8 Phase 3 is formally CLOSED.**
Proceed to **Milestone M8 Phase 4 — Mobile Error Handling & Offline Diagnostics**.
