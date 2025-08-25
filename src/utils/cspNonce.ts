// CSP Nonce utility for secure script execution

class CSPNonceManager {
  private nonce: string = '';

  constructor() {
    this.generateNonce();
  }

  generateNonce(): string {
    // Generate cryptographically secure random nonce
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    this.nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Update meta tag if it exists
    const metaTag = document.getElementById('csp-nonce') as HTMLMetaElement;
    if (metaTag) {
      metaTag.content = this.nonce;
    }
    
    return this.nonce;
  }

  getCurrentNonce(): string {
    return this.nonce;
  }

  // Apply nonce to inline scripts
  applyNonceToScripts(): void {
    const inlineScripts = document.querySelectorAll('script:not([src])');
    inlineScripts.forEach((script) => {
      script.setAttribute('nonce', this.nonce);
    });
  }
}

// Global instance
export const cspNonceManager = new CSPNonceManager();

// Initialize CSP nonce on load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    cspNonceManager.applyNonceToScripts();
  });
}