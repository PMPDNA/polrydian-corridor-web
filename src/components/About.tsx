import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useToast } from "@/hooks/use-toast";
import { MapPin, GraduationCap, Award, Users, Upload, Camera } from "lucide-react";

export const About = () => {
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { user, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();
  const highlights = [
    {
      icon: MapPin,
      title: "Global Reach",
      description: "60 countries across Africa, Asia, Europe, Latin America, and North America"
    },
    {
      icon: Award,
      title: "Commercial Real Estate",
      description: "Warehouses, schools, and international hotels - buyer and seller side representation"
    },
    {
      icon: Users,
      title: "Deal Mandates",
      description: "Working with my brother on commercial transactions ranging $20M-$500M"
    }
  ];

  const educationBadges = [
    "International Economic Relations - University of Gdańsk",
    "Erasmus Scholar - Amsterdam", 
    "Study Abroad - Kyungpook National University, South Korea",
    "Commercial Real Estate Professional"
  ];

  // Load existing profile photo on component mount
  useEffect(() => {
    loadProfilePhoto();
  }, []);

  const loadProfilePhoto = async () => {
    try {
      // Try to load Patrick's existing profile photo from profiles table
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .limit(1);

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (profiles && profiles.length > 0 && profiles[0].avatar_url) {
        setProfilePhoto(profiles[0].avatar_url);
      }
    } catch (error) {
      console.error('Error loading profile photo:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      // Upload to avatars bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `patrick-profile.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          display_name: 'Patrick Misiewicz'
        });

      if (updateError) throw updateError;

      setProfilePhoto(publicUrl);
      
      toast({
        title: "Photo Updated",
        description: "Profile photo has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            About Patrick Misiewicz
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Founder of Polrydian Group, specializing in corridor economics and strategic transformation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Professional Photo - Replace placeholder with welcome message */}
          <div className="lg:order-2">
            <div className="relative">
              <div className="w-full max-w-md mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 shadow-elegant">
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center overflow-hidden relative group">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Patrick Misiewicz" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-20 h-20 bg-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-accent">PM</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Welcome</h3>
                      <p className="text-sm text-muted-foreground mb-4">Patrick Misiewicz</p>
                      <p className="text-xs text-muted-foreground">Founder, Polrydian Group</p>
                      <p className="text-xs text-muted-foreground mt-2">Commercial Real Estate & Strategic Consulting</p>
                    </div>
                  )}
                   
                   {/* Admin photo upload functionality */}
                   {isAdmin && (
                     <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                       <label htmlFor="photo-upload" className="cursor-pointer">
                         <div className="text-center text-white">
                           <Camera className="h-8 w-8 mx-auto mb-2" />
                           <p className="text-sm font-medium">
                             {isUploading ? "Uploading..." : "Update Photo"}
                           </p>
                         </div>
                         <input
                           id="photo-upload"
                           type="file"
                           accept="image/*"
                           onChange={handleFileUpload}
                           disabled={isUploading}
                           className="hidden"
                         />
                       </label>
                     </div>
                   )}
                   
                   {/* Non-admin message */}
                   {!user && (
                     <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs p-2 rounded">
                       Admin login required for photo updates
                     </div>
                   )}
                </div>
              </div>
              
              {/* Quote overlay */}
              <div className="absolute -bottom-6 -right-6 bg-background border border-accent/20 rounded-lg p-4 shadow-elegant max-w-xs">
                <p className="text-sm italic text-muted-foreground">"What stands in the way becomes the way."</p>
                <cite className="text-xs text-accent">— Marcus Aurelius</cite>
              </div>
            </div>
          </div>

          {/* Main Bio */}
          <div className="space-y-6 lg:order-1">
            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Strategic Philosophy</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  My work centers on <strong>corridor economics</strong>—the disciplined practice of mapping and managing 
                  strategic flows of capital, technology, policy, and expertise across critical global regions, 
                  transforming obstacles into pathways toward resilience and sustainable growth.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  My professional worldview draws deeply from <strong>Stoicism</strong>, a philosophy emphasizing 
                  clear-sighted assessment, calm composure, and decisive action in the face of uncertainty.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Full Biography</h3>
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    I'm Patrick Oscar Misiewicz, founder of Polrydian Group, where my guiding principle is simple: transforming complexity and geopolitical friction into clear, actionable strategy. My work centers on what I call corridor economics—the disciplined practice of mapping and managing strategic flows of capital, technology, policy, and expertise across critical global regions, transforming obstacles into pathways toward resilience and sustainable growth.
                  </p>
                  <p>
                    My professional worldview draws deeply from Stoicism, a philosophy emphasizing clear-sighted assessment, calm composure, and decisive action in the face of uncertainty.
                  </p>
                  <p>
                    Born in Florida and raised in Bydgoszcz, Poland, my earliest experiences involved navigating diverse cultural and economic contexts, laying the foundation for my professional approach. Academic milestones—including a BA in International Economic Relations at the University of Gdańsk, an Erasmus scholarship in Amsterdam, and a competitive study-abroad scholarship at Kyungpook National University in Daegu, South Korea—provided me with rigorous analytical grounding. Later, pursuing a Master's in Logistics & Supply Chain Management and executive programs in International Business at Florida International University, combined with Public Policy studies at Georgetown University, significantly deepened my strategic toolkit. Yet, it was real-world exposure across 60 countries spanning Africa, Asia, Europe, Latin America, and North America that truly refined my perspective and skillset.
                  </p>
                  <p>
                    My professional trajectory consistently demonstrates the value of applying disciplined strategic clarity. My early career started out of passion, building Polish American community in Miami, from folk dances that were showcased at Miami Heat games, Independent Gallery Exhibition during Art Basel 2014 of Polish-Miami in collaboration with Elysse, Cervera and other developers in Edgewater, concerts of Polish A-rated artists, and many more that led me finally to my job as North American Business Development Manager at Source International Corp Inc., top custom software development firm with Fortune 500 clients where I was responsible for business development to IoT innovation with my first experience in industry 4.0 and through complex software deployments, gaining firsthand insight into how sophisticated supply chains operate in dynamic markets.
                  </p>
                  <p>
                    Around the same period (2014), Miami-Dade Aviation Director Emilio González approached me about facilitating direct air connectivity between Warsaw and Miami via LOT Polish Airlines. Leveraging careful negotiation and clear strategy, we established the early-stage discussions that set the foundation for the eventual route. From 2017 onward, shortly after Port Gdańsk signed its sister-port agreement with PortMiami, I advised Port of Gdańsk leadership on strategic diversification away from China-centric shipping, successfully mapping practical pathways for capturing Central European exports bound for the U.S. and Latin American markets.
                  </p>
                  <p>
                    From 2016 to 2021, I co-founded the Amber Route Initiative, strategically aligning Central European industrial capacities with Latin American and Central American near-shoring hubs to serve U.S. markets. Simultaneously, I co-led an impactful West African agritech and economic development initiative in Côte d'Ivoire, integrating local universities, policy-makers, private-sector partners, and guarantee funds into a robust economic mobility ecosystem.
                  </p>
                  <p>
                    Between 2024 and 2025, as Senior Adviser & Director of Infrastructure & M&A at Zab Capital Holdings, I structured complex, multi-regional projects spanning energy, transportation, and digital infrastructure across Africa, Europe, North America, and Latin America. In parallel, as Food-Security & Agritech expert, I represented Zab Capital and the World Affairs Council of Miami at Future Investment Initiative summits in Miami and Rio, presenting actionable frameworks that enabled Gulf Cooperation Council stakeholders to diversify and secure critical food supply chains—drawing upon successful ecosystem frameworks such as the agritech model developed by Genevieve Leveille in Haiti (2019), which onboarded over 3,500 smallholder farmers, increased Haiti's mango exports by 42%, and boosted individual farmer incomes by over 750%.
                  </p>
                  <p>
                    Effective strategic frameworks require rigorous validation against real-world contexts. Since 2022, as Board Director and Chair of the Central & Eastern Europe program at the World Affairs Council of Miami, I have convened senior diplomats, SOUTHCOM officials, economic development leaders, and private-sector decision-makers to translate global volatility into actionable local and international strategies. Key engagements have included leading strategic dialogues on Haiti's security crisis (2023), co-organizing the Concordia Americas Summit, and representing the Council at the 75th NATO Summit in Washington (2024). My prior civic engagement, including serving as Subcommitteeman for the Republican Executive Committee of Miami-Dade County (2016–2019) and participating in the Polish Ministry of Foreign Affairs Leadership Training Program (2016), deepened my understanding of the interplay between public policy, political realities, and strategic decision-making.
                  </p>
                  <p>
                    A central lesson of Stoicism is aligning private ambition with public good—something I've consistently aimed for in my humanitarian and cultural initiatives. Following Hurricane Matthew's devastating impact on Haiti in 2016, I coordinated the delivery of sixty emergency shipments—medical supplies, baby formula, and shelf-stable food—navigating complex logistical networks to ensure rapid distribution directly to affected communities. In Miami, my ongoing commitment to cultural diplomacy includes organizing Polish-American art exhibitions, folk performances, and community dialogues alongside the Polish Consulate, American Institute of Polish Culture, and the Miami Heat—building genuine trust and lasting relationships that anchor economic corridors in meaningful cultural exchange.
                  </p>
                  <p>
                    Beyond my professional and civic responsibilities, personal disciplines reinforce my strategic approach. Chess sharpens my pattern recognition, sailing strengthens my adaptive decision-making, and daily Stoic journaling helps maintain clarity and composure in volatility. Far from mere hobbies, these practices directly shape how I guide clients through complex global challenges.
                  </p>
                  <p className="font-medium text-foreground">
                    Let's clearly define your strategic challenges and craft the corridor that decisively moves your ambitions forward.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Education Badges */}
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Academic Foundation</h3>
              <div className="flex flex-wrap gap-2">
                {educationBadges.map((badge, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-1">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Commercial Real Estate & Strategic Focus</h3>
            <div className="grid gap-6">
              {highlights.map((item, index) => (
                <Card key={index} className="shadow-md hover:shadow-elegant transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <item.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Personal Disciplines */}
            <Card className="shadow-elegant bg-gradient-to-br from-accent/5 to-accent/10">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">Personal Disciplines</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  <strong>Chess</strong> sharpens my pattern recognition, <strong>sailing</strong> strengthens 
                  my adaptive decision-making, and <strong>daily Stoic journaling</strong> helps maintain 
                  clarity and composure in volatility.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Far from mere hobbies, these practices directly shape how I guide clients through 
                  complex global challenges.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};