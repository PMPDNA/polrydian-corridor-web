-- Insert sample CSIS articles (check for duplicates first)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.csis_articles WHERE link = 'https://www.csis.org/analysis/building-resilient-global-supply-chains-geopolitics-indo-pacific') THEN
    INSERT INTO public.csis_articles (title, summary, link, published_at, category) VALUES
    ('Building Resilient Global Supply Chains', 'Analysis of supply chain vulnerabilities and strategic responses to geopolitical disruptions in the Indo-Pacific region', 'https://www.csis.org/analysis/building-resilient-global-supply-chains-geopolitics-indo-pacific', now() - interval '1 day', 'economics'),
    ('Trade Policy in the Digital Age', 'Examination of how digital technologies are reshaping global trade patterns and economic corridors', 'https://www.csis.org/analysis/trade-policy-digital-age', now() - interval '2 days', 'analysis'),
    ('Strategic Competition and Economic Security', 'Framework for assessing geopolitical risks in international investments and trade flows', 'https://www.csis.org/analysis/strategic-competition-economic-security', now() - interval '3 days', 'economics'),
    ('Infrastructure Investment Trends', 'Analysis of global infrastructure investment and its impact on economic corridor development', 'https://www.csis.org/analysis/infrastructure-investment-trends', now() - interval '4 days', 'analysis'),
    ('Technology Transfer and Innovation', 'Study of technology diffusion patterns across economic corridors and their strategic implications', 'https://www.csis.org/analysis/technology-transfer-innovation', now() - interval '5 days', 'economics');
  END IF;
END $$;

-- Insert sample policy updates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.policy_updates WHERE url = 'https://www.reuters.com/business/trade-corridor-initiative-2024') THEN
    INSERT INTO public.policy_updates (headline, summary, source, url, published_at, tags) VALUES
    ('New Trade Corridor Initiative Announced Between US and Indo-Pacific Partners', 'Biden administration announces new economic corridor development program aimed at strengthening supply chain resilience and trade relationships in the Indo-Pacific region.', 'Reuters', 'https://www.reuters.com/business/trade-corridor-initiative-2024', now(), ARRAY['trade policy', 'corridor', 'Indo-Pacific']),
    ('BRICS Nations Explore New Payment Corridors for Trade', 'BRICS economic forum discusses development of alternative payment systems and trade corridors to reduce dependency on traditional financial networks.', 'Financial Times', 'https://www.ft.com/content/brics-payment-corridors', now() - interval '1 day', ARRAY['BRICS', 'trade policy', 'corridor']),
    ('Semiconductor Supply Chain Resilience Act Progress Update', 'Latest developments in semiconductor supply chain legislation and its implications for technology corridors and manufacturing partnerships.', 'Wall Street Journal', 'https://www.wsj.com/semiconductor-supply-chain-update', now() - interval '2 days', ARRAY['semiconductor', 'supply chain', 'trade policy']),
    ('EU-Asia Trade Corridor Development Fund Established', 'European Union announces new funding mechanism for infrastructure projects that strengthen trade corridors between Europe and Asia.', 'Politico Europe', 'https://www.politico.eu/eu-asia-trade-corridor-fund', now() - interval '3 days', ARRAY['corridor economics', 'trade policy']),
    ('Tariff Adjustments Impact Global Trade Routes', 'Recent tariff changes prompt reassessment of optimal trade corridors and supply chain configurations for multinational corporations.', 'Bloomberg', 'https://www.bloomberg.com/tariff-trade-routes-impact', now() - interval '4 days', ARRAY['tariffs', 'trade policy', 'supply chain']);
  END IF;
END $$;

-- Insert partner information  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.partners WHERE name = 'Maven Investment Partners') THEN
    INSERT INTO public.partners (name, description, website_url, logo_url, category, display_order) VALUES
    ('Maven Investment Partners', 'Strategic investment firm specializing in corridor economics and infrastructure development', 'https://maven-ip.com', '/images/partners/maven-investment-partners.png', 'investment', 1),
    ('KCC Capital', 'Capital management firm focused on emerging market opportunities and economic corridor investments', 'https://kcccapital.com', '/images/partners/kcc-capital.png', 'capital', 2),
    ('Lee & Associates', 'Commercial real estate services with expertise in corridor development and strategic property investments', 'https://lee-associates.com', '/images/partners/lee-associates.png', 'real_estate', 3),
    ('German Marshall Fund Fellowship', 'Prestigious fellowship program supporting transatlantic policy research and corridor economics studies', 'https://www.gmfus.org', '/images/partners/gmf-fellowship.png', 'fellowship', 4),
    ('World Affairs Council of Miami', 'Premier international affairs organization fostering dialogue on global economic and policy issues', 'https://www.wacmiami.org', '/images/partners/world-affairs-council-miami.png', 'organization', 5);
  END IF;
END $$;