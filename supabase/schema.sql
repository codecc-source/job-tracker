-- 1. Table for each user's jobs
create table public.applications (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null check (pg_column_size(data) < 500000),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

create index applications_user_updated on public.applications (user_id, updated_at desc);

-- 2. Row Level Security: each user can only see and change their own rows
alter table public.applications enable row level security;

create policy "Users manage their own applications"
  on public.applications
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 3. Lets a signed-in user delete their own account and all their data
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
