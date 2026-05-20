-- Profiles
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  full_name text,
  company text,
  vat_number text,
  address text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles for all using (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (user_id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Deals
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sponsor_name text not null,
  contact_name text,
  contact_email text,
  status text not null default 'lead' check (status in ('lead','negotiation','contract','invoiced','paid','cancelled')),
  amount numeric default 0,
  currency text default 'EUR',
  platform text,
  notes text,
  publish_date date,
  payment_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table deals enable row level security;
create policy "Users manage own deals" on deals for all using (auth.uid() = user_id);
create index deals_user_id_idx on deals(user_id);
create index deals_status_idx on deals(status);

-- Contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  notes text,
  created_at timestamptz default now()
);
alter table contacts enable row level security;
create policy "Users manage own contacts" on contacts for all using (auth.uid() = user_id);
create index contacts_user_id_idx on contacts(user_id);
