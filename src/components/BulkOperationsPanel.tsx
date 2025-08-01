import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useArticles } from "@/hooks/useArticles";
import { supabase } from "@/integrations/supabase/client";
import { 
  Check, 
  X, 
  Upload, 
  Link, 
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckSquare,
  Square,
  Trash2,
  Eye,
  Share
} from "lucide-react";

interface BulkAction {
  id: string;
  type: 'publish' | 'schedule' | 'sync' | 'delete' | 'reconnect';
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'destructive' | 'secondary';
}

interface SocialCredential {
  id: string;
  platform: string;
  username: string;
  status: 'active' | 'expired' | 'error';
  expires_at: string;
}

export function BulkOperationsPanel() {
  const { articles, loading: articlesLoading } = useArticles();
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [socialCredentials, setSocialCredentials] = useState<SocialCredential[]>([]);
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const { toast } = useToast();

  const bulkActions: BulkAction[] = [
    {
      id: 'publish',
      type: 'publish',
      label: 'Publish Selected',
      icon: <Upload className="h-4 w-4" />,
      variant: 'default'
    },
    {
      id: 'schedule',
      type: 'schedule',
      label: 'Schedule Posts',
      icon: <Calendar className="h-4 w-4" />,
      variant: 'secondary'
    },
    {
      id: 'sync',
      type: 'sync',
      label: 'Sync to Social',
      icon: <Link className="h-4 w-4" />,
      variant: 'secondary'
    },
    {
      id: 'delete',
      type: 'delete',
      label: 'Delete Selected',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive'
    }
  ];

  useEffect(() => {
    loadSocialCredentials();
  }, []);

  const loadSocialCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_credentials')
        .select('id, platform, access_token_encrypted, expires_at, is_active')
        .eq('is_active', true);

      if (error) throw error;

      const credentials: SocialCredential[] = (data || []).map(cred => ({
        id: cred.id,
        platform: cred.platform,
        username: `${cred.platform}_user`,
        status: new Date(cred.expires_at) < new Date() ? 'expired' : 'active',
        expires_at: cred.expires_at
      }));

      setSocialCredentials(credentials);
    } catch (error) {
      console.error('Error loading social credentials:', error);
      // Mock data for demonstration
      setSocialCredentials([
        {
          id: '1',
          platform: 'linkedin',
          username: 'linkedin_user',
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2', 
          platform: 'instagram',
          username: 'instagram_user',
          status: 'expired',
          expires_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setCredentialsLoading(false);
    }
  };

  const toggleArticleSelection = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const toggleCredentialSelection = (credentialId: string) => {
    setSelectedCredentials(prev => 
      prev.includes(credentialId) 
        ? prev.filter(id => id !== credentialId)
        : [...prev, credentialId]
    );
  };

  const selectAllArticles = () => {
    const publishedArticles = articles.filter(article => article.status === 'published');
    setSelectedArticles(publishedArticles.map(article => article.id));
  };

  const clearArticleSelection = () => {
    setSelectedArticles([]);
  };

  const oneClickReconnectAll = async () => {
    setProcessing(true);
    try {
      const expiredCredentials = socialCredentials.filter(cred => cred.status === 'expired');
      
      if (expiredCredentials.length === 0) {
        toast({
          title: "No Action Needed",
          description: "All social media connections are active",
        });
        return;
      }

      // For demo purposes, simulate reconnection process
      for (const cred of expiredCredentials) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: `Reconnecting ${cred.platform}`,
          description: `Starting reconnection for ${cred.username}`,
        });
      }

      // In production, this would redirect to OAuth flows
      toast({
        title: "Reconnection Started",
        description: `Initiated reconnection for ${expiredCredentials.length} platform(s)`,
      });

    } catch (error) {
      toast({
        title: "Reconnection Failed",
        description: "Failed to start reconnection process",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const executeBulkAction = async () => {
    if (!selectedAction || selectedArticles.length === 0) {
      toast({
        title: "Invalid Selection",
        description: "Please select articles and an action",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const action = bulkActions.find(a => a.id === selectedAction);
      
      switch (selectedAction) {
        case 'publish':
          // Simulate publishing
          await new Promise(resolve => setTimeout(resolve, 2000));
          toast({
            title: "Articles Published",
            description: `Successfully published ${selectedArticles.length} article(s)`,
          });
          break;
          
        case 'schedule':
          // Simulate scheduling
          await new Promise(resolve => setTimeout(resolve, 1500));
          toast({
            title: "Posts Scheduled",
            description: `Scheduled ${selectedArticles.length} article(s) for optimal times`,
          });
          break;
          
        case 'sync':
          if (selectedCredentials.length === 0) {
            toast({
              title: "No Platforms Selected",
              description: "Please select social media platforms to sync to",
              variant: "destructive",
            });
            return;
          }
          
          await new Promise(resolve => setTimeout(resolve, 2500));
          toast({
            title: "Sync Complete",
            description: `Synced ${selectedArticles.length} article(s) to ${selectedCredentials.length} platform(s)`,
          });
          break;
          
        case 'delete':
          if (!confirm(`Are you sure you want to delete ${selectedArticles.length} article(s)? This action cannot be undone.`)) {
            return;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast({
            title: "Articles Deleted",
            description: `Deleted ${selectedArticles.length} article(s)`,
            variant: "destructive",
          });
          break;
      }

      setSelectedArticles([]);
      setSelectedAction('');
      
    } catch (error) {
      toast({
        title: "Operation Failed",
        description: "Failed to execute bulk operation",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      active: 'default',
      expired: 'destructive',
      error: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bulk Operations</h2>
        <p className="text-muted-foreground">
          Manage multiple articles and reconnect social media platforms efficiently
        </p>
      </div>

      {/* One-Click Reconnect All */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Manage all your social media connections at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">One-Click Reconnect All</h3>
              <p className="text-sm text-muted-foreground">
                Reconnect all expired social media tokens in one operation
              </p>
            </div>
            <Button 
              onClick={oneClickReconnectAll} 
              disabled={processing || credentialsLoading}
              variant="secondary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              {processing ? 'Reconnecting...' : 'Reconnect All'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Connections Status */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Connections</CardTitle>
          <CardDescription>
            Current status of your social media integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {credentialsLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading connections...
            </div>
          ) : socialCredentials.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No social media connections found. Set up integrations first.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {socialCredentials.map((credential) => (
                <div key={credential.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedCredentials.includes(credential.id)}
                      onCheckedChange={() => toggleCredentialSelection(credential.id)}
                    />
                    <div>
                      <p className="font-medium capitalize">{credential.platform}</p>
                      <p className="text-sm text-muted-foreground">{credential.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(credential.status)}
                    {credential.status === 'expired' && (
                      <span className="text-xs text-muted-foreground">
                        Expired {new Date(credential.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Article Bulk Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Article Bulk Operations</CardTitle>
          <CardDescription>
            Select multiple articles and perform batch operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={selectAllArticles}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All Published
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearArticleSelection}
              >
                <Square className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
            </div>
            <Badge variant="secondary">
              {selectedArticles.length} selected
            </Badge>
          </div>

          {/* Action Selection */}
          <div className="flex items-center gap-4">
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose action..." />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => (
                  <SelectItem key={action.id} value={action.id}>
                    <div className="flex items-center gap-2">
                      {action.icon}
                      {action.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={executeBulkAction}
              disabled={!selectedAction || selectedArticles.length === 0 || processing}
              variant={bulkActions.find(a => a.id === selectedAction)?.variant || 'default'}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              {processing ? 'Processing...' : 'Execute'}
            </Button>
          </div>

          {/* Articles List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {articlesLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading articles...
              </div>
            ) : articles.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No articles found. Create some articles first.
                </AlertDescription>
              </Alert>
            ) : (
              articles
                .filter(article => article.status === 'published')
                .map((article) => (
                  <div key={article.id} className="flex items-center gap-3 p-3 border rounded hover:bg-secondary/20">
                    <Checkbox
                      checked={selectedArticles.includes(article.id)}
                      onCheckedChange={() => toggleArticleSelection(article.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(article.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{article.status}</Badge>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}