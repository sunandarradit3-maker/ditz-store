-- DiTz Store production schema (Supabase/PostgreSQL)
create extension if not exists pgcrypto;

create table if not exists public.customers (
  id uuid primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null default 'Lainnya',
  price bigint not null check (price >= 0),
  old_price bigint,
  badge text default '',
  icon text default '◆',
  description text default '',
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  items jsonb not null,
  subtotal bigint not null check (subtotal >= 0),
  total bigint not null check (total >= 0),
  payment_method text not null,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','failed','refunded')),
  status text not null default 'pending' check (status in ('pending','processing','completed','cancelled')),
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_code_idx on public.orders(code);
create index if not exists orders_customer_idx on public.orders(customer_id);
create index if not exists orders_created_idx on public.orders(created_at desc);

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
-- No public policies are needed because production writes/reads happen server-side using the service role key.
