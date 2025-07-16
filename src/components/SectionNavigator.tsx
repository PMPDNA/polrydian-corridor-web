import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface SectionNavigatorProps {
  sections: { id: string; title: string }[];
}

export default function SectionNavigator({ sections }: SectionNavigatorProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Set initial active section
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToNext = () => {
    const currentIndex = sections.findIndex(section => section.id === activeSection);
    const nextIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
    scrollToSection(sections[nextIndex].id);
  };

  return (
    <>
      {/* Section Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 space-y-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`w-3 h-3 rounded-full border-2 transition-all duration-300 hover:scale-125 ${
              activeSection === section.id
                ? 'bg-accent border-accent'
                : 'bg-transparent border-accent/40 hover:border-accent'
            }`}
            title={section.title}
          />
        ))}
      </div>

      {/* Next Section Button */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollToNext}
          className="rounded-full px-4 py-2 bg-background/80 backdrop-blur-sm border-accent/20 hover:bg-accent/10 animate-bounce"
        >
          <span className="text-xs text-accent mr-2">Next Section</span>
          <ChevronDown className="h-4 w-4 text-accent" />
        </Button>
      </div>
    </>
  );
}