import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Webhook, Send } from "lucide-react";

export default function ZapierLinkedInIntegration() {
  const [inboundWebhookUrl] = useState("https://qemtvnwemcpzhvbwjbsk.supabase.co/functions/v1/zapier-linkedin-webhook");
  const [outboundWebhookUrl, setOutboundWebhookUrl] = useState("");
  const [testArticleId, setTestArticleId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    });
  };

  const testOutboundWebhook = async () => {
    if (!outboundWebhookUrl || !testArticleId) {
      toast({
        title: "Missing Information",
        description: "Please provide both webhook URL and article ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://qemtvnwemcpzhvbwjbsk.supabase.co/functions/v1/zapier-publish-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_id: testArticleId,
          zapier_webhook_url: outboundWebhookUrl,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success!",
          description: `Article "${result.article_title}" sent to LinkedIn via Zapier`,
        });
      } else {
        throw new Error(result.error || "Failed to send to Zapier");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to test webhook",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Zapier LinkedIn Integration
          </CardTitle>
          <CardDescription>
            Connect your LinkedIn to Polrydian using Zapier webhooks for seamless content synchronization
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="inbound" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbound">Inbound (LinkedIn → Polrydian)</TabsTrigger>
          <TabsTrigger value="outbound">Outbound (Polrydian → LinkedIn)</TabsTrigger>
        </TabsList>

        <TabsContent value="inbound" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn to Polrydian Sync</CardTitle>
              <CardDescription>
                Import your LinkedIn posts and articles automatically using Zapier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL for Zapier</Label>
                <div className="flex gap-2">
                  <Input 
                    value={inboundWebhookUrl} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(inboundWebhookUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Create a new Zap in Zapier</li>
                  <li>
                    <strong>Trigger:</strong> LinkedIn (choose "New Post" or "New Article")
                    <Badge variant="secondary" className="ml-2">Company Page Only</Badge>
                  </li>
                  <li><strong>Action:</strong> Webhooks by Zapier → POST</li>
                  <li>Use the webhook URL above</li>
                  <li>Set payload type to JSON and map the fields:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li><code>type</code>: "linkedin_post" or "linkedin_article"</li>
                      <li><code>data.title</code>: Post/Article title</li>
                      <li><code>data.content</code>: Post/Article content</li>
                      <li><code>data.id</code>: LinkedIn ID</li>
                      <li><code>data.published_at</code>: Publication date</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href="https://zapier.com/apps/linkedin/integrations" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    LinkedIn Zapier App
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outbound" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Polrydian to LinkedIn Publishing</CardTitle>
              <CardDescription>
                Automatically share your Polrydian articles to LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="outbound-webhook">Your Zapier Webhook URL</Label>
                <Input
                  id="outbound-webhook"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={outboundWebhookUrl}
                  onChange={(e) => setOutboundWebhookUrl(e.target.value)}
                />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Setup Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Create a new Zap in Zapier</li>
                  <li><strong>Trigger:</strong> Webhooks by Zapier → Catch Hook</li>
                  <li>Copy the webhook URL and paste it above</li>
                  <li><strong>Action:</strong> LinkedIn Pages → Create Share Update</li>
                  <li>Map the fields:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      <li><code>Title</code>: {"{{title}}"}</li>
                      <li><code>Content</code>: {"{{excerpt}}"} + {"{{article_url}}"}</li>
                      <li><code>URL</code>: {"{{article_url}}"}</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Test the Integration</h4>
                <div className="space-y-2">
                  <Label htmlFor="test-article">Article ID (for testing)</Label>
                  <Input
                    id="test-article"
                    placeholder="Enter article ID to test publishing"
                    value={testArticleId}
                    onChange={(e) => setTestArticleId(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={testOutboundWebhook} 
                  disabled={isLoading || !outboundWebhookUrl || !testArticleId}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Publishing..." : "Test Publish to LinkedIn"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}