import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink, Award, Users, MapPin } from "lucide-react";
import profileImage from "@/assets/patrick-profile.jpg";

export default function About() {
  const [showFullBio, setShowFullBio] = useState(false);

  const shortBio = "Patrick Misiewicz is a strategic advisor specializing in corridor economics, global trade analysis, and geopolitical risk assessment. With extensive experience in international business development and supply chain optimization, Patrick helps organizations navigate complex global economic landscapes.";

  const fullBio = `Patrick Misiewicz is a strategic advisor, analyst, and thought leader specializing in corridor economics—a disciplined framework for understanding how capital flows, technology transfer, and strategic pathways interact across global economic systems.

With a Master of Science in Logistics and Supply Chain Management from Florida International University and extensive experience across multiple industries, Patrick brings a unique perspective to complex geopolitical and economic challenges. His work focuses on transforming uncertainty into strategic opportunity through systematic analysis of global trade corridors, supply chain resilience, and economic interdependencies.

**Professional Experience:**
Patrick has advised organizations ranging from emerging growth companies to established multinational corporations on strategic positioning, market entry, and operational optimization. His expertise spans across sectors including technology, manufacturing, logistics, and financial services, with particular focus on Central and Eastern European markets.

**Corridor Economics Framework:**
At the core of Patrick's approach is the corridor economics methodology—a systematic way of mapping and analyzing the flows of capital, technology, and strategic influence across geographic and economic boundaries. This framework helps organizations identify sustainable pathways for growth while managing geopolitical risks and market volatility.

**Thought Leadership:**
Patrick regularly publishes analysis on global economic trends, geopolitical developments, and strategic business insights. His work has been featured in industry publications and he is a frequent speaker at conferences focusing on international trade, supply chain management, and strategic planning.

**Education & Credentials:**
- Master of Science in Logistics and Supply Chain Management, Florida International University
- Bachelor's degree in International Business
- Various professional certifications in strategic planning and risk management

**Areas of Expertise:**
- Corridor Economics Analysis
- Global Trade and Supply Chain Strategy
- Geopolitical Risk Assessment
- Market Entry and Business Development
- Strategic Planning and Scenario Analysis
- International Finance and Investment Strategies

Patrick's approach combines rigorous analytical methods with practical business insight, helping clients navigate complex global challenges while identifying opportunities for sustainable growth and competitive advantage.`;

  const expertise = [
    "Corridor Economics Analysis",
    "Global Trade Strategy", 
    "Geopolitical Risk Assessment",
    "Supply Chain Optimization",
    "Strategic Planning",
    "International Business Development"
  ];

  const achievements = [
    {
      title: "MS in Logistics & Supply Chain Management",
      org: "Florida International University",
      icon: Award
    },
    {
      title: "Strategic Advisory Experience",
      org: "Multiple Industries & Sectors", 
      icon: Users
    },
    {
      title: "Global Market Focus",
      org: "Central & Eastern Europe",
      icon: MapPin
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About Patrick Misiewicz
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {shortBio}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {expertise.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <a href="/schedule">Schedule Consultation</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="https://linkedin.com/in/patrick-misiewicz" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    LinkedIn Profile
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Profile Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src={profileImage}
                  alt="Patrick Misiewicz"
                  className="w-80 h-80 rounded-2xl object-cover shadow-elegant"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Biography Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Professional Background</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="flex items-center gap-2"
                  >
                    {showFullBio ? (
                      <>
                        Show Less
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Read Full Biography
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
                
                <div className={`prose prose-lg max-w-none transition-all duration-500 ${
                  showFullBio ? 'opacity-100 max-h-none' : 'opacity-70 max-h-32 overflow-hidden'
                }`}>
                  <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                    {showFullBio ? fullBio : shortBio}
                  </div>
                </div>
                
                {!showFullBio && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Qualifications & Experience
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {achievements.map((achievement, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <achievement.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.org}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to Transform Your Strategic Challenges?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Let's discuss how corridor economics can unlock new pathways for your organization's growth and resilience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/schedule">Schedule Strategic Consultation</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/articles">Read Strategic Insights</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}