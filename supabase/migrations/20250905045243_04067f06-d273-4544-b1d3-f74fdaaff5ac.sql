-- Insert or update hero section content in website_content table
INSERT INTO public.website_content (section_name, content_key, content_type, content_value, description, is_active)
VALUES 
  ('hero', 'title', 'text', 'Board‑Level Advisory for Complex Supply Chains, Deep Tech & Geopolitics', 'Main hero headline', true),
  ('hero', 'subtitle', 'text', 'Trusted advisor to sovereign funds, port & logistics operators, defence integrators and deep tech innovators', 'Hero supporting text', true)
ON CONFLICT (section_name, content_key) 
DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();