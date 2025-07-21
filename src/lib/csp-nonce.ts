// Content Security Policy nonce generation and management
let currentNonce: string | null = null

// Generate a cryptographically secure nonce
export const generateCSPNonce = (): string => {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Get or generate current nonce
export const getCSPNonce = (): string => {
  if (!currentNonce) {
    currentNonce = generateCSPNonce()
  }
  return currentNonce
}

// Refresh nonce (call this periodically or on page load)
export const refreshCSPNonce = (): string => {
  currentNonce = generateCSPNonce()
  return currentNonce
}

// Apply CSP with nonce to meta tag
export const applyCSPWithNonce = () => {
  if (typeof document === 'undefined') return

  const nonce = getCSPNonce()
  
  // Find existing CSP meta tag or create new one
  let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement
  
  if (!cspMeta) {
    cspMeta = document.createElement('meta')
    cspMeta.httpEquiv = 'Content-Security-Policy'
    document.head.appendChild(cspMeta)
  }

  // Build CSP with nonce
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval'`,
    `style-src 'self' 'nonce-${nonce}' 'unsafe-inline'`, // Allow inline styles for React
    "img-src 'self' data: https://*.supabase.co https://calendly.com https://*.linkedin.com",
    "connect-src 'self' https://*.supabase.co https://api.linkedin.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "media-src 'self' https://*.supabase.co",
    "frame-src 'self' https://calendly.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')

  cspMeta.content = cspDirectives
  
  console.log('🔒 CSP applied with nonce:', nonce)
}

// Initialize CSP on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyCSPWithNonce)
  } else {
    applyCSPWithNonce()
  }
}