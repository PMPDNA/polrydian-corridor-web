import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Eye, 
  RotateCcw, 
  Download, 
  Upload,
  Edit3,
  FileText,
  Home,
  Briefcase,
  User,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WebsiteContent {
  hero: {
    quote: string;
    author: string;
    title: string;
    subtitle: string;
    description: string;
    primaryCTA: string;
    secondaryCTA: string;
    metrics: {
      countries: { value: string; label: string };
      projects: { value: string; label: string };
      partnerships: { value: string; label: string };
    };
  };
  about: {
    title: string;
    subtitle: string;
    intro: string;
    philosophy: string;
    background: string;
    academic: string;
    distinctions: string;
    disciplines: string;
  };
  services: {
    title: string;
    subtitle: string;
    services: {
      title: string;
      description: string;
      features: string[];
    }[];
  };
  experience: {
    title: string;
    subtitle: string;
    achievements: {
      year: string;
      title: string;
      description: string;
      impact: string;
    }[];
  };
  contact: {
    title: string;
    subtitle: string;
    info: {
      email: string;
      phone: string;
      location: string;
    };
    form: {
      title: string;
      subtitle: string;
    };
  };
}

const defaultContent: WebsiteContent = {
  hero: {
    quote: "The impediment to action advances action. What stands in the way becomes the way.",
    author: "Marcus Aurelius",
    title: "Strategic Clarity in Complex Times",
    subtitle: "Patrick Oscar Misiewicz",
    description: "Transforming geopolitical friction into sustainable pathways through corridor economics and disciplined strategic thinking.",
    primaryCTA: "Strategic Consultation",
    secondaryCTA: "View Portfolio",
    metrics: {
      countries: { value: "60+", label: "Countries Analyzed" },
      projects: { value: "150+", label: "Strategic Projects" },
      partnerships: { value: "25+", label: "Global Partnerships" }
    }
  },
  about: {
    title: "About Patrick Misiewicz",
    subtitle: "Strategic Philosophy & Background",
    intro: "I'm Patrick Oscar Misiewicz, founder of Polrydian Group, where my guiding principle is simple: transforming complexity and geopolitical friction into clear, actionable strategy.",
    philosophy: "My work centers on what I call corridor economics—the disciplined practice of mapping and managing strategic flows of capital, technology, policy, and expertise across critical global regions.",
    background: "Born in Florida and raised in Bydgoszcz, Poland, my earliest experiences involved navigating diverse cultural and economic contexts, laying the foundation for my professional approach.",
    academic: "Academic milestones—including a BA in International Economic Relations at the University of Gdańsk, an Erasmus scholarship in Amsterdam, and competitive study-abroad at Kyungpook National University in Daegu, South Korea—provided rigorous analytical grounding.",
    distinctions: "My professional trajectory consistently demonstrates the value of applying disciplined strategic clarity across complex, multi-regional challenges.",
    disciplines: "Chess sharpens my pattern recognition, sailing strengthens my adaptive decision-making, and daily Stoic journaling helps maintain clarity and composure in volatility."
  },
  services: {
    title: "Strategic Services",
    subtitle: "Comprehensive solutions for complex global challenges",
    services: [
      {
        title: "Corridor Economics",
        description: "Strategic mapping of capital, technology, and expertise flows across critical global regions.",
        features: ["Supply Chain Diversification", "Trade Route Optimization", "Economic Corridor Development"]
      },
      {
        title: "Geopolitical Strategy",
        description: "Navigate complex international landscapes with disciplined strategic frameworks.",
        features: ["Risk Assessment", "Policy Analysis", "Diplomatic Strategy"]
      },
      {
        title: "Infrastructure & M&A",
        description: "Structure complex multi-regional projects spanning energy, transportation, and digital infrastructure.",
        features: ["Deal Structuring", "Due Diligence", "Cross-Border Transactions"]
      }
    ]
  },
  experience: {
    title: "Professional Experience",
    subtitle: "Key achievements and strategic initiatives",
    achievements: [
      {
        year: "2024-2025",
        title: "Senior Adviser & Director, Zab Capital Holdings",
        description: "Structured complex, multi-regional projects spanning energy, transportation, and digital infrastructure across Africa, Europe, North America, and Latin America.",
        impact: "Led strategic initiatives across 4 continents"
      },
      {
        year: "2022-Present",
        title: "Board Director, World Affairs Council of Miami",
        description: "Chair of Central & Eastern Europe program, convening senior diplomats, SOUTHCOM officials, and private-sector decision-makers.",
        impact: "Organized 15+ high-level strategic dialogues"
      },
      {
        year: "2016-2021",
        title: "Co-founder, Amber Route Initiative",
        description: "Strategically aligned Central European industrial capacities with Latin American near-shoring hubs to serve U.S. markets.",
        impact: "Connected 50+ companies across 3 regions"
      }
    ]
  },
  contact: {
    title: "Strategic Consultation",
    subtitle: "Let's define your strategic challenges and craft decisive pathways forward",
    info: {
      email: "patrick@polrydiangroup.com",
      phone: "+1 (305) 555-0123",
      location: "Miami, Florida"
    },
    form: {
      title: "Request Consultation",
      subtitle: "Share your strategic challenges and objectives"
    }
  }
};

