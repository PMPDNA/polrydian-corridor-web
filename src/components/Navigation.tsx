import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { PolrydianLogo } from "@/components/PolrydianLogo";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Insights", href: "/insights" },
    { label: "FAQ", href: "/faq" },
    { label: "Articles", href: "/articles" },
    { label: "Search", href: "/search" },
    { label: "VIP Client", href: "/luxury-client" },
    { label: "Schedule", href: "/calendly-demo" },
    { label: "Contact", href: "/#contact" }
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Polrydian Logo - Make it clickable to go home */}
          <a href="/" className="hover:opacity-80 transition-opacity">
            <PolrydianLogo variant="compact" size="sm" />
          </a>

          {/* Personal Branding */}
          <div className="hidden sm:block ml-4 pl-4 border-l border-border">
            <div className="font-semibold text-sm text-foreground font-polrydian">Patrick Misiewicz</div>
            <div className="text-xs text-muted-foreground font-polrydian">Founder & Strategic Advisor</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-foreground hover:text-accent transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
            <a href="/#contact">
              <Button variant="default" size="sm">
                Get in Touch
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 ml-auto flex items-center justify-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
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
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-foreground hover:text-accent transition-colors duration-300 py-2 text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <a href="/#contact" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="default" size="sm" className="mt-2 w-full">
                    Get in Touch
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};