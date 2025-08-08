-- Create a function to clean existing article content
CREATE OR REPLACE FUNCTION public.clean_all_article_content()
RETURNS integer AS $$
DECLARE
  article_record RECORD;
  cleaned_content text;
  update_count integer := 0;
BEGIN
  -- Process each article that has content corruption
  FOR article_record IN 
    SELECT id, content, title
    FROM public.articles 
    WHERE content IS NOT NULL 
    AND (
      content LIKE '%&amp;%' OR 
      content LIKE '%&lt;%' OR 
      content LIKE '%&gt;%' OR
      content LIKE '%acros %' OR
      content LIKE '%Suply%' OR
      content LIKE '%busines%' OR
      content LIKE '%progres%' OR
      content LIKE '%adres%' OR
      content LIKE '%aproach%' OR
      content LIKE '%aproval%' OR
      content LIKE '%techno %' OR
      content LIKE '%sel %' OR
      content LIKE '%smal %' OR
      content ~ '([a-z])\1{2,}'
    )
  LOOP
    -- Apply comprehensive cleaning
    cleaned_content := article_record.content;
    
    -- Decode HTML entities
    cleaned_content := REPLACE(cleaned_content, '&amp;', '&');
    cleaned_content := REPLACE(cleaned_content, '&lt;', '<');
    cleaned_content := REPLACE(cleaned_content, '&gt;', '>');
    cleaned_content := REPLACE(cleaned_content, '&quot;', '"');
    cleaned_content := REPLACE(cleaned_content, '&#34;', '"');
    cleaned_content := REPLACE(cleaned_content, '&#39;', '''');
    cleaned_content := REPLACE(cleaned_content, '&apos;', '''');
    cleaned_content := REPLACE(cleaned_content, '&nbsp;', ' ');
    
    -- Fix common word corruption using regex
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\bacros\M', 'across', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\bSuply\M', 'Supply', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\bbusines\M', 'business', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\bprogres\M', 'progress', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\badres\M', 'address', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\baproach\M', 'approach', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\baproval\M', 'approval', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\btechno\M', 'technology', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\bsel\M', 'sell', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\bTP\M', 'TPP', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\bsmal\M', 'small', 'gi');
    
    -- Fix specific corruption patterns
    cleaned_content := REGEXP_REPLACE(cleaned_content, 'prpprpprotests', 'protests', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, 'prpprppresident', 'president', 'gi');
    cleaned_content := REGEXP_REPLACE(cleaned_content, 'vmmassal', 'vassal', 'gi');
    
    -- Fix tripled characters
    cleaned_content := REGEXP_REPLACE(cleaned_content, '([a-z])\1{2,}', '\1', 'gi');
    
    -- Fix doubled consonants (not followed by vowels)
    cleaned_content := REGEXP_REPLACE(cleaned_content, '([bcdfghjklmnpqrstvwxz])\1(?![aeiou])', '\1', 'gi');
    
    -- Normalize whitespace
    cleaned_content := REGEXP_REPLACE(cleaned_content, '\s+', ' ', 'g');
    cleaned_content := TRIM(cleaned_content);
    
    -- Update the article if content changed
    IF cleaned_content != article_record.content THEN
      UPDATE public.articles 
      SET content = cleaned_content,
          updated_at = now()
      WHERE id = article_record.id;
      
      update_count := update_count + 1;
      
      -- Log the cleanup
      INSERT INTO public.integration_logs (
        integration_type, 
        operation, 
        status, 
        request_data
      ) VALUES (
        'content_cleanup',
        'article_content_cleaned',
        'success',
        jsonb_build_object(
          'article_id', article_record.id,
          'title', article_record.title,
          'original_length', length(article_record.content),
          'cleaned_length', length(cleaned_content)
        )
      );
    END IF;
  END LOOP;
  
  RETURN update_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';