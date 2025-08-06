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

  const shortBio = "Patrick Misiewicz is founder of Polrydian Group, specializing in corridor economics—turning complexity and geopolitical friction into strategic clarity. His approach draws from Stoicism and experience across 60 countries, applying disciplined analysis to create sustainable pathways for organizations.";

  const fullBio = `"The impediment to action advances action. What stands in the way becomes the way."
— Marcus Aurelius

I'm Patrick Oscar Misiewicz, founder of Polrydian Group. My work revolves around a single guiding principle: turning complexity and geopolitical friction into strategic clarity. I call this approach corridor economics—the disciplined practice of mapping and managing flows of capital, technology, policy, and expertise across critical regions, transforming obstacles into sustainable pathways forward.

My worldview—and indeed, my professional discipline—draws heavily from Stoicism, the philosophy of calmly responding to uncertainty by seeing challenges clearly and acting decisively. Born in Florida and raised in Bydgoszcz, Poland, my journey was shaped early by constant navigation between cultures. Academic milestones—a BA in International Economic Relations at the University of Gdańsk, enhanced by an Erasmus year in Amsterdam and scholarship study at Kyungpook National University in Daegu, South Korea—laid the theoretical groundwork. Later, a Master's in Logistics & Supply Chain Management and executive studies in International Business at Florida International University, followed by Public Policy at Georgetown University, deepened my analytical toolkit. But the real foundation has always been shaped through experience, refined through travel to 60 countries across Africa, Asia, Europe, Latin America, and North America.

My professional trajectory demonstrates the value of applying this disciplined clarity. In 2014, when Miami-Dade Aviation Director Emilio González asked if connecting Warsaw directly to Miami via LOT Polish Airlines was feasible, I stepped in to facilitate initial discussions, moving carefully but decisively to create pathways where none existed. Similarly, from 2017 onward, following Port Gdańsk's sister-port agreement with PortMiami, I worked with the port of Gdansk to diversify cargo away from China-centric dependencies, mapping a pragmatic route forward toward capturing new Central European exports bound for North America and Latin America. Co-founding the Amber Route Initiative (2016–2021), I applied the same clarity: strategically linking Central European manufacturing strength with Latin American and Central American near-shoring and American market access.

Simultaneously, I'm passionate about bettering the world for people co-leading a West African agritech economic development, integrating universities, policy makers, businesses, guarantee funds to create a comprehensive economic mobility model for Cote d'Ivoire. In parallel, as Food-Security & Agritech expert, I represented Zab and World Affairs Council of Miami at the Future Investment Initiative summits in Rio, presenting strategic frameworks that allowed Gulf Cooperation Council stakeholders to diversify and secure critical food supply chains, by fostering a ecosystem framework based on Genevieve Levelle model that was implemented in Haiti in 2019 that led to onboarding over 3500 small farmers driving 42% increase in Haiti's export of mangoes and delivered 750% increase in individual farmer income.

Between 2024 and 2025, serving as Senior Adviser & Director of Infrastructure & M&A at Zab Capital Holdings, I structured complex multi-region projects spanning energy, transportation, and digital infrastructure.

My previous roles—North American Business Development Manager at Source International Corp, guiding Fortune 500 clients through logistics-software deployments, and multimillion-dollar negotiations in Miami's luxury real-estate market, where I earned Global Luxury Expert certification—have further sharpened my practical understanding of strategic decision-making under pressure.

Effective strategy requires testing ideas against real-world conditions. As Board Director and Central & Eastern Europe Chair at the World Affairs Council of Miami, I convene senior diplomats, SOUTHCOM officials, economic development leaders, and private-sector stakeholders, translating global volatility into actionable strategies. Recent engagements include organizing strategic dialogues on Haiti's security crisis (2023), co-leading programme planning for the Concordia Americas Summit, and representing the Council at the 75th NATO Summit in Washington (2024). These forums provide a practical Stoic test: refining theoretical strategy into resilient, actionable policy.

Stoicism reminds us that lasting impact requires aligning private ambitions with public good. After Hurricane Matthew devastated Haiti in 2016, I coordinated the delivery of sixty emergency shipments of essential goods—medical supplies, baby formula, shelf-stable foods—through complex logistical channels, guided by a clear, disciplined focus on serving communities directly. Closer to home, my cultural initiatives in Miami, including Polish-American art exhibitions and community programs conducted alongside the Polish Consulate, the American Institute of Polish Culture, and Miami Heat, reinforce a belief central to corridor economics: communities that find meaning and value in a corridor will naturally protect and sustain it.

Chess sharpens my capacity to see patterns, sailing refines adaptive decision-making, and Stoic journaling provides daily practice in composure. These habits are not tangential; they directly inform how I help clients navigate complexity, uncertainty, and volatility.

Let's talk about your challenges clearly, and create the corridor that moves you decisively forward.`;

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
      title: "Senior Adviser & Director of Infrastructure & M&A",
      org: "Zab Capital Holdings (2024-2025)",
      icon: Award
    },
    {
      title: "Board Director & Central & Eastern Europe Chair",
      org: "World Affairs Council of Miami", 
      icon: Users
    },
    {
      title: "MS in Logistics & Supply Chain Management",
      org: "Florida International University",
      icon: Award
    },
    {
      title: "Co-founder, Amber Route Initiative",
      org: "Central European Trade Corridor (2016-2021)",
      icon: MapPin
    },
    {
      title: "Global Luxury Expert Certification",
      org: "Miami Luxury Real Estate",
      icon: Award
    },
    {
      title: "NATO Summit Representative",
      org: "75th NATO Summit, Washington (2024)",
      icon: Users
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <achievement.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm">
                      {achievement.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
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