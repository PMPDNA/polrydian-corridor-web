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
    if (user) {
      loadProfilePhoto();
    }
  }, [user]);

  const loadProfilePhoto = async () => {
    if (!user?.id) {
      console.log('No user ID available for profile photo loading');
      return;
    }
    
    try {
      console.log('Loading profile photo for user:', user.id);
      // Load profile photo for current admin user
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      console.log('Profile data received:', profiles);
      
      if (profiles?.avatar_url && profiles.avatar_url.trim() !== '') {
        console.log('Profile photo loaded:', profiles.avatar_url);
        setProfilePhoto(profiles.avatar_url);
      } else {
        console.log('No profile photo found for user');
        setProfilePhoto(''); // Clear any existing photo
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

      // Update the current user's profile with new avatar URL (upsert in case profile doesn't exist)
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl,
          display_name: 'Patrick Misiewicz'
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully with URL:', publicUrl);
      setProfilePhoto(publicUrl);
      
      // Force reload the profile photo
      setTimeout(() => {
        loadProfilePhoto();
      }, 500);
      
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
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Founder of Polrydian Group and Board Director at World Affairs Council of Miami. 
            Specializing in corridor economics—transforming geopolitical complexity into strategic opportunity across 60+ countries.
          </p>
          
          {/* Profile Picture directly under the heading */}
          <div className="flex justify-center mb-12">
            <div className="relative group">
              <div className="w-64 h-80 rounded-xl overflow-hidden shadow-lg">
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Patrick Misiewicz" 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: 'center 20%' }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-accent/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-xl font-bold text-accent">PM</span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Patrick Misiewicz</h3>
                      <p className="text-sm text-muted-foreground mb-2">Founder, Polrydian Group</p>
                      <p className="text-xs text-muted-foreground">Commercial Real Estate & Strategic Consulting</p>
                    </div>
                  </div>
                )}
                   
                {/* Admin photo upload functionality */}
                {isAdmin && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
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
              
              {/* Quote overlay */}
              <div className="absolute -bottom-4 -right-4 bg-background border border-accent/20 rounded-lg p-3 shadow-elegant max-w-xs">
                <p className="text-sm italic text-muted-foreground">"What stands in the way becomes the way."</p>
                <cite className="text-xs text-accent">— Marcus Aurelius</cite>
              </div>

              {/* Bio Popup - appears on hover */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-[800px] max-w-[90vw] bg-background border border-accent/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-6">
                <div className="max-h-[60vh] overflow-y-auto">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Strategic Philosophy & Full Biography</h3>
                  
                   <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Professional Overview</h4>
                      <p>Patrick Oscar Misiewicz is the founder of Polrydian Group, a strategic consulting firm specializing in corridor economics—the disciplined practice of mapping and managing strategic flows of capital, technology, policy, and expertise across critical global regions. His work transforms geopolitical complexity into clear, actionable strategy for governments, corporations, and development organizations.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Strategic Philosophy</h4>
                          <p>Patrick's approach centers on the principle that "what stands in the way becomes the way"—transforming obstacles and geopolitical friction into strategic pathways toward resilience and sustainable growth. This philosophy guides his work in developing economic corridors that create competitive advantages from complex global challenges.</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Academic Foundation</h4>
                          <p>BA in International Economic Relations from the University of Gdańsk, with Erasmus scholarship studies in Amsterdam and international experience at Kyungpook National University in South Korea. Advanced degrees include an MSc in Logistics & Supply Chain Management from Florida International University and Public Policy studies at Georgetown University.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground mb-2">Global Experience</h4>
                          <p>Direct operational experience across 60+ countries spanning Africa, Asia, Europe, Latin America, and North America. Key projects include the Amber Route Initiative for Central-Eastern European integration, West African agritech development in Côte d'Ivoire, and infrastructure development across multiple continents.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Current Leadership Roles</h4>
                          <p>Board Director and Chair of the Central & Eastern Europe program at the World Affairs Council of Miami. Senior Adviser & Director of Infrastructure & M&A at Zab Capital Holdings (2024-2025). Active in commercial real estate transactions ranging $20M-$500M, with expertise in warehouses, schools, and international hotel properties.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground mb-2">Commercial Real Estate Expertise</h4>
                          <p>Extensive experience in both buy-side and sell-side representation for commercial real estate transactions. Specializes in industrial warehouses, educational facilities, and hospitality properties across international markets, with a focus on infrastructure-enabled investment opportunities.</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground mb-2">Personal Disciplines</h4>
                          <p><strong>Chess</strong> develops strategic pattern recognition, <strong>sailing</strong> builds adaptive decision-making under uncertainty, and <strong>daily Stoic journaling</strong> maintains clarity and emotional regulation during volatile market conditions. These practices directly inform his strategic consulting methodology.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-accent/20">
                    <p className="text-center font-medium text-foreground">
                      "Let's clearly define your strategic challenges and craft the corridor that decisively moves your ambitions forward."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
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

          {/* Education Badges */}
          <div className="space-y-6">
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
        </div>
      </div>
    </section>
  );
};