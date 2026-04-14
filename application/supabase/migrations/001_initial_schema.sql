-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create quotations table
CREATE TABLE quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  client_site_name text NOT NULL,
  shoot_type text NOT NULL,
  quotation_date date NOT NULL,
  discount_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total numeric(10,2) NOT NULL CHECK (total >= 0)
);

-- Create line_items table
CREATE TABLE line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description text NOT NULL,
  photo_count integer NOT NULL DEFAULT 0 CHECK (photo_count >= 0),
  reel_video_count integer NOT NULL DEFAULT 0 CHECK (reel_video_count >= 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0)
);

-- Create indexes
CREATE INDEX idx_quotations_created_at ON quotations(created_at DESC);
CREATE INDEX idx_quotations_client_site_name ON quotations(client_site_name);
CREATE INDEX idx_line_items_quotation_id ON line_items(quotation_id);

-- Enable Row Level Security
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for MVP - single user app)
CREATE POLICY "Allow all operations on quotations" ON quotations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on line_items" ON line_items
  FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quotations
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE quotations IS 'Photography quotations for TDS Photography clients';
COMMENT ON TABLE line_items IS 'Individual line items (services) within a quotation';
COMMENT ON COLUMN quotations.client_site_name IS 'Client name or site name for the quotation';
COMMENT ON COLUMN quotations.shoot_type IS 'Type of photography service (e.g., Architectural Photography & Videography)';
COMMENT ON COLUMN line_items.photo_count IS 'Number of photos included in this service';
COMMENT ON COLUMN line_items.reel_video_count IS 'Number of reels or videos included in this service';
