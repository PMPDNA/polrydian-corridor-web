// Secure storage utility with encryption and validation
const STORAGE_KEY = 'app_secure_data';
const ENCRYPTION_KEY = 'secure_key_2024'; // In production, this should be generated dynamically

// Simple encryption/decryption (for demo purposes - use proper encryption in production)
function encrypt(text: string): string {
  try {
    return btoa(text);
  } catch {
    return text;
  }
}

function decrypt(encryptedText: string): string {
  try {
    return atob(encryptedText);
  } catch {
    return encryptedText;
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim();
}

// URL validation
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    const allowedDomains = [
      'calendly.com',
      'linkedin.com',
      'github.com',
      'twitter.com',
      'instagram.com',
      'facebook.com'
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

// Secure data storage
export function saveSecureData(key: string, data: any): boolean {
  try {
    const sanitizedData = typeof data === 'string' ? sanitizeInput(data) : data;
    const dataString = JSON.stringify(sanitizedData);
    const encryptedData = encrypt(dataString);
    const timestamp = Date.now();
    
    const securePayload = {
      data: encryptedData,
      timestamp,
      checksum: btoa(dataString + timestamp)
    };
    
    localStorage.setItem(`${STORAGE_KEY}_${key}`, JSON.stringify(securePayload));
    return true;
  } catch (error) {
    console.error('Failed to save secure data:', error);
    return false;
  }
}

// Secure data retrieval
export function getSecureData(key: string): any | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${key}`);
    if (!stored) return null;
    
    const securePayload = JSON.parse(stored);
    const decryptedData = decrypt(securePayload.data);
    
    // Verify data integrity
    const expectedChecksum = btoa(decryptedData + securePayload.timestamp);
    if (expectedChecksum !== securePayload.checksum) {
      console.warn('Data integrity check failed');
      return null;
    }
    
    // Check if data is not too old (optional)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    if (Date.now() - securePayload.timestamp > maxAge) {
      removeSecureData(key);
      return null;
    }
    
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Failed to retrieve secure data:', error);
    return null;
  }
}

// Remove secure data
export function removeSecureData(key: string): void {
  localStorage.removeItem(`${STORAGE_KEY}_${key}`);
}

// Validate file upload
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large (max 10MB)' };
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif'];
  if (suspiciousPatterns.some(pattern => file.name.toLowerCase().includes(pattern))) {
    return { valid: false, error: 'Suspicious file type detected' };
  }
  
  return { valid: true };
}