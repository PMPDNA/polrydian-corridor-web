-- Clean up corrupted Belarus article content
-- First, let's see what we have
WITH belarus_articles AS (
  SELECT id, title, content, created_at
  FROM articles 
  WHERE title ILIKE '%belarus%' OR title ILIKE '%belarusian%'
  ORDER BY created_at DESC
)
-- Get the article that looks most complete (has the most characters)
, best_content AS (
  SELECT 
    id,
    title,
    content,
    length(content) as content_length,
    ROW_NUMBER() OVER (ORDER BY length(content) DESC) as rn
  FROM belarus_articles
)
-- Clean content by restoring missing characters where we can identify the pattern
, fixed_content AS (
  SELECT 
    id,
    title,
    -- Fix common word patterns where p, r, s are missing
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(content, 'olitical', 'political'),
                      'esident', 'president'
                    ), 'esidential', 'presidential'
                  ), 'otests', 'protests'
                ), 'ussian', 'Russian'
              ), 'ussian', 'Russian'  
            ), 'rotests', 'protests'
          ), 'geoolitics', 'geopolitics'
        ), 'disuted', 'disputed'
      ), 'rofoundly', 'profoundly'
    ) as cleaned_content
  FROM best_content 
  WHERE rn = 1
)
-- Delete duplicate corrupted articles
DELETE FROM articles 
WHERE id IN (
  SELECT id FROM articles 
  WHERE (title ILIKE '%belarus%' OR title ILIKE '%belarusian%') 
  AND id NOT IN (
    SELECT id FROM best_content WHERE rn = 1
  )
);

-- Update the remaining article with cleaned content
UPDATE articles 
SET content = (
  -- More comprehensive cleanup of missing p, r, s characters
  SELECT 
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(
                        REPLACE(
                          REPLACE(
                            REPLACE(
                              REPLACE(
                                REPLACE(
                                  REPLACE(
                                    REPLACE(
                                      REPLACE(
                                        REPLACE(
                                          REPLACE(
                                            REPLACE(
                                              REPLACE(
                                                REPLACE(
                                                  REPLACE(
                                                    REPLACE(
                                                      REPLACE(
                                                        REPLACE(
                                                          REPLACE(
                                                            REPLACE(content, 'olitical', 'political'),
                                                            'esident', 'president'
                                                          ), 'esidential', 'presidential'
                                                        ), 'otests', 'protests'
                                                      ), 'rotests', 'protests'
                                                    ), 'ussian', 'Russian'
                                                  ), 'ussian', 'Russian'
                                                ), 'geoolitics', 'geopolitics'
                                              ), 'disuted', 'disputed'
                                            ), 'rofoundly', 'profoundly'
                                          ), 'arallels', 'parallels'
                                        ), 'attern', 'pattern'
                                      ), 'ost-Soviet', 'post-Soviet'
                                    ), 'ublic', 'public'
                                  ), 'deermined', 'determined'
                                ), 'shere', 'sphere'
                              ), 'resident', 'president'
                            ), 'redictions', 'predictions'
                          ), 'roven', 'proven'
                        ), 'eerily', 'eerily'
                      ), 'triumhant', 'triumphant'
                    ), 'uheaval', 'upheaval'
                  ), 'eisode', 'episode'
                ), 'ass', 'mass'
              ), 'ousted', 'ousted'
            ), 'ro-Russian', 'pro-Russian'
          ), 'resonse', 'response'
        ), 'searatist', 'separatist'
      ), 'revent', 'prevent'
    )
  FROM articles 
  WHERE (title ILIKE '%belarus%' OR title ILIKE '%belarusian%') 
  AND id = articles.id
  LIMIT 1
)
WHERE title ILIKE '%belarus%' OR title ILIKE '%belarusian%';

-- Ensure proper paragraph structure
UPDATE articles 
SET content = REPLACE(
  REPLACE(
    REPLACE(content, E'\n\n', '</p>\n\n<p>'),
    E'Belarusian Elections and Geoolitics\n\n<p>The olitical', 
    '<h1>Belarusian Elections and Geopolitics</h1>\n\n<p>The political'
  ),
  'Echoes of Ukraine''s Maidan (2014) in Minsk (2020)', 
  '</p>\n\n<h2>Echoes of Ukraine''s Maidan (2014) in Minsk (2020)</h2>\n\n<p>'
)
WHERE title ILIKE '%belarus%' OR title ILIKE '%belarusian%';