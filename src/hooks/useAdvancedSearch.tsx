import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useOptimizedData } from '@/utils/performanceOptimization'
import { useErrorHandler } from '@/utils/errorHandling'

export interface SearchResult {
  id: string
  title: string
  content: string
  type: 'article' | 'insight' | 'partner' | 'service'
  url: string
  relevanceScore: number
  highlights: string[]
  metadata: {
    author?: string
    publishedAt?: string
    tags?: string[]
    category?: string
  }
}

interface SearchFilters {
  type?: string
  dateRange?: { start: Date; end: Date }
  tags?: string[]
  sortBy?: 'relevance' | 'date' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export function useAdvancedSearch() {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const { handleError } = useErrorHandler()

  // Cache search data using optimized patterns
  const { data: searchData, loading: dataLoading } = useOptimizedData(
    'search-data',
    async () => {
      const [articles, insights, partners] = await Promise.all([
        supabase.from('articles').select('*').eq('status', 'published'),
        supabase.from('insights').select('*').eq('is_published', true),
        supabase.from('partners').select('*').eq('is_visible', true)
      ])

      return {
        articles: articles.data || [],
        insights: insights.data || [],
        partners: partners.data || []
      }
    },
    { cacheTTL: 5 * 60 * 1000 } // 5 minute cache
  )

  // Full-text search implementation
  const performSearch = useMemo(() => {
    if (!query.trim() || !searchData) return []

    const searchTerms = query.toLowerCase().split(/\s+/)
    const allItems: SearchResult[] = []

    // Search articles
    searchData.articles.forEach(article => {
      const searchableText = `${article.title} ${article.content} ${(article.keywords || []).join(' ')}`.toLowerCase()
      const relevanceScore = calculateRelevance(searchableText, searchTerms)
      
      if (relevanceScore > 0) {
        allItems.push({
          id: article.id,
          title: article.title,
          content: article.content,
          type: 'article',
          url: `/articles/${article.slug || article.id}`,
          relevanceScore,
          highlights: generateHighlights(article.content, searchTerms),
          metadata: {
            author: 'Patrick Misiewicz',
            publishedAt: article.published_at,
            tags: article.keywords || [],
            category: article.category
          }
        })
      }
    })

    // Search insights
    searchData.insights.forEach(insight => {
      const searchableText = `${insight.title} ${insight.content}`.toLowerCase()
      const relevanceScore = calculateRelevance(searchableText, searchTerms)
      
      if (relevanceScore > 0) {
        allItems.push({
          id: insight.id,
          title: insight.title,
          content: insight.content,
          type: 'insight',
          url: `/insights#${insight.id}`,
          relevanceScore,
          highlights: generateHighlights(insight.content, searchTerms),
          metadata: {
            publishedAt: insight.created_at,
            category: insight.indicator_type
          }
        })
      }
    })

    // Search partners
    searchData.partners.forEach(partner => {
      const searchableText = `${partner.name} ${partner.description || ''}`.toLowerCase()
      const relevanceScore = calculateRelevance(searchableText, searchTerms)
      
      if (relevanceScore > 0) {
        allItems.push({
          id: partner.id,
          title: partner.name,
          content: partner.description || '',
          type: 'partner',
          url: `/#partners`,
          relevanceScore,
          highlights: generateHighlights(partner.description || '', searchTerms),
          metadata: {
            category: partner.category
          }
        })
      }
    })

    return applyFiltersAndSort(allItems, filters)
  }, [query, searchData, filters])

  // Calculate relevance score based on term frequency and position
  const calculateRelevance = (text: string, terms: string[]): number => {
    let score = 0
    
    terms.forEach(term => {
      const termRegex = new RegExp(term, 'gi')
      const matches = text.match(termRegex) || []
      
      // Title matches get higher score
      if (text.indexOf(term) < 100) score += matches.length * 3
      else score += matches.length
    })

    return score
  }

  // Generate text highlights for search results
  const generateHighlights = (text: string, terms: string[]): string[] => {
    const highlights: string[] = []
    const sentences = text.split(/[.!?]+/)
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase()
      if (terms.some(term => lowerSentence.includes(term))) {
        highlights.push(sentence.trim())
      }
    })

    return highlights.slice(0, 3) // Limit to 3 highlights
  }

  // Apply filters and sorting
  const applyFiltersAndSort = (items: SearchResult[], filters: SearchFilters): SearchResult[] => {
    let filtered = [...items]

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type)
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(item => {
        if (!item.metadata.publishedAt) return false
        const itemDate = new Date(item.metadata.publishedAt)
        return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end
      })
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(item =>
        filters.tags!.some(tag => 
          item.metadata.tags?.includes(tag) || 
          item.metadata.category === tag
        )
      )
    }

    // Sort results
    const sortBy = filters.sortBy || 'relevance'
    const sortOrder = filters.sortOrder || 'desc'

    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'relevance':
          comparison = a.relevanceScore - b.relevanceScore
          break
        case 'date':
          const dateA = new Date(a.metadata.publishedAt || 0).getTime()
          const dateB = new Date(b.metadata.publishedAt || 0).getTime()
          comparison = dateA - dateB
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }

  // Execute search
  const search = async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    setLoading(true)
    try {
      setQuery(searchQuery)
      setFilters(searchFilters)
      
      // Results will be computed via useMemo
      const searchResults = performSearch
      setResults(searchResults)
      setTotalResults(searchResults.length)
    } catch (error) {
      handleError(error, { action: 'Performing search' })
      setResults([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setFilters({})
    setResults([])
    setTotalResults(0)
  }

  // Update results when search data changes
  useEffect(() => {
    if (query && searchData) {
      setResults(performSearch)
      setTotalResults(performSearch.length)
    }
  }, [query, searchData, performSearch])

  return {
    query,
    filters,
    results,
    loading: loading || dataLoading,
    totalResults,
    search,
    clearSearch,
    setFilters,
    availableTags: searchData ? [
      ...new Set([
        ...searchData.articles.flatMap(a => a.keywords || []),
        ...searchData.insights.map(i => i.indicator_type),
        ...searchData.partners.map(p => p.category)
      ])
    ] : []
  }
}