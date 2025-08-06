import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/utils/errorHandling';

interface WebsiteContent {
  id: string;
  section_name: string;
  content_key: string;
  content_type: string;
  content_value: string;
  description?: string;
  is_active: boolean;
}

export function useWebsiteContent(sectionName?: string) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [allContent, setAllContent] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const loadContent = async () => {
    try {
      let query = supabase
        .from('website_content')
        .select('*')
        .eq('is_active', true);

      if (sectionName) {
        query = query.eq('section_name', sectionName);
      }

      const { data, error } = await query.order('section_name', { ascending: true });

      if (error) throw error;

      if (data) {
        setAllContent(data);
        
        // Create a flat object for easy access: section_key -> value
        const contentMap: Record<string, string> = {};
        data.forEach(item => {
          const key = sectionName ? item.content_key : `${item.section_name}_${item.content_key}`;
          contentMap[key] = item.content_value;
        });
        setContent(contentMap);
      }
    } catch (error: any) {
      handleError(error, {
        action: 'Loading website content',
        title: 'Error Loading Content'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (id: string, newValue: string) => {
    try {
      const { error } = await supabase
        .from('website_content')
        .update({ content_value: newValue })
        .eq('id', id);

      if (error) throw error;

      // Reload content to get updated values
      await loadContent();
      return true;
    } catch (error: any) {
      handleError(error, {
        action: 'Updating website content',
        title: 'Update Failed'
      });
      return false;
    }
  };

  const getContent = (key: string, fallback = '') => {
    return content[key] || fallback;
  };

  useEffect(() => {
    loadContent();
  }, [sectionName]);

  return {
    content,
    allContent,
    loading,
    getContent,
    updateContent,
    loadContent
  };
}