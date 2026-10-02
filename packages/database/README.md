# @islamic/database

**Status:** Milestone 1.1 Boundary Skeleton  
**Purpose:** Typed database client interfaces, data transfer objects (DTOs), and query abstractions for Supabase PostgreSQL.

## Architectural Boundaries
* Exposes clean entity interfaces (`SurahEntity`, `AyahEntity`, `BookmarkEntity`) rather than raw unchecked tables.
* Database clients (SSR Server Client, Browser Client, Admin Service Role Client) will be encapsulated here in Milestone 1.2.
* Zero production secrets or connection strings are stored in this package.
