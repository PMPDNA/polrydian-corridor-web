import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'

export interface Article {
  id: string
  title: string
  content: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  published_at?: string
  user_id: string
  meta_description?: string
  keywords?: string[]
  featured_image?: string
  slug?: string
  reference_sources?: any[]
  related_articles?: string[]
  reading_time_minutes?: number
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const { user, isAdmin } = useSupabaseAuth()
  const { toast } = useToast()

  // Load articles based on user permissions
  const loadArticles = async () => {
    if (!user) {
      setArticles([])
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      // If not admin, only show user's own articles and published articles
      if (!isAdmin) {
        query = query.or(`user_id.eq.${user.id},and(status.eq.published)`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setArticles((data || []) as Article[])
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

      await loadArticles() // Reload articles
      return data
    } catch (error: any) {
      console.error('Error creating article:', error)
      toast({
        title: "Error Creating Article",
        description: error.message,
        variant: "destructive",
      })
      return null
    }
  }

  // Update article
  const updateArticle = async (id: string, updates: Partial<Pick<Article, 'title' | 'content' | 'status'>>) => {
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

      await loadArticles() // Reload articles
      return data
    } catch (error: any) {
      console.error('Error updating article:', error)
      toast({
        title: "Error Updating Article",
        description: error.message,
        variant: "destructive",
      })
      return null
    }
  }

  // Delete article
  const deleteArticle = async (id: string) => {
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

      await loadArticles() // Reload articles
      return true
    } catch (error: any) {
      console.error('Error deleting article:', error)
      toast({
        title: "Error Deleting Article",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }

  // Load articles when user changes
  useEffect(() => {
    loadArticles()
  }, [user?.id, isAdmin])

  return {
    articles,
    loading,
    createArticle,
    updateArticle,
    deleteArticle,
    loadArticles
  }
}