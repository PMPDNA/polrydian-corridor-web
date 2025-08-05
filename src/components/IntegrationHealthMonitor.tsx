import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  Database,
  Upload,
  Globe,
  Zap
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message: string;
  lastCheck: string;
  responseTime?: number;
  details?: any;
}

interface IntegrationHealth {
  [key: string]: HealthStatus;
}

export function IntegrationHealthMonitor() {
  const [health, setHealth] = useState<IntegrationHealth>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const integrations = [
    {
      id: 'linkedin',
      name: 'LinkedIn Integration',
      icon: Globe,
      description: 'OAuth, sync, and publishing'
    },
    {
      id: 'storage',
      name: 'Supabase Storage',
      icon: Upload,
      description: 'Image uploads and management'
    },
    {
      id: 'database',
      name: 'Database Health',
      icon: Database,
      description: 'Connection and query performance'
    },
    {
      id: 'fred',
      name: 'FRED Economic Data',
      icon: Activity,
      description: 'Economic insights API'
    },
    {
      id: 'functions',
      name: 'Edge Functions',
      icon: Zap,
      description: 'Serverless function health'
    }
  ];

  const checkIntegrationHealth = async () => {
    setLoading(true);
    try {
      // Call health monitor function
      const { data, error } = await supabase.functions.invoke('integration-health-monitor', {
        body: { integrations: integrations.map(i => i.id) }
      });

      if (error) throw error;

      setHealth(data.health || {});
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      // Set all as unknown if health check fails
      const unknownHealth = integrations.reduce((acc, integration) => {
        acc[integration.id] = {
          status: 'unknown',
          message: 'Health check unavailable',
          lastCheck: new Date().toISOString(),
        };
        return acc;
      }, {} as IntegrationHealth);
      setHealth(unknownHealth);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkIntegrationHealth();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(checkIntegrationHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive',
      unknown: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const overallHealth = Object.values(health).length > 0
    ? Object.values(health).every(h => h.status === 'healthy')
      ? 'healthy'
      : Object.values(health).some(h => h.status === 'error')
      ? 'error'
      : 'warning'
    : 'unknown';

  const healthyCount = Object.values(health).filter(h => h.status === 'healthy').length;
  const totalCount = integrations.length;
  const healthPercentage = totalCount > 0 ? (healthyCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(overallHealth)}
              System Health Overview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={checkIntegrationHealth}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              {getStatusBadge(overallHealth)}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Healthy Integrations</span>
                <span>{healthyCount} of {totalCount}</span>
              </div>
              <Progress value={healthPercentage} className="h-2" />
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const status = health[integration.id];
          
          return (
            <Card key={integration.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <integration.icon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">{integration.name}</h3>
                  </div>
                  {status && getStatusIcon(status.status)}
                </div>
                
                <p className="text-xs text-muted-foreground mb-3">
                  {integration.description}
                </p>
                
                {status && (
                  <div className="space-y-2">
                    {getStatusBadge(status.status)}
                    
                    <p className="text-xs text-muted-foreground">
                      {status.message}
                    </p>
                    
                    {status.responseTime && (
                      <p className="text-xs text-muted-foreground">
                        Response: {status.responseTime}ms
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Checked: {new Date(status.lastCheck).toLocaleTimeString()}
                    </p>
                  </div>
                )}
                
                {!status && (
                  <div className="text-xs text-muted-foreground">
                    No health data available
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}