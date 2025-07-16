import Footer from "@/components/Footer";
import SectionNavigator from "@/components/SectionNavigator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import CalendlyPopup from "@/components/CalendlyPopup";
import { 
  HelpCircle, 
  Clock, 
  DollarSign, 
  Globe, 
  Shield,
  Target,
  MessageCircle
} from "lucide-react";

export default function FAQ() {
  const faqCategories = [
    {
      title: "Corridor Economics Methodology",
      icon: Target,
      faqs: [
        {
          question: "What exactly is corridor economics?",
          answer: "Corridor economics is a strategic methodology that recognizes every business challenge exists within a network of interconnected relationships, dependencies, and opportunities. Rather than treating problems in isolation, we map these 'corridors' to reveal pathways that transform obstacles into competitive advantages. It's based on the principle that what stands in the way becomes the way."
        },
        {
          question: "How does corridor economics differ from traditional consulting?",
          answer: "Traditional consulting often treats challenges as isolated problems with linear solutions. Corridor economics recognizes that in today's interconnected world, every challenge is part of a complex system. We map these systems to find strategic pathways that others miss—turning your greatest obstacles into your most decisive advantages."
        },
        {
          question: "Can you provide a simple example of corridor economics in action?",
          answer: "Consider a company facing regulatory barriers in a new market. Traditional consulting might focus on compliance strategies. Corridor economics would map the entire regulatory ecosystem—identifying which barriers connect to partnership opportunities, which compliance requirements create competitive moats, and how regulatory relationships open pathways to other markets. The barrier becomes a strategic corridor."
        }
      ]
    },
    {
      title: "Service Delivery",
      icon: Clock,
      faqs: [
        {
          question: "What's included in a strategic consultation?",
          answer: "Our strategic consultations include: initial strategic discovery sessions, comprehensive corridor mapping of your challenges, identification of strategic pathways and opportunities, development of actionable implementation roadmaps, and ongoing advisory support. Each engagement is customized to your specific strategic challenges."
        },
        {
          question: "How long does a typical engagement last?",
          answer: "Engagement timelines vary based on complexity and scope. Strategic consultations typically range from 2-6 weeks, while comprehensive corridor economics advisory projects can take 4-8 weeks. Complex initiatives like M&A support or market entry strategies may extend 6-12 weeks. We'll provide a detailed timeline during our initial consultation."
        },
        {
          question: "Do you work with companies of all sizes?",
          answer: "We work with organizations ranging from growth-stage companies to Fortune 500 enterprises. Our corridor economics methodology scales to address challenges of varying complexity. Whether you're navigating rapid growth, entering new markets, or managing complex transformations, we tailor our approach to your organization's size and strategic needs."
        },
        {
          question: "What level of involvement do you require from our team?",
          answer: "We believe in collaborative strategy development. Typically, we need access to key stakeholders for discovery sessions, regular check-ins with executive leadership, and coordination with relevant department heads. The goal is to build internal capability while delivering external expertise—ensuring sustainable strategic thinking beyond our engagement."
        }
      ]
    },
    {
      title: "Investment & Pricing",
      icon: DollarSign,
      faqs: [
        {
          question: "How is pricing structured?",
          answer: "Our pricing is project-based and reflects the scope and complexity of your strategic challenges. Strategic consultations start at $15,000, while comprehensive corridor economics advisory begins at $25,000. Complex engagements like M&A support or multi-market strategies are priced based on specific requirements. We provide transparent, fixed-fee proposals after our initial consultation."
        },
        {
          question: "What determines the investment level?",
          answer: "Investment levels are determined by factors including: scope and complexity of strategic challenges, number of stakeholders and markets involved, timeline requirements, level of ongoing support needed, and depth of corridor analysis required. We believe in transparent pricing that reflects the strategic value delivered."
        },
        {
          question: "Do you offer retainer arrangements?",
          answer: "Yes, we offer ongoing strategic advisory retainers for organizations requiring continuous corridor economics guidance. These arrangements are ideal for companies navigating ongoing complex challenges, rapid growth, or dynamic market conditions. Retainer terms are customized based on your strategic advisory needs."
        },
        {
          question: "What's the ROI of corridor economics consulting?",
          answer: "Our clients typically see measurable returns through: accelerated decision-making (reducing time-to-market by 30-60%), identification of previously hidden opportunities, improved strategic execution success rates, and transformation of obstacles into competitive advantages. Specific ROI varies by engagement, but the strategic clarity and opportunity identification consistently deliver value multiples above investment."
        }
      ]
    },
    {
      title: "Global Operations",
      icon: Globe,
      faqs: [
        {
          question: "In which countries do you operate?",
          answer: "We operate across 60+ countries with deep expertise in major global markets including North America, Europe, Asia-Pacific, Latin America, and emerging markets. Our global perspective is essential to corridor economics—understanding how local dynamics connect to global opportunities and how regional challenges create international pathways."
        },
        {
          question: "How do you handle different regulatory environments?",
          answer: "Regulatory complexity is often where the most valuable corridors exist. We have extensive experience navigating diverse regulatory environments and often work with local legal and regulatory partners. Our corridor economics approach specifically excels at identifying how regulatory challenges in one jurisdiction create competitive advantages or partnership opportunities in others."
        },
        {
          question: "Do you provide local market expertise?",
          answer: "Absolutely. Our global network includes local market experts and strategic partners across our operating regions. We combine high-level corridor economics methodology with deep local market knowledge, ensuring strategies are both globally coherent and locally executable."
        }
      ]
    },
    {
      title: "Confidentiality & Security",
      icon: Shield,
      faqs: [
        {
          question: "How do you protect confidential information?",
          answer: "We maintain the highest standards of confidentiality. All communications are protected under professional advisory privilege. We sign comprehensive NDAs before any substantive discussions, maintain secure communication protocols, and follow strict information security practices. Your strategic information is treated with absolute confidentiality."
        },
        {
          question: "What security measures do you have in place?",
          answer: "Our security measures include: encrypted communication channels, secure document sharing platforms, restricted access protocols, comprehensive data protection policies, and regular security audits. We understand that strategic information is your most valuable asset and protect it accordingly."
        },
        {
          question: "Can you work with sensitive or regulated industries?",
          answer: "Yes, we have extensive experience with regulated industries including financial services, healthcare, defense, and energy. We understand the unique confidentiality and compliance requirements these sectors demand and have appropriate security clearances and protocols in place where required."
        }
      ]
    }
  ];

  const sections = [
    { id: "hero", title: "Overview" },
    { id: "faq-categories", title: "FAQ Categories" },
    { id: "contact", title: "Contact" },
    { id: "resources", title: "Resources" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <div id="hero" className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about corridor economics, our methodology, 
            and how we transform strategic challenges into competitive advantages.
          </p>
        </div>

        {/* FAQ Categories */}
        <div id="faq-categories" className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <category.icon className="h-6 w-6 text-accent" />
                  </div>
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border-border"
                    >
                      <AccordionTrigger className="text-left text-foreground hover:text-accent transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Contact */}
        <Card id="contact" className="shadow-elegant bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-accent/20">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-accent/10 rounded-full">
                  <MessageCircle className="h-8 w-8 text-accent" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Still Have Questions?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Every strategic challenge is unique. If you don't see your question answered here, 
                  let's discuss your specific situation and how corridor economics can help.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CalendlyPopup
                  calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
                  buttonText="Schedule Free Consultation"
                  variant="default"
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                />
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.href = "mailto:info@polrydian.com"}
                >
                  Email Us Directly
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div id="resources" className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-elegant">
            <CardContent className="p-6 text-center space-y-4">
              <div className="p-3 bg-accent/10 rounded-lg inline-block">
                <HelpCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Need More Details?</h3>
              <p className="text-sm text-muted-foreground">
                Explore our insights section for in-depth articles on corridor economics methodology.
              </p>
              <Button variant="outline" size="sm">
                Browse Insights
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="p-6 text-center space-y-4">
              <div className="p-3 bg-accent/10 rounded-lg inline-block">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Urgent Matters</h3>
              <p className="text-sm text-muted-foreground">
                For time-sensitive strategic challenges, contact us directly at +1 305 878 6400.
              </p>
              <Button variant="outline" size="sm">
                Call Now
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-elegant">
            <CardContent className="p-6 text-center space-y-4">
              <div className="p-3 bg-accent/10 rounded-lg inline-block">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Strategic Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Take our strategic readiness assessment to identify your corridor opportunities.
              </p>
              <Button variant="outline" size="sm">
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <SectionNavigator sections={sections} />
      <Footer />
    </div>
  );
}