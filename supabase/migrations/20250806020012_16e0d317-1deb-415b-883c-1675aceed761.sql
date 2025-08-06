-- Update Maven Investment Partners logo
UPDATE public.partners 
SET logo_url = '/images/partners/maven-investment-partners.png',
    website_url = 'https://maveninvestment.com',
    description = 'Strategic investment and advisory services focused on emerging markets and corridor economics.',
    category = 'investment',
    updated_at = now()
WHERE name = 'Maven Investment Partners';