import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";
import SectionNavigator from "@/components/SectionNavigator";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { SearchComponent } from "@/components/SearchComponent";
import Footer from "@/components/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  const { track } = useAnalytics();

  const sections = [
    { id: "hero", title: "Home" },
    { id: "about", title: "About" },
    { id: "services", title: "Services" },
    { id: "experience", title: "Experience" },
    { id: "testimonials", title: "Testimonials" },
    { id: "search", title: "Search" },
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
        <section id="testimonials" aria-label="Testimonials section">
          <TestimonialsSection />
        </section>
        <section id="search" aria-label="Search section" className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Find What You Need
              </h2>
              <p className="text-lg text-muted-foreground">
                Search our services, insights, and strategic expertise
              </p>
            </div>
            <SearchComponent />
          </div>
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
