import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import corridorDiagram from "@/assets/corridor-economics-diagram.jpg";

export const CorridorEconomics = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              What is Corridor Economics?
            </h2>
            
            <p className="font-sans text-lg text-muted-foreground leading-relaxed mb-8">
              Corridor economics maps the strategic flows of capital, technology, and expertise 
              between regions to create competitive pathways. Think of it as building bridges 
              where others see barriers—transforming geopolitical friction into strategic advantage.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Capital Flows
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Technology Transfer
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Strategic Pathways
              </Badge>
            </div>
            
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Learn More from Leading Think Tanks
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Diagram */}
          <div className="relative">
            <img 
              src={corridorDiagram}
              alt="Corridor Economics Network Diagram showing strategic flows between global regions"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};