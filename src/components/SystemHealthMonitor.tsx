import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  database: {
    total_articles: number;
    published_articles: number;
    total_users: number;
    admin_users: number;
    recent_bookings: number;
    integration_logs_today: number;
  };
  recent_errors: number;
  active_rate_limits: number;
}

interface ServiceHealth {
  name: string;
  status: 'ok' | 'error' | 'unknown';
  url: string;
  lastCheck?: string;
  responseTime?: number;
}

export const SystemHealthMonitor = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [services, setServices] = useState<ServiceHealth[]>([
    { name: 'Main Health Check', status: 'unknown', url: '/functions/v1/health-check' },
    { name: 'FRED Data Integration', status: 'unknown', url: '/functions/v1/fetch-fred-data/health' },
    { name: 'LinkedIn Integration', status: 'unknown', url: '/functions/v1/linkedin-integration/health' },
  ]);
  const [loading, setLoading] = useState(false);

  const checkSystemHealth = async () => {
    setLoading(true);
    try {
      // Check database health
      const { data: dbHealth, error } = await supabase
        .rpc('system_health_check');

      if (error) {
        toast.error('Failed to check system health');
        return;
      }

      setHealthStatus(dbHealth as unknown as HealthStatus);

      // Check edge function health
      const supabaseUrl = 'https://qemtvnwemcpzhvbwjbsk.supabase.co';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbXR2bndlbWNwemh2YndqYnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTE2ODQsImV4cCI6MjA2ODIyNzY4NH0.9UikTq1ajnfhthxx_03zRk_3G3G_Bgky_w21wMXzLM';
      
      const updatedServices = await Promise.all(
        services.map(async (service) => {
          const startTime = Date.now();
          try {
            const response = await fetch(`${supabaseUrl}${service.url}`, {
              headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`
              }
            });
            
            const responseTime = Date.now() - startTime;
            
            return {
              ...service,
              status: response.ok ? 'ok' as const : 'error' as const,
              lastCheck: new Date().toISOString(),
              responseTime
            };
          } catch (error) {
            return {
              ...service,
              status: 'error' as const,
              lastCheck: new Date().toISOString(),
              responseTime: Date.now() - startTime
            };
          }
        })
      );

      setServices(updatedServices);
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('System health check failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall System Health */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>System Health Overview</CardTitle>
          <Button
            onClick={checkSystemHealth}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {healthStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthStatus.status)}
                <Badge className={getStatusColor(healthStatus.status)}>
                  {healthStatus.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date(healthStatus.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthStatus.database.total_articles}</div>
                  <div className="text-sm text-muted-foreground">Total Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthStatus.database.published_articles}</div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthStatus.database.recent_bookings}</div>
                  <div className="text-sm text-muted-foreground">Recent Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthStatus.recent_errors}</div>
                  <div className="text-sm text-muted-foreground">Recent Errors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthStatus.active_rate_limits}</div>
                  <div className="text-sm text-muted-foreground">Rate Limited</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthStatus.database.integration_logs_today}</div>
                  <div className="text-sm text-muted-foreground">API Calls Today</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading system health...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edge Function Health */}
      <Card>
        <CardHeader>
          <CardTitle>Edge Function Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium">{service.name}</div>
                    {service.lastCheck && (
                      <div className="text-sm text-muted-foreground">
                        Last checked: {new Date(service.lastCheck).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status.toUpperCase()}
                  </Badge>
                  {service.responseTime && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {service.responseTime}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};