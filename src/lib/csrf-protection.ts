// CSRF Protection utilities
export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';

  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    
    // Store in sessionStorage for current session
    sessionStorage.setItem(this.TOKEN_KEY, token);
    return token;
  }

  static getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static validateToken(token: string): boolean {
    const storedToken = this.getToken();
    return storedToken !== null && storedToken === token;
  }

  static getHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('CSRF token not found. Please refresh the page.');
    }
    
    return {
      [this.TOKEN_HEADER]: token,
    };
  }

  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  // Initialize CSRF token on application start
  static initialize(): string {
    let token = this.getToken();
    if (!token) {
      token = this.generateToken();
    }
    return token;
  }
}

// Auto-initialize CSRF protection
if (typeof window !== 'undefined') {
  CSRFProtection.initialize();
}