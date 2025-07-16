import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    // Map path segments to readable labels
    const pathMap: Record<string, string> = {
      'about': 'About',
      'services': 'Services', 
      'insights': 'Insights',
      'faq': 'FAQ',
      'articles': 'Articles',
      'calendly-demo': 'Schedule Meeting',
      'privacy': 'Privacy Policy',
      'cookie-settings': 'Cookie Settings',
      'admin': 'Admin Dashboard',
      'profile': 'Profile',
      'analytics': 'Analytics',
      'reset-password': 'Reset Password'
    };

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const href = isLast ? undefined : '/' + pathSegments.slice(0, index + 1).join('/');
      
      items.push({
        label: pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href
      });
    });

    setBreadcrumbs(items);
  }, [location.pathname]);

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index === 0 && <Home className="h-4 w-4 mr-1" />}
            
            {item.href ? (
              <a 
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
            
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};