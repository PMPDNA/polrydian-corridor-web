import { Navigation } from "@/components/Navigation";
import { About } from "@/components/About";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <About />
      <Footer />
    </div>
  );
}