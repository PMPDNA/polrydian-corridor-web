import { Badge } from "@/components/ui/badge";
import { Globe, Users, Award, MapPin } from "lucide-react";

export const ProofChips = () => {
  const achievements = [
    {
      icon: <Globe className="w-4 h-4" />,
      text: "60+ Countries",
      description: "Global Experience"
    },
    {
      icon: <Users className="w-4 h-4" />,
      text: "15+ Years",
      description: "Strategic Consulting"
    },
    {
      icon: <Award className="w-4 h-4" />,
      text: "Fortune 500",
      description: "Client Portfolio"
    },
    {
      icon: <MapPin className="w-4 h-4" />,
      text: "Multi-Corridor",
      description: "Infrastructure Expert"
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {achievements.map((achievement, index) => (
        <Badge 
          key={index}
          variant="outline"
          className="chip-outline flex items-center gap-2 px-4 py-2 text-sm bg-white/90 border-accent/30 text-accent hover:bg-accent/10 transition-colors"
        >
          {achievement.icon}
          <span className="font-medium">{achievement.text}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {achievement.description}
          </span>
        </Badge>
      ))}
    </div>
  );
};