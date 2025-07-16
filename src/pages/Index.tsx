import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";
import SectionNavigator from "@/components/SectionNavigator";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { SocialMediaFeed } from "@/components/SocialMediaFeed";
import Footer from "@/components/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  const { track } = useAnalytics();

  const sections = [
    { id: "hero", title: "Home" },
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
        <section id="social-insights" aria-label="Social media insights" className="container mx-auto px-6">
          <SocialMediaFeed showFeaturedOnly={true} limit={6} showTitle={false} />
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
      
      <SectionNavigator sections={sections} />
      <Footer />
      <PerformanceMonitor />
    </div>
  );
};

export default Index;
