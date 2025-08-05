import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink, Globe2, TrendingUp, FileText, Calendar } from 'lucide-react';
import corridorDiagram from "@/assets/corridor-economics-diagram.jpg";

interface ThinkTankArticle {
  title: string;
  source: string;
  url: string;
  summary: string;
  publishDate: string;
  tags: string[];
}

// Sample think tank articles (in production, these would be fetched from APIs/RSS)
const thinkTankArticles: ThinkTankArticle[] = [
  {
    title: "The Geopolitics of Supply Chain Resilience",
    source: "CSIS",
    url: "https://www.csis.org/analysis/geopolitics-supply-chain-resilience",
    summary: "Analysis of how geopolitical tensions are reshaping global supply chains and creating new strategic corridors.",
    publishDate: "2024-01-15",
    tags: ["supply chain", "geopolitics", "resilience"]
  },
  {
    title: "Infrastructure Investment and Economic Growth",
    source: "Brookings",
    url: "https://www.brookings.edu/research/infrastructure-investment-economic-growth",
    summary: "Examination of the relationship between infrastructure investments and economic development in emerging markets.",
    publishDate: "2024-01-10",
    tags: ["infrastructure", "economic growth", "emerging markets"]
  },
  {
    title: "Trade Corridors in the Digital Age",
    source: "OECD",
    url: "https://www.oecd.org/trade/trade-corridors-digital-age",
    summary: "How digital transformation is revolutionizing traditional trade routes and creating virtual corridors.",
    publishDate: "2024-01-08",
    tags: ["digital trade", "corridors", "technology"]
  }
];

export const EnhancedCorridorEconomics = () => {
  const [selectedArticle, setSelectedArticle] = useState<ThinkTankArticle | null>(null);
  const [showAllArticles, setShowAllArticles] = useState(false);

  return (
    <div className="bg-background/50 backdrop-blur-sm border border-accent/20 rounded-xl p-6 max-w-4xl mx-auto mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
        <Globe2 className="h-5 w-5 text-accent" />
        What is Corridor Economics?
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
        <div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            Corridor economics maps the strategic flows of capital, technology, and expertise between regions to create competitive pathways. 
            Think of it as building bridges where others see barriers—transforming geopolitical friction into strategic advantage.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Capital Flows</span>
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Technology Transfer</span>
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Strategic Pathways</span>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Learn More from Leading Think Tanks
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Globe2 className="h-5 w-5 text-accent" />
                  Corridor Economics Research & Analysis
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Core Principles</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Strategic flow mapping between regions</li>
                      <li>• Geopolitical friction as opportunity</li>
                      <li>• Infrastructure-enabled competitive advantage</li>
                      <li>• Risk diversification through corridor development</li>
                      <li>• Technology and capital pathway optimization</li>
                    </ul>
                  </div>
                  <div>
                    <img 
                      src={corridorDiagram} 
                      alt="Corridor Economics Network Diagram"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Latest Research from Leading Think Tanks
                  </h4>
                  <div className="grid gap-4">
                    {thinkTankArticles.map((article, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{article.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{article.source}</Badge>
                                <span className="flex items-center gap-1 text-xs">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(article.publishDate).toLocaleDateString()}
                                </span>
                              </CardDescription>
                            </div>
                            <Button size="sm" variant="outline" asChild>
                              <a href={article.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
                          <div className="flex flex-wrap gap-1">
                            {article.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-accent/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Strategic Applications</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-2">For Businesses:</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Supply chain diversification strategies</li>
                        <li>• Market entry pathway optimization</li>
                        <li>• Risk mitigation through corridor development</li>
                        <li>• Strategic partnership identification</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">For Policymakers:</h5>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Infrastructure investment prioritization</li>
                        <li>• Economic diplomacy strategy</li>
                        <li>• Regional development planning</li>
                        <li>• Trade agreement optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex justify-center">
          <img 
            src={corridorDiagram} 
            alt="Corridor Economics Network Diagram showing strategic flows between global regions"
            className="w-full max-w-sm rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
};