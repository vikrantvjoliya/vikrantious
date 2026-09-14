-- 001_insert_seed_data.sql
-- Inserts minimal seed data for local development

-- Ensure we have a guest user
insert into users (id, username, password)
values ('guest-1', 'guest', 'guest')
on conflict (id) do nothing;

-- Example text notes for the guest user
insert into text_notes (user_id, content)
values
  ('guest-1', 'Welcome to Vikrantious! This is a seeded note.'),
  ('guest-1', 'Second seeded note for testing file-links.');

-- Example file metadata (app may store actual file bytes in Supabase Storage)
insert into files (user_id, filename, url, size, mime)
values
  ('guest-1', 'example.txt', 'https://example.com/example.txt', 123, 'text/plain')
on conflict do nothing;
