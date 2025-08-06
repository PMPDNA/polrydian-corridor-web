import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, BookOpen, Globe, Users, Briefcase } from "lucide-react";

export const LearnMoreModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const thinkTanks = [
    {
      name: "Center for Strategic & International Studies (CSIS)",
      description: "Leading think tank providing strategic insights on international affairs, economics, and security",
      focus: "Geopolitical Analysis & Economic Policy",
      articles: [
        {
          title: "Global Trade Corridors and Supply Chain Resilience",
          url: "https://www.csis.org/analysis/trade-corridors-supply-chain-resilience",
          description: "Analysis of critical trade routes and supply chain diversification strategies"
        },
        {
          title: "The New Geopolitics of Global Infrastructure",
          url: "https://www.csis.org/analysis/new-geopolitics-global-infrastructure",
          description: "How infrastructure development shapes international relations and economic flows"
        }
      ],
      website: "https://www.csis.org"
    },
    {
      name: "Brookings Institution",
      description: "Research institute focused on policy analysis and recommendations for governance and economics",
      focus: "Economic Development & Governance",
      articles: [
        {
          title: "The Future of Global Economic Governance",
          url: "https://www.brookings.edu/research/global-economic-governance",
          description: "Frameworks for international economic cooperation and policy coordination"
        },
        {
          title: "Infrastructure Investment and Economic Growth",
          url: "https://www.brookings.edu/research/infrastructure-investment-economic-growth",
          description: "The role of strategic infrastructure in driving sustainable economic development"
        }
      ],
      website: "https://www.brookings.edu"
    },
    {
      name: "Organisation for Economic Co-operation and Development (OECD)",
      description: "International organization promoting policies for economic and social well-being",
      focus: "Economic Policy & International Cooperation",
      articles: [
        {
          title: "Global Value Chains and Trade Corridors",
          url: "https://www.oecd.org/trade/global-value-chains",
          description: "Understanding interconnected global production networks and trade patterns"
        },
        {
          title: "Economic Resilience in Uncertain Times",
          url: "https://www.oecd.org/economic-outlook/economic-resilience",
          description: "Building adaptive capacity in economic systems facing global challenges"
        }
      ],
      website: "https://www.oecd.org"
    },
    {
      name: "Council on Foreign Relations (CFR)",
      description: "Independent think tank specializing in foreign policy and international affairs",
      focus: "International Relations & Strategic Analysis",
      articles: [
        {
          title: "The New Economics of Geopolitical Competition",
          url: "https://www.cfr.org/article/new-economics-geopolitical-competition",
          description: "How economic tools are reshaping international power dynamics"
        },
        {
          title: "Strategic Corridors in the 21st Century",
          url: "https://www.cfr.org/article/strategic-corridors-21st-century",
          description: "The evolution of economic and strategic pathways in global commerce"
        }
      ],
      website: "https://www.cfr.org"
    }
  ];

  const corridorEconomicsCommentary = [
    {
      title: "Applying Corridor Economics to Think Tank Research",
      content: "Think tank research provides the analytical foundation for understanding global systems, but corridor economics transforms this analysis into actionable strategic pathways. By mapping the flows of capital, technology, and expertise identified in these studies, we can identify specific opportunities for competitive advantage."
    },
    {
      title: "From Analysis to Implementation",
      content: "While think tanks excel at identifying challenges and trends, corridor economics bridges the gap between research and implementation. We use their insights to map strategic pathways that turn geopolitical complexity into business opportunity."
    },
    {
      title: "Synthesis and Strategic Application",
      content: "The real value emerges when we synthesize findings from multiple sources through the corridor economics framework. This creates a comprehensive understanding of how global forces can be leveraged for specific strategic objectives."
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
          <BookOpen className="h-5 w-5 mr-2" />
          Learn More from Leading Think Tanks
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Globe className="h-6 w-6 text-accent" />
            Strategic Intelligence from Leading Think Tanks
          </DialogTitle>
          <p className="text-muted-foreground">
            Curated research and analysis from premier policy institutes, with corridor economics commentary
          </p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Think Tank Articles */}
          <div className="grid gap-6">
            {thinkTanks.map((institute, index) => (
              <Card key={index} className="shadow-elegant">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{institute.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{institute.description}</p>
                    </div>
                    <Badge variant="outline">{institute.focus}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {institute.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="p-4 border border-border rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">{article.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{article.description}</p>
                        <Button variant="outline" size="sm" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Read Article
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-border">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={institute.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Visit {institute.name}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Corridor Economics Commentary */}
          <div className="space-y-6">
            <div className="border-t border-border pt-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-accent" />
                Corridor Economics Commentary
              </h3>
              <p className="text-muted-foreground mb-6">
                How we apply think tank research through the corridor economics framework
              </p>
            </div>

            <div className="grid gap-4">
              {corridorEconomicsCommentary.map((commentary, index) => (
                <Card key={index} className="bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-3">{commentary.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{commentary.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="border-t border-border pt-6">
            <Card className="shadow-elegant bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-accent/20">
              <CardContent className="p-6 text-center">
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  Ready to Apply These Insights to Your Strategy?
                </h4>
                <p className="text-muted-foreground mb-4">
                  Transform global research into actionable strategic pathways for your organization
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button asChild>
                    <a href="/schedule">Schedule Strategic Consultation</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/insights">Explore Our Insights</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};