import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Supabase config:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey.slice(0, 10) + '...' })

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