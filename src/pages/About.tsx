import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Globe, 
  Target, 
  TrendingUp, 
  Users, 
  MapPin,
  Linkedin,
  Mail
} from "lucide-react";

import Footer from "@/components/Footer";
import SectionNavigator from "@/components/SectionNavigator";

export default function About() {
  const teamMembers = [
    {
      name: "Patrick Misiewicz",
      role: "Founder & Principal Strategist",
      bio: "Leading expert in corridor economics with 15+ years transforming complex strategic challenges into competitive advantages across 60+ countries.",
      expertise: ["Corridor Economics", "Strategic Planning", "Global Markets", "M&A Advisory"],
      location: "Miami, Florida",
      email: "patrick@polrydian.com",
      linkedin: "#"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Strategic Clarity",
      description: "We transform complexity into clear, actionable pathways that advance your mission."
    },
    {
      icon: Globe,
      title: "Global Perspective",
      description: "Operating across 60+ countries, we understand how local dynamics connect to global opportunities."
    },
    {
      icon: TrendingUp,
      title: "Measurable Impact",
      description: "Every strategy we develop is designed for implementation and measurable business outcomes."
    },
    {
      icon: Users,
      title: "Collaborative Approach",
      description: "We work alongside your team, building internal capability while delivering external results."
    }
  ];

  const credentials = [
    "MBA Strategic Management",
    "Certified Management Consultant (CMC)",
    "International Association of Consultants",
    "Strategic Planning Society Member",
    "Global Markets Research Certification"
  ];

  const sections = [
    { id: "hero", title: "Overview" },
    { id: "story", title: "Our Story" },
    { id: "values", title: "Values" },
    { id: "team", title: "Team" },
    { id: "credentials", title: "Credentials" },
    { id: "mission", title: "Mission" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <div id="hero" className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            About Polrydian
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            We specialize in corridor economics—the strategic art of identifying and building 
            pathways that transform obstacles into competitive advantages. Every challenge contains 
            the seeds of opportunity; we help you cultivate them.
          </p>
        </div>

        {/* Company Story */}
        <Card id="story" className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-3xl text-foreground">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Born from Complexity
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Polrydian emerged from a simple observation: the most successful organizations 
                  don't avoid complexity—they navigate it masterfully. Our founder, Patrick Misiewicz, 
                  developed the corridor economics methodology after years of witnessing how traditional 
                  consulting approaches failed to address the interconnected nature of modern strategic challenges.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  The Corridor Advantage
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Unlike conventional strategy that treats problems in isolation, corridor economics 
                  recognizes that every challenge exists within a network of relationships, dependencies, 
                  and opportunities. By mapping these corridors, we reveal pathways that others miss—
                  turning your greatest obstacles into your most decisive advantages.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values */}
        <div id="values" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-muted-foreground">
              The principles that guide our approach to strategic consultation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="shadow-elegant hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="p-3 bg-accent/10 rounded-lg inline-block">
                    <value.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div id="team" className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Leadership Team</h2>
            <p className="text-muted-foreground">
              Strategic minds dedicated to your success
            </p>
          </div>
          
          <div className="grid lg:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="shadow-elegant">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 text-center md:text-left">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full mx-auto md:mx-0 mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
                      <p className="text-accent font-medium">{member.role}</p>
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{member.location}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 space-y-4">
                      <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Areas of Expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <a 
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">Contact</span>
                        </a>
                        <a 
                          href="https://www.linkedin.com/in/patrick-misiewicz-mslscm-28299b40"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Credentials */}
        <Card id="credentials" className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-accent" />
              Professional Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {credentials.map((credential, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Award className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-foreground">{credential}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mission Statement */}
        <Card id="mission" className="shadow-elegant bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-accent/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              "What stands in the way becomes the way."
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              This ancient principle guides everything we do. At Polrydian, we don't see obstacles 
              as roadblocks—we see them as the raw material for competitive advantage. Our mission 
              is to help organizations transform their greatest challenges into their most decisive strengths.
            </p>
          </CardContent>
        </Card>
      </div>
      <SectionNavigator sections={sections} />
      <Footer />
    </div>
  );
}