-- Add sample partner data (fix the conflict handling)
INSERT INTO partners (name, website_url, logo_url, description, category, display_order, is_visible) VALUES
('Maven Investment Partners', 'https://maven.investment', 'https://qemtvnwemcpzhvbwjbsk.supabase.co/storage/v1/object/public/images/maven-investment-partners.png', 'Strategic investment and advisory services', 'investor', 1, true),
('KCC Capital', 'https://kcccapital.com', 'https://via.placeholder.com/200x80/2563eb/ffffff?text=KCC+Capital', 'Infrastructure and energy investments', 'investor', 2, true),
('Lee & Associates', 'https://lee-associates.com', 'https://qemtvnwemcpzhvbwjbsk.supabase.co/storage/v1/object/public/images/lee-associates.jpg', 'Commercial real estate services', 'partner', 3, true),
('German Marshall Fund', 'https://www.gmfus.org', 'https://via.placeholder.com/200x80/059669/ffffff?text=GMF', 'Transatlantic policy research', 'organization', 4, true),
('World Affairs Council of Miami', 'https://wacmiami.org', 'https://via.placeholder.com/200x80/7c3aed/ffffff?text=WAC+Miami', 'International affairs forum', 'organization', 5, true);