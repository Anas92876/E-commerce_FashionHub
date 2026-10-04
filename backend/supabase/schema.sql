-- =====================================================================
-- FashionHub - Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> Run
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------
-- USERS (custom auth: bcrypt hash + JWT issued by the Express API)
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id                    uuid primary key default gen_random_uuid(),
  first_name            text not null,
  last_name             text not null,
  email                 text not null unique check (email = lower(email)),
  password              text not null,
  role                  text not null default 'customer' check (role in ('customer', 'admin')),
  shipping_address      jsonb,
  email_preferences     jsonb not null default '{
    "orderUpdates": true, "promotional": true, "newArrivals": false,
    "priceDrops": true, "backInStock": true, "reviewRequests": true, "newsletter": false
  }'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text unique,
  image      text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PRODUCTS
-- variants is a JSON array with the same shape the API has always used:
-- [{ sku, color: {name, hex, code}, images: [url], priceOverride,
--    sizes: [{ size, stock, sku, lowStockThreshold }], isActive, createdAt }]
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null,
  base_price  numeric(10, 2) check (base_price >= 0),
  category    text not null,
  variants    jsonb not null default '[]'::jsonb,

  -- legacy fields (products without variants)
  price       numeric(10, 2) check (price >= 0),
  image       text not null default '',
  sizes       text[] not null default '{}',
  stock       integer not null default 0 check (stock >= 0),

  rating      numeric(2, 1) not null default 0 check (rating between 0 and 5),
  num_reviews integer not null default 0 check (num_reviews >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_category_active_idx on public.products (category, is_active);
create index if not exists products_created_at_idx on public.products (created_at desc);

-- ---------------------------------------------------------------------
-- ORDERS
-- items: [{ product, name, price, quantity, size, image, variantSku, color, sizeSku }]
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  id_text          text generated always as (id::text) stored, -- lets admins search by partial order id
  user_id          uuid references public.users (id) on delete set null,
  items            jsonb not null,
  shipping_address jsonb not null,
  payment_method   text not null default 'Cash on Delivery' check (payment_method in ('Cash on Delivery', 'COD')),
  items_price      numeric(10, 2) not null default 0,
  shipping_price   numeric(10, 2) not null default 0,
  total_price      numeric(10, 2) not null default 0,
  status           text not null default 'Pending'
                   check (status in ('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  is_paid          boolean not null default false,
  paid_at          timestamptz,
  is_delivered     boolean not null default false,
  delivered_at     timestamptz,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- ---------------------------------------------------------------------
-- REVIEWS (one per user per product)
-- ---------------------------------------------------------------------
create table if not exists public.reviews (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products (id) on delete cascade,
  user_id           uuid not null references public.users (id) on delete cascade,
  rating            integer not null check (rating between 1 and 5),
  comment           text not null check (char_length(comment) <= 500),
  verified_purchase boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (product_id, user_id)
);

-- ---------------------------------------------------------------------
-- CONTACTS (contact form messages)
-- ---------------------------------------------------------------------
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text not null,
  message    text not null,
  status     text not null default 'new' check (status in ('new', 'read', 'replied')),
  is_read    boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers
drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
drop trigger if exists reviews_updated_at on public.reviews;
create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();
drop trigger if exists contacts_updated_at on public.contacts;
create trigger contacts_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Keep products.rating / num_reviews in sync with reviews
-- ---------------------------------------------------------------------
create or replace function public.refresh_product_rating()
returns trigger language plpgsql as $$
declare
  v_product uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p
     set rating      = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = v_product), 0),
         num_reviews = (select count(*) from public.reviews r where r.product_id = v_product)
   where p.id = v_product;
  return null;
end $$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- ---------------------------------------------------------------------
-- adjust_stock: atomically add p_delta (negative = decrement) to the stock of
-- one variant size, or to the legacy stock column when p_variant_sku is null.
-- Raises an exception (and changes nothing) if stock would go below zero.
-- ---------------------------------------------------------------------
create or replace function public.adjust_stock(
  p_product_id  uuid,
  p_variant_sku text,
  p_size        text,
  p_delta       integer
) returns integer language plpgsql as $$
declare
  v_variants jsonb;
  v_vi       integer;
  v_si       integer;
  v_stock    integer;
  v_new      integer;
begin
  select variants into v_variants from public.products where id = p_product_id for update;
  if not found then
    raise exception 'Product not found';
  end if;

  if p_variant_sku is null or jsonb_array_length(v_variants) = 0 then
    update public.products set stock = stock + p_delta
     where id = p_product_id and stock + p_delta >= 0
     returning stock into v_new;
    if v_new is null then
      raise exception 'Insufficient stock';
    end if;
    return v_new;
  end if;

  select t.ord - 1 into v_vi
    from jsonb_array_elements(v_variants) with ordinality as t(v, ord)
   where t.v ->> 'sku' = p_variant_sku
   limit 1;
  if v_vi is null then
    raise exception 'Variant not found';
  end if;

  select t.ord - 1, (t.s ->> 'stock')::integer into v_si, v_stock
    from jsonb_array_elements(v_variants -> v_vi -> 'sizes') with ordinality as t(s, ord)
   where t.s ->> 'size' = p_size
   limit 1;
  if v_si is null then
    raise exception 'Size not found';
  end if;

  v_new := v_stock + p_delta;
  if v_new < 0 then
    raise exception 'Insufficient stock. Only % available', v_stock;
  end if;

  update public.products
     set variants = jsonb_set(variants, array[v_vi::text, 'sizes', v_si::text, 'stock'], to_jsonb(v_new))
   where id = p_product_id;

  return v_new;
end $$;

-- ---------------------------------------------------------------------
-- create_order: decrement stock for every item and insert the order in one
-- transaction. If any item is short on stock, nothing is changed.
-- ---------------------------------------------------------------------
create or replace function public.create_order(p_user_id uuid, p_order jsonb)
returns public.orders language plpgsql as $$
declare
  v_item  jsonb;
  v_order public.orders;
begin
  for v_item in select * from jsonb_array_elements(p_order -> 'items') loop
    perform public.adjust_stock(
      (v_item ->> 'product')::uuid,
      nullif(v_item ->> 'variantSku', ''),
      v_item ->> 'size',
      -((v_item ->> 'quantity')::integer)
    );
  end loop;

  insert into public.orders (user_id, items, shipping_address, payment_method,
                             items_price, shipping_price, total_price, notes)
  values (
    p_user_id,
    p_order -> 'items',
    p_order -> 'shippingAddress',
    coalesce(p_order ->> 'paymentMethod', 'Cash on Delivery'),
    coalesce((p_order ->> 'itemsPrice')::numeric, 0),
    coalesce((p_order ->> 'shippingPrice')::numeric, 0),
    coalesce((p_order ->> 'totalPrice')::numeric, 0),
    p_order ->> 'notes'
  )
  returning * into v_order;

  return v_order;
end $$;

-- ---------------------------------------------------------------------
-- Security: the Express API talks to Supabase with the service_role key.
-- Enable RLS with no policies so the public anon key can read/write nothing
-- (the users table holds password hashes), and lock the functions down.
-- ---------------------------------------------------------------------
alter table public.users      enable row level security;
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.reviews    enable row level security;
alter table public.contacts   enable row level security;

revoke execute on function public.adjust_stock(uuid, text, text, integer) from public, anon, authenticated;
revoke execute on function public.create_order(uuid, jsonb) from public, anon, authenticated;
grant  execute on function public.adjust_stock(uuid, text, text, integer) to service_role;
grant  execute on function public.create_order(uuid, jsonb) to service_role;

-- ---------------------------------------------------------------------
-- STORAGE: public bucket for product & category images (max 5 MB, images only)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
