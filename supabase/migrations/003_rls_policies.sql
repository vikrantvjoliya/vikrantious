-- 003_rls_policies.sql
-- Enables RLS and adds permissive policies for the anon role.
-- The app uses a custom users table (not Supabase Auth), so all
-- client requests come in under the `anon` key.

-- ============================================================
-- users table
-- ============================================================
alter table users enable row level security;

-- Allow anyone to look up a user by username+password (login)
create policy "anon can read users"
  on users for select
  to anon
  using (true);

-- Allow insertion of new user rows (registration / guest creation)
create policy "anon can insert users"
  on users for insert
  to anon
  with check (true);

-- ============================================================
-- text_notes table
-- ============================================================
alter table text_notes enable row level security;

-- Allow reading all notes (app filters by user_id client-side)
create policy "anon can read text_notes"
  on text_notes for select
  to anon
  using (true);

-- Allow inserting notes
create policy "anon can insert text_notes"
  on text_notes for insert
  to anon
  with check (true);

-- Allow updating notes
create policy "anon can update text_notes"
  on text_notes for update
  to anon
  using (true);

-- Allow deleting notes
create policy "anon can delete text_notes"
  on text_notes for delete
  to anon
  using (true);

-- ============================================================
-- files table
-- ============================================================
alter table files enable row level security;

-- Allow reading file metadata
create policy "anon can read files"
  on files for select
  to anon
  using (true);

-- Allow inserting file metadata
create policy "anon can insert files"
  on files for insert
  to anon
  with check (true);

-- Allow deleting file metadata
create policy "anon can delete files"
  on files for delete
  to anon
  using (true);
