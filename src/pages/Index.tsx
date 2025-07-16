import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";
import SectionNavigator from "@/components/SectionNavigator";
import { AccessibilityMenu } from "@/components/AccessibilityMenu";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  const { track } = useAnalytics();

  const sections = [
    { id: "hero", title: "Home" },
    { id: "about", title: "About" },
    { id: "services", title: "Services" },
    { id: "experience", title: "Experience" },
    { id: "contact", title: "Contact" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <a href="#hero" className="skip-link" onClick={() => track('skip_to_content')}>
        Skip to main content
      </a>
      
      <Navigation />
      
      <main role="main">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="about" aria-label="About section">
          <About />
        </section>
        <section id="services" aria-label="Services section">
          <Services />
        </section>
        <section id="experience" aria-label="Experience section">
          <Experience />
        </section>
        <section id="contact" aria-label="Contact section">
          <Contact />
        </section>
      </main>
      
      <AccessibilityMenu />
      <PerformanceMonitor />
    </div>
  );
};

export default Index;
