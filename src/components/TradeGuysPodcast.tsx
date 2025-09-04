import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, Headphones } from "lucide-react";

export function TradeGuysPodcast() {
  const podcastInfo = {
    title: "Trade Guys",
    hosts: "Bill Reinsch and Scott Miller", 
    description: "Trade Guys is a weekly CSIS podcast hosted by Bill Reinsch and Scott Miller, offering strategic insights on international trade policy, geopolitical developments, and economic corridors.",
    organization: "Center for Strategic & International Studies",
    spotifyEmbed: "https://open.spotify.com/embed/show/7JjuE1cjlMgE8AZvH9H1pi",
    links: {
      apple: "https://podcasts.apple.com/us/podcast/the-trade-guys/id1380336613",
      csis: "https://www.csis.org/podcasts/trade-guys"
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          Trade Guys Podcast
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Headphones className="h-4 w-4" />
          <span>Hosted by {podcastInfo.hosts}</span>
          <Badge variant="outline" className="text-xs">CSIS</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {podcastInfo.description}
        </p>

        {/* Spotify Embed */}
        <div className="bg-gradient-to-br from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Play className="h-4 w-4 text-green-600" />
            Listen on Spotify
          </h4>
          <div className="rounded-lg overflow-hidden">
            <iframe
              src={`${podcastInfo.spotifyEmbed}?utm_source=generator`}
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen={true}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
              title="Spotify Podcast Player"
            ></iframe>
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="font-semibold mb-3">Listen on Other Platforms</h4>
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" size="sm" asChild>
              <a 
                href={podcastInfo.links.apple} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Listen on Apple Podcasts
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={podcastInfo.links.csis} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                View on CSIS Website
              </a>
            </Button>
          </div>
        </div>

        {/* Corridor Economics Relevance */}
        <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
          <h4 className="font-semibold text-accent mb-2">Corridor Economics Relevance</h4>
          <p className="text-sm text-muted-foreground">
            The Trade Guys podcast provides essential insights into global trade policy developments 
            that directly impact corridor economics strategies. Their analysis of trade relationships, 
            policy changes, and geopolitical developments helps inform strategic corridor planning.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}