import { Navigation } from "@/components/Navigation";
import { EnhancedSEO } from "@/components/EnhancedSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Globe2, Target, Users, Award } from "lucide-react";
import Footer from "@/components/Footer";
import CalendlyPopup from "@/components/CalendlyPopup";

export default function SovereignFunds() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title="Sovereign Funds & Family Offices | Strategic Advisory Services"
        description="Strategic advisory for sovereign wealth funds and family offices. Corridor economics, geopolitical risk assessment, and cross-border investment strategy."
        keywords={["sovereign wealth funds", "family offices", "strategic advisory", "corridor economics", "cross-border investment", "geopolitical risk"]}
        url={`${window.location.origin}/sovereign-funds`}
        type="website"
      />
      
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Shield className="w-4 h-4 mr-2" />
            Sovereign Funds & Family Offices
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Strategic Advisory for 
            <br />
            <span className="text-accent">Global Capital Allocators</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Navigate complex geopolitical landscapes and identify strategic corridor opportunities 
            with board-level expertise in cross-border economic development.
          </p>
          <CalendlyPopup
            calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
            buttonText="Schedule Strategic Consultation"
            variant="default"
            size="lg"
            className="shadow-elegant"
            prefill={{
              customAnswers: {
                "client_type": "sovereign_fund",
                "utm_source": "sovereign_funds_page"
              }
            }}
          />
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-accent/20">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Corridor Economics Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic analysis of economic corridors, cross-border trade flows, and infrastructure investment opportunities across emerging markets.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Globe2 className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Geopolitical Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Comprehensive geopolitical analysis to inform investment decisions and strategic positioning in volatile regions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/20">
            <CardHeader>
              <Target className="w-8 h-8 text-accent mb-2" />
              <CardTitle>Cross-Border Deal Advisory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Strategic guidance on complex cross-border transactions, regulatory navigation, and stakeholder engagement.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <div className="bg-muted/30 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Sovereign Funds Trust Polrydian</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent" />
                <span>15+ years advising institutional investors</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe2 className="w-5 h-5 text-accent" />
                <span>Experience across 60+ countries</span>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-accent" />
                <span>Closed over $50M in cross-border deals</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-accent" />
                <span>Deep expertise in corridor economics</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span>Board-level strategic perspective</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-accent" />
                <span>Focus on long-term value creation</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore Strategic Opportunities?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Schedule a confidential consultation to discuss your strategic priorities and identify high-potential corridor investments.
          </p>
          <CalendlyPopup
            calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
            buttonText="Book Confidential Consultation"
            variant="outline"
            size="lg"
            prefill={{
              customAnswers: {
                "client_type": "sovereign_fund",
                "utm_source": "sovereign_funds_cta_bottom"
              }
            }}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}