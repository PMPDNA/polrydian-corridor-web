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

  const startEnrollment = async () => {
    setLoading(true)
    try {
      const data = await enrollMFA()
      
      if (data.totp) {
        const { qr_code, secret } = data.totp
        setTotpSecret(secret)
        setFactorId(data.id)
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(qr_code)
        setQrCodeUrl(qrCodeDataUrl)
        setEnrolling(true)
      }
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message,
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const completeEnrollment = async () => {
    if (!verificationCode || !factorId) return

    setLoading(true)
    try {
      await verifyMFA(factorId, '', verificationCode)
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled.",
      })
      
      // Reset state and reload factors
      setEnrolling(false)
      setQrCodeUrl('')
      setTotpSecret('')
      setFactorId('')
      setVerificationCode('')
      await loadMFAFactors()
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: "Please check your code and try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const removeFactor = async (factorId: string) => {
    setLoading(true)
    try {
      await unenrollMFA(factorId)
      toast({
        title: "2FA Disabled",
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
    setQrCodeUrl('')
    setTotpSecret('')
    setFactorId('')
    setVerificationCode('')
  }

  const hasActiveFactor = factors.some(factor => factor.status === 'verified')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account with Google Authenticator or any TOTP app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {hasActiveFactor ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <div className="font-medium">
                  {hasActiveFactor ? '2FA Enabled' : '2FA Disabled'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {hasActiveFactor 
                    ? 'Your account is protected with two-factor authentication'
                    : 'Your account is not protected with two-factor authentication'
                  }
                </div>
              </div>
            </div>
            <Badge variant={hasActiveFactor ? 'default' : 'secondary'}>
              {hasActiveFactor ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Active Factors */}
          {factors.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Active Authenticators</h4>
              {factors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{factor.friendly_name || 'Google Authenticator'}</div>
                      <div className="text-sm text-muted-foreground">
                        Status: {factor.status}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFactor(factor.id)}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Enrollment Process */}
          {!enrolling ? (
            <div className="space-y-4">
              <h4 className="font-medium">Setup New Authenticator</h4>
              <p className="text-sm text-muted-foreground">
                Use Google Authenticator, Authy, or any other TOTP-compatible app to generate codes.
              </p>
              <Button onClick={startEnrollment} disabled={loading} className="gap-2">
                <Key className="h-4 w-4" />
                Add Authenticator
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="font-medium">Setup Your Authenticator App</h4>
              
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Scan the QR code below with your authenticator app, then enter the 6-digit code to complete setup.
                </AlertDescription>
              </Alert>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Or enter this secret manually:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-1 break-all">
                      {totpSecret}
                    </code>
                  </div>
                </div>
              )}

              {/* Verification */}
              <div className="space-y-3">
                <Label htmlFor="verification-code">Enter 6-digit code from your app</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={completeEnrollment} 
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  Verify & Enable 2FA
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
    </div>
  )
}