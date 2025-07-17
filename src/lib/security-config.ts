// Security configuration and constants
export const SECURITY_CONFIG = {
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  
  // Rate limiting
  AUTH_MAX_ATTEMPTS: 5,
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  
  // Session configuration
  SESSION_TIMEOUT_MS: 24 * 60 * 60 * 1000, // 24 hours
  
  // Content Security Policy (enhanced for security)
  CSP_DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'wasm-unsafe-eval'"], // Removed unsafe-inline and unsafe-eval
    'style-src': ["'self'", "'unsafe-inline'"], // Keep for Tailwind CSS
    'img-src': ["'self'", "data:", "https://*.supabase.co", "https://calendly.com"],
    'connect-src': ["'self'", "https://*.supabase.co"],
    'font-src': ["'self'", "data:"],
    'object-src': ["'none'"],
    'media-src': ["'self'", "https://*.supabase.co"],
    'frame-src': ["'self'", "https://calendly.com"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': []
  },

  // OTP Security settings (reduced to 5 minutes for better security)
  OTP_EXPIRY_MINUTES: 5,
  
  // Session security
  SESSION_SECURITY: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict' as const
  }
} as const

// Allowed domains for webhook URLs
export const ALLOWED_WEBHOOK_DOMAINS = [
  'hooks.zapier.com',
  'hook.integromat.com',
  'connect.pabbly.com'
] as const

// Security validation functions
export const validateEnvironment = () => {
  const warnings: string[] = []
  
  // Check if using demo/development credentials
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || supabaseUrl.includes('demo')) {
    warnings.push('Using demo Supabase URL - not secure for production')
  }
  
  if (!supabaseKey || supabaseKey === 'demo-key') {
    warnings.push('Using demo Supabase key - not secure for production')
  }
  
  if (import.meta.env.DEV) {
    warnings.push('Running in development mode')
  }
  
  if (warnings.length > 0) {
    console.warn('🔒 Security Configuration Warnings:', warnings)
  }
  
  return warnings
}

// Check if current environment is secure
export const isSecureEnvironment = () => {
  const warnings = validateEnvironment()
  return warnings.length === 0 && !import.meta.env.DEV
}