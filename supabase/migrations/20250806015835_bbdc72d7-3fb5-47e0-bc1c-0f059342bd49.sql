-- Add unique constraint to partners name and insert Maven Investment Partners
ALTER TABLE public.partners ADD CONSTRAINT partners_name_unique UNIQUE (name);

-- Insert Maven Investment Partners
INSERT INTO public.partners (name, logo_url, website_url, description, category, display_order, is_visible)
VALUES (
  'Maven Investment Partners',
  '/images/partners/maven-investment-partners.png',
  'https://maveninvestment.com',
  'Strategic investment and advisory services focused on emerging markets and corridor economics.',
  'investment',
  1,
  true
);