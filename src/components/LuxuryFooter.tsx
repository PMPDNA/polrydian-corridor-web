import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

export const LuxuryFooter = () => {
  const navigationLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Insights", href: "/articles" },
    { name: "Schedule", href: "/schedule" },
  ];

  const resourceLinks = [
    { name: "Latest Analysis", href: "/articles" },
    { name: "Economic Data", href: "/insights" },
    { name: "Corridor Economics", href: "/articles?category=corridor-economics" },
    { name: "Research Papers", href: "/articles?category=research" },
  ];

  const contactInfo = [
    {
      icon: <Mail className="w-4 h-4" />,
      text: "info@polrydian.com",
      href: "mailto:info@polrydian.com"
    },
    {
      icon: <Phone className="w-4 h-4" />,
      text: "+1 (305) 878-6400",
      href: "tel:+13058786400"
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      text: "Miami • Warsaw",
      href: null
    }
  ];

  const socialLinks = [
    {
      icon: <Linkedin className="w-5 h-5" />,
      href: "https://linkedin.com/in/patrickmisiewicz",
      label: "LinkedIn"
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      href: "https://twitter.com/PatrickMisiewicz",
      label: "Twitter"
    }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company info */}
          <div className="md:col-span-1">
            <h3 className="font-serif text-2xl font-bold mb-4 text-accent">
              Polrydian
            </h3>
            <p className="font-sans text-sm leading-relaxed text-primary-foreground/80 mb-6">
              Transforming geopolitical complexity into strategic clarity through 
              corridor economics and deep regional expertise.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center text-accent hover:text-accent/80 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-accent">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="font-sans text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-accent">
              Resources
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href}
                    className="font-sans text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4 text-accent">
              Contact
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((contact, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="text-accent">{contact.icon}</span>
                  {contact.href ? (
                    <a 
                      href={contact.href}
                      className="font-sans text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                    >
                      {contact.text}
                    </a>
                  ) : (
                    <span className="font-sans text-sm text-primary-foreground/80">
                      {contact.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/80 hover:text-accent transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="font-sans text-sm text-primary-foreground/60">
              © {new Date().getFullYear()} Polrydian Group. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6">
              <Link 
                to="/privacy" 
                className="font-sans text-sm text-primary-foreground/60 hover:text-accent transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/cookie-settings" 
                className="font-sans text-sm text-primary-foreground/60 hover:text-accent transition-colors"
              >
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="bg-primary/90 py-4">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="font-serif text-sm text-accent italic">
            "Strategy is the art of making use of time and space." — Napoleon Bonaparte
          </p>
        </div>
      </div>
    </footer>
  );
};