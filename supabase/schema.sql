-- =========================================================
-- DÖNER DIOSA FORTUNA — schema Supabase
-- Rulează acest fișier în Supabase Studio → SQL Editor.
-- Este sigur de rulat o singură dată pe un proiect nou.
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- Tabele
-- ---------------------------------------------------------

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subcategories (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references categories(id) on delete cascade,
  subcategory_id uuid references subcategories(id) on delete set null,
  name text not null,
  description text,
  ingredients text,
  price numeric(10, 2) not null default 0,
  image_url text,
  available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Grupuri de opțiuni per produs (ex: "Mărime", "Extra")
create table if not exists product_option_groups (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  type text not null default 'single' check (type in ('single', 'multiple')),
  required boolean not null default false,
  display_order integer not null default 0
);

-- Opțiuni individuale (ex: "Mare" +5 lei)
create table if not exists product_option_choices (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references product_option_groups(id) on delete cascade,
  label text not null,
  price_delta numeric(10, 2) not null default 0,
  display_order integer not null default 0
);

create table if not exists restaurant_settings (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'DÖNER DIOSA FORTUNA',
  logo_url text,
  description text,
  address text,
  phone text,
  opening_hours text,
  primary_color text default '#a51d24',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexuri utile
create index if not exists idx_subcategories_category on subcategories(category_id);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_subcategory on products(subcategory_id);
create index if not exists idx_option_groups_product on product_option_groups(product_id);
create index if not exists idx_option_choices_group on product_option_choices(group_id);

-- ---------------------------------------------------------
-- Trigger: actualizează automat "updated_at"
-- ---------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

drop trigger if exists trg_subcategories_updated_at on subcategories;
create trigger trg_subcategories_updated_at
  before update on subcategories
  for each row execute function set_updated_at();

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

drop trigger if exists trg_restaurant_settings_updated_at on restaurant_settings;
create trigger trg_restaurant_settings_updated_at
  before update on restaurant_settings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- Row Level Security
-- Citire publică (necesară pentru carta digitală), scriere
-- permisă exclusiv utilizatorilor autentificați (administrator).
-- ---------------------------------------------------------

alter table categories enable row level security;
alter table subcategories enable row level security;
alter table products enable row level security;
alter table product_option_groups enable row level security;
alter table product_option_choices enable row level security;
alter table restaurant_settings enable row level security;

-- Citire publică
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories for select using (true);

drop policy if exists "public read subcategories" on subcategories;
create policy "public read subcategories" on subcategories for select using (true);

drop policy if exists "public read products" on products;
create policy "public read products" on products for select using (true);

drop policy if exists "public read option groups" on product_option_groups;
create policy "public read option groups" on product_option_groups for select using (true);

drop policy if exists "public read option choices" on product_option_choices;
create policy "public read option choices" on product_option_choices for select using (true);

drop policy if exists "public read settings" on restaurant_settings;
create policy "public read settings" on restaurant_settings for select using (true);

-- Scriere doar pentru utilizatori autentificați (administrator)
drop policy if exists "admin write categories" on categories;
create policy "admin write categories" on categories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin write subcategories" on subcategories;
create policy "admin write subcategories" on subcategories
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin write products" on products;
create policy "admin write products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin write option groups" on product_option_groups;
create policy "admin write option groups" on product_option_groups
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin write option choices" on product_option_choices;
create policy "admin write option choices" on product_option_choices
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin write settings" on restaurant_settings;
create policy "admin write settings" on restaurant_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- Storage: bucket public pentru imagini produse + logo
-- ---------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "admin write product images" on storage.objects;
create policy "admin write product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ---------------------------------------------------------
-- IMPORTANT: baza de date pornește complet goală.
-- Nu se inserează categorii, subcategorii sau produse demo.
-- Administratorul va construi carta din panoul /admin.
-- ---------------------------------------------------------
