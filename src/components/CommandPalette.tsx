import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Search, FileText, Image, User } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchContent = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search articles
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, slug, status')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(5);

      // Search images
      const { data: images } = await supabase
        .from('images')
        .select('id, alt_text, file_path')
        .ilike('alt_text', `%${searchQuery}%`)
        .limit(5);

      const searchResults = [
        ...(articles?.map(a => ({
          id: a.id,
          title: a.title,
          type: 'article',
          href: `/admin/articles`,
          icon: FileText
        })) || []),
        ...(images?.map(i => ({
          id: i.id,
          title: i.alt_text || 'Untitled Image',
          type: 'image',
          href: '/admin/images',
          icon: Image
        })) || [])
      ];

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchContent(query);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search articles, images... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && query && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          )}
          {!loading && !query && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Start typing to search...
            </div>
          )}
          {results.map((result) => {
            const Icon = result.icon;
            return (
              <div
                key={result.id}
                className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                onClick={() => {
                  window.location.href = result.href;
                  onOpenChange(false);
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span className="flex-1">{result.title}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {result.type}
                </span>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}