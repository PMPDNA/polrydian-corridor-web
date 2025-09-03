// Centralized CSP configuration with nonce support
import { SECURITY_CONFIG } from './security-config'

class CSPManager {
  private nonce: string = ''

  constructor() {
    this.generateNonce()
  }

  generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    this.nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
    
    // Store globally for components that need it
    if (typeof window !== 'undefined') {
      ;(window as any).__CSP_NONCE__ = this.nonce
    }
    
    return this.nonce
  }

  getCurrentNonce(): string {
    return this.nonce
  }

  // Generate CSP header value with current nonce
  getCSPHeader(): string {
    const directives = {
      ...SECURITY_CONFIG.CSP_DIRECTIVES,
      'style-src': [...SECURITY_CONFIG.CSP_DIRECTIVES['style-src'], `'nonce-${this.nonce}'`],
      'script-src': [...SECURITY_CONFIG.CSP_DIRECTIVES['script-src'], `'nonce-${this.nonce}'`],
    }

    return Object.entries(directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ')
  }

  // Apply CSP via meta tag (fallback for client-side)
  applyCSPMetaTag(): void {
    if (typeof document === 'undefined') return

    let meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('http-equiv', 'Content-Security-Policy')
      document.head.appendChild(meta)
    }
    
    meta.setAttribute('content', this.getCSPHeader())
  }

  // Apply nonce to existing inline scripts/styles
  applyNonceToElements(): void {
    if (typeof document === 'undefined') return

    // Apply to inline scripts
    const inlineScripts = document.querySelectorAll('script:not([src])')
    inlineScripts.forEach(script => {
      script.setAttribute('nonce', this.nonce)
    })

    // Apply to inline styles
    const inlineStyles = document.querySelectorAll('style')
    inlineStyles.forEach(style => {
      style.setAttribute('nonce', this.nonce)
    })
  }
}

// Global CSP manager instance
export const cspManager = new CSPManager()

// Initialize on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      cspManager.applyCSPMetaTag()
      cspManager.applyNonceToElements()
    })
  } else {
    cspManager.applyCSPMetaTag()
    cspManager.applyNonceToElements()
  }
}