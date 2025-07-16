import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { MapPin, GraduationCap, Award, Users } from "lucide-react";

export const About = () => {
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const highlights = [
    {
      icon: MapPin,
      title: "Global Reach",
      description: "60 countries across Africa, Asia, Europe, Latin America, and North America"
    },
    {
      icon: GraduationCap,
      title: "Academic Excellence",
      description: "Masters in Logistics & Georgetown Public Policy studies"
    },
    {
      icon: Award,
      title: "Strategic Leadership",
      description: "Board Director at World Affairs Council of Miami"
    },
    {
      icon: Users,
      title: "Cultural Bridge",
      description: "Polish-American community building and cultural diplomacy"
    }
  ];

  const educationBadges = [
    "International Economic Relations - University of Gdańsk",
    "Erasmus Scholar - Amsterdam", 
    "Study Abroad - Kyungpook National University, South Korea",
    "Logistics & Supply Chain - FIU",
    "Public Policy - Georgetown University"
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            About Patrick Misiewicz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Founder of Polrydian Group, specializing in corridor economics and strategic transformation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Professional Photo */}
          <div className="lg:order-2">
            <div className="relative">
              {/* Photo Placeholder - Replace with actual Patrick photo */}
              <div className="w-full max-w-md mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 shadow-elegant">
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center overflow-hidden relative group">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Patrick Misiewicz" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-20 h-20 bg-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-accent">PM</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Patrick Misiewicz</p>
                      <p className="text-xs text-muted-foreground">Click to upload photo</p>
                    </div>
                  )}
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FileUpload
                      onFilesChange={(urls) => {
                        if (urls.length > 0) {
                          setProfilePhoto(urls[0]);
                        }
                      }}
                      currentFiles={profilePhoto ? [profilePhoto] : []}
                      multiple={false}
                      accept="image/*"
                      label="Upload Photo"
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
              
              {/* Quote overlay */}
              <div className="absolute -bottom-6 -right-6 bg-background border border-accent/20 rounded-lg p-4 shadow-elegant max-w-xs">
                <p className="text-sm italic text-muted-foreground">"What stands in the way becomes the way."</p>
                <cite className="text-xs text-accent">— Marcus Aurelius</cite>
              </div>
            </div>
          </div>

          {/* Main Bio */}
          <div className="space-y-6 lg:order-1">
            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Strategic Philosophy</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  My work centers on <strong>corridor economics</strong>—the disciplined practice of mapping and managing 
                  strategic flows of capital, technology, policy, and expertise across critical global regions, 
                  transforming obstacles into pathways toward resilience and sustainable growth.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  My professional worldview draws deeply from <strong>Stoicism</strong>, a philosophy emphasizing 
                  clear-sighted assessment, calm composure, and decisive action in the face of uncertainty.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Background & Journey</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Born in Florida and raised in Bydgoszcz, Poland, my earliest experiences involved navigating 
                  diverse cultural and economic contexts, laying the foundation for my professional approach.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Real-world exposure across 60 countries spanning Africa, Asia, Europe, Latin America, and 
                  North America truly refined my perspective and skillset, providing practical understanding 
                  of how sophisticated supply chains operate in dynamic markets.
                </p>
              </CardContent>
            </Card>

            {/* Education Badges */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Academic Foundation</h3>
              <div className="flex flex-wrap gap-2">
                {educationBadges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-1">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Key Distinctions</h3>
            <div className="grid gap-6">
              {highlights.map((item, index) => (
                <Card key={index} className="shadow-md hover:shadow-elegant transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <item.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Personal Disciplines */}
            <Card className="shadow-elegant bg-gradient-to-br from-accent/5 to-accent/10">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Personal Disciplines</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Chess</strong> sharpens my pattern recognition, <strong>sailing</strong> strengthens 
                  my adaptive decision-making, and <strong>daily Stoic journaling</strong> helps maintain 
                  clarity and composure in volatility.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Far from mere hobbies, these practices directly shape how I guide clients through 
                  complex global challenges.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};