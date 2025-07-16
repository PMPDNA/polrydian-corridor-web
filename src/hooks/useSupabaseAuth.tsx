import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserDisplayName, isUserAdmin } from '@/utils/userUtils'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
  isAdmin: boolean
  displayName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin email - updated to use polrydian@gmail.com
const ADMIN_EMAIL = 'polrydian@gmail.com'

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = isUserAdmin(user)
  const displayName = getUserDisplayName(user)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    console.log('Attempting signup with:', { email })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: email === ADMIN_EMAIL ? 'Patrick Misiewicz' : 'User',
          name: email === ADMIN_EMAIL ? 'Patrick Misiewicz' : 'User'
        }
      }
    })
    console.log('Signup result:', { data, error })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting signin with:', { email })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('Signin result:', { data, error })
    return { data, error }
  }

  const resetPassword = async (email: string) => {
    console.log('Attempting password reset for:', { email })
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    console.log('Password reset result:', { data, error })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
    displayName,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}