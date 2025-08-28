import { Navigation } from "@/components/Navigation";
import { EnhancedSEO } from "@/components/EnhancedSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ship, MapPin, TrendingUp, Globe2, Anchor, Package } from "lucide-react";
import Footer from "@/components/Footer";
import CalendlyPopup from "@/components/CalendlyPopup";

export default function PortsLogistics() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title="Ports & Logistics Advisory | Strategic Maritime Consulting"
        description="Strategic advisory for ports, terminals, and logistics operators. Supply chain optimization, corridor economics, and maritime infrastructure strategy."
        keywords={["ports advisory", "logistics consulting", "maritime strategy", "supply chain", "corridor economics", "terminal operations"]}
        url={`${window.location.origin}/ports-logistics`}
        type="website"
      />
      
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Ship className="w-4 h-4 mr-2" />
            Ports & Logistics Operators
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Strategic Advisory for
            <br />
            <span className="text-accent">Maritime Infrastructure</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Optimize supply chain corridors, expand maritime operations, and navigate 
            complex geopolitical challenges with deep expertise in port and logistics strategy.
          </p>
          <CalendlyPopup
            calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
            buttonText="Schedule Strategic Consultation"
            variant="default"
            size="lg"
            className="shadow-elegant"
            prefill={{
              customAnswers: {
                "client_type": "ports_logistics",
                "utm_source": "ports_logistics_page"
              }
            }}
          />
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-accent/20">
            <CardHeader>
              <Package className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Supply Chain Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic analysis of supply chain flows, bottleneck identification, and corridor optimization for maximum efficiency and resilience.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Anchor className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Port Development Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive port expansion planning, terminal optimization, and strategic positioning within global maritime networks.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Globe2 className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Corridor Economics Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Deep analysis of economic corridors, trade flow patterns, and strategic opportunities for maritime infrastructure investments.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <MapPin className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Market Entry Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic guidance for entering new maritime markets, regulatory navigation, and stakeholder engagement across jurisdictions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Investment Advisory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic investment analysis for maritime infrastructure projects, risk assessment, and value optimization strategies.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Ship className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Operational Excellence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Performance optimization, operational efficiency improvements, and strategic technology integration for port operations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Success Metrics */}
        <div className="bg-muted/30 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Proven Track Record</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">$50M+</div>
              <div className="text-muted-foreground">In strategic deals closed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">60+</div>
              <div className="text-muted-foreground">Countries of experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">15+</div>
              <div className="text-muted-foreground">Years in strategic consulting</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Maritime Strategy?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Schedule a strategic consultation to discuss operational challenges, expansion opportunities, and corridor optimization strategies.
          </p>
          <CalendlyPopup
            calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
            buttonText="Book Strategic Consultation"
            variant="outline"
            size="lg"
            prefill={{
              customAnswers: {
                "client_type": "ports_logistics",
                "utm_source": "ports_logistics_cta_bottom"
              }
            }}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}