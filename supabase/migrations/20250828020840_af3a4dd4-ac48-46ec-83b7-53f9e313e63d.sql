-- Add institutional partners to demonstrate the institutional partners section
INSERT INTO partners (name, logo_url, website_url, description, category, is_visible, display_order) VALUES
('GMF Marshall Memorial Fellowship', '/images/partners/gmf-logo.png', 'https://www.gmfus.org', 'German Marshall Fund fellowship program promoting transatlantic cooperation', 'institutional', true, 10),
('World Affairs Council of Miami', '/images/partners/wac-miami-logo.png', 'https://www.wacmiami.org', 'Educational organization promoting international understanding', 'institutional', true, 11);

-- Update existing partners to have proper strategic categories
UPDATE partners SET category = 'strategic' WHERE name LIKE '%Maven%' OR name LIKE '%KCC%' OR name LIKE '%Lee%';