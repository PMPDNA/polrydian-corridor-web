# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it responsibly:

1. **Do NOT create a public GitHub issue**
2. Email: security@polrydian.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 24 hours and provide a timeline for addressing the issue.

## Security Measures

### API Keys and Secrets
- **Frontend Environment Variables**: Only public/publishable keys should be in `.env.local`
- **Backend Secrets**: All sensitive API keys are stored in Supabase Edge Function secrets
- **Database**: Row Level Security (RLS) policies protect all data access
- **Authentication**: Powered by Supabase Auth with rate limiting

### Data Protection
- All user data is protected by RLS policies
- Admin functions require explicit role verification
- Rate limiting prevents abuse across all endpoints
- Security audit logging tracks all sensitive operations

### Infrastructure Security
- HTTPS everywhere (enforced)
- Content Security Policy (CSP) headers
- CORS properly configured for Edge Functions
- No sensitive data in client-side code

## Development Security Guidelines

### Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Never commit `.env.local` or any file with real secrets
3. Use Supabase dashboard to manage Edge Function secrets

### Code Security
- All database queries use Supabase client (prevents SQL injection)
- Input validation on all forms
- XSS prevention through proper escaping
- Rate limiting on all public endpoints

### Supabase Security Checklist
- [x] Row Level Security enabled on all tables
- [x] Admin email allowlist configured
- [x] Rate limiting implemented
- [x] Security audit logging active
- [x] Token encryption for social media credentials
- [ ] Enable "Leaked Password Protection" (recommended)
- [ ] Regular security audit reviews

## Deployment Security

### Before Going Public
1. Rotate all API keys that were exposed during development
2. Review all RLS policies for proper access control
3. Enable Supabase security features in production
4. Set up monitoring and alerting

### Production Checklist
- Environment variables set in hosting platform (not in code)
- Database backups enabled
- Monitoring and logging configured
- Error reporting set up (without exposing sensitive data)

## Security Updates

This project follows security best practices:
- Dependencies are regularly updated
- Security advisories are monitored
- Supabase security features are kept current
- Regular security reviews conducted

Last Updated: January 2025