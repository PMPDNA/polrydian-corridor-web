import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Mail, Lock, KeyRound, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import TwoFactorVerification from './TwoFactorVerification'

export default function SupabaseLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [needsMFA, setNeedsMFA] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showOneTimeSetup, setShowOneTimeSetup] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)
  const { signIn, signUp, resetPassword } = useSupabaseAuth()
  const { toast } = useToast()

  const ADMIN_EMAIL = 'polrydian@gmail.com'

  // Check if admin account exists on component mount
  useEffect(() => {
    createAdminAccountIfNeeded()
  }, [])

  const createAdminAccountIfNeeded = async () => {
    setIsCheckingAdmin(true)
    try {
      // Create admin account with temporary password
      const TEMP_PASSWORD = '123456789!'
      const { data, error } = await signUp(ADMIN_EMAIL, TEMP_PASSWORD)
      
      if (error) {
        if (error.message.includes('User already registered')) {
          // Account already exists, that's fine
          console.log('Admin account already exists')
        } else {
          console.error('Error creating admin account:', error)
        }
      } else {
        console.log('Admin account created with temporary password')
        toast({
          title: "Admin Account Ready",
          description: "Use polrydian@gmail.com with password: 123456789!",
        })
      }
    } catch (error) {
      console.error('Error setting up admin:', error)
    }
    setIsCheckingAdmin(false)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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

  const handleOneTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await signUp(ADMIN_EMAIL, password)
      
      if (error) {
        console.error('Admin setup error:', error)
        throw error
      }

      toast({
        title: "Admin Account Created",
        description: data.user?.email_confirmed_at 
          ? "Account created successfully! You can now sign in." 
          : "Account created! Please check your email to verify your account.",
      })
      
      setShowOneTimeSetup(false)
      setPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast({
        title: "Setup Failed",
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

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (showOneTimeSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 w-fit rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
            <CardDescription>
              Create your admin account for secure access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Creating admin access for: <strong>polrydian@gmail.com</strong>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleOneTimeSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="setup-password">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="setup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password (min. 8 characters)"
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
              
              <div className="space-y-2">
                <Label htmlFor="setup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="setup-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password.trim() || !confirmPassword.trim()}
              >
                {isLoading ? 'Creating Admin Account...' : 'Create Admin Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
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

  if (needsMFA) {
    return <TwoFactorVerification onCancel={() => setNeedsMFA(false)} />
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