# Polrydian Group - Architecture Summary

## Overview
Strategic consulting website for Patrick Misiewicz and Polrydian Group, built with React/TypeScript/Vite frontend and Supabase backend.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library
- **Routing**: React Router v6
- **State Management**: React Query for server state
- **Charts**: Recharts for data visualization

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with MFA support
- **Storage**: Supabase Storage (avatars, images, documents, mobile-uploads)
- **Real-time**: Supabase Realtime (websockets)
- **Edge Functions**: Deno-based serverless functions

## Database Schema

### Core Tables
- **profiles** - User profile information
- **user_roles** - Role-based access control (admin, moderator, user)
- **articles** - Content management system
- **consultation_bookings** - New consultation request system
- **insights** - FRED economic data storage
- **social_media_posts** - Social media content
- **linkedin_posts** - LinkedIn integration data
- **images** - File management system
- **gallery** - Photo gallery management
- **partners** - Organization/partner management
- **newsletter_subscriptions** - Email newsletter system
- **visitor_analytics** - Site analytics and tracking
- **security_audit_log** - Security monitoring
- **integration_logs** - API integration monitoring

### Security Tables
- **auth_rate_limits** - Rate limiting for authentication
- **user_consent** - GDPR compliance tracking
- **data_processing_log** - Data processing audit trail

## Edge Functions

### Core Functions
- **fred-api-integration** - FRED economic data API integration
- **send-contact-email** - Contact form email processing
- **linkedin-integration** - LinkedIn API operations
- **publish-to-linkedin** - Content publishing to LinkedIn
- **mobile-upload** - Mobile image upload handling
- **track-visitor** - Analytics tracking
- **gdpr-data-request** - GDPR compliance handling

### Monitoring Functions
- **integration-health-monitor** - Monitor API integrations
- **security-monitoring** - Security event tracking

## Key Components

### Public Components
- **Hero** - Landing page hero section with Stoic quotes
- **About** - Patrick's biography and profile management
- **Services** - Strategic services showcase
- **Contact** - Contact form and consultation booking
- **EnhancedCorridorEconomics** - Interactive economics explanation
- **FREDDataDisplay** - Economic indicators dashboard
- **ConsultationBookingForm** - New booking system (replaces Calendly)

### Admin Components
- **UnifiedAdminDashboard** - Centralized admin interface
- **ArticleManagerEnhanced** - Content management
- **ConsultationBookingsManager** - Booking management system
- **FredIntegration** - FRED API data management
- **SocialMediaManager** - Social media content management
- **ImageManager** - File upload and management
- **AdminRoleManager** - User role management

### UI/UX Components
- **Navigation** - Responsive navigation with admin access
- **Footer** - Site footer with links
- **ProofChips** - Credential/achievement badges (case studies removed)
- **StoicQuoteRotator** - Rotating philosophical quotes
- **LoadingSpinner** - Loading states
- **ErrorBoundary** - Error handling

## Routes

### Public Routes
- `/` - Homepage (Hero, Services, Experience, Contact)
- `/about` - About Patrick and Polrydian Group
- `/services` - Strategic services overview
- `/articles` - Public articles list
- `/articles/:slug` - Individual article pages
- `/contact` - Contact and consultation booking
- `/insights` - Economic insights and FRED data

### Admin Routes (Protected)
- `/admin` - Admin login/dashboard
- `/admin/articles` - Content management
- `/admin/images` - Image management
- `/admin/social` - Social media management
- `/admin/fred` - FRED data management

## Security Features

### Authentication & Authorization
- JWT-based authentication with Supabase
- Multi-factor authentication (MFA) support
- Role-based access control (RBAC)
- Session timeout management
- Rate limiting on authentication attempts

### Data Protection
- Row Level Security (RLS) on all tables
- GDPR compliance with consent tracking
- Secure token encryption for social media APIs
- Input validation and sanitization
- CSRF protection

### Monitoring
- Security audit logging
- Integration health monitoring
- Performance monitoring
- Error boundary handling

## Key Features Implemented

### ✅ Completed Features
1. **Dynamic Article Routing** - `/articles/:slug` with proper SEO
2. **Unified Admin Dashboard** - Centralized management interface
3. **Consultation Booking System** - Replaced Calendly with custom Supabase form
4. **Enhanced Biography** - Comprehensive About page with Patrick's background
5. **FRED API Integration** - Real-time economic data from Federal Reserve
6. **Enhanced Corridor Economics** - Interactive explanation with think-tank sources
7. **Case Study Metrics Removed** - Cleaned up proof elements
8. **Updated CTAs** - All now link to contact form instead of broken Calendly
9. **Security Hardening** - Comprehensive security monitoring and audit trails
10. **Mobile Responsiveness** - Full responsive design system

### 🔄 Integration Status
- **FRED API**: ✅ Integrated with API key from secrets
- **LinkedIn**: ✅ Connected with tokens in secure storage
- **Email**: ✅ Contact form with Supabase functions
- **Analytics**: ✅ Visitor tracking and admin dashboard
- **Storage**: ✅ Four buckets configured (avatars, images, documents, mobile-uploads)

## Performance Optimizations

### Frontend
- Code splitting with React Router
- Lazy loading of components
- Optimized image loading
- Efficient re-rendering with React Query
- Responsive design with Tailwind CSS

### Backend
- Database indexing on frequently queried columns
- RLS policies optimized for performance
- Edge function caching strategies
- Connection pooling with Supabase

## Deployment & Infrastructure

### Frontend Deployment
- Deployed via Lovable platform
- Environment variables managed through Supabase secrets
- CDN optimization for static assets

### Backend (Supabase)
- Managed PostgreSQL database
- Auto-scaling edge functions
- Global CDN for storage
- Real-time WebSocket connections
- Monitoring and logging built-in

## Environment Configuration

### Required Secrets (Configured in Supabase)
- `FRED_API_KEY` - Federal Reserve Economic Data API
- `LINKEDIN_CLIENT_ID` - LinkedIn OAuth application
- `LINKEDIN_CLIENT_SECRET` - LinkedIn OAuth secret
- `LINKEDIN_ACCESS_TOKEN` - LinkedIn API access token

### Public Configuration
- Supabase URL and anon key (configured in client)
- Domain configuration for production deployment

## Next Steps for Production

1. **Domain Setup** - Configure custom domain in Lovable
2. **SSL Certificate** - Ensure HTTPS everywhere
3. **Performance Monitoring** - Set up comprehensive monitoring
4. **Backup Strategy** - Automated database backups
5. **SEO Optimization** - Meta tags, sitemap, analytics
6. **Content Population** - Add real articles and case studies
7. **User Testing** - Comprehensive testing across devices

---

*Last Updated: January 2025*
*Status: Production Ready*