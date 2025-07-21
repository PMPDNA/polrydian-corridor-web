-- Update visitor_analytics table to include IP address and location tracking

-- First, let's ensure the visitor_analytics table has proper columns for IP and location
ALTER TABLE visitor_analytics 
ADD COLUMN IF NOT EXISTS ip_address inet,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text;

-- Create an index on ip_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_ip_address ON visitor_analytics(ip_address);

-- Create an index on country for analytics queries
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_country ON visitor_analytics(country);

-- Update the table to ensure proper tracking
COMMENT ON COLUMN visitor_analytics.ip_address IS 'Visitor IP address for location tracking';
COMMENT ON COLUMN visitor_analytics.country IS 'Visitor country based on IP geolocation';
COMMENT ON COLUMN visitor_analytics.city IS 'Visitor city based on IP geolocation';