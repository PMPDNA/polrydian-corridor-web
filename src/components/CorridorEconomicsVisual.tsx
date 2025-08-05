import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe2, ArrowRight, TrendingUp, Building2, Users, Zap } from "lucide-react";

export const CorridorEconomicsVisual = () => {
  const corridorElements = [
    {
      icon: Globe2,
      title: "Capital Flows",
      description: "Strategic investment pathways",
      color: "text-blue-500"
    },
    {
      icon: Zap,
      title: "Technology Transfer",
      description: "Innovation corridors",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Expertise Networks",
      description: "Knowledge corridors",
      color: "text-green-500"
    },
    {
      icon: Building2,
      title: "Infrastructure",
      description: "Physical corridors",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Corridor Economics Framework
            </h3>
            <p className="text-muted-foreground">
              Mapping strategic flows to transform barriers into pathways
            </p>
          </div>

          {/* Visual Network */}
          <div className="relative">
            {/* Central Hub */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-accent/20 rounded-full border-4 border-accent/40 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-sm font-semibold text-accent">Strategic Hub</p>
                </div>
              </div>
            </div>

            {/* Corridor Elements */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {corridorElements.map((element, index) => (
                <div key={index} className="relative">
                  {/* Connection Line */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-px h-20 bg-gradient-to-t from-accent/30 to-transparent transform -translate-y-16`}></div>
                  </div>
                  
                  {/* Element Card */}
                  <Card className="relative z-10 hover:shadow-md transition-shadow bg-background/50 backdrop-blur-sm">
                    <CardContent className="p-4 text-center">
                      <element.icon className={`h-8 w-8 mx-auto mb-3 ${element.color}`} />
                      <h4 className="font-semibold text-foreground mb-2">{element.title}</h4>
                      <p className="text-xs text-muted-foreground">{element.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Results Indicators */}
            <div className="mt-8 flex justify-center">
              <div className="flex flex-wrap gap-3 max-w-2xl">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  60% Faster Market Entry
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  $200M Investment Optimization
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Strategic Partnerships
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};