import { Navigation } from "@/components/Navigation";
import { EnhancedSEO } from "@/components/EnhancedSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Globe2, Target, Lock, Cpu } from "lucide-react";
import Footer from "@/components/Footer";
import CalendlyPopup from "@/components/CalendlyPopup";

export default function DefenceTech() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title="Defence & Deep Tech Advisory | Strategic Technology Consulting"
        description="Strategic advisory for defence contractors and deep tech companies. Geopolitical risk, technology corridors, and strategic market positioning."
        keywords={["defence advisory", "deep tech consulting", "technology strategy", "geopolitical risk", "defence contractors", "strategic positioning"]}
        url={`${window.location.origin}/defence-tech`}
        type="website"
      />
      
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Shield className="w-4 h-4 mr-2" />
            Defence & Deep Tech Companies
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Strategic Advisory for
            <br />
            <span className="text-accent">Critical Technologies</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Navigate complex geopolitical landscapes, secure strategic partnerships, and 
            position your technology within critical infrastructure corridors.
          </p>
          <CalendlyPopup
            calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
            buttonText="Schedule Strategic Consultation"
            variant="default"
            size="lg"
            className="shadow-elegant"
            prefill={{
              customAnswers: {
                "client_type": "defence_tech",
                "utm_source": "defence_tech_page"
              }
            }}
          />
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-accent/20">
            <CardHeader>
              <Shield className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Geopolitical Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Deep analysis of geopolitical trends affecting defence and technology sectors, including regulatory changes and strategic partnerships.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Target className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Strategic Market Positioning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Position your technology within critical infrastructure corridors and identify strategic market opportunities across allied nations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Lock className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Security Corridor Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic guidance on navigating security requirements, export controls, and establishing trusted technology corridors.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Globe2 className="w-8 h-8 text-accent mb-2" />
              <CardTitle>International Expansion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic market entry planning for defence and deep tech companies expanding into new jurisdictions and allied markets.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Cpu className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Technology Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic advice on integrating cutting-edge technologies within existing defence and infrastructure systems.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Zap className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Innovation Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic guidance on innovation roadmaps, R&D prioritization, and technology development within geopolitical constraints.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expertise Areas */}
        <div className="bg-muted/30 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Deep Expertise Across Critical Sectors</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Defence Technologies</h3>
                <p className="text-muted-foreground">
                  Strategic positioning of defence technologies within allied corridors, export control navigation, and security partnership development.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Critical Infrastructure</h3>
                <p className="text-muted-foreground">
                  Analysis of technology integration within critical infrastructure corridors, including energy, telecommunications, and transportation.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Emerging Technologies</h3>
                <p className="text-muted-foreground">
                  Strategic guidance on AI, quantum computing, advanced materials, and other emerging technologies with strategic implications.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Supply Chain Security</h3>
                <p className="text-muted-foreground">
                  Strategic analysis of technology supply chains, risk mitigation strategies, and secure corridor development.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Strategic Position?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Schedule a confidential consultation to discuss your technology strategy, market positioning, and geopolitical risk management.
          </p>
          <CalendlyPopup
            calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
            buttonText="Book Confidential Consultation"
            variant="outline"
            size="lg"
            prefill={{
              customAnswers: {
                "client_type": "defence_tech",
                "utm_source": "defence_tech_cta_bottom"
              }
            }}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}