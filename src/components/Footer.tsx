import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Mail, Phone } from "lucide-react";

export default function Footer() {
  const footerLinks = [
    {
      title: "Navigation",
      links: [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Services", href: "/services" },
        { name: "Insights", href: "/insights" },
        { name: "FAQ", href: "/faq" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Articles", href: "/articles" },
        { name: "Schedule Call", href: "/calendly-demo" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Cookie Settings", href: "/cookie-settings" }
      ]
    },
    {
      title: "Contact",
      links: [
        { name: "info@polrydian.com", href: "mailto:info@polrydian.com", icon: Mail },
        { name: "+1 305 878 6400", href: "tel:+13058786400", icon: Phone },
        { name: "Miami, Florida", href: "#", icon: Home }
      ]
    }
  ];

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground text-lg">Polrydian</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Strategic consulting specializing in corridor economics—transforming obstacles into competitive advantages.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </a>
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="font-semibold text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2"
                    >
                      {link.icon && <link.icon className="h-4 w-4" />}
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 Polrydian. All rights reserved.
            </div>
            <div className="flex gap-4 text-sm">
              <a href="/privacy" className="text-muted-foreground hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <a href="/cookie-settings" className="text-muted-foreground hover:text-accent transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}