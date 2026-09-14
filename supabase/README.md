# Database rollout

See the repository README for the complete Auth transition and Cloudflare Pages rollout.

- 001–003 are historical migrations for the legacy application.
- **004_secure_workspace.sql is required for the current client.** It preserves existing data, denies access to the plaintext credentials table, and adds restrictive owner-only guards to notes and Storage.
- The private bucket is created/configured by migration 004; do not create it as public.
- Legacy seeds describe the old username/password model and are not valid Supabase Auth accounts. Do not seed them in production.
- `tests/security.sql` is a rollback-only staging check of note ownership and legacy credential denial. It must be run with a privileged database connection after migrations, never embedded in browser code.
