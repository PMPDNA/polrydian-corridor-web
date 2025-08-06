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
        title: 'Global Capital Flows and Financial Stability',
        source: 'Brookings Institution',
        url: 'https://www.brookings.edu/research/global-capital-flows/',
        summary: 'Analysis of how international capital movements affect global financial stability.'
      },
      {
        title: 'Capital Controls and Financial Stability',
        source: 'Center for Strategic & International Studies',
        url: 'https://www.csis.org/analysis/capital-controls',
        summary: 'Examining the effectiveness of capital controls in managing financial flows.'
      },
      {
        title: 'International Capital Flows Database',
        source: 'OECD',
        url: 'https://www.oecd.org/finance/international-capital-flows.htm',
        summary: 'Comprehensive data on international capital movements and policy implications.'
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
        title: 'Technology Transfer and Innovation Policy',
        source: 'Brookings Institution',
        url: 'https://www.brookings.edu/research/technology-transfer/',
        summary: 'Research on policies that facilitate effective technology transfer between institutions.'
      },
      {
        title: 'Global Technology Competition',
        source: 'Center for Strategic & International Studies',
        url: 'https://www.csis.org/programs/strategic-technologies-program',
        summary: 'Analysis of strategic technology competition and its geopolitical implications.'
      },
      {
        title: 'Innovation and Technology Transfer',
        source: 'OECD',
        url: 'https://www.oecd.org/innovation/',
        summary: 'OECD insights on innovation systems and technology diffusion.'
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
        title: 'Strategic Infrastructure and Economic Security',
        source: 'Center for Strategic & International Studies',
        url: 'https://www.csis.org/programs/economics-program',
        summary: 'Analysis of how infrastructure investments affect economic and national security.'
      },
      {
        title: 'Global Infrastructure and Economic Development',
        source: 'Brookings Institution',
        url: 'https://www.brookings.edu/research/infrastructure/',
        summary: 'Research on infrastructure investment and its impact on economic development.'
      },
      {
        title: 'Strategic Trade and Economic Corridors',
        source: 'OECD',
        url: 'https://www.oecd.org/trade/',
        summary: 'OECD analysis of trade routes and economic corridor development.'
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
              <FredDataDisplay 
                seriesIds={data.fredSeries} 
                showControls={false}
              />
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