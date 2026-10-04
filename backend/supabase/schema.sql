-- =====================================================================
-- ZAYRO - Supabase schema
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
-- one product per name (case/space-insensitive): a double-clicked "Create" can't add it twice
create unique index if not exists products_name_unique_idx on public.products (lower(btrim(name)));

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
-- ORDERS: coupon, discount and status history (added after the first release;
-- ALTER ... IF NOT EXISTS keeps re-runs safe on existing databases)
-- ---------------------------------------------------------------------
alter table public.orders add column if not exists coupon_code    text;
alter table public.orders add column if not exists discount_price numeric(10, 2) not null default 0;
alter table public.orders add column if not exists status_history jsonb not null default '[]'::jsonb;

-- Record every status change with a timestamp (order tracking timeline)
create or replace function public.record_order_status()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    new.status_history := coalesce(new.status_history, '[]'::jsonb)
      || jsonb_build_array(jsonb_build_object('status', new.status, 'at', now()));
  end if;
  return new;
end $$;

drop trigger if exists orders_status_history on public.orders;
create trigger orders_status_history before insert or update of status on public.orders
  for each row execute function public.record_order_status();

-- Backfill history for orders created before the trigger existed
update public.orders
   set status_history = jsonb_build_array(jsonb_build_object('status', 'Pending', 'at', created_at))
       || case when status <> 'Pending'
               then jsonb_build_array(jsonb_build_object('status', status, 'at', updated_at))
               else '[]'::jsonb end
 where status_history = '[]'::jsonb;

-- ---------------------------------------------------------------------
-- COUPONS (discount codes)
-- ---------------------------------------------------------------------
create table if not exists public.coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique check (code = upper(code) and char_length(code) between 3 and 30),
  description      text not null default '',
  discount_type    text not null check (discount_type in ('percent', 'fixed')),
  discount_value   numeric(10, 2) not null check (discount_value > 0),
  min_order_amount numeric(10, 2) not null default 0 check (min_order_amount >= 0),
  max_uses         integer check (max_uses > 0),
  used_count       integer not null default 0 check (used_count >= 0),
  starts_at        timestamptz,
  expires_at       timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value <= 100)
);

-- Featured coupons are advertised on the home page (others stay private)
alter table public.coupons add column if not exists featured boolean not null default false;

drop trigger if exists coupons_updated_at on public.coupons;
create trigger coupons_updated_at before update on public.coupons
  for each row execute function public.set_updated_at();

-- Validate a coupon for an order subtotal and return the discount.
-- p_reserve = true also counts one use (called inside create_order).
create or replace function public.coupon_discount(p_code text, p_items_price numeric, p_reserve boolean default false)
returns numeric language plpgsql as $$
declare
  c public.coupons;
  v_discount numeric;
begin
  select * into c from public.coupons where code = upper(trim(p_code)) for update;

  if not found or not c.is_active then
    raise exception 'Invalid coupon code';
  end if;
  if c.starts_at is not null and now() < c.starts_at then
    raise exception 'This coupon is not active yet';
  end if;
  if c.expires_at is not null and now() > c.expires_at then
    raise exception 'This coupon has expired';
  end if;
  if c.max_uses is not null and c.used_count >= c.max_uses then
    raise exception 'This coupon has reached its usage limit';
  end if;
  if p_items_price < c.min_order_amount then
    raise exception 'This coupon needs a minimum order of $%', to_char(c.min_order_amount, 'FM999999990.00');
  end if;

  v_discount := case
    when c.discount_type = 'percent' then round(p_items_price * c.discount_value / 100, 2)
    else least(c.discount_value, p_items_price)
  end;

  if p_reserve then
    update public.coupons set used_count = used_count + 1 where id = c.id;
  end if;

  return v_discount;
end $$;

-- Give a use back when an order with a coupon is cancelled
create or replace function public.release_coupon(p_code text)
returns void language sql as $$
  update public.coupons set used_count = greatest(used_count - 1, 0) where code = upper(trim(p_code));
$$;

-- ---------------------------------------------------------------------
-- create_order: decrement stock for every item, apply the coupon and insert
-- the order in one transaction. If anything fails, nothing is changed.
-- itemsPrice / shippingPrice are calculated by the API from database prices.
-- ---------------------------------------------------------------------
create or replace function public.create_order(p_user_id uuid, p_order jsonb)
returns public.orders language plpgsql as $$
declare
  v_item     jsonb;
  v_order    public.orders;
  v_items    numeric := coalesce((p_order ->> 'itemsPrice')::numeric, 0);
  v_shipping numeric := coalesce((p_order ->> 'shippingPrice')::numeric, 0);
  v_code     text    := nullif(upper(trim(p_order ->> 'couponCode')), '');
  v_discount numeric := 0;
