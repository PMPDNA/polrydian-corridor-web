import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { X, Settings, Shield, BarChart3, Target } from 'lucide-react';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    checkConsentStatus();
  }, []);

  const checkConsentStatus = async () => {
    try {
      const response = await fetch('/functions/v1/track-cookie-consent', {
        method: 'GET',
      });
      const data = await response.json();
      
      if (!data.hasConsent) {
        setShowBanner(true);
      } else {
        // Update global consent state
        window.cookieConsent = data.consent;
      }
    } catch (error) {
      console.warn('Could not check consent status:', error);
      setShowBanner(true);
    }
  };

  const saveConsent = async (consentData: ConsentPreferences) => {
    try {
      const response = await fetch('/functions/v1/track-cookie-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consent: consentData }),
      });

      if (response.ok) {
        // Set global consent state
        window.cookieConsent = consentData;
        setShowBanner(false);
        setShowSettings(false);
        
        // Dispatch consent event for analytics
        window.dispatchEvent(new CustomEvent('consentUpdated', { 
          detail: consentData 
        }));
      }
    } catch (error) {
      console.error('Failed to save consent:', error);
    }
  };

  const handleAcceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    saveConsent(allConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    saveConsent(minimalConsent);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const updatePreference = (key: keyof ConsentPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Card className="mx-auto max-w-4xl border-2">
          <CardContent className="p-6">
            {!showSettings ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This website uses cookies to ensure you get the best experience. 
                      We use essential cookies for site functionality and optional cookies 
                      for analytics to improve our services. You can choose which cookies 
                      you're comfortable with.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Essential (Required)
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Analytics (Optional)
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Marketing (Optional)
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                  </Button>
                  <Button variant="outline" onClick={handleRejectAll}>
                    Reject All
                  </Button>
                  <Button onClick={handleAcceptAll}>
                    Accept All
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Cookie Preferences</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">Essential Cookies</span>
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Necessary for the website to function properly. Cannot be disabled.
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
                        anonymous information.
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
                        Used to track visitors across websites to display relevant advertisements.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => updatePreference('marketing', checked)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleRejectAll}>
                    Reject All
                  </Button>
                  <Button onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    cookieConsent?: ConsentPreferences;
  }
}