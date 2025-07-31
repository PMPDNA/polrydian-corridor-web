import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { challengeMFA, verifyMFA, listMFAFactors } from '@/lib/supabase'
import { supabase } from '@/integrations/supabase/client'

interface TwoFactorVerificationProps {
  onSuccess: () => void
}

export default function TwoFactorVerification({ onSuccess }: TwoFactorVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [challengeId, setChallengeId] = useState('')
  const [factorId, setFactorId] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    initMFAChallenge()
  }, [])

  const initMFAChallenge = async () => {
    try {
      // Get the user's MFA factors
      const factors = await listMFAFactors()
      const totpFactor = factors.totp?.[0]
      
      if (!totpFactor) {
        toast({
          title: "No 2FA Setup",
          description: "Please set up two-factor authentication first.",
          variant: "destructive",
        })
        return
      }

      // Start MFA challenge
      const challenge = await challengeMFA(totpFactor.id)
      setChallengeId(challenge.id)
      setFactorId(totpFactor.id)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode || !factorId || !challengeId) return

    setIsLoading(true)
    try {
      console.log('Mobile MFA verification starting:', {
        isMobile: window.innerWidth <= 768,
        userAgent: navigator.userAgent
      })
      
      const mfaResponse = await verifyMFA(factorId, challengeId, verificationCode)
      console.log('MFA verification successful:', mfaResponse)
      
      // Wait for session refresh with proper error handling
      const { data: session, error: sessionError } = await supabase.auth.refreshSession()
      console.log('Session after MFA refresh:', session?.session?.access_token ? 'Token present' : 'No token', sessionError)
      
      if (sessionError) {
        console.error('Session refresh failed:', sessionError)
        throw sessionError
      }
      
      toast({
        title: "Welcome back!",
        description: "Two-factor authentication successful.",
      })
      
      // Let the auth system handle the state change naturally
      console.log('Calling onSuccess callback')
      onSuccess()
      
    } catch (error: any) {
      console.error('MFA verification failed:', error)
      toast({
        title: "Verification Failed",
        description: "Please check your code and try again.",
        variant: "destructive",
      })
      setVerificationCode('')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 w-fit rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Open your authenticator app and enter the current 6-digit code for this account.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Authentication Code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
                disabled={isLoading}
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}