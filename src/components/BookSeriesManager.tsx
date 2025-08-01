import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Video, FileText, Clock, Upload, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Chapter {
  id: string;
  book_title: string;
  chapter_number: number;
  chapter_title: string;
  chapter_slug: string;
  article_id?: string;
  video_15min_url?: string;
  video_5min_url?: string;
  shorts_url?: string;
  transcript?: string;
  key_concepts: any;
  reading_time_minutes?: number;
  sequence_order: number;
  is_published: boolean;
  publish_date?: string;
  created_at: string;
  article?: {
    title: string;
    content: string;
    status: string;
  };
}

export const BookSeriesManager = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    chapter_number: 1,
    chapter_title: '',
    chapter_slug: '',
    key_concepts: '',
    reading_time_minutes: 10,
    video_15min_url: '',
    video_5min_url: '',
    shorts_url: '',
    transcript: '',
    is_published: false,
  });

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('book_chapters')
        .select(`
          *,
          article:articles(title, content, status)
        `)
        .order('sequence_order', { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast({
        title: "Error",
        description: "Failed to load chapters",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const chapterData = {
        ...formData,
        key_concepts: formData.key_concepts.split(',').map(k => k.trim()).filter(Boolean),
        sequence_order: formData.chapter_number,
        chapter_slug: formData.chapter_slug || formData.chapter_title.toLowerCase().replace(/\s+/g, '-'),
      };

      if (selectedChapter) {
        const { error } = await supabase
          .from('book_chapters')
          .update(chapterData)
          .eq('id', selectedChapter.id);

        if (error) throw error;
        toast({ title: "Chapter updated successfully" });
      } else {
        const { error } = await supabase
          .from('book_chapters')
          .insert([chapterData]);

        if (error) throw error;
        toast({ title: "Chapter created successfully" });
      }

      setIsDialogOpen(false);
      setSelectedChapter(null);
      resetForm();
      fetchChapters();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast({
        title: "Error",
        description: "Failed to save chapter",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      chapter_number: chapters.length + 1,
      chapter_title: '',
      chapter_slug: '',
      key_concepts: '',
      reading_time_minutes: 10,
      video_15min_url: '',
      video_5min_url: '',
      shorts_url: '',
      transcript: '',
      is_published: false,
    });
  };

  const editChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setFormData({
      chapter_number: chapter.chapter_number,
      chapter_title: chapter.chapter_title,
      chapter_slug: chapter.chapter_slug,
      key_concepts: Array.isArray(chapter.key_concepts) ? chapter.key_concepts.join(', ') : '',
      reading_time_minutes: chapter.reading_time_minutes || 10,
      video_15min_url: chapter.video_15min_url || '',
      video_5min_url: chapter.video_5min_url || '',
      shorts_url: chapter.shorts_url || '',
      transcript: chapter.transcript || '',
      is_published: chapter.is_published,
    });
    setIsDialogOpen(true);
  };

  const openNewChapterDialog = () => {
    setSelectedChapter(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading && chapters.length === 0) {
    return <div className="p-6">Loading chapters...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Book 1 Part 1 - Chapter Management</h1>
          <p className="text-muted-foreground">Manage serialized content pipeline from articles to videos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewChapterDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Chapter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedChapter ? 'Edit Chapter' : 'Create New Chapter'}</DialogTitle>
              <DialogDescription>
                Manage chapter content and multi-format versions
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="chapter_number">Chapter Number</Label>
                  <Input
                    id="chapter_number"
                    type="number"
                    value={formData.chapter_number}
                    onChange={(e) => setFormData({ ...formData, chapter_number: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                  <Input
                    id="reading_time"
                    type="number"
                    value={formData.reading_time_minutes}
                    onChange={(e) => setFormData({ ...formData, reading_time_minutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="chapter_title">Chapter Title</Label>
                <Input
                  id="chapter_title"
                  value={formData.chapter_title}
                  onChange={(e) => setFormData({ ...formData, chapter_title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="chapter_slug">URL Slug</Label>
                <Input
                  id="chapter_slug"
                  value={formData.chapter_slug}
                  onChange={(e) => setFormData({ ...formData, chapter_slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                />
              </div>

              <div>
                <Label htmlFor="key_concepts">Key Concepts (comma-separated)</Label>
                <Input
                  id="key_concepts"
                  value={formData.key_concepts}
                  onChange={(e) => setFormData({ ...formData, key_concepts: e.target.value })}
                  placeholder="corridor economics, strategic thinking, philosophy"
                />
              </div>

              <div className="space-y-3">
                <Label>Video URLs</Label>
                <div className="space-y-2">
                  <Input
                    placeholder="15-minute video URL"
                    value={formData.video_15min_url}
                    onChange={(e) => setFormData({ ...formData, video_15min_url: e.target.value })}
                  />
                  <Input
                    placeholder="5-minute video URL"
                    value={formData.video_5min_url}
                    onChange={(e) => setFormData({ ...formData, video_5min_url: e.target.value })}
                  />
                  <Input
                    placeholder="Shorts URL"
                    value={formData.shorts_url}
                    onChange={(e) => setFormData({ ...formData, shorts_url: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="transcript">Transcript</Label>
                <Textarea
                  id="transcript"
                  value={formData.transcript}
                  onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                  rows={4}
                  placeholder="Video transcript for accessibility and SEO..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Published</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {selectedChapter ? 'Update Chapter' : 'Create Chapter'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {chapters.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No chapters yet. Create your first chapter to start the book series.</p>
            </CardContent>
          </Card>
        ) : (
          chapters.map((chapter) => (
            <Card key={chapter.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Chapter {chapter.chapter_number}: {chapter.chapter_title}
                      <Badge variant={chapter.is_published ? "default" : "secondary"}>
                        {chapter.is_published ? "Published" : "Draft"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {Array.isArray(chapter.key_concepts) && chapter.key_concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {chapter.key_concepts.map((concept, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {concept}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => editChapter(chapter)}>
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {chapter.article ? "Article Ready" : "No Article"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {chapter.video_15min_url ? "15min ✓" : "15min ✗"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {chapter.video_5min_url ? "5min ✓" : "5min ✗"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {chapter.reading_time_minutes || 0}min read
                    </span>
                  </div>
                </div>
                
                {(chapter.video_15min_url || chapter.video_5min_url || chapter.shorts_url) && (
                  <div className="flex gap-2 mt-4">
                    {chapter.video_15min_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={chapter.video_15min_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          15min
                        </a>
                      </Button>
                    )}
                    {chapter.video_5min_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={chapter.video_5min_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          5min
                        </a>
                      </Button>
                    )}
                    {chapter.shorts_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={chapter.shorts_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Short
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};