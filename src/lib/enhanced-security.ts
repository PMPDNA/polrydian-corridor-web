// Enhanced security utilities
import { z } from 'zod';
import DOMPurify from 'dompurify';
import { CSRFProtection } from './csrf-protection';

// Enhanced input validation schemas
export const enhancedEmailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(254, 'Email too long')
  .transform(email => email.toLowerCase().trim());

export const enhancedPasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain uppercase, lowercase, number, and special character');

export const enhancedContactFormSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Last name contains invalid characters'),
  email: enhancedEmailSchema,
  company: z.string()
    .max(100, 'Company name too long')
    .regex(/^[a-zA-Z0-9\s\-\.,&]+$/, 'Company name contains invalid characters')
    .optional()
    .or(z.literal('')),
  service: z.string()
    .min(1, 'Service selection is required')
    .max(100, 'Service name too long'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message too long'),
  urgent: z.boolean().default(false),
  csrfToken: z.string().min(1, 'CSRF token required')
});

// Enhanced HTML sanitization
export const sanitizeHtmlEnhanced = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 
      'a', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['style', 'on*'],
    USE_PROFILES: { html: true }
  });
};

// Enhanced form data sanitization
export const sanitizeFormDataEnhanced = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data };
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove potentially harmful characters
      (sanitized as any)[key] = value
        .replace(/[<>'"]/g, '') // Remove HTML/JS injection chars
        .replace(/javascript:/gi, '') // Remove JS protocol
        .replace(/data:/gi, '') // Remove data protocol
        .trim()
        .slice(0, 10000); // Limit length
    } else if (typeof value === 'number') {
      (sanitized as any)[key] = Math.max(-1000000, Math.min(1000000, value));
    }
    // Keep other types as-is (boolean, etc.)
  }
  
  return sanitized;
};

// File upload validation
export const validateFileUploadEnhanced = (file: File): { valid: boolean; error?: string } => {
  // Size limit: 10MB
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Allowed file types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file extension matches MIME type
  const extension = file.name.toLowerCase().split('.').pop();
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'application/pdf': ['pdf'],
    'text/plain': ['txt'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
  };

  const validExtensions = mimeToExt[file.type] || [];
  if (!extension || !validExtensions.includes(extension)) {
    return { valid: false, error: 'File extension does not match file type' };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.com$/i, /\.pif$/i, /\.scr$/i,
    /\.vbs$/i, /\.js$/i, /\.jar$/i, /\.php$/i, /\.asp$/i, /\.jsp$/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return { valid: false, error: 'File type potentially dangerous' };
  }

  return { valid: true };
};

// URL validation with enhanced security
export const isValidUrlEnhanced = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Only allow HTTPS and HTTP
    if (!['https:', 'http:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Block localhost and private IPs
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.')) {
      return false;
    }
    
    // Allow only specific domains for webhooks
    const allowedDomains = [
      'hooks.zapier.com',
      'hook.integromat.com',
      'connect.pabbly.com',
      'api.linkedin.com',
      'graph.facebook.com'
    ];
    
    return allowedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
  } catch {
    return false;
  }
};

// Enhanced rate limiting class
export class EnhancedRateLimit {
  private attempts = new Map<string, { count: number; resetTime: number; blocked: boolean }>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly blockDurationMs: number;

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000, blockDurationMs = 60 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.blockDurationMs = blockDurationMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs, blocked: false });
      return true;
    }

    if (record.blocked && now < record.resetTime) {
      return false;
    }

    if (record.count >= this.maxAttempts) {
      record.blocked = true;
      record.resetTime = now + this.blockDurationMs;
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
    if (!record) return 0;
    return Math.max(0, record.resetTime - Date.now());
  }
}

// Security headers helper
export const getSecurityHeaders = (nonce?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  };

  if (nonce) {
    headers['Content-Security-Policy'] = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' https://plausible.io https://www.googletagmanager.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https: blob:;
      connect-src 'self' https://*.supabase.co https://api.linkedin.com;
      frame-src 'self' https://calendly.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim();
  }

  return headers;
};

// Secure session token generation
export const generateSecureToken = (length = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Input length limits
export const INPUT_LIMITS = {
  email: 254,
  password: 128,
  name: 50,
  company: 100,
  message: 5000,
  url: 2048
} as const;

// Initialize CSRF protection
export const initializeCSRF = (): string => {
  return CSRFProtection.initialize();
};