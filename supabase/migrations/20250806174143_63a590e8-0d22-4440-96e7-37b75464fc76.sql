-- Add linkedin_url column to articles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'linkedin_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.articles ADD COLUMN linkedin_url text;
    END IF;
END $$;