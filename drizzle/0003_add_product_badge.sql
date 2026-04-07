-- Migration: Add badge column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT NULL;

-- Badge values: null, 'popular', 'best_value', 'new', 'limited'
-- Priority: Discount > Badge

-- Create index for faster queries on badge
CREATE INDEX IF NOT EXISTS idx_products_badge ON products(badge) WHERE badge IS NOT NULL;