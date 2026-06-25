-- Drop existing objects (for clean reset if needed)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user;
drop table if exists audit_logs cascade;
drop table if exists fixed_costs cascade;
drop table if exists bazar_rotation cascade;
drop table if exists bazar_entries cascade;
drop table if exists meals cascade;
drop table if exists deposits cascade;
drop table if exists profiles cascade;
drop type if exists user_role;
drop type if exists rotation_status;

-- Types
create type user_role as enum ('admin', 'member');
create type rotation_status as enum ('upcoming', 'done', 'skipped');

-- PROFILES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  role user_role default 'member'::user_role not null,
  avatar_color text default '#00b4a6',
  must_change_password boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can update any profile" on profiles for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- DEPOSITS
create table deposits (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references profiles(id) on delete cascade not null,
  amount numeric(10,2) not null check (amount > 0),
  month integer not null check (month between 1 and 12),
  year integer not null,
  note text,
  added_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Deposits
alter table deposits enable row level security;
create policy "Deposits viewable by everyone" on deposits for select using (true);
create policy "Admins can manage deposits" on deposits for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- MEALS
create table meals (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  count numeric(4,1) not null check (count >= 0),
  added_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(member_id, date)
);

-- RLS: Meals
alter table meals enable row level security;
create policy "Meals viewable by everyone" on meals for select using (true);
create policy "Users can manage own meals" on meals for all using (auth.uid() = member_id);
create policy "Admins can manage all meals" on meals for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- BAZAR ENTRIES
create table bazar_entries (
  id uuid default gen_random_uuid() primary key,
  amount numeric(10,2) not null check (amount > 0),
  date date not null,
  items_note text,
  duty_member uuid references profiles(id) on delete set null,
  month integer not null check (month between 1 and 12),
  year integer not null,
  added_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Bazar Entries
alter table bazar_entries enable row level security;
create policy "Bazar viewable by everyone" on bazar_entries for select using (true);
create policy "Admins can manage bazar" on bazar_entries for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- BAZAR ROTATION
create table bazar_rotation (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references profiles(id) on delete cascade not null,
  assigned_date date not null,
  status rotation_status default 'upcoming'::rotation_status not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(assigned_date)
);

-- RLS: Rotation
alter table bazar_rotation enable row level security;
create policy "Rotation viewable by everyone" on bazar_rotation for select using (true);
create policy "Admins can manage rotation" on bazar_rotation for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- FIXED COSTS
create table fixed_costs (
  id uuid default gen_random_uuid() primary key,
  category text not null check (category in ('rent', 'gas', 'electricity', 'internet', 'other')),
  amount numeric(10,2) not null check (amount > 0),
  month integer not null check (month between 1 and 12),
  year integer not null,
  note text,
  added_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Fixed Costs
alter table fixed_costs enable row level security;
create policy "Fixed costs viewable by everyone" on fixed_costs for select using (true);
create policy "Admins can manage fixed costs" on fixed_costs for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- AUDIT LOGS
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  event_type text not null,
  description text not null,
  metadata jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Audit Logs (Append Only, even for admins!)
alter table audit_logs enable row level security;
create policy "Audit logs viewable by everyone" on audit_logs for select using (true);
create policy "Authenticated users can insert audit logs" on audit_logs for insert with check (auth.role() = 'authenticated');
-- No update or delete policies intentionally.
