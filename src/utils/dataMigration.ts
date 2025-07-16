import { supabase } from '@/integrations/supabase/client'

export interface LegacyArticle {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  heroImage: string
  publishDate: string
  readTime: number
  linkedinUrl: string
  featured: boolean
  vipPhotos?: string[]
  eventPhotos?: string[]
}

// Migration function to move data from localStorage to Supabase
export const migrateLegacyData = async (userId: string) => {
  try {
    // Migrate published articles
    const publishedArticles = localStorage.getItem('published-articles')
    if (publishedArticles) {
      const articles: LegacyArticle[] = JSON.parse(publishedArticles)
      
      for (const article of articles) {
        // Check if article already exists in database
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('title', article.title)
          .eq('user_id', userId)
          .single()
        
        if (!existing) {
          // Insert new article
          await supabase
            .from('articles')
            .insert({
              title: article.title,
              content: `${article.excerpt}\n\n${article.content}`,
              status: 'published',
              user_id: userId,
              published_at: article.publishDate ? new Date(article.publishDate).toISOString() : new Date().toISOString()
            })
        }
      }
      
      console.log(`Migrated ${articles.length} published articles`)
    }
    
    // Migrate simple articles (from other localStorage keys)
    const simpleArticles = localStorage.getItem('articles')
    if (simpleArticles) {
      const articles = JSON.parse(simpleArticles)
      
      for (const article of articles) {
        // Check if article already exists
        const { data: existing } = await supabase
          .from('articles')
          .select('id')
          .eq('title', article.title)
          .eq('user_id', userId)
          .single()
        
        if (!existing) {
          await supabase
            .from('articles')
            .insert({
              title: article.title,
              content: article.content,
              status: article.status || 'draft',
              user_id: userId,
              created_at: article.createdAt || new Date().toISOString(),
              updated_at: article.updatedAt || new Date().toISOString()
            })
        }
      }
      
      console.log(`Migrated ${articles.length} simple articles`)
    }
    
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}

// Clear legacy data after successful migration
export const clearLegacyData = () => {
  try {
    localStorage.removeItem('published-articles')
    localStorage.removeItem('articles')
    
    // Also clear any password-related data from the old system
    const keysToRemove = [
      'adminPassword',
      'userPassword',
      'tempPassword',
      'passwordChangeAttempts'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    console.log('Legacy data cleared')
    return true
  } catch (error) {
    console.error('Failed to clear legacy data:', error)
    return false
  }
}

// Check if user has legacy data that needs migration
export const hasLegacyData = (): boolean => {
  return !!(
    localStorage.getItem('published-articles') ||
    localStorage.getItem('articles') ||
    localStorage.getItem('adminPassword')
  )
}