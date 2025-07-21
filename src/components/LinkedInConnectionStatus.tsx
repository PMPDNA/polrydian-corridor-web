import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Linkedin, Check, X, RefreshCw, UserCheck, Calendar, Clock } from 'lucide-react';

interface LinkedInCredential {
  id: string;
  platform_user_id: string;
  profile_data: any;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export const LinkedInConnectionStatus = () => {
  const [credentials, setCredentials] = useState<LinkedInCredential | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkLinkedInConnection();
  }, []);

  const checkLinkedInConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_credentials')
        .select('*')
        .eq('platform', 'linkedin')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setCredentials(data[0] as LinkedInCredential);
      }
    } catch (error: any) {
      console.error('Error checking LinkedIn connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectLinkedIn = () => {
    setIsConnecting(true);
    const redirectUri = `${window.location.origin}/auth/callback`;
    const clientId = '78z20ojmlvz2ks';
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=profile%20email%20w_member_social`;
    
    // Open in the same window to handle the callback properly
    window.location.href = authUrl;
  };

  const disconnectLinkedIn = async () => {
    if (!credentials) return;

    try {
      const { error } = await supabase
        .from('social_media_credentials')
        .update({ is_active: false })
        .eq('id', credentials.id);

      if (error) throw error;

      setCredentials(null);
      toast({
        title: 'Disconnected',
        description: 'LinkedIn account has been disconnected.',
      });
    } catch (error: any) {
      console.error('Error disconnecting LinkedIn:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect LinkedIn account.',
        variant: 'destructive',
      });
    }
  };

  const testConnection = async () => {
    if (!credentials) return;

    try {
      const { data, error } = await supabase.functions.invoke('linkedin-integration', {
        body: { action: 'test_connection' }
      });

      if (error) throw error;

      toast({
        title: 'Connection Test',
        description: data?.success ? 'LinkedIn connection is working!' : 'Connection test failed.',
        variant: data?.success ? 'default' : 'destructive',
      });
    } catch (error: any) {
      console.error('Error testing LinkedIn connection:', error);
      toast({
        title: 'Error',
        description: 'Failed to test LinkedIn connection.',
        variant: 'destructive',
      });
    }
  };

  const isExpired = credentials ? new Date(credentials.expires_at) < new Date() : false;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Checking LinkedIn connection...</span>
      </div>
    );
  }

  if (!credentials) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <X className="h-5 w-5 text-red-500" />
          <span className="font-medium">LinkedIn Not Connected</span>
          <Badge variant="destructive">Disconnected</Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Connect your LinkedIn account to sync posts and publish content.
        </p>
        
        <Button
          onClick={connectLinkedIn}
          disabled={isConnecting}
          className="flex items-center gap-2"
        >
          <Linkedin className="h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect LinkedIn'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Check className="h-5 w-5 text-green-500" />
        <span className="font-medium">LinkedIn Connected</span>
        <Badge variant={isExpired ? "destructive" : "default"}>
          {isExpired ? 'Expired' : 'Active'}
        </Badge>
      </div>

      {credentials.profile_data && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="font-medium">
              {credentials.profile_data.localizedFirstName} {credentials.profile_data.localizedLastName}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center gap-2">
              <span>Platform User ID:</span>
              <code className="bg-background px-1 rounded text-xs">
                {credentials.platform_user_id}
              </code>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Connected:</span>
              <span>{new Date(credentials.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Expires:</span>
              <span className={isExpired ? 'text-red-500' : ''}>
                {new Date(credentials.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={testConnection}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Test Connection
        </Button>
        
        <Button
          onClick={disconnectLinkedIn}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <X className="h-3 w-3" />
          Disconnect
        </Button>
        
        {isExpired && (
          <Button
            onClick={connectLinkedIn}
            size="sm"
            className="flex items-center gap-2"
          >
            <Linkedin className="h-3 w-3" />
            Reconnect
          </Button>
        )}
      </div>

      {isExpired && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Your LinkedIn connection has expired. Please reconnect to continue using LinkedIn features.
          </p>
        </div>
      )}
    </div>
  );
};