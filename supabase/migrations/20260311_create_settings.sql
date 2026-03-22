-- Settings table for store configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('store', 'email', 'shipping', 'tax', 'payment', 'general')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies for settings
DROP POLICY IF EXISTS "Anyone can view settings" ON settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

CREATE POLICY "Anyone can view settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (is_admin());

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
  ('store_name', '"MY_STORE"', 'store', 'Store name displayed across the site'),
  ('store_description', '"Your one-stop shop for quality products"', 'store', 'Store description for SEO'),
  ('store_email', '"contact@mystore.com"', 'store', 'Store contact email'),
  ('store_phone', '"+1234567890"', 'store', 'Store contact phone'),
  ('store_address', '"123 Main St, City, Country"', 'store', 'Store physical address'),
  ('currency', '"USD"', 'general', 'Default currency code'),
  ('currency_symbol', '"$"', 'general', 'Currency symbol'),
  ('tax_rate', '0.10', 'tax', 'Default tax rate (10%)'),
  ('shipping_flat_rate', '10.00', 'shipping', 'Flat rate shipping cost'),
  ('shipping_free_threshold', '100.00', 'shipping', 'Free shipping threshold amount'),
  ('email_notifications', 'true', 'email', 'Enable email notifications'),
  ('order_confirmation_email', 'true', 'email', 'Send order confirmation emails')
ON CONFLICT (key) DO NOTHING;
