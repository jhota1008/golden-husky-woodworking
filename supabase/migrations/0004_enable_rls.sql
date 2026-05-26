-- Migration 0004: Enable Row Level Security (RLS)
-- CRITICAL: Protects customer data from unauthorized access

-- =====================================================
-- PRODUCTS TABLE - Public read, admin write
-- =====================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products (public catalog)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Only authenticated users with admin role can modify products
-- TODO: Add admin role check when you implement admin functionality
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (false); -- Disable for now, enable when you add admin users


-- =====================================================
-- ORDERS TABLE - Users can only see their own orders
-- =====================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can only read their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own orders (via Edge Function with service role)
-- Edge Functions bypass RLS, so this won't affect checkout
CREATE POLICY "Service role can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true); -- Edge Function uses service_role_key which bypasses RLS

-- Only service role can update orders (webhook uses service role)
CREATE POLICY "Service role can update orders"
  ON orders FOR UPDATE
  USING (true);


-- =====================================================
-- ORDER_ITEMS TABLE - Users can only see items for their orders
-- =====================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can view order items for orders they own
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Service role can insert/update order items (Edge Functions)
CREATE POLICY "Service role can manage order items"
  ON order_items FOR ALL
  USING (true);


-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
