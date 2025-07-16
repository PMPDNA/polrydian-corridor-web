import { createClient } from '@supabase/supabase-js'

// Use environment variables or fallback for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'

console.log('Supabase Environment Check:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  url: supabaseUrl.includes('demo') ? 'Using demo URL' : 'Using real URL'
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for 2FA
export const enrollMFA = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: 'Google Authenticator'
  })
  
  if (error) throw error
  return data
}

export const verifyMFA = async (factorId: string, challengeId: string, code: string) => {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code
  })
  
  if (error) throw error
  return data
}

export const challengeMFA = async (factorId: string) => {
  const { data, error } = await supabase.auth.mfa.challenge({
    factorId
  })
  
  if (error) throw error
  return data
}

export const unenrollMFA = async (factorId: string) => {
  const { data, error } = await supabase.auth.mfa.unenroll({
    factorId
  })
  
  if (error) throw error
  return data
}

export const listMFAFactors = async () => {
  const { data, error } = await supabase.auth.mfa.listFactors()
  
  if (error) throw error
  return data
}