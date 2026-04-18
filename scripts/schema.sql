-- ============================================================
-- Bubble Bliss — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Categories
create table if not exists categories (
  id serial primary key,
  slug text unique not null,
  name text not null,
  sort_order integer default 0
);

-- Products
create table if not exists products (
  id serial primary key,
  slug text unique not null,
  name text not null,
  description text,
  category_id integer references categories(id),
  price_in_pesewas integer,
  is_active boolean default true,
  in_stock boolean default true,
  sort_order integer default 0,
  image text
);

-- Product variants (e.g. shawarma sizes)
create table if not exists product_variants (
  id serial primary key,
  product_id integer references products(id) on delete cascade,
  key text not null,
  label text not null,
  price_in_pesewas integer not null,
  sort_order integer default 0,
  unique(product_id, key)
);

-- Toppings
create table if not exists toppings (
  id serial primary key,
  name text unique not null,
  price_in_pesewas integer not null,
  is_active boolean default true,
  in_stock boolean default true,
  sort_order integer default 0
);

-- Orders
create table if not exists orders (
  id serial primary key,
  phone text not null,
  customer_name text,
  location_text text not null,
  notes text,
  status text default 'pending',
  payment_status text default 'unpaid',
  total_pesewas integer not null,
  client_reference text unique not null,
  hubtel_checkout_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order items
create table if not exists order_items (
  id serial primary key,
  order_id integer references orders(id) on delete cascade,
  product_id integer,
  variant_id integer,
  product_name text not null,
  variant_label text,
  unit_pesewas integer not null,
  quantity integer not null,
  sugar_level text,
  spice_level text,
  note text
);

-- Order item toppings
create table if not exists order_item_toppings (
  id serial primary key,
  order_item_id integer references order_items(id) on delete cascade,
  topping_id integer,
  topping_name text not null,
  topping_base_pesewas integer not null,
  price_applied_pesewas integer not null
);

-- ============================================================
-- Row Level Security
-- All reads/writes go through server-side API routes using
-- the secret key (service_role), which bypasses RLS entirely.
-- Enabling RLS blocks any direct/public access to the tables.
-- ============================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table toppings enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_item_toppings enable row level security;
