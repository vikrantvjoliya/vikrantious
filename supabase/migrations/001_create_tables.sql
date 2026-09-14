-- 001_create_tables.sql
-- Creates application tables used by the app

-- Users table (IDs are stored as text to support guest UUIDs and simple string IDs)
create table if not exists users (
  id text primary key,
  username text unique not null,
  password text not null,
  created_at timestamptz default now()
);

-- Text notes table
create table if not exists text_notes (
  id serial primary key,
  user_id text not null,
  content text,
  created_at timestamptz default now()
);

create index if not exists idx_text_notes_user_id on text_notes(user_id);
