import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CalendlyPopup from "@/components/CalendlyPopup";
import { 
  Target, 
  TrendingUp, 
  Globe, 
  Shield, 
  Zap, 
  Map,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Services() {
  const coreServices = [
    {
      icon: Target,
      title: "Strategic Consultation",
      description: "Transform complex challenges into clear strategic pathways using corridor economics methodology.",
      features: [
        "Strategic corridor mapping",
        "Competitive advantage identification",
        "Implementation roadmaps",
        "Executive advisory sessions"
      ],
      timeline: "2-6 weeks",
      investment: "Starting at $15,000"
    },
    {
      icon: TrendingUp,
      title: "Corridor Economics Advisory",
      description: "Deep-dive analysis of interconnected business challenges to reveal hidden opportunities.",
      features: [
        "Systems thinking analysis",
        "Dependency mapping",
        "Opportunity corridor identification",
        "Strategic pathway optimization"
      ],
      timeline: "4-8 weeks",
      investment: "Starting at $25,000"
    },
    {
      icon: Globe,
      title: "Infrastructure & M&A",
      description: "Navigate complex transactions and infrastructure decisions with strategic clarity.",
      features: [
        "Due diligence strategy",
        "Integration planning",
        "Risk corridor assessment",
        "Value creation mapping"
      ],
      timeline: "6-12 weeks",
      investment: "Project-based pricing"
    },
    {
      icon: Shield,
      title: "Geopolitical Risk Assessment",
      description: "Understand and mitigate political and economic risks across global markets.",
      features: [
        "Risk corridor analysis",
        "Political stability assessment",
        "Market entry strategies",
        "Regulatory navigation"
      ],
      timeline: "3-6 weeks",
      investment: "Starting at $20,000"
    },
    {
      icon: Zap,
      title: "Supply Chain Optimization",
      description: "Build resilient supply networks that turn disruption into competitive advantage.",
      features: [
        "Supply corridor mapping",
        "Resilience planning",
        "Vendor strategy optimization",
        "Risk mitigation protocols"
      ],
      timeline: "4-10 weeks",
      investment: "Starting at $30,000"
    },
    {
      icon: Map,
      title: "Market Entry Strategy",
      description: "Successfully enter new markets by identifying and building strategic corridors.",
      features: [
        "Market corridor analysis",
        "Competitive positioning",
        "Entry strategy development",
        "Launch optimization"
      ],
      timeline: "6-12 weeks",
      investment: "Starting at $35,000"
    }
  ];

  const process = [
    {
      step: "01",
      title: "Strategic Discovery",
      description: "Deep dive into your challenges, mapping the current strategic landscape and identifying key corridors."
    },
    {
      step: "02", 
      title: "Corridor Analysis",
      description: "Systematic analysis of interconnected factors, dependencies, and hidden opportunity pathways."
    },
    {
      step: "03",
      title: "Strategy Development",
      description: "Design actionable strategies that transform obstacles into competitive advantages."
    },
    {
      step: "04",
      title: "Implementation Support",
      description: "Provide ongoing guidance and support to ensure successful strategy execution."
    }
  ];

  const caseStudies = [
    {
      title: "Global Manufacturing Expansion",
      challenge: "Fortune 500 manufacturer facing complex regulatory barriers in 15 new markets",
      solution: "Mapped regulatory corridors and identified strategic partnerships to accelerate market entry",
      result: "Successfully streamlined market entry process and established strong operational presence across all target markets"
    },
    {
      title: "Supply Chain Resilience",
      challenge: "Technology company vulnerable to supply chain disruptions",
      solution: "Developed diversified supply corridors with built-in redundancy and risk mitigation",
      result: "Established robust supply chain resilience with improved reliability and operational efficiency"
    },
    {
      title: "Strategic M&A Integration",
      challenge: "Private equity firm struggling with complex acquisition integration across multiple jurisdictions",
      solution: "Created integration corridors that addressed regulatory, cultural, and operational complexities",
      result: "Delivered seamless integration with strong synergy realization"
    }
  ];

  const sections = [
    { id: "hero", title: "Overview" },
    { id: "core-services", title: "Core Services" },
    { id: "process", title: "Our Process" },
    { id: "case-studies", title: "Success Stories" },
    { id: "cta", title: "Get Started" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12 space-y-16">
        <Breadcrumbs />
        {/* Hero Section */}
        <div id="hero" className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Strategic Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Transform your most complex challenges into competitive advantages through 
            corridor economics—the strategic methodology that reveals pathways others miss.
          </p>
        </div>

        {/* Core Services */}
        <div id="core-services" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Core Services</h2>
            <p className="text-muted-foreground">
              Comprehensive strategic solutions tailored to your unique challenges
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {coreServices.map((service, index) => (
              <Card key={index} className="shadow-elegant hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <service.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{service.description}</p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Key Features:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-muted-foreground text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">Timeline</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.timeline}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">Investment</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.investment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Process */}
        <div id="process" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Process</h2>
            <p className="text-muted-foreground">
              A proven methodology for transforming complexity into strategic advantage
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, index) => (
              <Card key={index} className="shadow-elegant relative">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-accent/20 mb-4">{step.step}</div>
                  <h3 className="font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  {index < process.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-accent" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Case Studies */}
        <div id="case-studies" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Success Stories</h2>
            <p className="text-muted-foreground">
              Real results from strategic corridor economics implementation
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <Card key={index} className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">{study.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Challenge</h4>
                    <p className="text-sm text-muted-foreground">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Corridor Solution</h4>
                    <p className="text-sm text-muted-foreground">{study.solution}</p>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <h4 className="font-semibold text-accent mb-2">Result</h4>
                    <p className="text-sm text-foreground font-medium">{study.result}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card id="cta" className="shadow-elegant bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-accent/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Ready to Transform Your Challenges?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Let's discuss how corridor economics can unlock new pathways for your organization. 
              Every strategic challenge contains opportunities—we'll help you find them.
            </p>
            <CalendlyPopup
              calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
              buttonText="Schedule Strategic Consultation"
              variant="default"
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}