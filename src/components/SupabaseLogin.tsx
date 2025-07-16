import { useState } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Mail, Lock, KeyRound } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { emailSchema } from '@/lib/security'
import { authRateLimit } from '@/lib/security-headers'
import TwoFactorVerification from './TwoFactorVerification'

export default function SupabaseLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [needsMFA, setNeedsMFA] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rateLimited, setRateLimited] = useState(false)
  const { signIn, resetPassword } = useSupabaseAuth()
  const { toast } = useToast()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Check rate limiting
    const clientId = `${email}_${Date.now().toString().slice(0, -3)}` // IP simulation
    if (!authRateLimit.isAllowed(clientId)) {
      const remainingTime = Math.ceil(authRateLimit.getRemainingTime(clientId) / 60000)
      setRateLimited(true)
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${remainingTime} minutes before trying again.`,
        variant: "destructive"
      })
      setIsLoading(false)
      return
    }

    // Validate inputs
    const emailValidation = emailSchema.safeParse(email)
    if (!emailValidation.success) {
      setErrors({ email: emailValidation.error.errors[0].message })
      setIsLoading(false)
      return
    }

    if (!password) {
      setErrors({ password: 'Password is required' })
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        console.error('Sign in error:', error)
        
        if (error.message.includes('MFA')) {
          setNeedsMFA(true)
          return
        }
        
        // Better error messages
        let errorMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the verification link before signing in.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Connection error. Please check your internet connection and try again.'
        }
        
        throw new Error(errorMessage)
      }

      // Check if using temporary password
      if (password === '123456789!') {
        toast({
          title: "Temporary Password Detected",
          description: "Please change your password in the Security tab for security.",
          variant: "destructive",
        })
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      })
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await resetPassword(email)
      
      if (error) throw error

      toast({
        title: "Reset Email Sent",
        description: "Please check your email for password reset instructions.",
      })
      
      setShowForgotPassword(false)
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (needsMFA) {
    return <TwoFactorVerification onCancel={() => setNeedsMFA(false)} />
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 w-fit rounded-full bg-primary/10">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back to Login
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 w-fit rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
          <CardDescription>
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Admin Credentials:</strong><br />
              Email: polrydian@gmail.com<br />
              Password: 123456789!
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Button
              type="button"
              variant="link"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-sm"
              disabled={isLoading}
            >
              Forgot your password?
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}