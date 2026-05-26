-- Migration 0003: Add Stripe tracking columns to orders table
-- This ensures the orders table has columns for customer_email and Stripe identifiers

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id text;

-- Add index for efficient lookups by Stripe session ID
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders (stripe_session_id);

-- Add index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);
