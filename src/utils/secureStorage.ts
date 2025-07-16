// Secure storage utility with proper validation
// NOTE: This replaces the previous insecure base64 "encryption"

import { sanitizeText } from '@/lib/security';

// Input sanitization for storage
export function sanitizeInput(input: string): string {
  return sanitizeText(input);
}

// URL validation - now using the security module
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['https:', 'mailto:'];
    const allowedDomains = [
      'calendly.com',
      'linkedin.com', 
      'github.com',
      'twitter.com',
      'instagram.com',
      'facebook.com',
      'hooks.zapier.com'
    ];
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    if (urlObj.protocol === 'mailto:') {
      return true;
    }
    
    return allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// Secure data storage - WARNING about localStorage limitations
export function saveSecureData(key: string, data: any): boolean {
  console.warn('WARNING: localStorage is not secure for sensitive data. Use Supabase for production.');
  
  try {
    const sanitizedData = typeof data === 'string' ? sanitizeInput(data) : data;
    const dataString = JSON.stringify(sanitizedData);
    const timestamp = Date.now();
    
    const payload = {
      data: dataString,
      timestamp
    };
    
    localStorage.setItem(`app_data_${key}`, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
  }
}

// Secure data retrieval with expiration
export function getSecureData(key: string): any | null {
  try {
    const stored = localStorage.getItem(`app_data_${key}`);
    if (!stored) return null;
    
    const payload = JSON.parse(stored);
    
    // Check if data is not too old
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - payload.timestamp > maxAge) {
      removeSecureData(key);
      return null;
    }
    
    return JSON.parse(payload.data);
  } catch (error) {
    console.error('Failed to retrieve data:', error);
    return null;
  }
}

// Remove data
export function removeSecureData(key: string): void {
  localStorage.removeItem(`app_data_${key}`);
}

// File upload validation with strict security
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp'
  ];
  
  const maxSize = 5 * 1024 * 1024; // 5MB for images
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large (max 5MB)' };
  }
  
  // Check for suspicious file names and extensions
  const dangerousPatterns = [
    '.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.js', '.html', '.php', '.asp'
  ];
  
  const fileName = file.name.toLowerCase();
  if (dangerousPatterns.some(pattern => fileName.includes(pattern))) {
    return { valid: false, error: 'Suspicious file type detected' };
  }
  
  // Validate file extension matches MIME type
  const extension = fileName.split('.').pop();
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp']
  };
  
  const expectedExtensions = mimeToExt[file.type];
  if (!expectedExtensions || !expectedExtensions.includes(extension || '')) {
    return { valid: false, error: 'File extension does not match file type' };
  }
  
  return { valid: true };
}

// Session management helper
export function createSecureSession(userId: string): string {
  const sessionData = {
    userId,
    timestamp: Date.now(),
    expires: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
  };
  
  return btoa(JSON.stringify(sessionData));
}

export function validateSession(sessionToken: string): { valid: boolean; userId?: string } {
  try {
    const sessionData = JSON.parse(atob(sessionToken));
    
    if (Date.now() > sessionData.expires) {
      return { valid: false };
    }
    
    return { valid: true, userId: sessionData.userId };
  } catch {
    return { valid: false };
  }
}