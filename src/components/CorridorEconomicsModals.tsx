import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, Globe, ArrowRightLeft } from "lucide-react";
import { FredDataDisplay } from "@/components/FredDataDisplay";

interface CorridorModalProps {
  type: 'capital-flows' | 'technology-transfer' | 'strategic-pathways';
  children: React.ReactNode;
}

const corridorData = {
  'capital-flows': {
    title: 'Capital Flows Analysis',
    icon: TrendingUp,
    description: 'Understanding cross-border financial movements and their strategic implications',
    overview: 'Capital flows represent the movement of money across borders for investment, trade, or business operations. In corridor economics, we analyze these flows to identify strategic opportunities and risks in global financial networks.',
    keyMetrics: [
      'Foreign Direct Investment (FDI)',
      'Portfolio Investment Flows',
      'Cross-border Banking Flows',
      'Reserve Currency Dynamics'
    ],
    thinkTankResources: [
      {
        title: 'Global Financial Stability and Cross-Border Capital Flows',
        source: 'Brookings Institution',
        url: 'https://www.brookings.edu/articles/global-financial-stability-and-cross-border-capital-flows/',
        summary: 'Analysis of how international capital movements affect global financial stability and policy responses.'
      },
      {
        title: 'Economics Program: Capital Markets and Financial Flows',
        source: 'Center for Strategic & International Studies',
        url: 'https://www.csis.org/programs/economics-program',
        summary: 'CSIS analysis of capital market developments and their strategic implications for economic security.'
      },
      {
        title: 'International Direct Investment Statistics',
        source: 'OECD',
        url: 'https://www.oecd.org/investment/statistics.htm',
        summary: 'Comprehensive OECD data and analysis on foreign direct investment flows and policies.'
      },
      {
        title: 'Global Capital Flows and Exchange Rates',
        source: 'Peterson Institute for International Economics',
        url: 'https://www.piie.com/research/topics/international-finance-and-macroeconomics',
        summary: 'PIIE research on international capital flows, exchange rate dynamics, and monetary policy coordination.'
      }
    ],
    fredSeries: ['GDP', 'FEDFUNDS', 'CPIAUCSL']
  },
  'technology-transfer': {
    title: 'Technology Transfer Corridors',
    icon: Globe,
    description: 'Mapping innovation pathways and knowledge flows across global networks',
    overview: 'Technology transfer corridors facilitate the movement of innovation, knowledge, and technological capabilities between regions. These pathways are critical for economic development and competitive advantage.',
    keyMetrics: [
      'R&D Investment Flows',
      'Patent Application Trends',
      'Tech Talent Migration',
      'Innovation Ecosystem Connectivity'
    ],
    thinkTankResources: [
      {
        title: 'Innovation and Technology Transfer in the Global Economy',
        source: 'Brookings Institution',
        url: 'https://www.brookings.edu/topic/technology-innovation/',
        summary: 'Research on innovation ecosystems, technology transfer mechanisms, and digital transformation policies.'
      },
      {
        title: 'Strategic Technologies Program',
        source: 'Center for Strategic & International Studies',
        url: 'https://www.csis.org/programs/strategic-technologies-program',
        summary: 'Analysis of emerging technologies, tech competition, and innovation policy in strategic sectors.'
      },
      {
        title: 'OECD Science, Technology and Innovation Indicators',
        source: 'OECD',
        url: 'https://www.oecd.org/sti/inno/',
        summary: 'Comprehensive data on R&D investment, patent flows, and innovation performance across countries.'
      },
      {
        title: 'Technology Transfer and Industrial Policy',
        source: 'Peterson Institute for International Economics',
        url: 'https://www.piie.com/research/topics/trade-and-globalization',
        summary: 'PIIE analysis of technology transfer policies, industrial strategy, and global value chains.'
      }
    ],
    fredSeries: ['INDPRO', 'RSXFS', 'HOUST']
  },
  'strategic-pathways': {
    title: 'Strategic Pathways Development',
    icon: ArrowRightLeft,
    description: 'Identifying and developing resilient corridors for sustainable growth',
    overview: 'Strategic pathways represent the deliberate development of economic, political, and infrastructure corridors that enhance resilience and create sustainable competitive advantages.',
    keyMetrics: [
      'Infrastructure Investment',
      'Trade Route Efficiency',
      'Supply Chain Resilience',
      'Geopolitical Risk Assessment'
    ],
    thinkTankResources: [
      {
        title: 'Economics Program: Infrastructure and Economic Security',
        source: 'Center for Strategic & International Studies',
        url: 'https://www.csis.org/programs/economics-program',
        summary: 'CSIS analysis of strategic infrastructure development and its implications for economic and national security.'
      },
      {
        title: 'Global Infrastructure Initiative',
        source: 'Brookings Institution',
        url: 'https://www.brookings.edu/topic/infrastructure/',
        summary: 'Research on infrastructure investment, financing mechanisms, and development impact across regions.'
      },
      {
        title: 'Trade and Economic Corridors Development',
        source: 'OECD',
        url: 'https://www.oecd.org/trade/topics/trade-facilitation/',
        summary: 'OECD insights on trade facilitation, corridor development, and regional economic integration.'
      },
      {
        title: 'Strategic Economic Pathways and Supply Chain Resilience',
        source: 'Peterson Institute for International Economics',
        url: 'https://www.piie.com/research/topics/trade-and-globalization',
        summary: 'PIIE research on supply chain resilience, economic corridors, and strategic trade relationships.'
      }
    ],
    fredSeries: ['UMCSENT', 'HOUST', 'GDP']
  }
};

export function CorridorEconomicsModal({ type, children }: CorridorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const data = corridorData[type];
  const IconComponent = data.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <IconComponent className="h-8 w-8 text-accent" />
            {data.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {data.overview}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.description}
              </p>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics & Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.keyMetrics.map((metric, index) => (
                  <Badge key={index} variant="secondary" className="p-2 text-center">
                    {metric}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Economic Data */}
          <Card>
            <CardHeader>
              <CardTitle>Related Economic Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <FredDataDisplay />
            </CardContent>
          </Card>

          {/* Think Tank Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Research & Analysis from Leading Think Tanks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.thinkTankResources.map((resource, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {resource.summary}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {resource.source}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Read More
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Corridor Economics Commentary */}
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle>Corridor Economics Perspective</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                In corridor economics, we view {data.title.toLowerCase()} as interconnected pathways that transform 
                constraints into opportunities. By analyzing these flows systematically, we can identify strategic 
                intervention points that enhance resilience and create sustainable competitive advantages. 
                The research above provides the foundational understanding necessary for developing effective 
                corridor strategies in this domain.
              </p>
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm italic text-primary">
                  "What stands in the way becomes the way" - This Stoic principle guides our approach to 
                  transforming economic challenges into strategic pathways for growth and resilience.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}