import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Mail, MessageSquare, Save, AlertTriangle } from "lucide-react";

interface AlertConfig {
  id?: string;
  alert_type: string;
  enabled: boolean;
  threshold: number;
  notification_channels: string[];
  email_recipients?: string[];
  slack_webhook_url?: string;
  cooldown_minutes: number;
}

export function AlertConfigurationPanel() {
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const defaultConfigs: AlertConfig[] = [
    {
      alert_type: 'failed_authentication',
      enabled: true,
      threshold: 5,
      notification_channels: ['email'],
      cooldown_minutes: 15
    },
    {
      alert_type: 'rate_limit_exceeded',
      enabled: true,
      threshold: 3,
      notification_channels: ['email'],
      cooldown_minutes: 30
    },
    {
      alert_type: 'integration_failure',
      enabled: true,
      threshold: 2,
      notification_channels: ['email', 'slack'],
      cooldown_minutes: 10
    },
    {
      alert_type: 'token_expiry',
      enabled: true,
      threshold: 1,
      notification_channels: ['email'],
      cooldown_minutes: 1440 // 24 hours
    }
  ];

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      // For now, load from localStorage since we don't have the table created yet
      const stored = localStorage.getItem('alertConfigs');
      if (stored) {
        setConfigs(JSON.parse(stored));
      } else {
        setConfigs(defaultConfigs);
      }
    } catch (error) {
      console.error('Error loading alert configs:', error);
      setConfigs(defaultConfigs);
    } finally {
      setLoading(false);
    }
  };

  const saveConfigs = async () => {
    setSaving(true);
    try {
      // For now, save to localStorage since we don't have the table created yet
      localStorage.setItem('alertConfigs', JSON.stringify(configs));
      
      toast({
        title: "Settings Saved",
        description: "Alert configurations have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving configs:', error);
      toast({
        title: "Error",
        description: "Failed to save alert configurations",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (index: number, updates: Partial<AlertConfig>) => {
    setConfigs(prev => prev.map((config, i) => 
      i === index ? { ...config, ...updates } : config
    ));
  };

  const toggleNotificationChannel = (configIndex: number, channel: string) => {
    setConfigs(prev => prev.map((config, i) => {
      if (i === configIndex) {
        const channels = config.notification_channels.includes(channel)
          ? config.notification_channels.filter(c => c !== channel)
          : [...config.notification_channels, channel];
        return { ...config, notification_channels: channels };
      }
      return config;
    }));
  };

  const testAlert = async (alertType: string) => {
    try {
      await supabase.functions.invoke('send-test-alert', {
        body: { alertType }
      });
      
      toast({
        title: "Test Alert Sent",
        description: `Test ${alertType} alert has been triggered`,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test alert",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            Loading alert configurations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alert Configuration</h2>
          <p className="text-muted-foreground">
            Configure thresholds and notification channels for security alerts
          </p>
        </div>
        <Button onClick={saveConfigs} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Alert configurations are currently stored locally. Database integration is available for production use.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {configs.map((config, index) => (
          <Card key={config.alert_type}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="capitalize flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {config.alert_type.replace(/_/g, ' ')}
                  </CardTitle>
                  <CardDescription>
                    Configure when and how to receive {config.alert_type.replace(/_/g, ' ')} alerts
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(enabled) => updateConfig(index, { enabled })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testAlert(config.alert_type)}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`threshold-${index}`}>Alert Threshold</Label>
                  <Input
                    id={`threshold-${index}`}
                    type="number"
                    value={config.threshold}
                    onChange={(e) => updateConfig(index, { threshold: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Trigger alert after this many incidents
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cooldown-${index}`}>Cooldown (minutes)</Label>
                  <Input
                    id={`cooldown-${index}`}
                    type="number"
                    value={config.cooldown_minutes}
                    onChange={(e) => updateConfig(index, { cooldown_minutes: parseInt(e.target.value) || 5 })}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum time between alerts of the same type
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Notification Channels</Label>
                <div className="flex flex-wrap gap-2">
                  {['email', 'slack', 'webhook'].map((channel) => (
                    <Badge
                      key={channel}
                      variant={config.notification_channels.includes(channel) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleNotificationChannel(index, channel)}
                    >
                      {channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
                      {channel === 'slack' && <MessageSquare className="h-3 w-3 mr-1" />}
                      {channel === 'webhook' && <Bell className="h-3 w-3 mr-1" />}
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              {config.notification_channels.includes('email') && (
                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`}>Email Recipients</Label>
                  <Input
                    id={`email-${index}`}
                    placeholder="admin@polrydian.com, security@polrydian.com"
                    value={config.email_recipients?.join(', ') || ''}
                    onChange={(e) => updateConfig(index, { 
                      email_recipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                    })}
                  />
                </div>
              )}

              {config.notification_channels.includes('slack') && (
                <div className="space-y-2">
                  <Label htmlFor={`slack-${index}`}>Slack Webhook URL</Label>
                  <Input
                    id={`slack-${index}`}
                    placeholder="https://hooks.slack.com/services/..."
                    value={config.slack_webhook_url || ''}
                    onChange={(e) => updateConfig(index, { slack_webhook_url: e.target.value })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}