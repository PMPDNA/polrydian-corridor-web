import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, Mail, TestTube, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EmailServiceSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const { toast } = useToast()

  const testEmailService = async () => {
    if (!testEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address to test",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: "Test User",
          email: testEmail.trim(),
          message: "This is a test email to verify the email service is working correctly.",
          test: true
        }
      })

      if (error) throw error

      toast({
        title: "Test Email Sent",
        description: `Test email successfully sent to ${testEmail}`,
      })
    } catch (error: any) {
      console.error('Error testing email service:', error)
      
      if (error.message?.includes('RESEND_API_KEY')) {
        toast({
          title: "Email Service Not Configured",
          description: "The Resend API key is not configured. Please add it in the secrets.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Test Failed",
          description: error.message || "Failed to send test email",
          variant: "destructive",
        })
      }
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Service Setup
        </CardTitle>
        <CardDescription>
          Configure and test your email delivery service using Resend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Required Configuration</h4>
            <p className="text-sm text-muted-foreground mb-3">
              To enable email functionality, you need to configure the Resend API key in your Supabase secrets.
            </p>
            <div className="space-y-2 text-sm mb-4">
              <p>1. Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a></p>
              <p>2. Verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/domains</a></p>
              <p>3. Create an API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com/api-keys</a></p>
              <p>4. Add the key using the form below</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Add Resend API Key</h5>
              <p className="text-sm text-blue-700 mb-3">
                Click the button below to securely add your Resend API key
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <Button
              onClick={testEmailService}
              disabled={isTesting || !testEmail.trim()}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>

          <div className="pt-4">
            <h4 className="font-medium mb-2">Email Service Status</h4>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <Settings className="h-3 w-3 mr-1" />
                Configuration Required
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Test the email service to verify configuration
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}