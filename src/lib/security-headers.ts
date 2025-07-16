// Security headers and CSP configuration
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for React dev
    "style-src 'self' 'unsafe-inline'", // Needed for styled components
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co https://hooks.zapier.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "media-src 'self'",
    "frame-src 'self' https://calendly.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()'
  ].join(', ')
};

// Rate limiting for auth attempts
export class AuthRateLimit {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record || record.count < this.maxAttempts) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }
}

// Export singleton instance
export const authRateLimit = new AuthRateLimit();

// Apply security headers (for development warning)
export const applySecurityHeaders = () => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Security headers should be configured at the web server level in production');
  }
};

// Validate environment for security
export const validateSecurityConfig = () => {
  const warnings = [];
  
  if (process.env.NODE_ENV === 'development') {
    warnings.push('Running in development mode');
  }
  
  if (!import.meta.env.VITE_SUPABASE_URL?.startsWith('https://')) {
    warnings.push('Supabase URL should use HTTPS');
  }
  
  if (warnings.length > 0) {
    console.warn('Security warnings:', warnings);
  }
  
  return warnings.length === 0;
};