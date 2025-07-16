import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Hexagon, Mail, Phone } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            {/* Polrydian Logo Placeholder - Replace with actual logo */}
            <div className="relative">
              <Hexagon className="h-10 w-10 text-accent fill-accent/10 transform rotate-12" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="font-bold text-lg text-foreground font-polrydian">Patrick Misiewicz</div>
              <div className="text-sm text-muted-foreground font-polrydian">Polrydian Group</div>
            </div>
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
            <Button variant="hero" size="sm">
              Get in Touch
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground hover:text-accent transition-colors duration-300 py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button variant="hero" size="sm" className="mt-2">
                Get in Touch
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};