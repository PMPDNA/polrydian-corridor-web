import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building, Users, Award } from "lucide-react";

export const Experience = () => {
  const experiences = [
    {
      period: "2024-2025",
      title: "Senior Adviser & Director of Infrastructure & M&A",
      company: "Zab Capital Holdings",
      location: "Multi-regional",
      description: "Structured complex, multi-regional projects spanning energy, transportation, and digital infrastructure across Africa, Europe, North America, and Latin America.",
      highlights: [
        "Food-Security & Agritech expertise",
        "Represented at Future Investment Initiative summits",
        "GCC stakeholder diversification frameworks",
        "Genevieve Leveille agritech model implementation"
      ],
      icon: Building
    },
    {
      period: "2022-Present",
      title: "Board Director & Chair, Central & Eastern Europe Program",
      company: "World Affairs Council of Miami",
      location: "Miami, FL",
      description: "Convening senior diplomats, SOUTHCOM officials, economic development leaders, and private-sector decision-makers to translate global volatility into actionable strategies.",
      highlights: [
        "Haiti security crisis strategic dialogues (2023)",
        "Concordia Americas Summit co-organization",
        "75th NATO Summit representation (2024)",
        "Strategic dialogue facilitation"
      ],
      icon: Users
    },
    {
      period: "2016-2021",
      title: "Co-Founder",
      company: "Amber Route Initiative",
      location: "Central Europe / Latin America",
      description: "Strategically aligned Central European industrial capacities with Latin American and Central American near-shoring hubs to serve U.S. markets. Developed in collaboration with Central Industrial Cluster of Poland, North-South Logistics and Transport Cluster, and Chamber of Commerce.",
      highlights: [
        "Central European export diversification",
        "Latin American market integration",
        "U.S. market access facilitation",
        "Cross-regional partnership development"
      ],
      icon: MapPin
    },
    {
      period: "2017-2021",
      title: "Strategic Advisor",
      company: "Port of Gdańsk",
      location: "Gdańsk, Poland",
      description: "Advised leadership on strategic diversification away from China-centric shipping, mapping practical pathways for capturing Central European exports bound for U.S. and Latin American markets.",
      highlights: [
        "Sister-port agreement with PortMiami",
        "China diversification strategy",
        "Central European export optimization",
        "Trans-Atlantic trade corridor development"
      ],
      icon: Building
    },
    {
      period: "2014-2016",
      title: "North American Business Development Manager",
      company: "Source International Corp Inc.",
      location: "Miami, FL",
      description: "Led business development for advanced custom software solutions, specializing in Industry 4.0 technologies, IoT innovation, and enterprise digital transformation. Developed strategic partnerships with Fortune 500 clients across manufacturing, logistics, and automation sectors.",
      highlights: [
        "Industry 4.0 implementation leadership",
        "IoT innovation and deployment",
        "Fortune 500 client development",
        "Enterprise digital transformation",
        "Advanced manufacturing solutions"
      ],
      icon: Building
    },
  ];

  const achievements = [
    "LOT Polish Airlines Miami-Warsaw route facilitation (2014)",
    "Polish-American cultural exhibitions & community building",
    "3,500+ smallholder farmers onboarded (Haiti agritech)",
    "42% increase in Haiti mango exports",
    "750%+ individual farmer income boost",
    "Republican Executive Committee service (2016-2019)",
    "Polish Ministry of Foreign Affairs Leadership Training (2016)",
    "CSIS Strategic Leadership Program",
    "Defense Security Cooperation Agency University - Industry Collaboration with Defense Department (101 Training)"
  ];

  return (
    <section id="experience" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Professional Experience
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            15+ years of strategic leadership across multiple continents, transforming complex challenges 
            into sustainable solutions
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-accent/30"></div>

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <div 
                key={index} 
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-3 h-3 bg-accent rounded-full border-4 border-background shadow-lg z-10"></div>

                {/* Content */}
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'} ml-12 md:ml-0`}>
                  <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-accent/10 rounded-lg">
                          <exp.icon className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-accent">{exp.period}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">{exp.title}</h3>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <span className="font-medium">{exp.company}</span>
                            <span>•</span>
                            <span className="text-sm">{exp.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {exp.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {exp.highlights.map((highlight, hIndex) => (
                          <Badge key={hIndex} variant="outline" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};