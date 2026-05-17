
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- measurements (latest per user; we keep history)
create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  gender text,
  height_cm numeric,
  weight_kg numeric,
  age int,
  body_type text,
  preferred_fit text,
  size text,
  country text,
  chest_cm numeric,
  waist_cm numeric,
  hips_cm numeric,
  category text,
  created_at timestamptz not null default now()
);
alter table public.measurements enable row level security;
create policy "measurements_select_own" on public.measurements for select using (auth.uid() = user_id);
create policy "measurements_insert_own" on public.measurements for insert with check (auth.uid() = user_id);
create policy "measurements_update_own" on public.measurements for update using (auth.uid() = user_id);
create policy "measurements_delete_own" on public.measurements for delete using (auth.uid() = user_id);
create index measurements_user_created_idx on public.measurements (user_id, created_at desc);

-- chat threads
create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.chat_threads enable row level security;
create policy "threads_all_own" on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index chat_threads_user_idx on public.chat_threads (user_id, updated_at desc);

-- chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  parts jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "messages_all_own" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index chat_messages_thread_idx on public.chat_messages (thread_id, created_at asc);

-- wishlist
create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  title text not null,
  image_url text,
  price text,
  brand text,
  store text,
  url text,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
alter table public.wishlist enable row level security;
create policy "wishlist_all_own" on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
