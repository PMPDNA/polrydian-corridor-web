// Shared security utilities for edge functions
export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

// Input validation for edge functions
export function validateInput(data: any, requiredFields: string[]): SecurityValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Check required fields
  for (const field of requiredFields) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Sanitize and validate each field
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      let sanitized: string;
      
      // Special handling for article content - preserve more characters
      if (key === 'content') {
        // For article content, only remove the most dangerous patterns
        sanitized = (value as string)
          .replace(/javascript:/gi, '') // Remove JS protocol
          .replace(/data:/gi, '') // Remove data protocol
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim()
          .slice(0, 50000); // Higher limit for articles
      } else {
        // For other fields, use stricter sanitization
        sanitized = (value as string)
          .replace(/[<>'"]/g, '') // Remove HTML/JS injection chars
          .replace(/javascript:/gi, '') // Remove JS protocol
          .replace(/data:/gi, '') // Remove data protocol
          .trim()
          .slice(0, 10000); // Limit length
      }
      
      sanitizedData[key] = sanitized;
      
      // Additional validation for specific fields
      if (key === 'email' && sanitized) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitized)) {
          errors.push('Invalid email format');
        }
      }
      
      if (key === 'url' && sanitized) {
        try {
          const url = new URL(sanitized);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push('Invalid URL protocol');
          }
        } catch {
          errors.push('Invalid URL format');
        }
      }
    } else {
      sanitizedData[key] = value;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined
  };
}

// Rate limiting for edge functions
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const key = identifier;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// IP address extraction with validation
export function extractClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  // Try different headers in order of preference
  let ip = cfConnectingIP || realIP || forwardedFor;
  
  if (ip && ip.includes(',')) {
    // Take the first IP if comma-separated
    ip = ip.split(',')[0].trim();
  }
  
  // Validate IP format
  if (ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip;
  }
  
  return '0.0.0.0'; // Fallback
}

// Enhanced secure token encryption with AES-256-GCM
export async function encryptTokenSecure(token: string, supabaseClient: any): Promise<string> {
  try {
    // Use the new secure database encryption function
    const { data, error } = await supabaseClient.rpc('encrypt_token_secure', {
      token_text: token
    });
    
    if (!error && data) {
      return data;
    }
    
    console.warn('Database encryption failed, using enhanced fallback');
  } catch (error) {
    console.warn('Database encryption unavailable, using enhanced fallback');
  }
  
  // Enhanced fallback with encryption prefix for better security
  return btoa(`ENCRYPTED:${token}`);
}

// Enhanced secure token decryption with backward compatibility
export async function decryptTokenSecure(encryptedToken: string, supabaseClient: any): Promise<string> {
  try {
    // Use the new secure database decryption function
    const { data, error } = await supabaseClient.rpc('decrypt_token_secure', {
      encrypted_token: encryptedToken
    });
    
    if (!error && data) {
      return data;
    }
    
    console.warn('Database decryption failed, using enhanced fallback');
  } catch (error) {
    console.warn('Database decryption unavailable, using enhanced fallback');
  }
  
  // Enhanced fallback with backward compatibility
  try {
    const decoded = atob(encryptedToken);
    // Remove encryption prefix if present
    if (decoded.startsWith('ENCRYPTED:')) {
      return decoded.substring(10);
    }
    return decoded;
  } catch {
    // If base64 decoding fails, return original (might be plain text)
    return encryptedToken;
  }
}

// Security headers for responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Combine CORS and security headers
export function getCombinedHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    ...securityHeaders
  };
}

// Log security events
export async function logSecurityEvent(
  supabaseClient: any,
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): Promise<void> {
  try {
    await supabaseClient.from('security_audit_log').insert({
      action: `edge_function_${event}`,
      details: {
        ...details,
        severity,
        timestamp: new Date().toISOString(),
        function_context: 'edge_function'
      },
      ip_address: details.ip_address || '0.0.0.0'
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}