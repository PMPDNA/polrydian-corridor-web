-- Update partner logo URLs to use proper Supabase storage paths
UPDATE partners 
SET logo_url = 'https://qemtvnwemcpzhvbwjbsk.supabase.co/storage/v1/object/public/images/partners/maven-investment-partners.png'
WHERE name = 'Maven Investment Partners';

UPDATE partners 
SET logo_url = 'https://qemtvnwemcpzhvbwjbsk.supabase.co/storage/v1/object/public/images/partners/lee-associates.jpg'
WHERE name = 'Lee & Associates';

UPDATE partners 
SET logo_url = 'https://qemtvnwemcpzhvbwjbsk.supabase.co/storage/v1/object/public/images/partners/kcc-capital.png'
WHERE name = 'KCC Capital';

UPDATE partners 
SET logo_url = 'https://qemtvnwemcpzhvbwjbsk.supabase.co/storage/v1/object/public/images/partners/gmf-fellowship.png'
WHERE name = 'GMF Marshall Memorial Fellowship';

UPDATE partners 
SET logo_url = 'https://qemtvnwemcpzhvbwjbsk.supabase.co/storage/v1/object/public/images/partners/world-affairs-miami.png'
WHERE name = 'World Affairs Council of Miami';