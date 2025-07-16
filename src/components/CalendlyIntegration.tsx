import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { Calendar, Clock, Video, Phone, Users, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendlySettings {
  username: string;
  eventTypes: {
    id: string;
    name: string;
    duration: number;
    description: string;
    url: string;
    enabled: boolean;
  }[];
}

export function CalendlyIntegration() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CalendlySettings>({
    username: "",
    eventTypes: [
      {
        id: "1",
        name: "Strategic Consultation",
        duration: 60,
        description: "Deep-dive strategic planning session",
        url: "",
        enabled: true
      },
      {
        id: "2", 
        name: "Initial Discovery Call",
        duration: 30,
        description: "Quick intro and needs assessment",
        url: "",
        enabled: true
      },
      {
        id: "3",
        name: "Project Planning Session",
        duration: 90,
        description: "Detailed project scoping and timeline",
        url: "",
        enabled: false
      }
    ]
  });

  const updateUsername = (username: string) => {
    const updatedSettings = {
      ...settings,
      username,
      eventTypes: settings.eventTypes.map(event => ({
        ...event,
        url: username ? `https://calendly.com/${username}/${event.name.toLowerCase().replace(/\s+/g, '-')}` : ""
      }))
    };
    setSettings(updatedSettings);
  };

  const updateEventType = (id: string, updates: Partial<CalendlySettings['eventTypes'][0]>) => {
    setSettings(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.map(event => 
        event.id === id ? { ...event, ...updates } : event
      )
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Calendly URL copied successfully",
    });
  };

  const getEmbedCode = (eventType: CalendlySettings['eventTypes'][0]) => {
    if (!settings.username) return "";
    
    return `<!-- Calendly inline widget begin -->
<div class="calendly-inline-widget" data-url="${eventType.url}" style="min-width:320px;height:630px;"></div>
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>
<!-- Calendly inline widget end -->`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Calendly Integration</h2>
        <p className="text-muted-foreground">
          Configure your Calendly scheduling links for strategic consultations
        </p>
      </div>

      {/* Calendly Username Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendly Configuration
          </CardTitle>
          <CardDescription>
            Enter your Calendly username to generate scheduling links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendlyUsername">Calendly Username</Label>
            <div className="flex gap-2">
              <div className="flex-1 flex">
                <span className="inline-flex items-center px-3 text-sm bg-muted border border-r-0 rounded-l-md">
                  calendly.com/
                </span>
                <Input
                  id="calendlyUsername"
                  value={settings.username}
                  onChange={(e) => updateUsername(e.target.value)}
                  placeholder="your-username"
                  className="rounded-l-none"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Find your username in your Calendly account settings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Event Types Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Types</CardTitle>
          <CardDescription>
            Configure your different types of strategic consultations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.eventTypes.map((eventType) => (
            <div key={eventType.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {eventType.duration >= 60 ? (
                      <Users className="h-4 w-4 text-primary" />
                    ) : (
                      <Phone className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{eventType.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{eventType.duration} minutes</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={eventType.enabled ? "default" : "secondary"}>
                    {eventType.enabled ? "Active" : "Disabled"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateEventType(eventType.id, { enabled: !eventType.enabled })}
                  >
                    {eventType.enabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meeting Name</Label>
                  <Input
                    value={eventType.name}
                    onChange={(e) => updateEventType(eventType.id, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={eventType.duration}
                    onChange={(e) => updateEventType(eventType.id, { duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={eventType.description}
                  onChange={(e) => updateEventType(eventType.id, { description: e.target.value })}
                  rows={2}
                />
              </div>

              {settings.username && eventType.enabled && (
                <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm">Generated Calendly URL:</h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(eventType.url)}
                      className="gap-2"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <code className="text-xs bg-background p-2 rounded border block break-all">
                    {eventType.url}
                  </code>
                  
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <a href={eventType.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Test Link
                      </a>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(getEmbedCode(eventType))}
                    >
                      Copy Embed Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Integration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            How to add Calendly to your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Option 1: Direct Links</h4>
            <p className="text-sm text-muted-foreground">
              Use the generated URLs in your contact forms, email signatures, or call-to-action buttons.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Option 2: Embedded Widget</h4>
            <p className="text-sm text-muted-foreground">
              Copy the embed code and paste it into your website where you want the scheduling calendar to appear.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Option 3: Popup Widget</h4>
            <div className="bg-muted p-3 rounded-lg">
              <code className="text-xs">
                {`<!-- Calendly badge widget begin -->
<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
<script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>
<script type="text/javascript">window.onload = function() { Calendly.initBadgeWidget({ url: 'https://calendly.com/${settings.username || 'your-username'}', text: 'Schedule time with me', color: '#0069ff', textColor: '#ffffff', branding: true }); }</script>
<!-- Calendly badge widget end -->`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}