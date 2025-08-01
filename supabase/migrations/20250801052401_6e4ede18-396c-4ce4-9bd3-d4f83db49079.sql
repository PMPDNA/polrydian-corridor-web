-- Create book_chapters table for serialized content
CREATE TABLE public.book_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_title TEXT NOT NULL DEFAULT 'Book 1 Part 1',
  chapter_number INTEGER NOT NULL,
  chapter_title TEXT NOT NULL,
  chapter_slug TEXT UNIQUE,
  article_id UUID REFERENCES public.articles(id),
  video_15min_url TEXT,
  video_5min_url TEXT,
  shorts_url TEXT,
  video_15min_id TEXT,
  video_5min_id TEXT,
  shorts_id TEXT,
  transcript TEXT,
  key_concepts JSONB DEFAULT '[]'::JSONB,
  reading_time_minutes INTEGER,
  video_duration_15min INTEGER,
  video_duration_5min INTEGER,
  shorts_duration INTEGER,
  sequence_order INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add video-related fields to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'article';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS video_thumbnail TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS video_duration INTEGER;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES public.book_chapters(id);
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS auto_publish_linkedin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS auto_publish_substack BOOLEAN DEFAULT FALSE;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS auto_publish_medium BOOLEAN DEFAULT FALSE;

-- Create publishing_schedule table for automated distribution
CREATE TABLE public.publishing_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id),
  chapter_id UUID REFERENCES public.book_chapters(id),
  platform TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  published_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create content_versions table to link different formats
CREATE TABLE public.content_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID REFERENCES public.book_chapters(id),
  content_type TEXT NOT NULL, -- 'article', 'video_15min', 'video_5min', 'shorts'
  content_id UUID, -- References articles.id for articles, or stores video IDs
  url TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishing_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for book_chapters
CREATE POLICY "Public can view published chapters" 
ON public.book_chapters 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all chapters" 
ON public.book_chapters 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for publishing_schedule
CREATE POLICY "Admins can manage publishing schedule" 
ON public.publishing_schedule 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for content_versions
CREATE POLICY "Public can view published content versions" 
ON public.content_versions 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage all content versions" 
ON public.content_versions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_book_chapters_sequence ON public.book_chapters(sequence_order);
CREATE INDEX idx_book_chapters_published ON public.book_chapters(is_published, publish_date);
CREATE INDEX idx_publishing_schedule_date ON public.publishing_schedule(scheduled_date);
CREATE INDEX idx_content_versions_chapter ON public.content_versions(chapter_id, content_type);

-- Create trigger for updated_at
CREATE TRIGGER update_book_chapters_updated_at
BEFORE UPDATE ON public.book_chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publishing_schedule_updated_at
BEFORE UPDATE ON public.publishing_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_versions_updated_at
BEFORE UPDATE ON public.content_versions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();