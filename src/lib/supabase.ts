import { createClient } from '@supabase/supabase-js'

// Use environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment configuration
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('demo') || supabaseAnonKey === 'demo-key') {
  console.error('SECURITY WARNING: Missing or invalid Supabase configuration')
  console.error('Please connect your project to a real Supabase instance')
}

// Use demo fallback only for development with clear warnings
const finalUrl = supabaseUrl || 'https://demo.supabase.co'
const finalKey = supabaseAnonKey || 'demo-key'

console.log('Supabase Environment Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isDemo: finalUrl.includes('demo') || finalKey === 'demo-key',
  url: finalUrl.includes('demo') ? 'DEMO URL - NOT SECURE' : 'Production URL'
})

export const supabase = createClient(finalUrl, finalKey)

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