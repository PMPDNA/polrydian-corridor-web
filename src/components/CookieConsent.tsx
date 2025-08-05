import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Cookie, 
  Settings, 
  X,
  Check,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setShowBanner(false);
    
    // Initialize analytics if accepted
    if (allAccepted.analytics) {
      initializeAnalytics();
    }
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowPreferences(false);
    
    // Initialize analytics if accepted
    if (preferences.analytics) {
      initializeAnalytics();
    }
  };

  const handleDeclineAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary));
    setShowBanner(false);
  };

  const initializeAnalytics = () => {
    // Initialize Google Analytics or other analytics tools here
    console.log('Analytics initialized');
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner - Compact version positioned above content */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto">
        <div className="bg-background/95 backdrop-blur-sm border border-accent/20 rounded-lg shadow-elegant">
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3 flex-1">
              <Cookie className="h-4 w-4 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  We use cookies to enhance your experience. 
                  <a 
                    href="/privacy" 
                    className="text-accent hover:underline ml-1"
                  >
                    Learn more
                  </a>
                </p>
              </div>
            </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeclineAll}
                  className="text-xs"
                >
                  Decline
                </Button>
                
                <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Cookie Preferences</DialogTitle>
                      <DialogDescription>
                        Choose which cookies you'd like to accept. You can change these settings at any time.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-medium">Necessary Cookies</Label>
                            <p className="text-xs text-muted-foreground">
                              Essential for website functionality. Cannot be disabled.
                            </p>
                          </div>
                          <Switch checked={true} disabled />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-medium">Analytics Cookies</Label>
                            <p className="text-xs text-muted-foreground">
                              Help us understand how visitors interact with our website.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.analytics}
                            onCheckedChange={(checked) => updatePreference('analytics', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-medium">Marketing Cookies</Label>
                            <p className="text-xs text-muted-foreground">
                              Used to track visitors and show relevant advertisements.
                            </p>
                          </div>
                          <Switch 
                            checked={preferences.marketing}
                            onCheckedChange={(checked) => updatePreference('marketing', checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleAcceptSelected}
                          className="flex-1"
                          size="sm"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  onClick={handleAcceptAll}
                  size="sm"
                  className="text-xs"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}