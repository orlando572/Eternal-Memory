-- Run only against Eternal Memory. Requires an existing admin and normal account.
-- Simulates database JWT claims for RLS checks, without logging in or changing data.
-- All settings are local to this transaction and are discarded by ROLLBACK.
begin;

select set_config('role_check.admin_id', (
  select user_id::text from public.staff_roles where role = 'admin' limit 1
), true);
select set_config('role_check.user_id', (
  select id::text from auth.users u
  where not exists (select 1 from public.staff_roles s where s.user_id = u.id)
  limit 1
), true);

select set_config('request.jwt.claims', jsonb_build_object(
  'sub', current_setting('role_check.admin_id'), 'role', 'authenticated'
)::text, true);
set local role authenticated;

do $check$
begin
  if auth.uid() is null or not exists (
    select 1 from public.staff_roles where user_id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Admin role lookup failed';
  end if;
  if (select count(*) from public.staff_roles) <> 1 then
    raise exception 'Admin must only read the own role assignment';
  end if;
  if has_table_privilege(current_user, 'public.staff_roles', 'INSERT')
    or has_table_privilege(current_user, 'public.staff_roles', 'UPDATE')
    or has_table_privilege(current_user, 'public.staff_roles', 'DELETE') then
    raise exception 'Application account can change role assignments';
  end if;
end;
$check$;

reset role;
select set_config('request.jwt.claims', jsonb_build_object(
  'sub', current_setting('role_check.user_id'), 'role', 'authenticated',
  'user_metadata', jsonb_build_object('role', 'admin')
)::text, true);
set local role authenticated;

do $check$
begin
  if auth.uid() is null then raise exception 'Missing normal account for verification'; end if;
  if exists (select 1 from public.staff_roles) then
    raise exception 'Normal account can see an administrator assignment';
  end if;
  begin
    perform public.save_admin_product('{}'::jsonb);
    raise exception 'Normal account was allowed to call product administration';
  exception
    when insufficient_privilege then null;
  end;
end;
$check$;

rollback;
