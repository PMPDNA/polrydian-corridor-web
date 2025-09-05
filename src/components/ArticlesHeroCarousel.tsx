import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  content?: string;
  meta_description?: string;
  featured_image: string;
  slug?: string;
  category?: string;
  published_at?: string;
  created_at: string;
  reading_time_minutes?: number;
}

interface ArticlesHeroCarouselProps {
  articles: Article[];
}

export function ArticlesHeroCarousel({ articles }: ArticlesHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || articles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === articles.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [articles.length, isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? articles.length - 1 : currentIndex - 1);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === articles.length - 1 ? 0 : currentIndex + 1);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (content?: string, metaDescription?: string) => {
    if (metaDescription) return metaDescription;
    if (!content) return "Expert analysis transforming complexity into strategic clarity...";
    return content.replace(/<[^>]*>/g, '').substring(0, 200) + "...";
  };

  const getCategoryLabel = (category?: string) => {
    const categoryMap: Record<string, string> = {
      'geopolitics': 'Geopolitics',
      'strategy': 'Strategy', 
      'ma': 'M&A',
      'philosophy': 'Philosophy',
      'deep_tech': 'Deep Tech',
      'defense': 'Defense',
      'corridor_economics': 'Corridor Economics',
      'supply_chain': 'Supply Chain',
      'market_analysis': 'Market Analysis'
    };
    return categoryMap[category || ''] || 'Strategy';
  };

  if (!articles.length) return null;

  const currentArticle = articles[currentIndex];

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl shadow-2xl mb-16">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${currentArticle.featured_image})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        {articles.length > 1 && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        )}
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-8 max-w-4xl">
          <div className="max-w-2xl text-white space-y-6">
            {/* Category Badge */}
            <Badge 
              variant="secondary" 
              className="bg-primary/90 text-primary-foreground hover:bg-primary font-semibold text-sm px-4 py-2"
            >
              {getCategoryLabel(currentArticle.category)}
            </Badge>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight text-white drop-shadow-lg">
              {currentArticle.title}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-xl drop-shadow-sm">
              {getExcerpt(currentArticle.content, currentArticle.meta_description)}
            </p>

            {/* Meta Information */}
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Patrick Misiewicz</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(currentArticle.published_at || currentArticle.created_at)}</span>
              </div>
              {currentArticle.reading_time_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{currentArticle.reading_time_minutes} min read</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Button 
                asChild 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/articles/${currentArticle.slug || currentArticle.id}`}>
                  Read Full Analysis
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Only show if more than 1 article */}
      {articles.length > 1 && (
        <>
          {/* Previous/Next Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300 hover:scale-110"
            aria-label="Previous article"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300 hover:scale-110"
            aria-label="Next article"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 10000);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white shadow-lg scale-110' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to article ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div 
              className={`h-full bg-primary transition-all duration-300 ${
                isAutoPlaying ? 'animate-pulse' : ''
              }`}
              style={{
                width: isAutoPlaying ? '100%' : '0%'
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}