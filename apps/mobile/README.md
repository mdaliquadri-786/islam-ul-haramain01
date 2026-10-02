# Mobile Application Placeholder (Flutter)

**Directory:** `apps/mobile`  
**Status:** Reserved Architecture Boundary (Phase 5)  
**SDK Target:** Flutter 3.x / Dart 3.x  

## Mobile Architecture Boundary
Per Phase 0 decisions and Milestone 1.1 rules:
* The Flutter cross-platform mobile application is scheduled for implementation in **Phase 5**.
* Flutter SDK is not currently installed in the host environment; full mobile project scaffolding is deferred until Phase 5.
* **Mobile-Awareness Guarantee:**
  * The backend Supabase schemas, Row Level Security (RLS) rules, and API contracts being built in Phases 1–3 use UUIDs, `client_mutation_id`, `updated_at`, and soft-delete flags specifically designed for future Flutter consumption (`supabase_flutter`, Drift SQLite).
