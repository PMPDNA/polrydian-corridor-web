import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Calendar, Clock, DollarSign } from "lucide-react";
import CalendlyPopup from "./CalendlyPopup";

export const PromotionalPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);

  useEffect(() => {
    const checkFirstTimeVisitor = async () => {
      try {
        // Check if user has seen the popup before
        const hasSeenPopup = localStorage.getItem('polrydian-promo-seen');
        
        if (!hasSeenPopup) {
          // Show popup after user scrolls 50% of the page or after reading content
          const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollPercent = scrollTop / (documentHeight - windowHeight);
            
            if (scrollPercent > 0.5) {
              setIsOpen(true);
              window.removeEventListener('scroll', handleScroll);
            }
          };

          // Also show after 30 seconds if user hasn't scrolled
          const timeoutId = setTimeout(() => {
            setIsOpen(true);
            window.removeEventListener('scroll', handleScroll);
          }, 30000);

          window.addEventListener('scroll', handleScroll);
          
          return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
          };
        }
      } catch (error) {
        console.error('Error checking visitor status:', error);
      }
    };

    checkFirstTimeVisitor();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('polrydian-promo-seen', 'true');
  };

  const handleSchedulePromo = () => {
    setShowCalendly(true);
    localStorage.setItem('polrydian-promo-seen', 'true');
  };

  if (showCalendly) {
    return (
      <CalendlyPopup
        calendlyUrl="https://calendly.com/patrickmisiewicz/30min-consultation?primary_color=8b5cf6"
        buttonText="Book Your $100 Consultation"
        prefill={{
          name: "",
          email: "",
          customAnswers: {
            "promotion": "6-month-special-100"
          }
        }}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            🎉 Limited Time Offer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="bg-accent/10 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-accent" />
                <span className="text-2xl font-bold text-accent">$100</span>
                <span className="text-sm text-muted-foreground line-through">$300</span>
              </div>
              <p className="text-sm text-muted-foreground">
                30-minute Strategic Consultation
              </p>
            </div>
            
            <h3 className="font-semibold text-foreground mb-2">
              Special 6-Month Promotion
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get expert strategic consulting for global business challenges at 67% off my regular rate.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-accent mb-4">
              <Clock className="h-4 w-4" />
              <span>Limited to first-time clients</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleSchedulePromo}
              className="w-full"
              size="lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Your $100 Consultation
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
          
          <p className="text-xs text-center text-muted-foreground">
            This offer expires in 6 months. Regular rate: $300/hour.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};