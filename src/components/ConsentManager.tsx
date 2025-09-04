import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, BarChart3, Target, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function ConsentManager() {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentPreferences();
  }, []);

  const loadCurrentPreferences = async () => {
    try {
      const response = await fetch('/functions/v1/track-cookie-consent', {
        method: 'GET',
      });
      const data = await response.json();
      
      if (data.hasConsent && data.consent) {
        setPreferences(data.consent);
      }
    } catch (error) {
      console.error('Failed to load consent preferences:', error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/functions/v1/track-cookie-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consent: preferences }),
      });

      if (response.ok) {
        window.cookieConsent = preferences;
        window.dispatchEvent(new CustomEvent('consentUpdated', { 
          detail: preferences 
        }));
        toast.success('Consent preferences updated successfully');
      }
    } catch (error) {
      console.error('Failed to save consent preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const requestDataExport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/functions/v1/gdpr-data-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_type: 'export',
          email: '', // Optional - will use visitor ID
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create download link
        const blob = new Blob([JSON.stringify(data.exportData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `polrydian-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Data export downloaded successfully');
      }
    } catch (error) {
      console.error('Failed to request data export:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const requestDataDeletion = async () => {
    if (!confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/functions/v1/gdpr-data-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_type: 'deletion',
          reason: 'User requested data deletion',
        }),
      });

      if (response.ok) {
        toast.success('Data deletion request submitted. It will be processed within 30 days.');
      }
    } catch (error) {
      console.error('Failed to request data deletion:', error);
      toast.error('Failed to submit deletion request');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Privacy & Cookie Settings</h1>
        <p className="text-muted-foreground">
          Manage your privacy preferences and data handling choices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cookie Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium">Essential Cookies</span>
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Necessary for the website to function properly. These cookies ensure basic 
                functionalities and security features of the website.
              </p>
            </div>
            <Switch checked={true} disabled />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Analytics Cookies</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Help us understand how visitors interact with our website by collecting 
                anonymous information about usage patterns and performance.
              </p>
            </div>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(checked) => updatePreference('analytics', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium">Marketing Cookies</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Used to track visitors across websites to display relevant advertisements 
                and marketing materials.
              </p>
            </div>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(checked) => updatePreference('marketing', checked)}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={savePreferences} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Under GDPR and other privacy laws, you have rights regarding your personal data.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Export Your Data</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Download all personal data we have collected about you.
              </p>
              <Button variant="outline" onClick={requestDataExport} disabled={loading}>
                Request Export
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="font-medium">Delete Your Data</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Request permanent deletion of all your personal data.
              </p>
              <Button variant="outline" onClick={requestDataDeletion} disabled={loading}>
                Request Deletion
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}