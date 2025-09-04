import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Linkedin, 
  Instagram, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Upload,
  Share2,
  Monitor,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { LinkedInConnectionStatus } from './LinkedInConnectionStatus';
import { SocialMediaManager } from './SocialMediaManager';
import LinkedInSyncManager from './LinkedInSyncManager';
import { InstagramIntegration } from './InstagramIntegration';

interface ConnectionStatus {
  linkedin: boolean;
  instagram: boolean;
  loading: boolean;
}

export const EnhancedSocialMediaDashboard = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    linkedin: false,
    instagram: false,
    loading: true
  });
  const { toast } = useToast();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setConnectionStatus(prev => ({ ...prev, loading: true }));
      
      // Check LinkedIn connection
      const { data: linkedinCreds } = await supabase
        .from('social_media_credentials')
        .select('*')
        .eq('platform', 'linkedin')
        .eq('is_active', true)
        .single();

      // Check Instagram connection  
      const { data: instagramCreds } = await supabase
        .from('social_media_credentials')
        .select('*')
        .eq('platform', 'instagram')
        .eq('is_active', true)
        .single();

      setConnectionStatus({
        linkedin: !!linkedinCreds,
        instagram: !!instagramCreds,
        loading: false
      });
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const ConnectionStatusCard = ({ 
    platform, 
    connected, 
    icon: Icon, 
    onConnect 
  }: {
    platform: string;
    connected: boolean;
    icon: any;
    onConnect: () => void;
  }) => (
    <Card className={`border-2 ${connected ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {platform}
          </div>
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <X className="h-3 w-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="space-y-2">
            <p className="text-sm text-green-700">
              ✅ Ready to publish and sync content
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkConnectionStatus}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Status
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-orange-700">
              ⚠️ Connect to enable publishing features
            </p>
            <Button 
              onClick={onConnect}
              className="w-full"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Connect {platform}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const handleLinkedInConnect = async () => {
    try {
      // Redirect to LinkedIn OAuth
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.functions.invoke('linkedin-oauth', {
        body: { redirectUrl }
      });

      if (error) throw error;
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to LinkedIn:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to LinkedIn. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInstagramConnect = () => {
    toast({
      title: "Instagram Connection",
      description: "Instagram integration coming soon. Please check back later.",
    });
  };

  if (connectionStatus.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading connection status...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Social Media Connections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ConnectionStatusCard
            platform="LinkedIn"
            connected={connectionStatus.linkedin}
            icon={Linkedin}
            onConnect={handleLinkedInConnect}
          />
          <ConnectionStatusCard
            platform="Instagram"
            connected={connectionStatus.instagram}
            icon={Instagram}
            onConnect={handleInstagramConnect}
          />
        </div>
      </div>

      {/* Warning for disconnected services */}
      {(!connectionStatus.linkedin || !connectionStatus.instagram) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some social media platforms are not connected. Publishing features will be limited until connections are established.
          </AlertDescription>
        </Alert>
      )}

      {/* Social Media Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Monitor className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="linkedin" 
            disabled={!connectionStatus.linkedin}
            className={!connectionStatus.linkedin ? "opacity-50" : ""}
          >
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
            {!connectionStatus.linkedin && <X className="h-3 w-3 ml-1 text-red-500" />}
          </TabsTrigger>
          <TabsTrigger 
            value="instagram"
            disabled={!connectionStatus.instagram}
            className={!connectionStatus.instagram ? "opacity-50" : ""}
          >
            <Instagram className="h-4 w-4 mr-2" />
            Instagram
            {!connectionStatus.instagram && <X className="h-3 w-3 ml-1 text-red-500" />}
          </TabsTrigger>
          <TabsTrigger value="publish">
            <Share2 className="h-4 w-4 mr-2" />
            Publish
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SocialMediaManager />
        </TabsContent>

        <TabsContent value="linkedin" className="space-y-4">
          {connectionStatus.linkedin ? (
            <LinkedInSyncManager />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <Linkedin className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">LinkedIn Not Connected</h3>
                <p className="text-center text-muted-foreground">
                  Connect your LinkedIn account to sync and manage LinkedIn content.
                </p>
                <Button onClick={handleLinkedInConnect}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect LinkedIn
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="instagram" className="space-y-4">
          {connectionStatus.instagram ? (
            <InstagramIntegration />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                <Instagram className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Instagram Not Connected</h3>
                <p className="text-center text-muted-foreground">
                  Connect your Instagram account to sync and manage Instagram content.
                </p>
                <Button onClick={handleInstagramConnect} disabled>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect Instagram (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="publish" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Cross-Platform Publishing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {connectionStatus.linkedin || connectionStatus.instagram ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Publish content to connected social media platforms.
                  </p>
                  {/* Add publishing form here */}
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Publishing features are available for connected platforms only.
                      Currently connected: {connectionStatus.linkedin ? 'LinkedIn' : ''} {connectionStatus.instagram ? 'Instagram' : ''}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Platforms Connected</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect at least one social media platform to enable publishing features.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={handleLinkedInConnect}>
                      Connect LinkedIn
                    </Button>
                    <Button variant="outline" onClick={handleInstagramConnect} disabled>
                      Connect Instagram
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};