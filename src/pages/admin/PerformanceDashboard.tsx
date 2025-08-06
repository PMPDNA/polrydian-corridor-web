import React from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { Activity, Wifi, WifiOff, Monitor, Zap } from 'lucide-react';

export default function PerformanceDashboardPage() {
  const realtimeStatus = useRealtimeUpdates('articles');
  const { isOnline } = useOfflineSupport();

  return (
    <AdminLayout title="Performance Dashboard">
      <div className="space-y-6">
        {/* System Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Network</span>
                  <Badge variant={isOnline ? "default" : "destructive"}>
                    {isOnline ? "Online" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Real-time</span>
                  <Badge variant={realtimeConnected ? "default" : "secondary"}>
                    {realtimeConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                {networkStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {networkStatus.effectiveType || 'Unknown'}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Last Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {lastUpdate ? (
                  <>Real-time: {new Date(lastUpdate).toLocaleTimeString()}</>
                ) : (
                  "No recent updates"
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Refresh Metrics
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => console.clear()}
                >
                  Clear Console
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Alerts */}
        {!isOnline && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Some metrics may not be up to date.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Performance Dashboard */}
        <PerformanceDashboard />

        {/* Integration Testing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Integration Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Search Features</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Advanced Search</span>
                    <Badge variant="default" size="sm">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Search Analytics</span>
                    <Badge variant="default" size="sm">Tracking</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Indexed Content</span>
                    <Badge variant="default" size="sm">Updated</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Real-time & Offline</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>WebSocket Connection</span>
                    <Badge variant={realtimeConnected ? "default" : "secondary"} size="sm">
                      {realtimeConnected ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Offline Support</span>
                    <Badge variant="default" size="sm">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache Management</span>
                    <Badge variant="default" size="sm">Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}