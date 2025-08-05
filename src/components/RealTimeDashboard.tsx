import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, MessageSquare, Shield, TrendingUp, RefreshCw, 
  CheckCircle, AlertTriangle, XCircle, Clock 
} from "lucide-react";

interface SystemStatus {
  website: 'online' | 'offline' | 'warning';
  socialMedia: 'connected' | 'disconnected' | 'partial';
  security: 'secure' | 'warning' | 'alert';
  performance: 'optimal' | 'slow' | 'degraded';
}

interface IntegrationStatus {
  linkedin: boolean;
  instagram: boolean;
  lastSync: string | null;
  errors: string[];
}

export function RealTimeDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    website: 'online',
    socialMedia: 'disconnected',
    security: 'secure',
    performance: 'optimal'
  });
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    linkedin: false,
    instagram: false,
    lastSync: null,
    errors: []
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkSystemHealth();
    
    // Set up real-time monitoring
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    setIsChecking(true);
    try {
      // Check social media credentials
      const { data: credentials, error: credError } = await supabase
        .from('social_media_credentials')
        .select('platform, is_active, expires_at')
        .eq('is_active', true);

      if (!credError && credentials) {
        const linkedinActive = credentials.some(c => c.platform === 'linkedin');
        const instagramActive = credentials.some(c => c.platform === 'instagram');
        
        // Check for expired tokens
        const now = new Date();
        const expiredTokens = credentials.filter(c => 
          c.expires_at && new Date(c.expires_at) <= now
        );

        setIntegrationStatus({
          linkedin: linkedinActive,
          instagram: instagramActive,
          lastSync: new Date().toISOString(),
          errors: expiredTokens.map(t => `${t.platform} token expired`)
        });

        // Update social media status
        let socialStatus: 'connected' | 'disconnected' | 'partial';
        if (linkedinActive && instagramActive) {
          socialStatus = expiredTokens.length > 0 ? 'partial' : 'connected';
        } else if (linkedinActive || instagramActive) {
          socialStatus = 'partial';
        } else {
          socialStatus = 'disconnected';
        }

        setSystemStatus(prev => ({ ...prev, socialMedia: socialStatus }));
      }

      // Check recent integration logs for errors
      const { data: logs, error: logsError } = await supabase
        .from('integration_logs')
        .select('status, error_message, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!logsError && logs) {
        const recentErrors = logs.filter(log => 
          log.status === 'error' && 
          new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        );

        if (recentErrors.length > 0) {
          setSystemStatus(prev => ({ ...prev, performance: 'degraded' }));
        } else {
          setSystemStatus(prev => ({ ...prev, performance: 'optimal' }));
        }
      }

      // Check security audit logs for issues
      const { data: securityLogs, error: securityError } = await supabase
        .from('security_audit_log')
        .select('action, created_at')
        .like('action', '%violation%')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!securityError && securityLogs) {
        const recentViolations = securityLogs.filter(log => 
          new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        if (recentViolations.length > 0) {
          setSystemStatus(prev => ({ ...prev, security: 'warning' }));
        } else {
          setSystemStatus(prev => ({ ...prev, security: 'secure' }));
        }
      }

      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health check failed",
        description: "Unable to check system status",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'secure':
      case 'optimal':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'partial':
      case 'slow':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'offline':
      case 'disconnected':
      case 'alert':
      case 'degraded':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'secure':
      case 'optimal':
        return 'text-green-600';
      case 'warning':
      case 'partial':
      case 'slow':
        return 'text-yellow-600';
      case 'offline':
      case 'disconnected':
      case 'alert':
      case 'degraded':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'connected': return 'Connected';
      case 'secure': return 'Secure';
      case 'optimal': return 'Optimal';
      case 'warning': return 'Warning';
      case 'partial': return 'Partial';
      case 'slow': return 'Slow';
      case 'offline': return 'Offline';
      case 'disconnected': return 'Disconnected';
      case 'alert': return 'Alert';
      case 'degraded': return 'Degraded';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real-Time System Status</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate || 'Never'}
          </p>
        </div>
        <Button
          onClick={checkSystemHealth}
          disabled={isChecking}
          size="sm"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Website Status</CardTitle>
              <Activity className={`h-4 w-4 ${getStatusColor(systemStatus.website)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemStatus.website)}`}>
              {getStatusText(systemStatus.website)}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStatus.website === 'online' ? 'All systems operational' : 'Issues detected'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Social Media</CardTitle>
              <MessageSquare className={`h-4 w-4 ${getStatusColor(systemStatus.socialMedia)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemStatus.socialMedia)}`}>
              {getStatusText(systemStatus.socialMedia)}
            </div>
            <p className="text-xs text-muted-foreground">
              LinkedIn: {integrationStatus.linkedin ? '✓' : '✗'} | 
              Instagram: {integrationStatus.instagram ? '✓' : '✗'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className={`h-4 w-4 ${getStatusColor(systemStatus.security)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemStatus.security)}`}>
              {getStatusText(systemStatus.security)}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStatus.security === 'secure' ? 'No threats detected' : 'Security issues found'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className={`h-4 w-4 ${getStatusColor(systemStatus.performance)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemStatus.performance)}`}>
              {getStatusText(systemStatus.performance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemStatus.performance === 'optimal' ? 'Fast loading times' : 'Performance issues'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {integrationStatus.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Active Alerts</h4>
          {integrationStatus.errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integration Details</CardTitle>
          <CardDescription>
            Current status of all platform integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">LinkedIn Integration</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(integrationStatus.linkedin ? 'connected' : 'disconnected')}
                <Badge variant={integrationStatus.linkedin ? 'default' : 'destructive'}>
                  {integrationStatus.linkedin ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Instagram Integration</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(integrationStatus.instagram ? 'connected' : 'disconnected')}
                <Badge variant={integrationStatus.instagram ? 'default' : 'destructive'}>
                  {integrationStatus.instagram ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            {integrationStatus.lastSync && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Sync</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(integrationStatus.lastSync).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}