import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, Calendar, Users } from "lucide-react";

interface ThinkTankResource {
  title: string;
  organization: string;
  description: string;
  url: string;
  date: string;
  category: string;
  relevanceNote: string;
}

const thinkTankResources: ThinkTankResource[] = [
  {
    title: "Building Resilient Global Supply Chains: Geopolitics and the Indo-Pacific",
    organization: "Center for Strategic & International Studies (CSIS)",
    description: "Analysis of supply chain vulnerabilities and strategic responses to geopolitical disruptions in the Indo-Pacific region",
    url: "https://www.csis.org/analysis/building-resilient-global-supply-chains-geopolitics-indo-pacific",
    date: "2024-01-15",
    category: "Supply Chain",
    relevanceNote: "Directly relevant to corridor economics methodology for building resilient trade pathways"
  },
  {
    title: "Data and the Transformation of International Trade",
    organization: "Brookings Institution",
    description: "Examination of how digital technologies are reshaping global trade patterns and economic corridors",
    url: "https://www.brookings.edu/research/data-and-the-transformation-of-international-trade/",
    date: "2024-01-10",
    category: "Digital Trade",
    relevanceNote: "Provides foundation for understanding how digital corridors intersect with physical trade routes"
  },
  {
    title: "OECD Economic Outlook: Navigating Uncertainty",
    organization: "OECD",
    description: "Comprehensive analysis of global economic trends and policy recommendations for uncertain times",
    url: "https://www.oecd.org/economic-outlook/",
    date: "2024-01-08",
    category: "Economic Policy",
    relevanceNote: "Essential context for corridor economics applications in policy-making environments"
  },
  {
    title: "How Increased Geopolitical Tensions Are Affecting Global Trade",
    organization: "Peterson Institute for International Economics",
    description: "Framework for assessing and mitigating geopolitical risks in international investments and trade flows",
    url: "https://www.piie.com/blogs/realtime-economic-issues-watch/how-increased-geopolitical-tensions-are-affecting-global-trade",
    date: "2024-01-05",
    category: "Geopolitical Risk",
    relevanceNote: "Complements corridor economics approach to risk assessment and mitigation"
  },
  {
    title: "Strategic Industries and National Security",
    organization: "Atlantic Council",
    description: "Analysis of critical industries and their role in national economic security",
    url: "https://www.atlanticcouncil.org/programs/geoeconomics-center/",
    date: "2024-01-03",
    category: "National Security",
    relevanceNote: "Demonstrates application of strategic thinking to critical economic infrastructure"
  },
  {
    title: "Infrastructure Investment and Economic Growth",
    organization: "World Economic Forum",
    description: "Global perspective on infrastructure investment needs and economic impact",
    url: "https://www.weforum.org/topics/infrastructure/",
    date: "2024-01-01",
    category: "Infrastructure",
    relevanceNote: "Provides global context for infrastructure corridor development strategies"
  }
];

const organizations = [
  {
    name: "Center for Strategic & International Studies (CSIS)",
    focus: "Strategic analysis of global security and economic issues",
    url: "https://www.csis.org/"
  },
  {
    name: "Brookings Institution",
    focus: "Non-partisan research on public policy challenges",
    url: "https://www.brookings.edu/"
  },
  {
    name: "OECD",
    focus: "International economic cooperation and development",
    url: "https://www.oecd.org/"
  },
  {
    name: "Peterson Institute for International Economics",
    focus: "International economic policy research",
    url: "https://www.piie.com/"
  },
  {
    name: "Atlantic Council",
    focus: "International affairs and global challenges",
    url: "https://www.atlanticcouncil.org/"
  },
  {
    name: "World Economic Forum",
    focus: "Global economic cooperation and development",
    url: "https://www.weforum.org/"
  }
];

export function ThinkTankModal() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="hover:bg-accent/10">
          <BookOpen className="h-4 w-4 mr-2" />
          Learn More from Leading Think Tanks
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            Leading Think Tank Research
          </DialogTitle>
          <p className="text-muted-foreground">
            Curated insights from premier research institutions, analyzed through the lens of corridor economics
          </p>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Featured Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Featured Research & Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {thinkTankResources.map((resource, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {resource.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="h-3 w-3" />
                        {resource.organization}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(resource.date)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {resource.description}
                    </p>
                    
                    <div className="bg-accent/5 p-3 rounded-lg">
                      <h4 className="text-xs font-semibold text-accent mb-1">
                        Corridor Economics Relevance:
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {resource.relevanceNote}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      asChild
                    >
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Read Full Analysis
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Think Tank Organizations */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Premier Research Institutions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.map((org, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {org.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                      {org.focus}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs"
                      asChild
                    >
                      <a href={org.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Visit Institution
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Commentary */}
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-6 rounded-lg border border-accent/20">
            <h3 className="text-lg font-semibold mb-3 text-foreground">
              Corridor Economics Perspective
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              While these institutions provide valuable analysis, corridor economics offers a unique methodology 
              for synthesizing complex geopolitical and economic information into actionable strategic pathways. 
              By mapping the interconnections between seemingly separate challenges, we can identify opportunities 
              that traditional analysis might miss.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Key Insight:</strong> "What stands in the way becomes the way." This Stoic principle, 
              when applied to these research findings, reveals how apparent obstacles in global trade, 
              supply chains, and geopolitical tensions can be transformed into strategic corridors for competitive advantage.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}