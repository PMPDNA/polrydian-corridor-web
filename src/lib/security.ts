import DOMPurify from 'dompurify'
import { z } from 'zod'

// Input validation schemas
export const articleSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .refine(val => val.trim().length > 0, 'Title cannot be empty'),
  
  excerpt: z.string()
    .min(1, 'Excerpt is required')
    .max(500, 'Excerpt must be less than 500 characters'),
  
  content: z.string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50,000 characters'),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  featured: z.boolean().optional(),
  
  zapierWebhookUrl: z.string()
    .optional()
    .refine(val => !val || isValidUrl(val), 'Invalid webhook URL')
})

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required')

// Content sanitization
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: []
  })
}

export const sanitizeText = (text: string): string => {
  return text.replace(/<[^>]*>/g, '').trim()
}

// URL validation with whitelist
const ALLOWED_WEBHOOK_DOMAINS = [
  'hooks.zapier.com',
  'webhook.site',
  'httpbin.org'
]

export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    
    // Only allow HTTPS
    if (urlObj.protocol !== 'https:') {
      return false
    }
    
    // Check against whitelist
    return ALLOWED_WEBHOOK_DOMAINS.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

// Rate limiting helper
export const createRateLimiter = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>()
  
  return {
    isAllowed: (identifier: string): boolean => {
      const now = Date.now()
      const record = attempts.get(identifier)
      
      if (!record || now > record.resetTime) {
        attempts.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
      }
      
      if (record.count >= maxAttempts) {
        return false
      }
      
      record.count++
      return true
    },
    
    reset: (identifier: string): void => {
      attempts.delete(identifier)
    }
  }
}

// Security headers for development
export const getSecurityHeaders = () => ({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
})

// Enhanced input sanitization for forms
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Enhanced sanitization with additional security measures
      let sanitizedValue = value
        .replace(/[<>]/g, '') // Remove HTML tags
        .replace(/['"]/g, '') // Remove quotes to prevent injection
        .replace(/javascript:/gi, '') // Remove javascript protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim()
      
      // Additional length validation
      if (key === 'email' && sanitizedValue.length > 255) {
        sanitizedValue = sanitizedValue.substring(0, 255)
      } else if (key === 'message' && sanitizedValue.length > 2000) {
        sanitizedValue = sanitizedValue.substring(0, 2000)
      } else if (sanitizedValue.length > 500) {
        sanitizedValue = sanitizedValue.substring(0, 500)
      }
      
      sanitized[key as keyof T] = sanitizedValue as T[keyof T]
    } else {
      // Handle non-string values (boolean, arrays, etc.)
      sanitized[key as keyof T] = value as T[keyof T]
    }
  }
  
  return sanitized
}

// Enhanced contact form validation
export const contactFormSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required')
    .max(255, 'Email must be less than 255 characters'),
  
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  
  service: z.string()
    .max(100, 'Service must be less than 100 characters')
    .optional(),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  
  urgent: z.boolean().optional()
})

// Insights query validation
export const insightsQuerySchema = z.object({
  query: z.string()
    .min(3, 'Query must be at least 3 characters')
    .max(500, 'Query must be less than 500 characters')
    .regex(/^[a-zA-Z0-9\s.,!?-]+$/, 'Query contains invalid characters')
})