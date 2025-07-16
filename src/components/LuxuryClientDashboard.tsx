import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Settings, 
  Bell, 
  Clock, 
  Globe, 
  Calendar,
  Zap,
  Shield,
  Star,
  HeadphonesIcon,
  MessageSquare,
  TrendingUp
} from "lucide-react";

interface ClientPreferences {
  id?: string;
  user_id: string;
  communication_preference: string;
  timezone: string;
  preferred_meeting_times: any;
  industry_focus: any;
  notification_preferences: any;
  meeting_frequency: string;
  project_updates_frequency: string;
  concierge_services: boolean;
  premium_support: boolean;
}

export const LuxuryClientDashboard = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<ClientPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Create default preferences
        const defaultPrefs: ClientPreferences = {
          user_id: user.id,
          communication_preference: 'email',
          timezone: 'America/New_York',
          preferred_meeting_times: [],
          industry_focus: [],
          notification_preferences: {
            email: true,
            sms: false,
            calendar: true
          },
          meeting_frequency: 'as_needed',
          project_updates_frequency: 'weekly',
          concierge_services: false,
          premium_support: false
        };
        setPreferences(defaultPrefs);
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load your preferences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user || !preferences) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('client_preferences')
        .upsert(preferences);

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your luxury client preferences have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof ClientPreferences, value: any) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const luxuryFeatures = [
    {
      icon: Crown,
      title: "VIP Priority Access",
      description: "Priority scheduling and immediate consultation access",
      active: preferences?.premium_support || false
    },
    {
      icon: HeadphonesIcon,
      title: "Dedicated Support",
      description: "Personal account manager and 24/7 priority support",
      active: preferences?.concierge_services || false
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered meeting optimization based on your preferences",
      active: true
    },
    {
      icon: MessageSquare,
      title: "Executive Briefings",
      description: "Weekly strategic insights tailored to your industry",
      active: preferences?.project_updates_frequency === 'weekly'
    }
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crown className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold text-foreground">Luxury Client Experience</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Customize your strategic consultation experience with premium features designed for discerning clients.
        </p>
      </div>

      {/* Luxury Features Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {luxuryFeatures.map((feature, index) => (
          <Card key={index} className={`shadow-elegant transition-all duration-300 ${
            feature.active ? 'border-accent bg-accent/5' : 'border-border'
          }`}>
            <CardContent className="p-6 text-center">
              <div className={`p-3 rounded-full mx-auto mb-4 w-fit ${
                feature.active ? 'bg-accent/20' : 'bg-muted'
              }`}>
                <feature.icon className={`h-6 w-6 ${
                  feature.active ? 'text-accent' : 'text-muted-foreground'
                }`} />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
              <Badge variant={feature.active ? "default" : "secondary"}>
                {feature.active ? "Active" : "Available"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preferences Configuration */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Communication Preferences */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="communication_preference">Preferred Communication Method</Label>
              <Select
                value={preferences?.communication_preference || 'email'}
                onValueChange={(value) => updatePreference('communication_preference', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="in_person">In-Person Meetings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={preferences?.timezone || 'America/New_York'}
                onValueChange={(value) => updatePreference('timezone', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  <SelectItem value="Europe/London">London Time</SelectItem>
                  <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notification Preferences</Label>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Email Notifications</span>
                  </div>
                  <Switch
                    checked={preferences?.notification_preferences?.email || false}
                    onCheckedChange={(checked) => 
                      updatePreference('notification_preferences', {
                        ...preferences?.notification_preferences,
                        email: checked
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Calendar Integration</span>
                  </div>
                  <Switch
                    checked={preferences?.notification_preferences?.calendar || false}
                    onCheckedChange={(checked) => 
                      updatePreference('notification_preferences', {
                        ...preferences?.notification_preferences,
                        calendar: checked
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Premium Services */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Premium Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="meeting_frequency">Meeting Frequency</Label>
              <Select
                value={preferences?.meeting_frequency || 'as_needed'}
                onValueChange={(value) => updatePreference('meeting_frequency', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Check-ins</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly Reviews</SelectItem>
                  <SelectItem value="monthly">Monthly Strategic Sessions</SelectItem>
                  <SelectItem value="quarterly">Quarterly Business Reviews</SelectItem>
                  <SelectItem value="as_needed">As Needed Basis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="project_updates">Project Update Frequency</Label>
              <Select
                value={preferences?.project_updates_frequency || 'weekly'}
                onValueChange={(value) => updatePreference('project_updates_frequency', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Updates</SelectItem>
                  <SelectItem value="weekly">Weekly Reports</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly Summaries</SelectItem>
                  <SelectItem value="monthly">Monthly Overviews</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Concierge Services</h4>
                  <p className="text-sm text-muted-foreground">
                    Personal assistant for meeting coordination and logistics
                  </p>
                </div>
                <Switch
                  checked={preferences?.concierge_services || false}
                  onCheckedChange={(checked) => updatePreference('concierge_services', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">Premium Support</h4>
                  <p className="text-sm text-muted-foreground">
                    24/7 priority access and dedicated account management
                  </p>
                </div>
                <Switch
                  checked={preferences?.premium_support || false}
                  onCheckedChange={(checked) => updatePreference('premium_support', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <Button
          onClick={savePreferences}
          disabled={isSaving}
          size="lg"
          className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
        >
          {isSaving ? (
            <>
              <Zap className="h-5 w-5 mr-2 animate-spin" />
              Saving Preferences...
            </>
          ) : (
            <>
              <Star className="h-5 w-5 mr-2" />
              Save Luxury Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
};