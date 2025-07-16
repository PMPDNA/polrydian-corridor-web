import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Cookie, 
  Shield, 
  Save,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    const saved = localStorage.getItem('cookie-consent');
    return saved ? JSON.parse(saved) : {
      necessary: true,
      analytics: false,
      marketing: false
    };
  });

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been updated successfully.",
    });
    
    // Reload page to apply new settings
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const resetToDefaults = () => {
    const defaults = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    setPreferences(defaults);
    localStorage.setItem('cookie-consent', JSON.stringify(defaults));
    toast({
      title: "Preferences Reset",
      description: "Cookie preferences have been reset to defaults.",
    });
  };

  const cookieTypes = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'Necessary Cookies',
      description: 'Essential cookies required for basic website functionality, security, and navigation. These cannot be disabled.',
      examples: 'Session management, security tokens, accessibility settings',
      disabled: true
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website by collecting anonymous information.',
      examples: 'Page views, user journeys, performance metrics',
      disabled: false
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites and show relevant, personalized advertisements.',
      examples: 'Ad targeting, social media integration, conversion tracking',
      disabled: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <div className="p-3 bg-accent/10 rounded-full">
              <Cookie className="h-8 w-8 text-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Cookie Settings</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Manage your cookie preferences and understand how we use cookies to enhance your experience on our website.
          </p>
        </div>

        {/* Current Status */}
        <Card className="shadow-elegant mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Current Cookie Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className={`w-3 h-3 rounded-full mx-auto ${preferences.necessary ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-sm font-medium">Necessary</p>
                <p className="text-xs text-muted-foreground">Always Active</p>
              </div>
              <div className="space-y-2">
                <div className={`w-3 h-3 rounded-full mx-auto ${preferences.analytics ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-sm font-medium">Analytics</p>
                <p className="text-xs text-muted-foreground">{preferences.analytics ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="space-y-2">
                <div className={`w-3 h-3 rounded-full mx-auto ${preferences.marketing ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-sm font-medium">Marketing</p>
                <p className="text-xs text-muted-foreground">{preferences.marketing ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Types */}
        <div className="space-y-4 mb-8">
          {cookieTypes.map((type) => (
            <Card key={type.key} className="shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{type.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{type.description}</p>
                    <div className="text-xs text-muted-foreground">
                      <strong>Examples:</strong> {type.examples}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={preferences[type.key]}
                      onCheckedChange={(checked) => updatePreference(type.key, checked)}
                      disabled={type.disabled}
                    />
                    <Label className="text-sm">{preferences[type.key] ? 'On' : 'Off'}</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={savePreferences} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
          <Button onClick={resetToDefaults} variant="outline" size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>

        {/* Additional Information */}
        <Card className="shadow-elegant mt-8 bg-muted/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Important Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Necessary cookies are always active as they're essential for website security and functionality.</p>
              <p>• You can change these preferences at any time by returning to this page.</p>
              <p>• Some features may not work properly if certain cookies are disabled.</p>
              <p>• For more information about our data practices, please review our <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}