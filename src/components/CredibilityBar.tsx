import { Globe, Users, Award, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const CredibilityBar = () => {
  const credentials = [
    {
      icon: <Globe className="w-5 h-5" />,
      text: "65+ Countries",
      subtext: "Global Experience"
    },
    {
      icon: <Users className="w-5 h-5" />,
      text: "US/Poland",
      subtext: "Dual-Citizen Advisor"
    },
    {
      icon: <Award className="w-5 h-5" />,
      text: "10+ Years",
      subtext: "Fortune 500 & Sovereign Clients"
    },
    {
      icon: <Building className="w-5 h-5" />,
      text: "Strategy",
      subtext: "Innovation | Partnership"
    }
  ];

  return (
    <section className="py-8 bg-muted/50 border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
          {credentials.map((credential, index) => (
            <div key={index} className="flex items-center gap-3 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                {credential.icon}
              </div>
              <div className="text-left">
                <div className="font-serif font-semibold text-lg text-foreground">
                  {credential.text}
                </div>
                <div className="font-sans text-sm text-muted-foreground">
                  {credential.subtext}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};