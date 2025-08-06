-- Trigger FRED data collection to populate insights with corrected series IDs
-- This will ensure we have the latest economic data with proper U.S. GDP growth rate

-- First, let's ensure the insights table is ready for the corrected FRED data
-- The FRED integration function will handle the data insertion

-- Also create indexes for better performance on insights queries
CREATE INDEX IF NOT EXISTS idx_insights_indicator_type ON insights(indicator_type);
CREATE INDEX IF NOT EXISTS idx_insights_published ON insights(is_published);
CREATE INDEX IF NOT EXISTS idx_insights_series_id ON insights(series_id);

-- Update any existing CPIAUCSL_PCH entries to use CPIAUCSL for inflation
UPDATE insights 
SET series_id = 'CPIAUCSL',
    title = 'U.S. Inflation Rate (CPI)',
    content = 'Consumer Price Index for All Urban Consumers: All Items'
WHERE series_id = 'CPIAUCSL_PCH';