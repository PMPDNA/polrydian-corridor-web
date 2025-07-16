import { Linkedin, Mail, Phone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const SocialLinks = () => {
  const socialLinks = [
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://www.linkedin.com/in/patrick-misiewicz-mslscm-28299b40",
      description: "Professional network & insights",
      color: "text-[#0077B5] hover:bg-[#0077B5]/10"
    },
    {
      name: "Email",
      icon: Mail,
      url: "mailto:patrick@polrydian.com",
      description: "Direct consultation inquiries",
      color: "text-primary hover:bg-primary/10"
    },
    {
      name: "Phone", 
      icon: Phone,
      url: "tel:+13058786400",
      description: "Strategic consultation hotline",
      color: "text-accent hover:bg-accent/10"
    },
    {
      name: "Website",
      icon: Globe,
      url: "https://polrydian.com",
      description: "Complete portfolio & insights",
      color: "text-muted-foreground hover:bg-muted/20"
    }
  ];

  return (
    <Card className="shadow-elegant">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Connect & Engage</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {socialLinks.map((link) => (
            <Button
              key={link.name}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center p-4 h-auto ${link.color} transition-all duration-200 hover:scale-105`}
              asChild
            >
              <a
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : '_self'}
                rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <link.icon className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium">{link.name}</span>
                <span className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
                  {link.description}
                </span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};