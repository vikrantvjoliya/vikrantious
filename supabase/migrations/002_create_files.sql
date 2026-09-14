-- 002_create_files.sql
-- Adds a files table to store file metadata used by the app

create table if not exists files (
  id serial primary key,
  user_id text not null,
  filename text not null,
  url text,
  size bigint,
  mime text,
  created_at timestamptz default now()
);

create index if not exists idx_files_user_id on files(user_id);
