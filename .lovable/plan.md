
# Video Upload and LinkedIn-Style Article Design Implementation

## Overview

This plan adds video upload capability to articles with storage in Supabase, and enhances the article editor/display to match LinkedIn's article design with inline videos, images, and a clean professional layout.

## Current State Analysis

**What's Already in Place:**
- The `articles` table has video columns: `video_url`, `video_thumbnail`, `video_duration`, `transcript`
- The `images` bucket exists and is public with proper RLS policies
- Image upload works through `FileUpload` component
- Rich text editor with ReactQuill

**What's Missing:**
- No `videos` storage bucket for video files
- No video upload component
- No video embed support in the rich text editor
- No video display in article detail page
- Article form doesn't use the existing video fields

---

## Implementation Plan

### Phase 1: Database and Storage Setup

**1.1 Create Videos Storage Bucket**

Create a new `videos` bucket in Supabase Storage with public access and appropriate RLS policies:

```sql
-- Create videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
);

-- RLS Policies for videos bucket
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
```

---

### Phase 2: Video Upload Component

**2.1 Create VideoUpload Component**

New file: `src/components/VideoUpload.tsx`

Features:
- Drag-and-drop video upload
- File type validation (MP4, WebM, OGG, MOV)
- File size limit (100MB)
- Upload progress indicator
- Video preview with thumbnail generation
- Duration detection

**2.2 Create ArticleVideoUpload Component**

New file: `src/components/ArticleVideoUpload.tsx`

Similar to `ArticleImageUpload` but for videos:
- Upload new videos to Supabase Storage
- Paste external video URLs (YouTube, Vimeo)
- Generate video embed code for editor insertion

---

### Phase 3: Rich Text Editor Enhancement

**3.1 Extend RichTextEditor**

Modify: `src/components/RichTextEditor.tsx`

Add video support to Quill:
- Custom video blot for embedding
- Video toolbar button
- Support for both uploaded videos and external embeds (YouTube/Vimeo)
- Video resize handles

**3.2 Add Video Module to Quill**

```typescript
// Add 'video' to formats array
const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'color', 'background', 'align',
  'link', 'image', 'video', 'blockquote', 'code-block'
];

// Add video to toolbar
const modules = {
  toolbar: [
    // ... existing toolbar items
    ['link', 'image', 'video'],
  ],
};
```

---

### Phase 4: Article Form Updates

**4.1 Enhance ArticleForm**

Modify: `src/components/ArticleForm.tsx`

Add video-related form fields:
- Featured video upload (similar to hero image but for video)
- Video thumbnail selection
- Video duration display
- External video URL input (YouTube/Vimeo support)

Add new form state:
```typescript
const [formData, setFormData] = useState({
  // ... existing fields
  videoUrl: getArticleField('video_url'),
  videoThumbnail: getArticleField('video_thumbnail'),
  videoDuration: getArticleField('video_duration'),
});
```

**4.2 Add Video Section to Form**

New card section between Hero Image and Content:
- "Featured Video" card with:
  - Video upload component
  - OR external URL input (YouTube/Vimeo)
  - Video preview player
  - Thumbnail upload/selection
  - Auto-detect duration

---

### Phase 5: Article Display Enhancement

**5.1 Update ArticleDetail Page**

Modify: `src/pages/ArticleDetail.tsx`

Add featured video display:
- Display video player if `video_url` exists
- Show video before or after featured image
- Custom video player styling matching LinkedIn

**5.2 Video Player Component**

New file: `src/components/ArticleVideoPlayer.tsx`

Features:
- Native HTML5 video player for uploaded videos
- YouTube/Vimeo embed detection and rendering
- Custom controls styling
- Thumbnail overlay with play button
- Responsive sizing

---

### Phase 6: LinkedIn-Style Design Updates

**6.1 Article Content Styling**

Update prose styles in `ArticleDetail.tsx`:
- Clean, readable typography
- Inline video embeds with proper spacing
- Image captions
- Pull quotes styling
- Better blockquote formatting

**6.2 Video Embed Styling**

Add CSS for embedded videos in article content:
```css
.prose video,
.prose iframe[src*="youtube"],
.prose iframe[src*="vimeo"] {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}
```

---

## Technical Details

### File Size Limits
- Videos: 100MB maximum
- Supported formats: MP4, WebM, OGG, MOV

### Video Processing
- Automatic thumbnail generation (first frame capture using canvas)
- Duration detection using HTML5 video element
- Metadata extraction before upload

### External Video Support
- YouTube URL parsing and embedding
- Vimeo URL parsing and embedding
- Auto-detect video source and render appropriate player

### Database Fields Used
| Field | Purpose |
|-------|---------|
| `video_url` | Main video URL (Supabase storage or external) |
| `video_thumbnail` | Thumbnail image URL |
| `video_duration` | Duration in seconds |
| `transcript` | Optional video transcript text |

---

## Files to Create

1. `src/components/VideoUpload.tsx` - Video file upload component
2. `src/components/ArticleVideoUpload.tsx` - Article-specific video upload
3. `src/components/ArticleVideoPlayer.tsx` - Video player component

## Files to Modify

1. `src/components/RichTextEditor.tsx` - Add video embed support
2. `src/components/ArticleForm.tsx` - Add video upload section
3. `src/pages/ArticleDetail.tsx` - Display featured video and inline videos
4. `src/index.css` - Add video styling for article content

## Database Migration Required

1. Create `videos` storage bucket
2. Add RLS policies for video access

---

## Implementation Order

1. **Storage Setup** - Create videos bucket with policies (database migration)
2. **VideoUpload Component** - Build the core upload functionality
3. **ArticleForm Integration** - Add video fields to article creation
4. **RichTextEditor Enhancement** - Enable video embedding in content
5. **ArticleDetail Display** - Show videos in published articles
6. **Styling Polish** - Match LinkedIn's clean article design

---

## Security Considerations

- Videos bucket is public for viewing (same as images)
- Only authenticated users can upload
- File type validation prevents non-video uploads
- File size limit prevents abuse (100MB max)
- RLS ensures users can only modify their own uploads
