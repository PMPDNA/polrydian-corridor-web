import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Shield, Smartphone, Key, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { enrollMFA, verifyMFA, listMFAFactors, unenrollMFA } from '@/lib/supabase'
import { supabase } from '@/integrations/supabase/client'
import QRCode from 'qrcode'

interface MFAFactor {
  id: string
  friendly_name?: string
  factor_type: string
  status: string
}

export default function TwoFactorSetup() {
  const [factors, setFactors] = useState<MFAFactor[]>([])
  const [enrolling, setEnrolling] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadMFAFactors()
  }, [])

  const loadMFAFactors = async () => {
    try {
      const data = await listMFAFactors()
      setFactors(data.totp?.map(factor => ({
        id: factor.id,
        friendly_name: factor.friendly_name || 'Google Authenticator',
        factor_type: factor.factor_type,
        status: factor.status
      })) || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEnroll = async () => {
    setLoading(true)
    setEnrolling(true)
    
    try {
      const { id, totp, type } = await enrollMFA()
      setFactorId(id)
      setTotpSecret(totp.secret)
      
      // Generate QR code
      const { data: { user } } = await supabase.auth.getUser()
      const qrCodeData = totp.qr_code
      setQrCodeUrl(qrCodeData)
      
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      })
      setEnrolling(false)
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    
    try {
      // First create a challenge
      const { data: challenge } = await supabase.auth.mfa.challenge({
        factorId
      })
      
      if (!challenge) {
        throw new Error('Failed to create challenge')
      }

      // Then verify with the challenge
      await verifyMFA(factorId, challenge.id, verificationCode)
      
      toast({
        title: "Success!",
        description: "Two-factor authentication has been enabled.",
      })
      
      setEnrolling(false)
      setVerificationCode('')
      setQrCodeUrl('')
      setTotpSecret('')
      setFactorId('')
      await loadMFAFactors()
      
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleUnenroll = async (factorId: string) => {
    setLoading(true)
    
    try {
      await unenrollMFA(factorId)
      toast({
        title: "Success",
        description: "Two-factor authentication has been disabled.",
      })
      await loadMFAFactors()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const cancelEnrollment = () => {
    setEnrolling(false)
    setVerificationCode('')
    setQrCodeUrl('')
    setTotpSecret('')
    setFactorId('')
  }

  if (enrolling) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Follow these steps to secure your account with Google Authenticator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {qrCodeUrl && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Step 1: Scan QR Code</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Open Google Authenticator on your phone and scan this QR code:
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Manual Setup</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Or enter this secret key manually:
                </p>
                <div className="p-3 bg-muted rounded font-mono text-sm break-all">
                  {totpSecret}
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="verify-code" className="text-base font-medium">
                  Step 2: Enter Verification Code
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Enter the 6-digit code from your authenticator app:
                </p>
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="text-center text-lg font-mono"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleVerify}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? "Verifying..." : "Complete Setup"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cancelEnrollment}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const activeFactor = factors.find(f => f.status === 'verified')

  if (activeFactor) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Two-Factor Authentication
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </CardTitle>
          <CardDescription>
            Your account is protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Smartphone className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium">{activeFactor.friendly_name}</p>
              <p className="text-sm text-muted-foreground">Authenticator app</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleUnenroll(activeFactor.id)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Keep your authenticator app safe. You'll need it to access your account.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
          <Badge variant="secondary">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Not Enabled
          </Badge>
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your admin account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Two-factor authentication adds an extra layer of security to your account by requiring 
          a code from your phone in addition to your password.
        </p>
        
        <div className="flex items-start gap-3 p-4 border rounded-lg bg-blue-50/50">
          <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Google Authenticator Required</p>
            <p className="text-sm text-blue-700">
              Download Google Authenticator or another compatible TOTP app before proceeding.
            </p>
          </div>
        </div>

        <Button 
          onClick={handleEnroll}
          disabled={loading}
          className="w-full"
        >
          <Key className="h-4 w-4 mr-2" />
          {loading ? "Setting up..." : "Enable Two-Factor Authentication"}
        </Button>
      </CardContent>
    </Card>
  )
}