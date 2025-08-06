import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'

// Unified Article interface for consistent usage across the app
export interface Article {
  id: string
  title: string
  content: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  published_at?: string
  user_id: string
  
  // SEO and metadata
  meta_description?: string
  keywords?: string[]
  slug?: string
  
  // Images and media
  featured_image?: string
  content_images?: string[]
  image_associations?: any[]
  video_url?: string
  video_thumbnail?: string
  video_duration?: number
  transcript?: string
  
  // Article structure
  content_type?: string
  reading_time_minutes?: number
  reference_sources?: any[]
  related_articles?: string[]
  chapter_id?: string
  
  // Publishing options
  auto_publish_linkedin?: boolean
  auto_publish_substack?: boolean
  auto_publish_medium?: boolean
  linkedin_url?: string
  
  // Display properties for unified interface
  excerpt?: string
  category?: string // Standardized to use string instead of keywords array
  heroImage?: string
  publishDate?: string
  readTime?: number
  linkedinUrl?: string
  featured?: boolean
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [operationLoading, setOperationLoading] = useState(false)
  const { user, isAdmin } = useSupabaseAuth()
  const { toast } = useToast()

  // Optimize: Cache articles to avoid redundant queries
  const [lastFetchTime, setLastFetchTime] = useState<number>(0)
  const CACHE_DURATION = 30000 // 30 seconds

  // Load articles - available to public for published articles
  const loadArticles = async (forceRefresh = false) => {
    const now = Date.now()
    
    // Skip fetch if we have recent data and not forcing refresh
    if (!forceRefresh && articles.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      // For public access, always filter to published articles unless user is admin
      if (!user || !isAdmin) {
        query = query.eq('status', 'published')
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setArticles((data || []) as Article[])
      setLastFetchTime(now)
    } catch (error: any) {
      console.error('Error loading articles:', error)
      toast({
        title: "Error Loading Articles",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Create new article
  const createArticle = async (title: string, content: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create articles.",
        variant: "destructive",
      })
      return null
    }

    setOperationLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title,
          content,
          user_id: user.id,
          status: 'draft'
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Article Created",
        description: "Your article has been created successfully.",
      })

      // Optimistically update local state instead of refetching all articles
      setArticles(prev => [data as Article, ...prev])
      return data
    } catch (error: any) {
      console.error('Error creating article:', error)
      toast({
        title: "Error Creating Article",
        description: error.message,
        variant: "destructive",
      })
      return null
    } finally {
      setOperationLoading(false)
    }
  }

  // Update article
  const updateArticle = async (id: string, updates: Partial<Pick<Article, 'title' | 'content' | 'status'>>) => {
    setOperationLoading(true)
    try {
      const updateData: any = { ...updates }
      
      // Set published_at when publishing
      if (updates.status === 'published') {
        updateData.published_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Article Updated",
        description: "Your article has been updated successfully.",
      })

      // Optimistically update local state
      setArticles(prev => prev.map(article => 
        article.id === id ? { ...article, ...data } as Article : article
      ))
      return data
    } catch (error: any) {
      console.error('Error updating article:', error)
      toast({
        title: "Error Updating Article",
        description: error.message,
        variant: "destructive",
      })
      return null
    } finally {
      setOperationLoading(false)
    }
  }

  // Delete article
  const deleteArticle = async (id: string) => {
    setOperationLoading(true)
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      toast({
        title: "Article Deleted",
        description: "The article has been deleted successfully.",
      })

      // Optimistically update local state
      setArticles(prev => prev.filter(article => article.id !== id))
      return true
    } catch (error: any) {
      console.error('Error deleting article:', error)
      toast({
        title: "Error Deleting Article",
        description: error.message,
        variant: "destructive",
      })
      return false
    } finally {
      setOperationLoading(false)
    }
  }

  // Load articles on mount and when user changes
  useEffect(() => {
    loadArticles()
  }, [user?.id, isAdmin])

  return {
    articles,
    loading,
    operationLoading,
    createArticle,
    updateArticle,
    deleteArticle,
    loadArticles
  }
}