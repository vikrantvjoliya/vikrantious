-- Apply with the new Auth-based frontend. No legacy data is deleted or reassigned.
begin;

-- Disable the legacy plaintext credential API, including unknown permissive policies.
alter table public.users enable row level security;
revoke all on public.users from public, anon, authenticated;
drop policy if exists "block legacy credentials" on public.users;
create policy "block legacy credentials" on public.users as restrictive for all to public using (false) with check (false);

-- Restrictive ownership guards also constrain any older permissive policies.
alter table public.text_notes enable row level security;
alter table public.files enable row level security;
revoke all on public.text_notes, public.files from public, anon, authenticated;
grant select, insert, update, delete on public.text_notes, public.files to authenticated;
revoke all on sequence public.text_notes_id_seq, public.files_id_seq from public, anon;
grant usage, select on sequence public.text_notes_id_seq, public.files_id_seq to authenticated;

drop policy if exists "notes owner guard" on public.text_notes;
create policy "notes owner guard" on public.text_notes as restrictive for all to public
using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);
drop policy if exists "files owner guard" on public.files;
create policy "files owner guard" on public.files as restrictive for all to public
using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text);

-- Explicit operation policies for signed-in users.
do $$
declare tbl text; operation text;
begin
  foreach tbl in array array['text_notes', 'files'] loop
    foreach operation in array array['select', 'insert', 'update', 'delete'] loop
      execute format('drop policy if exists %I on public.%I', 'owner ' || operation, tbl);
      if operation = 'insert' then
        execute format('create policy %I on public.%I for insert to authenticated with check (user_id = (select auth.uid())::text)', 'owner ' || operation, tbl);
      elsif operation = 'update' then
        execute format('create policy %I on public.%I for update to authenticated using (user_id = (select auth.uid())::text) with check (user_id = (select auth.uid())::text)', 'owner ' || operation, tbl);
      else
        execute format('create policy %I on public.%I for %s to authenticated using (user_id = (select auth.uid())::text)', 'owner ' || operation, tbl, operation);
      end if;
    end loop;
  end loop;
end $$;

-- Private bucket, with server-enforced upload limits.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notes-files', 'notes-files', false, 10485760, array['application/pdf', 'text/plain', 'image/png'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Constrain existing policies without affecting other buckets.
drop policy if exists "workspace storage guard" on storage.objects;
create policy "workspace storage guard" on storage.objects as restrictive for all to public
using (bucket_id <> 'notes-files' or (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id <> 'notes-files' or (storage.foldername(name))[1] = (select auth.uid())::text);

do $$
declare operation text;
begin
  foreach operation in array array['select', 'insert', 'update', 'delete'] loop
    execute format('drop policy if exists %I on storage.objects', 'workspace ' || operation);
    if operation = 'insert' then
      execute format('create policy %I on storage.objects for insert to authenticated with check (bucket_id = ''notes-files'' and (storage.foldername(name))[1] = (select auth.uid())::text)', 'workspace ' || operation);
    elsif operation = 'update' then
      execute format('create policy %I on storage.objects for update to authenticated using (bucket_id = ''notes-files'' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = ''notes-files'' and (storage.foldername(name))[1] = (select auth.uid())::text)', 'workspace ' || operation);
    else
      execute format('create policy %I on storage.objects for %s to authenticated using (bucket_id = ''notes-files'' and (storage.foldername(name))[1] = (select auth.uid())::text)', 'workspace ' || operation, operation);
    end if;
  end loop;
end $$;
commit;