begin
  for v_item in select * from jsonb_array_elements(p_order -> 'items') loop
    perform public.adjust_stock(
      (v_item ->> 'product')::uuid,
      nullif(v_item ->> 'variantSku', ''),
      v_item ->> 'size',
      -((v_item ->> 'quantity')::integer)
    );
  end loop;

  if v_code is not null then
    v_discount := public.coupon_discount(v_code, v_items, true);
  end if;

  insert into public.orders (user_id, items, shipping_address, payment_method, items_price,
                             shipping_price, discount_price, total_price, coupon_code, notes)
  values (
    p_user_id,
    p_order -> 'items',
    p_order -> 'shippingAddress',
    coalesce(p_order ->> 'paymentMethod', 'Cash on Delivery'),
    v_items,
    v_shipping,
    v_discount,
    v_items + v_shipping - v_discount,
    v_code,
    p_order ->> 'notes'
  )
  returning * into v_order;

  return v_order;
end $$;

-- ---------------------------------------------------------------------
-- WISHLISTS (saved products per user)
-- ---------------------------------------------------------------------
create table if not exists public.wishlists (
  user_id    uuid not null references public.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- RATE LIMITS (login / register brute-force protection; works across
-- serverless instances because the counter lives in the database)
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  key        text not null,
  created_at timestamptz not null default now()
);
create index if not exists rate_limits_key_idx on public.rate_limits (key, created_at);

-- Returns true and records the attempt if under p_max attempts in the window;
-- returns false (blocked) otherwise.
create or replace function public.hit_rate_limit(p_key text, p_max integer, p_window_seconds integer)
returns boolean language plpgsql as $$
declare
  v_count integer;
begin
  -- occasional global cleanup of old rows
  if random() < 0.02 then
    delete from public.rate_limits where created_at < now() - interval '1 day';
  end if;

  select count(*) into v_count from public.rate_limits
   where key = p_key and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    return false;
  end if;

  insert into public.rate_limits (key) values (p_key);
  return true;
end $$;

create or replace function public.clear_rate_limit(p_key text)
returns void language sql as $$
  delete from public.rate_limits where key = p_key;
$$;

-- ---------------------------------------------------------------------
-- PRODUCT SEARCH & FILTERS
-- ---------------------------------------------------------------------
-- Active products matching all given filters (null = ignore that filter).
-- p_search should already have % and _ escaped.
create or replace function public.search_products(
  p_search    text    default null,
  p_category  text    default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_size      text    default null,
  p_color     text    default null,
  p_in_stock  boolean default false
) returns setof public.products language sql stable as $$
  select p.*
    from public.products p
   where p.is_active
     and (p_category is null or p.category = p_category)
     and (p_search is null
          or p.name ilike '%' || p_search || '%'
          or p.description ilike '%' || p_search || '%'
          or p.category ilike '%' || p_search || '%')
     and (p_min_price is null or p.price >= p_min_price)
     and (p_max_price is null or p.price <= p_max_price)
     and (p_size is null
          or (jsonb_array_length(p.variants) = 0 and p_size = any (p.sizes))
          or exists (select 1
                       from jsonb_array_elements(p.variants) v, jsonb_array_elements(v -> 'sizes') s
                      where coalesce((v ->> 'isActive')::boolean, true)
                        and s ->> 'size' = p_size
                        and (not p_in_stock or (s ->> 'stock')::integer > 0)))
     and (p_color is null
          or exists (select 1 from jsonb_array_elements(p.variants) v
                      where coalesce((v ->> 'isActive')::boolean, true)
                        and lower(v -> 'color' ->> 'name') = lower(p_color)))
     and (not p_in_stock
          or (jsonb_array_length(p.variants) = 0 and p.stock > 0)
          or exists (select 1
                       from jsonb_array_elements(p.variants) v, jsonb_array_elements(v -> 'sizes') s
                      where coalesce((v ->> 'isActive')::boolean, true)
                        and (s ->> 'stock')::integer > 0))
$$;

-- Values for the filter sidebar: sizes, colors and price range in the catalog
create or replace function public.product_filter_options()
returns jsonb language sql stable as $$
  with active as (select * from public.products where is_active),
  variant_sizes as (
    select s ->> 'size' as size
      from active, jsonb_array_elements(variants) v, jsonb_array_elements(v -> 'sizes') s
     where coalesce((v ->> 'isActive')::boolean, true)
    union
    select unnest(sizes) from active where jsonb_array_length(variants) = 0
  ),
  colors as (
    select distinct on (lower(v -> 'color' ->> 'name'))
           v -> 'color' ->> 'name' as name, v -> 'color' ->> 'hex' as hex
      from active, jsonb_array_elements(variants) v
     where coalesce((v ->> 'isActive')::boolean, true)
  )
  select jsonb_build_object(
    'sizes',    (select coalesce(jsonb_agg(distinct size), '[]'::jsonb) from variant_sizes where size is not null),
    'colors',   (select coalesce(jsonb_agg(jsonb_build_object('name', name, 'hex', hex) order by name), '[]'::jsonb) from colors),
    'minPrice', (select coalesce(min(price), 0) from active),
    'maxPrice', (select coalesce(max(price), 0) from active)
  );
