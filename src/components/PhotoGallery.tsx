import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Users, Camera, MapPin, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoGalleryProps {
  vipPhotos?: string[];
  eventPhotos?: string[];
  compact?: boolean;
}

interface Photo {
  id: string;
  url: string;
  caption: string;
  date: string;
  location: string;
  tags: string[];
  type: "vip" | "event";
}

const samplePhotos: Photo[] = [
  {
    id: "1",
    url: "/api/placeholder/400/300",
    caption: "Strategic dialogue with Ambassador Rodriguez at NATO Summit 2024",
    date: "2024-07-15",
    location: "Washington, D.C.",
    tags: ["NATO", "Defense", "Diplomacy"],
    type: "vip"
  },
  {
    id: "2", 
    url: "/api/placeholder/400/300",
    caption: "Panel discussion on Baltic-Caribbean trade corridors",
    date: "2024-06-20",
    location: "Miami, FL",
    tags: ["Trade", "Infrastructure", "Economic Development"],
    type: "event"
  },
  {
    id: "3",
    url: "/api/placeholder/400/300", 
    caption: "Meeting with Minister Kowalski on Central European logistics",
    date: "2024-05-18",
    location: "Warsaw, Poland",
    tags: ["Logistics", "Poland", "Government"],
    type: "vip"
  },
  {
    id: "4",
    url: "/api/placeholder/400/300",
    caption: "Concordia Americas Summit - Future of Western Hemisphere",
    date: "2024-04-25",
    location: "Miami, FL", 
    tags: ["Concordia", "Summit", "Americas"],
    type: "event"
  },
  {
    id: "5",
    url: "/api/placeholder/400/300",
    caption: "Strategic briefing with General Thompson, SOUTHCOM",
    date: "2024-03-30",
    location: "Miami, FL",
    tags: ["SOUTHCOM", "Defense", "Strategy"],
    type: "vip"
  },
  {
    id: "6",
    url: "/api/placeholder/400/300",
    caption: "World Affairs Council board meeting",
    date: "2024-03-15",
    location: "Miami, FL",
    tags: ["World Affairs", "Board", "Leadership"],
    type: "event"
  }
];

export function PhotoGallery({ vipPhotos, eventPhotos, compact = false }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | "vip" | "event">("all");
  const [currentIndex, setCurrentIndex] = useState(0);

  // If compact mode with specific photos
  if (compact && (vipPhotos || eventPhotos)) {
    const allPhotos = [
      ...(vipPhotos || []).map((url, index) => ({ url, type: "vip" as const, id: `vip-${index}` })),
      ...(eventPhotos || []).map((url, index) => ({ url, type: "event" as const, id: `event-${index}` }))
    ];

    return (
      <div className="flex gap-2">
        {allPhotos.slice(0, 3).map((photo, index) => (
          <div key={photo.id} className="relative group">
            <img 
              src={photo.url} 
              alt={`${photo.type} photo`}
              className="w-16 h-16 object-cover rounded-lg cursor-pointer transition-transform hover:scale-105"
            />
            <div className="absolute top-1 right-1">
              <Badge variant="secondary" className="text-xs">
                {photo.type === "vip" ? <Users className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
              </Badge>
            </div>
          </div>
        ))}
        {allPhotos.length > 3 && (
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
            +{allPhotos.length - 3}
          </div>
        )}
      </div>
    );
  }

  // Full gallery mode
  const filteredPhotos = selectedType === "all" 
    ? samplePhotos 
    : samplePhotos.filter(photo => photo.type === selectedType);

  const openLightbox = (photo: Photo) => {
    setSelectedPhoto(photo);
    setCurrentIndex(filteredPhotos.findIndex(p => p.id === photo.id));
  };

  const nextPhoto = () => {
    const nextIndex = (currentIndex + 1) % filteredPhotos.length;
    setCurrentIndex(nextIndex);
    setSelectedPhoto(filteredPhotos[nextIndex]);
  };

  const prevPhoto = () => {
    const prevIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setCurrentIndex(prevIndex);
    setSelectedPhoto(filteredPhotos[prevIndex]);
  };

  return (
    <section className="mt-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-3xl font-bold text-foreground mb-2">Gallery</h3>
          <p className="text-muted-foreground">
            Strategic meetings, events, and diplomatic engagements
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
            size="sm"
          >
            All
          </Button>
          <Button
            variant={selectedType === "vip" ? "default" : "outline"}
            onClick={() => setSelectedType("vip")}
            size="sm"
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            VIP Meetings
          </Button>
          <Button
            variant={selectedType === "event" ? "default" : "outline"}
            onClick={() => setSelectedType("event")}
            size="sm"
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            Events
          </Button>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <Card 
            key={photo.id} 
            className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => openLightbox(photo)}
          >
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={photo.url} 
                alt={photo.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-1">
                  {photo.type === "vip" ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {photo.type === "vip" ? "VIP Meeting" : "Event"}
                  </Badge>
                </div>
                <p className="text-sm font-medium line-clamp-2">{photo.caption}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/80">
                  <MapPin className="h-3 w-3" />
                  <span>{photo.location}</span>
                  <Calendar className="h-3 w-3 ml-2" />
                  <span>{new Date(photo.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          {selectedPhoto && (
            <div className="relative w-full h-full bg-black">
              {/* Navigation */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={prevPhoto}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={nextPhoto}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Image */}
              <div className="w-full h-3/4 flex items-center justify-center">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.caption}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Info Panel */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  {selectedPhoto.type === "vip" ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                  <Badge variant="secondary">
                    {selectedPhoto.type === "vip" ? "VIP Meeting" : "Event"}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{selectedPhoto.caption}</h3>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedPhoto.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedPhoto.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {selectedPhoto.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-white border-white/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}