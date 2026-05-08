CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  
  -- Snapshot at time of order (in case product changes)
  product_snapshot jsonb NOT NULL,  -- {title, price_cents, description}
  
  -- Custom selections
  custom_options jsonb,  -- {color: "Red", size: "Large", engraving: "..."}
  
  quantity integer NOT NULL,
  price_cents integer NOT NULL,
  created_at timestamptz DEFAULT now()
);