-- Update partner categories to organize into Partners, Affiliations, and Clients
-- Business partners become "partners"
UPDATE partners 
SET category = 'partners' 
WHERE category IN ('strategic', 'business', 'investment', 'real_estate') 
   OR name IN ('Maven Investment Partners', 'KCC Capital Partners', 'Lee & Associates');

-- Institutional/academic become "affiliations"  
UPDATE partners 
SET category = 'affiliations'
WHERE category IN ('institutional', 'academic', 'think_tank', 'government', 'fellowship', 'partner')
   OR name IN ('World Affairs Council of Miami', 'GMF Marshall Memorial Fellowship');

-- Add any client-specific partners (none yet, but structure is ready)
-- Future client partners can be added with category = 'clients'

-- Make sure all existing partners are visible
UPDATE partners SET is_visible = true WHERE is_visible IS NULL;