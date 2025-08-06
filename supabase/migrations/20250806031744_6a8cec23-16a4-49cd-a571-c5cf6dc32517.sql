-- Trigger the economic data scheduler to populate insights table
-- This will fetch data from FRED API and store it in insights table

-- Let's also ensure we have a unique constraint on series_id to prevent duplicates
ALTER TABLE public.insights ADD CONSTRAINT unique_series_id UNIQUE (series_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_insights_published ON public.insights(is_published);
CREATE INDEX IF NOT EXISTS idx_insights_data_source ON public.insights(data_source);
CREATE INDEX IF NOT EXISTS idx_insights_indicator_type ON public.insights(indicator_type);