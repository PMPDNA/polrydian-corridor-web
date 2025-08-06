import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen, Users, Building, TrendingUp } from 'lucide-react';

interface ThinkTankSource {
  name: string;
  url: string;
  description: string;
  specialty: string;
  articles: {
    title: string;
    url: string;
    description: string;
    topic: string;
  }[];
}

const thinkTankSources: ThinkTankSource[] = [
  {
    name: "Center for Strategic and International Studies (CSIS)",
    url: "https://www.csis.org",
    description: "Leading research institution on global security and economic policy",
    specialty: "Trade Policy & Supply Chain Resilience",
    articles: [
      {
        title: "Supply Chain Resilience: Mapping Corridors of Trade",
        url: "https://www.csis.org/programs/economics-program/supply-chain-security",
        description: "Analysis of global supply chain vulnerabilities and strategic trade corridors",
        topic: "corridor-economics"
      },
      {
        title: "The Trade Wars: Implications for Global Commerce",
        url: "https://www.csis.org/analysis/trade-wars",
        description: "Impact of trade disputes on global economic corridors",
        topic: "trade-policy"
      },
      {
        title: "China's Belt and Road Initiative: Economic Corridors",
        url: "https://www.csis.org/programs/china-power-project/belt-and-road-tracker",
        description: "Strategic analysis of China's infrastructure and trade corridor development",
        topic: "geopolitics"
      }
    ]
  },
  {
    name: "Brookings Institution",
    url: "https://www.brookings.edu",
    description: "Independent research on economic policy and global governance",
    specialty: "Economic Development & Innovation",
    articles: [
      {
        title: "Economic Corridors and Regional Development",
        url: "https://www.brookings.edu/research/economic-corridors/",
        description: "Research on how economic corridors drive regional development and connectivity",
        topic: "corridor-economics"
      },
      {
        title: "Technology Transfer and Innovation Ecosystems",
        url: "https://www.brookings.edu/topic/technology-innovation/",
        description: "Analysis of technology flows across borders and innovation hubs",
        topic: "technology-transfer"
      },
      {
        title: "Global Trade and Economic Integration",
        url: "https://www.brookings.edu/topic/trade/",
        description: "Policy research on trade integration and economic partnerships",
        topic: "trade-policy"
      }
    ]
  },
  {
    name: "Organisation for Economic Co-operation and Development (OECD)",
    url: "https://www.oecd.org",
    description: "International economic research and policy recommendations",
    specialty: "Economic Analysis & Statistics",
    articles: [
      {
        title: "OECD Economic Outlook: Global Trade Flows",
        url: "https://www.oecd.org/economic-outlook/",
        description: "Comprehensive analysis of global economic trends and trade patterns",
        topic: "economic-data"
      },
      {
        title: "Trade in Value Added Database",
        url: "https://www.oecd.org/sti/ind/measuring-trade-in-value-added.htm",
        description: "Statistical analysis of global value chains and trade flows",
        topic: "corridor-economics"
      },
      {
        title: "Digital Economy Outlook",
        url: "https://www.oecd.org/digital/oecd-digital-economy-outlook-2020-bb167041-en.htm",
        description: "Research on digital transformation and cross-border data flows",
        topic: "technology-transfer"
      }
    ]
  },
  {
    name: "World Economic Forum",
    url: "https://www.weforum.org",
    description: "Global platform for public-private cooperation on economic issues",
    specialty: "Strategic Partnerships & Future of Work",
    articles: [
      {
        title: "The Future of Supply Chains",
        url: "https://www.weforum.org/agenda/supply-chains/",
        description: "Strategic insights on supply chain transformation and resilience",
        topic: "corridor-economics"
      },
      {
        title: "Fourth Industrial Revolution and Trade",
        url: "https://www.weforum.org/centre-for-the-fourth-industrial-revolution/",
        description: "Impact of emerging technologies on global trade patterns",
        topic: "technology-transfer"
      },
      {
        title: "Strategic Intelligence on Geopolitics",
        url: "https://intelligence.weforum.org/topics/a1G0X000006O6EHUA0",
        description: "Comprehensive analysis of geopolitical trends affecting global economics",
        topic: "geopolitics"
      }
    ]
  }
];

interface LearnMoreModalProps {
  children: React.ReactNode;
}

export function LearnMoreModal({ children }: LearnMoreModalProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const topics = [
    { id: 'all', label: 'All Topics', icon: BookOpen },
    { id: 'corridor-economics', label: 'Corridor Economics', icon: TrendingUp },
    { id: 'trade-policy', label: 'Trade Policy', icon: Building },
    { id: 'technology-transfer', label: 'Technology Transfer', icon: Users },
    { id: 'geopolitics', label: 'Geopolitics', icon: ExternalLink }
  ];

  const filteredArticles = selectedTopic === 'all' 
    ? thinkTankSources.flatMap(source => 
        source.articles.map(article => ({
          ...article,
          sourceName: source.name,
          sourceUrl: source.url
        }))
      )
    : thinkTankSources.flatMap(source => 
        source.articles
          .filter(article => article.topic === selectedTopic)
          .map(article => ({
            ...article,
            sourceName: source.name,
            sourceUrl: source.url
          }))
      );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Research from Leading Think Tanks</DialogTitle>
          <DialogDescription>
            Curated insights from CSIS, Brookings, OECD, and other leading institutions 
            on corridor economics, trade policy, and strategic pathways.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Topic Filter */}
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Button
                key={topic.id}
                variant={selectedTopic === topic.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTopic(topic.id)}
                className="flex items-center gap-2"
              >
                <topic.icon className="h-4 w-4" />
                {topic.label}
              </Button>
            ))}
          </div>

          {/* Think Tank Sources */}
          <div className="grid gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Research Institutions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {thinkTankSources.map((source, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-start justify-between">
                        <span className="flex-1">{source.name}</span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {source.description}
                      </CardDescription>
                      <Badge variant="secondary" className="text-xs w-fit">
                        {source.specialty}
                      </Badge>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            {/* Filtered Articles */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Research Articles {selectedTopic !== 'all' && `- ${topics.find(t => t.id === selectedTopic)?.label}`}
              </h3>
              <div className="space-y-4">
                {filteredArticles.map((article, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-2">
                            {article.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {article.sourceName}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {topics.find(t => t.id === article.topic)?.label || article.topic}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Read
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Commentary Section */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Corridor Economics Commentary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  These research institutions provide critical insights into how economic corridors, 
                  technology transfer, and strategic pathways shape global commerce. Their analysis 
                  helps organizations understand:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• How supply chain resilience impacts regional economic development</li>
                  <li>• The role of technology transfer in creating competitive advantages</li>
                  <li>• Strategic implications of trade policy on corridor economics</li>
                  <li>• Geopolitical factors influencing global value chains</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <Button asChild>
                    <a href="/schedule">
                      Discuss Strategic Applications
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}