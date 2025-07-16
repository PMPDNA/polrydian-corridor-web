-- Add approval status to social media posts
ALTER TABLE public.social_media_posts 
ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add index for better performance on approval queries
CREATE INDEX idx_social_media_posts_approval_status ON public.social_media_posts(approval_status);

-- Update existing posts to be approved by default for admin
UPDATE public.social_media_posts SET approval_status = 'approved' WHERE is_visible = true;