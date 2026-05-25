-- Migration: create orders and order_items tables
-- TODO: Run this migration against your Supabase project (via CLI or SQL editor)

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'pending',
  total_cents integer not null default 0,
  shipping jsonb,
  metadata jsonb,
  created_at timestamptz default now()
);

-- If the table already existed without these columns, add them now
alter table orders add column if not exists shipping jsonb;
alter table orders add column if not exists metadata jsonb;

-- store line-item snapshot data so product edits don't affect historical orders
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid,
  title text,
  price_cents integer,
  quantity integer not null default 1,
  metadata jsonb
);

alter table order_items add column if not exists metadata jsonb;

-- Add FK from order_items.product_id → products.id
-- ON DELETE SET NULL: if a product is deleted, the order item row is kept
-- but product_id becomes null (title/price snapshot is still intact).
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'fk_order_items_product'
      and table_name = 'order_items'
  ) then
    alter table order_items
      add constraint fk_order_items_product
      foreign key (product_id)
      references products(id)
      on delete set null;
  end if;
end $$;

-- TODO: Add indexes, constraints, and FK relationships to products if desired
-- TODO: Add RLS policies to allow users to SELECT/INSERT their own orders only
