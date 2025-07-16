import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";
import SectionNavigator from "@/components/SectionNavigator";

const Index = () => {
  const sections = [
    { id: "hero", title: "Home" },
    { id: "about", title: "About" },
    { id: "services", title: "Services" },
    { id: "experience", title: "Experience" },
    { id: "contact", title: "Contact" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div id="hero">
        <Hero />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="services">
        <Services />
      </div>
      <div id="experience">
        <Experience />
      </div>
      <div id="contact">
        <Contact />
      </div>
      <SectionNavigator sections={sections} />
    </div>
  );
};

export default Index;
