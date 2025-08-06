-- Update partners table with Maven Investment Partners logo
INSERT INTO public.partners (name, logo_url, website_url, description, category, display_order, is_visible)
VALUES (
  'Maven Investment Partners',
  '/images/partners/maven-investment-partners.png',
  'https://maveninvestment.com',
  'Strategic investment and advisory services focused on emerging markets and corridor economics.',
  'investment',
  1,
  true
) ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  description = EXCLUDED.description,
  updated_at = now();