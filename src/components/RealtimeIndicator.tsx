import React from 'react'
import { useRealtimeUpdates, useUserPresence } from '@/hooks/useRealtimeUpdates'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, WifiOff, Users, Eye } from 'lucide-react'

interface RealtimeIndicatorProps {
  showUserPresence?: boolean
  roomId?: string
}

export const RealtimeIndicator: React.FC<RealtimeIndicatorProps> = ({ 
  showUserPresence = false,
  roomId = 'main'
}) => {
  const { connected, connectionCount } = useRealtimeUpdates([
    { table: 'articles' },
    { table: 'insights' },
    { table: 'partners' }
  ])

  const { users, onlineCount } = useUserPresence(roomId)

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant={connected ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {connected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span className="text-xs">
                {connected ? 'Live' : 'Offline'}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {connected 
                ? `Connected to ${connectionCount} realtime channels`
                : 'Not connected to realtime updates'
              }
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* User Presence */}
      {showUserPresence && onlineCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="text-xs">{onlineCount}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Online Users</p>
                {users.map((user, index) => (
                  <p key={index} className="text-xs flex items-center gap-1">
                    <Eye className="h-2 w-2" />
                    {user.name} on {user.page}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

// Live update notification component
export const LiveUpdateNotification: React.FC<{ message: string; onDismiss: () => void }> = ({
  message,
  onDismiss
}) => {
  return (
    <Card className="fixed bottom-4 right-4 z-50 shadow-lg border-primary">
      <CardContent className="p-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm">{message}</span>
        <button 
          onClick={onDismiss}
          className="ml-2 text-muted-foreground hover:text-foreground text-xs"
        >
          ✕
        </button>
      </CardContent>
    </Card>
  )
}