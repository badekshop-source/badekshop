-- Migration: Add soft delete columns to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES profiles(id);

-- Create index for deleted_at for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews(deleted_at);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);