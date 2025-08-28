import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { PolrydianLogo } from '@/components/PolrydianLogo';

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Insights", path: "/insights" },
    { label: "Contact", path: "/schedule" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Polrydian Logo */}
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <PolrydianLogo variant="compact" size="sm" />
          </Link>

          {/* Personal Branding */}
          <div className="hidden sm:block ml-4 pl-4 border-l border-border">
            <div className="font-semibold text-sm text-foreground">Patrick Misiewicz</div>
            <div className="text-xs text-muted-foreground">Founder & Strategic Advisor</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1 ${
                  location.pathname === item.path 
                    ? 'text-primary font-medium' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button variant="default" size="sm" asChild>
              <Link to="/schedule">
                Schedule Consultation
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 ml-auto flex items-center justify-center rounded-lg hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            id="mobile-navigation"
            className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg z-50"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`py-2 text-lg transition-colors duration-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-accent ${
                      location.pathname === item.path 
                        ? 'text-primary font-medium' 
                        : 'text-foreground hover:text-primary'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    tabIndex={0}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mt-2 w-full focus:ring-2 focus:ring-accent-foreground" 
                  asChild
                >
                  <Link 
                    to="/schedule"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Schedule Consultation
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};