// Content Security Policy with nonce generation for enhanced security
let currentNonce = '';

// Generate a cryptographically secure nonce for CSP
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  currentNonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  return currentNonce;
};

// Get the current nonce value
export const getCurrentNonce = (): string => {
  return currentNonce || generateNonce();
};

// Refresh CSP nonce for dynamic updates
export const refreshCSPNonce = (): void => {
  generateNonce();
  updateCSPMeta();
};

// Enhanced CSP generation with nonce support and security directives
export const generateCSPHeader = (nonce?: string): string => {
  const actualNonce = nonce || getCurrentNonce();
  
  const directives = {
    'default-src': "'self'",
    'script-src': `'self' 'nonce-${actualNonce}' 'wasm-unsafe-eval'`,
    'style-src': `'self' 'nonce-${actualNonce}' 'unsafe-inline'`, // Unsafe-inline needed for Tailwind
    'img-src': "'self' data: https://*.supabase.co https://calendly.com https://media.licdn.com",
    'connect-src': "'self' https://*.supabase.co https://api.linkedin.com https://www.linkedin.com",
    'font-src': "'self' data: https://fonts.gstatic.com",
    'object-src': "'none'",
    'media-src': "'self' https://*.supabase.co",
    'frame-src': "'self' https://calendly.com",
    'frame-ancestors': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'upgrade-insecure-requests': '',
    'block-all-mixed-content': '',
    'require-trusted-types-for': "'script'"
  };
  
  return Object.entries(directives)
    .map(([key, value]) => value ? `${key} ${value}` : key)
    .join('; ');
};

// Update CSP meta tag in document head
const updateCSPMeta = (): void => {
  if (typeof document === 'undefined') return;
  
  const nonce = getCurrentNonce();
  const cspContent = generateCSPHeader(nonce);
  
  // Remove existing CSP meta tag
  const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingMeta) {
    existingMeta.remove();
  }
  
  // Add new CSP meta tag with enhanced security
  const metaElement = document.createElement('meta');
  metaElement.setAttribute('http-equiv', 'Content-Security-Policy');
  metaElement.setAttribute('content', cspContent);
  document.head.appendChild(metaElement);
  
  // Store nonce globally for script access
  (window as any).__CSP_NONCE__ = nonce;
};

// Apply enhanced CSP to document with security monitoring
export const applyCSPToDocument = (): void => {
  if (typeof document === 'undefined') return;
  
  const nonce = generateNonce();
  updateCSPMeta();
  
  // Add CSP violation reporting
  document.addEventListener('securitypolicyviolation', (event) => {
    console.warn('🔒 CSP Violation:', {
      directive: event.violatedDirective,
      blockedURI: event.blockedURI,
      originalPolicy: event.originalPolicy,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber
    });
    
    // Log to security audit if available
    if ((window as any).logSecurityEvent) {
      (window as any).logSecurityEvent('csp_violation', {
        directive: event.violatedDirective,
        blockedURI: event.blockedURI,
        severity: 'high'
      });
    }
  });
  
  console.log('🔒 Enhanced CSP applied with nonce:', nonce.substring(0, 8) + '...');
};