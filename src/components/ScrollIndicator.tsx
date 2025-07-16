import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function ScrollIndicator() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll Down Indicator - Shows at top of page */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <div className="animate-bounce">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollDown}
            className="rounded-full p-2 bg-background/80 backdrop-blur-sm border-accent/20 hover:bg-accent/10"
          >
            <ChevronDown className="h-4 w-4 text-accent" />
          </Button>
        </div>
      </div>

      {/* Scroll to Top Button - Shows after scrolling */}
      {showScrollTop && (
        <div className="fixed bottom-8 right-8 z-40">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="rounded-full p-3 bg-background/80 backdrop-blur-sm border-accent/20 hover:bg-accent/10 shadow-lg animate-fade-in"
          >
            <ChevronUp className="h-5 w-5 text-accent" />
          </Button>
        </div>
      )}
    </>
  );
}