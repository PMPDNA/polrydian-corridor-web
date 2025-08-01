import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, Activity } from "lucide-react";

interface HealthStatus {
  overall_status: 'healthy' | 'warning' | 'error';
  integrations: Record<string, IntegrationHealth>;
  alerts: HealthAlert[];
  timestamp: string;
}

interface IntegrationHealth {
  status: 'healthy' | 'warning' | 'error';
  active_credentials: number;
  issues: string[];
  last_checked: string;
  message: string;
}

interface HealthAlert {
  platform: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  error?: string;
}

interface LogEntry {
  id: string;
  integration_type: string;
  operation: string;
  status: string;
  error_message?: string;
  created_at: string;
  execution_time_ms?: number;
}

export function IntegrationHealthDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkHealth();
    loadRecentLogs();
    
    // Set up real-time subscription for logs
    const logsSubscription = supabase
      .channel('integration-logs')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'integration_logs'
      }, () => {
        loadRecentLogs();
      })
      .subscribe();

    // Auto-refresh every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);

    return () => {
      supabase.removeChannel(logsSubscription);
      clearInterval(interval);
    };
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('integration-health-monitor');
      
      if (error) throw error;
      
      setHealthStatus(data);
      setLastUpdate(new Date().toLocaleString());
      
      // Show toast for new critical alerts
      if (data.alerts?.some((alert: HealthAlert) => alert.severity === 'high')) {
        toast({
          title: "Critical Integration Alert",
          description: "One or more integrations require immediate attention",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health Check Failed",
        description: "Failed to check integration health",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecentLogs(data || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive',
      success: 'default',
      pending: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const formatExecutionTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Integration Health Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of all platform integrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdate}
          </span>
          <Button
            onClick={checkHealth}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      {healthStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Overall System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {getStatusBadge(healthStatus.overall_status)}
              <span className="text-sm text-muted-foreground">
                {Object.keys(healthStatus.integrations).length} integrations monitored
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {healthStatus?.alerts && healthStatus.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Active Alerts</h3>
          {healthStatus.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.platform}:</strong> {alert.message}
                {alert.error && (
                  <div className="text-xs mt-1 opacity-75">{alert.error}</div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Recent Activity</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Integration Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {healthStatus && Object.entries(healthStatus.integrations).map(([platform, health]) => (
              <Card key={platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {platform}
                  </CardTitle>
                  {getStatusIcon(health.status)}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStatusBadge(health.status)}
                    <p className="text-xs text-muted-foreground">
                      {health.active_credentials} active connection{health.active_credentials !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm">{health.message}</p>
                    {health.issues.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium">Issues:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {health.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(health.last_checked).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Integration Activity</CardTitle>
              <CardDescription>
                Latest operations and their status across all integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium text-sm">
                          {log.integration_type} - {log.operation}
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-red-600">{log.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      {log.execution_time_ms && (
                        <p className="text-xs text-muted-foreground">
                          {formatExecutionTime(log.execution_time_ms)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentLogs.length > 0 
                    ? Math.round((recentLogs.filter(log => log.status === 'success').length / recentLogs.length) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {recentLogs.filter(log => log.status === 'success').length} successful operations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentLogs.filter(log => log.execution_time_ms).length > 0
                    ? formatExecutionTime(
                        recentLogs
                          .filter(log => log.execution_time_ms)
                          .reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) /
                        recentLogs.filter(log => log.execution_time_ms).length
                      )
                    : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all operations
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}