export default function ContentManager() {
  const { toast } = useToast();
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    // Load saved content from localStorage
    const savedContent = localStorage.getItem('website-content');
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent));
      } catch (error) {
        console.error('Failed to parse saved content:', error);
      }
    }
  }, []);

  const saveContent = () => {
    localStorage.setItem('website-content', JSON.stringify(content));
    // Trigger a custom event to notify components about content changes
    window.dispatchEvent(new CustomEvent('contentUpdated', { detail: content }));
    setHasChanges(false);
    toast({
      title: "Content Saved",
      description: "Your changes have been saved and applied to the website.",
    });
  };

  const resetContent = () => {
    setContent(defaultContent);
    localStorage.removeItem('website-content');
    window.dispatchEvent(new CustomEvent('contentUpdated', { detail: defaultContent }));
    setHasChanges(false);
    toast({
      title: "Content Reset",
      description: "All content has been reset to default values.",
    });
  };

  const exportContent = () => {
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'website-content.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importContent = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedContent = JSON.parse(e.target?.result as string);
          setContent(importedContent);
          setHasChanges(true);
          toast({
            title: "Content Imported",
            description: "Content has been imported successfully. Click Save to apply changes.",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Failed to parse the imported file. Please check the format.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const updateContent = (section: keyof WebsiteContent, path: string, value: any) => {
    setContent(prev => {
      const newContent = { ...prev };
      const keys = path.split('.');
      let current: any = newContent[section];
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      setHasChanges(true);
      return newContent;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Edit3 className="h-8 w-8 text-primary" />
              Content Manager
            </h1>
            <p className="text-muted-foreground mt-2">
              Edit and manage all website content from one central location
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="destructive" className="animate-pulse">
                Unsaved Changes
              </Badge>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportContent}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importContent}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetContent}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2"
              >
                <a href="/" target="_blank">
                  <Eye className="h-4 w-4" />
                  Preview
                </a>
              </Button>
              
              <Button
                onClick={saveContent}
                disabled={!hasChanges}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Content Editor */}
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="hero" className="gap-2">
              <Home className="h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <User className="h-4 w-4" />
              About
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-2">
              <FileText className="h-4 w-4" />
              Experience
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Main landing page content and messaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quote</Label>
                    <Textarea
                      value={content.hero.quote}
                      onChange={(e) => updateContent('hero', 'quote', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quote Author</Label>
                    <Input
                      value={content.hero.author}
                      onChange={(e) => updateContent('hero', 'author', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Main Title</Label>
                    <Input
                      value={content.hero.title}
                      onChange={(e) => updateContent('hero', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle (Name)</Label>
                    <Input
                      value={content.hero.subtitle}
                      onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={content.hero.description}
                    onChange={(e) => updateContent('hero', 'description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary CTA Button</Label>
                    <Input
                      value={content.hero.primaryCTA}
                      onChange={(e) => updateContent('hero', 'primaryCTA', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary CTA Button</Label>
                    <Input
                      value={content.hero.secondaryCTA}
                      onChange={(e) => updateContent('hero', 'secondaryCTA', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="font-semibold">Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Countries - Value</Label>
                    <Input
                      value={content.hero.metrics.countries.value}
                      onChange={(e) => updateContent('hero', 'metrics.countries.value', e.target.value)}
                    />
                    <Label>Countries - Label</Label>
                    <Input
                      value={content.hero.metrics.countries.label}
                      onChange={(e) => updateContent('hero', 'metrics.countries.label', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Projects - Value</Label>
                    <Input
                      value={content.hero.metrics.projects.value}
                      onChange={(e) => updateContent('hero', 'metrics.projects.value', e.target.value)}
                    />
                    <Label>Projects - Label</Label>
                    <Input
                      value={content.hero.metrics.projects.label}
                      onChange={(e) => updateContent('hero', 'metrics.projects.label', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Partnerships - Value</Label>
                    <Input
                      value={content.hero.metrics.partnerships.value}
                      onChange={(e) => updateContent('hero', 'metrics.partnerships.value', e.target.value)}
                    />
                    <Label>Partnerships - Label</Label>
                    <Input
                      value={content.hero.metrics.partnerships.label}
                      onChange={(e) => updateContent('hero', 'metrics.partnerships.label', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Personal background and philosophy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.about.title}
                      onChange={(e) => updateContent('about', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={content.about.subtitle}
                      onChange={(e) => updateContent('about', 'subtitle', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Introduction</Label>
                    <Textarea
                      value={content.about.intro}
                      onChange={(e) => updateContent('about', 'intro', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Philosophy</Label>
                    <Textarea
                      value={content.about.philosophy}
                      onChange={(e) => updateContent('about', 'philosophy', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Background</Label>
                    <Textarea
                      value={content.about.background}
                      onChange={(e) => updateContent('about', 'background', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Academic Background</Label>
                    <Textarea
                      value={content.about.academic}
                      onChange={(e) => updateContent('about', 'academic', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Key Distinctions</Label>
                    <Textarea
                      value={content.about.distinctions}
                      onChange={(e) => updateContent('about', 'distinctions', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Personal Disciplines</Label>
                    <Textarea
                      value={content.about.disciplines}
                      onChange={(e) => updateContent('about', 'disciplines', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Section */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Section</CardTitle>
                <CardDescription>Strategic services and offerings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.services.title}
                      onChange={(e) => updateContent('services', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={content.services.subtitle}
                      onChange={(e) => updateContent('services', 'subtitle', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="font-semibold">Service Offerings</h4>
                {content.services.services.map((service, index) => (
                  <Card key={index} className="border-muted">
                    <CardHeader>
                      <CardTitle className="text-lg">Service {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Service Title</Label>
                        <Input
                          value={service.title}
                          onChange={(e) => updateContent('services', `services.${index}.title`, e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={service.description}
                          onChange={(e) => updateContent('services', `services.${index}.description`, e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Features (one per line)</Label>
                        <Textarea
                          value={service.features.join('\n')}
                          onChange={(e) => updateContent('services', `services.${index}.features`, e.target.value.split('\n').filter(Boolean))}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experience Section */}
          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Experience Section</CardTitle>
                <CardDescription>Professional achievements and timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.experience.title}
                      onChange={(e) => updateContent('experience', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={content.experience.subtitle}
                      onChange={(e) => updateContent('experience', 'subtitle', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="font-semibold">Achievement Timeline</h4>
                {content.experience.achievements.map((achievement, index) => (
                  <Card key={index} className="border-muted">
                    <CardHeader>
                      <CardTitle className="text-lg">Achievement {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Year/Period</Label>
                          <Input
                            value={achievement.year}
                            onChange={(e) => updateContent('experience', `achievements.${index}.year`, e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Title/Position</Label>
                          <Input
                            value={achievement.title}
                            onChange={(e) => updateContent('experience', `achievements.${index}.title`, e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={achievement.description}
                          onChange={(e) => updateContent('experience', `achievements.${index}.description`, e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Impact/Results</Label>
                        <Input
                          value={achievement.impact}
                          onChange={(e) => updateContent('experience', `achievements.${index}.impact`, e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Section */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Section</CardTitle>
                <CardDescription>Contact information and form content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.contact.title}
                      onChange={(e) => updateContent('contact', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input
                      value={content.contact.subtitle}
                      onChange={(e) => updateContent('contact', 'subtitle', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="font-semibold">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      value={content.contact.info.email}
                      onChange={(e) => updateContent('contact', 'info.email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={content.contact.info.phone}
                      onChange={(e) => updateContent('contact', 'info.phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={content.contact.info.location}
                      onChange={(e) => updateContent('contact', 'info.location', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="font-semibold">Contact Form</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Form Title</Label>
                    <Input
                      value={content.contact.form.title}
                      onChange={(e) => updateContent('contact', 'form.title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Form Subtitle</Label>
                    <Input
                      value={content.contact.form.subtitle}
                      onChange={(e) => updateContent('contact', 'form.subtitle', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}