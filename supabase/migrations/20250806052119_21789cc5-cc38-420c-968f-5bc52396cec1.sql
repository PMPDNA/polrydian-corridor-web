-- First, populate insights table with basic economic indicators
INSERT INTO public.insights (title, content, data_source, series_id, indicator_type, region, is_published, data_points, chart_config) VALUES
('US Gross Domestic Product', 'Quarterly measurements of US economic output and growth trends', 'FRED', 'GDP', 'growth', 'US', true, 
 '[{"date": "2024-01-01", "value": 2.1}, {"date": "2024-04-01", "value": 2.3}, {"date": "2024-07-01", "value": 2.5}]'::jsonb,
 '{"type": "line", "title": "GDP Growth Rate", "yAxis": "Percent"}'::jsonb),

('US Unemployment Rate', 'Monthly unemployment rate tracking labor market conditions', 'FRED', 'UNRATE', 'labor', 'US', true,
 '[{"date": "2024-01-01", "value": 3.7}, {"date": "2024-02-01", "value": 3.9}, {"date": "2024-03-01", "value": 3.8}]'::jsonb,
 '{"type": "line", "title": "Unemployment Rate", "yAxis": "Percent"}'::jsonb),

('Consumer Price Index', 'Monthly inflation measurement through consumer price changes', 'FRED', 'CPIAUCSL', 'inflation', 'US', true,
 '[{"date": "2024-01-01", "value": 3.1}, {"date": "2024-02-01", "value": 3.2}, {"date": "2024-03-01", "value": 3.5}]'::jsonb,
 '{"type": "line", "title": "Inflation Rate", "yAxis": "Percent"}'::jsonb),

('Federal Funds Rate', 'Federal Reserve interest rate decisions impacting economic corridors', 'FRED', 'FEDFUNDS', 'monetary', 'US', true,
 '[{"date": "2024-01-01", "value": 5.25}, {"date": "2024-02-01", "value": 5.25}, {"date": "2024-03-01", "value": 5.5}]'::jsonb,
 '{"type": "line", "title": "Federal Funds Rate", "yAxis": "Percent"}'::jsonb),

('Consumer Confidence Index', 'Monthly consumer sentiment and economic outlook', 'FRED', 'UMCSENT', 'sentiment', 'US', true,
 '[{"date": "2024-01-01", "value": 79.0}, {"date": "2024-02-01", "value": 76.9}, {"date": "2024-03-01", "value": 79.4}]'::jsonb,
 '{"type": "line", "title": "Consumer Confidence", "yAxis": "Index"}'::jsonb);

-- Add schedule to populate insights regularly
INSERT INTO public.content_schedule (schedule_type, frequency_days, config, is_active) VALUES
('economic_data_update', 1, '{"indicators": ["GDP", "UNRATE", "CPIAUCSL", "FEDFUNDS", "UMCSENT"], "source": "FRED"}'::jsonb, true);