$$;

-- ---------------------------------------------------------------------
-- ADMIN DASHBOARD STATS (computed in the database, not from a page of orders)
-- Revenue excludes cancelled orders. Days are UTC calendar days.
-- ---------------------------------------------------------------------
create or replace function public.admin_dashboard_stats(p_days integer default 30)
returns jsonb language sql stable as $$
  with paid as (select * from public.orders where status <> 'Cancelled'),
  cur  as (select * from paid where created_at >= now() - make_interval(days => p_days)),
  prev as (select * from paid where created_at >= now() - make_interval(days => 2 * p_days)
                                and created_at <  now() - make_interval(days => p_days)),
  days as (select (generate_series(current_date - (p_days - 1), current_date, interval '1 day'))::date as day),
  daily as (
    select d.day, count(p.id) as orders, coalesce(sum(p.total_price), 0) as revenue
      from days d left join paid p on (p.created_at at time zone 'utc')::date = d.day
     group by d.day
  ),
  sold as (
    select i ->> 'product' as product_id, i ->> 'name' as name,
           (i ->> 'quantity')::integer as qty,
           (i ->> 'price')::numeric * (i ->> 'quantity')::integer as revenue
      from paid, jsonb_array_elements(paid.items) i
  ),
  best as (
    select product_id, max(name) as name, sum(qty) as quantity, sum(revenue) as revenue
      from sold group by product_id order by sum(qty) desc, max(name) limit 5
  ),
  low as (
    select p.id, p.name, v -> 'color' ->> 'name' as color, s ->> 'size' as size,
           (s ->> 'stock')::integer as stock, coalesce((s ->> 'lowStockThreshold')::integer, 5) as threshold
      from public.products p, jsonb_array_elements(p.variants) v, jsonb_array_elements(v -> 'sizes') s
     where p.is_active and coalesce((v ->> 'isActive')::boolean, true)
       and (s ->> 'stock')::integer <= coalesce((s ->> 'lowStockThreshold')::integer, 5)
    union all
    select p.id, p.name, null, null, p.stock, 5
      from public.products p
     where p.is_active and jsonb_array_length(p.variants) = 0 and p.stock <= 5
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'products',       (select count(*) from public.products),
      'activeProducts', (select count(*) from public.products where is_active),
      'categories',     (select count(*) from public.categories),
      'orders',         (select count(*) from public.orders),
      'revenue',        (select coalesce(sum(total_price), 0) from paid),
      'pendingOrders',  (select count(*) from public.orders where status = 'Pending'),
      'customers',      (select count(distinct user_id) from paid)
    ),
    'period', jsonb_build_object(
      'days',              p_days,
      'orders',            (select count(*) from cur),
      'previousOrders',    (select count(*) from prev),
      'revenue',           (select coalesce(sum(total_price), 0) from cur),
      'previousRevenue',   (select coalesce(sum(total_price), 0) from prev),
      'customers',         (select count(distinct user_id) from cur),
      'previousCustomers', (select count(distinct user_id) from prev)
    ),
    'statusCounts', (select coalesce(jsonb_object_agg(status, n), '{}'::jsonb)
                       from (select status, count(*) as n from public.orders group by status) x),
    'dailySales',   (select jsonb_agg(jsonb_build_object('date', day, 'orders', orders, 'revenue', revenue) order by day) from daily),
    'bestSellers',  (select coalesce(jsonb_agg(jsonb_build_object('productId', product_id, 'name', name,
                                     'quantity', quantity, 'revenue', revenue) order by quantity desc, name), '[]'::jsonb) from best),
    'lowStock',     (select coalesce(jsonb_agg(jsonb_build_object('productId', id, 'name', name, 'color', color,
                                     'size', size, 'stock', stock, 'threshold', threshold) order by stock, name), '[]'::jsonb)
                       from (select * from low order by stock, name limit 10) l)
  );
$$;

-- ---------------------------------------------------------------------
-- Security: the Express API talks to Supabase with the service_role key.
-- Enable RLS with no policies so the public anon key can read/write nothing
-- (the users table holds password hashes), and lock the functions down.
-- ---------------------------------------------------------------------
alter table public.users       enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.reviews     enable row level security;
alter table public.contacts    enable row level security;
alter table public.coupons     enable row level security;
alter table public.wishlists   enable row level security;
alter table public.rate_limits enable row level security;

do $$
declare
  fn text;
begin
  foreach fn in array array[
    'public.adjust_stock(uuid, text, text, integer)',
    'public.create_order(uuid, jsonb)',
    'public.coupon_discount(text, numeric, boolean)',
    'public.release_coupon(text)',
    'public.hit_rate_limit(text, integer, integer)',
    'public.clear_rate_limit(text)',
    'public.search_products(text, text, numeric, numeric, text, text, boolean)',
    'public.product_filter_options()',
    'public.admin_dashboard_stats(integer)'
  ] loop
    execute format('revoke execute on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end $$;

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
