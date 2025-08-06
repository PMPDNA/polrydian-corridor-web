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
    spotifyEmbed: "https://open.spotify.com/embed/show/0HxEH4XajR7D9wvdJfE7lw",
    links: {
      spotify: "https://open.spotify.com/show/0HxEH4XajR7D9wvdJfE7lw",
      apple: "https://podcasts.apple.com/us/podcast/the-trade-guys/id1380336613",
      google: "https://music.youtube.com/playlist?list=PLnArnDQHeUqeQDLiQC8HIfBMF8dNS-1rS",
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
              src={podcastInfo.spotifyEmbed}
              width="100%"
              height="232"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="font-semibold mb-3">Listen on Other Platforms</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" asChild>
              <a 
                href={podcastInfo.links.apple} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Apple Podcasts
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={podcastInfo.links.google} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                Google/YouTube Music
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="col-span-2">
              <a 
                href={podcastInfo.links.csis} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
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