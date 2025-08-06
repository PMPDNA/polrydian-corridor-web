import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useErrorHandler } from '@/utils/errorHandling'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiry: number
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  clear(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry ? Date.now() <= entry.expiry : false
  }
}

export const globalDataCache = new DataCache()

// Enhanced data fetching hook with caching and optimistic updates
export function useOptimizedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    cache?: boolean
    cacheTTL?: number
    refetchOnMount?: boolean
    refetchOnWindowFocus?: boolean
  } = {}
) {
  const {
    cache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    refetchOnMount = true,
    refetchOnWindowFocus = false
  } = options

  const [data, setData] = useState<T | null>(
    cache ? globalDataCache.get<T>(key) : null
  )
  const [loading, setLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)
  const { handleError } = useErrorHandler()

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first if not forcing refresh
    if (!forceRefresh && cache && globalDataCache.has(key)) {
      const cachedData = globalDataCache.get<T>(key)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return cachedData
      }
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      setData(result)
      
      if (cache) {
        globalDataCache.set(key, result, cacheTTL)
      }
      
      return result
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch data'
      setError(errorMessage)
      handleError(err, { action: `Fetching ${key}` })
      return null
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, cache, cacheTTL, handleError])

  // Optimistic update function
  const updateOptimistically = useCallback((newData: T) => {
    setData(newData)
    if (cache) {
      globalDataCache.set(key, newData, cacheTTL)
    }
  }, [key, cache, cacheTTL])

  // Invalidate cache and refetch
  const invalidateAndRefetch = useCallback(() => {
    if (cache) {
      globalDataCache.clear(key)
    }
    return fetchData(true)
  }, [key, cache, fetchData])

  useEffect(() => {
    if (refetchOnMount || !data) {
      fetchData()
    }
  }, [fetchData, refetchOnMount, data])

  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => fetchData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchData, refetchOnWindowFocus])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateOptimistically,
    invalidateAndRefetch
  }
}

// Utility for batching multiple operations
export function useBatchedOperations<T>() {
  const [operations, setOperations] = useState<Array<() => Promise<T>>>([])
  const [results, setResults] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const { handleError } = useErrorHandler()

  const addOperation = useCallback((operation: () => Promise<T>) => {
    setOperations(prev => [...prev, operation])
  }, [])

  const executeBatch = useCallback(async () => {
    if (operations.length === 0) return []

    setLoading(true)
    try {
      const batchResults = await Promise.allSettled(
        operations.map(op => op())
      )

      const successfulResults: T[] = []
      const errors: any[] = []

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value)
        } else {
          errors.push(result.reason)
          handleError(result.reason, { 
            action: `Batch operation ${index + 1}`,
            logLevel: 'warn'
          })
        }
      })

      setResults(successfulResults)
      setOperations([]) // Clear operations after execution
      return successfulResults
    } catch (error) {
      handleError(error, { action: 'Batch execution' })
      return []
    } finally {
      setLoading(false)
    }
  }, [operations, handleError])

  const clearOperations = useCallback(() => {
    setOperations([])
  }, [])

  return {
    operations: operations.length,
    results,
    loading,
    addOperation,
    executeBatch,
    clearOperations
  }
}

// Memory management utility
export function useMemoryOptimization() {
  useEffect(() => {
    // Clean up cache every 10 minutes
    const cleanup = setInterval(() => {
      globalDataCache.clear()
    }, 10 * 60 * 1000)

    // Clean up on page unload
    const handleUnload = () => {
      globalDataCache.clear()
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(cleanup)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])
}