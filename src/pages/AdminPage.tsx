import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Eye, EyeOff, Mail, Lock, KeyRound, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { emailSchema } from '@/lib/security'
import AdminDashboard from './admin/Dashboard'

export default function AdminPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { signIn, signUp, resetPassword, user, isAdmin, loading } = useSupabaseAuth()
  const { toast } = useToast()

  // Check if this is a password reset redirect
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')
    const error = searchParams.get('error')
    
    console.log('AdminPage loaded with auth params:', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      type,
      error,
      allParams: Object.fromEntries(searchParams.entries())
    })

    // If this looks like a password reset, redirect to the reset password page
    if ((accessToken && refreshToken) || type === 'recovery' || type === 'signup') {
      console.log('Detected password reset redirect, navigating to /reset-password')
      const currentUrl = new URL(window.location.href)
      navigate(`/reset-password${currentUrl.search}`, { replace: true })
      return
    }

    if (error) {
      toast({
        title: "Authentication Error",
        description: searchParams.get('error_description') || error,
        variant: "destructive",
      })
    }
  }, [searchParams, navigate, toast])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated and is admin, show the admin dashboard
  if (user && isAdmin) {
    return <AdminDashboard />
  }

  // If user is authenticated but not admin, show access denied
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Administrator privileges required to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Website
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show login form if not authenticated
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (showForgotPassword) {
        // Validate email format
        const emailValidation = emailSchema.safeParse(email)
        if (!emailValidation.success) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address.",
            variant: "destructive",
          })
          return
        }

        const { error } = await resetPassword(email)
        if (error) {
          toast({
            title: "Reset Failed",
            description: error.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Reset Email Sent",
            description: "Check your email for password reset instructions.",
          })
          setShowForgotPassword(false)
        }
        return
      }

      if (isSignUp) {
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

        const { error } = await signUp(email, password)
        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account.",
          })
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {showForgotPassword ? 'Reset Password' : isSignUp ? 'Create Admin Account' : 'Admin Login'}
          </CardTitle>
          <CardDescription>
            {showForgotPassword 
              ? "Enter your email to receive reset instructions" 
              : isSignUp 
                ? "Create your admin account to get started" 
                : "Sign in to access the admin panel"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@polrydian.com"
                required
                className="h-11"
              />
            </div>

            {!showForgotPassword && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="h-11"
                    />
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : showForgotPassword ? (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Send Reset Email
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            {!showForgotPassword && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm"
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            {showForgotPassword && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setEmail('')
                  }}
                  className="text-sm"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

            {!showForgotPassword && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  {isSignUp ? "Already have an account?" : "Need an account?"}
                </span>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  className="text-sm ml-1"
                >
                  {isSignUp ? "Sign In" : "Create Account"}
                </Button>
              </div>
            )}
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This is a secure admin area. Only authorized personnel with proper credentials can access these administrative functions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}