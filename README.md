# Vikrantious

A personal workspace for text notes, drawings, documents, and a small fruit-merging game. React, TypeScript, Vite, Material UI, and Supabase; deployed on Cloudflare Pages.

## Develop

Use Node.js 22.12+ or 24. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Only the public publishable/anon key belongs in the frontend; never a service-role key or database password.

```sh
npm ci
npm run dev
npm run build
npm run lint
```

## Verify

```sh
npx playwright install chromium
npm test
```

Set `BROWSER_EXECUTABLE` to use an existing Chromium-compatible browser. Tests intercept Supabase requests and cover responsive navigation, forged legacy identity rejection, login failures, note save/edit/search, preservation of failed drafts, logout, file validation/owner-scoped uploads, drawing errors, and game keyboard controls. They do not prove that production RLS is installed; use the database verification below before launch.

## Production rollout — Cloudflare Pages

**The new frontend requires Supabase Auth and migration 004. Deploying just the frontend is insufficient.** Existing username/password rows and browser-generated guest IDs are deliberately no longer accepted. There is no self-registration screen.

1. Back up the database and Storage objects. Review existing ownership with the site owner before moving data. Old guest IDs cannot safely identify a person by themselves.
2. In Supabase Auth, disable **Allow new users to sign up** and anonymous sign-ins. Create each allowed user in the dashboard with a verified email and a new password; arrange credential delivery separately. Legacy plaintext passwords must be reset, never imported as reusable credentials. Disable unused auth providers. Set the Site URL to `https://vikrantvj.com`.
3. If tables already exist, run `supabase/migrations/004_secure_workspace.sql` in Supabase SQL Editor or with `psql -v ON_ERROR_STOP=1`. For a fresh database, `npm run db:migrate:sql` uses `DATABASE_URL` and applies 001, 002, and 004. `supabase db push` is also available for a correctly linked project; migrations 001–003 are historical and 004 must be applied in the same maintenance window. Do not deploy or stop after 003.
4. Migration 004 disables the legacy users API, enables owner-only database access, makes `notes-files` private, enforces 10 MB uploads with PDF/TXT/PNG MIME types, and limits Storage paths to the authenticated user’s UUID. Restrictive guards also constrain older permissive policies. Legacy rows and objects remain intact but inaccessible until ownership is verified.
5. Using trusted administrative tools, map each verified old note owner to their new `auth.users.id`. Copy their documents to `<auth-user-id>/documents/<filename>` and their latest canvas to `<auth-user-id>/drawings/canvas.png` with the Supabase Storage API (do not rename Storage metadata with SQL). Keep a backup and a reviewed mapping. Purge any cached formerly public files through Supabase/Cloudflare; changing bucket privacy cannot recall files previously downloaded. After a verified backup and account transition, remove the legacy plaintext credential records through an approved data-retention process.
6. Run `supabase/tests/security.sql` against a staging database after the migration. Also use two real staging Auth users: A can create/read/edit/delete only A’s notes; B and signed-out clients cannot access them, even with A’s UUID or file path. Verify private downloads and attempts to upload to another user’s folder. Check files over 10 MB and disallowed MIME types are rejected by Storage.
7. Cloudflare Pages settings: build command `npm run build`, output directory `dist`, Node 24. Set the two public Vite variables in the production environment. Preview builds should use a separate staging Supabase project. Publish the reviewed build after database validation.
8. `public/_headers` supplies CSP, clickjacking protection, MIME sniffing protection, HSTS, referrer policy, and browser permission limits. `public/_redirects` handles SPA routes. These files apply to Pages static responses; any Pages Functions must set their own headers. The CSP permits standard `*.supabase.co` API endpoints; replace this with the exact project origin before rollout if possible, and update it if using a custom Supabase domain. The only inline allowance is CSS for Material UI; inline JavaScript and third-party scripts are blocked.
9. Verify response headers at `https://vikrantvj.com`, reload `/text-notes` directly, sign in, save/reload a note and canvas, upload/download a document, and sign out. Keep the hardened database policies if rolling back a frontend deployment; the old client is incompatible with those policies.

## Security scope

Identity comes from Supabase Auth, not editable legacy local-storage IDs. Authorization must be enforced by deployed RLS policies. Auth sessions expire locally after 30 minutes without interaction; this is a convenience lock, not a replacement for server-side token expiration. Rendered text is escaped by React. Documents are downloaded through authenticated Storage requests and never rendered as active HTML or embedded frames. Uploads get unique filenames; MIME/size limits run on the server and basic file checks run in the browser. The game engine is bundled rather than fetched as a runtime script.

This is application hardening, not a certification or an assessment of production data exposure. Supabase and Cloudflare account settings, access logs, caches, backups, and deployment verification require access to those services.
