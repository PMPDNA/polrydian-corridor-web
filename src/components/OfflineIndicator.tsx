import React from 'react'
import { useOfflineSupport } from '@/hooks/useOfflineSupport'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiOff, Wifi, RefreshCw, Archive, CloudOff } from 'lucide-react'

export const OfflineIndicator: React.FC = () => {
  const {
    isOnline,
    queuedActions,
    syncInProgress,
    syncQueuedActions,
    clearQueue
  } = useOfflineSupport()

  if (isOnline && queuedActions === 0) {
    return null // Don't show anything when online with no queued actions
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      {!isOnline ? (
        <Alert className="shadow-lg border-orange-500">
          <CloudOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You're offline. Changes will be saved locally.</span>
            <Badge variant="outline" className="ml-2">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          </AlertDescription>
        </Alert>
      ) : queuedActions > 0 ? (
        <Card className="shadow-lg border-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Offline Changes
              <Badge variant="secondary">{queuedActions}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">
              You have {queuedActions} unsynchronized action{queuedActions !== 1 ? 's' : ''}.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={syncQueuedActions}
                disabled={syncInProgress}
                className="flex items-center gap-1"
              >
                {syncInProgress ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Wifi className="h-3 w-3" />
                )}
                {syncInProgress ? 'Syncing...' : 'Sync Now'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearQueue}
                disabled={syncInProgress}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

// Hook for components that need offline-aware functionality
export const useOfflineAware = () => {
  const { isOnline, queueAction, getOfflineData, storeOfflineData } = useOfflineSupport()

  const saveOfflineAware = async (data: any, action: any) => {
    if (isOnline) {
      // Try to save online first
      try {
        return await action(data)
      } catch (error) {
        // If online save fails, queue for later
        queueAction({
          type: 'CREATE',
          table: 'unknown',
          data
        })
        throw error
      }
    } else {
      // Queue action for when back online
      queueAction({
        type: 'CREATE',
        table: 'unknown',
        data
      })
      
      // Store locally for immediate access
      const localId = `local_${Date.now()}`
      storeOfflineData(localId, data)
      
      return { id: localId, ...data }
    }
  }

  return {
    isOnline,
    saveOfflineAware,
    getOfflineData,
    storeOfflineData
  }
}