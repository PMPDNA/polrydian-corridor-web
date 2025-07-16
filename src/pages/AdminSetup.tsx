import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserCheck, Mail, Lock, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

export default function AdminSetup() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { signUp } = useSupabaseAuth()
  const { toast } = useToast()

  const ADMIN_EMAIL = 'polrydian@gmail.com'

  const handleSetup = async (e: React.FormEvent) => {
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
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account Already Exists",
            description: "Your admin account is already set up. You can now sign in.",
            variant: "destructive",
          })
          return
        }
        throw error
      }

      setIsComplete(true)
      toast({
        title: "Admin Account Created",
        description: "Please check your email to verify your account, then you can sign in.",
      })
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

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 w-fit rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Setup Complete</CardTitle>
            <CardDescription>
              Your admin account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                A verification email has been sent to <strong>polrydian@gmail.com</strong>. 
                Please check your email and click the verification link.
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-muted-foreground">
              After verifying your email, you can sign in to access the admin panel.
            </p>
            
            <Button asChild className="w-full">
              <a href="/admin">Continue to Sign In</a>
            </Button>
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
            <UserCheck className="h-8 w-8 text-primary" />
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
              Setting up admin access for: <strong>polrydian@gmail.com</strong>
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password (min. 8 characters)"
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
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