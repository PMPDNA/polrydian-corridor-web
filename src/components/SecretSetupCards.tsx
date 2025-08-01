import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Instagram, TrendingUp, Key } from "lucide-react"

interface SecretSetupCardProps {
  title: string
  description: string
  secretName: string
  icon: any
  setupUrl?: string
  docsUrl?: string
}

function SecretSetupCard({ title, description, secretName, icon: Icon, setupUrl, docsUrl }: SecretSetupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Required Secret: {secretName}</p>
          <p className="text-xs text-muted-foreground">
            This API key will be securely stored in Supabase Edge Function secrets
          </p>
        </div>
        
        <div className="space-y-2">
          {setupUrl && (
            <Button variant="outline" size="sm" asChild className="w-full">
              <a href={setupUrl} target="_blank" rel="noopener noreferrer">
                <Key className="h-4 w-4 mr-2" />
                Get API Key
              </a>
            </Button>
          )}
          {docsUrl && (
            <Button variant="ghost" size="sm" asChild className="w-full">
              <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                View Documentation
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function SecretSetupCards() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">API Key Configuration</h2>
        <p className="text-muted-foreground">
          Configure the required API keys to enable all integration features
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SecretSetupCard
          title="Resend Email API"
          description="Required for email delivery service including contact forms and notifications"
          secretName="RESEND_API_KEY"
          icon={Mail}
          setupUrl="https://resend.com/api-keys"
          docsUrl="https://resend.com/docs"
        />

        <SecretSetupCard
          title="Instagram Access Token"
          description="Required for Instagram Business API to publish posts and sync content"
          secretName="INSTAGRAM_ACCESS_TOKEN"
          icon={Instagram}
          setupUrl="https://developers.facebook.com/apps/"
          docsUrl="https://developers.facebook.com/docs/instagram-api"
        />

        <SecretSetupCard
          title="Economic Data API"
          description="Required for fetching economic insights and market data"
          secretName="ECONOMIC_DATA_API_KEY"
          icon={TrendingUp}
          setupUrl="https://fred.stlouisfed.org/docs/api/api_key.html"
          docsUrl="https://fred.stlouisfed.org/docs/api/"
        />
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">Add Missing API Keys</h3>
        <p className="text-sm text-yellow-700 mb-4">
          Based on the edge function logs, the following API keys are missing and need to be configured:
        </p>
        
        <div className="space-y-4">
          <div className="bg-white rounded border p-3">
            <h4 className="font-medium mb-2">Resend Email API Key</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Click below to securely add your Resend API key to Supabase secrets
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800 mb-2">Add RESEND_API_KEY Secret</p>
              <p className="text-xs text-blue-600">
                This will open a secure form to add your API key to Supabase Edge Function secrets
              </p>
            </div>
          </div>

          <div className="bg-white rounded border p-3">
            <h4 className="font-medium mb-2">Economic Data API Key</h4>
            <p className="text-xs text-muted-foreground mb-3">
              Add your economic data provider API key (e.g., FRED, World Bank)
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800 mb-2">Add ECONOMIC_DATA_API_KEY Secret</p>
              <p className="text-xs text-blue-600">
                Configure your preferred economic data API provider
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How to Add API Keys</CardTitle>
          <CardDescription className="text-blue-700">
            Follow these steps to securely configure your API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Click "Get API Key" for the service you want to configure</li>
            <li>Sign up or log in to the service provider</li>
            <li>Generate or copy your API key</li>
            <li>Use the secret configuration form to add the key securely</li>
            <li>Test the integration to verify it's working</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}