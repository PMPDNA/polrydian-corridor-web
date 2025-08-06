import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useErrorHandler } from '@/utils/errorHandling'
import { globalDataCache } from '@/utils/performanceOptimization'

interface RealtimeConfig {
  table: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  filter?: string
  onUpdate?: (payload: any) => void
}

export function useRealtimeUpdates(configs: RealtimeConfig[]) {
  const [connected, setConnected] = useState(false)
  const [connectionCount, setConnectionCount] = useState(0)
  const { handleError } = useErrorHandler()

  useEffect(() => {
    const channels: any[] = []

    configs.forEach((config, index) => {
      const channelName = `realtime-${config.table}-${index}`
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes' as any,
          {
            event: config.event || '*',
            schema: 'public',
            table: config.table,
            filter: config.filter
          },
          (payload) => {
            console.log(`Realtime update on ${config.table}:`, payload)
            
            // Clear related cache entries
            globalDataCache.clear(config.table)
            globalDataCache.clear('search-data') // Clear search cache when data changes
            
            // Call custom handler
            if (config.onUpdate) {
              config.onUpdate(payload)
            }
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${config.table}:`, status)
          
          if (status === 'SUBSCRIBED') {
            setConnectionCount(prev => prev + 1)
          } else if (status === 'CHANNEL_ERROR') {
            handleError(new Error(`Realtime connection failed for ${config.table}`), {
              action: 'Realtime subscription',
              logLevel: 'warn'
            })
          }
        })

      channels.push(channel)
    })

    // Set connected status when all channels are ready
    setConnected(connectionCount === configs.length)

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
      setConnectionCount(0)
      setConnected(false)
    }
  }, [configs, connectionCount, handleError])

  return {
    connected,
    connectionCount
  }
}

// Specific hooks for common use cases
export function useArticleUpdates(onUpdate?: (payload: any) => void) {
  return useRealtimeUpdates([
    {
      table: 'articles',
      event: '*',
      onUpdate
    }
  ])
}

export function useInsightUpdates(onUpdate?: (payload: any) => void) {
  return useRealtimeUpdates([
    {
      table: 'insights',
      event: '*',
      onUpdate
    }
  ])
}

export function usePartnerUpdates(onUpdate?: (payload: any) => void) {
  return useRealtimeUpdates([
    {
      table: 'partners',
      event: '*',
      onUpdate
    }
  ])
}

// Hook for live user presence
export function useUserPresence(roomId: string = 'main') {
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const channel = supabase.channel(`presence-${roomId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState()
        const allUsers = Object.values(presenceState).flat()
        setUsers(allUsers)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const user = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Anonymous User',
            joinedAt: new Date().toISOString(),
            page: window.location.pathname
          }
          
          setCurrentUser(user)
          await channel.track(user)
        }
      })

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [roomId])

  return {
    users,
    currentUser,
    onlineCount: users.length
  }
}