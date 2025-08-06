import { useState, useEffect } from 'react'
import { globalDataCache } from '@/utils/performanceOptimization'
import { useErrorHandler } from '@/utils/errorHandling'

interface OfflineAction {
  id: string
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  table: string
  data: any
  timestamp: number
}

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queuedActions, setQueuedActions] = useState<OfflineAction[]>([])
  const [syncInProgress, setSyncInProgress] = useState(false)
  const { handleError } = useErrorHandler()

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      console.log('Back online - syncing queued actions')
      syncQueuedActions()
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('Gone offline - actions will be queued')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load queued actions from localStorage
    loadQueuedActions()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load queued actions from localStorage
  const loadQueuedActions = () => {
    try {
      const stored = localStorage.getItem('offline_actions')
      if (stored) {
        const actions = JSON.parse(stored)
        setQueuedActions(actions)
      }
    } catch (error) {
      handleError(error, { action: 'Loading offline actions' })
    }
  }

  // Save queued actions to localStorage
  const saveQueuedActions = (actions: OfflineAction[]) => {
    try {
      localStorage.setItem('offline_actions', JSON.stringify(actions))
    } catch (error) {
      handleError(error, { action: 'Saving offline actions' })
    }
  }

  // Queue an action for later sync
  const queueAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    }

    const updatedQueue = [...queuedActions, newAction]
    setQueuedActions(updatedQueue)
    saveQueuedActions(updatedQueue)

    console.log('Action queued for offline sync:', newAction)
  }

  // Sync all queued actions when back online
  const syncQueuedActions = async () => {
    if (queuedActions.length === 0 || syncInProgress) return

    setSyncInProgress(true)
    const failedActions: OfflineAction[] = []

    for (const action of queuedActions) {
      try {
        await executeAction(action)
        console.log('Synced offline action:', action.id)
      } catch (error) {
        console.error('Failed to sync action:', action.id, error)
        failedActions.push(action)
      }
    }

    // Keep only failed actions in queue
    setQueuedActions(failedActions)
    saveQueuedActions(failedActions)
    setSyncInProgress(false)

    if (failedActions.length > 0) {
      handleError(new Error(`${failedActions.length} offline actions failed to sync`), {
        action: 'Offline sync',
        logLevel: 'warn'
      })
    }
  }

  // Execute a single queued action
  const executeAction = async (action: OfflineAction) => {
    // This would normally call your API/Supabase
    // For now, just simulate the action
    console.log('Executing offline action:', action)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // In a real implementation, you'd call the appropriate API based on action.type and action.table
    // For example:
    // if (action.type === 'CREATE') {
    //   await supabase.from(action.table).insert(action.data)
    // }
  }

  // Clear all queued actions
  const clearQueue = () => {
    setQueuedActions([])
    localStorage.removeItem('offline_actions')
  }

  // Get cached data for offline viewing
  const getCachedData = (key: string) => {
    return globalDataCache.get(key)
  }

  // Enhanced cache for offline data with fallback
  const getOfflineData = (key: string, fallbackData: any = null) => {
    const cached = globalDataCache.get(key)
    if (cached) return cached

    // Try to get from localStorage as secondary cache
    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Check if data is not too old (max 1 hour for offline)
        if (Date.now() - parsed.timestamp < 3600000) {
          return parsed.data
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve offline data:', error)
    }

    return fallbackData
  }

  // Store data for offline access
  const storeOfflineData = (key: string, data: any) => {
    // Store in memory cache
    globalDataCache.set(key, data)
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to store offline data:', error)
    }
  }

  return {
    isOnline,
    queuedActions: queuedActions.length,
    syncInProgress,
    queueAction,
    syncQueuedActions,
    clearQueue,
    getCachedData,
    getOfflineData,
    storeOfflineData
  }
}
