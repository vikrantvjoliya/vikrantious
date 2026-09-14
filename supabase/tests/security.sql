-- Run against staging after migration 004 with psql -v ON_ERROR_STOP=1.
-- Test fixtures are rolled back. No auth.users records are needed for JWT-policy checks.
begin;
insert into public.text_notes(user_id, content) values
('11111111-1111-4111-8111-111111111111', 'security-test-owner-a'),
('22222222-2222-4222-8222-222222222222', 'security-test-owner-b');
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
do $$
begin
  if (select count(*) from public.text_notes where content like 'security-test-owner-%') <> 1 then raise exception 'Owner isolation failed'; end if;
  begin
    insert into public.text_notes(user_id, content) values ('22222222-2222-4222-8222-222222222222', 'forbidden');
    raise exception 'Cross-owner insert was allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    perform * from public.users;
    raise exception 'Legacy credentials were readable';
  exception when insufficient_privilege then null;
  end;
  update public.text_notes set content = 'forbidden' where user_id = '22222222-2222-4222-8222-222222222222';
  if found then raise exception 'Cross-owner update was allowed'; end if;
  delete from public.text_notes where user_id = '22222222-2222-4222-8222-222222222222';
  if found then raise exception 'Cross-owner delete was allowed'; end if;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
begin
  begin
    perform * from public.text_notes;
    raise exception 'Anonymous note access was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'notes-files' and public = false and file_size_limit = 10485760) then raise exception 'Private bucket limits missing'; end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'workspace storage guard' and permissive = 'RESTRICTIVE') then raise exception 'Storage ownership guard missing'; end if;
end $$;
rollback;
